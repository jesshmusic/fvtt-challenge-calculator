/**
 * Reads the CR-relevant numbers off a dnd5e (5.x / 6.x) NPC actor.
 *
 * Everything here works on either prepared documents (live Foundry, where
 * activities are Collections and attack activities already carry their base
 * weapon damage as a `base: true` part) or plain source-shaped objects (tests
 * and the offline evaluation harness).
 */

import { averageFormula, FormulaRollData } from './formula.js';

const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const PHYSICAL = ['bludgeoning', 'piercing', 'slashing'];
const DAMAGING_ACTIVITIES = new Set(['attack', 'save', 'damage']);
const NUMBER_WORDS: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  once: 1,
  two: 2,
  twice: 2,
  three: 3,
  thrice: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

export type ActivationKind = 'action' | 'bonus' | 'legendary' | 'reaction' | 'aura' | 'other';

/** One way a monster can deal damage: an item plus its best damaging activity. */
export interface DamageOption {
  itemId: string;
  itemName: string;
  activation: ActivationKind;
  /** Legendary action cost. */
  cost: number;
  /** Average damage of one use, assuming it hits / the target fails its save. */
  damage: number;
  kind: 'attack' | 'save' | 'damage';
  toHit: number | null;
  saveDC: number | null;
  /** Recharge, X/day, spell slot, or other limited use. */
  limited: boolean;
  /** Legendary option that "can't be taken again until the start of its next turn". */
  oncePerRound: boolean;
  /** For options that cast a spell: the cached spell item's id and name. */
  spellId?: string;
  spellName?: string;
}

export interface OffenseInputs {
  /** Average damage per round over the first three rounds (DMG method). */
  dpr: number;
  /** Attacks in the at-will routine (Multiattack count, or 1). */
  numAttacks: number;
  /** Best attack bonus among the attacks that make up the at-will routine. */
  attackBonus: number | null;
  /** Best save DC among the save effects that make up the at-will routine. */
  saveDC: number | null;
  /** Whether the at-will routine deals most of its damage through saves. */
  usesSaveDC: boolean;
  /** Names of the options that contributed damage. */
  sources: string[];
  /** Legendary actions per round. */
  legendaryActions: number;
  /** Per-round pieces of the DPR: at-will routine, best limited action, bonus, aura, legendary. */
  components: { routine: number; limited: number; bonus: number; aura: number; legendary: number };
  /** Every damaging option found on the actor. */
  options: DamageOption[];
}

export interface DefenseInputs {
  hp: number;
  ac: number;
  immunities: string[];
  resistances: string[];
  vulnerabilities: string[];
  magicResistance: boolean;
}

// ---------------------------------------------------------------------------
// Generic document helpers
// ---------------------------------------------------------------------------

/** Values of a Foundry Collection, Map, array or plain object. */
export function listOf<T = any>(raw: any): T[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.contents)) return raw.contents;
  if (typeof raw.values === 'function' && !(raw instanceof Set)) return Array.from(raw.values());
  if (raw instanceof Set) return Array.from(raw);
  if (typeof raw === 'object') return Object.values(raw);
  return [];
}

/** Members of a dnd5e Set/Array trait value. */
function setMembers(value: any): string[] {
  if (!value) return [];
  if (value instanceof Set || Array.isArray(value)) return Array.from(value).map(String);
  return [];
}

function toNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/\s+/g, ''));
  return Number.isFinite(n) ? n : null;
}

function itemId(item: any): string {
  return item?.id ?? item?._id ?? '';
}

