import { CRCalculatorService } from './services/CRCalculatorService.js';
import { CRCalculatorDialog } from './ui/CRCalculatorDialog.js';
import { challengeRatings, monsterFeatures } from './data/crData.js';
import packageInfo from '../package.json';
import buildInfo from '../build-info.json';

/**
 * Check if the CR button should be shown for this actor
 * Shows for any NPC sheet when user is GM (supports default, Tidy 5e, and other custom sheets)
 */
const shouldShowCRButton = (actorObject: any): boolean => {
  return actorObject.type === 'npc' && !!(game.user?.isGM || (game.user as any)?.isTheGM);
};

/**
 * Module initialization
 */
Hooks.once('init', async function () {
  console.log(
    "%c⚔️ Dorman Lakely's 5e CR Calculator %cv" +
      packageInfo.version +
      ' %c(build ' +
      buildInfo.buildNumber +
      ')',
    'color: #d32f2f; font-weight: bold; font-size: 16px;',
    'color: #ff9800; font-weight: bold; font-size: 14px;',
    'color: #ffeb3b; font-weight: normal; font-size: 12px;',
  );
});

Hooks.once('ready', async function () {
  console.log(
    "%c⚔️ Dorman Lakely's 5e CR Calculator %c✓ Ready!",
    'color: #d32f2f; font-weight: bold; font-size: 16px;',
    'color: #4caf50; font-weight: bold; font-size: 14px;',
  );

  // Expose public API for other modules
  const module = game.modules?.get('fvtt-challenge-calculator');
  if (module) {
    module.api = {
      /**
       * Calculate CR for an actor
       * @param {Actor} actor - The actor to calculate CR for
       * @param {boolean} updateActor - Whether to update the actor's CR field
       * @returns {Promise<CRCalculationResult>} The calculation result
       */
      calculateCRForActor: CRCalculatorService.calculateCRForActor.bind(CRCalculatorService),

      /**
       * Array of challenge rating data from DMG
       * @type {ChallengeRating[]}
       */
      challengeRatings,

      /**
       * Dictionary of monster features with CR weights
       * @type {Record<string, MonsterFeature>}
       */
      monsterFeatures,

      /**
       * Get monster feature names as an array
       * @returns {string[]} Array of feature names
       */
      monsterFeatureNames: Object.keys(monsterFeatures),
    };

    console.log(
      '%c⚔️ CR Calculator API %cexposed for external modules',
      'color: #d32f2f; font-weight: bold; font-size: 14px;',
      'color: #2196f3; font-weight: normal; font-size: 12px;',
    );
  }
});

/**
 * Add CR Calculator button to NPC actor sheets
 * v13 ApplicationV2 uses: render<ClassName>
 */

// Try all possible v13 hook names (including Tidy 5e sheet variants)
const hookNames = [
  'renderNPCActorSheet', // v13 ApplicationV2 name
  'renderdnd5e.NPCActorSheet', // With module prefix
  'renderActorSheet5eNPC2', // Legacy name
  'renderActorSheet', // v12 fallback
  'renderTidy5eNpcSheet', // Tidy 5e Classic NPC sheet
  'renderTidy5eNpcSheetQuadrone', // Tidy 5e Quadrone NPC sheet
];

/**
 * Inject the CR Calculator button into a sheet's header
 */
