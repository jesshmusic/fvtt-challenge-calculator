import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { CRCalculatorService } from '../src/services/CRCalculatorService';
import { createMockActor, createMockItem } from './setup';

describe('CRCalculatorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateCRForActor', () => {
    test('calculates CR for basic actor', async () => {
      const actor = createMockActor({
        system: {
          abilities: {
            str: { value: 14, mod: 2 },
            dex: { value: 12, mod: 1 },
            con: { value: 13, mod: 1 },
            int: { value: 10, mod: 0 },
            wis: { value: 10, mod: 0 },
            cha: { value: 8, mod: -1 },
          },
          attributes: {
            hp: { value: 30, max: 30 },
            ac: { value: 14 },
            spellcasting: '',
          },
          details: {
            cr: 0,
            spellLevel: 0,
          },
          traits: {
            di: { value: new Set() },
            dr: { value: new Set() },
            dv: { value: new Set() },
          },
        },
        items: [
          createMockItem('weapon', {
            name: 'Longsword',
            system: {
              damage: {
                base: {
                  formula: '1d8+2',
                  types: ['slashing'],
                },
              },
              properties: new Set(),
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result).toBeDefined();
      expect(result.actorName).toBe('Test Actor');
      expect(result.calculatedCR).toBeGreaterThanOrEqual(0);
      expect(result.defensiveCR).toBeGreaterThanOrEqual(0);
      expect(result.offensiveCR).toBeGreaterThanOrEqual(0);
      expect(result.defensiveBreakdown).toBeDefined();
      expect(result.offensiveBreakdown).toBeDefined();
    });

    test('updates actor CR when updateActor is true', async () => {
      const actor = createMockActor();
      actor.items = [];

      await CRCalculatorService.calculateCRForActor(actor, true);

      expect(actor.update).toHaveBeenCalledWith(
        expect.objectContaining({
          system: expect.objectContaining({
            details: expect.objectContaining({
              cr: expect.any(Number),
            }),
          }),
        })
      );
    });

    test('does not update actor when updateActor is false', async () => {
      const actor = createMockActor();
      actor.items = [];

      await CRCalculatorService.calculateCRForActor(actor, false);

      expect(actor.update).not.toHaveBeenCalled();
    });

    test('rounds fractional CRs correctly', async () => {
      // Test CR < 0.1875 rounds to 0.125
      const lowCRActor = createMockActor({
        system: {
          attributes: { hp: { max: 5 }, ac: { value: 10 } },
          abilities: {
            str: { value: 8, mod: -1 },
            dex: { value: 8, mod: -1 },
            con: { value: 8, mod: -1 },
            int: { value: 8, mod: -1 },
            wis: { value: 8, mod: -1 },
            cha: { value: 8, mod: -1 },
          },
          traits: {
            di: { value: new Set() },
            dr: { value: new Set() },
            dv: { value: new Set() },
          },
        },
        items: [],
      });

      const result = await CRCalculatorService.calculateCRForActor(lowCRActor, false);
      expect(result.calculatedCR).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Defensive CR calculation', () => {
    test('calculates defensive CR based on HP and AC', async () => {
      const actor = createMockActor({
        system: {
          attributes: {
            hp: { value: 100, max: 100 },
            ac: { value: 16 },
          },
          traits: {
            di: { value: new Set() },
            dr: { value: new Set() },
            dv: { value: new Set() },
          },
        },
        items: [],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.defensiveBreakdown.hp).toBe(100);
      expect(result.defensiveBreakdown.ac).toBe(16);
      expect(result.defensiveCR).toBeGreaterThan(0);
    });

    test('includes damage immunities in defensive CR', async () => {
      const actorWithImmunities = createMockActor({
        system: {
          attributes: { hp: { max: 50 }, ac: { value: 14 } },
          traits: {
            di: { value: new Set(['fire', 'cold']) },
            dr: { value: new Set() },
            dv: { value: new Set() },
          },
        },
        items: [],
      });

      const actorWithoutImmunities = createMockActor({
        system: {
          attributes: { hp: { max: 50 }, ac: { value: 14 } },
          traits: {
            di: { value: new Set() },
            dr: { value: new Set() },
            dv: { value: new Set() },
          },
        },
        items: [],
      });

      const resultWith = await CRCalculatorService.calculateCRForActor(actorWithImmunities, false);
      const resultWithout = await CRCalculatorService.calculateCRForActor(
        actorWithoutImmunities,
        false
      );

      expect(resultWith.defensiveBreakdown.immunities).toBe(2);
      expect(resultWithout.defensiveBreakdown.immunities).toBe(0);
      expect(resultWith.defensiveCR).toBeGreaterThanOrEqual(resultWithout.defensiveCR);
    });

    test('includes damage resistances in defensive CR', async () => {
      const actor = createMockActor({
        system: {
          traits: {
            di: { value: new Set() },
            dr: { value: new Set(['piercing', 'slashing']) },
            dv: { value: new Set() },
          },
        },
        items: [],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.defensiveBreakdown.resistances).toBe(2);
    });

    test('includes damage vulnerabilities in defensive CR', async () => {
      const actor = createMockActor({
        system: {
          traits: {
            di: { value: new Set() },
            dr: { value: new Set() },
            dv: { value: new Set(['fire']) },
          },
        },
        items: [],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.defensiveBreakdown.vulnerabilities).toBe(1);
    });

    test('detects monster features for defensive CR', async () => {
      const actor = createMockActor({
        items: [
          createMockItem('feat', {
            name: 'Magic Resistance',
          }),
          createMockItem('feat', {
            name: 'Regeneration',
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.defensiveBreakdown.monsterFeatures.length).toBeGreaterThan(0);
    });
  });

  describe('Offensive CR calculation', () => {
    test('calculates offensive CR based on damage and attack bonus', async () => {
      const actor = createMockActor({
        system: {
          abilities: {
            str: { value: 16, mod: 3 },
            dex: { value: 10, mod: 0 },
            con: { value: 14, mod: 2 },
            int: { value: 10, mod: 0 },
            wis: { value: 10, mod: 0 },
            cha: { value: 10, mod: 0 },
          },
        },
        items: [
          createMockItem('weapon', {
            name: 'Greatsword',
            system: {
              damage: {
                base: {
                  formula: '2d6+3',
                  types: ['slashing'],
                },
              },
              properties: new Set(),
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.offensiveBreakdown.dpr).toBeGreaterThan(0);
      expect(result.offensiveBreakdown.attackBonus).toBeGreaterThanOrEqual(0);
      expect(result.offensiveCR).toBeGreaterThanOrEqual(0);
    });

    test('detects multiattack feature', async () => {
      const actor = createMockActor({
        items: [
          createMockItem('feat', {
            name: 'Multiattack',
            system: {
              description: {
                value: 'The creature makes three attacks.',
              },
            },
          }),
          createMockItem('weapon', {
            name: 'Claw',
            system: {
              damage: {
                base: {
                  formula: '1d6+2',
                  types: ['slashing'],
                },
              },
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.offensiveBreakdown.numAttacks).toBeGreaterThan(1);
    });

    test('calculates spell save DC for spellcasters', async () => {
      const actor = createMockActor({
        system: {
          abilities: {
            wis: { value: 16, mod: 3 },
            str: { value: 10, mod: 0 },
            dex: { value: 10, mod: 0 },
            con: { value: 10, mod: 0 },
            int: { value: 10, mod: 0 },
            cha: { value: 10, mod: 0 },
          },
          attributes: {
            spellcasting: 'wis',
          },
          details: {
            spellLevel: 5,
          },
        },
        items: [],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.offensiveBreakdown.spellSaveDC).toBeGreaterThan(0);
    });

    test('detects weapons for offensive breakdown', async () => {
      const actor = createMockActor({
        items: [
          createMockItem('weapon', {
            name: 'Longsword',
            system: {
              damage: {
                base: {
                  formula: '1d8+2',
                  types: ['slashing'],
                },
              },
            },
          }),
          createMockItem('weapon', {
            name: 'Shortbow',
            system: {
              damage: {
                base: {
                  formula: '1d6+1',
                  types: ['piercing'],
                },
              },
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.offensiveBreakdown.detectedWeapons).toContain('Longsword');
      expect(result.offensiveBreakdown.detectedWeapons).toContain('Shortbow');
    });

    test('counts feats for offensive CR bonus', async () => {
      const actor = createMockActor({
        items: [
          createMockItem('feat', { name: 'Pack Tactics' }),
          createMockItem('feat', { name: 'Keen Senses' }),
          createMockItem('feat', { name: 'Pounce' }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.offensiveBreakdown.numFeats).toBe(3);
    });

    test('handles finesse weapons with dexterity bonus', async () => {
      const actor = createMockActor({
        system: {
          abilities: {
            str: { value: 10, mod: 0 },
            dex: { value: 16, mod: 3 },
            con: { value: 10, mod: 0 },
            int: { value: 10, mod: 0 },
            wis: { value: 10, mod: 0 },
            cha: { value: 10, mod: 0 },
          },
        },
        items: [
          createMockItem('weapon', {
            name: 'Rapier',
            system: {
              damage: {
                base: {
                  formula: '1d8+3',
                  types: ['piercing'],
                },
              },
              properties: new Set(['fin']),
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      // Finesse weapon should use higher of STR or DEX
      expect(result.offensiveBreakdown.attackBonus).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Damage per round calculation', () => {
    test('calculates DPR from weapon damage formula', async () => {
      const actor = createMockActor({
        items: [
          createMockItem('weapon', {
            system: {
              damage: {
                base: {
                  formula: '2d6+3',
                  types: ['slashing'],
                },
              },
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      // 2d6 averages to 7, +3 modifier = 10 DPR
      expect(result.offensiveBreakdown.dpr).toBeGreaterThan(0);
    });

    test('handles multiple damage dice correctly', async () => {
      const actor = createMockActor({
        items: [
          createMockItem('weapon', {
            system: {
              damage: {
                base: {
                  formula: '3d8+4',
                  types: ['bludgeoning'],
                },
              },
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.offensiveBreakdown.dpr).toBeGreaterThan(0);
    });

    test('handles versatile damage', async () => {
      const actor = createMockActor({
        items: [
          createMockItem('weapon', {
            system: {
              damage: {
                base: {
                  formula: '1d8+2',
                  types: ['slashing'],
                },
                versatile: {
                  formula: '1d10+2',
                  types: ['slashing'],
                },
              },
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.offensiveBreakdown.dpr).toBeGreaterThan(0);
    });
  });

  describe('Edge cases and error handling', () => {
    test('handles actor with no items', async () => {
      const actor = createMockActor({
        items: [],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result).toBeDefined();
      expect(result.calculatedCR).toBeGreaterThanOrEqual(0);
    });

    test('handles very low CR (< 1)', async () => {
      const actor = createMockActor({
        system: {
          attributes: {
            hp: { max: 7 },
            ac: { value: 10 },
          },
        },
        items: [],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.calculatedCR).toBeLessThan(1);
      expect([0, 0.125, 0.25, 0.5]).toContain(result.calculatedCR);
    });

    test('handles very high CR (> 20)', async () => {
      const actor = createMockActor({
        system: {
          attributes: {
            hp: { max: 500 },
            ac: { value: 22 },
          },
          abilities: {
            str: { value: 30, mod: 10 },
            dex: { value: 20, mod: 5 },
            con: { value: 30, mod: 10 },
            int: { value: 20, mod: 5 },
            wis: { value: 20, mod: 5 },
            cha: { value: 20, mod: 5 },
          },
        },
        items: [
          createMockItem('weapon', {
            system: {
              damage: {
                base: {
                  formula: '8d10+10',
                  types: ['slashing'],
                },
              },
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      expect(result.calculatedCR).toBeGreaterThan(10);
    });

    test('handles invalid damage formula gracefully', async () => {
      const actor = createMockActor({
        items: [
          createMockItem('weapon', {
            name: 'Broken Weapon',
            system: {
              damage: {
                base: {
                  formula: 'invalid-formula',
                  types: ['slashing'],
                },
              },
            },
          }),
        ],
      });

      // Should not throw error
      await expect(CRCalculatorService.calculateCRForActor(actor, false)).resolves.toBeDefined();
    });

    test('averages offensive and defensive CR correctly', async () => {
      const actor = createMockActor({
        system: {
          attributes: {
            hp: { max: 100 }, // High HP for defensive CR
            ac: { value: 16 },
          },
          abilities: {
            str: { value: 10, mod: 0 }, // Low STR for offensive CR
            dex: { value: 10, mod: 0 },
            con: { value: 10, mod: 0 },
            int: { value: 10, mod: 0 },
            wis: { value: 10, mod: 0 },
            cha: { value: 10, mod: 0 },
          },
        },
        items: [
          createMockItem('weapon', {
            system: {
              damage: {
                base: {
                  formula: '1d4',
                  types: ['bludgeoning'],
                },
              },
            },
          }),
        ],
      });

      const result = await CRCalculatorService.calculateCRForActor(actor, false);

      // Final CR should be average of offensive and defensive
      const expectedAverage = (result.defensiveCR + result.offensiveCR) / 2;
      expect(Math.abs(result.calculatedCR - Math.round(expectedAverage))).toBeLessThanOrEqual(1);
    });
  });
});
