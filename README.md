# YASGUI Graph Plugin

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![npm version](https://img.shields.io/npm/v/@matdata/yasgui-graph-plugin.svg)](https://www.npmjs.com/package/@matdata/yasgui-graph-plugin)

A YASGUI plugin for visualizing SPARQL CONSTRUCT and DESCRIBE query results as interactive graphs with nodes (subjects/objects) and edges (predicates).

## ✨ Features

- **🔷 Interactive Graph Visualization**: Automatic force-directed layout with smooth physics-based positioning
- **🎨 Smart Color Coding**: 
  - Brand blue (`--yasgui-brand`, fallback #0563bb) = resources (URIs)
  - Ink (`--yasgui-ink`, fallback #1c2633) = literals
  - Light grey (#c5c5c5ff) = blank nodes
  - Orange (#e15b13ff) = rdf:type objects (classes)
  - Amber (`--yasgui-highlight`, fallback #f2b300) = the selected node
- **🖼️ Node Icons & Images**: Render images or emoji/icons on nodes via `schema:image` / `schema:icon` properties (see [Node icons and images](#node-icons-and-images))
- **� Compact Mode**: Hide literal and class nodes; show rdf:type and datatype properties in enhanced tooltips instead
- **🔍 Navigation**: Mouse wheel zoom, drag to pan, "Zoom to fit" button
- **Shared toolbar and describe panel**: On a yasr with the host API the controls move into the yasr plugin toolbar and Ctrl+click (Cmd+click on macOS) opens the shared describe panel (see [Host integration](#host-integration-shared-toolbar-and-describe-panel))
- **✋ Drag & Drop**: Reorganize nodes by dragging them to new positions (nodes stay pinned after manual drag)
- **� Node Expansion**: Double-click any URI node to fetch and merge related triples via DESCRIBE queries (see [Expand Nodes with Double Click](#-expand-nodes-with-double-click))
- **�💬 Rich Tooltips**: Modern HTML tooltips with node type, value, namespace, and datatype information
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
- **Fit to view**: Click "Zoom to fit" to center the entire graph

### Interaction
- **Drag Nodes**: Click and drag any node to reposition it (nodes are automatically pinned in place after dragging)
- **Expand Nodes**: 🆕 Double-click any blue URI node to fetch and merge additional RDF triples for that resource (see [Node Expansion](#expand-nodes-with-double-click) below)
- **Describe**: Ctrl+click (Cmd+click on macOS) a resource node to open it in the shared yasr describe panel. Only on a yasr with the host API; elsewhere Ctrl+click behaves like a normal click
- **Tooltips**: Hover over nodes/edges to see rich HTML tooltips with type, value, namespace, and datatype information

### Understanding Colors

| Color | Meaning | Example |
|-------|---------|---------||
| Brand blue (#0563bb, dark #5aa8f2) | Resource (URI) nodes | `ex:Alice` |
| Ink (#1c2633, dark #eef1ef) | Literal values | `"Alice"`, `"30"^^xsd:integer` |
| Light grey (#c5c5c5ff) | Blank nodes | `_:b1`, `_:addr1` |
| Orange (#e15b13ff) | rdf:type objects (classes) | `ex:Person` in `ex:Alice rdf:type ex:Person` |
| Amber (#f2b300, dark #f5c242) | The selected node or edge | |

Colours are read from CSS custom properties, so you can override them. The plugin's own
variables win; when they are not set, it uses the YASGUI theme tokens, then the fallbacks above:

| Variable | Default |
|----------|---------|
| `--yasgui-graph-uri` | `var(--yasgui-brand, #0563bb)` |
| `--yasgui-graph-literal` | `var(--yasgui-ink, #1c2633)` |
| `--yasgui-graph-highlight` | `var(--yasgui-highlight, #f2b300)` |
| `--yasgui-graph-blank-node`, `--yasgui-graph-type-object`, `--yasgui-graph-edge`, … | unchanged |

To get the previous palette back, set for example `--yasgui-graph-uri: #97c2fc; --yasgui-graph-literal: #a6c8a6;`.

## ⚙️ Configuration

The plugin ships with sensible defaults and stores every change in **`localStorage`** so settings survive page reloads.

### Settings panel

Click **View settings** (far right of the yasr plugin toolbar) or, on a yasr without the host API, the **Settings** button in the top-right corner of the graph to open the settings panel.

On a yasr with the host API, the toolbar also has direct controls for **Edges** (curved or straight), **Edge labels** (prefixed IRI, icon or hidden), **Compact** and **Zoom to fit**.

| Setting | Values | Default | Description |
|---------|--------|---------|-------------|
| **Compact mode** | on / off | off | Hide literal and class nodes; show rdf:type and datatype properties in tooltips instead |
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

## 🖼️ Node icons and images

Any URI node can display an image or an icon instead of (or in addition to) the default coloured dot by attaching `schema:image` or `schema:icon` as a property directly in the SPARQL result.

| Property | Object | Effect |
|----------|--------|--------|
| `schema:image` (`https://schema.org/image`) | URL literal or URI | Node is rendered as a circular image |
| `schema:icon` (`https://schema.org/icon`) | emoji / short string | The string is used as the node's label |

`schema:icon` takes priority over `schema:image`. The corresponding `schema:icon`/`schema:image` triples are **not** rendered as separate nodes or edges, but their values **are** shown in the node tooltip. Similarly, any `rdfs:label` triple is consumed to determine the node's displayed label and is never drawn as an edge, even when predicate display is enabled.

### Example – inline image on a resource

```sparql
CONSTRUCT {
  ex:alice schema:image <https://example.com/alice.png> .
  ex:alice ex:knows ex:bob .
}
WHERE {}
```

`ex:alice` will be drawn as a circular photograph.

### Example – icon/emoji on a class

```sparql
CONSTRUCT {
  ex:alice  rdf:type    ex:Person .
  ex:Person schema:icon "👤" .
}
WHERE {}
```

`ex:alice` remains a normal dot node in regular mode.
In **compact mode** the class node (`ex:Person`) is hidden and Alice's node inherits the `👤` emoji as its label.

### Compact mode visual inheritance

When compact mode is enabled, class nodes are hidden and the plugin resolves the image/icon to show on the resource node using the following priority:

1. `schema:image` / `schema:icon` directly on the **resource** (highest priority)
2. `schema:image` / `schema:icon` on the **rdf:type class**
3. `schema:image` / `schema:icon` on a **rdfs:subClassOf superclass** (one hop)

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

## Host integration (shared toolbar and describe panel)

Newer `@matdata/yasgui` / yasr builds expose a host API (version 1) that plugins can use to share
one toolbar and one describe panel. The plugin feature-detects it on every draw and never checks
version strings:

```js
const host = yasr.hostApi; // { version: 1, describe: true, toolbar: true } or undefined
host?.toolbar && typeof yasr.getPluginToolbar === 'function'; // toolbar slot available
host?.describe && typeof yasr.describe === 'function';        // shared describe panel available
```

| | yasr with host API | yasr without host API (published @matdata/yasgui today) |
|---|---|---|
| Controls | Rendered into `yasr.getPluginToolbar()` with the shared `.yasr_toolbar*` classes; View settings at the far right | Floating buttons in the top-right corner of the graph (unchanged) |
| Ctrl/Cmd+click on a resource node | `yasr.describe(iri, { source: "Graph" })` opens the shared describe panel | Nothing new: behaves like a normal click |
| Double-click | Expands the node (background DESCRIBE), unchanged. Ctrl/Cmd+double-click only describes | Expands the node, unchanged |
| Settings, CSS variables, localStorage | Same | Same |

Each capability is detected on its own: a yasr that advertises only `toolbar` gets the toolbar
and no Ctrl+click describe, and the other way round. The floating buttons are deprecated and will
be removed in the next major version; until then nothing changes for hosts without the API.

## � Expand Nodes with Double Click

The graph plugin supports **interactive node expansion** via double-clicking. This allows you to progressively explore RDF graphs by fetching additional triples for any URI node without redrawing the entire graph.

### How It Works

1. **Double-click a blue URI node** in the graph
2. The node's border turns **orange and thickens** (loading state)
3. A `DESCRIBE <uri>` query is sent to the SPARQL endpoint
4. **New triples are merged** into the existing graph
5. Node's border returns to normal width with **thicker border (3px) to indicate expansion**
6. Graph layout and zoom level are **preserved**

### Visual Feedback

| State | Border | Meaning |
|-------|--------|---------|
| **Default** | 2px | Node has not been expanded |
| **Loading** | 4px, orange | DESCRIBE query in progress |
| **Expanded** | 3px, normal color | Successfully expanded |

### Supported Node Types

| Node Type | Can Expand? | Reason |
|-----------|-------|----|
| 🔵 **URI nodes** | ✅ Yes | DESCRIBE works on URIs |
| 🟢 **Literals** | ❌ No | Cannot run DESCRIBE on literal values |
| ⚪ **Blank nodes** | ❌ No | Blank nodes have no resolvable identity |

### Example: Exploring a Knowledge Graph

**Initial Query**:
```sparql
PREFIX ex: <http://example.org/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

CONSTRUCT {
  ex:alice foaf:knows ex:bob .
  ex:alice foaf:name "Alice" .
  ex:bob foaf:name "Bob" .
}
WHERE {}
```

**Initial Graph**: 3 nodes (Alice, "Alice", Bob, "Bob"), 2 edges

**User Action**: Double-click the `ex:bob` node

**What Happens**:
- System executes: `DESCRIBE <http://example.org/bob>`
- Endpoint returns all triples about Bob (from your SPARQL endpoint)
- New nodes and edges appear in the graph
- Graph layout shifts smoothly to accommodate new nodes
- `ex:bob` node gets a thicker border

**Result**: You can now see Bob's relationships, properties, and connections without losing your current view

### Requirements

The node expansion feature requires:

1. **SPARQL 1.1 DESCRIBE support**: Your endpoint must support DESCRIBE queries
2. **Query execution callback**: YASR must provide `yasr.executeQuery()` for background queries
3. **RDF response format**: Endpoint must return results in RDF (JSON-LD, Turtle, N-Triples, etc.)

### Limitations & Behavior

- Only new triples are added (existing triples are skipped if already in graph)
- Expansion is **one-level deep** - only triples directly about the URI are added
- For very large result sets (1000+ triples from DESCRIBE), performance may be affected
- Blank nodes returned by DESCRIBE may not connect properly if disconnected from existing nodes

### Troubleshooting Expansion

**"Nothing happens when I double-click"**
- Ensure the node is blue (URI node, not literal or blank node)
- Check browser console for warnings about `yasr.executeQuery`
- Verify your SPARQL endpoint supports DESCRIBE queries

**"Graph becomes slow after many expansions"**
- Disable physics simulation in Settings panel for faster UI response
- Consider limiting query results with WHERE clause constraints
- Each expansion adds more triples to the visualization

**"New nodes don't appear where I expect"**
- The force-directed layout will position new nodes to minimize overlaps
- Disable Physics in Settings to lock positions if desired
- Manually drag new nodes to preferred positions

### Demo

See [demo/expand.html](./demo/expand.html) for a working example with mock DESCRIBE responses and detailed logging.

## �🔧 Development

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
npm test        # Run Jest unit tests
npm run lint    # ESLint check
npm run format  # Prettier format
```

## 📚 Documentation

- **[Quickstart Guide](./specs/001-construct-graph-viz/quickstart.md)** - Installation, usage, troubleshooting
- **[Node Expansion Feature](./specs/001-construct-graph-viz/EXPAND_FEATURE.md)** - Complete guide to double-click expansion (FR-001 through FR-009)
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
- ✅ **Basic graph visualization** (US1) - CONSTRUCT/DESCRIBE results as interactive graphs
- ✅ **Navigation controls** (US2) - Zoom, pan, "Fit to View" button
- ✅ **Color-coded nodes** - URIs, literals, blank nodes, rdf:type objects
- ✅ **Prefix abbreviation** - Display prefixed URIs instead of full URLs
- ✅ **Blank node support** - Handle anonymous RDF nodes
- ✅ **Drag & repositioning** - Manually adjust node positions
- ✅ **Rich tooltips** - Hover for detailed node/edge information
- ✅ **Theme support** - Light/dark mode detection and switching
- ✅ **Settings panel** - Configurable display options with localStorage persistence
- ✅ **Node icons & images** - Display images via schema:image property
- ✅ **Compact mode** - Hide literals and classes for cleaner visualization
- ✅ **Double-click expansion** (US5) - Fetch and merge related triples via DESCRIBE queries (see [Expand Nodes with Double Click](#-expand-nodes-with-double-click))

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
