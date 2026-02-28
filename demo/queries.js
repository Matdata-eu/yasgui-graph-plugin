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
WHERE {}`,

  inheritanceTest: `PREFIX ex: <http://example.org/>
PREFIX schema: <https://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

# Test cases for icon/image inheritance from rdf:type classes
CONSTRUCT {
  # Define classes with visuals
  ex:Vehicle rdf:type owl:Class .
  ex:Vehicle schema:image "https://placehold.co/150/666666/white?text=Vehicle" .
  
  ex:Animal rdf:type owl:Class .
  ex:Animal schema:icon "🐾" .
  
  ex:Food rdf:type owl:Class .
  ex:Food schema:icon "🍽️" .
  
  ex:Beverage rdf:type owl:Class .
  ex:Beverage schema:icon "🥤" .
  
  # Super classes
  ex:LivingThing rdf:type owl:Class .
  ex:LivingThing schema:icon "🌱" .
  ex:Animal rdfs:subClassOf ex:LivingThing .
  
  ex:Machine rdf:type owl:Class .
  ex:Machine schema:image "https://placehold.co/150/999999/white?text=Machine" .
  ex:Vehicle rdfs:subClassOf ex:Machine .
  
  # Test Case 1: Resource inherits class image
  ex:mycar rdf:type ex:Vehicle .
  ex:mycar rdfs:label "My Car (inherits Vehicle image)" .
  
  # Test Case 2: Resource inherits class icon
  ex:fluffy rdf:type ex:Animal .
  ex:fluffy rdfs:label "Fluffy (inherits Animal icon)" .
  
  # Test Case 3: Resource with 2 types (picks first)
  ex:smoothie rdf:type ex:Food, ex:Beverage .
  ex:smoothie rdfs:label "Smoothie (2 types: Food & Beverage)" .
  
  # Test Case 4: Subclass icon (uses direct class, not superclass)
  ex:rex rdf:type ex:Animal .
  ex:rex rdfs:label "Rex (Animal subclass of LivingThing)" .
  
  # Test Case 5: Subclass image (uses direct class, not superclass)
  ex:tesla rdf:type ex:Vehicle .
  ex:tesla rdfs:label "Tesla (Vehicle subclass of Machine)" .
}
WHERE {}`,

  overrideTest: `PREFIX ex: <http://example.org/>
PREFIX schema: <https://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

# Test cases for resource visuals overriding class visuals
CONSTRUCT {
  # Define classes with default visuals
  ex:Book rdf:type owl:Class .
  ex:Book schema:image "https://placehold.co/150/brown/white?text=Book" .
  
  ex:Music rdf:type owl:Class .
  ex:Music schema:icon "🎵" .
  
  ex:Media rdf:type owl:Class .
  ex:Media schema:image "https://placehold.co/150/purple/white?text=Media" .
  ex:Media schema:icon "📺" .
  
  # Test Case 1: Resource image overrides class image
  ex:myNovel rdf:type ex:Book .
  ex:myNovel rdfs:label "My Novel (custom image overrides Book)" .
  ex:myNovel schema:image "https://placehold.co/150/red/white?text=Novel" .
  
  # Test Case 2: Resource icon overrides class icon
  ex:jazzSong rdf:type ex:Music .
  ex:jazzSong rdfs:label "Jazz Song (custom icon overrides Music)" .
  ex:jazzSong schema:icon "🎷" .
  
  # Test Case 3: Both resource image and icon override class
  ex:myPodcast rdf:type ex:Media .
  ex:myPodcast rdfs:label "My Podcast (both custom icon & image)" .
  ex:myPodcast schema:image "https://placehold.co/150/green/white?text=Podcast" .
  ex:myPodcast schema:icon "🎙️" .
}
WHERE {}`,

  multipleTypesTest: `PREFIX ex: <http://example.org/>
PREFIX schema: <https://schema.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

# Test cases for resources with multiple types having different images
CONSTRUCT {
  # Define classes with different images
  ex:Sport rdf:type owl:Class .
  ex:Sport schema:image "https://placehold.co/150/orange/white?text=Sport" .
  
  ex:Art rdf:type owl:Class .
  ex:Art schema:image "https://placehold.co/150/pink/white?text=Art" .
  
  ex:Science rdf:type owl:Class .
  ex:Science schema:image "https://placehold.co/150/blue/white?text=Science" .
  
  ex:Technology rdf:type owl:Class .
  ex:Technology schema:image "https://placehold.co/150/teal/white?text=Tech" .
  
  # Test Case 1: Resource with 2 types (picks first type's image)
  ex:gymnastics rdf:type ex:Sport, ex:Art .
  ex:gymnastics rdfs:label "Gymnastics (Sport & Art)" .
  
  # Test Case 2: Resource with 3 types (picks first type's image)
  ex:robotics rdf:type ex:Science, ex:Technology, ex:Art .
  ex:robotics rdfs:label "Robotics (Science, Tech & Art)" .
}
WHERE {}`
};

