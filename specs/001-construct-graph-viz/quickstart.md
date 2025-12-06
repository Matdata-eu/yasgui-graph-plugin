# Quick Start Guide: yasgui-graph-plugin

**Version**: 1.0.0  
**Date**: 2025-12-05  
**Audience**: Developers integrating SPARQL CONSTRUCT graph visualization

## Prerequisites

- **Node.js**: v16+ (for development)
- **Browser**: Latest Chrome, Firefox, Safari, or Edge
- **YASGUI/YASR**: v4.x (@zazuko/yasgui)
- **Basic knowledge**: JavaScript ES2018+, SPARQL, RDF

## Installation

### Option 1: NPM Package (Recommended)

```bash
npm install yasgui-graph-plugin
```

```javascript
import GraphPlugin from 'yasgui-graph-plugin';
import Yasgui from '@zazuko/yasgui';
import '@zazuko/yasgui/build/yasgui.min.css';

// Register plugin
Yasgui.Yasr.registerPlugin('graph', GraphPlugin);

// Create YASGUI instance
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  requestConfig: { endpoint: 'https://your-sparql-endpoint.example/sparql' },
  yasqe: { /* YASQE config */ },
  yasr: { 
    defaultPlugin: 'graph' // Optional: Set as default visualization
  }
});
```

### Option 2: CDN (UMD Bundle)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@zazuko/yasgui/build/yasgui.min.css"/>
  <style>
    #yasgui { height: 100vh; }
  </style>
</head>
<body>
  <div id="yasgui"></div>
  
  <script src="https://unpkg.com/@zazuko/yasgui/build/yasgui.min.js"></script>
  <script src="https://unpkg.com/yasgui-graph-plugin/dist/yasgui-graph-plugin.min.js"></script>
  
  <script>
    // Plugin auto-registers when loaded
    const yasgui = new Yasgui(document.getElementById('yasgui'), {
      requestConfig: { endpoint: 'https://your-sparql-endpoint.example/sparql' }
    });
  </script>
</body>
</html>
```

## Basic Usage

### 1. Execute CONSTRUCT or DESCRIBE Query

The plugin automatically activates for SPARQL CONSTRUCT queries that return triples:

```sparql
PREFIX ex: <http://example.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

CONSTRUCT {
  ?person rdf:type ex:Person .
  ?person ex:name ?name .
  ?person ex:knows ?friend .
}
WHERE {
  ?person rdf:type ex:Person .
  ?person ex:name ?name .
  OPTIONAL { ?person ex:knows ?friend }
}
LIMIT 100
```

### 2. View Graph Visualization

1. Execute the query in YASGUI
2. Click the **"Graph"** tab in the results panel
3. Interact with the visualization:
   - **Zoom**: Mouse wheel or pinch gesture
   - **Pan**: Click and drag on empty space
   - **Drag nodes**: Click and drag individual nodes
   - **Inspect**: Hover over nodes/edges to see tooltips

## Example Queries

### Basic Graph (Entities and Relationships)

```sparql
PREFIX schema: <https://schema.org/>

CONSTRUCT {
  ?person a schema:Person .
  ?person schema:name ?name .
  ?person schema:worksFor ?org .
  ?org a schema:Organization .
  ?org schema:name ?orgName .
}
WHERE {
  ?person a schema:Person ;
          schema:name ?name ;
          schema:worksFor ?org .
  ?org schema:name ?orgName .
}
LIMIT 50
```

### Ontology Visualization

```sparql
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

CONSTRUCT {
  ?class rdf:type rdfs:Class .
  ?class rdfs:label ?label .
  ?class rdfs:subClassOf ?parent .
}
WHERE {
  ?class rdf:type rdfs:Class .
  OPTIONAL { ?class rdfs:label ?label }
  OPTIONAL { ?class rdfs:subClassOf ?parent }
}
LIMIT 100
```

### DBpedia Example

```sparql
PREFIX dbo: <http://dbpedia.org/ontology/>
PREFIX dbr: <http://dbpedia.org/resource/>

