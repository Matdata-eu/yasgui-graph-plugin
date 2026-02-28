import { parseConstructResults } from '../src/parsers';
import type { YasrResults } from '../src/types';

describe('parseConstructResults', () => {
  it('returns empty array when yasrResults is null', () => {
    expect(parseConstructResults(null as unknown as YasrResults)).toEqual([]);
  });

  it('returns empty array when yasrResults has no getBindings method', () => {
    expect(parseConstructResults({} as unknown as YasrResults)).toEqual([]);
  });

  it('returns empty array when bindings list is empty', () => {
    const yasrResults: YasrResults = { getBindings: () => [] };
    expect(parseConstructResults(yasrResults)).toEqual([]);
  });

  it('parses a valid URI triple', () => {
    const yasrResults: YasrResults = {
      getBindings: () => [
        {
          subject: { value: 'http://example.org/alice', type: 'uri' },
          predicate: { value: 'http://example.org/knows', type: 'uri' },
          object: { value: 'http://example.org/bob', type: 'uri' },
        },
      ],
    };
    const result = parseConstructResults(yasrResults);
    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe('http://example.org/alice');
    expect(result[0].predicate).toBe('http://example.org/knows');
    expect(result[0].object.value).toBe('http://example.org/bob');
    expect(result[0].object.type).toBe('uri');
  });

  it('parses a literal object with datatype and language', () => {
    const yasrResults: YasrResults = {
      getBindings: () => [
        {
          subject: { value: 'http://example.org/alice', type: 'uri' },
          predicate: { value: 'http://example.org/name', type: 'uri' },
          object: {
            value: 'Alice',
            type: 'literal',
            datatype: 'http://www.w3.org/2001/XMLSchema#string',
            'xml:lang': 'en',
          },
        },
      ],
    };
    const result = parseConstructResults(yasrResults);
    expect(result).toHaveLength(1);
    expect(result[0].object.type).toBe('literal');
    expect(result[0].object.datatype).toBe('http://www.w3.org/2001/XMLSchema#string');
    expect(result[0].object.lang).toBe('en');
  });

  it('skips bindings that are missing subject, predicate, or object', () => {
    const yasrResults: YasrResults = {
      getBindings: () => [
        // missing subject
        {
          predicate: { value: 'http://example.org/p', type: 'uri' },
          object: { value: 'http://example.org/o', type: 'uri' },
        },
        // missing predicate
        {
          subject: { value: 'http://example.org/s', type: 'uri' },
          object: { value: 'http://example.org/o', type: 'uri' },
        },
        // missing object
        {
          subject: { value: 'http://example.org/s', type: 'uri' },
          predicate: { value: 'http://example.org/p', type: 'uri' },
        },
      ],
    };
    expect(parseConstructResults(yasrResults)).toHaveLength(0);
  });

  it('parses multiple bindings', () => {
    const yasrResults: YasrResults = {
      getBindings: () => [
        {
          subject: { value: 'http://example.org/alice', type: 'uri' },
          predicate: { value: 'http://example.org/knows', type: 'uri' },
          object: { value: 'http://example.org/bob', type: 'uri' },
        },
        {
          subject: { value: 'http://example.org/bob', type: 'uri' },
          predicate: { value: 'http://example.org/knows', type: 'uri' },
          object: { value: 'http://example.org/carol', type: 'uri' },
        },
      ],
    };
    expect(parseConstructResults(yasrResults)).toHaveLength(2);
  });
});
