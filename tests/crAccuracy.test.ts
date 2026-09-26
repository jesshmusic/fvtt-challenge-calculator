/**
 * Regression tests for the 2.6.0 CR accuracy work: bugs found in the
 * dnd5e 6 / Foundry v14 evaluation and the DMG-shaped math on the CR ladder.
 */
import { describe, expect, test } from '@jest/globals';
import { averageFormula } from '../src/services/formula';
import { extractDefense, extractOffense } from '../src/services/crExtraction';
import {
  averageCR,
  computeCR,
  crToIndex,
  CR_LADDER,
  defensiveIndex,
  effectiveHPMultiplier,
  indexToCR,
  snapCR,
} from '../src/services/crMath';
import { CR_BASELINES_2024 } from '../src/data/crBaselines';
import { CRCalculatorService } from '../src/services/CRCalculatorService';

// ---------------------------------------------------------------------------
// Builders for dnd5e 5.x/6.x-shaped documents
// ---------------------------------------------------------------------------

let nextId = 0;
const id = (prefix = 'id') => `${prefix}${++nextId}`;

/** Foundry-like Collection: a Map that iterates values and exposes `contents`. */
function collection(list: any[]): any {
  const map: any = new Map(list.map((a) => [a.id, a]));
  Object.defineProperty(map, 'contents', { get: () => Array.from(map.values()) });
  map[Symbol.iterator] = () => map.values();
  return map;
}

function part(number: number, denomination: number, bonus = '', extra: any = {}) {
  return {
    number,
    denomination,
    bonus,
    types: new Set(['slashing']),
    custom: { enabled: false },
    ...extra,
  };
}

function attack(
  opts: {
    parts?: any[];
    toHit?: number;
    activation?: string;
    includeBase?: boolean;
    ability?: string;
  } = {},
) {
  return {
    id: id('act'),
    type: 'attack',
    activation: { type: opts.activation ?? 'action', value: null },
    attack: {
      ability: opts.ability ?? '',
      bonus: '',
      flat: false,
      type: { value: 'melee', classification: 'weapon' },
    },
    damage: { includeBase: opts.includeBase ?? true, parts: opts.parts ?? [] },
    labels: opts.toHit === undefined ? {} : { toHit: `+${opts.toHit}` },
  };
}

function save(parts: any[], opts: { dc?: number; activation?: string; value?: number } = {}) {
  return {
    id: id('act'),
    type: 'save',
    activation: { type: opts.activation ?? 'action', value: opts.value ?? null },
    damage: { onSave: 'half', parts },
    save: { ability: new Set(['dex']), dc: { calculation: 'con', formula: '', value: opts.dc } },
  };
}

function item(name: string, type: string, system: any = {}, activities: any[] = []) {
  return {
    id: id('item'),
    name,
    type,
    flags: {},
    system: { ...system, activities: collection(activities) },
  };
}

/** A natural weapon whose base damage lives on the item (like the 2024 Monster Manual). */
function weapon(name: string, base: any, activities: any[], extra: any = {}) {
  return item(
    name,
    'weapon',
    { type: { value: 'natural' }, properties: new Set(), damage: { base }, ...extra },
    activities,
  );
}

function feat(name: string, description = '', activities: any[] = [], system: any = {}) {
  return item(name, 'feat', { description: { value: description }, ...system }, activities);
}

function npc(opts: {
  hp?: number;
  ac?: number;
  str?: number;
  dex?: number;
  prof?: number;
  items?: any[];
  di?: string[];
  dr?: string[];
  dv?: string[];
  legact?: number;
  cr?: number;
}) {
  const score = (mod: number) => ({ value: 10 + mod * 2, mod });
  return {
    name: 'Test NPC',
    type: 'npc',
    system: {
      abilities: {
        str: score(opts.str ?? 0),
        dex: score(opts.dex ?? 0),
        con: score(2),
        int: score(0),
        wis: score(0),
        cha: score(0),
      },
      attributes: {
        hp: { value: opts.hp ?? 30, max: opts.hp ?? 30 },
        ac: { value: opts.ac ?? 13 },
        prof: opts.prof ?? 2,
        spellcasting: '',
        spell: {},
      },
      details: { cr: opts.cr ?? 1 },
      traits: {
        di: { value: new Set(opts.di ?? []), bypasses: new Set() },
        dr: { value: new Set(opts.dr ?? []), bypasses: new Set() },
        dv: { value: new Set(opts.dv ?? []) },
      },
      resources: { legact: { max: opts.legact ?? 0 }, legres: { max: 0 } },
    },
    items: opts.items ?? [],
    update: async () => undefined,
  };
}

