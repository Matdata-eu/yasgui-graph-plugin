import {
  triplesToGraph,
  getEdgeLabel,
  getEdgeLength,
  getLiteralPredicates,
  pickLiteral,
  EDGE_LABEL_MAX_LENGTH,
  GROUP_NODE_COLOR,
  getGroupKey,
} from '../src/transformers';
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
const prefixMap = new Map([
  ['http://example.org/', 'ex'],
  ['http://www.w3.org/2004/02/skos/core#', 'skos'],
  ['http://www.w3.org/2000/01/rdf-schema#', 'rdfs'],
]);
const EX = 'http://example.org/';
const SKOS_PREF = 'http://www.w3.org/2004/02/skos/core#prefLabel';
const SKOS_NOTATION = 'http://www.w3.org/2004/02/skos/core#notation';
const RDFS_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';

const lit = (value: string, lang?: string) => ({ value, type: 'literal' as const, ...(lang ? { lang } : {}) });
const iri = (value: string) => ({ value, type: 'uri' as const });

describe('node labels (#42)', () => {
  const triples: RDFTriple[] = [
    { subject: `${EX}paris`, predicate: SKOS_PREF, object: lit('Paris', 'en') },
    { subject: `${EX}paris`, predicate: SKOS_PREF, object: lit('Parijs', 'nl') },
    { subject: `${EX}paris`, predicate: SKOS_NOTATION, object: lit('FR-75') },
    { subject: `${EX}paris`, predicate: `${EX}in`, object: iri(`${EX}france`) },
    { subject: `${EX}france`, predicate: RDFS_LABEL, object: lit('France') },
  ];

  it('picks a label from skos:prefLabel automatically, in the preferred language', () => {
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, {}, { languages: ['nl-be'] });
    expect(nodes.find((n) => n.fullValue === `${EX}paris`)?.label).toBe('Parijs');
    expect(nodes.find((n) => n.fullValue === `${EX}france`)?.label).toBe('France');
  });

  it('puts the label and its predicate in the tooltip', () => {
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, {}, { languages: ['en'] });
    const title = nodes.find((n) => n.fullValue === `${EX}paris`)!.title;
    expect(title).toContain('skos:prefLabel');
    expect(title).toContain('Paris');
  });

  it('uses the chosen label property and hides its literal nodes', () => {
    const { nodes, edges } = triplesToGraph(triples, prefixMap, themeColors, { labelProperty: SKOS_NOTATION });
    expect(nodes.find((n) => n.fullValue === `${EX}paris`)?.label).toBe('FR-75');
    expect(nodes.some((n) => n.fullValue === 'FR-75')).toBe(false);
    expect(edges.some((e) => e.predicate === SKOS_NOTATION)).toBe(false);
    // rdfs:label is an ordinary literal again when another property is chosen
    expect(nodes.find((n) => n.fullValue === `${EX}france`)?.label).toBe('ex:france');
    expect(nodes.some((n) => n.fullValue === 'France')).toBe(true);
  });

  it('follows the configured label predicates', () => {
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, {}, { labelPredicates: [SKOS_NOTATION] });
    expect(nodes.find((n) => n.fullValue === `${EX}paris`)?.label).toBe('FR-75');
    expect(nodes.find((n) => n.fullValue === `${EX}france`)?.label).toBe('ex:france');
  });

  it('lists the predicates with literal values', () => {
    expect(getLiteralPredicates(triples)).toEqual([SKOS_PREF, SKOS_NOTATION, RDFS_LABEL]);
  });
});

describe('pickLiteral', () => {
  const literals = [lit('Parijs', 'nl'), lit('Paris', 'en'), lit('Paris')];
  it('prefers an exact or primary-language match', () => {
    expect(pickLiteral(literals, ['nl-be'])?.value).toBe('Parijs');
  });
  it('falls back to a literal without language, then English', () => {
    expect(pickLiteral(literals, ['de'])?.value).toBe('Paris');
    expect(pickLiteral([lit('X', 'fr'), lit('Y', 'en')], ['de'])?.value).toBe('Y');
  });
});

