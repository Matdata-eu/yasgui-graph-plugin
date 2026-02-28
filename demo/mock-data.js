/**
 * Mock SPARQL CONSTRUCT/DESCRIBE query results for standalone testing
 *
 * Each dataset includes:
 * - head: Variable names (always subject, predicate, object for CONSTRUCT)
 * - results.bindings: Array of RDF triples (subject, predicate, object)
 * - prefixes: Prefix map for URI shortening
 */

window.mockDatasets = {
  basic: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/name' },
          object: { type: 'literal', value: 'Alice' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/age' },
          object: {
            type: 'literal',
            value: '30',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/knows' },
          object: { type: 'uri', value: 'http://example.org/Person2' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person2' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person2' },
          predicate: { type: 'uri', value: 'http://example.org/name' },
          object: { type: 'literal', value: 'Bob' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person2' },
          predicate: { type: 'uri', value: 'http://example.org/age' },
          object: {
            type: 'literal',
            value: '25',
            datatype: 'http://www.w3.org/2001/XMLSchema#integer',
          },
        },
      ],
    },
    prefixes: {
      ex: 'http://example.org/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
    },
  },

  social: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        // Alice
        {
          subject: { type: 'uri', value: 'http://example.org/Alice' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Alice' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
          object: { type: 'literal', value: 'Alice Smith' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Alice' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/knows' },
          object: { type: 'uri', value: 'http://example.org/Bob' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Alice' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/knows' },
          object: { type: 'uri', value: 'http://example.org/Carol' },
        },
        // Bob
        {
          subject: { type: 'uri', value: 'http://example.org/Bob' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Bob' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
          object: { type: 'literal', value: 'Bob Johnson' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Bob' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/knows' },
          object: { type: 'uri', value: 'http://example.org/David' },
        },
        // Carol
        {
          subject: { type: 'uri', value: 'http://example.org/Carol' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Carol' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
          object: { type: 'literal', value: 'Carol Williams' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Carol' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/knows' },
          object: { type: 'uri', value: 'http://example.org/Eve' },
        },
        // David
        {
          subject: { type: 'uri', value: 'http://example.org/David' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/David' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
          object: { type: 'literal', value: 'David Brown' },
        },
        // Eve
        {
          subject: { type: 'uri', value: 'http://example.org/Eve' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Eve' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
          object: { type: 'literal', value: 'Eve Davis' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Eve' },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/knows' },
          object: { type: 'uri', value: 'http://example.org/Alice' },
        },
      ],
    },
    prefixes: {
      ex: 'http://example.org/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    },
  },

  ontology: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        {
          subject: { type: 'uri', value: 'http://example.org/Person' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Organization' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Employee' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Employee' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#subClassOf' },
          object: { type: 'uri', value: 'http://example.org/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/name' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#DatatypeProperty' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/age' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#DatatypeProperty' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/worksFor' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#ObjectProperty' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/worksFor' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#domain' },
          object: { type: 'uri', value: 'http://example.org/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/worksFor' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#range' },
          object: { type: 'uri', value: 'http://example.org/Organization' },
        },
      ],
    },
    prefixes: {
      ex: 'http://example.org/',
      owl: 'http://www.w3.org/2002/07/owl#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    },
  },

  blankNodes: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/name' },
          object: { type: 'literal', value: 'Alice' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/address' },
          object: { type: 'bnode', value: '_:addr1' },
        },
        {
          subject: { type: 'bnode', value: '_:addr1' },
          predicate: { type: 'uri', value: 'http://example.org/street' },
          object: { type: 'literal', value: '123 Main St' },
        },
        {
          subject: { type: 'bnode', value: '_:addr1' },
          predicate: { type: 'uri', value: 'http://example.org/city' },
          object: { type: 'literal', value: 'Springfield' },
        },
        {
          subject: { type: 'bnode', value: '_:addr1' },
          predicate: { type: 'uri', value: 'http://example.org/country' },
          object: { type: 'literal', value: 'USA' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person2' },
          predicate: { type: 'uri', value: 'http://example.org/name' },
          object: { type: 'literal', value: 'Bob' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person2' },
          predicate: { type: 'uri', value: 'http://example.org/address' },
          object: { type: 'bnode', value: '_:addr2' },
        },
        {
          subject: { type: 'bnode', value: '_:addr2' },
          predicate: { type: 'uri', value: 'http://example.org/street' },
          object: { type: 'literal', value: '456 Oak Ave' },
        },
        {
          subject: { type: 'bnode', value: '_:addr2' },
          predicate: { type: 'uri', value: 'http://example.org/city' },
          object: { type: 'literal', value: 'Portland' },
        },
      ],
    },
    prefixes: { ex: 'http://example.org/' },
  },

  multiEdges: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/knows' },
          object: { type: 'uri', value: 'http://example.org/Person2' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/worksWith' },
          object: { type: 'uri', value: 'http://example.org/Person2' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/friendOf' },
          object: { type: 'uri', value: 'http://example.org/Person2' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person1' },
          predicate: { type: 'uri', value: 'http://example.org/manages' },
          object: { type: 'uri', value: 'http://example.org/Person2' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person2' },
          predicate: { type: 'uri', value: 'http://example.org/knows' },
          object: { type: 'uri', value: 'http://example.org/Person3' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Person3' },
          predicate: { type: 'uri', value: 'http://example.org/knows' },
          object: { type: 'uri', value: 'http://example.org/Person1' },
        },
      ],
    },
    prefixes: { ex: 'http://example.org/' },
  },

  empty: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: { bindings: [] },
    prefixes: {},
  },

  longStrings: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        {
          subject: { type: 'uri', value: 'http://example.org/Document1' },
          predicate: { type: 'uri', value: 'http://example.org/title' },
          object: {
            type: 'literal',
            value:
              'A Very Long Title That Should Be Truncated In The Visualization Because It Contains Way Too Much Text For A Node Label And Would Make The Graph Unreadable',
          },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Document1' },
          predicate: { type: 'uri', value: 'http://example.org/description' },
          object: {
            type: 'literal',
            value:
              'This is a very long description that contains multiple sentences and a lot of information. It should test how the plugin handles long text values. The text goes on and on and on, providing detailed information about the document that may or may not be relevant to the visualization. This is the kind of real-world data that applications need to handle gracefully.',
          },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Document1' },
          predicate: { type: 'uri', value: 'http://example.org/relatedTo' },
          object: { type: 'uri', value: 'http://example.org/Document2' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Document2' },
          predicate: { type: 'uri', value: 'http://example.org/title' },
          object: { type: 'literal', value: 'Short Title' },
        },
      ],
    },
    prefixes: { ex: 'http://example.org/' },
  },

  specialChars: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        {
          subject: { type: 'uri', value: 'http://example.org/Müller' },
          predicate: { type: 'uri', value: 'http://example.org/name' },
          object: { type: 'literal', value: 'Hans Müller' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Müller' },
          predicate: { type: 'uri', value: 'http://example.org/email' },
          object: { type: 'literal', value: 'hans@müller.de' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/José' },
          predicate: { type: 'uri', value: 'http://example.org/name' },
          object: { type: 'literal', value: 'José García' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/文字' },
          predicate: { type: 'uri', value: 'http://example.org/name' },
          object: { type: 'literal', value: '漢字テスト' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Müller' },
          predicate: { type: 'uri', value: 'http://example.org/knows' },
          object: { type: 'uri', value: 'http://example.org/José' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/test' },
          predicate: { type: 'uri', value: 'http://example.org/symbols' },
          object: { type: 'literal', value: '!@#$%^&*()_+-={}[]|\\:";\'<>?,./' },
        },
      ],
    },
    prefixes: { ex: 'http://example.org/' },
  },

  iconsAndImages: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        // Define classes with icons/images for inheritance in compact mode
        {
          subject: { type: 'uri', value: 'https://schema.org/Person' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'https://schema.org/Person' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '👤' },
        },
        {
          subject: { type: 'uri', value: 'https://schema.org/Organization' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'https://schema.org/Organization' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🏢' },
        },
        {
          subject: { type: 'uri', value: 'https://schema.org/Place' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'https://schema.org/Place' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '📍' },
        },

        // Alice - Person with a custom image
        {
          subject: { type: 'uri', value: 'http://example.org/alice' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/alice' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'Alice Johnson' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/alice' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://i.pravatar.cc/150?img=1' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/alice' },
          predicate: { type: 'uri', value: 'https://schema.org/jobTitle' },
          object: { type: 'literal', value: 'Software Engineer' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/alice' },
          predicate: { type: 'uri', value: 'https://schema.org/worksFor' },
          object: { type: 'uri', value: 'http://example.org/acme-corp' },
        },

        // Bob - Person with custom icon (overrides class icon)
        {
          subject: { type: 'uri', value: 'http://example.org/bob' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/bob' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'Bob Smith' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/bob' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '👨‍💼' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/bob' },
          predicate: { type: 'uri', value: 'https://schema.org/jobTitle' },
          object: { type: 'literal', value: 'Product Manager' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/bob' },
          predicate: { type: 'uri', value: 'https://schema.org/worksFor' },
          object: { type: 'uri', value: 'http://example.org/acme-corp' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/bob' },
          predicate: { type: 'uri', value: 'https://schema.org/knows' },
          object: { type: 'uri', value: 'http://example.org/alice' },
        },

        // Carol - Person with image URL
        {
          subject: { type: 'uri', value: 'http://example.org/carol' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/carol' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'Carol Williams' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/carol' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://i.pravatar.cc/150?img=5' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/carol' },
          predicate: { type: 'uri', value: 'https://schema.org/jobTitle' },
          object: { type: 'literal', value: 'UX Designer' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/carol' },
          predicate: { type: 'uri', value: 'https://schema.org/worksFor' },
          object: { type: 'uri', value: 'http://example.org/tech-startup' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/carol' },
          predicate: { type: 'uri', value: 'https://schema.org/knows' },
          object: { type: 'uri', value: 'http://example.org/alice' },
        },

        // Dave - Person inheriting default class icon
        {
          subject: { type: 'uri', value: 'http://example.org/dave' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Person' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/dave' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'Dave Chen' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/dave' },
          predicate: { type: 'uri', value: 'https://schema.org/jobTitle' },
          object: { type: 'literal', value: 'Data Analyst' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/dave' },
          predicate: { type: 'uri', value: 'https://schema.org/worksFor' },
          object: { type: 'uri', value: 'http://example.org/tech-startup' },
        },

        // ACME Corp - Organization with custom image
        {
          subject: { type: 'uri', value: 'http://example.org/acme-corp' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Organization' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/acme-corp' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'ACME Corporation' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/acme-corp' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/0066cc/white?text=ACME' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/acme-corp' },
          predicate: { type: 'uri', value: 'https://schema.org/location' },
          object: { type: 'uri', value: 'http://example.org/san-francisco' },
        },

        // Tech Startup - Organization with custom icon
        {
          subject: { type: 'uri', value: 'http://example.org/tech-startup' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Organization' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/tech-startup' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'TechStart Inc.' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/tech-startup' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🚀' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/tech-startup' },
          predicate: { type: 'uri', value: 'https://schema.org/location' },
          object: { type: 'uri', value: 'http://example.org/austin' },
        },

        // San Francisco - Place with custom icon
        {
          subject: { type: 'uri', value: 'http://example.org/san-francisco' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Place' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/san-francisco' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'San Francisco' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/san-francisco' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🌉' },
        },

        // Austin - Place inheriting default class icon
        {
          subject: { type: 'uri', value: 'http://example.org/austin' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Place' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/austin' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'Austin, Texas' },
        },

        // Building - with custom emoji
        {
          subject: { type: 'uri', value: 'http://example.org/headquarters' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'https://schema.org/Place' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/headquarters' },
          predicate: { type: 'uri', value: 'https://schema.org/name' },
          object: { type: 'literal', value: 'ACME HQ Building' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/headquarters' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🏛️' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/headquarters' },
          predicate: { type: 'uri', value: 'https://schema.org/containedInPlace' },
          object: { type: 'uri', value: 'http://example.org/san-francisco' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/acme-corp' },
          predicate: { type: 'uri', value: 'https://schema.org/location' },
          object: { type: 'uri', value: 'http://example.org/headquarters' },
        },
      ],
    },
    prefixes: {
      ex: 'http://example.org/',
      schema: 'https://schema.org/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      owl: 'http://www.w3.org/2002/07/owl#',
    },
  },

  large: (() => {
    const bindings = [];
    const numPeople = 50;

    for (let i = 1; i <= numPeople; i++) {
      bindings.push(
        {
          subject: { type: 'uri', value: `http://example.org/Person${i}` },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/Person' },
        },
        {
          subject: { type: 'uri', value: `http://example.org/Person${i}` },
          predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/name' },
          object: { type: 'literal', value: `Person ${i}` },
        }
      );

      const numConnections = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numConnections; j++) {
        const target = Math.floor(Math.random() * numPeople) + 1;
        if (target !== i) {
          bindings.push({
            subject: { type: 'uri', value: `http://example.org/Person${i}` },
            predicate: { type: 'uri', value: 'http://xmlns.com/foaf/0.1/knows' },
            object: { type: 'uri', value: `http://example.org/Person${target}` },
          });
        }
      }
    }

    return {
      head: { vars: ['subject', 'predicate', 'object'] },
      results: { bindings },
      prefixes: {
        ex: 'http://example.org/',
        foaf: 'http://xmlns.com/foaf/0.1/',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      },
    };
  })(),

  inheritanceTest: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        // Class definitions with visuals
        {
          subject: { type: 'uri', value: 'http://example.org/Vehicle' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Vehicle' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/666666/white?text=Vehicle' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Animal' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Animal' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🐾' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Food' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Food' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🍽️' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Beverage' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Beverage' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🥤' },
        },
        
        // Super classes
        {
          subject: { type: 'uri', value: 'http://example.org/LivingThing' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/LivingThing' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🌱' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Animal' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#subClassOf' },
          object: { type: 'uri', value: 'http://example.org/LivingThing' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Machine' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Machine' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/999999/white?text=Machine' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Vehicle' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#subClassOf' },
          object: { type: 'uri', value: 'http://example.org/Machine' },
        },

        // Test Case 1: Resource with type that has schema:image (should inherit image)
        {
          subject: { type: 'uri', value: 'http://example.org/mycar' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Vehicle' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/mycar' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'My Car (inherits Vehicle image)' },
        },

        // Test Case 2: Resource with type that has schema:icon (should inherit icon)
        {
          subject: { type: 'uri', value: 'http://example.org/fluffy' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Animal' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/fluffy' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'Fluffy (inherits Animal icon)' },
        },

        // Test Case 3: Resource with 2 types both having schema:icon (should pick first)
        {
          subject: { type: 'uri', value: 'http://example.org/smoothie' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Food' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/smoothie' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Beverage' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/smoothie' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'Smoothie (2 types: Food & Beverage)' },
        },

        // Test Case 4: Resource with type that has icon, type is subclass of another with icon
        // (should use direct class icon, not superclass)
        {
          subject: { type: 'uri', value: 'http://example.org/rex' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Animal' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/rex' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'Rex (Animal subclass of LivingThing)' },
        },

        // Test Case 5: Resource with type that has image, type is subclass of another with image
        // (should use direct class image, not superclass)
        {
          subject: { type: 'uri', value: 'http://example.org/tesla' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Vehicle' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/tesla' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'Tesla (Vehicle subclass of Machine)' },
        },
      ],
    },
    prefixes: {
      ex: 'http://example.org/',
      schema: 'https://schema.org/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
    },
  },

  overrideTest: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        // Class definitions with default visuals
        {
          subject: { type: 'uri', value: 'http://example.org/Book' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Book' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/brown/white?text=Book' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Music' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Music' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🎵' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Media' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Media' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/purple/white?text=Media' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Media' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '📺' },
        },

        // Test Case 1: Resource with schema:image that overrides type's schema:image
        {
          subject: { type: 'uri', value: 'http://example.org/myNovel' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Book' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/myNovel' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'My Novel (custom image overrides Book)' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/myNovel' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/red/white?text=Novel' },
        },

        // Test Case 2: Resource with schema:icon that overrides type's schema:icon
        {
          subject: { type: 'uri', value: 'http://example.org/jazzSong' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Music' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/jazzSong' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'Jazz Song (custom icon overrides Music)' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/jazzSong' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🎷' },
        },

        // Test Case 3: Resource with both image and icon, type also has both (resource wins)
        {
          subject: { type: 'uri', value: 'http://example.org/myPodcast' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Media' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/myPodcast' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'My Podcast (both custom icon & image)' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/myPodcast' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/green/white?text=Podcast' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/myPodcast' },
          predicate: { type: 'uri', value: 'https://schema.org/icon' },
          object: { type: 'literal', value: '🎙️' },
        },
      ],
    },
    prefixes: {
      ex: 'http://example.org/',
      schema: 'https://schema.org/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
    },
  },

  multipleTypesTest: {
    head: { vars: ['subject', 'predicate', 'object'] },
    results: {
      bindings: [
        // Class definitions with different images
        {
          subject: { type: 'uri', value: 'http://example.org/Sport' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Sport' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/orange/white?text=Sport' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Art' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Art' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/pink/white?text=Art' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Science' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Science' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/blue/white?text=Science' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Technology' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://www.w3.org/2002/07/owl#Class' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/Technology' },
          predicate: { type: 'uri', value: 'https://schema.org/image' },
          object: { type: 'literal', value: 'https://placehold.co/150/teal/white?text=Tech' },
        },

        // Test Case 1: Resource with 2 types both having different schema:image
        // (should pick first type's image)
        {
          subject: { type: 'uri', value: 'http://example.org/gymnastics' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Sport' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/gymnastics' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Art' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/gymnastics' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'Gymnastics (Sport & Art)' },
        },

        // Test Case 2: Resource with 3 types all having different schema:image
        // (should pick first type's image)
        {
          subject: { type: 'uri', value: 'http://example.org/robotics' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Science' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/robotics' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Technology' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/robotics' },
          predicate: { type: 'uri', value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
          object: { type: 'uri', value: 'http://example.org/Art' },
        },
        {
          subject: { type: 'uri', value: 'http://example.org/robotics' },
          predicate: { type: 'uri', value: 'http://www.w3.org/2000/01/rdf-schema#label' },
          object: { type: 'literal', value: 'Robotics (Science, Tech & Art)' },
        },
      ],
    },
    prefixes: {
      ex: 'http://example.org/',
      schema: 'https://schema.org/',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
    },
  },
};

console.log('📦 Mock datasets loaded:', Object.keys(window.mockDatasets));
