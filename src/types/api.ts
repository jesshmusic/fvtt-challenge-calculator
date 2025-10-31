/**
 * Public API types for external modules
 *
 * To use the CR Calculator API from another module:
 *
 * @example
 * ```typescript
 * const crCalc = game.modules.get('fvtt-challenge-calculator')?.api;
 * if (crCalc) {
 *   const result = await crCalc.calculateCRForActor(actor, false);
 *   console.log(`Calculated CR: ${result.calculatedCR}`);
 * }
 * ```
 */

import type { CRCalculationResult } from '../services/CRCalculatorService.js';
import type { ChallengeRating, MonsterFeature } from '../data/crData.js';

/**
 * Public API exposed by the CR Calculator module
 */
export interface CRCalculatorAPI {
  /**
   * Calculate CR for an actor based on its stats, features, and equipment
   *
   * @param actor - The actor to calculate CR for
   * @param updateActor - Whether to update the actor's CR field (default: true)
   * @returns Promise resolving to detailed calculation result
   *
   * @example
   * ```typescript
   * const result = await crCalc.calculateCRForActor(myActor, false);
   * console.log(`Defensive CR: ${result.defensiveCR}`);
   * console.log(`Offensive CR: ${result.offensiveCR}`);
   * console.log(`Final CR: ${result.calculatedCR}`);
   * ```
   */
  calculateCRForActor(actor: any, updateActor?: boolean): Promise<CRCalculationResult>;

  /**
   * Array of challenge rating data from D&D 5e Dungeon Master's Guide
   * Contains CR values from 0 to 30 with corresponding XP, proficiency bonus,
   * AC, HP ranges, attack bonus, damage ranges, and save DC
   *
   * @example
   * ```typescript
   * const cr5 = crCalc.challengeRatings.find(r => r.cr === 5);
   * console.log(`CR 5 HP range: ${cr5.hit_points_min}-${cr5.hit_points_max}`);
   * ```
   */
  challengeRatings: ChallengeRating[];

  /**
   * Dictionary of monster features with CR weight adjustments
   * Keys are feature names, values are MonsterFeature objects with:
   * - name: Feature name
   * - weight: CR adjustment (0-4, with -1 for weaknesses)
   * - type: 'defensive' | 'offensive' | 'utility' | 'legendary'
   * - description: What the feature does and its CR impact
   *
   * Weight scale: 0 = minimal, 1 = +0.25 CR, 2 = +0.5 CR, 3 = +1 CR, 4 = +1.5 CR
   *
   * @example
   * ```typescript
   * const legendaryRes = crCalc.monsterFeatures['Legendary Resistance'];
   * console.log(`${legendaryRes.name}: Weight ${legendaryRes.weight}`);
   *
   * // Get all defensive features
   * const defensive = Object.values(crCalc.monsterFeatures)
   *   .filter(f => f.type === 'defensive');
   * ```
   */
  monsterFeatures: Record<string, MonsterFeature>;

  /**
   * Array of all monster feature names
   * Convenience property equivalent to Object.keys(monsterFeatures)
   *
   * @example
   * ```typescript
   * console.log(`Available features: ${crCalc.monsterFeatureNames.join(', ')}`);
   * ```
   */
  monsterFeatureNames: string[];
}

// Re-export types for external modules
export type { CRCalculationResult, ChallengeRating, MonsterFeature };
