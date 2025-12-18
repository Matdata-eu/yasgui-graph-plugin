import type { GraphNode, RDFTriple, ThemeColors } from './types';

/**
 * Determine node color based on type and predicates
 * @param node - Node object with uri, type properties
 * @param triples - All RDF triples for context
 * @param themeColors - Theme-specific colors
 * @returns Hex color code
 */
export function getNodeColor(
  node: Pick<GraphNode, 'uri' | 'type'>,
  triples: RDFTriple[],
  themeColors: ThemeColors
): string {
  // Blank nodes
  if (node.uri && node.uri.startsWith('_:')) {
    return themeColors.blankNode;
  }
  
  // Literals
  if (node.type === 'literal') {
    return themeColors.literal;
  }
  
  // Check if node is object of rdf:type predicate
  const isTypeObject = triples.some(
    (triple) =>
      triple.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
      triple.object.value === node.uri
  );
  
  if (isTypeObject) {
    return themeColors.typeObject;
  }
  
  // Other URIs
  return themeColors.uri;
}
