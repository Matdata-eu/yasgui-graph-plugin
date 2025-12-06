# Research: SPARQL CONSTRUCT Graph Visualization

**Feature**: `001-construct-graph-viz`  
**Date**: 2025-12-05  
**Purpose**: Resolve technical unknowns and establish implementation approach

## Executive Summary

**Decision**: Use **vis-network** for graph visualization with YASR plugin architecture pattern from yasgui-geo example.

**Key Findings**:
- vis-network provides built-in force-directed layout, zoom/pan and drag nodes capabilities
- YASR plugin pattern requires: constructor, canHandleResults(), draw(), getIcon(), priority, label
- No additional layout libraries needed - vis-network handles all requirements
- Browser compatibility excellent (ES2018+ with Canvas rendering)

## Research Areas

### 1. Graph Visualization Library

**Question**: Which library best supports force-directed layout, interactive manipulation, and performance requirements?

**Options Evaluated**:
- **vis-network** (selected)
- D3.js force simulation
- Cytoscape.js
- Sigma.js

**Selection: vis-network**

**Rationale**:
- **Built-in physics engine**: Force-directed and hierarchical layouts out of the box, no additional configuration
- **Interaction model**: Native support for zoom (mouse wheel), pan (drag background), node dragging, tooltips (hover events)
- **Performance**: Handles 1000+ nodes smoothly with physics stabilization optimization
- **API simplicity**: `Network(container, data, options)` - single constructor with straightforward data model
- **Browser compatibility**: Canvas-based rendering, works on all modern browsers (Chrome, Firefox, Safari, Edge)
- **Size**: ~500KB minified (~150KB gzipped) - reasonable for functionality provided
- **Active maintenance**: Part of vis.js ecosystem, regular updates

**Alternatives Rejected**:
- **D3.js**: More flexible but requires manual implementation of layout, zoom behavior, drag interactions - increases complexity and dev time
- **Cytoscape.js**: Powerful but optimized for biological networks, heavier API, less intuitive for RDF triples
- **Sigma.js**: Good performance but limited layout options, less mature ecosystem

**Integration Approach**:
```javascript
import { Network } from 'vis-network/standalone';

// Data format
const data = {
  nodes: new DataSet([
    {id: 1, label: 'ex:Person', color: '#0000FF'},
    {id: 2, label: '"John"', color: '#808080'}
  ]),
  edges: new DataSet([
    {from: 1, to: 2, label: 'ex:name'}
  ])
};

// Options for force-directed layout
const options = {
  physics: {
    enabled: true,
    stabilization: {iterations: 200}
  },
  interaction: {
    dragNodes: true,
    zoomView: true,
    dragView: true
  }
};

const network = new Network(container, data, options);
```

### 2. YASR Plugin Architecture

**Question**: How should the plugin integrate with YASGUI/YASR to detect CONSTRUCT results and render graphs?

**Pattern Source**: yasgui-geo plugin (analyzed from example/index.js)

**Required Plugin Structure**:
```javascript
class GraphPlugin {
  constructor(yasr) {
    this.yasr = yasr;           // YASR instance reference
    this.priority = 30;         // Display order (higher = earlier)
    this.label = 'Graph';       // Tab label
    // Plugin-specific state
  }

  canHandleResults() {
    // Return true if results are CONSTRUCT triples
    // Check: this.yasr.results.json format
    return /* detection logic */;
  }

  async draw() {
    // Called when plugin tab is selected
    // 1. Parse triples from this.yasr.results.json
    // 2. Transform to vis-network data format
    // 3. Create/update Network instance
    // 4. Append to this.yasr.resultsEl
  }

  getIcon() {
    // Return HTMLElement for tab icon
    const icon = document.createElement('div');
    icon.innerHTML = '🔗'; // or SVG
    return icon;
  }
}

// Registration
Yasgui.Yasr.registerPlugin('graph', GraphPlugin);
```

**Key Insights from yasgui-geo**:
- **Constructor**: Initialize state, set priority/label, reference yasr instance
- **canHandleResults()**: Guard method - return true only for compatible result types (geo plugin checks for geometry datatypes)
- **draw()**: Main rendering method - called when tab is active, access results via `this.yasr.results.json.results.bindings`
- **Lifecycle**: Plugin persists across queries, must handle cleanup/update of previous visualizations
- **Container management**: Create DOM elements, append to `this.yasr.resultsEl`, manage sizing

**CONSTRUCT Result Detection**:
```javascript
canHandleResults() {
  const results = this.yasr.results?.json;
  // CONSTRUCT returns different structure than SELECT
  // Need to check for triples array or specific format
  // May be in results.json.results.bindings with subject/predicate/object pattern
  // Or results.json['@graph'] for JSON-LD
  return /* check for RDF triple structure */;
}
```

