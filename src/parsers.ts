import type { RDFTriple, YasrResults } from './types';

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
