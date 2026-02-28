import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../src/settings';
import type { GraphPluginSettings } from '../src/settings';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

const STORAGE_KEY = 'yasgui-graph-plugin-settings';

beforeEach(() => {
  localStorageMock.clear();
});

describe('DEFAULT_SETTINGS', () => {
  it('uses curved edges by default', () => {
    expect(DEFAULT_SETTINGS.edgeStyle).toBe('curved');
  });

  it('shows all node types by default', () => {
    expect(DEFAULT_SETTINGS.showLiterals).toBe(true);
    expect(DEFAULT_SETTINGS.showClasses).toBe(true);
    expect(DEFAULT_SETTINGS.showBlankNodes).toBe(true);
  });

  it('uses label mode for predicate display by default', () => {
    expect(DEFAULT_SETTINGS.predicateDisplay).toBe('label');
  });

  it('shows node labels by default', () => {
    expect(DEFAULT_SETTINGS.showNodeLabels).toBe(true);
  });

  it('enables physics by default', () => {
    expect(DEFAULT_SETTINGS.physicsEnabled).toBe(true);
  });

  it('uses medium node size by default', () => {
    expect(DEFAULT_SETTINGS.nodeSize).toBe('medium');
  });
});

describe('loadSettings', () => {
  it('returns DEFAULT_SETTINGS when localStorage is empty', () => {
    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('merges stored values with defaults', () => {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ edgeStyle: 'straight' }));
    const settings = loadSettings();
    expect(settings.edgeStyle).toBe('straight');
    // Other fields should keep their defaults
    expect(settings.showLiterals).toBe(DEFAULT_SETTINGS.showLiterals);
  });

  it('returns defaults when localStorage contains invalid JSON', () => {
    localStorageMock.setItem(STORAGE_KEY, 'not-valid-json{');
    const settings = loadSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });
});

describe('saveSettings', () => {
  it('persists settings to localStorage', () => {
    const modified: GraphPluginSettings = { ...DEFAULT_SETTINGS, edgeStyle: 'straight', nodeSize: 'large' };
    saveSettings(modified);
    const raw = localStorageMock.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw as string);
    expect(parsed.edgeStyle).toBe('straight');
    expect(parsed.nodeSize).toBe('large');
  });

  it('round-trips all fields correctly', () => {
    const modified: GraphPluginSettings = {
      edgeStyle: 'straight',
      showLiterals: false,
      showClasses: false,
      showBlankNodes: false,
      predicateDisplay: 'icon',
      showNodeLabels: false,
      physicsEnabled: false,
      nodeSize: 'small',
    };
    saveSettings(modified);
    const loaded = loadSettings();
    expect(loaded).toEqual(modified);
  });
});
