import { Parser } from 'n3';
import type { RDFTriple, YasrResults } from './types';

/**
 * Parse a raw response from yasr.executeQuery() for DESCRIBE/CONSTRUCT queries.
 * Expects the response to carry RDF data in Turtle, N-Triples, or similar RDF serialization
 * (text/turtle, application/n-triples, etc.), NOT SPARQL JSON results.
 * @param response - Raw response object (Fetch Response or Yasqe-style {data, status})
 * @returns Array of RDFTriple objects, or empty array on failure
 */
export async function parseBackgroundQueryResponse(response: any): Promise<RDFTriple[]> {
  if (!response) return [];

  try {
    let rdfText: string;

    if (typeof response.text === 'function') {
      // Standard Fetch API Response
      rdfText = await response.text();
    } else if (typeof response.data === 'string') {
      // Yasqe-style response object
      rdfText = response.data;
    } else if (typeof response === 'string') {
      // Direct string
      rdfText = response;
    } else {
      return [];
    }

    // Parse RDF using N3 parser (handles Turtle, N-Triples, N-Quads, TriG)
    const parser = new Parser();
    const quads = parser.parse(rdfText);
    const triples: RDFTriple[] = [];

    for (const quad of quads) {
      // Extract subject
      const subject = quad.subject.value;
      
      // Extract predicate
      const predicate = quad.predicate.value;
      
      // Extract object
      let objectType: 'uri' | 'literal' | 'bnode';
      let objectValue: string;
      let datatype: string | undefined;
      let lang: string | undefined;

      if (quad.object.termType === 'Literal') {
        objectType = 'literal';
        objectValue = quad.object.value;
        datatype = quad.object.datatype?.value;
        lang = quad.object.language || undefined;
      } else if (quad.object.termType === 'BlankNode') {
        objectType = 'bnode';
        objectValue = quad.object.value;
      } else {
        objectType = 'uri';
        objectValue = quad.object.value;
      }

      triples.push({
        subject,
        predicate,
        object: {
          value: objectValue,
          type: objectType,
          datatype,
          lang,
        },
      });
    }

    return triples;
  } catch (error) {
    console.error('Failed to parse RDF response:', error);
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
