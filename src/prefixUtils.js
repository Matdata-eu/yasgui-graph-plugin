/**
 * Extract namespace prefixes from SPARQL results metadata
 * @param {Object} yasrResults - YASR results object
 * @returns {Map<string, string>} Map of namespace URI to prefix
 */
function extractPrefixes(yasrResults) {
  const prefixMap = new Map();
  
  // Check for prefixes in results metadata
  if (yasrResults && yasrResults.getVariables) {
    const vars = yasrResults.getVariables();
    if (vars && vars.prefixes) {
      Object.entries(vars.prefixes).forEach(([prefix, uri]) => {
        prefixMap.set(uri, prefix);
      });
    }
  }
  
  // Add common RDF prefixes as fallback
  const commonPrefixes = {
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
 * @param {string} uri - Full URI
 * @param {Map<string, string>} prefixMap - Namespace to prefix mappings
 * @returns {string} Prefixed URI (e.g., "ex:Person") or original if no match
 */
function applyPrefix(uri, prefixMap) {
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
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation (default: 50)
 * @returns {string} Truncated text with ellipsis if needed
 */
function truncateLabel(text, maxLength = 50) {
  if (!text || typeof text !== 'string') return text;
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

export {
  extractPrefixes,
  applyPrefix,
  truncateLabel,
};
