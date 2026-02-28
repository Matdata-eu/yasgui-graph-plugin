import { parseBackgroundQueryResponse } from '../src/parsers';

describe('parseBackgroundQueryResponse', () => {
  it('returns empty array for null response', async () => {
    expect(await parseBackgroundQueryResponse(null)).toEqual([]);
  });

  it('returns empty array for undefined response', async () => {
    expect(await parseBackgroundQueryResponse(undefined)).toEqual([]);
  });

  it('parses a Fetch API Response with Turtle RDF', async () => {
    const turtleData = `
@prefix ex: <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

ex:alice rdf:type ex:Person ;
    ex:name "Alice"@en .
`;

    const mockResponse = {
      text: async () => turtleData,
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

  it('parses a Yasqe-style response with data string (Turtle)', async () => {
    const turtleData = `
@prefix ex: <http://example.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ex:bob ex:age "30"^^xsd:integer .
`;

    const mockResponse = { data: turtleData };

    const result = await parseBackgroundQueryResponse(mockResponse);
    expect(result).toHaveLength(1);
    expect(result[0].object.datatype).toBe('http://www.w3.org/2001/XMLSchema#integer');
  });

  it('parses N-Triples format', async () => {
    const ntriplesData = `
<http://example.org/alice> <http://example.org/knows> <http://example.org/bob> .
<http://example.org/bob> <http://example.org/name> "Bob" .
`;

    const mockResponse = { text: async () => ntriplesData };
    const result = await parseBackgroundQueryResponse(mockResponse);
    expect(result).toHaveLength(2);
    
    expect(result[0].subject).toBe('http://example.org/alice');
    expect(result[0].predicate).toBe('http://example.org/knows');
    expect(result[0].object.value).toBe('http://example.org/bob');
    expect(result[0].object.type).toBe('uri');

    expect(result[1].subject).toBe('http://example.org/bob');
    expect(result[1].predicate).toBe('http://example.org/name');
    expect(result[1].object.value).toBe('Bob');
    expect(result[1].object.type).toBe('literal');
  });

  it('handles blank nodes', async () => {
    const turtleData = `
@prefix ex: <http://example.org/> .

ex:alice ex:friend _:b1 .
_:b1 ex:name "Anonymous" .
`;

    const mockResponse = { text: async () => turtleData };
    const result = await parseBackgroundQueryResponse(mockResponse);
    expect(result).toHaveLength(2);
    
    // First triple should have a blank node object
    expect(result[0].object.type).toBe('bnode');
  });

  it('returns empty array for empty Turtle', async () => {
    const mockResponse = { text: async () => '' };
    expect(await parseBackgroundQueryResponse(mockResponse)).toEqual([]);
  });

  it('returns empty array when text() throws', async () => {
    const mockResponse = {
      text: async () => {
        throw new Error('parse error');
      },
    };
    expect(await parseBackgroundQueryResponse(mockResponse)).toEqual([]);
  });

  it('returns empty array for malformed Turtle', async () => {
    const mockResponse = { data: 'not valid turtle <<>>' };
    expect(await parseBackgroundQueryResponse(mockResponse)).toEqual([]);
  });

  it('parses direct string input', async () => {
    const turtleData = `<http://example.org/s> <http://example.org/p> <http://example.org/o> .`;
    const result = await parseBackgroundQueryResponse(turtleData);
    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe('http://example.org/s');
  });
});
