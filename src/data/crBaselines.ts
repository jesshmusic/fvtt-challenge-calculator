/**
 * Expected monster statistics per CR for the 2024 rules (dnd5e 5.x / 6.x).
 *
 * The DMG 2014 "Monster Statistics by Challenge Rating" table does not describe
 * published monsters well: its hit points run two to three times higher than
 * real stat blocks at every CR, and its attack bonuses and save DCs fall behind
 * above CR 10. These rows are derived from the 504 creatures of the 2024
 * Monster Manual as imported by Foundry (dnd5e 6.0.5), using this module's own
 * extraction so that damage per round is measured the same way it is measured
 * on your NPCs:
 *
 * - each value is the median of the monsters listed at that CR, pooled with the
 *   neighbouring CRs when fewer than three monsters sit at it;
 * - each column is forced to be non-decreasing (weighted isotonic regression);
 * - CRs with no monsters (26-29) are linearly interpolated.
 *
 * `hp` is effective HP (DMG multipliers for bludgeoning/piercing/slashing
 * resistance or immunity), `ac` is effective AC (+2 for Magic Resistance), and
 * `dpr` is the three-round average damage per round.
 *
 * Regenerate with `CR_EVAL_DATA=<dataset.json> CR_PRINT_BASELINES=1 npm run eval:cr`
 * (see tests/crEvaluation.test.ts).
 */

import type { CRBaseline } from '../services/crMath.js';

export const CR_BASELINES_2024: CRBaseline[] = [
  { cr: 0, hp: 3, ac: 12, attackBonus: 3, saveDC: 11, dpr: 1.3 },
  { cr: 0.125, hp: 8, ac: 12.3, attackBonus: 4, saveDC: 11, dpr: 5 },
  { cr: 0.25, hp: 13, ac: 12.3, attackBonus: 4, saveDC: 11, dpr: 6.5 },
  { cr: 0.5, hp: 20, ac: 12.3, attackBonus: 4, saveDC: 11, dpr: 7.3 },
  { cr: 1, hp: 27, ac: 13, attackBonus: 4, saveDC: 11, dpr: 10.5 },
  { cr: 2, hp: 45, ac: 13, attackBonus: 5, saveDC: 12, dpr: 16.5 },
  { cr: 3, hp: 65, ac: 14, attackBonus: 5, saveDC: 12, dpr: 23.5 },
  { cr: 4, hp: 78, ac: 15, attackBonus: 5, saveDC: 13, dpr: 28 },
  { cr: 5, hp: 98.8, ac: 15, attackBonus: 7, saveDC: 14, dpr: 34 },
  { cr: 6, hp: 113, ac: 16, attackBonus: 7, saveDC: 14.8, dpr: 41 },
  { cr: 7, hp: 126.5, ac: 16.4, attackBonus: 7, saveDC: 14.8, dpr: 44.8 },
  { cr: 8, hp: 136, ac: 16.4, attackBonus: 7, saveDC: 15, dpr: 54 },
  { cr: 9, hp: 161.5, ac: 17.9, attackBonus: 9, saveDC: 16.1, dpr: 54.7 },
  { cr: 10, hp: 161.5, ac: 17.9, attackBonus: 9, saveDC: 16.1, dpr: 57.3 },
  { cr: 11, hp: 190, ac: 17.9, attackBonus: 9.3, saveDC: 16.1, dpr: 74.3 },
  { cr: 12, hp: 190, ac: 18, attackBonus: 9.3, saveDC: 16.5, dpr: 86 },
  { cr: 13, hp: 195, ac: 18, attackBonus: 10, saveDC: 17.5, dpr: 94.5 },
  { cr: 14, hp: 195, ac: 18.7, attackBonus: 11, saveDC: 17.5, dpr: 121.5 },
  { cr: 15, hp: 209.5, ac: 18.7, attackBonus: 11.5, saveDC: 18, dpr: 124.2 },
  { cr: 16, hp: 247.2, ac: 19, attackBonus: 12, saveDC: 19, dpr: 124.2 },
  { cr: 17, hp: 247.2, ac: 20, attackBonus: 13, saveDC: 19.4, dpr: 129.5 },
  { cr: 18, hp: 247.2, ac: 20, attackBonus: 13, saveDC: 19.4, dpr: 129.5 },
  { cr: 19, hp: 327.5, ac: 20.5, attackBonus: 14, saveDC: 20.2, dpr: 140.5 },
  { cr: 20, hp: 332.5, ac: 20.5, attackBonus: 14, saveDC: 21, dpr: 140.5 },
  { cr: 21, hp: 333, ac: 21.6, attackBonus: 15, saveDC: 22, dpr: 149 },
  { cr: 22, hp: 402, ac: 21.6, attackBonus: 15, saveDC: 23, dpr: 162.5 },
  { cr: 23, hp: 468, ac: 22, attackBonus: 16, saveDC: 23, dpr: 174.3 },
  { cr: 24, hp: 481, ac: 22, attackBonus: 17, saveDC: 23, dpr: 174.7 },
  { cr: 25, hp: 546, ac: 22, attackBonus: 17, saveDC: 23, dpr: 177.8 },
  { cr: 26, hp: 576.2, ac: 23, attackBonus: 17.4, saveDC: 23, dpr: 183.1 },
  { cr: 27, hp: 606.4, ac: 24, attackBonus: 17.8, saveDC: 23, dpr: 188.3 },
  { cr: 28, hp: 636.6, ac: 25, attackBonus: 18.2, saveDC: 23, dpr: 193.5 },
  { cr: 29, hp: 666.8, ac: 26, attackBonus: 18.6, saveDC: 23, dpr: 198.8 },
  { cr: 30, hp: 697, ac: 27, attackBonus: 19, saveDC: 23, dpr: 204 },
];
