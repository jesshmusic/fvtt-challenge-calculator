#!/usr/bin/env node
/**
 * Builds tests/fixtures/srd-5.2-monsters.json.gz from the dnd5e system's SRD 5.2
 * creature compendium (packs/actors24, CC-BY-4.0), trimmed to the fields the CR
 * calculator reads. Prepared values that dnd5e would derive at runtime (AC from
 * armor, proficiency from CR, spell DC) are computed here.
 *
 *   node tools/build-srd-fixture.cjs "<Foundry Data>/systems/dnd5e/packs/actors24"
 *
 * Reading LevelDB needs `classic-level`; by default it is taken from the Foundry
 * app bundle (override with CLASSIC_LEVEL=/path/to/classic-level). Copy the pack
 * folder first if Foundry is running, since it holds the database lock.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CLASSIC_LEVEL =
  process.env.CLASSIC_LEVEL ||
  '/Applications/Foundry Virtual Tabletop.app/Contents/Resources/app/node_modules/classic-level';
const LADDER = [0, 0.125, 0.25, 0.5, ...Array.from({ length: 30 }, (_, i) => i + 1)];
const OUT = path.join(__dirname, '..', 'tests', 'fixtures', 'srd-5.2-monsters.json.gz');

async function readPack(dir) {
  const { ClassicLevel } = require(CLASSIC_LEVEL);
  const db = new ClassicLevel(dir, { valueEncoding: 'json' });
  const actors = {};
  const items = {};
  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('!actors!')) actors[value._id] = value;
    else if (key.startsWith('!actors.items!')) {
      const actorId = key.split('!')[2].split('.')[0];
      (items[actorId] ??= []).push(value);
    }
  }
  await db.close();
  return Object.values(actors).map((a) => ({ ...a, items: items[a._id] || [] }));
}

const strip = (s) => (s || '').replace(/<[^>]+>/g, ' ');
const dealsDamage = (a) =>
  ['attack', 'save', 'damage'].includes(a.type) &&
  ((a.damage?.parts || []).length > 0 || (a.type === 'attack' && a.damage?.includeBase));
const keepDescription = (it) =>
  /^multiattack/i.test(it.name) ||
  /\bheads\b/i.test(strip(it.system?.description?.value)) ||
  Object.values(it.system?.activities || {}).some((a) => a.activation?.type === 'legendary');
const relevant = (it) =>
  it.type === 'spell'
    ? Object.values(it.system?.activities || {}).some(dealsDamage)
    : /^(multiattack|magic resistance)/i.test(it.name) ||
      keepDescription(it) ||
      Object.values(it.system?.activities || {}).some((a) => dealsDamage(a) || a.type === 'cast');

function trimPart(p) {
  const o = {};
  if (p?.number) o.number = p.number;
  if (p?.denomination) o.denomination = p.denomination;
  if (p?.bonus) o.bonus = p.bonus;
  if (p?.custom?.enabled) o.custom = { enabled: true, formula: p.custom.formula };
  if (p?.scaling?.mode || p?.scaling?.formula) {
    o.scaling = {
      mode: p.scaling.mode ?? '',
      number: p.scaling.number ?? 1,
      formula: p.scaling.formula ?? '',
    };
  }
  return o;
}

function trimActivity(a) {
  const o = {
    type: a.type,
    activation: { type: a.activation?.type ?? '', value: a.activation?.value ?? null },
  };
  if (a.attack) {
    o.attack = {};
    if (a.attack.ability) o.attack.ability = a.attack.ability;
    if (a.attack.bonus) o.attack.bonus = a.attack.bonus;
    if (a.attack.flat) o.attack.flat = true;
    if (a.attack.type?.value || a.attack.type?.classification) {
      o.attack.type = {
        value: a.attack.type.value ?? '',
        classification: a.attack.type.classification ?? '',
      };
    }
  }
  if (a.damage)
    o.damage = { includeBase: !!a.damage.includeBase, parts: (a.damage.parts || []).map(trimPart) };
  if (a.save)
    o.save = {
      dc: { calculation: a.save.dc?.calculation ?? '', formula: a.save.dc?.formula ?? '' },
    };
  if (a.uses?.max) o.uses = { max: a.uses.max };
  const targets = (a.consumption?.targets || []).map((t) => ({ type: t.type, target: t.target }));
  if (targets.length) o.consumption = { targets };
  if (a.spell) o.spell = { level: a.spell.level ?? null };
  return o;
}

function trimItem(it) {
  const s = it.system || {};
  const sys = {};
  if (keepDescription(it)) sys.description = { value: s.description?.value ?? '' };
  if (s.type?.value) sys.type = { value: s.type.value };
  if (it.type === 'weapon' && s.properties?.length) {
    sys.properties = s.properties.filter((p) => ['fin', 'ver', 'mgc'].includes(p));
  }
  if (s.level !== undefined) sys.level = s.level;
  if (s.method) sys.method = s.method;
  if (s.uses?.max) sys.uses = { max: s.uses.max, recovery: s.uses.recovery };
  if (s.damage?.base) {
    sys.damage = { base: trimPart(s.damage.base) };
    if (s.damage.versatile?.denomination) sys.damage.versatile = trimPart(s.damage.versatile);
  }
  if (s.magicalBonus) sys.magicalBonus = s.magicalBonus;
  const keep = (a) => dealsDamage(a) || a.type === 'cast' || a.activation?.type === 'legendary';
  sys.activities = Object.fromEntries(
    Object.entries(s.activities || {})
      .filter(([, a]) => keep(a))
      .map(([id, a]) => [id, trimActivity(a)]),
  );
  const o = { _id: it._id, name: it.name, type: it.type, system: sys };
  if (it.flags?.dnd5e?.cachedFor) o.flags = { dnd5e: { cachedFor: it.flags.dnd5e.cachedFor } };
  return o;
}

/** AC the way dnd5e's "default" calculation derives it: armor + capped Dex + shield. */
function defaultAC(actor) {
  const dex = Math.floor(((actor.system.abilities.dex?.value ?? 10) - 10) / 2);
  const equipped = actor.items.filter(
    (i) => i.type === 'equipment' && i.system?.equipped && i.system?.armor?.value,
  );
  const armor = equipped.find((i) => ['light', 'medium', 'heavy'].includes(i.system.type?.value));
  const shield = equipped.find((i) => i.system.type?.value === 'shield');
  const cap = armor
    ? (armor.system.armor.dex ?? { light: Infinity, medium: 2, heavy: 0 }[armor.system.type.value])
    : Infinity;
  const body = armor
    ? armor.system.armor.value + (armor.system.armor.magicalBonus ?? 0) + Math.min(dex, cap)
    : 10 + dex;
  return body + (shield ? shield.system.armor.value : 0);
}

