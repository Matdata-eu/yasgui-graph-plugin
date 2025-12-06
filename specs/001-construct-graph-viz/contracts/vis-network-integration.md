# API Contract: vis-network Integration

**Feature**: `001-construct-graph-viz`  
**Date**: 2025-12-05  
**Purpose**: Define integration contract with vis-network library

## Overview

This contract defines how the GraphPlugin interacts with the vis-network library (v9.x) for graph visualization. It covers Network instance creation, data management via DataSets, event handling, and configuration options.

## Library Version

- **Package**: `vis-network`
- **Version**: `^9.1.9` (or latest 9.x)
- **Import**: `import {Network, DataSet} from 'vis-network'` (ES module) or global `vis` (UMD)

## Core Classes

### Network

Main visualization class representing the interactive graph canvas.

**Constructor**:
```typescript
new Network(
  container: HTMLElement,
  data: {nodes: DataSet | Array, edges: DataSet | Array},
  options?: NetworkOptions
): Network
```

**Parameters**:
- `container`: DOM element to render into (must have explicit dimensions)
- `data.nodes`: DataSet or array of node objects
- `data.edges`: DataSet or array of edge objects
- `options`: Configuration object (physics, interaction, layout)

**Methods**:
```typescript
// Layout control
network.fit(options?: {animation: boolean}): void
network.stabilize(iterations?: number): void

// Physics control
network.setOptions(options: Partial<NetworkOptions>): void
network.stopSimulation(): void

// Event handling
network.on(event: string, callback: Function): void
network.once(event: string, callback: Function): void
network.off(event: string, callback: Function): void

// Export
network.canvas.getContext(): CanvasRenderingContext2D
```

**Events**:
- `'click'`: User clicks node/edge/canvas
- `'hoverNode'`: Mouse enters node
- `'blurNode'`: Mouse leaves node
- `'stabilizationIterationsDone'`: Initial layout complete
- `'stabilizationProgress'`: Layout progress update

**Example**:
```javascript
const network = new Network(
  document.getElementById('graph-container'),
  {
    nodes: new DataSet([...]),
    edges: new DataSet([...])
  },
  {
    physics: {enabled: true},
    interaction: {dragNodes: true, zoomView: true}
  }
);

// Disable physics after initial layout
network.once('stabilizationIterationsDone', () => {
  network.setOptions({physics: {enabled: false}});
});

// Handle node clicks
network.on('click', (event) => {
  if (event.nodes.length > 0) {
    console.log('Clicked node:', event.nodes[0]);
  }
});
```

---

### DataSet

Reactive data container for nodes and edges. Updates automatically trigger re-renders.

**Constructor**:
```typescript
new DataSet<T>(items?: Array<T>, options?: DataSetOptions): DataSet<T>
```

**Methods**:
```typescript
// Add items
add(item: T | Array<T>): Array<id>

// Update items
update(item: T | Array<T>): Array<id>

// Remove items
remove(id: id | Array<id>): Array<id>

// Clear all
clear(): Array<id>

// Query items
get(id?: id | Array<id> | GetOptions): T | Array<T>
getIds(): Array<id>

// Subscribe to changes
on(event: 'add' | 'update' | 'remove', callback: (event, properties, senderId) => void): void
```

**Example**:
```javascript
// Create nodes DataSet
const nodesDataSet = new DataSet([
  {id: 1, label: 'Node 1', color: '#0000FF'},
  {id: 2, label: 'Node 2', color: '#808080'}
]);

// Add new node
nodesDataSet.add({id: 3, label: 'Node 3', color: '#00FF00'});

// Update existing node
nodesDataSet.update({id: 1, color: '#FF0000'});

// Remove node
nodesDataSet.remove(2);

// Get all nodes
const allNodes = nodesDataSet.get();

// Listen for changes
nodesDataSet.on('add', (event, properties) => {
  console.log('Nodes added:', properties.items);
});
```

## Node Data Format

```typescript
interface NodeData {
  id: number;                    // Required: Unique identifier
  label?: string;                // Display text
  color?: string | ColorObject;  // Hex color or {background, border, highlight}
  x?: number;                    // Fixed X position (optional)
  y?: number;                    // Fixed Y position (optional)
  fixed?: boolean | {x: boolean, y: boolean}; // Prevent dragging
  shape?: 'ellipse' | 'circle' | 'box' | 'text'; // Node shape
  title?: string;                // Tooltip HTML
  font?: FontOptions;            // Label styling
  [key: string]: any;            // Custom properties (preserved, not rendered)
}
```

