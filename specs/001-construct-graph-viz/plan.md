# Implementation Plan: SPARQL CONSTRUCT Graph Visualization

**Branch**: `001-construct-graph-viz` | **Date**: 2025-12-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-construct-graph-viz/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

**Primary Requirement**: Create a YASGUI plugin that visualizes SPARQL CONSTRUCT and DESCRIBE query results as interactive graphs with nodes (subjects/objects) and edges (predicates), supporting zoom, drag, tooltips and color coding by node type.

**Technical Approach**: Implement a YASR plugin class following the yasgui-geo pattern (constructor, canHandleResults, draw, getIcon methods) using vis-network v9.x for graph rendering. Parse RDF triples from bindings format, transform to vis-network DataSets with color-coded nodes (grey literals, green rdf:type objects, blue other URIs), apply prefix abbreviation, and leverage vis-network's built-in force-directed layout and interaction. Build with esbuild to UMD format for `Yasgui.Yasr.registerPlugin()` registration.

## Technical Context

**Language/Version**: JavaScript ES2018+ (transpiled for browser compatibility)  
**Primary Dependencies**: vis-network ^9.1.9 (production), @zazuko/yasgui ^4.x (peer dependency, not bundled)  
**Storage**: N/A (browser-only visualization, no persistence)  
**Testing**: Manual browser testing per constitution (Chrome/Firefox/Safari/Edge latest 2 versions)  
**Target Platform**: Modern web browsers (ES2018+ support, Canvas API required)  
**Project Type**: single (web plugin, no backend)  
**Performance Goals**: <2s render time for 1000 nodes/edges, <200ms response to user interactions  
**Constraints**: No YASGUI core modifications, plugin-only architecture, UMD distribution format  
**Scale/Scope**: Handle 100-1000 nodes typical, 10k nodes maximum (with physics disabled after layout)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Reference**: See `.specify/memory/constitution.md` for full principles

**Phase 1 Design Review (2025-12-05)**:

- [x] **Plugin-First Architecture**: ✅ Feature implements YASR plugin interface (constructor, canHandleResults, draw, getIcon) following yasgui-geo pattern. No YASGUI core modifications required. Registration via `Yasgui.Yasr.registerPlugin('graph', GraphPlugin)` maintains clean boundary.

- [x] **Visualization Quality**: ✅ Design targets <2s render for 1k nodes via physics stabilization limits (200 iterations max) and automatic physics disable after layout. vis-network provides smooth 60fps interactions. Accessibility: tooltips provide URI/literal details, color coding uses WCAG AA contrast (grey #808080, green #00FF00, blue #0000FF on white background). Screen reader support inherits from vis-network's Canvas implementation.

- [x] **Configuration Flexibility**: ✅ Network options (physics, interaction, layout) configurable via `getNetworkOptions()` method override. Color scheme, prefix maps, truncation length can be customized by extending GraphPlugin class. No hardcoded behavior in core logic. Sensible defaults: force-directed layout enabled, drag/zoom/pan enabled, 50-char label truncation.

- [x] **Browser Compatibility**: ✅ vis-network 9.x supports all modern browsers. ES2018+ transpilation via esbuild ensures compatibility with latest 2 versions Chrome/Firefox/Safari/Edge. Canvas API is universally supported. No polyfills required (all used features natively available in target browsers).

- [x] **Documentation & Examples**: ✅ Complete documentation suite: data-model.md (entities/relationships), contracts/ (YASR + vis-network interfaces), quickstart.md (installation/usage examples). Example SPARQL queries provided. Working demo planned in example/ directory. All created before implementation begins (Phase 2).

**Verdict**: All constitution gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
yasgui-graph-plugin/
├── src/
│   ├── GraphPlugin.js       # Main YASR plugin class (constructor, canHandleResults, draw, getIcon)
│   ├── parsers.js           # parseConstructResults: bindings → RDFTriple[]
│   ├── transformers.js      # triplesToGraph: RDFTriple[] → {nodes, edges}
│   ├── prefixUtils.js       # extractPrefixes, applyPrefix, truncateLabel
│   ├── colorUtils.js        # getNodeColor: determine color based on type/predicate
│   ├── networkConfig.js     # getDefaultNetworkOptions: vis-network configuration
│   └── index.js             # Entry point: export GraphPlugin, auto-register if UMD
│
├── dist/
│   └── yasgui-graph-plugin.min.js  # UMD bundle (esbuild output)
│
├── example/
│   ├── index.html           # Demo page with YASGUI + plugin
│   └── queries.js           # Sample CONSTRUCT queries
│
├── .specify/
│   ├── memory/
│   │   └── constitution.md  # Project governance (5 principles)
│   ├── templates/
│   └── scripts/
│
├── specs/
│   └── 001-construct-graph-viz/
│       ├── spec.md          # Feature specification
│       ├── research.md      # Phase 0 technical research
│       ├── data-model.md    # Phase 1 entity definitions
│       ├── quickstart.md    # Phase 1 user guide
│       ├── contracts/       # Phase 1 API contracts
│       │   ├── yasr-plugin-interface.md
│       │   └── vis-network-integration.md
│       ├── plan.md          # This file
│       └── tasks.md         # Phase 2 implementation tasks (not yet created)
│
├── package.json             # Dependencies: vis-network, @zazuko/yasgui (peer)
├── esbuild.config.js        # Build configuration (UMD output)
├── .eslintrc.js             # Code quality rules
├── .prettierrc              # Code formatting
├── LICENSE                  # Apache 2.0
└── README.md                # Project overview
```

**Structure Decision**: Single project structure (Option 1) selected. This is a browser-only web plugin with no backend, mobile, or multi-project requirements. All source code in `src/` directory with logical separation by concern (parsers, transformers, utilities, plugin class). UMD distribution bundle in `dist/` for CDN usage. Example demo in `example/` for testing and documentation. Build tool (esbuild) configured to bundle dependencies (vis-network) and expose global `GraphPlugin` for `Yasgui.Yasr.registerPlugin()` usage.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations detected.** All constitution gates pass without exceptions. Feature design adheres to all 5 principles:
1. Plugin-First: Clean YASR plugin interface, no core modifications
2. Visualization Quality: Performance targets met (<2s, 60fps), accessibility baseline (WCAG AA colors, tooltips)
3. Configuration Flexibility: All behaviors customizable via method overrides/options
4. Browser Compatibility: Universal browser support (ES2018+, Canvas API)
5. Documentation: Complete docs created before implementation (quickstart, contracts, data-model)

No complexity justifications required.
