import { challengeRatings } from './challenge-ratings.js';

class CrCalc {
  static ID = 'fvtt-challenge-calculator';

  static FLAGS = {
    TODOS: 'cr-calc',
  };
  static async calculateCRForActor(actorSheet) {
    const data = await actorSheet.getData();
    const actor = data.actor;
    console.log(actor);

    const defensiveCR = this.calculateDefensiveCR(actor, data);
    const offensiveCR = this.calculateOffensiveCR(actor, data);
    const cRating = Math.round((offensiveCR + defensiveCR) / 2);
    console.log(`OFF CR: ${offensiveCR} - DEF CR: ${defensiveCR} - TOTAL CR: ${cRating}`);

    const system = {
      ...actor.system,
      details: {
        ...actor.system.details,
        cr: cRating,
      },
    };
    await actor.update({
      system,
    });
    ui.notifications.info(`CR updated for ${actor.name} to ${cRating}`);
  }

  static calculateOffensiveCR(actor, data) {
    let dpr = 0;
    const damageBonus = actor.system.abilities.str.mod;
    let numAttacks = 1;
    let attackBonus = actor.system.abilities.str.mod + actor.system.attributes.prof;
    const isMulti =
      data.items.filter((item) => {
        if (item.name === 'Multiattack') {
          console.log(item);
          const parsedDesc = /^[^\d]*(\d+)/.exec(item.system.description.value);
          if (parsedDesc.length >= 2) {
            numAttacks = parseInt(parsedDesc[1]);
          } else {
            numAttacks = 2;
          }
          return true;
        }
        return false;
      }).length > 0;
    data.items.forEach((item) => {
      const damages = item.system.damage.parts;
      if (damages.length > 0) {
        damages.forEach((dam) => {
          if (dam.length > 0) {
            const diceRegex = /(\d*)[dD](\d*)(([+*-](?:\d+|\@mod|\([a-zA-Z]*\)))*)(\[+-](D\d*))?/gm;
            const dieStr = dam[0].replace(/\s/g, '');
            const damageDice = diceRegex.exec(dieStr);
            if (damageDice.length > 4) {
              const diceNum = parseInt(damageDice[1]);
              const diceValue = parseInt(damageDice[2]);
              const diceModifier = parseInt(damageDice[4]);
              console.log(
                isMulti ? 'Multiattack. ' : 'Single Attack. ',
                `Num: ${diceNum}, Value: ${diceValue}, Mod: ${diceModifier}`,
              );
              if (diceModifier + attackBonus > attackBonus) {
                attackBonus = diceModifier + attackBonus;
              }
              const dprResult = isMulti
                ? numAttacks * ((diceNum * diceValue) / 2 + diceModifier + damageBonus)
                : (diceNum * diceValue) / 2 + diceModifier + damageBonus;
              if (dprResult > dpr) {
                dpr = dprResult;
              }
            }
          }
        });
      }
    });
    let attackBonusCR = 0;
    let spellCR = 0;
    challengeRatings.forEach((chall) => {
      if (dpr >= chall.damage_min && dpr <= chall.damage_max) {
        const attBonusMod = (attackBonus - chall.attack_bonus) / 2;
        attackBonusCR = chall.cr + attBonusMod;
      }
    });
    challengeRatings.forEach((chall) => {
      if (
        actor.system.details.spellLevel >= actor.system.details.cr &&
        actor.system.attributes.spelldc === chall.save_dc
      ) {
        spellCR = chall.cr;
      }
    });
    console.log(
      `DPR CALCULATION: ${dpr}, damage per round... num attacks: ${numAttacks}, attack bonus: ${attackBonus}\nSpell CR: ${spellCR}, Attack CR: ${attackBonusCR}`,
    );
    return Math.max(attackBonusCR, spellCR);
  }

  static calculateDefensiveCR(actor) {
    const ac = actor.system.attributes.ac.value;
    const hp = actor.system.attributes.hp.max;
    let defensiveCR = 0;
    challengeRatings.forEach((chall) => {
      if (hp >= chall.hit_points_min && hp <= chall.hit_points_max) {
        const attBonusMod = (ac - chall.armor_class) / 2;
        defensiveCR = chall.cr + attBonusMod;
      }
    });
    return defensiveCR;
  }
}

Hooks.once('init', async function () {
  console.log('Challenge Rating Calculator Loaded Successfully');
});

Hooks.once('ready', async function () {
  // ChatMessage.create({
  //   user: game.user_id,
  //   speaker: ChatMessage.getSpeaker(),
  //   content: '<h3>Challenge Rating Calculator</h3><p>Loaded Successfully</p>',
  // });
});

Hooks.on('renderActorSheet', (actorSheet, html) => {
  if (actorSheet.object.type === 'npc') {
    const actorSheetItem = html.find('[class="header-details flexrow"]');
    const tooltip = game.i18n.localize('CR-CALC.button-calc');
    actorSheetItem.append(
      `<button type='button' class='cr-calc-button' title='${tooltip}'><i class='fas fa-calculator'></i>&nbsp;` +
        ' CR' +
        ' Calc</button>',
    );
    html.on('click', '.cr-calc-button', async (event) => {
      CrCalc.calculateCRForActor(actorSheet);
    });
  }
});