**Decision**: Follow yasgui-geo plugin pattern exactly, substituting:
- Leaflet → vis-network
- Geometry column detection → CONSTRUCT triple detection
- GeoJSON conversion → vis-network node/edge format

### 3. RDF Triple Parsing

**Question**: How to parse SPARQL CONSTRUCT results from YASR into graph nodes and edges?

**CONSTRUCT Result Formats** (YASR may provide):
- **JSON-LD**: `{"@graph": [{subject, predicate, object}, ...]}`
- **Bindings format**: `{results: {bindings: [{s, p, o}, ...]}}`
- **N-Triples/Turtle**: String format (less likely in browser context)

**Parsing Strategy**:
```javascript
function parseConstructResults(results) {
  const triples = [];
  
  // Try JSON-LD format
  if (results['@graph']) {
    results['@graph'].forEach(triple => {
      triples.push({
        subject: triple['@id'] || triple.subject,
        predicate: triple.predicate,
        object: triple.object
      });
    });
  }
  
  // Try bindings format
  if (results.results?.bindings) {
    results.results.bindings.forEach(binding => {
      if (binding.s && binding.p && binding.o) {
        triples.push({
          subject: binding.s.value,
          predicate: binding.p.value,
          object: {
            value: binding.o.value,
            type: binding.o.type, // 'uri' or 'literal'
            datatype: binding.o.datatype
          }
        });
      }
    });
  }
  
  return triples;
}
```

**Node/Edge Extraction**:
```javascript
function triplesToGraph(triples, prefixes) {
  const nodes = new Map(); // id -> node data
  const edges = [];
  let nodeId = 0;

  triples.forEach(triple => {
    // Create subject node
    if (!nodes.has(triple.subject)) {
      nodes.set(triple.subject, {
        id: nodeId++,
        uri: triple.subject,
        label: applyPrefix(triple.subject, prefixes),
        color: determineColor(triple.subject, triples),
        type: 'uri'
      });
    }

    // Create object node
    const objIsUri = triple.object.type === 'uri';
    const objKey = objIsUri ? triple.object.value : `literal_${nodeId}`;
    
    if (!nodes.has(objKey)) {
      nodes.set(objKey, {
        id: nodeId++,
        uri: objIsUri ? triple.object.value : null,
        label: objIsUri 
          ? applyPrefix(triple.object.value, prefixes)
          : triple.object.value,
        color: objIsUri ? determineColor(triple.object.value, triples) : '#808080',
        type: objIsUri ? 'uri' : 'literal'
      });
    }

    // Create edge
    edges.push({
      from: nodes.get(triple.subject).id,
      to: nodes.get(objKey).id,
      label: applyPrefix(triple.predicate, prefixes),
      predicate: triple.predicate
    });
  });

  return {
    nodes: Array.from(nodes.values()),
    edges
  };
}
```

**Decision**: Parse from bindings format first (most common), fallback to JSON-LD. Extract nodes as Map to deduplicate, then convert to vis-network DataSet.

### 4. Color Coding Logic

**Question**: How to implement the color scheme (grey for literals, green for rdf:type objects, blue for other URIs)?

**Implementation**:
```javascript
function determineColor(uri, allTriples) {
  // Check if this URI is object of rdf:type predicate
  const isTypeObject = allTriples.some(t => 
    t.predicate === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
    t.object.value === uri
  );
  
  if (isTypeObject) return '#00FF00'; // Green
  return '#0000FF'; // Blue
}

// In triplesToGraph:
color: triple.object.type === 'literal' 
  ? '#808080' // Grey for literals
  : determineColor(triple.object.value, triples)
```

**vis-network color options**:
```javascript
nodes: {
  color: {
    background: '#0000FF',
    border: '#0000CC',
    highlight: { background: '#0066FF', border: '#0044CC' }
  }
}
```

**Decision**: Calculate color during node creation, pass to vis-network node data. Use hex codes: `#808080` (grey), `#00FF00` (green), `#0000FF` (blue).

### 5. Prefix Handling

**Question**: How to extract and apply namespace prefixes for readable labels?

**Prefix Extraction from YASR**:
```javascript
function extractPrefixes(yasrResults) {
  // YASR may provide prefixes in query metadata
  const prefixes = yasrResults.prefixes || {};
  
  // Common defaults
  return {
    'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
    'xsd': 'http://www.w3.org/2001/XMLSchema#',
    ...prefixes
  };
}

function applyPrefix(uri, prefixes) {
  for (const [prefix, namespace] of Object.entries(prefixes)) {
    if (uri.startsWith(namespace)) {
      return uri.replace(namespace, `${prefix}:`);
    }
  }
  
  // No prefix found - truncate long URIs
  if (uri.length > 40) {
    const parts = uri.split(/[/#]/);
    return `...${parts[parts.length - 1]}`;
  }
  
  return uri;
}
```