function activityId(activity: any): string {
  return activity?.id ?? activity?._id ?? '';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function descriptionOf(item: any): string {
  const d = item?.system?.description;
  return typeof d === 'string' ? d : (d?.value ?? '');
}

export function abilityMods(actor: any): Record<string, number> {
  const mods: Record<string, number> = {};
  for (const key of ABILITIES) {
    const ability = actor?.system?.abilities?.[key];
    mods[key] =
      toNumber(ability?.mod) ?? (ability?.value != null ? Math.floor((ability.value - 10) / 2) : 0);
  }
  return mods;
}

export function proficiencyBonus(actor: any): number {
  const prof = toNumber(actor?.system?.attributes?.prof);
  if (prof !== null && prof > 0) return prof;
  const cr = toNumber(actor?.system?.details?.cr) ?? 0;
  return Math.max(2, Math.floor((Math.max(cr, 1) - 1) / 4) + 2);
}

// ---------------------------------------------------------------------------
// Defense
// ---------------------------------------------------------------------------

export function extractDefense(actor: any): DefenseInputs {
  const sys = actor?.system ?? {};
  const traits = sys.traits ?? {};
  const immunities = setMembers(traits.di?.value);
  const resistances = setMembers(traits.dr?.value);
  const vulnerabilities = setMembers(traits.dv?.value);
  const items = listOf(actor?.items);

  return {
    hp: toNumber(sys.attributes?.hp?.max) ?? 0,
    ac: toNumber(sys.attributes?.ac?.value) ?? toNumber(sys.attributes?.ac?.flat) ?? 10,
    immunities,
    resistances,
    vulnerabilities,
    magicResistance: items.some((i: any) => /^magic resistance\b/i.test(i?.name ?? '')),
  };
}

// ---------------------------------------------------------------------------
// Offense: per-activity damage
// ---------------------------------------------------------------------------

interface Ctx {
  actor: any;
  items: any[];
  mods: Record<string, number>;
  prof: number;
  spellAbility: string;
}

function makeCtx(actor: any): Ctx {
  const spellAbility = actor?.system?.attributes?.spellcasting || 'int';
  return {
    actor,
    items: listOf(actor?.items),
    mods: abilityMods(actor),
    prof: proficiencyBonus(actor),
    spellAbility,
  };
}

function hasProperty(item: any, prop: string): boolean {
  const props = item?.system?.properties;
  if (!props) return false;
  if (props instanceof Set || Array.isArray(props)) return Array.from(props).includes(prop);
  return !!props[prop];
}

/** Ability used by an attack activity, following dnd5e's AttackActivity#availableAbilities. */
function attackAbility(activity: any, item: any, ctx: Ctx): string | null {
  const explicit = activity?.attack?.ability;
  if (explicit && ABILITIES.includes(explicit)) return explicit;
  if (explicit === 'spellcasting') return ctx.spellAbility;
  if (explicit === 'none') return null;
  const classification = activity?.attack?.type?.classification;
  if (classification === 'spell' || item?.type === 'spell') return ctx.spellAbility;
  const weaponType = item?.system?.type?.value ?? '';
  if (item?.type === 'weapon' && (weaponType === 'natural' || hasProperty(item, 'fin'))) {
    return ctx.mods.dex > ctx.mods.str ? 'dex' : 'str';
  }
  const rangeType = activity?.attack?.type?.value || (/R$/.test(weaponType) ? 'ranged' : 'melee');
  return rangeType === 'ranged' ? 'dex' : 'str';
}

function saveAbility(activity: any, ctx: Ctx): string | null {
  const calc = activity?.save?.dc?.calculation;
  if (calc === 'spellcasting') return ctx.spellAbility;
  if (calc && ABILITIES.includes(calc)) return calc;
  return null;
}

/** Scaling steps for spell parts: cantrip tier, or levels above the spell's base level. */
function spellScaling(item: any, castLevel: number | null, ctx: Ctx): number {
  if (item?.type !== 'spell') return 0;
  const level = toNumber(item.system?.level) ?? 0;
  if (level === 0) {
    const sys = ctx.actor?.system ?? {};
    const cr = toNumber(sys.details?.cr) ?? 0;
    const casterLevel =
      item.system?.method === 'innate'
        ? cr
        : toNumber(sys.details?.level) ||
          toNumber(sys.attributes?.spell?.level) ||
          toNumber(sys.details?.spellLevel) ||
          cr;
    return Math.floor((casterLevel + 1) / 6);
  }
  return castLevel !== null && castLevel > level ? castLevel - level : 0;
}

function partAverage(part: any, increase: number, data: FormulaRollData): number {
  if (!part) return 0;
  const mode = part.scaling?.mode;
  const steps = mode === 'whole' ? increase : mode === 'half' ? Math.floor(increase / 2) : 0;
  let total: number;
  if (part.custom?.enabled) {
    total = averageFormula(part.custom.formula, data);
  } else if (
    !(part.number && part.denomination) &&
    typeof part.formula === 'string' &&
    !part.bonus
  ) {
    // Legacy damage.base.formula (pre-dnd5e 4 data).
    total = averageFormula(part.formula, data);
  } else {
    const number = (toNumber(part.number) ?? 0) + (toNumber(part.scaling?.number) ?? 1) * steps;
    const faces = toNumber(part.denomination) ?? 0;
    total = number > 0 && faces > 0 ? (number * (faces + 1)) / 2 : 0;
    total += averageFormula(part.bonus, data);
  }
  if (steps && part.scaling?.formula) total += averageFormula(part.scaling.formula, data) * steps;
  return total;
}

/** Average damage and to-hit/DC for one damaging activity. */
function evaluateActivity(
  activity: any,
  item: any,
  ctx: Ctx,
  castLevel: number | null = null,
): { damage: number; toHit: number | null; saveDC: number | null } {
  const type = activity?.type;
  const increase = spellScaling(item, castLevel, ctx);
  const itemLevel = castLevel ?? toNumber(item?.system?.level) ?? 0;
  const parts = listOf(activity?.damage?.parts);
  let damage = 0;
  let toHit: number | null = null;
  let saveDC: number | null = null;

  if (type === 'attack') {
    const ability = attackAbility(activity, item, ctx);
    const mod = ability ? ctx.mods[ability] : 0;
    const data: FormulaRollData = { mod, prof: ctx.prof, abilities: ctx.mods, itemLevel };
    const isWeapon = item?.type === 'weapon';
    const magical = isWeapon ? (toNumber(item.system?.magicalBonus) ?? 0) : 0;

    const baseDamage = (base: any): number => {
      if (!base) return 0;
      const avg = partAverage(base, 0, data);
      if (avg === 0) return 0;
      // dnd5e appends @mod to rolled weapon damage; legacy full formulas already carry it.
      const rolled = base.custom?.enabled
        ? /d/i.test(base.custom.formula ?? '')
        : !!(base.number && base.denomination);
      const hasMod = /@mod/.test(
        base.custom?.enabled ? (base.custom.formula ?? '') : (base.bonus ?? ''),
      );
      return avg + (isWeapon && rolled && !hasMod ? mod + magical : 0);
    };

    // Prepared attack activities already hold the base weapon damage as a `base` part;
    // source data does not, so add it from the item when `includeBase` is set.
    let hasBase = false;
    for (const part of parts) {
      if (part?.base) {
        hasBase = true;
        const versatile = hasProperty(item, 'ver') ? baseDamage(item.system?.damage?.versatile) : 0;
        damage += Math.max(baseDamage(part), versatile);
      } else {
        damage += partAverage(part, increase, data);
      }
    }
    if (!hasBase && activity?.damage?.includeBase && isWeapon) {
      const dmg = item.system?.damage;
      const versatile = hasProperty(item, 'ver') ? baseDamage(dmg?.versatile) : 0;
      damage += Math.max(baseDamage(dmg?.base), versatile);
    }

    const label = activity?.labels?.toHit ?? null;
    const parsed = label !== null ? toNumber(String(label).replace(/[^\d+-]/g, '')) : null;
    if (parsed !== null) toHit = parsed;
    else if (activity?.attack?.flat) toHit = averageFormula(activity.attack.bonus, data);
    else toHit = mod + ctx.prof + averageFormula(activity?.attack?.bonus, data) + magical;
  } else {
    const ability = type === 'save' ? saveAbility(activity, ctx) : null;
    const data: FormulaRollData = {
      mod: ability ? ctx.mods[ability] : 0,
      prof: ctx.prof,
      abilities: ctx.mods,
      itemLevel,
    };
    for (const part of parts) damage += partAverage(part, increase, data);

    if (type === 'save') {
      const dc = activity?.save?.dc ?? {};
      saveDC = toNumber(dc.value);
      if (saveDC === null) {
        if (dc.calculation === 'spellcasting') {
          saveDC =
            toNumber(ctx.actor?.system?.attributes?.spell?.dc) ??
            8 + ctx.prof + ctx.mods[ctx.spellAbility];
        } else if (dc.calculation && ABILITIES.includes(dc.calculation)) {
          saveDC = 8 + ctx.prof + ctx.mods[dc.calculation];
        } else {
          saveDC = toNumber(averageFormula(dc.formula, data)) || null;
        }
      }
    }
  }
  return { damage: Math.max(0, damage), toHit, saveDC };
}

function activationKind(activity: any, item: any): ActivationKind {
  const type = activity?.activation?.type || item?.system?.activation?.type || '';
  if (type === 'action' || type === 'bonus' || type === 'legendary' || type === 'reaction') {
    return type;
  }
  if (type === 'turnStart' || type === 'turnEnd') return 'aura';
  return 'other';
}

function hasLimitedUses(doc: any): boolean {
  const uses = doc?.uses ?? doc?.system?.uses;
  const max = toNumber(uses?.max);
  return max !== null && max > 0;
}

function consumesLimitedResource(activity: any): boolean {
  return listOf(activity?.consumption?.targets).some(
    (t: any) => t?.type === 'itemUses' || t?.type === 'activityUses' || t?.type === 'material',
  );
}

function cachedSpellFor(activity: any, item: any, ctx: Ctx): any | null {
  const key = `.Item.${itemId(item)}.Activity.${activityId(activity)}`;
  const byFlag = ctx.items.find(
    (i: any) => i?.type === 'spell' && (i.flags?.dnd5e?.cachedFor ?? '') === key,
  );
  if (byFlag) return byFlag;
  const uuid: string = activity?.spell?.uuid ?? '';
  if (!uuid) return null;
  return (
    ctx.items.find(
      (i: any) =>
        i?.type === 'spell' &&
        (i._stats?.compendiumSource === uuid || i.flags?.core?.sourceId === uuid),
    ) ?? null
  );
}

function isOncePerRound(item: any): boolean {
  return /can'?t (?:take|use) this (?:action|legendary action) again/i.test(
    stripHtml(descriptionOf(item)),
  );
}

