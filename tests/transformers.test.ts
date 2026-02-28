import { createNodeMap, createEdgesArray, triplesToGraph } from '../src/transformers';
import type { RDFTriple, ThemeColors } from '../src/types';

const themeColors: ThemeColors = {
  blankNode: '#888888',
  literal: '#a6c8a6ff',
  typeObject: '#e15b13ff',
  uri: '#97C2FC',
  background: '#ffffff',
  text: '#000000',
  edge: '#cccccc',
  edgeLabel: '#666666',
  edgeLabelBackground: 'rgba(255,255,255,0.8)',
};

const prefixMap = new Map([['http://example.org/', 'ex']]);

const sampleTriples: RDFTriple[] = [
  {
    subject: 'http://example.org/alice',
    predicate: 'http://example.org/knows',
    object: { value: 'http://example.org/bob', type: 'uri' },
  },
  {
    subject: 'http://example.org/alice',
    predicate: 'http://example.org/name',
    object: { value: 'Alice', type: 'literal' },
  },
];

describe('createNodeMap', () => {
  it('creates a node for each unique subject and object', () => {
    const nodeMap = createNodeMap(sampleTriples, prefixMap, themeColors);
    expect(nodeMap.has('http://example.org/alice')).toBe(true);
    expect(nodeMap.has('http://example.org/bob')).toBe(true);
    expect(nodeMap.has('Alice')).toBe(true);
  });

  it('deduplicates nodes that appear in multiple triples', () => {
    const triples: RDFTriple[] = [
      ...sampleTriples,
      {
        subject: 'http://example.org/alice',
        predicate: 'http://example.org/age',
        object: { value: '30', type: 'literal' },
      },
    ];
    const nodeMap = createNodeMap(triples, prefixMap, themeColors);
    // alice, bob, Alice, 30 → 4 unique nodes
    expect(nodeMap.size).toBe(4);
  });

  it('assigns a prefixed label to URI nodes in known namespaces', () => {
    const nodeMap = createNodeMap(sampleTriples, prefixMap, themeColors);
    expect(nodeMap.get('http://example.org/alice')?.label).toBe('ex:alice');
  });

  it('assigns "literal" type to literal object nodes', () => {
    const nodeMap = createNodeMap(sampleTriples, prefixMap, themeColors);
    expect(nodeMap.get('Alice')?.type).toBe('literal');
  });

  it('assigns "uri" type to URI object nodes', () => {
    const nodeMap = createNodeMap(sampleTriples, prefixMap, themeColors);
    expect(nodeMap.get('http://example.org/bob')?.type).toBe('uri');
  });

  it('assigns unique incrementing IDs to nodes', () => {
    const nodeMap = createNodeMap(sampleTriples, prefixMap, themeColors);
    const ids = Array.from(nodeMap.values()).map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('handles blank node subjects', () => {
    const triples: RDFTriple[] = [
      {
        subject: '_:b0',
        predicate: 'http://example.org/name',
        object: { value: 'Blank', type: 'literal' },
      },
    ];
    const nodeMap = createNodeMap(triples, new Map(), themeColors);
    const blankNode = nodeMap.get('_:b0');
    expect(blankNode).toBeDefined();
    expect(blankNode?.label).toBe('_:b0');
  });
});

describe('createEdgesArray', () => {
  it('creates one edge per triple', () => {
    const nodeMap = createNodeMap(sampleTriples, prefixMap, themeColors);
    const edges = createEdgesArray(sampleTriples, nodeMap, prefixMap);
    expect(edges).toHaveLength(2);
  });

  it('deduplicates identical subject–predicate–object edges', () => {
    const triplesWithDupe: RDFTriple[] = [...sampleTriples, sampleTriples[0]];
    const nodeMap = createNodeMap(triplesWithDupe, prefixMap, themeColors);
    const edges = createEdgesArray(triplesWithDupe, nodeMap, prefixMap);
    expect(edges).toHaveLength(2);
  });

  it('applies prefix to edge labels', () => {
    const nodeMap = createNodeMap(sampleTriples, prefixMap, themeColors);
    const edges = createEdgesArray(sampleTriples, nodeMap, prefixMap);
    const knowsEdge = edges.find((e) => e.predicate === 'http://example.org/knows');
    expect(knowsEdge?.label).toBe('ex:knows');
  });

  it('sets arrows to "to" on every edge', () => {
    const nodeMap = createNodeMap(sampleTriples, prefixMap, themeColors);
    const edges = createEdgesArray(sampleTriples, nodeMap, prefixMap);
    edges.forEach((e) => expect(e.arrows).toBe('to'));
  });

  it('returns an empty array when triples is empty', () => {
    const nodeMap = createNodeMap([], prefixMap, themeColors);
    expect(createEdgesArray([], nodeMap, prefixMap)).toHaveLength(0);
  });
});

describe('triplesToGraph', () => {
  it('returns arrays of nodes and edges', () => {
    const { nodes, edges } = triplesToGraph(sampleTriples, prefixMap, themeColors);
    expect(Array.isArray(nodes)).toBe(true);
    expect(Array.isArray(edges)).toBe(true);
  });

  it('produces the expected number of nodes and edges', () => {
    const { nodes, edges } = triplesToGraph(sampleTriples, prefixMap, themeColors);
    // alice, bob, Alice → 3 nodes; 2 edges
    expect(nodes).toHaveLength(3);
    expect(edges).toHaveLength(2);
  });

  it('returns empty arrays for an empty triples input', () => {
    const { nodes, edges } = triplesToGraph([], prefixMap, themeColors);
    expect(nodes).toHaveLength(0);
    expect(edges).toHaveLength(0);
  });

  it('filters out literal nodes when compactMode is true', () => {
    const { nodes } = triplesToGraph(sampleTriples, prefixMap, themeColors, { compactMode: true });
    const literalNodes = nodes.filter((n) => n.type === 'literal');
    expect(literalNodes).toHaveLength(0);
  });

  it('removes edges connected to filtered-out nodes in compact mode', () => {
    // sampleTriples has alice–name–"Alice" (literal edge)
    const { edges } = triplesToGraph(sampleTriples, prefixMap, themeColors, { compactMode: true });
    // Only the alice→bob edge should remain
    expect(edges).toHaveLength(1);
  });

  it('filters out class nodes when compactMode is true', () => {
    const typeTriples: RDFTriple[] = [
      {
        subject: 'http://example.org/alice',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: { value: 'http://example.org/Person', type: 'uri' },
      },
    ];
    const { nodes } = triplesToGraph(typeTriples, prefixMap, themeColors, { compactMode: true });
    // "Person" is a class node; should be hidden. Only alice remains.
    const classNodes = nodes.filter((n) => n.uri === 'http://example.org/Person');
    expect(classNodes).toHaveLength(0);
  });

  it('always shows blank nodes even when compactMode is true', () => {
    const bnodeTriples: RDFTriple[] = [
      {
        subject: '_:b0',
        predicate: 'http://example.org/name',
        object: { value: 'Blank', type: 'literal' },
      },
    ];
    const { nodes } = triplesToGraph(bnodeTriples, prefixMap, themeColors, { compactMode: true });
    const blankNode = nodes.find((n) => n.uri === '_:b0');
    expect(blankNode).toBeDefined();
  });

  it('adds rdf:type and literal properties to compact tooltip', () => {
    const typeTriples: RDFTriple[] = [
      {
        subject: 'http://example.org/alice',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: { value: 'http://example.org/Person', type: 'uri' },
      },
      {
        subject: 'http://example.org/alice',
        predicate: 'http://example.org/name',
        object: { value: 'Alice', type: 'literal' },
      },
    ];
    const { nodes } = triplesToGraph(typeTriples, prefixMap, themeColors, { compactMode: true });
    const aliceNode = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(aliceNode).toBeDefined();
    expect(aliceNode?.title).toContain('rdf:type');
    expect(aliceNode?.title).toContain('ex:Person');
    expect(aliceNode?.title).toContain('Alice');
  });

  it('uses icon labels when predicateDisplay is "icon" and predicate is known', () => {
    const typeTriples: RDFTriple[] = [
      {
        subject: 'http://example.org/alice',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: { value: 'http://example.org/Person', type: 'uri' },
      },
    ];
    const { edges } = triplesToGraph(typeTriples, prefixMap, themeColors, { predicateDisplay: 'icon' });
    expect(edges[0].label).toBe('a'); // rdf:type maps to "a"
  });

  it('hides edge labels when predicateDisplay is "none"', () => {
    const { edges } = triplesToGraph(sampleTriples, prefixMap, themeColors, { predicateDisplay: 'none' });
    edges.forEach((e) => expect(e.label).toBe(''));
  });
});
