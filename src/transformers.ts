import type { GraphNode, GraphEdge, RDFTriple, ThemeColors } from './types';
import { applyPrefix, truncateLabel } from './prefixUtils';
import { getNodeColor } from './colorUtils';
import { getPredicateIcon } from './predicateIcons';
import type { GraphPluginSettings } from './settings';

export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const SCHEMA_IMAGE = 'https://schema.org/image';
export const SCHEMA_ICON = 'https://schema.org/icon';
export const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
export const RDFS_SUBCLASSOF = 'http://www.w3.org/2000/01/rdf-schema#subClassOf';

/** Predicates that supply node visuals or labels; their object nodes and edges are suppressed */
const VISUAL_PREDICATES = new Set([SCHEMA_IMAGE, SCHEMA_ICON, RDFS_LABEL]);

/**
 * Get the rdfs:label value for a URI node.
 * @param uri - Node URI to look up
 * @param triples - All RDF triples
 * @returns The label string, or undefined if not found
 */
export function getRdfsLabel(uri: string, triples: RDFTriple[]): string | undefined {
  const labelTriple = triples.find((t) => t.subject === uri && t.predicate === RDFS_LABEL);
  return labelTriple?.object.value;
}

/**
 * Get the schema:image or schema:icon visual value for a URI node.
 * schema:icon takes priority over schema:image.
 * @param uri - Node URI to look up
 * @param triples - All RDF triples
 * @returns Object with either an icon string, an image URL, or neither
 */
export function getNodeVisual(uri: string, triples: RDFTriple[]): { image?: string; icon?: string } {
  const iconTriple = triples.find((t) => t.subject === uri && t.predicate === SCHEMA_ICON);
  if (iconTriple) return { icon: iconTriple.object.value };
  const imageTriple = triples.find((t) => t.subject === uri && t.predicate === SCHEMA_IMAGE);
  if (imageTriple) return { image: imageTriple.object.value };
  return {};
}

/**
 * Resolve the visual (image/icon) for a node in compact mode using a three-level priority:
 *  1. The resource's own schema:image / schema:icon (highest priority)
 *  2. The schema:image / schema:icon of each rdf:type class
 *  3. The schema:image / schema:icon of rdfs:subClassOf superclasses (one level)
 * @param uri - Subject URI
 * @param triples - All RDF triples
 * @returns Resolved visual, or empty object if none found
 */
export function resolveCompactVisual(uri: string, triples: RDFTriple[]): { image?: string; icon?: string } {
  // 1. Own visual
  const own = getNodeVisual(uri, triples);
  if (own.icon || own.image) return own;

  const typeUris = triples
    .filter((t) => t.subject === uri && t.predicate === RDF_TYPE)
    .map((t) => t.object.value);

  // 2. Direct class visuals
  for (const typeUri of typeUris) {
    const classVisual = getNodeVisual(typeUri, triples);
    if (classVisual.icon || classVisual.image) return classVisual;
  }

  // 3. Superclass visuals (one rdfs:subClassOf hop)
  for (const typeUri of typeUris) {
    const superClassUris = triples
      .filter((t) => t.subject === typeUri && t.predicate === RDFS_SUBCLASSOF)
      .map((t) => t.object.value);
    for (const superClassUri of superClassUris) {
      const superVisual = getNodeVisual(superClassUri, triples);
      if (superVisual.icon || superVisual.image) return superVisual;
    }
  }

  return {};
}

/**
 * Append extra HTML rows to an existing tooltip HTML string.
 * @param title - Existing tooltip HTML
 * @param rows - Additional HTML rows to append
 * @returns Updated tooltip HTML
 */
function appendTooltipRows(title: string, rows: string): string {
  const closingTag = '</div>';
  const idx = title.lastIndexOf(closingTag);
  if (idx === -1) return title + rows;
  return title.slice(0, idx) + rows + closingTag;
}

/**
 * Build a tooltip row for a schema:image or schema:icon visual value.
 * @param key - Row label ('Image' or 'Icon')
 * @param value - The value to display
 * @returns HTML row string
 */
function buildVisualTooltipRow(key: string, value: string): string {
  return `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">${escapeHtml(key)}</span><span class="yasgui-tooltip-val">${escapeHtml(value)}</span></div>`;
}

