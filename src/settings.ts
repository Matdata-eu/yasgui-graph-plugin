/**
 * Settings management for the YASGUI Graph Plugin
 * Handles persistence via localStorage and provides default values
 */

export interface GraphPluginSettings {
  /** Edge rendering style: smooth curves or straight lines */
  edgeStyle: 'curved' | 'straight';
  /** Show literal value nodes (strings, numbers, dates, …) */
  showLiterals: boolean;
  /** Show class nodes (objects of rdf:type triples) */
  showClasses: boolean;
  /** Show blank nodes */
  showBlankNodes: boolean;
  /** How predicates are displayed on edges: full prefixed label, short icon, or hidden */
  predicateDisplay: 'label' | 'icon' | 'none';
  /** Render text labels inside nodes */
  showNodeLabels: boolean;
  /** Keep physics simulation running so nodes keep adjusting */
  physicsEnabled: boolean;
  /** Visual size of nodes */
  nodeSize: 'small' | 'medium' | 'large';
}

export const DEFAULT_SETTINGS: GraphPluginSettings = {
  edgeStyle: 'curved',
  showLiterals: true,
  showClasses: true,
  showBlankNodes: true,
  predicateDisplay: 'label',
  showNodeLabels: true,
  physicsEnabled: true,
  nodeSize: 'medium',
};

const STORAGE_KEY = 'yasgui-graph-plugin-settings';

/**
 * Load persisted settings from localStorage, merged with defaults
 */
export function loadSettings(): GraphPluginSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Storage unavailable or corrupt – fall through to defaults
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Persist settings to localStorage
 */
export function saveSettings(settings: GraphPluginSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable – silently ignore
  }
}
