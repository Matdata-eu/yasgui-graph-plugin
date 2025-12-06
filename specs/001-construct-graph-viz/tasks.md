# Tasks: SPARQL CONSTRUCT Graph Visualization

**Feature**: `001-construct-graph-viz`  
**Branch**: `001-construct-graph-viz`  
**Input**: Design documents from `/specs/001-construct-graph-viz/`

**Tests**: Tests are NOT explicitly requested in the specification. Manual browser testing per constitution principle IV.

**Organization**: Tasks are grouped by user story (P1-P5) to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, etc.) - included for user story phases only
- All paths are absolute from repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and build configuration

- [X] T001 Initialize package.json with dependencies: vis-network ^9.1.9, @zazuko/yasgui ^4.x (peerDependency), esbuild (devDependency)
- [X] T002 [P] Create .eslintrc.js with ES2018+ rules for code quality validation
- [X] T003 [P] Create .prettierrc with formatting rules (2-space indent, single quotes, no trailing commas)
- [X] T004 Create esbuild.config.js to bundle src/index.js → dist/yasgui-graph-plugin.min.js (UMD format, global `GraphPlugin`)
- [X] T005 [P] Create src/ directory structure: GraphPlugin.js, parsers.js, transformers.js, prefixUtils.js, colorUtils.js, networkConfig.js, index.js
- [X] T006 [P] Create example/ directory with index.html and queries.js for manual testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and base plugin structure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Implement extractPrefixes(yasrResults) in src/prefixUtils.js to extract namespace mappings from SPARQL results metadata
- [X] T008 [P] Implement applyPrefix(uri, prefixMap) in src/prefixUtils.js to convert full URI to prefixed form (e.g., http://example.org/Person → ex:Person)
- [X] T009 [P] Implement truncateLabel(text, maxLength=50) in src/prefixUtils.js to truncate long labels with ellipsis while preserving full value
- [X] T010 [P] Implement getNodeColor(node, triples) in src/colorUtils.js to determine color: #FFFF00 (blank nodes), #808080 (literals), #00FF00 (rdf:type objects), #0000FF (other URIs)
- [X] T011 [P] Implement getDefaultNetworkOptions() in src/networkConfig.js returning vis-network config: physics enabled with 200 max iterations, interactions (drag/zoom/pan/hover), autoResize, 100% width/height
- [X] T012 Create GraphPlugin class skeleton in src/GraphPlugin.js with constructor(yasr), priority=20, label='Graph', and placeholder methods: canHandleResults(), draw(), getIcon()
- [X] T013 Implement GraphPlugin.canHandleResults() to detect CONSTRUCT and DESCRIBE results by checking for subject/predicate/object variables in this.yasr.results
- [X] T014 Implement GraphPlugin.getIcon() to return Font Awesome icon element (fa-project-diagram) for YASR tab
- [X] T015 Export GraphPlugin and auto-register with Yasgui.Yasr.registerPlugin('graph', GraphPlugin) in src/index.js (UMD compatibility)

**Checkpoint**: Foundation ready - plugin skeleton complete, utilities available, user story implementation can now begin

---

## Phase 3: User Story 1 - View Basic Graph Structure (Priority: P1) 🎯 MVP

**Goal**: Parse CONSTRUCT results and render interactive graph with nodes (subjects/objects) and edges (predicates) using automatic layout

**Independent Test**: Execute any CONSTRUCT query with connected triples, verify nodes appear with correct labels and colors, edges connect properly, automatic spacing works for disconnected components, prefixes applied to labels

### Implementation for User Story 1

- [X] T016 [P] [US1] Implement parseConstructResults(yasrResults) in src/parsers.js to extract RDFTriple[] from bindings format (subject/predicate/object with type/value/datatype)
- [X] T017 [P] [US1] Implement createNodeMap(triples) helper in src/transformers.js to deduplicate subjects/objects into Map<string, GraphNode> with id, uri, label, color, type, fullValue
- [X] T018 [P] [US1] Implement createEdgesArray(triples, nodeMap) helper in src/transformers.js to create GraphEdge[] with from/to node IDs, predicate label, arrows:'to'
- [X] T019 [US1] Implement triplesToGraph(triples, prefixMap) in src/transformers.js orchestrating createNodeMap() and createEdgesArray() to return {nodes: GraphNode[], edges: GraphEdge[]}
- [X] T020 [US1] Implement GraphPlugin.draw() method: clear this.yasr.resultsEl, parse triples via parseConstructResults(), extract prefixes via extractPrefixes(), transform via triplesToGraph()
- [X] T021 [US1] In GraphPlugin.draw(), create container div with 100% width/height, append to this.yasr.resultsEl
- [X] T022 [US1] In GraphPlugin.draw(), create vis.DataSet for nodes and edges, instantiate vis.Network with container, data, and options from getDefaultNetworkOptions()
- [X] T023 [US1] In GraphPlugin.draw(), handle stabilizationIterationsDone event to keep physics enabled after layout completes (can be disabled later if user feedback indicates performance issues)
- [X] T024 [US1] In GraphPlugin.draw(), add error handling to display empty state message if zero triples, or error message if parsing fails
- [X] T025 [US1] Handle blank nodes in createNodeMap(): detect _:b* identifiers, assign yellow color #FFFF00, generate label "_:b1" etc.
- [X] T026 [US1] Handle multiple predicates between same nodes in createEdgesArray(): create separate edge for each predicate, vis-network will curve them automatically
- [X] T027 [US1] Apply prefix abbreviation to node labels in createNodeMap() using applyPrefix(), truncate long labels using truncateLabel()
- [X] T028 [US1] Apply prefix abbreviation to edge labels in createEdgesArray() using applyPrefix()

**Checkpoint**: User Story 1 complete - basic graph visualization working with correct colors, labels, and layout

---

## Phase 4: User Story 2 - Navigate and Explore Graph (Priority: P2)

**Goal**: Enable zoom (mouse wheel), pan (drag background), and "zoom to extents" control for exploring different parts of the graph

**Independent Test**: Render any graph from US1, verify mouse wheel zooms in/out centered on cursor, click-drag pans viewport smoothly, "fit to view" centers entire graph, graph remains responsive and fills YASR container

### Implementation for User Story 2

- [X] T029 [US2] Verify vis-network zoom interaction: mouse wheel scrolling already works via getDefaultNetworkOptions() interaction.zoomView:true (no code changes needed)
- [X] T030 [US2] Verify vis-network pan interaction: background drag already works via getDefaultNetworkOptions() interaction.dragView:true (no code changes needed)
- [X] T031 [US2] Add "zoom to extents" button to container in GraphPlugin.draw(): create button element with onclick calling this.network.fit()
- [X] T032 [US2] Style "zoom to extents" button with CSS: position absolute top-right corner, padding, border, background, hover state
- [X] T033 [US2] Verify responsive layout: confirm getDefaultNetworkOptions() includes autoResize:true and width/height:'100%' (already configured in T011)
- [ ] T034 [US2] Test smooth rendering during interactions: verify FR-018 (<200ms response) by observing zoom/pan operations in example/index.html

**Checkpoint**: User Story 2 complete - navigation controls working, smooth interactions verified

---

## Phase 5: User Story 3 - Reorganize Layout (Priority: P3)

**Goal**: Allow users to drag individual nodes to new positions with edges updating in real-time and positions persisting during zoom/pan

**Independent Test**: Render any graph, drag nodes to new positions, verify edges follow smoothly, zoom/pan maintains relative positions, no automatic snapping occurs

### Implementation for User Story 3

- [X] T035 [US3] Verify vis-network node dragging: already enabled via getDefaultNetworkOptions() interaction.dragNodes:true (no code changes needed)
- [X] T036 [US3] Verify edge updates during drag: vis-network automatically updates edges in real-time (built-in behavior, no code changes needed)
- [X] T037 [US3] Verify position persistence: vis-network maintains node positions in DataSet during zoom/pan (built-in behavior, no code changes needed)
- [ ] T038 [US3] Test manual positioning: verify no snapping or collision prevention in example/index.html (FR-019 requirement)

**Checkpoint**: User Story 3 complete - manual node positioning working as expected

---

## Phase 6: User Story 4 - Inspect Node and Edge Details (Priority: P4)

**Goal**: Show tooltips on hover (300ms delay) with full URI/literal details including datatypes for nodes and predicate URIs for edges

**Independent Test**: Render graph with URIs and literals, hover over nodes and edges, verify tooltips appear after 300ms showing full prefixed URI/literal with datatype/predicate, tooltips disappear on mouse leave

### Implementation for User Story 4

- [X] T039 [P] [US4] Add title attribute to nodes in createNodeMap() in src/transformers.js: for URIs show full prefixed URI, for literals show value with datatype (e.g., "123"^^xsd:integer), for blank nodes show identifier
- [X] T040 [P] [US4] Add title attribute to edges in createEdgesArray() in src/transformers.js: show full prefixed predicate URI
- [X] T041 [US4] Configure tooltip delay in getDefaultNetworkOptions() in src/networkConfig.js: add tooltipDelay property set to 300ms for nodes and edges
- [ ] T042 [US4] Verify tooltip behavior in example/index.html: confirm 300ms delay before showing, auto-hide on mouse leave (vis-network built-in behavior)

**Checkpoint**: User Story 4 complete - tooltips working with correct information and timing

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, performance optimization, and final documentation

- [X] T043 [P] Handle empty results edge case: enhance GraphPlugin.draw() empty state message to match FR-029 "No graph data to visualize"
- [X] T044 [P] Handle single triple edge case: verify graph renders two nodes with one edge centered in viewport
- [X] T045 [P] Handle self-referencing triples: verify vis-network renders loop edges correctly (built-in support)
- [X] T046 [P] Handle very long URIs: ensure truncateLabel() in prefixUtils.js truncates with ellipsis at 50 chars (already implemented in T009)
- [X] T047 [P] Handle very long literals: ensure truncateLabel() in prefixUtils.js truncates with ellipsis at 50 chars (already implemented in T009)
- [X] T048 [P] Handle duplicate triples deduplication: verify createEdgesArray() in transformers.js only creates one edge per unique subject-predicate-object (Map/Set based)
- [X] T049 Add performance warning for large graphs: in GraphPlugin.draw(), if triples.length > 1000, log console warning about potential slowness
- [X] T050 Handle browser resize: verify vis-network autoResize option handles window resize automatically (configured in T011)
- [X] T051 Add CSS styling for plugin container in src/GraphPlugin.js: container height 600px or 100% of parent, overflow hidden, position relative
- [X] T052 Create example/queries.js with sample CONSTRUCT queries: basic graph, ontology visualization, DBpedia example, large graph (100+ triples)
- [X] T053 Create example/index.html with YASGUI instance, plugin registration, endpoint configuration, and query examples
- [X] T054 Update README.md with installation instructions, usage examples, configuration options, and link to quickstart.md
- [X] T055 Build dist/yasgui-graph-plugin.min.js using esbuild: run build script, verify UMD bundle, test global GraphPlugin export
- [ ] T056 Manual browser testing in Chrome: execute all example queries, verify all 5 user stories work correctly
- [ ] T057 Manual browser testing in Firefox: execute all example queries, verify all 5 user stories work correctly
- [ ] T058 Manual browser testing in Safari: execute all example queries, verify all 5 user stories work correctly
- [ ] T059 Manual browser testing in Edge: execute all example queries, verify all 5 user stories work correctly

**Checkpoint**: All edge cases handled, performance optimized, manual testing complete across all browsers

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

**Phase 1 + Phase 2 + Phase 3 (User Story 1)** = Minimal viable graph visualization

This provides:
- ✅ Basic graph rendering with automatic layout
- ✅ Color-coded nodes (literals/blank nodes/URIs/types)
- ✅ Prefixed labels
- ✅ Edge connections with predicates
- ✅ Plugin registration with YASR

**Delivery**: Can be released as v0.1.0 after completing T001-T028

### Incremental Additions

- **v0.2.0**: Add Phase 4 (User Story 2 - Navigation) for zoom/pan controls
- **v0.3.0**: Add Phase 5 (User Story 3 - Reorganize) for node dragging
- **v0.4.0**: Add Phase 6 (User Story 4 - Tooltips) for detail inspection
- **v1.0.0**: Complete Phase 8 (Polish) for production readiness

### Parallel Execution Opportunities

**Within Setup Phase (Phase 1)**:
- T002 (eslint), T003 (prettier), T005 (directories), T006 (examples) can run in parallel after T001

**Within Foundational Phase (Phase 2)**:
- T007-T011 (all utility functions) can run in parallel independently
- T012-T015 (plugin skeleton) must run sequentially

**Within User Story 1 (Phase 3)**:
- T016-T018 (parsers/transformers helpers) can run in parallel
- T025-T028 (edge case handlers) can run in parallel after T016-T024 complete

**Within User Story 4 (Phase 6)**:
- T039-T040 (tooltip content) can run in parallel

**Within Polish Phase (Phase 8)**:
- T049-T054 (edge case handlers) can run in parallel
- T062-T065 (browser testing) can run in parallel

**Example Parallel Execution for User Story 1**:
```
┌─ T016 [parsers.js] ────┐
├─ T017 [transformers.js] ┼─→ T019 → T020-T024 (draw() implementation) → T027-T028
└─ T018 [transformers.js] ┘      ↑
                                  │
   ┌─ T025 (blank nodes) ─────────┤
   ├─ T026 (multi predicates) ────┤
   └─ T027-T028 (labels) ─────────┘
```

---

## Dependencies (User Story Completion Order)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKING: Must complete before any user story
    ↓
Phase 3 (US1: View Graph) ← MVP: Core visualization
    ↓
Phase 4 (US2: Navigate) ← Depends on US1 (need graph to navigate)
    ↓
Phase 5 (US3: Reorganize) ← Depends on US1 (need nodes to drag)
    ↓
Phase 6 (US4: Tooltips) ← Depends on US1 (need elements to hover)
    ↓
Phase 7 (Polish) ← Final integration and testing
```

**Critical Path**: T001 → T007-T015 (foundational) → T016-T028 (US1) → T029-T042 (US2-US5) → T043-T059 (polish)

**No circular dependencies**: Each user story builds on US1 but stories are otherwise independent

---

## Task Summary

- **Total Tasks**: 65
- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 9 tasks (BLOCKING)
- **Phase 3 (US1 - View)**: 13 tasks (MVP)
- **Phase 4 (US2 - Navigate)**: 6 tasks
- **Phase 5 (US3 - Reorganize)**: 4 tasks
- **Phase 6 (US4 - Tooltips)**: 4 tasks
- **Phase 7 (Polish)**: 17 tasks

**Parallel Opportunities**: 22 tasks marked [P] can run in parallel (34% of total)

**Independent Test Criteria**:
- US1: Execute CONSTRUCT query, verify graph renders with correct colors/labels/layout
- US2: Zoom/pan/fit controls work smoothly on any graph
- US3: Drag nodes, positions persist during navigation
- US4: Hover shows tooltips after 300ms with full details

**Format Validation**: ✅ All tasks follow checklist format `- [ ] [ID] [P?] [Story?] Description with file path`

---

## Notes

- **No tests**: Manual browser testing per constitution principle IV (Browser Compatibility)
- **vis-network features**: Many US2/US3 requirements already provided by vis-network built-in functionality (zoom, pan, drag, tooltips), tasks verify configuration
- **Incremental delivery**: Each user story phase is independently testable and deliverable
- **MVP focus**: Phase 1 + 2 + 3 (T001-T028) provides minimal viable product
- **Constitution compliance**: All tasks align with 5 constitution principles (plugin-first, quality, flexibility, compatibility, documentation)
