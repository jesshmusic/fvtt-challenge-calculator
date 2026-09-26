/**
 * CR math: the DMG "Creating a Monster" procedure on the CR ladder.
 *
 *   defensive CR  = CR whose expected HP matches the effective HP,
 *                   adjusted by 1 CR per 4 points of effective AC above/below expected
 *   offensive CR  = CR whose expected DPR matches the three-round DPR,
 *                   adjusted by 1 CR per 4 points of attack bonus (or save DC) above/below expected
 *   CR            = average of the two, rounded to the nearest CR
 *
 * All arithmetic happens on ladder indices (0, 1/8, 1/4, 1/2, 1, 2, ..., 30 ->
 * 0..33), so an adjustment of one step moves 1/8 -> 1/4 rather than 1/8 -> 1 1/8,
 * and nothing can go below CR 0.
 */

import type { DefenseInputs, OffenseInputs } from './crExtraction.js';
import { PHYSICAL } from './crExtraction.js';

export const CR_LADDER: number[] = [
  0,
  0.125,
  0.25,
  0.5,
  ...Array.from({ length: 30 }, (_, i) => i + 1),
];
export const MAX_CR_INDEX = CR_LADDER.length - 1;

/** Expected (median) stats of a monster at one CR. */
export interface CRBaseline {
  cr: number;
  /** Effective hit points (see effectiveHPMultiplier). */
  hp: number;
  /** Effective armor class (AC + 2 for Magic Resistance). */
  ac: number;
  attackBonus: number;
  saveDC: number;
  /** Three-round average damage per round. */
  dpr: number;
}

/** Points of AC, attack bonus or save DC that are worth one CR step. */
export const POINTS_PER_CR_STEP = 4;
/** Magic Resistance counts as +2 AC (DMG, Monster Features). */
export const MAGIC_RESISTANCE_AC = 2;

/**
 * DMG "Effective Hit Points Based on Resistances and Immunities", applied when the
 * monster resists or is immune to bludgeoning, piercing or slashing damage.
 * Rows: [highest CR in band, resistance multiplier, immunity multiplier].
 */
export const EFFECTIVE_HP_MULTIPLIERS: Array<[number, number, number]> = [
  [4, 2, 2],
  [10, 1.5, 2],
  [16, 1.25, 1.5],
  [Infinity, 1, 1.25],
];

export function crToIndex(cr: number): number {
  let best = 0;
  for (let i = 0; i < CR_LADDER.length; i++) {
    if (Math.abs(CR_LADDER[i] - cr) < Math.abs(CR_LADDER[best] - cr)) best = i;
  }
  return best;
}

export function clampIndex(index: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(MAX_CR_INDEX, index));
}

/** Nearest CR on the ladder for a (fractional) index; clamps to 0..30. */
export function indexToCR(index: number): number {
  return CR_LADDER[Math.round(clampIndex(index))];
}

/** Numeric CR value at a fractional ladder index (index 2.5 -> 0.375). */
export function indexToValue(index: number): number {
  return interpolate(CR_LADDER, index);
}

/** Nearest CR on the ladder to a numeric value (ties go up). */
export function snapCR(value: number): number {
  let best = CR_LADDER[0];
  for (const cr of CR_LADDER) if (Math.abs(cr - value) <= Math.abs(best - value)) best = cr;
  return best;
}

/** DMG step 3: the final CR is the average of the defensive and offensive CRs. */
export function averageCR(defIndex: number, offIndex: number): number {
  return snapCR((indexToValue(clampIndex(defIndex)) + indexToValue(clampIndex(offIndex))) / 2);
}

/** Value of a per-index table at a fractional index (linear interpolation). */
export function interpolate(table: number[], index: number): number {
  const x = clampIndex(index);
  const i = Math.floor(x);
  if (i >= table.length - 1) return table[table.length - 1];
  return table[i] + (table[i + 1] - table[i]) * (x - i);
}

/**
 * Fractional index at which a non-decreasing table reaches `value`. Values
 * below the first entry map to 0; values past the last entry extrapolate
 * along the final segment.
 */
export function invert(table: number[], value: number): number {
  const n = table.length;
  if (!(value > table[0])) return 0;
  for (let j = 0; j < n - 1; j++) {
    if (value < table[j + 1]) {
      const span = table[j + 1] - table[j];
      return span > 0 ? j + (value - table[j]) / span : j;
    }
  }
  const slope = table[n - 1] - table[n - 2];
  return slope > 0 ? n - 1 + (value - table[n - 1]) / slope : n - 1;
}

