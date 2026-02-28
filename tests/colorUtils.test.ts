import { getNodeColor } from '../src/colorUtils';
import type { ThemeColors, RDFTriple } from '../src/types';

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

const emptyTriples: RDFTriple[] = [];

describe('getNodeColor', () => {
  it('returns the blankNode color for blank nodes', () => {
    expect(getNodeColor({ uri: '_:blank1', type: 'uri' }, emptyTriples, themeColors)).toBe(themeColors.blankNode);
    expect(getNodeColor({ uri: '_:b0', type: 'uri' }, emptyTriples, themeColors)).toBe(themeColors.blankNode);
  });

  it('returns the literal color for literal nodes', () => {
    expect(getNodeColor({ uri: null, type: 'literal' }, emptyTriples, themeColors)).toBe(themeColors.literal);
  });

  it('returns the typeObject color for nodes that are the object of an rdf:type triple', () => {
    const triples: RDFTriple[] = [
      {
        subject: 'http://example.org/alice',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: { value: 'http://example.org/Person', type: 'uri' },
      },
    ];
    expect(
      getNodeColor({ uri: 'http://example.org/Person', type: 'uri' }, triples, themeColors)
    ).toBe(themeColors.typeObject);
  });

  it('returns the uri color for regular URI nodes', () => {
    expect(
      getNodeColor({ uri: 'http://example.org/foo', type: 'uri' }, emptyTriples, themeColors)
    ).toBe(themeColors.uri);
  });

  it('returns the uri color when the node is a subject, not the object of rdf:type', () => {
    const triples: RDFTriple[] = [
      {
        subject: 'http://example.org/alice',
        predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
        object: { value: 'http://example.org/Person', type: 'uri' },
      },
    ];
    // alice is the subject, not the rdf:type object, so it gets the normal uri color
    expect(
      getNodeColor({ uri: 'http://example.org/alice', type: 'uri' }, triples, themeColors)
    ).toBe(themeColors.uri);
  });
});
