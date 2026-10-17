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

/** vis-network node colour object */
export interface VisNodeColor {
  background: string;
  border: string;
  highlight: { background: string; border: string };
  hover: { background: string; border: string };
}

/**
 * Expand a flat node colour into a vis-network colour object whose selected
 * (highlighted) state uses the theme highlight colour (amber).
 * Without a highlight colour the flat colour is returned unchanged, so vis-network
 * keeps deriving the selected state itself (previous behaviour).
 * @param color - Flat node colour from getNodeColor()
 * @param highlight - Highlight colour, e.g. ThemeColors.highlight
 */
export function withHighlightColor(color: string, highlight?: string): string | VisNodeColor {
  if (!highlight || typeof color !== 'string') return color;
  return {
    background: color,
    border: color,
    highlight: { background: highlight, border: highlight },
    hover: { background: color, border: color },
  };
}
