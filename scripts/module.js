import CrCalculator from './CrCalculator.js';

const shouldShowCRButton = (actorObject) => {
  // console.info('cr-calc ActorObject', actorObject, game.user);
  if (actorObject.type === 'npc') {
    if (actorObject.flags.length === 0 && (game.user.isGM || game.user.isTheGM)) {
      return true;
    } else if (
      (!actorObject.flags.sheetClass ||
        actorObject.flags.core.sheetClass === '' ||
        actorObject.flags.core.sheetClass === 'dnd5e.ActorSheet5eNPC') &&
      game.user.isGM
    ) {
      return true;
    }
  }
  return false;
};

Hooks.once('init', async function () {
  console.log('Challenge Rating Calculator Loaded Successfully');
});

Hooks.on('renderActorSheet', (actorSheet, html) => {
  // console.log('cr-calc renderActorSheet', shouldShowCRButton(actorSheet.object));
  if (shouldShowCRButton(actorSheet.object)) {
    const actorSheetItem = html.find('[class="header-details flexrow"]');
    const tooltip = game.i18n.localize('CR-CALC.button-calc');
    actorSheetItem.append(
      `<button type='button' class='cr-calc-button' title='${tooltip}'><i class='fas fa-calculator'></i>&nbsp;` +
        ' CR' +
        ' Calc</button>',
    );
    actorSheet.getData().then((data) => {
      console.log(data.actor);
      console.log(actorSheet);
    });

    html.on('click', '.cr-calc-button', async () => {
      CrCalculator.calculateCRForActor(actorSheet);
    });
  }
});