/** Best damaging activity for an item, resolving `cast` activities to their spells. */
function optionsForItem(item: any, ctx: Ctx): DamageOption[] {
  // Spells cached for a cast activity are evaluated through that activity.
  if (item?.type === 'spell' && item.flags?.dnd5e?.cachedFor) return [];
  return allOptionsForItem(item, ctx);
}

/** Every damaging option of an item, one per damaging activity. */
function allOptionsForItem(item: any, ctx: Ctx): DamageOption[] {
  const options: DamageOption[] = [];
  const itemLimited =
    hasLimitedUses(item) ||
    (item?.type === 'spell' &&
      (toNumber(item.system?.level) ?? 0) > 0 &&
      !['atwill', 'innate'].includes(item.system?.method ?? item.system?.preparation?.mode ?? ''));

  for (const activity of listOf(item?.system?.activities ?? item?.activities)) {
    let evaluated: { damage: number; toHit: number | null; saveDC: number | null } | null = null;
    let kind: DamageOption['kind'] = 'damage';
    let spell: any = null;

    if (DAMAGING_ACTIVITIES.has(activity?.type)) {
      evaluated = evaluateActivity(activity, item, ctx);
      kind = activity.type;
    } else if (activity?.type === 'cast') {
      spell = cachedSpellFor(activity, item, ctx);
      if (!spell) continue;
      const castLevel = toNumber(activity.spell?.level);
      for (const spellActivity of listOf(spell.system?.activities ?? spell.activities)) {
        if (!DAMAGING_ACTIVITIES.has(spellActivity?.type)) continue;
        const e = evaluateActivity(spellActivity, spell, ctx, castLevel);
        if (!evaluated || e.damage > evaluated.damage) {
          evaluated = e;
          kind = spellActivity.type;
        }
      }
    }
    if (!evaluated || evaluated.damage <= 0) continue;

    const activation = activationKind(activity, item);
    options.push({
      itemId: itemId(item),
      itemName: item?.name ?? '',
      activation,
      cost: Math.max(1, toNumber(activity?.activation?.value) ?? 1),
      damage: evaluated.damage,
      kind,
      toHit: evaluated.toHit,
      saveDC: evaluated.saveDC,
      limited: itemLimited || hasLimitedUses(activity) || consumesLimitedResource(activity),
      oncePerRound: activation === 'legendary' && isOncePerRound(item),
      ...(spell ? { spellId: itemId(spell), spellName: spell.name ?? '' } : {}),
    });
  }

  // Legacy items without activities (pre-dnd5e 4 data).
  if (options.length === 0 && item?.type === 'weapon' && !item?.system?.activities) {
    const base = item.system?.damage?.base;
    const fakeActivity = { type: 'attack', damage: { includeBase: true, parts: [] }, attack: {} };
    const e = base ? evaluateActivity(fakeActivity, item, ctx) : null;
    if (e && e.damage > 0) {
      options.push({
        itemId: itemId(item),
        itemName: item.name ?? '',
        activation: 'action',
        cost: 1,
        damage: e.damage,
        kind: 'attack',
        toHit: e.toHit,
        saveDC: null,
        limited: false,
        oncePerRound: false,
      });
    }
  }

  return options;
}

