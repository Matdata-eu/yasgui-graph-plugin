# Feature Specification: SPARQL CONSTRUCT Graph Visualization

**Feature Branch**: `001-construct-graph-viz`  
**Created**: 2025-12-05  
**Status**: Draft  
**Input**: User description: "Visualize SPARQL CONSTRUCT and DESCRIBE query results as interactive graphs with nodes (subjects/objects) and edges (predicates), supporting zoom, drag, tooltips and color coding"

## Clarifications

### Session 2025-12-06

- Q: What visual styling should be used for graph nodes to distinguish between different node types and content lengths? → A: All nodes use uniform shape (circle/ellipse) with fixed size, regardless of label length or type
- Q: How should tooltips be triggered and displayed to balance information access with usability? → A: Hover only with 300ms delay before showing, auto-hide on mouse leave
- Q: How should the plugin handle blank nodes (anonymous RDF nodes with no URI) that appear in CONSTRUCT results? → A: Display with generated label but use unique orange color (#e15b13ff) to distinguish from literals
- Q: When the same subject and object are connected by multiple different predicates, how should these be displayed? → A: Draw separate parallel edges for each predicate (may overlap/curve to show multiple)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Basic Graph Structure (Priority: P1)

A SPARQL user executes a CONSTRUCT query that returns RDF triples. Upon receiving results, the plugin automatically renders the triples as an interactive graph where subjects and objects become nodes, and predicates become edges. The user immediately sees the structure of their data without manual configuration.

**Why this priority**: This is the core value proposition - transforming triple data into visual form. Without this, the plugin has no purpose. This represents the minimum viable visualization.

**Independent Test**: Can be fully tested by executing any CONSTRUCT query with connected triples and verifying that nodes and edges appear with correct labels and initial layout.

**Acceptance Scenarios**:

1. **Given** a CONSTRUCT query returns triples `<A> <p1> <B>` and `<B> <p2> <C>`, **When** the plugin renders the result, **Then** three nodes (A, B, C) appear with two edges labeled p1 and p2 connecting them
2. **Given** a CONSTRUCT query returns a triple with a literal object `<A> <label> "Example"`, **When** the plugin renders the result, **Then** node A appears connected to a node displaying "Example" (without datatype decoration)
3. **Given** a CONSTRUCT query returns triples forming a disconnected graph, **When** the plugin renders the result, **Then** all nodes and edges appear with automatic spacing preventing overlaps
4. **Given** prefixes are defined (e.g., `ex:` for `http://example.org/`), **When** the plugin renders nodes, **Then** URIs display as prefixed form (e.g., `ex:Person` instead of full URI)

---

### User Story 2 - Navigate and Explore Graph (Priority: P2)

After the graph is rendered, the user wants to explore different parts of the visualization by panning and zooming. They should be able to zoom to see details of specific nodes/edges, pan to view different areas, and quickly reset to see the entire graph at once.

**Why this priority**: Static visualizations are insufficient for complex graphs. Navigation is essential for usability but only valuable after the graph is visible (depends on P1).

**Independent Test**: Render any graph from P1, then verify zoom in/out, pan/drag viewport, and "fit to view" functionality all work correctly and maintain graph proportions.

**Acceptance Scenarios**:

1. **Given** a rendered graph, **When** the user scrolls the mouse wheel, **Then** the graph zooms in (wheel up) or out (wheel down) centered on the cursor position
2. **Given** a rendered graph, **When** the user clicks and drags the background, **Then** the viewport pans smoothly in the drag direction
3. **Given** a rendered graph that doesn't fit the current view, **When** the user clicks "zoom to extents" control, **Then** the graph scales and centers to show all nodes within the available space
4. **Given** a rendered graph with zoom applied, **When** the user navigates, **Then** the graph remains fully responsive and takes maximum available space within YASR container (both horizontally and vertically)

---

### User Story 3 - Reorganize Layout (Priority: P3)

After viewing the automatic layout, the user wants to manually adjust node positions to better understand relationships or prepare the graph for presentation. They should be able to drag individual nodes to new positions while edges automatically update.

**Why this priority**: Automatic layouts may not always align with user mental models. Manual adjustment improves comprehension and presentation quality, but is secondary to seeing the data (depends on P1).

**Independent Test**: Render any graph, then drag nodes to new positions and verify edges follow, positions persist during zoom/pan, and layout remains stable.

**Acceptance Scenarios**:

1. **Given** a rendered graph, **When** the user clicks and drags a node, **Then** the node moves smoothly to follow the cursor and all connected edges update their endpoints in real-time
2. **Given** a node has been manually repositioned, **When** the user zooms or pans, **Then** the node maintains its relative position in the graph coordinate system
3. **Given** multiple nodes are manually positioned, **When** the user drags a node near another node, **Then** no automatic snapping or collision prevention occurs (user has full control)

---

### User Story 4 - Inspect Node and Edge Details (Priority: P4)

While exploring the graph, the user wants to see detailed information about nodes and edges without cluttering the visualization. Hovering over elements should reveal tooltips with full URIs (or literals) and datatypes.

**Why this priority**: Labels are abbreviated for readability, but users often need full URIs for technical work. Tooltips provide details on-demand without visual clutter, enhancing P1 visualization.

**Independent Test**: Render a graph with URIs and literals, hover over nodes and edges, and verify tooltips show correct full information with prefixes where applicable.

**Acceptance Scenarios**:

1. **Given** a rendered graph with URI nodes, **When** the user hovers over a URI node, **Then** a tooltip appears showing the full prefixed URI (e.g., `ex:Person`)
2. **Given** a rendered graph with literal nodes, **When** the user hovers over a literal node, **Then** a tooltip appears showing the literal value with its datatype (e.g., `"123"^^xsd:integer`)
3. **Given** a rendered graph with edges, **When** the user hovers over an edge, **Then** a tooltip appears showing the predicate URI in prefixed form
4. **Given** the user moves the cursor away from an element, **When** the cursor leaves the element boundary, **Then** the tooltip disappears after a brief delay (≤500ms)

---

### Edge Cases

- **Empty results**: What happens when a CONSTRUCT query returns zero triples? → Display empty state message "No graph data to visualize"
- **Single triple**: What happens when only one triple is returned? → Render two nodes with one edge, centered in viewport
- **Isolated nodes**: What happens when triples contain subjects/objects with no connections? → Display as separate components with automatic spacing
- **Very long URIs**: How are extremely long URIs handled in labels? → Truncate with ellipsis (e.g., `very-long-na...#term`), full URI in tooltip
- **Very long literals**: How are literals with thousands of characters displayed? → Truncate label to ~50 characters, full value in tooltip
- **Duplicate triples**: What happens when identical triples appear multiple times? → Display as single edge (no duplicate edges between same nodes with same predicate)
- **Multiple predicates between same nodes**: What happens when `<A> <p1> <B>` and `<A> <p2> <B>` exist? → Draw separate parallel edges for each predicate (edges may curve/offset to avoid complete overlap)
- **Blank nodes**: How are anonymous RDF nodes (e.g., `_:b1`) displayed? → Show with generated label ("_:b1") in unique orange color (#e15b13ff) to distinguish from literals and URIs
- **Self-referencing triples**: What happens when subject equals object (e.g., `<A> <related> <A>`)? → Display as loop edge from node to itself
- **No prefixes defined**: What happens when SPARQL results don't include prefix definitions? → Only show the part of the URI after last `/` or `#` as label
- **Large graphs (1000+ triples)**: How does the plugin handle performance with many nodes? → Initial layout completes within 2 seconds; warn user if exceeds rendering capacity
- **Invalid coordinates during drag**: What happens if user drags node outside viewport? → Allow off-screen positioning; user can pan or zoom to extents to recover
- **Browser resize**: What happens when user resizes browser window? → Graph automatically scales to fill new YASR container dimensions while maintaining proportions

## Requirements *(mandatory)*

### Functional Requirements

#### Data Parsing & Graph Construction

- **FR-001**: Plugin MUST detect when YASR receives CONSTRUCT or DESCRIBE query results (as opposed to SELECT/ASK)
- **FR-002**: Plugin MUST parse RDF triples from SPARQL results and extract subject, predicate, object for each triple
- **FR-003**: Plugin MUST create graph nodes for all unique subjects and objects appearing in triples
- **FR-004**: Plugin MUST create graph edges for predicates connecting subject nodes to object nodes
- **FR-005**: Plugin MUST distinguish between URI nodes and literal nodes based on RDF data types
- **FR-006**: Plugin MUST extract and apply namespace prefixes from SPARQL results to abbreviate URIs

#### Visual Rendering

- **FR-007**: Plugin MUST render graph using a force-directed or hierarchical layout algorithm that automatically spaces nodes to minimize edge crossings and overlaps
- **FR-008**: Plugin MUST complete initial graph layout within 2 seconds for graphs up to 1,000 nodes (performance target per constitution)
- **FR-009**: Plugin MUST apply color coding to nodes: light grey (#c5c5c5ff) for literals, orange (#e15b13ff) for blank nodes, light green (#a6c8a6ff) for nodes that are objects of `rdf:type` predicate, light blue (#97C2FC) for all other URI nodes
- **FR-010**: Plugin MUST label URI nodes with prefixed form (e.g., `ex:Person` instead of `http://example.org/Person`)
- **FR-010a**: Plugin MUST label blank nodes with their generated identifier (e.g., `_:b1`, `_:b2`)
- **FR-011**: Plugin MUST label literal nodes with the literal value only, excluding datatype suffix (e.g., `"John"` not `"John"^^xsd:string`)
- **FR-012**: Plugin MUST label edges with the predicate URI in prefixed form
- **FR-012a**: Plugin MUST render separate edges when multiple predicates connect the same two nodes, using curved or offset paths to prevent complete overlap
- **FR-013**: Plugin MUST render all nodes using uniform shape (circle or ellipse) with fixed size, regardless of node type or label length
- **FR-014**: Plugin MUST render the graph to fill 100% of available YASR container space both horizontally and vertically (responsive layout per constitution)

#### User Interaction - Navigation

- **FR-015**: Plugin MUST support viewport zooming via mouse wheel (scroll up to zoom in, scroll down to zoom out)
- **FR-016**: Plugin MUST support viewport panning via click-and-drag on background
- **FR-017**: Plugin MUST provide "zoom to extents" control that automatically scales and centers the graph to fit all nodes in viewport
- **FR-018**: Plugin MUST maintain smooth rendering (no lag or jank) during zoom and pan operations

#### User Interaction - Node Manipulation

- **FR-019**: Plugin MUST allow users to drag individual nodes to new positions
- **FR-020**: Plugin MUST update connected edges in real-time as nodes are dragged
- **FR-021**: Plugin MUST maintain manually adjusted node positions when zooming or panning

#### User Interaction - Tooltips

- **FR-022**: Plugin MUST display tooltip after 300ms hover delay over URI nodes showing the full prefixed URI
- **FR-023**: Plugin MUST display tooltip after 300ms hover delay over literal nodes showing the literal value with datatype (e.g., `"123"^^xsd:integer`)
- **FR-024**: Plugin MUST display tooltip after 300ms hover delay over blank nodes showing the generated identifier
- **FR-025**: Plugin MUST display tooltip after 300ms hover delay over edges showing the full prefixed predicate URI
- **FR-026**: Plugin MUST hide tooltips when cursor leaves element boundary (auto-hide on mouse leave)

#### Edge Case Handling

- **FR-028**: Plugin MUST display empty state message when CONSTRUCT query returns zero triples
- **FR-029**: Plugin MUST handle self-referencing triples (subject equals object) by rendering loop edges
- **FR-030**: Plugin MUST handle blank nodes by creating nodes with generated labels and orange color (#e15b13ff)
- **FR-031**: Plugin MUST render multiple predicates between the same node pair as separate parallel edges with curved/offset paths
- **FR-032**: Plugin MUST truncate very long URI labels with ellipsis while preserving full URI in tooltips
- **FR-033**: Plugin MUST truncate literal labels exceeding ~50 characters while preserving full value in tooltips
- **FR-034**: Plugin MUST de-duplicate identical triples (same subject, predicate, object) to avoid rendering duplicate edges

### Key Entities

- **GraphNode**: Represents either a subject or object from RDF triples
  - Attributes: URI or literal value or blank node identifier, node type (URI/literal/blank), color (light grey/orange/light green/light blue), shape (uniform circle/ellipse), size (fixed), position (x, y coordinates), label (abbreviated form)
  - Relationships: Connected to other nodes via edges (may have multiple edges with different predicates to same target)

- **GraphEdge**: Represents a predicate connecting two nodes
  - Attributes: Predicate URI, source node, target node, label (abbreviated predicate)
  - Relationships: Links exactly one source node to one target node

- **GraphLayout**: The overall spatial arrangement of nodes and edges
  - Attributes: Viewport bounds, zoom level, pan offset
  - Relationships: Contains all nodes and edges, determines visible region

- **RDFTriple**: Raw data unit from SPARQL CONSTRUCT results
  - Attributes: Subject URI, predicate URI, object (URI or literal with datatype)
  - Relationships: Transformed into graph nodes and edges

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can visualize CONSTRUCT query results as graphs within 2 seconds of receiving results (for graphs up to 1,000 nodes)
- **SC-002**: Users can identify node types (literal vs. blank node vs. URI vs. type instance) through color coding without reading labels (light grey/orange/light blue/light green)
- **SC-003**: Users can navigate graphs of any size by zooming and panning without performance degradation
- **SC-004**: Users can reorganize graph layouts manually to improve understanding of relationships
- **SC-005**: Users can access full URI details for any node or edge via hover tooltips
- **SC-006**: Plugin maintains responsive layout across all YASR container sizes (from 320px mobile to 4K desktop)
- **SC-007**: Graph rendering completes successfully for 95% of valid CONSTRUCT query results without errors or empty states (excluding intentionally empty results)

## Assumptions

- SPARQL endpoints return CONSTRUCT results in standard RDF formats (JSON-LD, Turtle, N-Triples, or RDF/XML) that YASR can parse
- Prefix definitions are included in SPARQL result metadata or can be extracted from query context
- YASR provides sufficient container space (minimum 300px × 300px) for meaningful graph visualization
- Users have mouse or touch input for zoom, pan, and drag interactions
- Modern browsers support Canvas or SVG rendering for graph visualization (covered by constitution's browser compatibility requirements)
- Force-directed layout algorithms are acceptable for automatic node positioning (no specific layout algorithm mandated)
- Graph visualizations do not require persistence - each query execution produces a fresh visualization
