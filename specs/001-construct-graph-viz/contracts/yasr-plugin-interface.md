# API Contract: YASR Plugin Interface

**Feature**: `001-construct-graph-viz`  
**Date**: 2025-12-05  
**Purpose**: Define plugin's contract with YASR framework

## Overview

The GraphPlugin implements the YASR plugin interface, following the pattern established by yasgui-geo and documented in YASR framework. All methods and properties defined here are **required** for YASR plugin registration.

## Required Properties

### `priority`
```typescript
priority: number
```

**Type**: Number (0-100)  
**Default**: `20`  
**Purpose**: Tab ordering (higher = further right)  
**Contract**: Must be set in constructor before first render

**Example**:
```javascript
constructor(yasr) {
  this.yasr = yasr;
  this.priority = 20; // Between 'Table' (10) and other plugins
}
```

### `label`
```typescript
label: string
```

**Type**: String  
**Default**: `'Graph'`  
**Purpose**: Tab display text  
**Contract**: Must be set in constructor, visible to user

**Example**:
```javascript
constructor(yasr) {
  this.yasr = yasr;
  this.label = 'Graph';
}
```

## Required Methods

### `constructor(yasr)`

**Signature**:
```typescript
constructor(yasr: Yasr): GraphPlugin
```

**Parameters**:
- `yasr` (Yasr): YASR instance providing access to query results and UI elements

**Purpose**: Initialize plugin state, store YASR reference

**Contract**:
- Must store `yasr` parameter in `this.yasr`
- Must set `this.priority` and `this.label` properties
- Must initialize state (e.g., `this.network = null`)
- Must NOT perform any DOM operations (resultsEl not ready)

**Example**:
```javascript
constructor(yasr) {
  this.yasr = yasr;
  this.priority = 20;
  this.label = 'Graph';
  this.network = null;
  this.container = null;
  this.prefixes = {};
  this.nodesDataSet = null;
  this.edgesDataSet = null;
}
```

**Return**: GraphPlugin instance

---

### `canHandleResults()`

**Signature**:
```typescript
canHandleResults(): boolean
```

**Purpose**: Determine if plugin can visualize current query results

**Contract**:
- Must return `true` if results can be visualized, `false` otherwise
- Should check `this.yasr.results` for expected format
- Must NOT throw errors (handle gracefully)
- Called by YASR before showing/hiding plugin tab

**Detection Logic**:
```javascript
canHandleResults() {
  try {
    // Access bindings format results
    const bindings = this.yasr.results?.getBindings?.();
    if (!bindings || bindings.length === 0) return false;
    
    // CONSTRUCT results have subject/predicate/object columns
    const variables = this.yasr.results.getVariables();
    const hasTripleStructure = 
      variables.includes('subject') &&
      variables.includes('predicate') &&
      variables.includes('object');
    
    return hasTripleStructure;
  } catch (e) {
    console.warn('GraphPlugin: Error checking results', e);
    return false;
  }
}
```

**Return**: `true` if plugin should be enabled, `false` otherwise

**Side Effects**: None (read-only check)

---

### `draw()`

**Signature**:
```typescript
async draw(): Promise<void>
```

**Purpose**: Render visualization in YASR results panel