/**
 * Escape HTML special characters to prevent XSS in tooltip content
 * @param str - Raw string to escape
 * @returns HTML-escaped string
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build an HTML tooltip for a URI or blank node in compact mode.
 * Includes the full URI/identifier, all rdf:type values, and all datatype (literal) properties.
 * @param uri - Full URI or blank node identifier
 * @param triples - All RDF triples (used to look up type and literal properties)
 * @param prefixMap - Namespace to prefix mappings
 * @returns HTML string for use as vis-network title
 */
function createCompactNodeTooltipHTML(
  uri: string,
  triples: RDFTriple[],
  prefixMap: Map<string, string>
): string {
  const isBlankNode = uri.startsWith('_:');

  let rows = `<div class="yasgui-tooltip-type">${isBlankNode ? 'Blank Node' : 'URI'}</div>`;
  rows += `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">${isBlankNode ? 'Identifier' : 'Full URI'}</span><span class="yasgui-tooltip-val">${escapeHtml(uri)}</span></div>`;

  // rdf:type values
  triples
    .filter((t) => t.subject === uri && t.predicate === RDF_TYPE)
    .forEach((t) => {
      const typeLabel = applyPrefix(t.object.value, prefixMap);
      rows += `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">rdf:type</span><span class="yasgui-tooltip-val">${escapeHtml(typeLabel)}</span></div>`;
    });

  // Datatype (literal) properties
  triples
    .filter((t) => t.subject === uri && t.object.type === 'literal')
    .forEach((t) => {
      const predLabel = applyPrefix(t.predicate, prefixMap);
      rows += `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">${escapeHtml(predLabel)}</span><span class="yasgui-tooltip-val">${escapeHtml(t.object.value)}</span></div>`;
    });

  return `<div class="yasgui-graph-tooltip">${rows}</div>`;
}

/**
 * Build an HTML tooltip string for a graph node
 * @param nodeType - 'uri', 'literal', or 'bnode'
 * @param value - Full value of the node
 * @param datatype - Datatype URI for literals (optional)
 * @param lang - Language tag for literals (optional)
 * @param prefixMap - Namespace to prefix mappings for datatype display
 * @returns HTML string for use as vis-network title
 */
function createNodeTooltipHTML(
  nodeType: 'uri' | 'literal' | 'bnode',
  value: string,
  datatype?: string,
  lang?: string,
  prefixMap?: Map<string, string>
): string {
  const typeLabel = nodeType === 'uri' ? 'URI' : nodeType === 'literal' ? 'Literal' : 'Blank Node';

  let rows = `<div class="yasgui-tooltip-type">${typeLabel}</div>`;

  if (nodeType === 'literal') {
    rows += `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">Value</span><span class="yasgui-tooltip-val">${escapeHtml(value)}</span></div>`;
    if (datatype) {
      const dtLabel = prefixMap ? applyPrefix(datatype, prefixMap) : datatype;
      rows += `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">Datatype</span><span class="yasgui-tooltip-val">${escapeHtml(dtLabel)}</span></div>`;
    }
    if (lang) {
      rows += `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">Language</span><span class="yasgui-tooltip-val">${escapeHtml(lang)}</span></div>`;
    }
  } else if (nodeType === 'uri') {
    rows += `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">Full URI</span><span class="yasgui-tooltip-val">${escapeHtml(value)}</span></div>`;
  } else if (nodeType === 'bnode') {
    rows += `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">Identifier</span><span class="yasgui-tooltip-val">${escapeHtml(value)}</span></div>`;
  }

  return `<div class="yasgui-graph-tooltip">${rows}</div>`;
}

/**
 * Build an HTML tooltip string for a graph edge (predicate)
 * @param predicateUri - Full predicate URI
 * @returns HTML string for use as vis-network title
 */
function createEdgeTooltipHTML(predicateUri: string): string {
  const rows =
    `<div class="yasgui-tooltip-type">Predicate</div>` +
    `<div class="yasgui-tooltip-row"><span class="yasgui-tooltip-key">Full URI</span><span class="yasgui-tooltip-val">${escapeHtml(predicateUri)}</span></div>`;
  return `<div class="yasgui-graph-tooltip">${rows}</div>`;
}

