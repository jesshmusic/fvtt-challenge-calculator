import { CRCalculatorService } from './services/CRCalculatorService.js';
import { CRCalculatorDialog } from './ui/CRCalculatorDialog.js';
import packageInfo from '../package.json';
import buildInfo from '../build-info.json';

/**
 * Check if the CR button should be shown for this actor
 * Only shows for default dnd5e NPC sheets when user is GM
 */
const shouldShowCRButton = (actorObject: any): boolean => {
  if (actorObject.type === 'npc') {
    if (
      (!actorObject.flags || Object.keys(actorObject.flags).length === 0) &&
      (game.user?.isGM || (game.user as any)?.isTheGM)
    ) {
      return true;
    } else if (
      (!actorObject.flags.core?.sheetClass ||
        actorObject.flags.core.sheetClass === '' ||
        actorObject.flags.core.sheetClass === 'dnd5e.ActorSheet5eNPC' ||
        actorObject.flags.core.sheetClass === 'dnd5e.ActorSheet5eNPC2') &&
      game.user?.isGM
    ) {
      return true;
    }
  }
  return false;
};

/**
 * Module initialization
 */
Hooks.once('init', async function () {
  console.log(
    "%c⚔️ Dorman Lakely's 5e CR Calculator %cv" + packageInfo.version + " %c(build " + buildInfo.buildNumber + ")",
    'color: #d32f2f; font-weight: bold; font-size: 16px;',
    'color: #ff9800; font-weight: bold; font-size: 14px;',
    'color: #ffeb3b; font-weight: normal; font-size: 12px;'
  );
});

Hooks.once('ready', async function () {
  console.log(
    "%c⚔️ Dorman Lakely's 5e CR Calculator %c✓ Ready!",
    'color: #d32f2f; font-weight: bold; font-size: 16px;',
    'color: #4caf50; font-weight: bold; font-size: 14px;'
  );
});

/**
 * Add CR Calculator button to NPC actor sheets
 * v13 ApplicationV2 uses: render<ClassName>
 */

// Try all possible v13 hook names
const hookNames = [
  'renderNPCActorSheet',           // v13 ApplicationV2 name
  'renderdnd5e.NPCActorSheet',     // With module prefix
  'renderActorSheet5eNPC2',        // Legacy name
  'renderActorSheet',              // v12 fallback
];

hookNames.forEach(hookName => {
  Hooks.on(hookName, (app: any, html: JQuery | HTMLElement, data?: any) => {
    // Get actor object (v13 uses app.document, v12 uses app.object)
    const actor = app.document || app.object || app.actor;

    if (!actor) {
      return;
    }

    if (!shouldShowCRButton(actor)) {
      return;
    }

    // Get the HTML element (v13 passes HTMLElement, v12 passes jQuery)
    const sheetElement = html instanceof HTMLElement ? html : html[0];

    if (!sheetElement) {
      return;
    }

    // Find the header section - try multiple selectors for different sheet versions
    // v13: .window-header .header-elements (in window header)
    // v12: .header-details.flexrow (in sheet body)
    let headerDetails = sheetElement.querySelector('.window-header .header-elements');

    if (!headerDetails) {
      // Fallback to v12 selector
      headerDetails = sheetElement.querySelector('.header-details.flexrow');
    }

    if (!headerDetails) {
      return;
    }

    // Check if button already exists to prevent duplicates
    if (headerDetails.querySelector('.cr-calc-button')) {
      return;
    }

    // Get localized tooltip text
    const tooltip = game.i18n.localize('CR-CALC.button-calc');

    // Create button element
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cr-calc-button';
    button.title = tooltip;
    button.innerHTML = '<i class="fas fa-calculator"></i>&nbsp; CR Calc';

    // Add click handler
    button.addEventListener('click', async (event: Event) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        // Calculate CR without updating actor (dialog will handle that)
        const result = await CRCalculatorService.calculateCRForActor(actor, false);

        // Show dialog with results
        const dialog = new CRCalculatorDialog(result, actor);
        dialog.render(true);
      } catch (error) {
        console.error('CR Calculator: Error calculating CR', error);
        ui.notifications.error(
          `Error calculating CR: ${error instanceof Error ? error.message : 'Unknown error'}`,
          { permanent: true }
        );
      }
    });

    // Append button to header
    headerDetails.appendChild(button);
  });
});
