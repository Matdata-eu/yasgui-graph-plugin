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
};

console.log('📦 Mock datasets loaded:', Object.keys(window.mockDatasets));
