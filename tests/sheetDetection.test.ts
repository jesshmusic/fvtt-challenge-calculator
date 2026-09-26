import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { getSheetActor } from '../src/ui/sheet-detection';
import { CRCalculatorDialog } from '../src/ui/CRCalculatorDialog';
import { createMockActor } from './setup';

class DocumentSheetV2 {
  document: any;
  constructor(document?: any) {
    this.document = document;
  }
}
class LegacyDocumentSheet {
  constructor(public object?: any) {}
  get document() {
    return this.object;
  }
}

const npc = () => ({ ...createMockActor(), documentName: 'Actor' });

describe('getSheetActor', () => {
  const g = global as any;

  beforeAll(() => {
    g.foundry.applications.api.DocumentSheetV2 = DocumentSheetV2;
    g.foundry.appv1 = { api: { DocumentSheet: LegacyDocumentSheet } };
  });

  afterAll(() => {
    delete g.foundry.applications.api.DocumentSheetV2;
    delete g.foundry.appv1;
  });

  test('returns the NPC for an ApplicationV2 actor sheet', () => {
    const actor = npc();
    expect(getSheetActor(new DocumentSheetV2(actor))).toBe(actor);
  });

  test('returns the NPC for a legacy AppV1 actor sheet', () => {
    const actor = npc();
    expect(getSheetActor(new LegacyDocumentSheet(actor))).toBe(actor);
  });

  test('ignores the CRCalculatorDialog even though it carries an NPC actor', () => {
    const dialog = new CRCalculatorDialog({} as any, npc());
    expect(getSheetActor(dialog)).toBeNull();
  });

  test('ignores non-sheet apps that reference an actor', () => {
    expect(getSheetActor({ actor: npc(), document: npc() })).toBeNull();
  });

  test('ignores item sheets owned by an NPC', () => {
    const item = { documentName: 'Item', type: 'npc', actor: npc() };
    expect(getSheetActor(new DocumentSheetV2(item))).toBeNull();
  });

  test('ignores non-NPC actor sheets', () => {
    const pc = { ...npc(), type: 'character' };
    expect(getSheetActor(new DocumentSheetV2(pc))).toBeNull();
  });

  test('ignores NPC sheets for non-GM users', () => {
    const user = g.game.user;
    g.game.user = { id: 'player', isGM: false };
    try {
      expect(getSheetActor(new DocumentSheetV2(npc()))).toBeNull();
    } finally {
      g.game.user = user;
    }
  });
});