CONSTRUCT {
  dbr:Paris dbo:country ?country .
  ?country dbo:capital dbr:Paris .
  dbr:Paris dbo:populationTotal ?population .
}
WHERE {
  dbr:Paris dbo:country ?country .
  OPTIONAL { dbr:Paris dbo:populationTotal ?population }
}
```

## Configuration (Advanced)

### Custom Plugin Priority

```javascript
// Register plugin with lower priority (further left in tab bar)
class CustomGraphPlugin extends GraphPlugin {
  constructor(yasr) {
    super(yasr);
    this.priority = 10; // Default is 20
  }
}

Yasgui.Yasr.registerPlugin('graph', CustomGraphPlugin);
```

### Custom Network Options

Modify `GraphPlugin` class to customize vis-network options:

```javascript
class CustomGraphPlugin extends GraphPlugin {
  getNetworkOptions() {
    return {
      ...super.getNetworkOptions(),
      physics: {
        enabled: true,
        stabilization: { iterations: 300 }, // More iterations for better layout
        solver: 'forceAtlas2' // Different physics engine
      },
      nodes: {
        shape: 'circle', // Change node shape
        font: { size: 16, color: '#000000' }
      }
    };
  }
}
```

## Troubleshooting

### Plugin Tab Not Showing

**Problem**: Graph tab doesn't appear after executing CONSTRUCT query.

**Solution**: Ensure query returns triples in bindings format with `subject`, `predicate`, `object` columns:

```javascript
// Check results format in browser console
console.log(yasgui.getTab().yasr.results.getBindings());
// Should return: [{subject: {value: '...', type: '...'}, predicate: {...}, object: {...}}]
```

### Empty Visualization

**Problem**: Graph tab shows but no nodes/edges appear.

**Solution**: 
1. Check if query returns results (>0 triples)
2. Verify container has explicit height:
   ```css
   #yasgui { height: 600px; } /* Or 100vh */
   ```
3. Open browser console for error messages

### Performance Issues

**Problem**: Visualization is slow or unresponsive with large result sets.

**Solution**:
1. Limit query results (use `LIMIT 100` or `LIMIT 1000`)
2. Wait for layout stabilization
3. If still slow, manually disable physics:
   ```javascript
   // In browser console
   const network = yasgui.getTab().yasr.plugins.graph.network;
   network.setOptions({physics: {enabled: false}});
   ```

### Tooltips Not Showing

**Problem**: Hovering over nodes/edges doesn't show details.

**Solution**: Ensure browser allows tooltips (not blocked by extensions). Tooltips are built-in to vis-network and display the `title` attribute.

## Development Setup

### Clone and Build

```bash
# Clone repository
git clone https://github.com/Matdata-eu/yasgui-graph-plugin.git
cd yasgui-graph-plugin

# Install dependencies
npm install

# Build plugin
npm run build

# Run development server (if available)
npm run dev
```

### File Structure

```
yasgui-graph-plugin/
├── src/
│   ├── GraphPlugin.js         # Main plugin class
│   ├── parsers.js              # RDF triple parsing
│   ├── transformers.js         # Triple → graph transformation
│   ├── prefixUtils.js          # Prefix handling
│   └── index.js                # Entry point
├── dist/
│   └── yasgui-graph-plugin.min.js  # UMD bundle
├── example/
│   └── index.html              # Demo page
├── package.json
└── README.md
```

### Run Example

```bash
# Start local server (e.g., with Python)
python -m http.server 8000

# Open in browser
# http://localhost:8000/example/
```

## API Reference

See detailed contracts:
- [YASR Plugin Interface](./contracts/yasr-plugin-interface.md)
- [vis-network Integration](./contracts/vis-network-integration.md)

## Next Steps

1. **Read Constitution**: [.specify/memory/constitution.md](./.specify/memory/constitution.md) - Project principles and standards
2. **Review Feature Spec**: [specs/001-construct-graph-viz/spec.md](./specs/001-construct-graph-viz/spec.md) - Complete requirements
3. **Explore Examples**: [example/index.html](./example/index.html) - Working demos
4. **Contribute**: See [CONTRIBUTING.md](./CONTRIBUTING.md) - Development workflow

## Support

- **Issues**: https://github.com/Matdata-eu/yasgui-graph-plugin/issues
- **Discussions**: https://github.com/Matdata-eu/yasgui-graph-plugin/discussions

## License

Apache 2.0 - See [LICENSE](./LICENSE)
