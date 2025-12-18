import type { GraphNode, GraphEdge, RDFTriple, ThemeColors } from './types';
import { applyPrefix, truncateLabel } from './prefixUtils';
import { getNodeColor } from './colorUtils';

/**
 * Create deduplicated node map from triples
 * @param triples - RDF triples
 * @param prefixMap - Namespace to prefix mappings
 * @param themeColors - Theme-specific colors for nodes
 * @returns Map of node value to GraphNode
 */
export function createNodeMap(
  triples: RDFTriple[],
  prefixMap: Map<string, string>,
  themeColors: ThemeColors
): Map<string, GraphNode> {
  const nodeMap = new Map<string, GraphNode>();
  let nodeId = 1;
  
  triples.forEach((triple) => {
    // Add subject node
    if (!nodeMap.has(triple.subject)) {
      const isBlankNode = triple.subject.startsWith('_:');
      const label = isBlankNode
        ? triple.subject
        : truncateLabel(applyPrefix(triple.subject, prefixMap));
      
      nodeMap.set(triple.subject, {
        id: nodeId++,
        uri: triple.subject,
        label: label,
        color: getNodeColor({ uri: triple.subject, type: 'uri' }, triples, themeColors),
        type: 'uri',
        fullValue: triple.subject,
        title: isBlankNode ? triple.subject : applyPrefix(triple.subject, prefixMap),
      });
    }
    
    // Add object node
    const objValue = triple.object.value;
    if (!nodeMap.has(objValue)) {
      const isLiteral = triple.object.type === 'literal';
      const isBlankNode = !isLiteral && objValue.startsWith('_:');
      
      let label: string;
      let fullValue: string;
      let title: string;
      
      if (isLiteral) {
        label = truncateLabel(objValue);
        fullValue = objValue;
        title = triple.object.datatype
          ? `"${objValue}"^^${applyPrefix(triple.object.datatype, prefixMap)}`
          : `"${objValue}"`;
      } else if (isBlankNode) {
        label = objValue;
        fullValue = objValue;
        title = objValue;
      } else {
        label = truncateLabel(applyPrefix(objValue, prefixMap));
        fullValue = objValue;
        title = applyPrefix(objValue, prefixMap);
      }
      
      nodeMap.set(objValue, {
        id: nodeId++,
        uri: isLiteral ? null : objValue,
        label: label,
        color: getNodeColor(
          { uri: objValue, type: isLiteral ? 'literal' : 'uri' },
          triples,
          themeColors
        ),
        type: isLiteral ? 'literal' : 'uri',
        fullValue: fullValue,
        title: title,
      });
    }
  });
  
  return nodeMap;
}

/**
 * Create edges array from triples
 * @param triples - RDF triples
 * @param nodeMap - Map of node values to GraphNodes
 * @param prefixMap - Namespace to prefix mappings
 * @returns Array of GraphEdge objects
 */
export function createEdgesArray(
  triples: RDFTriple[],
  nodeMap: Map<string, GraphNode>,
  prefixMap: Map<string, string>
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // For deduplication
  
  triples.forEach((triple) => {
    const fromNode = nodeMap.get(triple.subject);
    const toNode = nodeMap.get(triple.object.value);
    
    if (!fromNode || !toNode) return;
    
    // Create unique edge identifier for deduplication
    const edgeKey = `${fromNode.id}-${triple.predicate}-${toNode.id}`;
    
    if (!edgeSet.has(edgeKey)) {
      edgeSet.add(edgeKey);
      
      edges.push({
        id: `edge_${fromNode.id}_${toNode.id}_${edges.length}`,
        from: fromNode.id,
        to: toNode.id,
        label: truncateLabel(applyPrefix(triple.predicate, prefixMap)),
        predicate: triple.predicate,
        title: applyPrefix(triple.predicate, prefixMap),
        arrows: 'to',
      });
    }
  });
  
  return edges;
}

/**
 * Transform RDF triples to graph data structure
 * @param triples - RDF triples
 * @param prefixMap - Namespace to prefix mappings
 * @param themeColors - Theme-specific colors for nodes
 * @returns Object with nodes and edges arrays
 */
export function triplesToGraph(
  triples: RDFTriple[],
  prefixMap: Map<string, string>,
  themeColors: ThemeColors
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeMap = createNodeMap(triples, prefixMap, themeColors);
  const edges = createEdgesArray(triples, nodeMap, prefixMap);
  const nodes = Array.from(nodeMap.values());
  
  return { nodes, edges };
}
