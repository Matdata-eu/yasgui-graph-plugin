import { parseBackgroundQueryResponse } from '../src/parsers';

describe('parseBackgroundQueryResponse', () => {
  it('returns empty array for null response', async () => {
    expect(await parseBackgroundQueryResponse(null)).toEqual([]);
  });

  it('returns empty array for undefined response', async () => {
    expect(await parseBackgroundQueryResponse(undefined)).toEqual([]);
  });

  it('parses a Fetch API Response with SPARQL JSON results', async () => {
    const sparqlJson = {
      results: {
        bindings: [
          {
            subject: { type: 'uri', value: 'http://example.org/alice' },
            predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
            object: { type: 'uri', value: 'http://example.org/Person' },
          },
          {
            subject: { type: 'uri', value: 'http://example.org/alice' },
            predicate: { type: 'uri', value: 'http://example.org/name' },
            object: { type: 'literal', value: 'Alice', 'xml:lang': 'en' },
          },
        ],
      },
    };

    const mockResponse = {
      json: async () => sparqlJson,
    };

    const result = await parseBackgroundQueryResponse(mockResponse);
    expect(result).toHaveLength(2);

    expect(result[0].subject).toBe('http://example.org/alice');
    expect(result[0].predicate).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    expect(result[0].object.value).toBe('http://example.org/Person');
    expect(result[0].object.type).toBe('uri');

    expect(result[1].subject).toBe('http://example.org/alice');
    expect(result[1].predicate).toBe('http://example.org/name');
    expect(result[1].object.value).toBe('Alice');
    expect(result[1].object.type).toBe('literal');
    expect(result[1].object.lang).toBe('en');
  });

  it('parses a Yasqe-style response with data string', async () => {
    const sparqlJson = {
      results: {
        bindings: [
          {
            subject: { type: 'uri', value: 'http://example.org/bob' },
            predicate: { type: 'uri', value: 'http://example.org/age' },
            object: {
              type: 'literal',
              value: '30',
              datatype: 'http://www.w3.org/2001/XMLSchema#integer',
            },
          },
        ],
      },
    };

    const mockResponse = { data: JSON.stringify(sparqlJson) };

    const result = await parseBackgroundQueryResponse(mockResponse);
    expect(result).toHaveLength(1);
    expect(result[0].object.datatype).toBe('http://www.w3.org/2001/XMLSchema#integer');
  });

  it('skips bindings with missing subject, predicate, or object', async () => {
    const sparqlJson = {
      results: {
        bindings: [
          // missing subject
          {
            predicate: { type: 'uri', value: 'http://example.org/p' },
            object: { type: 'uri', value: 'http://example.org/o' },
          },
          // valid triple
          {
            subject: { type: 'uri', value: 'http://example.org/s' },
            predicate: { type: 'uri', value: 'http://example.org/p' },
            object: { type: 'uri', value: 'http://example.org/o' },
          },
        ],
      },
    };

    const mockResponse = { json: async () => sparqlJson };
    const result = await parseBackgroundQueryResponse(mockResponse);
    expect(result).toHaveLength(1);
  });

  it('returns empty array for response with no bindings', async () => {
    const mockResponse = { json: async () => ({ results: { bindings: [] } }) };
    expect(await parseBackgroundQueryResponse(mockResponse)).toEqual([]);
  });

  it('returns empty array when json() throws', async () => {
    const mockResponse = {
      json: async () => {
        throw new Error('parse error');
      },
    };
    expect(await parseBackgroundQueryResponse(mockResponse)).toEqual([]);
  });

  it('returns empty array for malformed data string', async () => {
    const mockResponse = { data: 'not valid json' };
    expect(await parseBackgroundQueryResponse(mockResponse)).toEqual([]);
  });
});