**Decision**: Extract prefixes from YASR query context, apply to all URIs. Include common RDF/RDFS/XSD defaults. Truncate unprefixed URIs with ellipsis.

### 6. Performance Optimization

**Question**: How to meet <2s rendering target for 1000 nodes?

**vis-network performance options**:
```javascript
const options = {
  physics: {
    stabilization: {
      enabled: true,
      iterations: 200, // Limit iterations for faster initial render
      updateInterval: 25
    },
    barnesHut: {
      gravitationalConstant: -80000,
      springConstant: 0.001,
      springLength: 200
    }
  },
  layout: {
    improvedLayout: true,
    hierarchical: false // Force-directed faster for most cases
  }
};
```

**Optimization strategies**:
- **Disable physics after stabilization**: `network.once('stabilizationIterationsDone', () => network.setOptions({physics: false}))`
- **Reduce rendering quality during interaction**: vis-network handles this automatically
- **Lazy loading for huge graphs**: Only render visible nodes (future enhancement for >1000 nodes)

**Decision**: Use default physics settings with 200 iteration limit. Disable physics after stabilization to improve interaction performance. Monitor performance in testing phase.

### 7. Responsive Layout

**Question**: How to ensure graph fills 100% of YASR container space?

**CSS approach**:
```javascript
this.container = document.createElement('div');
this.container.style.height = '100%';
this.container.style.width = '100%';
this.container.style.minHeight = '500px'; // Fallback for undefined container
```

**vis-network options**:
```javascript
const options = {
  autoResize: true,
  height: '100%',
  width: '100%'
};
```

**Resize handling**:
```javascript
// Listen for container resize
window.addEventListener('resize', () => {
  network.fit(); // Recalculate viewport
});

// Force resize after mount
setTimeout(() => network.fit(), 100);
```

**Decision**: Set container to 100% width/height, enable autoResize in vis-network, call fit() after mount and on window resize. YASR container sizing should propagate automatically.

## Technology Stack Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| Graph Visualization | vis-network | 9.x | Complete solution for interactive graphs, force-directed layout, excellent performance |
| Build Tool | Vite/esbuild | Latest | Fast builds, ES modules, already used in demo setup |
| JavaScript | ES2018+ | - | Transpiled for browser compat per constitution |
| Module Format | ES Module (dev), UMD (dist) | - | Plugin registration requires UMD for Yasgui.Yasr.registerPlugin |
| Testing | Manual browser testing | - | Per constitution - automated tests optional |
| Bundling | esbuild | Latest | Fast, simple config, produces UMD output |

## Dependencies

**Production**:
- `vis-network`: ^9.1.9 (standalone version, no vis-data dependency)

**Development**:
- `@zazuko/yasgui`: ^4.x (peer dependency, not bundled)
- `esbuild`: For bundling
- `eslint`: Code quality per constitution
- `prettier`: Formatting per constitution

**Peer Dependencies** (not bundled):
- YASGUI/YASR: Provided by host application

## Implementation Phases

### Phase 0: Research ✅
- Library selection
- YASR plugin pattern analysis
- RDF parsing approach

### Phase 1: Core Visualization (P1)
- CONSTRUCT result detection (canHandleResults)
- Triple parsing to nodes/edges
- vis-network integration
- Color coding logic
- Prefix application
- Basic rendering (draw method)

### Phase 2: Navigation (P2)
- Zoom controls (mouse wheel - built-in)
- Pan controls (drag - built-in)
- Fit-to-view button (network.fit())
- Responsive container sizing

### Phase 3: Layout Manipulation (P3)
- Node dragging (built-in, enable in options)
- Position persistence during zoom/pan

### Phase 4: Inspection (P4)
- Hover tooltips (vis-network hover events + custom overlay)
- Show full URI/literal/datatype

### Phase 5: Edge Cases & Polish
- Empty state handling
- Self-loop rendering (vis-network supports)
- Label truncation
- Duplicate triple deduplication
- Performance testing with 1000+ nodes

## Open Questions (Deferred to Planning)

None - all critical technical unknowns resolved. Remaining questions are implementation details:
- Exact hex color values (resolved: #808080, #00FF00, #0000FF)
- Tooltip styling (CSS, standard approach)
- Error messaging for unsupported results (empty state div with message)

## References

- [vis-network documentation](https://visjs.github.io/vis-network/docs/network/)
- [vis-network examples](https://visjs.github.io/vis-network/examples/)
- YASGUI plugin example: `example/index.js` (yasgui-geo pattern)
- Constitution: `.specify/memory/constitution.md`
