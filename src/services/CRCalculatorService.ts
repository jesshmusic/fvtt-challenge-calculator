import { challengeRatings, monsterFeatures } from '../data/crData.js';

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
    monsterFeatures: string[];
  };
  offensiveBreakdown: {
    dpr: number;
    numAttacks: number;
    attackBonus: number;
    spellSaveDC: number;
    numFeats: number;
    detectedWeapons: string[];
  };
}

/**
 * Damage calculation intermediate result
 */
interface DamageCalculation {
  numAttacks: number;
  attackBonus: number;
  dpr: number;
}

export class CRCalculatorService {
  static ID = 'fvtt-challenge-calculator';

  static FLAGS = {
    TODOS: 'cr-calc',
  };

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
    // Build data object from actor (v13 compatibility)
    const data = {
      actor,
      items: Array.from(actor.items),
    };

    const defensiveResult = this.calculateDefensiveCR(actor, data);
    const offensiveResult = this.calculateOffensiveCR(actor, data);

    let rawCR = (offensiveResult.cr + defensiveResult.cr) / 2;

    // Round fractional CRs
    if (rawCR > 0 && rawCR < 0.1875) {
      rawCR = 0.125;
    } else if (rawCR >= 0.1875 && rawCR < 0.5) {
      rawCR = 0.25;
    } else if (rawCR >= 0.5 && rawCR < 1) {
      rawCR = 0.5;
    } else if (rawCR >= 1 && rawCR < 1.5) {
      rawCR = 1;
    }

    const cRating = rawCR > 1 ? Math.round(rawCR) : rawCR;
    const finalCR = cRating >= 0 ? cRating : 0;

    if (updateActor) {
      await actor.update({
        system: {
          details: {
            cr: finalCR,
          },
        },
      });

      ui.notifications?.info(
        `CR updated for ${actor.name} to ${finalCR}, Offensive CR: ${offensiveResult.cr}, Defensive CR: ${defensiveResult.cr}`,
        { permanent: false },
      );
    }

