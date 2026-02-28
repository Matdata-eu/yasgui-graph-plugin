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
DESCRIBE ex:Alice ex:Bob`,

  iconsAndImages: `PREFIX ex: <http://example.org/>
PREFIX schema: <https://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

# Demo of schema:icon and schema:image for node visualization
# In compact mode, nodes inherit icons/images from their rdf:type classes
CONSTRUCT {
  # Define classes with visual icons
  schema:Person rdf:type owl:Class .
  schema:Person schema:icon "👤" .
  schema:Organization rdf:type owl:Class .
  schema:Organization schema:icon "🏢" .
  schema:Place rdf:type owl:Class .
  schema:Place schema:icon "📍" .
  
  # Alice with custom image (person photo)
  ex:alice rdf:type schema:Person .
  ex:alice schema:name "Alice Johnson" .
  ex:alice schema:image "https://i.pravatar.cc/150?img=1" .
  ex:alice schema:jobTitle "Software Engineer" .
  ex:alice schema:worksFor ex:acme-corp .
  
  # Bob with custom icon (overrides class icon)
  ex:bob rdf:type schema:Person .
  ex:bob schema:name "Bob Smith" .
  ex:bob schema:icon "👨‍💼" .
  ex:bob schema:jobTitle "Product Manager" .
  ex:bob schema:worksFor ex:acme-corp .
  ex:bob schema:knows ex:alice .
  
  # Carol with image
  ex:carol rdf:type schema:Person .
  ex:carol schema:name "Carol Williams" .
  ex:carol schema:image "https://i.pravatar.cc/150?img=5" .
  ex:carol schema:jobTitle "UX Designer" .
  ex:carol schema:worksFor ex:tech-startup .
  ex:carol schema:knows ex:alice .
  
  # Dave inherits class icon (no custom visual)
  ex:dave rdf:type schema:Person .
  ex:dave schema:name "Dave Chen" .
  ex:dave schema:jobTitle "Data Analyst" .
  ex:dave schema:worksFor ex:tech-startup .
  
  # Organizations
  ex:acme-corp rdf:type schema:Organization .
  ex:acme-corp schema:name "ACME Corporation" .
  ex:acme-corp schema:image "https://placehold.co/150/0066cc/white?text=ACME" .
  ex:acme-corp schema:location ex:san-francisco .
  ex:acme-corp schema:location ex:headquarters .
  
  ex:tech-startup rdf:type schema:Organization .
  ex:tech-startup schema:name "TechStart Inc." .
  ex:tech-startup schema:icon "🚀" .
  ex:tech-startup schema:location ex:austin .
  
  # Places
  ex:san-francisco rdf:type schema:Place .
  ex:san-francisco schema:name "San Francisco" .
  ex:san-francisco schema:icon "🌉" .
  
  ex:austin rdf:type schema:Place .
  ex:austin schema:name "Austin, Texas" .
  
  ex:headquarters rdf:type schema:Place .
  ex:headquarters schema:name "ACME HQ Building" .
  ex:headquarters schema:icon "🏛️" .
  ex:headquarters schema:containedInPlace ex:san-francisco .
}
WHERE {}`
};