// ---------------------------------------------------------------------------

describe('averageFormula', () => {
  test.each([
    ['2d6 + 3', {}, 10],
    ['1d8 + @mod', { mod: 4 }, 8.5],
    ['(@item.level - 3)d10', { itemLevel: 5 }, 11],
    ['3d6[fire] + 2', {}, 12.5],
    ['floor(@prof / 2)d6', { prof: 4 }, 7],
    ['d8', {}, 4.5],
    ['1d10 + @abilities.str.mod', { abilities: { str: 3 } }, 8.5],
    ['', {}, 0],
    ['2d6 +', {}, 7],
  ])('%s', (formula, data, expected) => {
    expect(averageFormula(formula, data)).toBeCloseTo(expected);
  });

  test('returns 0 instead of throwing on garbage', () => {
    expect(averageFormula('this is not a formula', {})).toBe(0);
  });
});

describe('attack bonus (v2.5.1 reported +71/+75 for Acererak/Valindra)', () => {
  test('flat damage bonuses are never added to the attack bonus', () => {
    // v2.5.1 added every damage part's flat modifier to the running attack bonus.
    const items = Array.from({ length: 10 }, (_, i) =>
      weapon(`Strike ${i}`, part(2, 6, '5'), [attack({ toHit: 12, parts: [part(1, 6, '5')] })]),
    );
    const off = extractOffense(npc({ str: 5, prof: 7, items }));
    expect(off.attackBonus).toBe(12);
  });

  test('uses the prepared to-hit label, falling back to ability mod + proficiency', () => {
    const labelled = extractOffense(
      npc({ str: 3, items: [weapon('Claw', part(1, 6), [attack({ toHit: 9 })])] }),
    );
    expect(labelled.attackBonus).toBe(9);
    const computed = extractOffense(
      npc({ str: 3, prof: 3, items: [weapon('Claw', part(1, 6), [attack()])] }),
    );
    expect(computed.attackBonus).toBe(6);
  });
});

describe('damage parsing on dnd5e 6 activities', () => {
  test('prepared base damage part is counted once (v2.5.1 added damage.base again)', () => {
    const base = part(1, 10);
    const rend = weapon('Rend', base, [attack({ parts: [{ ...base, base: true }, part(2, 4)] })]);
    const off = extractOffense(npc({ str: 8, items: [rend] }));
    // 1d10 + 8 (Str) + 2d4 fire
    expect(off.dpr).toBeCloseTo(5.5 + 8 + 5);
  });

  test('source data adds base damage and ability modifier when includeBase is set', () => {
    const rend = weapon('Rend', part(1, 10), [attack({ parts: [part(2, 4)] })]);
    expect(extractOffense(npc({ str: 8, items: [rend] })).dpr).toBeCloseTo(18.5);
  });

  test('flat base damage does not get the ability modifier', () => {
    const bite = weapon(
      'Bite',
      { number: null, denomination: null, bonus: '1', custom: { enabled: false } },
      [attack()],
    );
    expect(extractOffense(npc({ dex: 3, items: [bite] })).dpr).toBe(1);
  });

  test('reads plain-object activities (v2.5.1 skipped them)', () => {
    const w = weapon('Slam', part(2, 6), []);
    const a = attack();
    w.system.activities = { [a.id]: a };
    expect(extractOffense(npc({ str: 3, items: [w] })).dpr).toBeCloseTo(10);
  });

  test('finesse and natural weapons use the better of Str and Dex', () => {
    const w = weapon('Rapier', part(1, 8), [attack()], {
      type: { value: 'martialM' },
      properties: new Set(['fin']),
    });
    expect(extractOffense(npc({ str: 0, dex: 4, items: [w] })).dpr).toBeCloseTo(8.5);
  });

  test('an item offering three or more distinct damaging effects counts at their average', () => {
    const rays = feat('Eye Rays', '', [
      save([part(2, 8)]),
      save([part(4, 8)]),
      save([part(10, 10)]),
    ]);
    expect(extractOffense(npc({ items: [rays] })).dpr).toBeCloseTo((9 + 18 + 55) / 3);
  });

  test('cast activities resolve to the cached spell, including upcasting', () => {
    const spellcasting = feat('Spellcasting', '', []);
    const cast = {
      id: id('act'),
      type: 'cast',
      activation: { type: 'action', value: null },
      uses: { max: 1 },
      spell: { level: 5 },
    };
    spellcasting.system.activities = collection([cast]);
    const fireball = item('Fireball', 'spell', { level: 3 }, [
      save([part(8, 6, '', { scaling: { mode: 'whole', number: 1 } })]),
    ]);
    fireball.flags = { dnd5e: { cachedFor: `.Item.${spellcasting.id}.Activity.${cast.id}` } };
    const off = extractOffense(npc({ items: [spellcasting, fireball] }));
    const option = off.options.find((o) => o.spellName === 'Fireball')!;
    expect(option.damage).toBeCloseTo(35); // 10d6 at level 5
    expect(option.limited).toBe(true);
  });
});

