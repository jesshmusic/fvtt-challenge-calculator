import { CR_BASELINES_2024 } from '../data/crBaselines.js';
import {
  abilityMods,
  extractDefense,
  extractOffense,
  listOf,
  proficiencyBonus,
} from './crExtraction.js';
import { computeCR, CRBaseline, CRComputation, MAGIC_RESISTANCE_AC } from './crMath.js';

/**
 * Result of a CR calculation for display in the dialog
 */
export interface CRCalculationResult {
  actorName: string;
  originalCR: number;
  calculatedCR: number;
  defensiveCR: number;
  offensiveCR: number;
  defensiveBreakdown: {
    hp: number;
    ac: number;
    immunities: number;
    resistances: number;
    vulnerabilities: number;
    /** Traits that changed effective HP or AC, e.g. "Magic Resistance (+2 AC)". */
    monsterFeatures: string[];
    /** HP after the resistance/immunity multiplier. */
    effectiveHP: number;
    /** AC after Magic Resistance. */
    effectiveAC: number;
  };
  offensiveBreakdown: {
    /** Average damage per round over the first three rounds. */
    dpr: number;
    numAttacks: number;
    /** Best attack bonus of the at-will attack routine (0 if it has no attack rolls). */
    attackBonus: number;
    /** Best save DC of the monster's damaging save effects, or its spell save DC. */
    spellSaveDC: number;
    /** Number of feat items. Informational only; no longer part of the calculation. */
    numFeats: number;
    /** Items whose damage went into the DPR. */
    detectedWeapons: string[];
    /** True when the offensive adjustment used the save DC instead of the attack bonus. */
    usesSaveDC: boolean;
    legendaryActions: number;
  };
}

export class CRCalculatorService {
  static ID = 'fvtt-challenge-calculator';

  static FLAGS = {
    TODOS: 'cr-calc',
  };

  /** Expected stats per CR used by the calculation. */
  static baselines: CRBaseline[] = CR_BASELINES_2024;

  /**
   * Calculate CR for an actor and optionally update it
   * @param actor The actor document
   * @param updateActor Whether to update the actor's CR
   * @returns The calculation result
   */
  static async calculateCRForActor(
    actor: any,
    updateActor: boolean = true,
  ): Promise<CRCalculationResult> {
    const result = this.evaluate(actor);

    if (updateActor) {
      await actor.update({
        system: {
          details: {
            cr: result.calculatedCR,
          },
        },
      });

      ui.notifications?.info(
        `CR updated for ${actor.name} to ${result.calculatedCR}, Offensive CR: ${result.offensiveCR}, Defensive CR: ${result.defensiveCR}`,
        { permanent: false },
      );
    }

    return result;
  }

  /**
   * Run the calculation without touching the actor.
   */
  static evaluate(actor: any): CRCalculationResult {
    const defense = extractDefense(actor);
    const offense = extractOffense(actor);
    const computation = computeCR(defense, offense, this.baselines);

    const spellAbility = actor.system?.attributes?.spellcasting;
    const spellDC = spellAbility
      ? Number(actor.system?.attributes?.spell?.dc) ||
        8 + proficiencyBonus(actor) + (abilityMods(actor)[spellAbility] ?? 0)
      : 0;

    return {
      actorName: actor.name,
      originalCR: actor.system?.details?.cr,
      calculatedCR: computation.cr,
      defensiveCR: computation.defensiveCR,
      offensiveCR: computation.offensiveCR,
      defensiveBreakdown: {
        hp: defense.hp,
        ac: defense.ac,
        immunities: defense.immunities.length,
        resistances: defense.resistances.length,
        vulnerabilities: defense.vulnerabilities.length,
        monsterFeatures: this.describeDefensiveTraits(defense.magicResistance, computation),
        effectiveHP: Math.round(computation.defensive.effectiveHP),
        effectiveAC: computation.defensive.effectiveAC,
      },
      offensiveBreakdown: {
        dpr: offense.dpr,
        numAttacks: offense.numAttacks,
        attackBonus: offense.attackBonus ?? 0,
        spellSaveDC: offense.saveDC ?? spellDC,
        numFeats: listOf(actor.items).filter((item: any) => item?.type === 'feat').length,
        detectedWeapons: Array.from(new Set(offense.options.map((o) => o.itemName))),
        usesSaveDC: offense.usesSaveDC,
        legendaryActions: offense.legendaryActions,
      },
    };
  }

  private static describeDefensiveTraits(
    magicResistance: boolean,
    computation: CRComputation,
  ): string[] {
    const traits: string[] = [];
    const { multiplier, reason } = computation.defensive.hpMultiplier;
    if (reason && multiplier !== 1) {
      const what = reason === 'immune' ? 'Immune' : 'Resistant';
      traits.push(`${what} to bludgeoning/piercing/slashing (×${multiplier} HP)`);
    }
    if (magicResistance) traits.push(`Magic Resistance (+${MAGIC_RESISTANCE_AC} AC)`);
    return traits;
  }
}
