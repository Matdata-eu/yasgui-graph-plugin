# Graph Plugin Demo Pages

This directory contains two demo pages for testing the YASGUI Graph Plugin:

## 📄 Demo Files

### 1. `index.html` - Full YASGUI Demo
**Purpose:** Test the plugin within the full YASGUI framework

**Features:**
- Complete YASGUI environment with query editor
- Live SPARQL endpoint connections
- Multiple sample CONSTRUCT queries
- Tests plugin integration with YASGUI

**Use when:**
- Testing end-to-end integration with YASGUI
- Validating plugin registration and lifecycle
- Testing with real SPARQL endpoints
- Demonstrating full application workflow

### 2. `standalone.html` - Isolated Plugin Demo ⭐
**Purpose:** Test the plugin in isolation WITHOUT YASGUI framework

**Features:**
- ✅ No YASGUI dependencies (no version conflicts)
- ✅ No CSS collisions from YASGUI styles
- ✅ Mock data with diverse test scenarios
- ✅ Interactive controls (dataset selector, theme toggle)
- ✅ Performance metrics display
- ✅ Debug tools (log plugin state)
- ✅ Faster development iteration

**Use when:**
- Developing new plugin features
- Testing CSS changes
- Debugging plugin issues
- Performance testing
- Testing edge cases (empty data, long strings, special chars)
- You want faster reload times

---

## 🚀 Running the Demos

### Development Mode (with live reload)

```bash
# Start Vite dev server
npm run dev

# Open in browser:
# - Full YASGUI: http://localhost:5173/demo/index.html
# - Standalone: http://localhost:5173/demo/standalone.html
```

**What happens in dev mode:**
- Plugin loads from `src/` directory (ES modules)
- Hot module replacement (HMR) enabled
- Changes to source files reload automatically
- No build step needed

### Production Mode

```bash
# Build the plugin
npm run build

# Open files directly:
# - Full YASGUI: demo/index.html
# - Standalone: demo/standalone.html
```

**What happens in production mode:**
- Plugin loads from `dist/` bundle
- Optimized and minified code
- Tests the actual distributed version

---

## 🎯 Standalone Demo Features

### Mock Data Scenarios

The standalone demo includes diverse test datasets:

| Dataset | Description | Use Case |
|---------|-------------|----------|
| **Basic Graph** | 2 people, simple relationships | Basic functionality |
| **Social Network** | 5 people, multiple connections | Connected graph |
| **Ontology** | Classes, properties, hierarchy | Ontology visualization |
| **Blank Nodes** | Addresses as blank nodes | Complex structures |
| **Multiple Edges** | Same nodes, different predicates | Multi-edge handling |
| **Large Graph** | 50 nodes, random connections | Performance testing |
| **Empty Results** | No triples | Empty state handling |
| **Long Strings** | Very long literal values | Text truncation |
| **Special Chars** | Unicode, symbols | Character encoding |

### Interactive Controls

1. **Dataset Selector**
   - Switch between different test scenarios
   - Auto-renders graph on change

2. **Theme Toggle**
   - Auto (system preference)
   - Light mode
   - Dark mode

3. **Refresh Button**
   - Re-render current graph
   - Useful after code changes

4. **Log State Button**
   - Dumps plugin state to console
   - Useful for debugging

### Statistics Display

Real-time metrics:
- **Triples**: Number of RDF triples in dataset
- **Nodes**: Unique subjects and objects (URIs)
- **Edges**: Number of predicates/relationships
- **Render Time**: Milliseconds to render graph

---

## 🔧 How the Mock Interface Works

The standalone demo creates a minimal mock YASR object that mimics what the plugin expects:

```javascript
const mockYasr = {
  // YASR's results object
  results: {
    getBindings: () => mockData.bindings,
    head: { vars: ['subject', 'predicate', 'object'] },
    results: { bindings: mockData.bindings }
  },
  
  // Container element where plugin renders
  resultsEl: document.getElementById('plugin-container'),
  
  // Plugin configuration
  config: {
    pluginsOptions: {
      Graph: { /* plugin config */ }
    }
  },
  
  // Query interface (YASQE)
  yasqe: {
    getValue: () => mockData.query || '',
    getQuery: () => mockData.query || ''
  },
  
  // Prefix map
  getPrefixes: () => mockData.prefixes || {}
};
```

The plugin works with this mock exactly as it would with real YASGUI.

---

## 📊 Mock Data Format

Each dataset in `mock-data.js` follows this structure:

```javascript
{
  description: 'Human-readable description',
  bindings: [
    {
      subject: { type: 'uri|bnode', value: 'URI or blank node ID' },
      predicate: { type: 'uri', value: 'Property URI' },
      object: { 
        type: 'uri|bnode|literal', 
        value: 'Value',
        datatype: 'optional XSD datatype',
        'xml:lang': 'optional language tag'
      }
    }
    // ... more triples
  ],
  prefixes: {
    ex: 'http://example.org/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
  }
}
```