/**
 * The best option per activation kind and limited/at-will. An item that offers
 * three or more distinct damaging effects on one action (a beholder's Eye Rays)
 * uses one of them per use, so it counts at their average rather than the max.
 * Spell lists are excluded: a caster picks its best spell.
 */
function bestPerSlot(options: DamageOption[]): DamageOption[] {
  const groups = new Map<string, DamageOption[]>();
  for (const option of options) {
    const key = `${option.activation}|${option.limited}|${option.spellId ? 'spell' : 'item'}`;
    groups.set(key, [...(groups.get(key) ?? []), option]);
  }
  const best = new Map<string, DamageOption>();
  for (const [key, group] of groups) {
    const top = bestOf(group)!;
    const pick =
      group.length >= 3 && !top.spellId
        ? { ...top, damage: group.reduce((s, o) => s + o.damage, 0) / group.length }
        : top;
    const slot = key.slice(0, key.lastIndexOf('|'));
    const current = best.get(slot);
    if (!current || pick.damage > current.damage) best.set(slot, pick);
  }
  return Array.from(best.values());
}

// ---------------------------------------------------------------------------
// Offense: Multiattack and legendary action text
// ---------------------------------------------------------------------------

interface Routine {
  damage: number;
  count: number;
  used: DamageOption[];
}