**Required**:
- `id`: Must be unique across all nodes

**Optional**:
- `label`: Defaults to empty string
- `color`: Defaults to network color options
- `title`: Shown on hover (supports HTML)
- Custom properties (e.g., `uri`, `fullValue`) preserved but ignored by vis-network

**Example**:
```javascript
{
  id: 1,
  label: 'ex:Person',
  color: '#00FF00',
  title: '<b>URI:</b> http://example.org/Person',
  shape: 'box',
  // Custom properties (not used by vis-network)
  uri: 'http://example.org/Person',
  fullValue: 'http://example.org/Person',
  type: 'uri'
}
```

## Edge Data Format

```typescript
interface EdgeData {
  id?: string | number;          // Optional: Auto-generated if omitted
  from: number;                  // Required: Source node ID
  to: number;                    // Required: Target node ID
  label?: string;                // Display text
  arrows?: 'to' | 'from' | 'middle' | {to: boolean, from: boolean}; // Arrow direction
  color?: string | ColorObject;  // Edge color
  dashes?: boolean | Array<number>; // Dashed line
  width?: number;                // Line thickness
  title?: string;                // Tooltip HTML
  [key: string]: any;            // Custom properties
}
```

**Required**:
- `from`: Must reference existing node ID
- `to`: Must reference existing node ID

**Optional**:
- `id`: Auto-generated if omitted
- `label`: Defaults to empty string
- `arrows`: Defaults to no arrows
- `title`: Shown on hover

**Example**:
```javascript
{
  from: 1,
  to: 2,
  label: 'ex:name',
  arrows: 'to',
  title: '<b>Predicate:</b> http://example.org/name',
  // Custom property
  predicate: 'http://example.org/name'
}
```

## Network Options

```typescript
interface NetworkOptions {
  autoResize?: boolean;          // Auto-detect container resizes
  width?: string;                // Canvas width (e.g., '100%', '800px')
  height?: string;               // Canvas height (e.g., '100%', '600px')
  
  layout?: {
    improvedLayout?: boolean;    // Use improved force-directed algorithm
    randomSeed?: number;         // Seed for reproducible layouts
  };
  
  physics?: {
    enabled?: boolean;           // Enable/disable physics simulation
    stabilization?: {
      enabled?: boolean;
      iterations?: number;       // Max stabilization iterations
      updateInterval?: number;   // Progress event frequency
    };
    solver?: 'barnesHut' | 'forceAtlas2' | 'repulsion'; // Physics engine
  };
  
  interaction?: {
    dragNodes?: boolean;         // Allow node dragging
    dragView?: boolean;          // Allow canvas panning
    zoomView?: boolean;          // Allow zooming
    hover?: boolean;             // Enable hover events
    navigationButtons?: boolean; // Show zoom/pan buttons
    keyboard?: boolean;          // Keyboard shortcuts
  };
  
  nodes?: {
    color?: ColorObject;         // Default node color
    font?: FontOptions;          // Default label styling
    shape?: string;              // Default node shape
  };
  
  edges?: {
    color?: ColorObject;         // Default edge color
    font?: FontOptions;          // Default label styling
    arrows?: ArrowOptions;       // Default arrows
  };
}
```

**Example**:
```javascript
const options = {
  autoResize: true,
  width: '100%',
  height: '100%',
  
  layout: {
    improvedLayout: true
  },
  
  physics: {
    enabled: true,
    stabilization: {
      enabled: true,
      iterations: 200
    },
    solver: 'barnesHut'
  },
  
  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
    hover: true,
    navigationButtons: false,
    keyboard: true
  },
  
  nodes: {
    shape: 'box',
    font: {
      size: 14,
      face: 'Arial'
    }
  },
  
  edges: {
    arrows: {
      to: {enabled: true, scaleFactor: 1}
    },
    font: {
      size: 12,
      align: 'middle'
    }
  }
};
```

## Event Handling

### Click Events

