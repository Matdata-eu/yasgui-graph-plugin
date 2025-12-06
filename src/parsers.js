/**
 * Parse SPARQL CONSTRUCT results to extract RDF triples
 * @param {Object} yasrResults - YASR results object
 * @returns {Array<Object>} Array of RDFTriple objects {subject, predicate, object}
 */
function parseConstructResults(yasrResults) {
  const triples = [];
  
  if (!yasrResults || !yasrResults.getBindings) {
    return triples;
  }
  
  const bindings = yasrResults.getBindings();
  
  bindings.forEach((binding) => {
    if (!binding.subject || !binding.predicate || !binding.object) {
      return; // Skip incomplete bindings
    }
    
    const triple = {
      subject: binding.subject.value,
      predicate: binding.predicate.value,
      object: {
        value: binding.object.value,
        type: binding.object.type || 'uri',
        datatype: binding.object.datatype,
        lang: binding.object['xml:lang'],
      },
    };
    
    triples.push(triple);
  });
  
  return triples;
}

export {
  parseConstructResults,
};
