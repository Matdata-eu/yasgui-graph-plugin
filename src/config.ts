/**
 * Integrator configuration for the YASGUI Graph Plugin.
 *
 * Set it for every graph view with `GraphPlugin.defaults`, or for one yasr with
 * `yasr.config.plugins.Graph.staticConfig` (use the name the plugin was registered under).
 */

export interface GraphPluginConfig {
  /**
   * Icons shown on edges when "Edge labels" is set to Icon, keyed by full predicate IRI.
   * They are added to the built-in icons and replace a built-in icon of the same predicate.
   * An empty string removes the icon of that predicate, so its prefixed IRI is shown instead.
   */
  predicateIcons: Record<string, string>;
  /**
   * Predicates whose literal value labels a node when the node label is set to Automatic.
   * The first predicate in the list that a node has wins.
   */
  labelPredicates: string[];
}

export const DEFAULT_LABEL_PREDICATES: string[] = [
  'http://www.w3.org/2000/01/rdf-schema#label',
  'http://www.w3.org/2004/02/skos/core#prefLabel',
  'http://purl.org/dc/terms/title',
  'http://purl.org/dc/elements/1.1/title',
  'http://schema.org/name',
  'https://schema.org/name',
  'http://xmlns.com/foaf/0.1/name',
  'http://www.w3.org/2004/02/skos/core#notation',
];

export function getDefaultConfig(): GraphPluginConfig {
  return { predicateIcons: {}, labelPredicates: [...DEFAULT_LABEL_PREDICATES] };
}

/**
 * Merge partial configurations over each other (later wins). `predicateIcons` are
 * merged per predicate; `labelPredicates` is replaced as a whole.
 */
export function mergeConfig(...parts: (Partial<GraphPluginConfig> | null | undefined)[]): GraphPluginConfig {
  const result = getDefaultConfig();
  for (const part of parts) {
    if (!part || typeof part !== 'object') continue;
    if (part.predicateIcons && typeof part.predicateIcons === 'object') {
      result.predicateIcons = { ...result.predicateIcons, ...part.predicateIcons };
    }
    if (Array.isArray(part.labelPredicates)) {
      result.labelPredicates = part.labelPredicates.filter((p) => typeof p === 'string' && p !== '');
    }
  }
  return result;
}
