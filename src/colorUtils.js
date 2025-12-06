/**
 * Determine node color based on type and predicates
 * @param {Object} node - Node object with uri, type properties
 * @param {Array} triples - All RDF triples for context
 * @returns {string} Hex color code
 */
function getNodeColor(node, triples) {
  // Blank nodes: yellow
  if (node.uri && node.uri.startsWith('_:')) {
    return '#e15b13ff';
  }
  
  // Literals: grey
  if (node.type === 'literal') {
    return '#c5c5c5ff';
  }
  
  // Check if node is object of rdf:type predicate: green
  const isTypeObject = triples.some(
    (triple) =>
      triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
      triple.object.value === node.uri
  );
  
  if (isTypeObject) {
    return '#a6c8a6ff';
  }
  
  // Other URIs: blue
  return '#97C2FC';
}

export {
  getNodeColor,
};
