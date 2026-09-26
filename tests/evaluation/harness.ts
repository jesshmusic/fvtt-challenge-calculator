/**
 * Offline CR evaluation harness.
 *
 * Loads an exported dataset of NPCs (compendium source plus a few prepared
 * values), rebuilds actor-like objects that look like prepared dnd5e actors,
 * runs the calculator on them and reports accuracy against the listed CR.
 *
 * Dataset rows (JSON array):
 *   {
 *     name, pack, edition, listedCR,
 *     actor:    actor.toObject() with embedded items (source data),
 *     prepared: { hpMax, ac, prof, spellDC,
 *                 toHitByItemName?: { [itemName]: number },
 *                 activities?: { [activityId]: { toHit?: number, saveDC?: number } } }
 *   }
 *
 * `tools/export-cr-dataset.js` produces this format from inside Foundry.
 */

import * as fs from 'fs';

export interface DatasetRow {
  name: string;
  pack?: string;
  edition?: string;
  listedCR: number;
  actor: any;
  prepared: {
    hpMax: number;
    ac: number;
    prof: number;
    spellDC?: number;
    toHitByItemName?: Record<string, number>;
    activities?: Record<string, { toHit?: number; saveDC?: number }>;
  };
  legacy?: { calc: number; def: number; off: number };
}

export function loadDataset(path: string): DatasetRow[] {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

/** Adds the `formula` that DamageData exposes as a getter on prepared documents. */
function withFormula(part: any): any {
  if (!part || typeof part !== 'object') return part;
  const dice = part.number && part.denomination ? `${part.number}d${part.denomination}` : '';
  const auto = [dice, part.bonus].filter(Boolean).join(' + ');
  return { ...part, formula: part.custom?.enabled ? (part.custom.formula ?? '') : auto };
}

/** Minimal stand-in for foundry.utils.Collection (a Map iterated by value). */
class MockCollection<T> extends Map<string, T> {
  get contents(): T[] {
    return Array.from(super.values());
  }
  [Symbol.iterator](): any {
    return super.values();
  }
}

/**
 * Turn exported source data into an object shaped like a prepared dnd5e actor:
 * derived HP/AC/proficiency/spell DC, ability modifiers, attack labels, and the
 * base weapon damage part that AttackActivity#prepareFinalData prepends.
 * Activities become Collections, as on a live item.
 */
export function buildMockActor(row: DatasetRow): any {
  const src = clone(row.actor);
  const system = src.system ?? {};
  system.attributes ??= {};
  system.attributes.hp = { ...(system.attributes.hp ?? {}), max: row.prepared.hpMax };
  system.attributes.ac = { ...(system.attributes.ac ?? {}), value: row.prepared.ac };
  system.attributes.prof = row.prepared.prof;
  system.attributes.spell = { ...(system.attributes.spell ?? {}), dc: row.prepared.spellDC };
  for (const ability of Object.values<any>(system.abilities ?? {})) {
    ability.mod = Math.floor(((ability.value ?? 10) - 10) / 2);
  }
  for (const key of ['di', 'dr', 'dv']) {
    const trait = system.traits?.[key];
    if (trait) {
      trait.value = new Set(trait.value ?? []);
      trait.bypasses = new Set(trait.bypasses ?? []);
    }
  }

  const items = (src.items ?? []).map((item: any) => {
    item.id = item._id;
    if (Array.isArray(item.system?.properties))
      item.system.properties = new Set(item.system.properties);
    const isWeapon = item.type === 'weapon';
    if (item.system?.damage?.base) item.system.damage.base = withFormula(item.system.damage.base);
    if (item.system?.damage?.versatile) {
      item.system.damage.versatile = withFormula(item.system.damage.versatile);
    }
    const base = item.system?.damage?.base;
    const hasBase =
      base && (base.custom?.enabled ? !!base.custom.formula : base.number && base.denomination);
    const activities = new MockCollection<any>();
    for (const [id, activity] of Object.entries<any>(item.system?.activities ?? {})) {
      activities.set(id, activity);
      activity.id = id;
      activity.labels = {};
      if (activity.damage?.parts) activity.damage.parts = activity.damage.parts.map(withFormula);
      const pre = row.prepared.activities?.[id];
      if (activity.type === 'attack') {
        const toHit = pre?.toHit ?? row.prepared.toHitByItemName?.[item.name];
        if (toHit !== undefined) activity.labels.toHit = `${toHit >= 0 ? '+' : ''}${toHit}`;
        if (isWeapon && hasBase && activity.damage?.includeBase) {
          activity.damage.parts = [
            { ...clone(base), base: true },
            ...(activity.damage.parts ?? []),
          ];
        }
      }
      if (activity.type === 'save' && pre?.saveDC !== undefined) {
        activity.save ??= {};
        activity.save.dc = { ...(activity.save.dc ?? {}), value: pre.saveDC };
      }
    }
    if (item.system) item.system.activities = activities;
    return item;
  });

  return {
    id: src._id ?? row.name,
    name: row.name,
    type: 'npc',
    system,
    items,
    update: async () => undefined,
  };
}

export interface Metrics {
  n: number;
  exactPct: number;
  within1Pct: number;
  meanSigned: number;
  mae: number;
  off3Plus: number;
}

export function computeMetrics(pairs: Array<{ listed: number; calc: number }>): Metrics {
  const n = pairs.length;
  const errs = pairs.map((p) => p.calc - p.listed);
  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
  return {
    n,
    exactPct: (100 * errs.filter((e) => e === 0).length) / n,
    within1Pct: (100 * errs.filter((e) => Math.abs(e) <= 1).length) / n,
    meanSigned: sum(errs) / n,
    mae: sum(errs.map(Math.abs)) / n,
    off3Plus: errs.filter((e) => Math.abs(e) >= 3).length,
  };
}

export function formatMetrics(label: string, m: Metrics): string {
  return (
    `${label.padEnd(28)} n=${String(m.n).padEnd(4)} exact ${m.exactPct.toFixed(1).padStart(5)}%  ` +
    `within-1 ${m.within1Pct.toFixed(1).padStart(5)}%  mean ${m.meanSigned >= 0 ? '+' : ''}` +
    `${m.meanSigned.toFixed(2)}  MAE ${m.mae.toFixed(2)}  off-by-3+ ${Number.isInteger(m.off3Plus) ? m.off3Plus : m.off3Plus.toFixed(1)}`
  );
}
