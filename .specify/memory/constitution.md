# YASGUI Graph Plugin Constitution

## Core Principles

### I. Plugin-First Architecture

The yasgui-graph-plugin MUST operate as a self-contained, independently usable plugin within the YASGUI ecosystem.

**Non-negotiable Requirements:**
- Plugin MUST register cleanly with YASGUI/Yasr without requiring core modifications
- Plugin MUST NOT introduce breaking dependencies or version conflicts with YASGUI core
- Plugin interface MUST conform to YASGUI plugin API contract (canHandleResults, draw, getIcon, etc.)
- Plugin MUST handle its own lifecycle (initialization, rendering, cleanup, destruction)
- Plugin MUST be distributable as a standalone module (npm package or bundled script)

**Rationale:** As a plugin, this project exists to extend YASGUI functionality. Violating plugin boundaries creates maintenance burden, upgrade conflicts, and limits adoption. Clean plugin architecture ensures long-term compatibility and independent versioning.

### II. Visualization Quality

Graph visualizations MUST be performant, accessible, and accurate.

**Non-negotiable Requirements:**
- Rendering MUST handle at least 1,000 nodes/points without UI freezing (target: <2s initial render)
- Visualizations MUST be keyboard-navigable where applicable (zoom, pan controls)
- Color schemes MUST meet WCAG AA contrast requirements for text overlays
- SPARQL result parsing MUST correctly map bindings to graph coordinates
- Error states MUST be clearly visualized (missing data, invalid coordinates, unsupported formats)

**Rationale:** Users rely on visualizations to understand complex SPARQL query results. Poor performance or accessibility excludes users and undermines the plugin's value. Accurate data mapping is critical for semantic web applications where misrepresentation can lead to incorrect conclusions.

### III. Configuration Flexibility

Users MUST be able to customize plugin behavior without modifying source code.

**Non-negotiable Requirements:**
- Plugin options MUST be passable via YASGUI configuration object
- Visual styling MUST be customizable via CSS variables or configuration properties
- Column/predicate mapping for coordinates MUST be configurable (not hardcoded)
- Default behaviors MUST be sensible but overridable (e.g., default zoom level, marker style)
- Configuration errors MUST fail fast with clear error messages

**Rationale:** Different SPARQL endpoints and use cases require different visualization approaches. Hardcoded assumptions limit plugin applicability and force users to fork the codebase, fragmenting the ecosystem.

### IV. Browser Compatibility

Plugin MUST function reliably across modern browsers and gracefully degrade on older ones.

**Non-negotiable Requirements:**
- MUST support latest two major versions of Chrome, Firefox, Safari, Edge
- JavaScript MUST be transpiled to ES2018 or earlier for broad compatibility
- CSS MUST use standard properties (vendor prefixes only when necessary)
- Dependencies (Leaflet, etc.) MUST be compatible with target browser matrix
- Polyfills MUST be documented if required for specific features

**Rationale:** SPARQL users span diverse environments (research institutions, government, enterprise). Browser incompatibility excludes users and generates support burden. Modern bundling allows broad compatibility without sacrificing developer experience.

### V. Documentation & Examples

Every feature MUST be documented with working examples before release.

**Non-negotiable Requirements:**
- README MUST include installation, quick start, and configuration reference
- Demo page MUST showcase core functionality with live SPARQL endpoint
- Code comments MUST explain non-obvious logic (coordinate transformations, data parsing)
- Breaking changes MUST be documented in CHANGELOG with migration guide
- API changes MUST update documentation in same commit

**Rationale:** Plugins are adopted based on clarity of integration path. Missing or outdated documentation leads to support requests, low adoption, and user frustration. Working examples prove functionality and accelerate integration.

## Technical Standards

### Build & Distribution
- Output formats: ES Module (import), UMD (browser global), minified versions
- CSS: Separate file (allows custom styling without JavaScript rebuild)
- Dependencies: Peer dependencies (YASGUI, Leaflet) not bundled; helpers bundled
- Versioning: Semantic versioning (MAJOR.MINOR.PATCH) strictly enforced

### Code Quality
- Linting: ESLint with standard config (no warnings in production build)
- Formatting: Prettier with consistent line length (<100 chars preferred)
- Minification: Terser for JavaScript, cssnano for CSS
- Bundle size: Monitor and document; investigate if >100KB uncompressed

### Testing Expectations
- Browser testing: Manual testing required for each release on target browsers
- Integration testing: Automated tests for YASGUI integration contract (optional but recommended)
- Visual regression: Screenshot comparison for major UI changes (optional)

## Development Workflow

### Feature Development
1. Features start with specification in `.specify/specs/[###-feature]/spec.md`
2. Implementation plan created in `plan.md` with architecture decisions
3. Tasks broken down in `tasks.md` before implementation begins
4. Code changes accompanied by demo updates (if user-facing)
5. Documentation updated in same PR as code changes

### Release Process
1. Version bump in `package.json` follows semantic versioning rules
2. CHANGELOG updated with categorized changes (Added, Changed, Fixed, Breaking)
3. Build artifacts regenerated (`dist/` files committed or published)
4. Git tag created matching version (e.g., `v1.2.3`)
5. npm publish (if package published to registry)

### Code Review Gates
- Does change align with plugin architecture principles?
- Are configuration changes backward compatible (or documented as breaking)?
- Does bundle size remain acceptable?
- Are browser compatibility implications understood?
- Is documentation updated?

## Governance

This constitution governs all development decisions for yasgui-graph-plugin. When conflicts arise between this constitution and other guidance, the constitution takes precedence.

### Amendment Process
- Proposals: Document proposed changes with rationale and impact analysis
- Review: Maintainer review required (for open source projects with multiple contributors)
- Version Bump: Constitution version follows semantic versioning
  - **MAJOR**: Principle removed, redefined, or made incompatible with existing code
  - **MINOR**: New principle added or existing principle materially expanded
  - **PATCH**: Clarifications, wording improvements, typo fixes
- Migration: Breaking changes require migration plan in amendment commit
- Propagation: Template updates (`.specify/templates/*.md`) synced with constitution changes

### Compliance Expectations
- All feature specifications MUST include constitution check section
- Implementation plans MUST justify any complexity or principle deviations
- Pull requests SHOULD reference relevant principles in description
- Code reviews MUST verify constitutional compliance before approval

### Runtime Guidance
For day-to-day development questions not covered by this constitution, refer to:
- `.specify/templates/plan-template.md` for implementation planning structure
- `.specify/templates/spec-template.md` for feature specification format
- `.specify/templates/tasks-template.md` for task breakdown approach
- Agent-specific guidance in `.github/agents/*.agent.md` if using automated workflows

**Version**: 1.0.0 | **Ratified**: 2025-12-05 | **Last Amended**: 2025-12-05
