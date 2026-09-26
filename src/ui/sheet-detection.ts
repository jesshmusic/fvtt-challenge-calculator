import { CRCalculatorDialog } from './CRCalculatorDialog.js';

/**
 * Check if the CR button should be shown for this actor
 * Shows for any NPC sheet when user is GM (supports default, Tidy 5e, and other custom sheets)
 */
export const shouldShowCRButton = (actorObject: any): boolean => {
  return actorObject?.type === 'npc' && !!(game.user?.isGM || (game.user as any)?.isTheGM);
};

/**
 * True if the app is a Foundry document sheet (ApplicationV2 DocumentSheetV2, which
 * ActorSheetV2 and Tidy 5e extend, or the legacy AppV1 DocumentSheet).
 */
const isDocumentSheet = (app: any): boolean => {
  const DocumentSheetV2 = (foundry as any).applications?.api?.DocumentSheetV2;
  const DocumentSheetV1 = (foundry as any).appv1?.api?.DocumentSheet;
  return (
    (typeof DocumentSheetV2 === 'function' && app instanceof DocumentSheetV2) ||
    (typeof DocumentSheetV1 === 'function' && app instanceof DocumentSheetV1)
  );
};

/**
 * Resolve the NPC actor for an application, but only if the app is a real actor sheet
 * the CR button belongs on. Returns null for everything else: our own
 * CRCalculatorDialog (which carries an `actor` field), item sheets owned by an NPC,
 * and any non-sheet app that happens to reference an actor.
 */
export function getSheetActor(app: any): any | null {
  if (!app || app instanceof CRCalculatorDialog) return null;
  if (!isDocumentSheet(app)) return null;

  const doc = app.document;
  if (doc?.documentName !== 'Actor') return null;

  return shouldShowCRButton(doc) ? doc : null;
}
