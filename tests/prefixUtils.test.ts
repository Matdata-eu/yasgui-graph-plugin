import { applyPrefix, truncateLabel, extractPrefixes } from '../src/prefixUtils';
import type { Yasr } from '../src/types';

describe('applyPrefix', () => {
  const prefixMap = new Map([
    ['http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf'],
    ['http://example.org/', 'ex'],
  ]);

  it('replaces a known namespace URI with its prefix', () => {
    expect(applyPrefix('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', prefixMap)).toBe('rdf:type');
    expect(applyPrefix('http://example.org/Person', prefixMap)).toBe('ex:Person');
  });

  it('returns the original URI when no prefix matches', () => {
    expect(applyPrefix('http://unknown.org/foo', prefixMap)).toBe('http://unknown.org/foo');
  });

  it('returns the original value for an empty string', () => {
    expect(applyPrefix('', prefixMap)).toBe('');
  });

  it('returns the original value when prefixMap is empty', () => {
    expect(applyPrefix('http://example.org/bar', new Map())).toBe('http://example.org/bar');
  });
});

describe('truncateLabel', () => {
  it('returns short strings unchanged', () => {
    expect(truncateLabel('short')).toBe('short');
    expect(truncateLabel('ex:Person')).toBe('ex:Person');
  });

  it('returns a string of exactly maxLength when the input is exactly maxLength characters', () => {
    const text = 'a'.repeat(50);
    expect(truncateLabel(text)).toBe(text);
  });

  it('truncates strings longer than the default maxLength with ellipsis', () => {
    const text = 'a'.repeat(60);
    const result = truncateLabel(text);
    expect(result.length).toBe(50);
    expect(result.endsWith('...')).toBe(true);
  });

  it('respects a custom maxLength', () => {
    expect(truncateLabel('hello world', 8)).toBe('hello...');
  });

  it('returns the original value for a non-string input', () => {
    // @ts-expect-error testing runtime guard
    expect(truncateLabel(null)).toBe(null);
  });
});

describe('extractPrefixes', () => {
  it('extracts prefixes from a YASR instance', () => {
    const yasr: Yasr = {
      results: { getBindings: () => [] },
      resultsEl: null as unknown as HTMLElement,
      getPrefixes: () => ({ ex: 'http://example.org/', schema: 'http://schema.org/' }),
    };
    const map = extractPrefixes(yasr);
    expect(map.get('http://example.org/')).toBe('ex');
    expect(map.get('http://schema.org/')).toBe('schema');
  });

  it('includes common RDF prefixes as fallback', () => {
    const yasr: Yasr = {
      results: { getBindings: () => [] },
      resultsEl: null as unknown as HTMLElement,
      getPrefixes: () => ({}),
    };
    const map = extractPrefixes(yasr);
    expect(map.get('http://www.w3.org/1999/02/22-rdf-syntax-ns#')).toBe('rdf');
    expect(map.get('http://www.w3.org/2000/01/rdf-schema#')).toBe('rdfs');
    expect(map.get('http://www.w3.org/2001/XMLSchema#')).toBe('xsd');
    expect(map.get('http://www.w3.org/2002/07/owl#')).toBe('owl');
  });

  it('does not override YASR-provided prefixes with common fallbacks', () => {
    const yasr: Yasr = {
      results: { getBindings: () => [] },
      resultsEl: null as unknown as HTMLElement,
      getPrefixes: () => ({ myRdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' }),
    };
    const map = extractPrefixes(yasr);
    // The yasr-provided prefix takes precedence over the built-in 'rdf'
    expect(map.get('http://www.w3.org/1999/02/22-rdf-syntax-ns#')).toBe('myRdf');
  });

  it('handles a YASR instance without getPrefixes', () => {
    const yasr: Yasr = {
      results: { getBindings: () => [] },
      resultsEl: null as unknown as HTMLElement,
    };
    const map = extractPrefixes(yasr);
    expect(map.get('http://www.w3.org/1999/02/22-rdf-syntax-ns#')).toBe('rdf');
  });
});