/**
 * Create deduplicated node map from triples
 * @param triples - RDF triples
 * @param prefixMap - Namespace to prefix mappings
 * @param themeColors - Theme-specific colors for nodes
 * @param settings - Optional plugin settings for node sizing
 * @returns Map of node value to GraphNode
 */
export function createNodeMap(
  triples: RDFTriple[],
  prefixMap: Map<string, string>,
  themeColors: ThemeColors,
  settings?: Partial<GraphPluginSettings>
): Map<string, GraphNode> {
  const nodeMap = new Map<string, GraphNode>();
  let nodeId = 1;
  
  // Calculate size multiplier based on settings
  // medium (default) = 1x, small = 0.5x, large = 2x
  const sizeMultiplier = settings?.nodeSize === 'small' ? 0.5 : settings?.nodeSize === 'large' ? 2 : 1;
  
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
        size: 10 * sizeMultiplier,
        title: createNodeTooltipHTML(
          isBlankNode ? 'bnode' : 'uri',
          triple.subject,
          undefined,
          undefined,
          prefixMap
        ),
      });
    }
    
    // Add object node (skip for visual predicates – their values become node visuals, not nodes)
    const objValue = triple.object.value;
    if (!nodeMap.has(objValue) && !VISUAL_PREDICATES.has(triple.predicate)) {
      const isLiteral = triple.object.type === 'literal';
      const isBlankNode = !isLiteral && objValue.startsWith('_:');
      
      let label: string;
      let fullValue: string;
      let title: string;
      
      if (isLiteral) {
        label = truncateLabel(objValue);
        fullValue = objValue;
        title = createNodeTooltipHTML(
          'literal',
          objValue,
          triple.object.datatype,
          triple.object.lang,
          prefixMap
        );
      } else if (isBlankNode) {
        label = objValue;
        fullValue = objValue;
        title = createNodeTooltipHTML('bnode', objValue);
      } else {
        label = truncateLabel(applyPrefix(objValue, prefixMap));
        fullValue = objValue;
        title = createNodeTooltipHTML('uri', objValue, undefined, undefined, prefixMap);
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
        size: (isLiteral ? 5 : 10) * sizeMultiplier,
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
 * @param settings - Optional plugin settings
 * @returns Array of GraphEdge objects
 */
export function createEdgesArray(
  triples: RDFTriple[],
  nodeMap: Map<string, GraphNode>,
  prefixMap: Map<string, string>,
  settings?: Partial<GraphPluginSettings>
): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // For deduplication
  
  triples.forEach((triple) => {
    // Skip visual predicates – they define node appearance, not graph edges
    if (VISUAL_PREDICATES.has(triple.predicate)) return;

    const fromNode = nodeMap.get(triple.subject);
    const toNode = nodeMap.get(triple.object.value);
    
    if (!fromNode || !toNode) return;
    
    // Create unique edge identifier for deduplication
    const edgeKey = `${fromNode.id}-${triple.predicate}-${toNode.id}`;
    
    if (!edgeSet.has(edgeKey)) {
      edgeSet.add(edgeKey);

      // Determine edge label based on predicateDisplay setting
      let edgeLabel: string;
      const predicateDisplay = settings?.predicateDisplay ?? 'label';
      if (predicateDisplay === 'none') {
        edgeLabel = '';
      } else if (predicateDisplay === 'icon') {
        edgeLabel = getPredicateIcon(triple.predicate) ?? truncateLabel(applyPrefix(triple.predicate, prefixMap));
      } else {
        edgeLabel = truncateLabel(applyPrefix(triple.predicate, prefixMap));
      }

      edges.push({
        id: `edge_${fromNode.id}_${toNode.id}_${edges.length}`,
        from: fromNode.id,
        to: toNode.id,
        label: edgeLabel,
        predicate: triple.predicate,
        title: createEdgeTooltipHTML(triple.predicate),
        arrows: 'to',
      });
    }
  });
  
  return edges;
}

/**
 * Determine whether a node should be shown according to current filter settings.
 * @param node - Graph node
 * @param triples - All RDF triples (used to detect class nodes)
 * @param settings - Plugin settings
 */
function isNodeVisible(
  node: GraphNode,
  triples: RDFTriple[],
  settings: Partial<GraphPluginSettings>
): boolean {
  // Blank nodes are always visible
  if (node.uri && node.uri.startsWith('_:')) {
    return true;
  }
  if (!settings.compactMode) {
    return true;
  }
  // In compact mode: hide literal nodes
  if (node.type === 'literal') {
    return false;
  }
  // In compact mode: hide class nodes (objects of rdf:type triples)
  const isClass = triples.some(
    (t) =>
      t.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
      t.object.value === node.uri
  );
  if (isClass) {
    return false;
  }
  return true;
}

/**
 * Transform RDF triples to graph data structure
 * @param triples - RDF triples
 * @param prefixMap - Namespace to prefix mappings
 * @param themeColors - Theme-specific colors for nodes
 * @param settings - Optional plugin settings
 * @returns Object with nodes and edges arrays
 */
export function triplesToGraph(
  triples: RDFTriple[],
  prefixMap: Map<string, string>,
  themeColors: ThemeColors,
  settings?: Partial<GraphPluginSettings>
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodeMap = createNodeMap(triples, prefixMap, themeColors, settings);

  // Calculate size multiplier for icon font sizing
  const sizeMultiplier = settings?.nodeSize === 'small' ? 0.5 : settings?.nodeSize === 'large' ? 2 : 1;
  
  // In compact mode, enhance subject node tooltips with rdf:type and literal properties
  if (settings?.compactMode) {
    const subjects = new Set(triples.map((t) => t.subject));
    subjects.forEach((subjectUri) => {
      const node = nodeMap.get(subjectUri);
      if (node) {
        node.title = createCompactNodeTooltipHTML(subjectUri, triples, prefixMap);
      }
    });
  }

  // Apply schema:image / schema:icon visuals to nodes.
  // In compact mode also inherit visuals from rdf:type classes and rdfs:subClassOf superclasses.
  nodeMap.forEach((node) => {
    if (!node.uri || node.type === 'literal') return;

    const visual = settings?.compactMode
      ? resolveCompactVisual(node.uri, triples)
      : getNodeVisual(node.uri, triples);

    // Get rdfs:label if present
    const rdfsLabel = getRdfsLabel(node.uri, triples);
    
    if (visual.icon) {
      node.shape = 'text';
      // Show icon with rdfs:label underneath if available
      node.label = rdfsLabel ? `${visual.icon}\n${rdfsLabel}` : visual.icon;
      // Icon nodes must always be visible regardless of showNodeLabels setting
      // Scale icon size based on nodeSize setting (base size: 24)
      node.font = { size: 24 * sizeMultiplier };
      if (!settings?.compactMode) {
        node.title = appendTooltipRows(node.title, buildVisualTooltipRow('Icon', visual.icon));
      }
    } else if (visual.image) {
      node.shape = 'circularImage';
      node.image = visual.image;
      // For images, show rdfs:label as the text label if available
      if (rdfsLabel) {
        node.label = rdfsLabel;
      }
      if (!settings?.compactMode) {
        node.title = appendTooltipRows(node.title, buildVisualTooltipRow('Image', visual.image));
      }
    } else if (rdfsLabel) {
      // No visual but has rdfs:label - use it as the label
      node.label = rdfsLabel;
    }
    
    // Add rdfs:label to tooltip in non-compact mode (in compact mode it's already included)
    if (rdfsLabel && !settings?.compactMode) {
      node.title = appendTooltipRows(node.title, buildVisualTooltipRow('rdfs:label', rdfsLabel));
    }
  });

  // Filter nodes based on settings
  const visibleNodeIds = new Set<number>();
  nodeMap.forEach((node) => {
    if (!settings || isNodeVisible(node, triples, settings)) {
      visibleNodeIds.add(node.id);
    }
  });

  const edges = createEdgesArray(triples, nodeMap, prefixMap, settings)
    // Only include edges where both endpoints are visible
    .filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to));

  const nodes = Array.from(nodeMap.values()).filter((n) => visibleNodeIds.has(n.id));

  return { nodes, edges };
}