### Triple Types

**Subject:**
- `type: 'uri'` - Resource URI
- `type: 'bnode'` - Blank node (e.g., `_:addr1`)

**Predicate:**
- Always `type: 'uri'` - Property URI

**Object:**
- `type: 'uri'` - Resource URI
- `type: 'bnode'` - Blank node
- `type: 'literal'` - String, number, date, etc.
  - Optional `datatype` for typed literals
  - Optional `xml:lang` for language-tagged strings

---

## 🎨 Testing CSS Changes

The standalone demo is ideal for testing CSS:

1. **No Framework Interference**
   - YASGUI's CSS won't override your styles
   - Test in clean environment

2. **Quick Iteration**
   - Edit CSS in plugin source
   - Vite auto-reloads instantly
   - See changes immediately

3. **Theme Testing**
   - Toggle between light/dark
   - Test both themes quickly
   - Verify color contrast

---

## 🐛 Debugging Tips

### Use the Browser Console

```javascript
// The plugin instance is available as currentPlugin
console.log(currentPlugin);

// Access the vis-network instance
console.log(currentPlugin.network);

// Check theme
console.log(currentPlugin.currentTheme);

// View mock YASR object
console.log(currentMockYasr);
```

### Log Plugin State

Click the "Log Plugin State" button to dump:
- Plugin instance
- Mock YASR object  
- Network instance
- Current theme

### Check Network Events

```javascript
// Add in browser console
currentPlugin.network.on('click', (params) => {
  console.log('Clicked:', params);
});
```

---

## 📝 Adding New Mock Datasets

1. Open `demo/mock-data.js`

2. Add new dataset to `window.mockDatasets`:

```javascript
window.mockDatasets = {
  // ... existing datasets
  
  myNewTest: {
    description: 'Description of test case',
    bindings: [
      {
        subject: { type: 'uri', value: 'http://example.org/Resource1' },
        predicate: { type: 'uri', value: 'http://example.org/property' },
        object: { type: 'literal', value: 'value' }
      }
    ],
    prefixes: {
      ex: 'http://example.org/'
    }
  }
};
```

3. Add option to `standalone.html` dataset selector:

```html
<select id="dataset-select">
  <!-- ... existing options -->
  <option value="myNewTest">My New Test</option>
</select>
```

4. Reload page and select your new dataset!

---

## 🚧 Troubleshooting

### Plugin Won't Load

**Development mode:**
- Check Vite dev server is running (`npm run dev`)
- Check browser console for import errors
- Verify `src/index.js` exports GraphPlugin as default

**Production mode:**
- Run `npm run build` first
- Check `dist/` directory contains built files
- Verify file paths in standalone.html

### Graph Won't Render

1. Check browser console for errors
2. Verify dataset format matches expected structure
3. Click "Log Plugin State" to inspect mock object
4. Check `canHandleResults()` returns true

### Styles Look Wrong

- Clear browser cache
- Check for CSS conflicts in devtools
- Verify theme selector is working
- Test in different browsers

---

## 🤝 Contributing

When adding new features:

1. ✅ Test in standalone demo first (faster iteration)
2. ✅ Add relevant mock datasets for edge cases
3. ✅ Verify in full YASGUI demo (integration test)
4. ✅ Test in both dev and production modes

---

## 📚 Additional Resources

- [YASGUI Documentation](https://triply.cc/docs/yasgui)
- [vis-network Documentation](https://visjs.github.io/vis-network/docs/network/)
- [SPARQL Results Format](https://www.w3.org/TR/sparql11-results-json/)
- [RDF Concepts](https://www.w3.org/TR/rdf11-concepts/)

---

## ✨ Benefits Summary

| Feature | Full YASGUI Demo | Standalone Demo |
|---------|------------------|-----------------|
| **No dependencies** | ❌ Loads YASGUI | ✅ Plugin only |
| **No CSS conflicts** | ❌ YASGUI styles | ✅ Clean slate |
| **Fast reload** | 🐌 Loads framework | ⚡ Instant |
| **Mock data** | ❌ Needs endpoint | ✅ Built-in |
| **Edge cases** | ⚠️ Hard to test | ✅ Easy datasets |
| **Performance** | 🐌 Full framework | ⚡ Lightweight |
| **Debugging** | ⚠️ Complex | ✅ Simple |
| **Integration test** | ✅ Real YASGUI | ❌ Mocked |
| **SPARQL editor** | ✅ Full editor | ❌ Mock only |

**Recommendation:** Use standalone for development, YASGUI for final integration testing.