describe('Multiattack parsing', () => {
  const claw = () => weapon('Claw', part(1, 6), [attack()]); // 3.5 + 2 = 5.5
  const bite = () => weapon('Bite', part(1, 10), [attack()]); // 5.5 + 2 = 7.5

  test('2024 enricher by id: "makes three [[/item .id]] attacks"', () => {
    const c = claw();
    const multi = feat(
      'Multiattack',
      `<p>The [[lookup @name lowercase]] makes three [[/item .${c.id}]] attacks.</p>`,
    );
    const off = extractOffense(npc({ str: 2, items: [multi, c] }));
    expect(off.numAttacks).toBe(3);
    expect(off.dpr).toBeCloseTo(16.5);
  });

  test('"one Bite attack and two Claw attacks"', () => {
    const multi = feat(
      'Multiattack',
      'The creature makes one [[/item Bite]] attack and two [[/item Claw]] attacks.',
    );
    const off = extractOffense(npc({ str: 2, items: [multi, bite(), claw()] }));
    expect(off.numAttacks).toBe(3);
    expect(off.dpr).toBeCloseTo(7.5 + 11);
  });

  test('"three attacks, using X or Y in any combination" takes the best', () => {
    const b = bite();
    const c = claw();
    const multi = feat(
      'Multiattack',
      `The creature makes three attacks, using [[/item .${c.id}]] or [[/item .${b.id}]] in any combination.`,
    );
    expect(extractOffense(npc({ str: 2, items: [multi, b, c] })).dpr).toBeCloseTo(22.5);
  });

  test('alternatives in plain text: "three Claw attacks or two Bite attacks"', () => {
    const multi = feat('Multiattack', 'The creature makes three Claw attacks or two Bite attacks.');
    const off = extractOffense(npc({ str: 2, items: [multi, bite(), claw()] }));
    expect(off.dpr).toBeCloseTo(16.5);
    expect(off.numAttacks).toBe(3);
  });

  test('2014 phrasing: "one with its bite and two with its claws"', () => {
    const multi = feat(
      'Multiattack',
      'The creature makes three attacks: one with its bite and two with its claws.',
    );
    expect(extractOffense(npc({ str: 2, items: [multi, bite(), claw()] })).dpr).toBeCloseTo(18.5);
  });

  test('"uses X three times"', () => {
    const rays = feat('Eye Ray', '', [save([part(4, 8)])]);
    const multi = feat('Multiattack', `The creature uses [[/item .${rays.id}]] three times.`);
    expect(extractOffense(npc({ items: [multi, rays] })).dpr).toBeCloseTo(54);
  });

  test('digits inside UUIDs are not attack counts (v2.5.1 read 8 attacks off a mummy)', () => {
    const fist = weapon('Rotting Fist', part(2, 6), [attack()]);
    const multi = feat(
      'Multiattack',
      '<p>The mummy uses @UUID[Compendium.dnd5e.monsters.Item.x9Q8zz]{Dreadful Glare} and makes one [[/item Rotting Fist]] attack.</p>',
    );
    const off = extractOffense(npc({ str: 3, items: [multi, fist] }));
    expect(off.numAttacks).toBe(1);
    expect(off.dpr).toBeCloseTo(10);
  });

  test('"It can replace one attack with ..." adds nothing', () => {
    const c = claw();
    const multi = feat(
      'Multiattack',
      `Makes two [[/item .${c.id}]] attacks. It can replace one attack with a use of Fire Breath.`,
    );
    expect(extractOffense(npc({ str: 2, items: [multi, c] })).dpr).toBeCloseTo(11);
  });
});

