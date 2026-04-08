/**
 * Settings menu entries for the CR Calculator module.
 *
 * These ApplicationV2 stubs render an invisible host element and immediately
 * open a DialogV2 prompt that links out to Patreon or Dungeon Master Guru.
 * Foundry's settings menu system requires an Application class as the `type`,
 * so we use these one-shot dialogs as the entry point.
 */

const { ApplicationV2 } = (foundry as any).applications.api;
const DialogV2 = (foundry as any).applications.api.DialogV2;

export class PatreonLink extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: 'cr-calculator-patreon-link',
    classes: [],
    tag: 'div',
    window: {
      title: 'Support on Patreon',
      icon: 'fab fa-patreon',
    },
    position: { width: 1, height: 1 },
  };

  async _renderHTML(): Promise<HTMLElement> {
    return document.createElement('div');
  }

  _replaceHTML(result: HTMLElement, content: HTMLElement): void {
    content.replaceChildren(result);
  }

  async _onFirstRender(_context: unknown, _options: unknown): Promise<void> {
    this.element?.style?.setProperty('display', 'none');

    await DialogV2.prompt({
      window: { title: 'Support on Patreon' },
      content: '<p>Open the Patreon page in a new tab.</p>',
      ok: {
        label: '<i class="fab fa-patreon"></i> Visit Patreon',
        callback: () => {
          window.open('https://patreon.com/jesshmusic', '_blank', 'noopener,noreferrer');
        },
      },
    });

    this.close();
  }
}

export class DmGuruLink extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: 'cr-calculator-dmguru-link',
    classes: [],
    tag: 'div',
    window: {
      title: 'Dungeon Master Guru',
      icon: 'fas fa-dragon',
    },
    position: { width: 1, height: 1 },
  };

  async _renderHTML(): Promise<HTMLElement> {
    return document.createElement('div');
  }

  _replaceHTML(result: HTMLElement, content: HTMLElement): void {
    content.replaceChildren(result);
  }

  async _onFirstRender(_context: unknown, _options: unknown): Promise<void> {
    this.element?.style?.setProperty('display', 'none');

    await DialogV2.prompt({
      window: { title: 'Dungeon Master Guru' },
      content: '<p>Open the Dungeon Master Guru site in a new tab.</p>',
      ok: {
        label: '<i class="fas fa-dragon"></i> Visit Dungeon Master Guru',
        callback: () => {
          window.open('https://dungeonmaster.guru', '_blank', 'noopener,noreferrer');
        },
      },
    });

    this.close();
  }
}
