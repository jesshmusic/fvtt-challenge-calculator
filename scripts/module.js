import CrCalculator from './CrCalculator.js';

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
      CrCalculator.calculateCRForActor(actorSheet);
    });
  }
});
