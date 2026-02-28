import { createNodeMap, createEdgesArray, triplesToGraph, getNodeVisual, resolveCompactVisual, SCHEMA_IMAGE, SCHEMA_ICON, RDFS_SUBCLASSOF } from '../src/transformers';
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

  it('creates tooltips for blank node subjects with identifier', () => {
    const triples: RDFTriple[] = [
      {
        subject: '_:b0',
        predicate: 'http://example.org/name',
        object: { value: 'Blank', type: 'literal' },
      },
    ];
    const nodeMap = createNodeMap(triples, new Map(), themeColors);
    const blankNode = nodeMap.get('_:b0');
    expect(blankNode?.title).toContain('Blank Node');
    expect(blankNode?.title).toContain('_:b0');
    expect(blankNode?.title).toContain('Identifier');
  });

  it('creates tooltips for blank node objects with identifier', () => {
    const triples: RDFTriple[] = [
      {
        subject: 'http://example.org/alice',
        predicate: 'http://example.org/knows',
        object: { value: '_:b1', type: 'uri' },
      },
    ];
    const nodeMap = createNodeMap(triples, new Map(), themeColors);
    const blankNode = nodeMap.get('_:b1');
    expect(blankNode?.title).toContain('Blank Node');
    expect(blankNode?.title).toContain('_:b1');
    expect(blankNode?.title).toContain('Identifier');
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

  it('adds rdf:type and literal properties to blank node compact tooltip', () => {
    const bnodeTriples: RDFTriple[] = [
      {
        subject: '_:b0',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: { value: 'http://example.org/Person', type: 'uri' },
      },
      {
        subject: '_:b0',
        predicate: 'http://example.org/name',
        object: { value: 'Unknown', type: 'literal' },
      },
    ];
    const { nodes } = triplesToGraph(bnodeTriples, prefixMap, themeColors, { compactMode: true });
    const blankNode = nodes.find((n) => n.uri === '_:b0');
    expect(blankNode).toBeDefined();
    expect(blankNode?.title).toContain('Blank Node');
    expect(blankNode?.title).toContain('_:b0');
    expect(blankNode?.title).toContain('rdf:type');
    expect(blankNode?.title).toContain('ex:Person');
    expect(blankNode?.title).toContain('Unknown');
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

// ── schema:image / schema:icon visual tests ──────────────────────────────────

const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

describe('getNodeVisual', () => {
  it('returns empty object when no schema:image or schema:icon', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: 'http://example.org/name', object: { value: 'Alice', type: 'literal' } },
    ];
    expect(getNodeVisual('http://example.org/alice', triples)).toEqual({});
  });

  it('returns image when schema:image is present', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    expect(getNodeVisual('http://example.org/Person', triples)).toEqual({ image: 'https://example.com/person.png' });
  });

  it('returns icon when schema:icon is present', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/Person', predicate: SCHEMA_ICON, object: { value: '👤', type: 'literal' } },
    ];
    expect(getNodeVisual('http://example.org/Person', triples)).toEqual({ icon: '👤' });
  });

  it('gives schema:icon priority over schema:image', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/person.png', type: 'literal' } },
      { subject: 'http://example.org/Person', predicate: SCHEMA_ICON,  object: { value: '👤', type: 'literal' } },
    ];
    expect(getNodeVisual('http://example.org/Person', triples)).toEqual({ icon: '👤' });
  });
});

describe('resolveCompactVisual', () => {
  it('returns own schema:image in preference to class image', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: RDF_TYPE, object: { value: 'http://example.org/Person', type: 'uri' } },
      { subject: 'http://example.org/alice',  predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/alice.png', type: 'literal' } },
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    expect(resolveCompactVisual('http://example.org/alice', triples)).toEqual({ image: 'https://example.com/alice.png' });
  });

  it('falls back to rdf:type class schema:image when resource has no own visual', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: RDF_TYPE, object: { value: 'http://example.org/Person', type: 'uri' } },
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    expect(resolveCompactVisual('http://example.org/alice', triples)).toEqual({ image: 'https://example.com/person.png' });
  });

  it('falls back to rdfs:subClassOf superclass schema:image', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice',  predicate: RDF_TYPE,        object: { value: 'http://example.org/Employee', type: 'uri' } },
      { subject: 'http://example.org/Employee', predicate: RDFS_SUBCLASSOF, object: { value: 'http://example.org/Person', type: 'uri' } },
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE,    object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    expect(resolveCompactVisual('http://example.org/alice', triples)).toEqual({ image: 'https://example.com/person.png' });
  });

  it('returns empty object when no visual anywhere in the hierarchy', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: RDF_TYPE, object: { value: 'http://example.org/Person', type: 'uri' } },
    ];
    expect(resolveCompactVisual('http://example.org/alice', triples)).toEqual({});
  });
});

