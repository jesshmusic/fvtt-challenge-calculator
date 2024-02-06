import { challengeRatings, monsterFeatures } from './challenge-ratings.js';

class CrCalculator {
  static ID = 'fvtt-challenge-calculator';

  static FLAGS = {
    TODOS: 'cr-calc',
  };
  static async calculateCRForActor(actorSheet) {
    const data = await actorSheet.getData();
    const actor = data.actor;
    console.log(
      `${actor.name}\n
      CR: ${actor.system.details.cr}, Prof: ${actor.system.attributes.prof}
    `,
      actor,
    );

    const defensiveCR = this.calculateDefensiveCR(actor, data);
    const offensiveCR = this.calculateOffensiveCR(actor, data);
    let rawCR = (offensiveCR + defensiveCR) / 2;
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
    console.log(
      `OFF CR: ${offensiveCR} - DEF CR: ${defensiveCR} - Raw CR: ${rawCR} - TOTAL CR: ${cRating}`,
    );
    await actor.update({
      system: {
        details: {
          cr: cRating,
        },
      },
    });
    ui.notifications.info(`CR updated for ${actor.name} to ${cRating}`);
  }

  static calculateOffensiveCR(actor, data) {
    const legendaryActionsBonus = actor.system.resources.legact.value > 0 ? 1 : 0;
    const lairBonus = actor.system.resources.lair.value ? 1 : 0;
    const numFeats = data.items.filter((item) => item.type === 'feat').length;
    const featsBonus = numFeats > 0 ? numFeats / 2 : 0;
    let damageBonus = actor.system.abilities.str.mod;
    let numAttacks = 1;
    let attackBonus = actor.system.abilities.str.mod + actor.system.attributes.prof;
    const isMulti =
      data.items.filter((item) => {
        if (item.name === 'Multiattack') {
          const multiAttackDesc = item.system.description.value
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
      }).length > 0;

    const damagesArray = [];
    data.items.forEach((item) => {
      const damages = item.system.damage.parts;
      const atkBonus =
        item.system.properties.has('fin') &&
        actor.system.abilities.dex.mod > actor.system.abilities.str.mod
          ? actor.system.abilities.dex.mod + actor.system.attributes.prof
          : attackBonus;
      attackBonus = atkBonus > attackBonus ? atkBonus : attackBonus;
      const dmgBonus =
        item.system.properties.has('fin') &&
        actor.system.abilities.dex.mod > actor.system.abilities.str.mod
          ? actor.system.abilities.dex.mod
          : damageBonus;
      damageBonus = dmgBonus > damageBonus ? dmgBonus : damageBonus;
      const isFeat = item.type === 'feat';
      if (damages.length > 0) {
        let dprResult = 0;
        damages.forEach((dam) => {
          if (dam.length > 0) {
            const diceRegex = /(\d*)[dD](\d*)(([+*-](?:\d+|\@mod|\([a-zA-Z]*\)))*)(\[+-](D\d*))?/gm;
            const dieStr = dam[0].replace(/\s/g, '');
            const damageDice = diceRegex.exec(dieStr);
            const useDiceMod = dieStr.includes('@mod');
            if (damageDice.length > 4) {
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
    });
    const dpr = damagesArray.reduce((a, b) => a + b) / damagesArray.length;
    let attackBonusCR = 0;
    let spellCR = 0;
    challengeRatings.forEach((chall) => {
      if (dpr >= chall.damage_min && dpr <= chall.damage_max) {
        const attBonusMod = (attackBonus - chall.attack_bonus) / 2;
        attackBonusCR = chall.cr + attBonusMod + legendaryActionsBonus + lairBonus + featsBonus;
      }
    });
    challengeRatings.forEach((chall) => {
      if (
        actor.system.details.spellLevel >= actor.system.details.cr &&
        actor.system.attributes.spelldc === chall.save_dc
      ) {
        spellCR = chall.cr + legendaryActionsBonus + lairBonus + featsBonus;
      }
    });
    console.log(
      `DPR CALCULATION: ${dpr} damage per round\n\tnum attacks: ${numAttacks}\n\tattack bonus: ${attackBonus}\n\tSpell CR: ${spellCR}\n\tAttack CR: ${attackBonusCR}\n\tNumber of Feats: ${numFeats}\n`,
    );
    return Math.max(attackBonusCR, spellCR);
  }

  static calculateDefensiveCR(actor, data) {
    const immunBonus = actor.system.traits.di.value.size * 2;
    const resistBonus = actor.system.traits.dr.value.size;
    const vulnPenalty = -1 * actor.system.traits.dv.value.size;
    const monsterFeatureCount = data.items.filter(
      (item) => monsterFeatures.indexOf(item.name) > -1,
    ).length;
    const ac = actor.system.attributes.ac.value;
    const hp = actor.system.attributes.hp.max;
    let defensiveCR = 0;
    challengeRatings.forEach((chall) => {
      if (hp >= chall.hit_points_min && hp <= chall.hit_points_max) {
        const attBonusMod = (ac - chall.armor_class) / 2;
        defensiveCR =
          chall.cr + attBonusMod + immunBonus + resistBonus + vulnPenalty + monsterFeatureCount;
      }
    });
    return defensiveCR;
  }
}
export default CrCalculator;
