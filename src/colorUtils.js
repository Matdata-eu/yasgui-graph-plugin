/**
 * Determine node color based on type and predicates
 * @param {Object} node - Node object with uri, type properties
 * @param {Array} triples - All RDF triples for context
 * @returns {string} Hex color code
 */
function getNodeColor(node, triples) {
  // Blank nodes: light grey
  if (node.uri && node.uri.startsWith('_:')) {
    return '#c5c5c5ff';
  }
  
  // Literals: light green
  if (node.type === 'literal') {
    return '#a6c8a6ff';
  }
  
  // Check if node is object of rdf:type predicate: orange
  const isTypeObject = triples.some(
    (triple) =>
      triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
      triple.object.value === node.uri
  );
  
  if (isTypeObject) {
    return '#e15b13ff';
  }
  
  // Other URIs: light blue
  return '#97C2FC';
}

export {
  getNodeColor,
};