describe('edge labels (#29, #41)', () => {
  const long = `${EX}aVeryLongPredicateNameThatDoesNotFitOnAnEdge`;

  it('shortens long labels with an ellipsis', () => {
    const label = getEdgeLabel(long, prefixMap, { predicateDisplay: 'label' });
    expect(label.length).toBe(EDGE_LABEL_MAX_LENGTH);
    expect(label.endsWith('...')).toBe(true);
  });

  it('makes edges with long labels longer', () => {
    expect(getEdgeLength('a')).toBeUndefined();
    expect(getEdgeLength('')).toBeUndefined();
    expect(getEdgeLength('x'.repeat(EDGE_LABEL_MAX_LENGTH))).toBeGreaterThan(95);
  });

  it('sets the length on long edges and keeps the full IRI in the tooltip', () => {
    const { edges } = triplesToGraph(
      [{ subject: `${EX}a`, predicate: long, object: iri(`${EX}b`) }],
      prefixMap,
      themeColors,
      { predicateDisplay: 'label' }
    );
    expect(edges[0].length).toBeGreaterThan(95);
    expect(edges[0].title).toContain(long);
  });

  it('uses configured predicate icons', () => {
    expect(getEdgeLabel(`${EX}p`, prefixMap, { predicateDisplay: 'icon' }, { predicateIcons: { [`${EX}p`]: '→' } })).toBe('→');
  });
});

describe('grouping objects of one predicate (#28)', () => {
  const members = (n: number, predicate = `${EX}has`): RDFTriple[] =>
    Array.from({ length: n }, (_, i) => ({ subject: `${EX}s`, predicate, object: iri(`${EX}m${i}`) }));

  it('groups leaf objects from the threshold on', () => {
    const { nodes, edges } = triplesToGraph(members(5), prefixMap, themeColors, { groupThreshold: 5 });
    const group = nodes.find((n) => n.type === 'group')!;
    expect(group).toBeDefined();
    expect(group.label).toBe('5');
    expect(group.color).toBe(GROUP_NODE_COLOR);
    expect(group.uri).toBeNull();
    expect(group.groupKey).toBe(getGroupKey(`${EX}s`, `${EX}has`));
    expect(nodes).toHaveLength(2);
    expect(edges).toHaveLength(1);
    expect(edges[0].to).toBe(group.id);
    expect(edges[0].label).toBe('ex:has');
  });

  it('does not group below the threshold or when grouping is off', () => {
    expect(triplesToGraph(members(4), prefixMap, themeColors, { groupThreshold: 5 }).nodes.some((n) => n.type === 'group')).toBe(false);
    expect(triplesToGraph(members(40), prefixMap, themeColors, { groupThreshold: 0 }).nodes.some((n) => n.type === 'group')).toBe(false);
  });

  it('keeps objects that have other connections out of the group', () => {
    const triples = [
      ...members(5),
      { subject: `${EX}m0`, predicate: `${EX}next`, object: iri(`${EX}other`) },
    ];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, { groupThreshold: 4 });
    expect(nodes.find((n) => n.type === 'group')?.label).toBe('4');
    expect(nodes.some((n) => n.fullValue === `${EX}m0`)).toBe(true);
  });

  it('shows the members of an expanded group', () => {
    const expandedGroups = new Set([getGroupKey(`${EX}s`, `${EX}has`)]);
    const { nodes, edges } = triplesToGraph(members(5), prefixMap, themeColors, { groupThreshold: 5 }, { expandedGroups });
    expect(nodes.some((n) => n.type === 'group')).toBe(false);
    expect(edges).toHaveLength(5);
  });

  it('groups per predicate', () => {
    const triples = [...members(3, `${EX}a`), ...members(3, `${EX}b`).map((t, i) => ({ ...t, object: iri(`${EX}n${i}`) }))];
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, { groupThreshold: 3 });
    expect(nodes.filter((n) => n.type === 'group')).toHaveLength(2);
  });

  it('groups literal objects too', () => {
    const triples = Array.from({ length: 3 }, (_, i) => ({ subject: `${EX}s`, predicate: `${EX}alt`, object: lit(`v${i}`) }));
    const { nodes } = triplesToGraph(triples, prefixMap, themeColors, { groupThreshold: 3 });
    expect(nodes.find((n) => n.type === 'group')?.label).toBe('3');
  });

  it('gives edges stable ids', () => {
    const a = triplesToGraph(members(2), prefixMap, themeColors, {}).edges.map((e) => e.id);
    const b = triplesToGraph(members(2), prefixMap, themeColors, {}).edges.map((e) => e.id);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(a.length);
  });
});