**Contract**:
- Must append visualization to `this.yasr.resultsEl`
- Should clear previous visualization if re-rendering
- Must handle errors gracefully (show error message, don't crash YASR)
- Called when user switches to plugin tab or new results arrive
- Should respect container size (use 100% width/height)

**Workflow**:
```javascript
async draw() {
  try {
    // 1. Clear previous visualization
    this.yasr.resultsEl.innerHTML = '';
    
    // 2. Create container
    this.container = document.createElement('div');
    this.container.className = 'yasgui-graph-container';
    this.container.style.width = '100%';
    this.container.style.height = '600px'; // Or dynamic
    this.yasr.resultsEl.appendChild(this.container);
    
    // 3. Parse triples from results
    const triples = this.parseConstructResults();
    if (triples.length === 0) {
      this.showEmptyState();
      return;
    }
    
    // 4. Transform to graph data
    const {nodes, edges} = this.triplesToGraph(triples);
    
    // 5. Create vis-network DataSets
    this.nodesDataSet = new vis.DataSet(nodes);
    this.edgesDataSet = new vis.DataSet(edges);
    
    // 6. Render network
    this.network = new vis.Network(
      this.container,
      {nodes: this.nodesDataSet, edges: this.edgesDataSet},
      this.getNetworkOptions()
    );
    
    // 7. Setup event listeners
    this.setupEventListeners();
    
    // 8. Performance optimization
    this.network.once('stabilizationIterationsDone', () => {
      this.network.setOptions({physics: {enabled: false}});
    });
    
  } catch (error) {
    console.error('GraphPlugin: Rendering error', error);
    this.showError(error.message);
  }
}
```

**Return**: Promise<void> (resolves when rendering complete)

**Side Effects**: 
- Modifies `this.yasr.resultsEl` DOM
- Creates `this.network` instance
- May disable physics after stabilization

---

### `getIcon()`

**Signature**:
```typescript
getIcon(): HTMLElement | SVGElement
```

**Purpose**: Provide icon for plugin tab

**Contract**:
- Must return DOM element (HTML or SVG)
- Element should be styled (e.g., Font Awesome, custom SVG)
- Must not be null/undefined
- Icon visible in YASR tab bar

**Example**:
```javascript
getIcon() {
  const icon = document.createElement('div');
  icon.className = 'fas fa-project-diagram'; // Font Awesome icon
  // Or custom SVG:
  // icon.innerHTML = '<svg>...</svg>';
  return icon;
}
```

**Return**: DOM element representing icon

**Side Effects**: None (creates new element each call)

## Data Access Patterns

### Accessing Query Results

```typescript
// Get bindings (CONSTRUCT results)
const bindings = this.yasr.results.getBindings();
// bindings: Array<{subject: {value: string, type: string}, predicate: {...}, object: {...}}>

// Get variables (column names)
const variables = this.yasr.results.getVariables();
// variables: Array<string> e.g., ['subject', 'predicate', 'object']

// Get prefixes (if available)
const prefixes = this.yasr.getPrefixes?.() || {};
// prefixes: {[key: string]: string}
```

### Accessing YASR UI Elements

```typescript
// Results container (append visualization here)
this.yasr.resultsEl; // HTMLElement

// YASR configuration
this.yasr.config; // Object with user settings
```

## Error Handling

```javascript
// In canHandleResults - suppress errors, return false
try {
  // ... detection logic
} catch (e) {
  console.warn('GraphPlugin: canHandleResults error', e);
  return false;
}

// In draw - show error message to user
try {
  // ... rendering logic
} catch (error) {
  console.error('GraphPlugin: draw error', error);
  this.yasr.resultsEl.innerHTML = `
    <div class="yasgui-error">
      <h3>Graph Visualization Error</h3>
      <p>${error.message}</p>
    </div>
  `;
}
```

## Lifecycle Diagram

```
┌─────────────────────────────────────┐
│ YASR Framework                      │
└─────────────────────────────────────┘
          │
          │ new GraphPlugin(yasr)
          ↓
┌─────────────────────────────────────┐
│ Plugin Constructor                  │
│ - Store yasr reference              │
│ - Set priority, label               │
│ - Initialize state                  │
└─────────────────────────────────────┘
          │
          │ Query executed
          ↓
┌─────────────────────────────────────┐
│ canHandleResults()                  │
│ - Check result format               │
│ - Return true/false                 │
└─────────────────────────────────────┘
          │
          │ if true → User clicks tab
          ↓
┌─────────────────────────────────────┐
│ draw()                              │
│ - Parse results                     │
│ - Create visualization              │
│ - Append to resultsEl               │
└─────────────────────────────────────┘

```

## Testing Contract Compliance

```javascript
// Test plugin implements required interface
const yasr = mockYasr(); // Mock YASR instance
const plugin = new GraphPlugin(yasr);

// Properties exist
assert(typeof plugin.priority === 'number');
assert(typeof plugin.label === 'string');

// Methods exist and have correct signatures
assert(typeof plugin.canHandleResults === 'function');
assert(typeof plugin.draw === 'function');
assert(typeof plugin.getIcon === 'function');

// canHandleResults returns boolean
const canHandle = plugin.canHandleResults();
assert(typeof canHandle === 'boolean');

// draw returns Promise
const drawPromise = plugin.draw();
assert(drawPromise instanceof Promise);

// getIcon returns HTMLElement
const icon = plugin.getIcon();
assert(icon instanceof HTMLElement || icon instanceof SVGElement);
```

## Registration Pattern

```javascript
// In plugin entry point (index.js)
import GraphPlugin from './GraphPlugin.js';

// Register with YASR
if (typeof Yasgui !== 'undefined' && Yasgui.Yasr) {
  Yasgui.Yasr.registerPlugin('graph', GraphPlugin);
}

// For bundled distribution (UMD)
if (typeof window !== 'undefined') {
  window.GraphPlugin = GraphPlugin;
  if (window.Yasgui?.Yasr) {
    window.Yasgui.Yasr.registerPlugin('graph', GraphPlugin);
  }
}
```

## Version Compatibility

- **YASR Version**: 4.x (tested with @zazuko/yasgui ^4.0.0)
- **Breaking Changes**: None expected (interface stable since 2.x)
- **Forward Compatibility**: New YASR versions should maintain interface