/**
 * Parse a Multiattack (or legendary action) description into the most damaging
 * routine it allows. Handles dnd5e enrichers (`[[/item Rend]]`, `[[/item .id]]`,
 * `@UUID[...]{Name}`), 2024 phrasing ("makes two Rend attacks", "makes three
 * attacks, using X or Y in any combination") and 2014 phrasing ("makes three
 * attacks: one with its bite and two with its claws").
 */
export function parseRoutine(
  html: string,
  ctx: { items: any[] },
  optionsByItem: Map<string, DamageOption>,
  bestAttack: DamageOption | null,
): Routine | null {
  if (!html) return null;
  const items = ctx.items;
  const byId = new Map<string, any>(items.map((i: any) => [itemId(i), i]));
  const tokens: string[] = [];
  const ref = (item: any) => {
    if (!item) return ' ';
    tokens.push(itemId(item));
    return ` §${tokens.length - 1}§ `;
  };
  const findByName = (name: string) => {
    const n = name.trim().toLowerCase();
    return items.find((i: any) => (i?.name ?? '').toLowerCase() === n) ?? null;
  };

  let text = html
    .replace(/\[\[lookup[^\]]*\]\]/gi, 'the creature')
    .replace(
      /\[\[\/item\s+([^\]]+)\]\](?:\{([^}]*)\})?/gi,
      (_m, target: string, label?: string) => {
        const t = target.trim();
        const idMatch = /^\.([A-Za-z0-9]+)/.exec(t);
        const item = idMatch ? byId.get(idMatch[1]) : findByName(t);
        return ref(item ?? (label ? findByName(label) : null));
      },
    )
    .replace(/@UUID\[[^\]]*\]\{([^}]*)\}/g, (_m, label: string) => ref(findByName(label)));
  text = stripHtml(text).toLowerCase();

  // Plain-text item names (2014 style and homebrew), longest first.
  const named = items
    .filter((i: any) => optionsByItem.has(itemId(i)) && (i?.name ?? '').length > 2)
    .sort((a: any, b: any) => b.name.length - a.name.length);
  for (const item of named) {
    const escaped = item.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`\\b${escaped}(?:e?s)?\\b`, 'g'), () => ref(item));
  }
  text = text.replace(/\s+/g, ' ');

  // "as many Bite attacks as it has heads": take the head count from the stat block.
  if (/as many .* as it has heads/.test(text)) {
    const heads = items
      .map((i: any) => /\b(\w+) heads\b/i.exec(stripHtml(descriptionOf(i)))?.[1]?.toLowerCase())
      .find((w: string | undefined) => w && NUMBER_WORDS[w]);
    if (heads)
      text = text.replace(/as many (§\d+§) attacks? as it has heads/, `${heads} $1 attacks`);
  }

  // Ignore "It can replace one attack with ..." sentences: substitutions, not extra damage.
  text = text.replace(/[^.]*\breplace[^.]*\./g, ' ');

  const countOf = (word: string | undefined): number | null => {
    if (!word) return null;
    if (/^\d+$/.test(word)) return parseInt(word, 10);
    return NUMBER_WORDS[word] ?? null;
  };
  const dmgOf = (token: string) => optionsByItem.get(tokens[parseInt(token, 10)]) ?? null;

  const evaluate = (clause: string): Routine => {
    const routine: Routine = { damage: 0, count: 0, used: [] };
    const add = (n: number, option: DamageOption | null) => {
      if (!option) return;
      routine.damage += n * option.damage;
      routine.count += option.kind === 'attack' ? n : 0;
      routine.used.push(option);
    };
    let rest = clause;

    // "makes three attacks, using X or Y in any combination"
    rest = rest.replace(
      /\b(\w+) (?:other )?attacks?,? using ((?:§\d+§|[^.§])*?) in any combination/g,
      (_m, word: string, group: string) => {
        const n = countOf(word) ?? 1;
        const options = Array.from(group.matchAll(/§(\d+)§/g))
          .map((m) => dmgOf(m[1]))
          .filter(Boolean) as DamageOption[];
        const best = options.sort((a, b) => b.damage - a.damage)[0] ?? bestAttack;
        add(n, best);
        return ' ';
      },
    );

    // "<count> X (or Y) attacks", "<count> with its X", "uses X", "uses X three times"
    const re =
      /(?:\b(\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|twice|thrice)\b(?: \w+){0,3}? )?§(\d+)§((?: (?:or|and\/or) §\d+§)*)(?: (\w+) times\b| (twice|thrice)\b)?/g;
    let matched = false;
    for (const m of rest.matchAll(re)) {
      matched = true;
      const n = countOf(m[4] ?? m[5]) ?? countOf(m[1]) ?? 1;
      const group = [m[2], ...Array.from((m[3] ?? '').matchAll(/§(\d+)§/g)).map((g) => g[1])];
      const options = group.map(dmgOf).filter(Boolean) as DamageOption[];
      add(n, options.sort((a, b) => b.damage - a.damage)[0] ?? null);
    }

    // "makes two attacks" / "makes two melee attacks" with no named attack.
    if (!matched) {
      const generic =
        /\bmakes (\d+|one|two|three|four|five|six|seven|eight|nine|ten) (?:\w+ )?attacks?/.exec(
          rest,
        );
      if (generic) add(countOf(generic[1]) ?? 1, bestAttack);
    }
    return routine;
  };

  // Top-level alternatives: "... , or it makes two Hurl Flame attacks."
  const alternatives = text.split(
    /,? or (?=it |makes |the creature |(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten) )|;/,
  );
  let best: Routine | null = null;
  for (const alt of alternatives) {
    const r = evaluate(alt);
    if (!best || r.damage > best.damage) best = r;
  }
  return best && best.damage > 0 ? best : null;
}

