import type { RDFTriple, YasrResults } from './types';

/**
 * Parse a raw response from yasr.executeQuery() for DESCRIBE/CONSTRUCT queries.
 * Expects the response to carry SPARQL JSON results (application/sparql-results+json)
 * with subject/predicate/object bindings.
 * @param response - Raw response object (Fetch Response or Yasqe-style {data, status})
 * @returns Array of RDFTriple objects, or empty array on failure
 */
export async function parseBackgroundQueryResponse(response: any): Promise<RDFTriple[]> {
  if (!response) return [];

  try {
    let data: any;

    if (typeof response.json === 'function') {
      // Standard Fetch API Response
      data = await response.json();
    } else if (typeof response.data === 'string') {
      // Yasqe-style response object
      data = JSON.parse(response.data);
    } else if (typeof response === 'object') {
      data = response;
    } else {
      return [];
    }

    const bindings: any[] = data?.results?.bindings ?? [];
    const triples: RDFTriple[] = [];

    for (const binding of bindings) {
      if (!binding.subject || !binding.predicate || !binding.object) continue;
      triples.push({
        subject: binding.subject.value,
        predicate: binding.predicate.value,
        object: {
          value: binding.object.value,
          type: (binding.object.type || 'uri') as 'uri' | 'literal' | 'bnode',
          datatype: binding.object.datatype,
          lang: binding.object['xml:lang'],
        },
      });
    }

    return triples;
  } catch {
    return [];
  }
}

/**
 * Parse SPARQL CONSTRUCT results to extract RDF triples
 * @param yasrResults - YASR results object
 * @returns Array of RDFTriple objects {subject, predicate, object}
 */
export function parseConstructResults(yasrResults: YasrResults): RDFTriple[] {
  const triples: RDFTriple[] = [];
  
  if (!yasrResults || !yasrResults.getBindings) {
    return triples;
  }
  
  const bindings = yasrResults.getBindings();
  
  bindings.forEach((binding) => {
    if (!binding.subject || !binding.predicate || !binding.object) {
      return; // Skip incomplete bindings
    }
    
    const triple: RDFTriple = {
      subject: binding.subject.value,
      predicate: binding.predicate.value,
      object: {
        value: binding.object.value,
        type: (binding.object.type || 'uri') as 'uri' | 'literal' | 'bnode',
        datatype: binding.object.datatype,
        lang: binding.object['xml:lang'],
      },
    };
    
    triples.push(triple);
  });
  
  return triples;
}
