/**
 * Jest setup file for mocking Foundry VTT globals
 */
import { jest } from '@jest/globals';

// Mock Foundry VTT global objects
(global as any).game = {
  user: {
    id: 'test-user-id',
    isGM: true,
  },
  i18n: {
    localize: (key: string) => key,
  },
  settings: {
    get: jest.fn(),
    set: jest.fn(),
    register: jest.fn(),
  },
};

(global as any).ui = {
  notifications: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
};

(global as any).ChatMessage = {
  create: jest.fn(),
  getSpeaker: jest.fn(() => ({})),
};

(global as any).foundry = {
  utils: {
    randomID: jest.fn(() => 'test-random-id'),
  },
  applications: {
    api: {
      ApplicationV2: class ApplicationV2 {},
      HandlebarsApplicationMixin: (base: any) => base,
    },
  },
};

// Mock canvas and scene
(global as any).canvas = {
  scene: null,
  grid: {
    size: 100,
  },
};

// Helper to create mock actor
export function createMockActor(overrides: any = {}) {
  const baseActor = {
    id: 'test-actor-id',
    name: 'Test Actor',
    type: 'npc',
    system: {
      abilities: {
        str: { value: 10, mod: 0 },
        dex: { value: 10, mod: 0 },
        con: { value: 10, mod: 0 },
        int: { value: 10, mod: 0 },
        wis: { value: 10, mod: 0 },
        cha: { value: 10, mod: 0 },
      },
      attributes: {
        hp: { value: 20, max: 20 },
        ac: { value: 12 },
        spellcasting: '',
      },
      details: {
        cr: 1,
        spellLevel: 0,
      },
      traits: {
        di: { value: new Set() }, // Damage immunities
        dr: { value: new Set() }, // Damage resistances
        dv: { value: new Set() }, // Damage vulnerabilities
      },
    },
    items: [],
    update: jest.fn(),
  };

  // Deep merge overrides to ensure traits are always present
  if (overrides.system) {
    if (overrides.system.abilities) {
      baseActor.system.abilities = { ...baseActor.system.abilities, ...overrides.system.abilities };
    }
    if (overrides.system.attributes) {
      baseActor.system.attributes = {
        ...baseActor.system.attributes,
        ...overrides.system.attributes,
      };
    }
    if (overrides.system.details) {
      baseActor.system.details = { ...baseActor.system.details, ...overrides.system.details };
    }
    if (overrides.system.traits) {
      baseActor.system.traits = { ...baseActor.system.traits, ...overrides.system.traits };
    }
  }

  if (overrides.items) {
    baseActor.items = overrides.items;
  }

  return baseActor;
}

// Helper to create mock item
export function createMockItem(type: string, overrides: any = {}) {
  const baseItem = {
    id: 'test-item-id',
    name: 'Test Item',
    type,
    system: {},
  };

  if (type === 'weapon') {
    return {
      ...baseItem,
      system: {
        damage: {
          base: {
            formula: '1d8',
            types: ['slashing'],
          },
        },
        properties: new Set(),
      },
      ...overrides,
    };
  }

  if (type === 'feat') {
    return {
      ...baseItem,
      system: {
        description: {
          value: '',
        },
      },
      ...overrides,
    };
  }

  return { ...baseItem, ...overrides };
}
