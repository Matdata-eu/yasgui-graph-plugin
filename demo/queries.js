// Sample CONSTRUCT queries for testing

const queries = {
  basic: `PREFIX ex: <http://example.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

CONSTRUCT {
  ex:Person1 rdf:type ex:Person .
  ex:Person1 ex:name "Alice" .
  ex:Person1 ex:age "30"^^<http://www.w3.org/2001/XMLSchema#integer> .
  ex:Person1 ex:knows ex:Person2 .
  ex:Person2 rdf:type ex:Person .
  ex:Person2 ex:name "Bob" .
  ex:Person2 ex:age "25"^^<http://www.w3.org/2001/XMLSchema#integer> .
}
WHERE {}`,

  ontology: `PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX ex: <http://example.org/>

CONSTRUCT {
  ex:Person rdf:type owl:Class .
  ex:Organization rdf:type owl:Class .
  ex:name rdf:type owl:DatatypeProperty .
  ex:age rdf:type owl:DatatypeProperty .
  ex:worksFor rdf:type owl:ObjectProperty .
  ex:worksFor rdfs:domain ex:Person .
  ex:worksFor rdfs:range ex:Organization .
}
WHERE {}`,

  blankNodes: `PREFIX ex: <http://example.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

CONSTRUCT {
  ex:Person1 ex:address _:addr1 .
  _:addr1 ex:street "123 Main St" .
  _:addr1 ex:city "Springfield" .
  _:addr1 ex:country "USA" .
  ex:Person2 ex:address _:addr2 .
  _:addr2 ex:street "456 Oak Ave" .
  _:addr2 ex:city "Portland" .
}
WHERE {}`,

  multiplePredicates: `PREFIX ex: <http://example.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

CONSTRUCT {
  ex:Person1 ex:knows ex:Person2 .
  ex:Person1 ex:worksWith ex:Person2 .
  ex:Person1 ex:friendOf ex:Person2 .
  ex:Person2 ex:knows ex:Person3 .
  ex:Person3 ex:knows ex:Person1 .
}
WHERE {}`,

  describe: `PREFIX ex: <http://example.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

# DESCRIBE returns all triples about a resource
DESCRIBE ex:Alice ex:Bob`
};
