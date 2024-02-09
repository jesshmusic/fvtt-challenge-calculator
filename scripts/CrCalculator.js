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
    await actor.update({
      system: {
        details: {
          cr: cRating >= 0 ? cRating : 0,
        },
      },
    });
    ChatMessage.create({
      user: game.user_id,
      speaker: ChatMessage.getSpeaker(),
      blind: true,
      content: `<h3>Challenge Rating Calculator</h3>
<p>Challenge rating updated for ${actor.name} to <strong>${cRating}</strong></p>
<p>Offensive CR: ${offensiveCR}</p>
<p>Defensive CR: ${defensiveCR}</p>
<p>Raw CR: ${rawCR}</p>`,
    });

    ui.notifications.info(`CR updated for ${actor.name} to ${cRating}`);
  }

  static calculateOffensiveCR(actor, data) {
    let spellSaveDC = 0;
    if (actor.system.attributes.spellcasting && actor.system.attributes.spellcasting !== '') {
      const castingAbilityMod = actor.system.abilities[actor.system.attributes.spellcasting].mod;
      const spellLevelCR = challengeRatings.find((crObj) => {
        return crObj.cr === actor.system.details.spellLevel;
      });
      spellSaveDC = 8 + castingAbilityMod + spellLevelCR.prof_bonus;
    }
    const numFeats = data.items.filter((item) => item.type === 'feat').length;
    console.log(data.items.filter((item) => item.type === 'feat'));
    const featsBonus = numFeats > 0 ? numFeats / 3 : 0;
    let damageBonus = actor.system.abilities.str.mod;
    let numAttacks = 1;
    let attackBonus = actor.system.abilities.str.mod;
    const __ret = this.calculateDamagePerRound(data, numAttacks, actor, attackBonus, damageBonus);
    numAttacks = __ret.numAttacks;
    attackBonus = __ret.attackBonus;
    const dpr = __ret.dpr;
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

    console.log(
      `DPR CALCULATION: ${dpr} damage per round\n\tnum attacks: ${numAttacks}\n\tattack bonus: ${attackBonus}\n\tAttack CR: ${attackBonusCR}\n\tSpell CR: ${spellCastingCR}\n\tNumber of Feats: ${numFeats}\n`,
    );
    return Math.max(attackBonusCR, spellCastingCR);
  }

  static calculateDamagePerRound(data, numAttacks, actor, attackBonus, damageBonus) {
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

    let damagesArray = [];
    const offensiveItems = data.items.filter((item) => {
      return item.system.damage && item.system.damage.parts && item.system.damage.parts.length > 0;
    });
    offensiveItems.forEach((item) => {
      const damages = item.system.damage ? item.system.damage.parts : [];
      const atkBonus =
        item.system.properties.has('fin') &&
        actor.system.abilities.dex.mod > actor.system.abilities.str.mod
          ? actor.system.abilities.dex.mod
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
        try {
          let dprResult = 0;
          damages.forEach((dam) => {
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
        } catch (e) {
          console.log(e);
          ChatMessage.create({
            user: game.user_id,
            speaker: ChatMessage.getSpeaker(),
            blind: true,
            content: `<h3 style="color: red;">Challenge Rating Calculator - ERROR</h3>
                <h4>Error calculating Item Damage for <strong>"${item.name}"</strong></h4>
                <p><code>${e}</code></p>
                <p>Please report errors <a href="https://github.com/jesshmusic/fvtt-challenge-calculator/issues">here</a> with a screenshot of this message. </p>`,
          });
        }
      }
    });
    damagesArray = damagesArray.sort((a, b) => b - a);
    if (damagesArray.length > 2) {
      damagesArray = damagesArray.slice(0, 3);
    }
    console.log(damagesArray);
    const dpr = damagesArray.reduce((a, b) => a + b) / damagesArray.length;
    return { numAttacks, attackBonus, dpr };
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