// ---------------------------------------------------------------------------
// Offense: putting it together
// ---------------------------------------------------------------------------

function bestOf(options: DamageOption[]): DamageOption | null {
  return options.reduce<DamageOption | null>((a, b) => (!a || b.damage > a.damage ? b : a), null);
}

/**
 * Three-round average for one action-economy slot (DMG: the most damaging options
 * over the first three rounds). Each limited option (recharge, X/day, a spell
 * slot) is spent once, best first, whenever it beats the at-will routine.
 */
function threeRoundAverage(atWill: number, limited: number[]): number {
  const best = [...limited].sort((a, b) => b - a);
  let total = 0;
  for (let round = 0; round < 3; round++) total += Math.max(atWill, best[round] ?? 0);
  return total / 3;
}

/** Best limited option per item or spell, most damaging first. */
function distinctLimited(options: DamageOption[]): DamageOption[] {
  const best = new Map<string, DamageOption>();
  for (const o of options) {
    if (!o.limited) continue;
    const key = o.spellId ?? o.itemId;
    const current = best.get(key);
    if (!current || o.damage > current.damage) best.set(key, o);
  }
  return Array.from(best.values()).sort((a, b) => b.damage - a.damage);
}

export function extractOffense(actor: any): OffenseInputs {
  const ctx = makeCtx(actor);
  const all: DamageOption[] = [];
  const everyOption: DamageOption[] = [];
  const optionsByItem = new Map<string, DamageOption>();
  for (const item of ctx.items) {
    const itemOptions = optionsForItem(item, ctx);
    const options = bestPerSlot(itemOptions);
    all.push(...options);
    everyOption.push(...itemOptions);
    // Multiattack and legendary text can name a spell ("uses Spellcasting to cast Fireball"):
    // register cast options under the spell, and only register the item itself when it
    // does not bundle several spells (a Spellcasting feat is not one attack).
    const castCount = listOf(item?.system?.activities ?? item?.activities).filter(
      (a: any) => a?.type === 'cast',
    ).length;
    for (const o of itemOptions) {
      if (!o.spellId) continue;
      const current = optionsByItem.get(o.spellId);
      if (!current || o.damage > current.damage) optionsByItem.set(o.spellId, o);
    }
    if (castCount > 1) continue;
    const ref = bestOf(options.filter((o) => o.activation !== 'legendary')) ?? bestOf(options);
    if (ref) optionsByItem.set(itemId(item), ref);
  }

  const actions = all.filter((o) => o.activation === 'action');
  const atWillActions = actions.filter((o) => !o.limited);
  const bestAttack = bestOf(atWillActions.filter((o) => o.kind === 'attack'));

  // At-will routine: Multiattack if it beats the best single action.
  const multiattackItem = ctx.items.find((i: any) => /^multiattack\b/i.test(i?.name ?? ''));
  const multi = multiattackItem
    ? parseRoutine(descriptionOf(multiattackItem), ctx, optionsByItem, bestAttack)
    : null;
  const single = bestOf(atWillActions);
  let routine: Routine = single
    ? { damage: single.damage, count: 1, used: [single] }
    : { damage: 0, count: 1, used: [] };
  if (multi && multi.damage >= routine.damage) routine = multi;

  const limitedActions = distinctLimited(
    everyOption.filter((o) => o.activation === 'action'),
  ).slice(0, 3);
  const limitedAction = limitedActions[0] ?? null;
  const actionDpr = threeRoundAverage(
    routine.damage,
    limitedActions.map((o) => o.damage),
  );

  // Bonus actions and start/end-of-turn damage add to every round.
  const bonus = all.filter((o) => o.activation === 'bonus');
  const bonusDpr = threeRoundAverage(
    bestOf(bonus.filter((o) => !o.limited))?.damage ?? 0,
    distinctLimited(everyOption.filter((o) => o.activation === 'bonus')).map((o) => o.damage),
  );
  const auraDpr = bestOf(all.filter((o) => o.activation === 'aura' && !o.limited))?.damage ?? 0;

  // Legendary actions: spend the per-round budget on the best damage per action.
  const sys = actor?.system ?? {};
  const legendaryActions = Math.max(
    0,
    toNumber(sys.resources?.legact?.max) ?? toNumber(sys.resources?.legact?.value) ?? 0,
  );
  const legendaryOptions: DamageOption[] = all.filter(
    (o) => o.activation === 'legendary' && !o.limited,
  );
  for (const item of ctx.items) {
    const acts = listOf(item?.system?.activities ?? item?.activities);
    const legendary = acts.some((a: any) => a?.activation?.type === 'legendary');
    if (!legendary || legendaryOptions.some((o) => o.itemId === itemId(item))) continue;
    const r = parseRoutine(descriptionOf(item), ctx, optionsByItem, null);
    if (!r) continue;
    const act = acts.find((a: any) => a?.activation?.type === 'legendary');
    legendaryOptions.push({
      itemId: itemId(item),
      itemName: item.name ?? '',
      activation: 'legendary',
      cost: Math.max(1, toNumber(act?.activation?.value) ?? 1),
      damage: r.damage,
      kind: r.used[0]?.kind ?? 'attack',
      toHit: r.used[0]?.toHit ?? null,
      saveDC: r.used[0]?.saveDC ?? null,
      limited: false,
      oncePerRound: isOncePerRound(item),
    });
  }
  let budget = legendaryActions;
  let legendaryDpr = 0;
  const byEfficiency = [...legendaryOptions].sort((a, b) => b.damage / b.cost - a.damage / a.cost);
  const legendaryUsed: DamageOption[] = [];
  for (const option of byEfficiency) {
    while (budget >= option.cost) {
      legendaryDpr += option.damage;
      budget -= option.cost;
      legendaryUsed.push(option);
      if (option.oncePerRound) break;
    }
  }

  const used = routine.used;
  const attackDamage = used.filter((o) => o.kind === 'attack').reduce((s, o) => s + o.damage, 0);
  const saveDamage = used.filter((o) => o.kind !== 'attack').reduce((s, o) => s + o.damage, 0);
  const toHits = used.map((o) => o.toHit).filter((v): v is number => v !== null);
  const dcs = [...used, ...(limitedAction ? [limitedAction] : [])]
    .map((o) => o.saveDC)
    .filter((v): v is number => v !== null);

  const sources = Array.from(
    new Set(
      [...used, ...(limitedAction ? [limitedAction] : []), ...legendaryUsed].map((o) => o.itemName),
    ),
  );

  return {
    dpr: actionDpr + bonusDpr + auraDpr + legendaryDpr,
    components: {
      routine: routine.damage,
      limited: limitedAction?.damage ?? 0,
      bonus: bonusDpr,
      aura: auraDpr,
      legendary: legendaryDpr,
    },
    options: all,
    numAttacks: Math.max(1, routine.count),
    attackBonus: toHits.length ? Math.max(...toHits) : null,
    saveDC: dcs.length ? Math.max(...dcs) : null,
    usesSaveDC: saveDamage > attackDamage,
    sources,
    legendaryActions,
  };
}

export { PHYSICAL };
