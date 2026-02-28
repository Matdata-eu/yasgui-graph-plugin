# YASGUI Graph Plugin

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://img.shields.io/npm/v/@matdata/yasgui-graph-plugin.svg)](https://www.npmjs.com/package/@matdata/yasgui-graph-plugin)

A YASGUI plugin for visualizing SPARQL CONSTRUCT and DESCRIBE query results as interactive graphs with nodes (subjects/objects) and edges (predicates).

## ✨ Features

- **🔷 Interactive Graph Visualization**: Automatic force-directed layout with smooth physics-based positioning
- **🎨 Smart Color Coding**: 
  - 🔵 Light Blue (#97C2FC) = URIs
  - 🟢 Light Green (#a6c8a6ff) = Literals
  - ⚪ Light Grey (#c5c5c5ff) = Blank nodes
  - 🟠 Orange (#e15b13ff) = rdf:type objects (classes)
- **🔍 Navigation**: Mouse wheel zoom, drag to pan, "Zoom to Fit" button
- **✋ Drag & Drop**: Reorganize nodes by dragging them to new positions
- **💬 Tooltips**: Hover for full URI/literal details (300ms delay)
- **🌓 Theme Support**: Automatic light/dark mode detection and dynamic color switching
- **⚡ Performance**: Handles up to 1,000 nodes with <2s render time
- **♿ Accessible**: WCAG AA color contrast, keyboard navigation support

## 📦 Installation

### NPM

```bash
npm install @matdata/yasgui-graph-plugin
```

```javascript
import Yasgui from '@matdata/yasgui';
import GraphPlugin from '@matdata/yasgui-graph-plugin';

Yasgui.Yasr.registerPlugin('Graph', GraphPlugin);

const yasgui = new Yasgui(document.getElementById('yasgui'));
```

### CDN (UMD)

```html
<!-- YASGUI -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@matdata/yasgui/build/yasgui.min.css">
<script src="https://cdn.jsdelivr.net/npm/@matdata/yasgui/build/yasgui.min.js"></script>

<!-- Graph Plugin -->
<script src="https://cdn.jsdelivr.net/npm/@matdata/yasgui-graph-plugin/dist/yasgui-graph-plugin.min.js"></script>

<script>
  // Plugin auto-registers as 'graph'
  const yasgui = new Yasgui(document.getElementById('yasgui'));
</script>
```

## 🚀 Quick Start

See the complete working example in [`demo/index.html`](./demo/index.html).

### Basic Usage

```javascript
const yasgui = new Yasgui(document.getElementById('yasgui'), {
  requestConfig: { 
    endpoint: 'https://dbpedia.org/sparql' 
  }
});
```

### Sample Queries

**CONSTRUCT Query:**
```sparql
PREFIX ex: <http://example.org/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

CONSTRUCT {
  ex:Alice rdf:type ex:Person .
  ex:Alice ex:knows ex:Bob .
  ex:Alice ex:name "Alice" .
  ex:Bob rdf:type ex:Person .
  ex:Bob ex:name "Bob" .
}
WHERE {}
```

**DESCRIBE Query:**
```sparql
PREFIX ex: <http://example.org/>

# Returns all triples about the specified resources
DESCRIBE ex:Alice ex:Bob
```

After running the query, click the **"Graph"** tab to see the visualization.

## 🎮 User Guide

### Navigation
- **Zoom**: Mouse wheel (scroll up = zoom in, scroll down = zoom out)
- **Pan**: Click and drag the background
- **Fit to View**: Click the "Zoom to Fit" button to center the entire graph

### Interaction
- **Drag Nodes**: Click and drag any node to reposition it
- **Tooltips**: Hover over nodes/edges for 300ms to see full details

### Understanding Colors

| Color | Meaning | Example |
|-------|---------|---------||
| 🔵 Light Blue (#97C2FC) | URI nodes | `ex:Person`, `ex:Alice` |
| 🟢 Light Green (#a6c8a6ff) | Literal values | `"Alice"`, `"30"^^xsd:integer` |
| ⚪ Light Grey (#c5c5c5ff) | Blank nodes | `_:b1`, `_:addr1` |
| 🟠 Orange (#e15b13ff) | rdf:type objects (classes) | `ex:Person` in `ex:Alice rdf:type ex:Person` |

## ⚙️ Configuration

The plugin ships with sensible defaults and stores every change in **`localStorage`** so settings survive page reloads.

### Settings panel

Click the **⚙ Settings** button (top-right of the graph) to open the settings panel.

| Setting | Values | Default | Description |
|---------|--------|---------|-------------|
| **Arrow style** | Curved / Straight | Curved | Toggle between smooth curved edges and straight lines between nodes |
| **Predicate display** | Label / Icon / Hidden | Icon | Show the full prefixed URI on edges, a compact symbol/icon, or nothing |
| **Show literals** | on / off | on | Include or exclude literal value nodes (strings, numbers, dates, …) |
| **Show classes** | on / off | on | Include or exclude nodes that are objects of `rdf:type` triples (class nodes) |
| **Show blank nodes** | on / off | on | Include or exclude blank nodes (`_:b0`, `_:b1`, …) |
| **Show node labels** | on / off | on | Render the prefixed URI / literal text inside each node |
| **Enable physics** | on / off | on | Keep the force-directed layout simulation running so nodes keep adjusting |
| **Node size** | Small / Medium / Large | Medium | Set the radius of all nodes |

### Predicate icons

When *Predicate display* is set to **Icon**, each edge displays a compact symbol instead of the full label.  Symbols are defined for the 20+ most common predicates:

| Predicate | Symbol |
|-----------|--------|
| `rdf:type` | `a` |
| `rdfs:label` | `lbl` |
| `rdfs:comment` | `cmt` |
| `rdfs:subClassOf` | `⊂` |
| `rdfs:subPropertyOf` | `⊆` |
| `rdfs:domain` | `dom` |
| `rdfs:range` | `rng` |
| `rdfs:seeAlso` | `see` |
| `rdfs:isDefinedBy` | `idb` |
| `owl:sameAs` | `≡` |
| `owl:equivalentClass` | `≅` |
| `owl:inverseOf` | `⇄` |
| `owl:disjointWith` | `≠` |
| `skos:prefLabel` | `★` |
| `skos:altLabel` | `☆` |
| `skos:definition` | `def` |
| `skos:broader` | `↑` |
| `skos:narrower` | `↓` |
| `skos:related` | `↔` |
| `skos:note` | `note` |
| `skos:exactMatch` | `≡` |
| `skos:closeMatch` | `≈` |
| `dcterms:title` | `ttl` |
| `dcterms:description` | `dsc` |
| `dcterms:created` | `crt` |
| `dcterms:modified` | `mod` |
| `dcterms:creator` | `by` |
| `dcterms:subject` | `sbj` |
| `foaf:name` | `nm` |
| `foaf:knows` | `⟷` |
| `foaf:member` | `mbr` |
| `schema:name` | `nm` |
| `schema:description` | `dsc` |

For predicates not in the table the full prefixed label is used as a fallback.

### Programmatic configuration

You can also pass initial settings when extending the class:

```javascript
class CustomGraphPlugin extends GraphPlugin {
  constructor(yasr) {
    super(yasr);
    // Override defaults
    this.settings.edgeStyle = 'straight';
    this.settings.predicateDisplay = 'label';
    this.settings.nodeSize = 'large';
  }
}

Yasgui.Yasr.registerPlugin('customGraph', CustomGraphPlugin);
```

## 🔧 Development

### Build

```bash
npm install
npm run build
```

Output:
- `dist/yasgui-graph-plugin.esm.js` (ES Module for bundlers)
- `dist/yasgui-graph-plugin.cjs.js` (CommonJS for Node.js)
- `dist/yasgui-graph-plugin.min.js` (IIFE for browsers/unpkg)
- `dist/index.d.ts` (TypeScript declarations)

### Local Testing

1. Build the plugin: `npm run build`
2. Open `demo/index.html` in a browser (or run `npm run dev`)
3. Try the sample queries in different tabs

### Code Quality

```bash
npm run lint    # ESLint check
npm run format  # Prettier format
```

## 📚 Documentation

- **[Quickstart Guide](./specs/001-construct-graph-viz/quickstart.md)** - Installation, usage, troubleshooting
- **[Data Model](./specs/001-construct-graph-viz/data-model.md)** - Entity definitions and relationships
- **[Contracts](./specs/001-construct-graph-viz/contracts/)** - API specifications for YASR plugin and vis-network integration
- **[Specification](./specs/001-construct-graph-viz/spec.md)** - Complete feature specification
- **[Constitution](./. specify/memory/constitution.md)** - Project governance and principles

## 🧪 Browser Compatibility

Tested on latest 2 versions of:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

Requires ES2018+ support and Canvas API.

## 🤝 Contributing

Contributions welcome! Please follow the project constitution (`.specify/memory/constitution.md`) for governance principles:

1. **Plugin-First Architecture** - No YASGUI core modifications
2. **Visualization Quality** - Performance (<2s for 1k nodes), accessibility (WCAG AA)
3. **Configuration Flexibility** - Sensible defaults, but customizable
4. **Browser Compatibility** - ES2018+, latest 2 browser versions
5. **Documentation** - Keep docs updated with changes

## 📄 License

[Apache 2.0](./LICENSE)

## 🙏 Acknowledgments

- Built with [vis-network](https://visjs.github.io/vis-network/) for graph rendering
- Integrates with [YASGUI](https://github.com/matdata/yasgui) SPARQL editor
- Follows the [yasgui-geo](https://github.com/matdata/yasgui-geo) plugin pattern

## 📊 Project Status

**Current Version**: 0.1.0 (MVP)

**Implemented Features** (v0.1.0):
- ✅ Basic graph visualization (US1)
- ✅ Navigation controls (US2)
- ✅ Color-coded nodes
- ✅ Prefix abbreviation
- ✅ Blank node support
- ✅ Performance optimization

**Planned Features** (Future):
- ⏳ Enhanced tooltips with datatype display (US4)
- ⏳ Manual testing across all browsers (US3 verification)
- ⏳ Large graph optimization (>1k nodes)
- ⏳ Custom color schemes
- ⏳ Layout algorithm selection

## 🐛 Troubleshooting

### Plugin tab not showing
- Verify plugin is registered correctly
- Check browser console for errors
- Ensure you're running a CONSTRUCT or DESCRIBE query

### Empty visualization
- Ensure query type is **CONSTRUCT** or **DESCRIBE**
- Confirm query returns triples (check "Table" or "Response" tab)
- Verify results have RDF structure

### Performance issues
- Limit results to <1000 nodes for best performance
- Disable physics after initial layout
- Consider using LIMIT clause in SPARQL query

For more help, see [Quickstart Guide - Troubleshooting](./specs/001-construct-graph-viz/quickstart.md#troubleshooting).

## 🛠️ Development

### Setup

```bash
git clone https://github.com/yourusername/yasgui-graph-plugin.git
cd yasgui-graph-plugin
npm install
```

### Dev Workflow (Live Reload)

The project supports **live development** - edit source files and see changes immediately without rebuilding:

1. **Start a local dev server** (any HTTP server will work):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using VS Code Live Server extension
   # Right-click demo/index.html → "Open with Live Server"
   ```

2. **Open demo in browser**:
   ```
   http://localhost:8000/demo/index.html
   ```

3. **Edit source files** (e.g., `src/colorUtils.js`):
   ```javascript
   export function getNodeColor(node) {
     // Change colors here
     if (node.isBlankNode) return '#FF00FF'; // Magenta
     // ...
   }
   ```

4. **Refresh browser** - changes appear immediately! ⚡

The demo automatically loads ES modules directly from `src/` in development mode, so no rebuild is needed.

### Production Build

Build all distribution formats:

```bash
npm run build
```

Outputs:
- `dist/yasgui-graph-plugin.esm.js` - ES Module format (bundled with vis-network)
- `dist/yasgui-graph-plugin.cjs.js` - CommonJS format (bundled with vis-network)
- `dist/yasgui-graph-plugin.min.js` - IIFE browser bundle (bundled with vis-network)
- `dist/index.d.ts` - TypeScript type declarations

### Testing

```bash
npm test          # Run all tests
npm run lint      # Check code style
npm run format    # Auto-fix formatting
```