describe('three-round damage (DMG)', () => {
  test('a recharge ability is used once, then the at-will routine', () => {
    const c = weapon('Claw', part(2, 6), [attack()]); // 7 + 3 = 10
    const breath = feat('Fire Breath', '', [save([part(10, 6)])], {
      uses: { max: 1, recovery: [{ period: 'recharge' }] },
    });
    const off = extractOffense(npc({ str: 3, items: [c, breath] }));
    expect(off.dpr).toBeCloseTo((35 + 10 + 10) / 3);
  });

  test('legendary actions spend the budget, honouring once-per-round options', () => {
    const rend = weapon('Rend', part(1, 10), [attack()]); // 5.5 + 4 = 9.5
    const pounce = feat('Pounce', `The dragon makes one [[/item .${rend.id}]] attack.`, [
      { id: id('act'), type: 'utility', activation: { type: 'legendary', value: 1 } },
    ]);
    const blast = feat(
      'Blast',
      "The dragon can't take this action again until the start of its next turn.",
      [save([part(6, 6)], { activation: 'legendary', value: 1 })],
    );
    const off = extractOffense(npc({ str: 4, legact: 3, items: [rend, pounce, blast] }));
    expect(off.components.legendary).toBeCloseTo(21 + 9.5 + 9.5);
    expect(off.legendaryActions).toBe(3);
  });
});

describe('CR ladder math', () => {
  test('ladder helpers handle fractional CRs', () => {
    expect(CR_LADDER.slice(0, 5)).toEqual([0, 0.125, 0.25, 0.5, 1]);
    expect(crToIndex(0.25)).toBe(2);
    expect(indexToCR(-3)).toBe(0);
    expect(indexToCR(40)).toBe(30);
    expect(snapCR(0.3)).toBe(0.25);
    expect(averageCR(crToIndex(0.125), crToIndex(0.5))).toBe(0.25);
    expect(averageCR(crToIndex(0), crToIndex(2))).toBe(1);
  });

  test('AC adjustments step along the ladder: 1/4 + one step = 1/2', () => {
    const def = extractDefense(npc({ hp: 13, ac: 12.3 + 4 }));
    const result = defensiveIndex(def, CR_BASELINES_2024, null);
    expect(result.index).toBeCloseTo(crToIndex(0.5));
  });

  test('defensive CR is never negative (v2.5.1: Aarakocra def -0.375)', () => {
    const result = CRCalculatorService.evaluate(
      npc({ hp: 5, ac: 8, items: [weapon('Talon', part(1, 4), [attack()])] }),
    );
    expect(result.defensiveCR).toBe(0);
    expect(result.calculatedCR).toBeGreaterThanOrEqual(0);
    expect(CR_LADDER).toContain(result.calculatedCR);
  });

  test('effective HP uses the DMG multipliers for physical resistance only', () => {
    const physical = extractDefense(npc({ dr: ['bludgeoning', 'piercing', 'slashing'] }));
    expect(effectiveHPMultiplier(physical, 3).multiplier).toBe(2);
    expect(effectiveHPMultiplier(physical, 8).multiplier).toBe(1.5);
    expect(effectiveHPMultiplier(physical, 20).multiplier).toBe(1);
    const immune = extractDefense(npc({ di: ['slashing'] }));
    expect(effectiveHPMultiplier(immune, 20).multiplier).toBe(1.25);
    const fire = extractDefense(npc({ dr: ['fire', 'cold', 'lightning'] }));
    expect(effectiveHPMultiplier(fire, 3).multiplier).toBe(1);
  });

  test('extra feats and vulnerabilities no longer move the CR', () => {
    const base = () => [weapon('Slam', part(2, 6), [attack()])];
    const plain = CRCalculatorService.evaluate(npc({ hp: 60, ac: 14, str: 3, items: base() }));
    const feats = Array.from({ length: 12 }, (_, i) => feat(`Trait ${i}`));
    const busy = CRCalculatorService.evaluate(
      npc({ hp: 60, ac: 14, str: 3, items: [...base(), ...feats] }),
    );
    const vulnerable = CRCalculatorService.evaluate(
      npc({ hp: 60, ac: 14, str: 3, dv: ['fire'], items: base() }),
    );
    expect(busy.calculatedCR).toBe(plain.calculatedCR);
    expect(vulnerable.calculatedCR).toBe(plain.calculatedCR);
  });

  test('a 2024 Goblin Warrior comes out at CR 1/4', () => {
    const scimitar = weapon('Scimitar', part(1, 6), [attack({ toHit: 4 })], {
      type: { value: 'martialM' },
      properties: new Set(['fin']),
    });
    const result = computeCR(
      extractDefense(npc({ hp: 10, ac: 15, dex: 2 })),
      extractOffense(npc({ dex: 2, items: [scimitar] })),
      CR_BASELINES_2024,
    );
    expect(result.cr).toBe(0.25);
  });
});