function toRow(a) {
  const cr = a.system.details?.cr;
  const ac = a.system.attributes.ac || {};
  const prof = Math.floor((Math.max(cr, 1) + 7) / 4);
  const spellAbility = a.system.attributes.spellcasting || '';
  const mod = (k) => Math.floor(((a.system.abilities[k]?.value ?? 10) - 10) / 2);
  const t = a.system.traits || {};
  return {
    name: a.name,
    pack: 'dnd5e.actors24',
    edition: '2024-SRD5.2',
    listedCR: cr,
    prepared: {
      hpMax: a.system.attributes.hp.max,
      ac: ac.calc === 'natural' || ac.calc === 'flat' ? ac.flat : defaultAC(a),
      prof,
      spellDC: spellAbility ? 8 + prof + mod(spellAbility) : undefined,
    },
    actor: {
      _id: a._id,
      name: a.name,
      type: 'npc',
      system: {
        abilities: Object.fromEntries(
          Object.entries(a.system.abilities).map(([k, v]) => [k, { value: v.value }]),
        ),
        attributes: {
          hp: { max: a.system.attributes.hp.max },
          ac: { calc: ac.calc, flat: ac.flat ?? null },
          spellcasting: spellAbility,
        },
        details: { cr },
        traits: {
          di: { value: t.di?.value || [] },
          dr: { value: t.dr?.value || [] },
          dv: { value: t.dv?.value || [] },
        },
        resources: {
          legact: { max: a.system.resources?.legact?.max ?? 0 },
          legres: { max: a.system.resources?.legres?.max ?? 0 },
        },
      },
      items: a.items.filter(relevant).map(trimItem),
    },
  };
}

(async () => {
  const dir = process.argv[2];
  if (!dir) throw new Error('usage: node tools/build-srd-fixture.cjs <dnd5e/packs/actors24>');
  const actors = await readPack(dir);
  const rows = actors
    .filter(
      (a) =>
        a.type === 'npc' && LADDER.includes(a.system.details?.cr) && a.system.attributes?.hp?.max,
    )
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(toRow);
  const fixture = {
    attribution:
      'This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, ' +
      'available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 ' +
      'International License, available at https://creativecommons.org/licenses/by/4.0/legalcode. Extracted from the ' +
      'dnd5e system compendium "actors24" and trimmed to the fields the CR calculator reads.',
    rows,
  };
  fs.writeFileSync(OUT, zlib.gzipSync(JSON.stringify(fixture), { level: 9 }));
  console.log(`${rows.length} creatures -> ${path.relative(process.cwd(), OUT)}`);
})();
