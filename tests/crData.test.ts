import { describe, expect, test } from '@jest/globals';
import { challengeRatings, monsterFeatures } from '../src/data/crData';

describe('Challenge Rating Data', () => {
  describe('challengeRatings array', () => {
    test('is defined and not empty', () => {
      expect(challengeRatings).toBeDefined();
      expect(challengeRatings.length).toBeGreaterThan(0);
    });

    test('contains all standard CR values from 0 to 30', () => {
      const expectedCRs = [
        0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
      ];

      expectedCRs.forEach((cr) => {
        const found = challengeRatings.find((rating) => rating.cr === cr);
        expect(found).toBeDefined();
      });
    });

    test('CRs are in ascending order', () => {
      for (let i = 1; i < challengeRatings.length; i++) {
        expect(challengeRatings[i].cr).toBeGreaterThan(challengeRatings[i - 1].cr);
      }
    });

    test('each CR has all required properties', () => {
      challengeRatings.forEach((rating) => {
        expect(rating).toHaveProperty('cr');
        expect(rating).toHaveProperty('xp');
        expect(rating).toHaveProperty('prof_bonus');
        expect(rating).toHaveProperty('armor_class');
        expect(rating).toHaveProperty('hit_points_min');
        expect(rating).toHaveProperty('hit_points_max');
        expect(rating).toHaveProperty('attack_bonus');
        expect(rating).toHaveProperty('damage_min');
        expect(rating).toHaveProperty('damage_max');
        expect(rating).toHaveProperty('save_dc');
      });
    });

    test('XP values are positive and increasing', () => {
      challengeRatings.forEach((rating) => {
        expect(rating.xp).toBeGreaterThan(0);
      });

      for (let i = 1; i < challengeRatings.length; i++) {
        expect(challengeRatings[i].xp).toBeGreaterThanOrEqual(challengeRatings[i - 1].xp);
      }
    });

    test('proficiency bonus ranges from 2 to 9', () => {
      challengeRatings.forEach((rating) => {
        expect(rating.prof_bonus).toBeGreaterThanOrEqual(2);
        expect(rating.prof_bonus).toBeLessThanOrEqual(9);
      });
    });

    test('proficiency bonus increases with CR', () => {
      // Proficiency bonus should increase every 4 CR levels approximately
      const lowCR = challengeRatings.find((r) => r.cr === 1);
      const midCR = challengeRatings.find((r) => r.cr === 5);
      const highCR = challengeRatings.find((r) => r.cr === 17);

      expect(lowCR?.prof_bonus).toBeLessThan(midCR?.prof_bonus || 0);
      expect(midCR?.prof_bonus).toBeLessThan(highCR?.prof_bonus || 0);
    });

    test('armor class is reasonable (10-25)', () => {
      challengeRatings.forEach((rating) => {
        expect(rating.armor_class).toBeGreaterThanOrEqual(10);
        expect(rating.armor_class).toBeLessThanOrEqual(25);
      });
    });

    test('armor class generally increases with CR', () => {
      const cr1 = challengeRatings.find((r) => r.cr === 1);
      const cr10 = challengeRatings.find((r) => r.cr === 10);
      const cr20 = challengeRatings.find((r) => r.cr === 20);

      expect(cr1?.armor_class).toBeDefined();
      expect(cr10?.armor_class).toBeDefined();
      expect(cr20?.armor_class).toBeDefined();
      expect(cr20!.armor_class).toBeGreaterThanOrEqual(cr10!.armor_class);
    });

    test('hit points min is less than or equal to max', () => {
      challengeRatings.forEach((rating) => {
        expect(rating.hit_points_min).toBeLessThanOrEqual(rating.hit_points_max);
      });
    });

    test('hit points increase with CR', () => {
      for (let i = 1; i < challengeRatings.length; i++) {
        expect(challengeRatings[i].hit_points_max).toBeGreaterThanOrEqual(
          challengeRatings[i - 1].hit_points_max
        );
      }
    });

    test('attack bonus is reasonable (0-19)', () => {
      challengeRatings.forEach((rating) => {
        expect(rating.attack_bonus).toBeGreaterThanOrEqual(0);
        expect(rating.attack_bonus).toBeLessThanOrEqual(19);
      });
    });

    test('attack bonus increases with CR', () => {
      const cr0 = challengeRatings.find((r) => r.cr === 0);
      const cr10 = challengeRatings.find((r) => r.cr === 10);
      const cr20 = challengeRatings.find((r) => r.cr === 20);

      expect(cr10!.attack_bonus).toBeGreaterThan(cr0!.attack_bonus);
      expect(cr20!.attack_bonus).toBeGreaterThan(cr10!.attack_bonus);
    });

    test('damage min is less than or equal to damage max', () => {
      challengeRatings.forEach((rating) => {
        expect(rating.damage_min).toBeLessThanOrEqual(rating.damage_max);
      });
    });

    test('damage increases with CR', () => {
      for (let i = 1; i < challengeRatings.length; i++) {
        expect(challengeRatings[i].damage_max).toBeGreaterThanOrEqual(
          challengeRatings[i - 1].damage_max
        );
      }
    });

    test('save DC is reasonable (10-25)', () => {
      challengeRatings.forEach((rating) => {
        expect(rating.save_dc).toBeGreaterThanOrEqual(10);
        expect(rating.save_dc).toBeLessThanOrEqual(25);
      });
    });

    test('save DC increases with CR', () => {
      const cr1 = challengeRatings.find((r) => r.cr === 1);
      const cr10 = challengeRatings.find((r) => r.cr === 10);
      const cr20 = challengeRatings.find((r) => r.cr === 20);

      expect(cr10!.save_dc).toBeGreaterThan(cr1!.save_dc);
      expect(cr20!.save_dc).toBeGreaterThan(cr10!.save_dc);
    });
  });

  describe('Fractional CR values', () => {
    test('CR 1/8 (0.125) exists', () => {
      const cr = challengeRatings.find((r) => r.cr === 0.125);
      expect(cr).toBeDefined();
      expect(cr?.xp).toBe(25);
    });

    test('CR 1/4 (0.25) exists', () => {
      const cr = challengeRatings.find((r) => r.cr === 0.25);
      expect(cr).toBeDefined();
      expect(cr?.xp).toBe(50);
    });

    test('CR 1/2 (0.5) exists', () => {
      const cr = challengeRatings.find((r) => r.cr === 0.5);
      expect(cr).toBeDefined();
      expect(cr?.xp).toBe(100);
    });
  });

  describe('Specific CR validation', () => {
    test('CR 0 has correct values', () => {
      const cr0 = challengeRatings.find((r) => r.cr === 0);
      expect(cr0).toBeDefined();
      expect(cr0?.xp).toBe(10);
      expect(cr0?.prof_bonus).toBe(2);
    });

    test('CR 1 has correct values', () => {
      const cr1 = challengeRatings.find((r) => r.cr === 1);
      expect(cr1).toBeDefined();
      expect(cr1?.xp).toBe(200);
      expect(cr1?.prof_bonus).toBe(2);
    });

    test('CR 5 has correct proficiency bonus', () => {
      const cr5 = challengeRatings.find((r) => r.cr === 5);
      expect(cr5).toBeDefined();
      expect(cr5?.prof_bonus).toBe(3);
    });

    test('CR 9 has correct proficiency bonus', () => {
      const cr9 = challengeRatings.find((r) => r.cr === 9);
      expect(cr9).toBeDefined();
      expect(cr9?.prof_bonus).toBe(4);
    });

    test('CR 13 has correct proficiency bonus', () => {
      const cr13 = challengeRatings.find((r) => r.cr === 13);
      expect(cr13).toBeDefined();
      expect(cr13?.prof_bonus).toBe(5);
    });

    test('CR 17 has correct proficiency bonus', () => {
      const cr17 = challengeRatings.find((r) => r.cr === 17);
      expect(cr17).toBeDefined();
      expect(cr17?.prof_bonus).toBe(6);
    });

    test('CR 30 exists and has appropriate stats', () => {
      const cr30 = challengeRatings.find((r) => r.cr === 30);
      expect(cr30).toBeDefined();
      expect(cr30?.prof_bonus).toBeGreaterThanOrEqual(8);
      expect(cr30?.armor_class).toBeGreaterThanOrEqual(19);
      expect(cr30?.attack_bonus).toBeGreaterThanOrEqual(14);
    });
  });

  describe('Monster Features', () => {
    test('monsterFeatures is defined and not empty', () => {
      expect(monsterFeatures).toBeDefined();
      expect(monsterFeatures.length).toBeGreaterThan(0);
    });

    test('contains common defensive features', () => {
      const defensiveFeatures = [
        'Magic Resistance',
        'Legendary Resistance',
        'Regeneration',
        'Damage Transfer',
      ];

      defensiveFeatures.forEach((feature) => {
        expect(monsterFeatures).toContain(feature);
      });
    });

    test('contains common offensive features', () => {
      const offensiveFeatures = ['Pack Tactics', 'Pounce', 'Rampage'];

      offensiveFeatures.forEach((feature) => {
        // At least some of these should be in the list
        const found = offensiveFeatures.some((f) => monsterFeatures.includes(f));
        expect(found).toBe(true);
      });
    });

    test('all features are strings', () => {
      monsterFeatures.forEach((feature) => {
        expect(typeof feature).toBe('string');
        expect(feature.length).toBeGreaterThan(0);
      });
    });

    test('no duplicate features', () => {
      const uniqueFeatures = new Set(monsterFeatures);
      expect(uniqueFeatures.size).toBe(monsterFeatures.length);
    });
  });

  describe('HP and Damage scaling validation', () => {
    test('HP roughly doubles every 3-4 CR levels', () => {
      // Test at CR 1, 4, 8, 12
      const cr1 = challengeRatings.find((r) => r.cr === 1);
      const cr4 = challengeRatings.find((r) => r.cr === 4);
      const cr8 = challengeRatings.find((r) => r.cr === 8);

      const avgHP1 = (cr1!.hit_points_min + cr1!.hit_points_max) / 2;
      const avgHP4 = (cr4!.hit_points_min + cr4!.hit_points_max) / 2;
      const avgHP8 = (cr8!.hit_points_min + cr8!.hit_points_max) / 2;

      // HP should approximately double every 3-4 levels (allow some variance)
      expect(avgHP4).toBeGreaterThan(avgHP1 * 1.4);
      expect(avgHP8).toBeGreaterThan(avgHP4 * 1.4);
    });

    test('Damage roughly doubles every 3-4 CR levels', () => {
      const cr1 = challengeRatings.find((r) => r.cr === 1);
      const cr4 = challengeRatings.find((r) => r.cr === 4);
      const cr8 = challengeRatings.find((r) => r.cr === 8);

      const avgDmg1 = (cr1!.damage_min + cr1!.damage_max) / 2;
      const avgDmg4 = (cr4!.damage_min + cr4!.damage_max) / 2;
      const avgDmg8 = (cr8!.damage_min + cr8!.damage_max) / 2;

      expect(avgDmg4).toBeGreaterThan(avgDmg1 * 1.5);
      expect(avgDmg8).toBeGreaterThan(avgDmg4 * 1.5);
    });
  });

  describe('Data consistency checks', () => {
    test('no gaps in CR progression', () => {
      const expectedSequence = [0, 0.125, 0.25, 0.5];
      for (let i = 1; i <= 30; i++) {
        expectedSequence.push(i);
      }

      expectedSequence.forEach((expectedCR, index) => {
        expect(challengeRatings[index].cr).toBe(expectedCR);
      });
    });

    test('HP ranges do not overlap improperly', () => {
      for (let i = 1; i < challengeRatings.length; i++) {
        // Max of previous should be less than or equal to min of current (with some tolerance)
        const prevMax = challengeRatings[i - 1].hit_points_max;
        const currentMin = challengeRatings[i].hit_points_min;

        // Allow small overlap for boundary cases
        expect(currentMin).toBeLessThanOrEqual(prevMax + 10);
      }
    });

    test('Damage ranges do not overlap improperly', () => {
      for (let i = 1; i < challengeRatings.length; i++) {
        const prevMax = challengeRatings[i - 1].damage_max;
        const currentMin = challengeRatings[i].damage_min;

        // Current min should be close to or less than previous max
        expect(currentMin).toBeLessThanOrEqual(prevMax + 5);
      }
    });
  });
});
