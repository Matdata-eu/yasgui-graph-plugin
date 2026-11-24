import { getPredicateIcon, PREDICATE_ICONS } from '../src/predicateIcons';

describe('PREDICATE_ICONS', () => {
  it('contains at least 20 entries', () => {
    expect(Object.keys(PREDICATE_ICONS).length).toBeGreaterThanOrEqual(20);
  });

  it('maps rdf:type to "a"', () => {
    expect(PREDICATE_ICONS['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']).toBe('a');
  });

  it('maps rdfs:label to "lbl"', () => {
    expect(PREDICATE_ICONS['http://www.w3.org/2000/01/rdf-schema#label']).toBe('lbl');
  });

  it('maps rdfs:subClassOf to ⊂ (U+2282)', () => {
    expect(PREDICATE_ICONS['http://www.w3.org/2000/01/rdf-schema#subClassOf']).toBe('\u2282');
  });

  it('maps owl:sameAs to ≡ (U+2261)', () => {
    expect(PREDICATE_ICONS['http://www.w3.org/2002/07/owl#sameAs']).toBe('\u2261');
  });

  it('maps skos:broader to ↑ (U+2191)', () => {
    expect(PREDICATE_ICONS['http://www.w3.org/2004/02/skos/core#broader']).toBe('\u2191');
  });
});

describe('getPredicateIcon', () => {
  it('returns the icon for a known predicate', () => {
    expect(getPredicateIcon('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')).toBe('a');
  });

  it('returns undefined for an unknown predicate', () => {
    expect(getPredicateIcon('http://example.org/unknownPredicate')).toBeUndefined();
  });
});

describe('getPredicateIcon with configured icons', () => {
  const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

  it('adds icons for predicates without a built-in icon', () => {
    expect(getPredicateIcon('http://example.org/p', { 'http://example.org/p': '→' })).toBe('→');
  });

  it('replaces a built-in icon', () => {
    expect(getPredicateIcon(RDF_TYPE, { [RDF_TYPE]: 'type' })).toBe('type');
  });

  it('removes a built-in icon with an empty string', () => {
    expect(getPredicateIcon(RDF_TYPE, { [RDF_TYPE]: '' })).toBeUndefined();
  });

  it('keeps built-in icons of predicates that are not configured', () => {
    expect(getPredicateIcon(RDF_TYPE, { 'http://example.org/p': '→' })).toBe('a');
  });
});