function injectCRButton(actor: any, sheetElement: HTMLElement): void {
  // Prevent duplicates at the sheet level
  if (sheetElement.querySelector('.cr-calc-button')) {
    return;
  }

  const windowHeader = sheetElement.querySelector('.window-header');
  if (!windowHeader) return;

  // Find where to insert the button - try multiple strategies
  let headerDetails: Element | null = null;
  let insertMode: 'append' | 'before' = 'append';

  // Strategy 1: v13 default header-elements container
  headerDetails = windowHeader.querySelector('.header-elements');

  // Strategy 2: Insert before the close button in the window header (works with Tidy 5e)
  if (!headerDetails) {
    const closeBtn = windowHeader.querySelector('button[data-action="close"], .close');
    if (closeBtn) {
      headerDetails = closeBtn;
      insertMode = 'before';
    }
  }

  // Strategy 3: Append to window header directly
  if (!headerDetails) {
    headerDetails = windowHeader;
  }

  // Strategy 4: v12 legacy
  if (!headerDetails) {
    headerDetails = sheetElement.querySelector('.header-details.flexrow');
  }

  if (!headerDetails) {
    return;
  }

  // Get localized tooltip text
  const tooltip = game.i18n?.localize('CR-CALC.button-calc') || 'Calculate CR';

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
      console.error("Dorman Lakely's CR Calculator | Error calculating CR", error);
      ui.notifications?.error(
        `Error calculating CR: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { permanent: true },
      );
    }
  });

  // Insert button into header
  if (insertMode === 'before') {
    headerDetails.parentElement?.insertBefore(button, headerDetails);
  } else {
    headerDetails.appendChild(button);
  }
}

/**
 * Get the full window element for an app, trying multiple strategies
 */
function getSheetElement(app: any, html: JQuery | HTMLElement | undefined): HTMLElement | null {
  // Strategy 1: Use the html parameter (v13 passes HTMLElement, v12 passes jQuery)
  let el: HTMLElement | null = html instanceof HTMLElement ? html : (html as any)?.[0] || null;

  // Strategy 2: If html doesn't have a window-header, try app.element (ApplicationV2)
  if (!el?.querySelector?.('.window-header')) {
    const appEl = app.element;
    if (appEl instanceof HTMLElement) {
      el = appEl;
    }
  }

  // Strategy 3: Walk up from the inner element to find the application window
  if (!el?.querySelector?.('.window-header') && el) {
    const windowEl = el.closest('.application') || el.closest('.app');
    if (windowEl instanceof HTMLElement) {
      el = windowEl;
    }
  }

  // Strategy 4: Look up the window by app ID in the DOM
  if (!el?.querySelector?.('.window-header') && app.id) {
    const byId = document.getElementById(`app-${app.id}`)
      || document.getElementById(app.id)
      || document.querySelector(`[data-appid="${app.id}"]`);
    if (byId instanceof HTMLElement) {
      el = byId;
    }
  }

  // Strategy 5: Search for any window with this actor's name in the title
  if (!el?.querySelector?.('.window-header')) {
    const actor = app.document || app.object || app.actor;
    if (actor?.name) {
      const allWindows = document.querySelectorAll('.application .window-header .window-title');
      for (const title of allWindows) {
        if (title.textContent?.includes(actor.name)) {
          const windowEl = title.closest('.application');
          if (windowEl instanceof HTMLElement) {
            el = windowEl;
            break;
          }
        }
      }
    }
  }

  return el || null;
}

// Standard Foundry render hooks
hookNames.forEach((hookName) => {
  Hooks.on(hookName, (app: any, html: JQuery | HTMLElement, data?: any) => {
    const actor = app.document || app.object || app.actor;
    if (!actor || !shouldShowCRButton(actor)) return;

    const sheetElement = getSheetElement(app, html);
    if (!sheetElement) return;

    injectCRButton(actor, sheetElement);
  });
});

/**
 * Scan all open application windows for NPC sheets that need the CR button.
 * Works with any sheet module (Tidy 5e, custom sheets, etc.)
 */
function scanForNPCSheets(): void {
  // v13 ApplicationV2: foundry.applications.instances is a Map<string, Application>
  // Each app's element ID matches its key in the instances map
  const instances = foundry.applications?.instances;
  if (!instances) return;

  for (const [appId, app] of (instances as Map<string, any>).entries()) {
    const actor = (app as any).document || (app as any).object || (app as any).actor;
    if (!actor || !shouldShowCRButton(actor)) continue;

    const el = (app as any).element;
    if (!(el instanceof HTMLElement)) continue;
    if (el.querySelector('.cr-calc-button')) continue;

    injectCRButton(actor, el);
  }

  // v12 fallback: check ui.windows
  if (ui.windows) {
    for (const [appId, app] of Object.entries(ui.windows) as any[]) {
      const actor = app.document || app.object || app.actor;
      if (!actor || !shouldShowCRButton(actor)) continue;

      const el = app.element instanceof HTMLElement ? app.element : app.element?.[0];
      if (!(el instanceof HTMLElement)) continue;
      if (el.querySelector('.cr-calc-button')) continue;

      injectCRButton(actor, el);
    }
  }
}

// Catch custom sheets (Tidy 5e, etc.) that don't fire standard hooks
Hooks.once('ready', () => {
  // Observe DOM for new windows being added
  new MutationObserver(() => {
    // Debounce: wait for rendering to settle
    clearTimeout((window as any).__crCalcScanTimeout);
    (window as any).__crCalcScanTimeout = setTimeout(scanForNPCSheets, 100);
  }).observe(document.body, { childList: true, subtree: true });
});