```javascript
network.on('click', (event) => {
  // event.nodes: Array of clicked node IDs
  // event.edges: Array of clicked edge IDs
  // event.pointer: {DOM: {x, y}, canvas: {x, y}}
  
  if (event.nodes.length > 0) {
    const nodeId = event.nodes[0];
    const nodeData = nodesDataSet.get(nodeId);
    console.log('Clicked node:', nodeData);
  }
});
```

### Hover Events

```javascript
network.on('hoverNode', (event) => {
  // event.node: Hovered node ID
  const nodeData = nodesDataSet.get(event.node);
  
  // Show tooltip (vis-network handles this automatically if node.title set)
  // Or custom tooltip logic here
});

network.on('blurNode', (event) => {
  // event.node: Previously hovered node ID
  // Hide custom tooltip if implemented
});
```

### Stabilization Events

```javascript
network.on('stabilizationProgress', (event) => {
  // event.iterations: Current iteration count
  // event.total: Total iterations to perform
  const progress = (event.iterations / event.total) * 100;
  console.log(`Layout progress: ${progress.toFixed(0)}%`);
});

network.once('stabilizationIterationsDone', () => {
  console.log('Layout complete');
  // Disable physics for better performance
  network.setOptions({physics: {enabled: false}});
});
```

## Export Functionality

```javascript
// Get canvas element
const canvas = network.canvas.frame.canvas;

// Export as PNG
canvas.toBlob(blob => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'graph.png';
  link.click();
  URL.revokeObjectURL(url);
}, 'image/png');

// Or get data URL
const dataURL = canvas.toDataURL('image/png');
```

## Performance Optimization

### Disable Physics After Layout

```javascript
// Automatically disable after stabilization
network.once('stabilizationIterationsDone', () => {
  network.setOptions({physics: {enabled: false}});
});

// Or manually after timeout
setTimeout(() => {
  network.stopSimulation();
  network.setOptions({physics: {enabled: false}});
}, 3000);
```

### Limit Stabilization Iterations

```javascript
const options = {
  physics: {
    stabilization: {
      iterations: 200, // Limit max iterations
      updateInterval: 50 // Less frequent progress events
    }
  }
};
```

### Use Efficient Solver

```javascript
const options = {
  physics: {
    solver: 'barnesHut', // Fast for large graphs
    barnesHut: {
      gravitationalConstant: -8000,
      springConstant: 0.04,
      springLength: 95
    }
  }
};
```

## Error Handling

```javascript
try {
  const network = new Network(container, data, options);
} catch (error) {
  if (error.message.includes('container')) {
    console.error('Container element not found or has no dimensions');
  } else if (error.message.includes('node')) {
    console.error('Invalid node data (missing id or invalid reference)');
  } else {
    console.error('vis-network initialization error:', error);
  }
}
```

## Cleanup

```javascript
// Destroy network instance (removes event listeners, canvas)
if (this.network) {
  this.network.destroy();
  this.network = null;
}

// Clear DataSets
if (this.nodesDataSet) {
  this.nodesDataSet.clear();
  this.nodesDataSet = null;
}
if (this.edgesDataSet) {
  this.edgesDataSet.clear();
  this.edgesDataSet = null;
}
```

## Testing Integration

```javascript
// Mock vis-network for unit tests
const mockNetwork = {
  on: jest.fn(),
  once: jest.fn(),
  setOptions: jest.fn(),
  fit: jest.fn(),
  destroy: jest.fn()
};

const mockDataSet = {
  add: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  get: jest.fn(() => []),
  clear: jest.fn()
};

// Test network creation
const network = new Network(container, data, options);
expect(network).toBeDefined();

// Test DataSet operations
const nodes = new DataSet([{id: 1, label: 'Test'}]);
expect(nodes.get(1)).toEqual({id: 1, label: 'Test'});
```

## Browser Compatibility

- **Canvas API**: Required (all modern browsers)
- **ES6+ Features**: DataSet uses ES6 (transpile if targeting older browsers)
- **Performance**: Tested up to 10,000 nodes/edges (with physics disabled)

## Documentation References

- Official docs: https://visjs.github.io/vis-network/docs/network/
- Examples: https://visjs.github.io/vis-network/examples/
- API reference: https://visjs.github.io/vis-network/docs/network/
