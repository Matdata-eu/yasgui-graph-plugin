import type { Yasr } from './types';

/**
 * Extract namespace prefixes from SPARQL results metadata or YASR instance
 * @param yasr - YASR instance
 * @returns Map of namespace URI to prefix
 */
export function extractPrefixes(yasr: Yasr): Map<string, string> {
  const prefixMap = new Map<string, string>();
  
  // Try to get prefixes from YASR instance
  if (yasr && yasr.getPrefixes) {
    const prefixes = yasr.getPrefixes();
    if (prefixes && typeof prefixes === 'object') {
      Object.entries(prefixes).forEach(([prefix, uri]) => {
        if (uri && prefix) {
          prefixMap.set(uri, prefix);
        }
      });
    }
  }  
  
  // Add common RDF prefixes as fallback
  const commonPrefixes: Record<string, string> = {
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf',
    'http://www.w3.org/2000/01/rdf-schema#': 'rdfs',
    'http://www.w3.org/2001/XMLSchema#': 'xsd',
    'http://www.w3.org/2002/07/owl#': 'owl',
  };
  
  Object.entries(commonPrefixes).forEach(([uri, prefix]) => {
    if (!prefixMap.has(uri)) {
      prefixMap.set(uri, prefix);
    }
  });
  
  return prefixMap;
}

/**
 * Convert full URI to prefixed form
 * @param uri - Full URI
 * @param prefixMap - Namespace to prefix mappings
 * @returns Prefixed URI (e.g., "ex:Person") or original if no match
 */
export function applyPrefix(uri: string, prefixMap: Map<string, string>): string {
  if (!uri || typeof uri !== 'string') return uri;
  
  for (const [namespace, prefix] of prefixMap.entries()) {
    if (uri.startsWith(namespace)) {
      const localName = uri.substring(namespace.length);
      return `${prefix}:${localName}`;
    }
  }
  
  return uri;
}

/**
 * Truncate long labels with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation (default: 50)
 * @returns Truncated text with ellipsis if needed
 */
export function truncateLabel(text: string, maxLength: number = 50): string {
  if (!text || typeof text !== 'string') return text;
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}
