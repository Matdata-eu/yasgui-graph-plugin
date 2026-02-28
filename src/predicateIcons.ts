/**
 * Icon mappings for the most common RDF predicates (30+).
 *
 * When the user selects "icon" mode for predicate display, these short symbols
 * (rendered as canvas text by vis-network) replace the full prefixed label on
 * each edge, reducing visual clutter while keeping the tooltip for full details.
 */

/**
 * Map from full predicate URI to a short icon/symbol string.
 * Symbols are chosen to be meaningful yet compact so they fit on edges.
 */
export const PREDICATE_ICONS: Record<string, string> = {
  // RDF core
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':         'a',   // Turtle's "a" shorthand
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#value':        'val',

  // RDFS
  'http://www.w3.org/2000/01/rdf-schema#label':              'lbl',
  'http://www.w3.org/2000/01/rdf-schema#comment':            'cmt',
  'http://www.w3.org/2000/01/rdf-schema#subClassOf':         '\u2282', // ⊂
  'http://www.w3.org/2000/01/rdf-schema#subPropertyOf':      '\u2286', // ⊆
  'http://www.w3.org/2000/01/rdf-schema#domain':             'dom',
  'http://www.w3.org/2000/01/rdf-schema#range':              'rng',
  'http://www.w3.org/2000/01/rdf-schema#seeAlso':            'see',
  'http://www.w3.org/2000/01/rdf-schema#isDefinedBy':        'idb',

  // OWL
  'http://www.w3.org/2002/07/owl#sameAs':                    '\u2261', // ≡
  'http://www.w3.org/2002/07/owl#equivalentClass':           '\u2245', // ≅
  'http://www.w3.org/2002/07/owl#inverseOf':                 '\u21C4', // ⇄
  'http://www.w3.org/2002/07/owl#disjointWith':              '\u2260', // ≠

  // SKOS
  'http://www.w3.org/2004/02/skos/core#prefLabel':           '\u2605', // ★
  'http://www.w3.org/2004/02/skos/core#altLabel':            '\u2606', // ☆
  'http://www.w3.org/2004/02/skos/core#definition':          'def',
  'http://www.w3.org/2004/02/skos/core#broader':             '\u2191', // ↑
  'http://www.w3.org/2004/02/skos/core#narrower':            '\u2193', // ↓
  'http://www.w3.org/2004/02/skos/core#related':             '\u2194', // ↔
  'http://www.w3.org/2004/02/skos/core#note':                'note',
  'http://www.w3.org/2004/02/skos/core#exactMatch':          '\u2261', // ≡
  'http://www.w3.org/2004/02/skos/core#closeMatch':          '\u2248', // ≈

  // Dublin Core Terms
  'http://purl.org/dc/terms/title':                          'ttl',
  'http://purl.org/dc/terms/description':                    'dsc',
  'http://purl.org/dc/terms/created':                        'crt',
  'http://purl.org/dc/terms/modified':                       'mod',
  'http://purl.org/dc/terms/creator':                        'by',
  'http://purl.org/dc/terms/subject':                        'sbj',

  // FOAF
  'http://xmlns.com/foaf/0.1/name':                          'nm',
  'http://xmlns.com/foaf/0.1/knows':                         '\u27F7', // ⟷
  'http://xmlns.com/foaf/0.1/member':                        'mbr',

  // Schema.org
  'http://schema.org/name':                                  'nm',
  'http://schema.org/description':                           'dsc',
};

/**
 * Return the icon/symbol for a predicate URI, falling back to undefined if none defined.
 * @param predicateUri - Full predicate URI
 */
export function getPredicateIcon(predicateUri: string): string | undefined {
  return PREDICATE_ICONS[predicateUri];
}