export interface EffectiveHP {
  multiplier: number;
  reason: 'immune' | 'resistant' | null;
}

/** DMG effective-HP multiplier for physical resistances/immunities at the given CR. */
export function effectiveHPMultiplier(def: DefenseInputs, cr: number): EffectiveHP {
  const row = EFFECTIVE_HP_MULTIPLIERS.find(([max]) => cr <= max)!;
  if (def.immunities.some((t) => PHYSICAL.includes(t))) {
    return { multiplier: row[2], reason: 'immune' };
  }
  if (def.resistances.some((t) => PHYSICAL.includes(t))) {
    return { multiplier: row[1], reason: 'resistant' };
  }
  return { multiplier: 1, reason: null };
}

export function effectiveAC(def: DefenseInputs): number {
  return def.ac + (def.magicResistance ? MAGIC_RESISTANCE_AC : 0);
}

function column(baselines: CRBaseline[], key: keyof CRBaseline): number[] {
  return baselines.map((b) => b[key]);
}

export interface OffensiveResult {
  index: number;
  dprIndex: number;
  /** Attack bonus or save DC minus the expected value at dprIndex. */
  difference: number;
}

export function offensiveIndex(off: OffenseInputs, baselines: CRBaseline[]): OffensiveResult {
  const dprIndex = invert(column(baselines, 'dpr'), off.dpr);
  let difference = 0;
  if (off.usesSaveDC && off.saveDC !== null) {
    difference = off.saveDC - interpolate(column(baselines, 'saveDC'), dprIndex);
  } else if (off.attackBonus !== null) {
    difference = off.attackBonus - interpolate(column(baselines, 'attackBonus'), dprIndex);
  } else if (off.saveDC !== null) {
    difference = off.saveDC - interpolate(column(baselines, 'saveDC'), dprIndex);
  }
  if (off.dpr <= 0) difference = Math.min(0, difference);
  return { index: dprIndex + difference / POINTS_PER_CR_STEP, dprIndex, difference };
}

export interface DefensiveResult {
  index: number;
  hpIndex: number;
  effectiveHP: number;
  effectiveAC: number;
  hpMultiplier: EffectiveHP;
}

export function defensiveIndex(
  def: DefenseInputs,
  baselines: CRBaseline[],
  crEstimate: number | null,
): DefensiveResult {
  const hpMultiplier =
    crEstimate === null ? { multiplier: 1, reason: null } : effectiveHPMultiplier(def, crEstimate);
  const effectiveHP = def.hp * hpMultiplier.multiplier;
  const ac = effectiveAC(def);
  const hpIndex = invert(column(baselines, 'hp'), effectiveHP);
  const acDifference = ac - interpolate(column(baselines, 'ac'), hpIndex);
  return {
    index: def.hp > 0 ? hpIndex + acDifference / POINTS_PER_CR_STEP : 0,
    hpIndex,
    effectiveHP,
    effectiveAC: ac,
    hpMultiplier,
  };
}

export interface CRComputation {
  cr: number;
  defensive: DefensiveResult;
  offensive: OffensiveResult;
  /** Defensive and offensive indices clamped to the ladder (0..33). */
  defensiveIndex: number;
  offensiveIndex: number;
  defensiveCR: number;
  offensiveCR: number;
}

/**
 * Combine defense and offense into a CR. The effective-HP multiplier depends on
 * the CR band, so the defensive side is re-evaluated with the resulting CR until
 * it settles (at most a few passes).
 */
export function computeCR(
  def: DefenseInputs,
  off: OffenseInputs,
  baselines: CRBaseline[],
): CRComputation {
  const offensive = offensiveIndex(off, baselines);
  const offIndex = clampIndex(offensive.index);
  let estimate: number | null = null;
  let defensive = defensiveIndex(def, baselines, estimate);
  let cr = averageCR(defensive.index, offIndex);
  for (let pass = 0; pass < 4 && cr !== estimate; pass++) {
    estimate = cr;
    defensive = defensiveIndex(def, baselines, estimate);
    cr = averageCR(defensive.index, offIndex);
  }
  const defIndex = clampIndex(defensive.index);
  return {
    cr,
    defensive,
    offensive,
    defensiveIndex: defIndex,
    offensiveIndex: offIndex,
    defensiveCR: indexToCR(defIndex),
    offensiveCR: indexToCR(offIndex),
  };
}