    // Return detailed calculation result for dialog
    return {
      actorName: actor.name,
      originalCR: actor.system.details.cr,
      calculatedCR: finalCR,
      defensiveCR: defensiveResult.cr,
      offensiveCR: offensiveResult.cr,
      defensiveBreakdown: defensiveResult.breakdown,
      offensiveBreakdown: offensiveResult.breakdown,
    };
  }

  /**
   * Calculate offensive CR based on damage output and attack bonuses
   */
  private static calculateOffensiveCR(
    actor: any,
    data: any,
  ): {
    cr: number;
    breakdown: {
      dpr: number;
      numAttacks: number;
      attackBonus: number;
      spellSaveDC: number;
      numFeats: number;
      detectedWeapons: string[];
    };
  } {
    let spellSaveDC = 0;
    if (actor.system.attributes.spellcasting && actor.system.attributes.spellcasting !== '') {
      const castingAbilityMod = actor.system.abilities[actor.system.attributes.spellcasting].mod;
      const spellLevelCR = challengeRatings.find(
        (crObj) => crObj.cr === actor.system.details.spellLevel,
      );
      if (spellLevelCR) {
        spellSaveDC = 8 + castingAbilityMod + spellLevelCR.prof_bonus;
      }
    }

    const numFeats = data.items.filter((item: any) => item.type === 'feat').length;
    const featsBonus = numFeats > 0 ? numFeats / 3 : 0;

    let damageBonus = actor.system.abilities.str.mod;
    let numAttacks = 1;
    let attackBonus = actor.system.abilities.str.mod;

    const damageCalc = this.calculateDamagePerRound(
      data,
      numAttacks,
      actor,
      attackBonus,
      damageBonus,
    );
    numAttacks = damageCalc.numAttacks;
    attackBonus = damageCalc.attackBonus;
    const dpr = damageCalc.dpr;

    let attackBonusCR = 0;
    let spellCastingCR = 0;

    challengeRatings.forEach((chall) => {
      if (dpr >= chall.damage_min && dpr <= chall.damage_max) {
        const attBonusMod = (attackBonus + chall.prof_bonus - chall.attack_bonus) / 2;
        attackBonusCR = chall.cr + attBonusMod + featsBonus;
      }
      if (spellSaveDC === chall.save_dc && spellCastingCR === 0) {
        spellCastingCR = chall.cr + featsBonus;
      }
    });

    // Get weapon names for display (v13 uses damage.base instead of damage.parts)
    const detectedWeapons = data.items
      .filter(
        (item: any) => item.system.damage && item.system.damage.base && item.system.damage.base.formula
      )
      .map((item: any) => item.name);

    return {
      cr: Math.max(attackBonusCR, spellCastingCR),
      breakdown: {
        dpr,
        numAttacks,
        attackBonus,
        spellSaveDC,
        numFeats,
        detectedWeapons,
      },
    };
  }

  /**
   * Calculate damage per round from actor's weapons and attacks
   */
  private static calculateDamagePerRound(
    data: any,
    numAttacks: number,
    actor: any,
    attackBonus: number,
    damageBonus: number,
  ): DamageCalculation {
    // Check for Multiattack feature
    const multiAttackItem = data.items.find((item: any) => {
      if (item.name === 'Multiattack') {
        // v13 might use description.value or just description
        const descValue = item.system.description?.value || item.system.description || '';
        const multiAttackDesc = descValue
          .replace('two', '2')
          .replace('three', '3')
          .replace('four', '4')
          .replace('five', '5')
          .replace('six', '6')
          .replace('seven', '7')
          .replace('eight', '8');
        const multiRegex = /^[^\d]*(\d+)/g;
        const result = multiRegex.exec(multiAttackDesc);
        if (result && result.length > 1 && result[1]) {
          numAttacks = parseInt(result[1]);
        }
        return true;
      }
      return false;
    });

    const isMulti = !!multiAttackItem;

    let damagesArray: number[] = [];
    // v13: Check for damage.base.formula instead of damage.parts
    const offensiveItems = data.items.filter(
      (item: any) =>
        item.system.damage && item.system.damage.base && item.system.damage.base.formula,
    );

    offensiveItems.forEach((item: any) => {
      try {
        // v13: damage is now in damage.base and damage.versatile
        const damages = [];
        if (item.system.damage.base && item.system.damage.base.formula) {
          damages.push([item.system.damage.base.formula, item.system.damage.base.types?.[0] || '']);
        }
        // Optionally include versatile damage if it exists
        if (item.system.damage.versatile && item.system.damage.versatile.formula) {
          damages.push([item.system.damage.versatile.formula, item.system.damage.versatile.types?.[0] || '']);
        }

        // v13: properties might be a Set instead of an object
        const hasFinesseProperty = item.system.properties instanceof Set
          ? item.system.properties.has('fin')
          : 'fin' in (item.system.properties || {});

        const atkBonus =
          hasFinesseProperty && actor.system.abilities.dex.mod > actor.system.abilities.str.mod
            ? actor.system.abilities.dex.mod
            : attackBonus;
        attackBonus = atkBonus > attackBonus ? atkBonus : attackBonus;

        const dmgBonus =
          hasFinesseProperty && actor.system.abilities.dex.mod > actor.system.abilities.str.mod
            ? actor.system.abilities.dex.mod
            : damageBonus;
        damageBonus = dmgBonus > damageBonus ? dmgBonus : damageBonus;

        const isFeat = item.type === 'feat';

        if (damages.length > 0) {
          let dprResult = 0;
          damages.forEach((dam: any) => {
            if (dam.length > 0) {
              const diceRegex =
                /(\d*)[dD](\d*)(([+*-](?:\d+|\@mod|\([a-zA-Z]*\)))*)(\[+-](\d*))?/gm;
              const dieStr = dam[0].replace(/\s/g, '').replace(/\[.*\]/g, '');
              const damageDice = diceRegex.exec(dieStr);
              const useDiceMod = dieStr.includes('@mod');

              if (damageDice && damageDice.length > 4) {
                const diceNum = damageDice[1] === '' ? 1 : parseInt(damageDice[1]);
                const diceValue = damageDice[2] === '' ? 1 : parseInt(damageDice[2]);
                const diceModifier =
                  damageDice[4] && damageDice[4] !== '+@mod' ? parseInt(damageDice[4]) : 0;

                if (diceModifier + attackBonus > attackBonus) {
                  attackBonus = diceModifier + attackBonus;
                }

                const baseDam =
                  isMulti && !isFeat
                    ? ((diceNum * diceValue) / 2) * numAttacks
                    : (diceNum * diceValue) / 2;

                dprResult += baseDam + diceModifier;
                if (useDiceMod) {
                  dprResult += damageBonus;
                }
              }
            }
          });
          damagesArray.push(dprResult);
        }
      } catch (e) {
        console.error(e);
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker(),
          content: `<h3 style="color: red;">Challenge Rating Calculator - ERROR</h3>
                <h4>Error calculating Item Damage for <strong>"${item.name}"</strong></h4>
                <p><code>${e}</code></p>
                <p>Please report errors <a href="https://github.com/jesshmusic/fvtt-challenge-calculator/issues">here</a> with a screenshot of this message. </p>`,
          whisper: [game.user?.id].filter(Boolean) as string[],
        } as any);

        ui.notifications?.error(`Error calculating Item Damage for "${item.name}": ${e}`, {
          permanent: true,
        });
      }
    });

    damagesArray = damagesArray.sort((a, b) => b - a);
    if (damagesArray.length > 2) {
      damagesArray = damagesArray.slice(0, 3);
    }

    const dpr =
      damagesArray.length > 0 ? damagesArray.reduce((a, b) => a + b) / damagesArray.length : 0;

    return { numAttacks, attackBonus, dpr };
  }

  /**
   * Calculate defensive CR based on HP, AC, and defensive abilities
   */
  private static calculateDefensiveCR(
    actor: any,
    data: any,
  ): {
    cr: number;
    breakdown: {
      hp: number;
      ac: number;
      immunities: number;
      resistances: number;
      vulnerabilities: number;
      monsterFeatures: string[];
    };
  } {
    const immunBonus = actor.system.traits.di.value.size * 2;
    const resistBonus = actor.system.traits.dr.value.size;
    const vulnPenalty = -1 * actor.system.traits.dv.value.size;

    // Calculate weighted CR bonus from monster features
    const detectedMonsterFeatures = data.items
      .filter((item: any) => monsterFeatures[item.name])
      .map((item: any) => item.name);

    // Sum the weights of detected defensive/utility features
    const monsterFeatureWeight = detectedMonsterFeatures.reduce((total: number, featureName: string) => {
      const feature = monsterFeatures[featureName];
      // Only count defensive and utility features for defensive CR
      if (feature && (feature.type === 'defensive' || feature.type === 'utility' || feature.type === 'legendary')) {
        return total + feature.weight;
      }
      return total;
    }, 0);

    // Convert weight to CR bonus (weight of 4 = +1 CR)
    const monsterFeatureBonus = monsterFeatureWeight / 4;

    const ac = actor.system.attributes.ac.value;
    const hp = actor.system.attributes.hp.max;

    let defensiveCR = 0;
    challengeRatings.forEach((chall) => {
      if (hp >= chall.hit_points_min && hp <= chall.hit_points_max) {
        const attBonusMod = (ac - chall.armor_class) / 2;
        defensiveCR =
          chall.cr + attBonusMod + immunBonus + resistBonus + vulnPenalty + monsterFeatureBonus;
      }
    });

    return {
      cr: defensiveCR,
      breakdown: {
        hp,
        ac,
        immunities: actor.system.traits.di.value.size,
        resistances: actor.system.traits.dr.value.size,
        vulnerabilities: actor.system.traits.dv.value.size,
        monsterFeatures: detectedMonsterFeatures,
      },
    };
  }
}