describe('triplesToGraph – schema:image / schema:icon integration', () => {
  it('does not create a literal node for schema:image', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    const literalNodes = nodes.filter((n) => n.type === 'literal');
    expect(literalNodes).toHaveLength(0);
  });

  it('does not create an edge for schema:image', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    const { edges } = triplesToGraph(triples, prefixMap, themeColors);
    expect(edges).toHaveLength(0);
  });

  it('does not create a literal node for schema:icon', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/Person', predicate: SCHEMA_ICON, object: { value: '👤', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    const literalNodes = nodes.filter((n) => n.type === 'literal');
    expect(literalNodes).toHaveLength(0);
  });

  it('sets circularImage shape and image URL on a node with schema:image', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: 'http://example.org/knows', object: { value: 'http://example.org/bob', type: 'uri' } },
      { subject: 'http://example.org/alice', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/alice.png', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.shape).toBe('circularImage');
    expect(alice?.image).toBe('https://example.com/alice.png');
  });

  it('sets shape to "text" and icon as node label when schema:icon is present', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: 'http://example.org/knows', object: { value: 'http://example.org/bob', type: 'uri' } },
      { subject: 'http://example.org/alice', predicate: SCHEMA_ICON, object: { value: '🧑', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.shape).toBe('text');
    expect(alice?.label).toBe('🧑');
  });

  it('includes Image value in non-compact tooltip', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: 'http://example.org/knows', object: { value: 'http://example.org/bob', type: 'uri' } },
      { subject: 'http://example.org/alice', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/alice.png', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.title).toContain('Image');
    expect(alice?.title).toContain('https://example.com/alice.png');
  });

  it('in compact mode inherits schema:image from rdf:type class', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice',  predicate: RDF_TYPE,    object: { value: 'http://example.org/Person', type: 'uri' } },
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, { compactMode: true });
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.shape).toBe('circularImage');
    expect(alice?.image).toBe('https://example.com/person.png');
  });

  it('in compact mode inherits schema:icon from rdf:type class', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice',  predicate: RDF_TYPE,   object: { value: 'http://example.org/Person', type: 'uri' } },
      { subject: 'http://example.org/Person', predicate: SCHEMA_ICON, object: { value: '👤', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, { compactMode: true });
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.shape).toBe('text');
    expect(alice?.label).toBe('👤');
  });

  it('in compact mode own schema:image overrides class schema:image', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice',  predicate: RDF_TYPE,    object: { value: 'http://example.org/Person', type: 'uri' } },
      { subject: 'http://example.org/alice',  predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/alice.png', type: 'literal' } },
      { subject: 'http://example.org/Person', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, { compactMode: true });
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.image).toBe('https://example.com/alice.png');
  });

  it('in compact mode inherits schema:image from rdfs:subClassOf superclass', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice',    predicate: RDF_TYPE,        object: { value: 'http://example.org/Employee', type: 'uri' } },
      { subject: 'http://example.org/Employee', predicate: RDFS_SUBCLASSOF, object: { value: 'http://example.org/Person', type: 'uri' } },
      { subject: 'http://example.org/Person',   predicate: SCHEMA_IMAGE,    object: { value: 'https://example.com/person.png', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, { compactMode: true });
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.shape).toBe('circularImage');
    expect(alice?.image).toBe('https://example.com/person.png');
  });

  it('uses rdfs:label as node label when present (no visual)', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: 'http://example.org/knows', object: { value: 'http://example.org/bob', type: 'uri' } },
      { subject: 'http://example.org/alice', predicate: 'http://www.w3.org/2000/01/rdf-schema#label', object: { value: 'Alice Smith', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.label).toBe('Alice Smith');
  });

  it('combines schema:icon with rdfs:label when both present', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: 'http://example.org/knows', object: { value: 'http://example.org/bob', type: 'uri' } },
      { subject: 'http://example.org/alice', predicate: SCHEMA_ICON, object: { value: '🧑', type: 'literal' } },
      { subject: 'http://example.org/alice', predicate: 'http://www.w3.org/2000/01/rdf-schema#label', object: { value: 'Alice', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.shape).toBe('text');
    expect(alice?.label).toBe('🧑\nAlice');
  });

  it('uses rdfs:label with schema:image', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: 'http://example.org/knows', object: { value: 'http://example.org/bob', type: 'uri' } },
      { subject: 'http://example.org/alice', predicate: SCHEMA_IMAGE, object: { value: 'https://example.com/alice.png', type: 'literal' } },
      { subject: 'http://example.org/alice', predicate: 'http://www.w3.org/2000/01/rdf-schema#label', object: { value: 'Alice', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.shape).toBe('circularImage');
    expect(alice?.image).toBe('https://example.com/alice.png');
    expect(alice?.label).toBe('Alice');
  });

  it('in compact mode shows rdfs:label with inherited schema:icon', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice',  predicate: RDF_TYPE,   object: { value: 'http://example.org/Person', type: 'uri' } },
      { subject: 'http://example.org/Person', predicate: SCHEMA_ICON, object: { value: '👤', type: 'literal' } },
      { subject: 'http://example.org/alice',  predicate: 'http://www.w3.org/2000/01/rdf-schema#label', object: { value: 'Alice', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, { compactMode: true });
    const alice = nodes.find((n) => n.uri === 'http://example.org/alice');
    expect(alice?.shape).toBe('text');
    expect(alice?.label).toBe('👤\nAlice');
  });

  it('rdfs:label does not create a separate node', () => {
    const triples: RDFTriple[] = [
      { subject: 'http://example.org/alice', predicate: 'http://example.org/knows', object: { value: 'http://example.org/bob', type: 'uri' } },
      { subject: 'http://example.org/alice', predicate: 'http://www.w3.org/2000/01/rdf-schema#label', object: { value: 'Alice Smith', type: 'literal' } },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors);
    // Should only have 2 nodes: alice and bob, not a third one for the label
    expect(nodes.length).toBe(2);
    expect(nodes.every(n => n.fullValue !== 'Alice Smith')).toBe(true);
  });
});
