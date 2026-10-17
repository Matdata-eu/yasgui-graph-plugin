import type { Yasr, RDFTriple } from './types';
import { extractPrefixes } from './prefixUtils';
import { getDefaultNetworkOptions } from './networkConfig';
import { parseConstructResults, parseBackgroundQueryResponse } from './parsers';
import { triplesToGraph } from './transformers';
import { Network, DataSet } from 'vis-network/standalone';
import { getCurrentTheme, getThemeNodeColors, watchThemeChanges } from './themeUtils';
import { loadSettings, saveSettings } from './settings';
import type { GraphPluginSettings } from './settings';
import { withHighlightColor } from './colorUtils';
import { getHostDescribe, getHostToolbar, DESCRIBE_SOURCE } from './hostApi';
import { icon } from './icons';
import type { IconName } from './icons';
import type { GraphNode, ThemeColors } from './types';
import '../styles/index.css';

/** Border width while a DESCRIBE query is in-flight for a node */
const LOADING_BORDER_WIDTH = 4;
/** Border color while a DESCRIBE query is in-flight for a node */
const LOADING_BORDER_COLOR = '#ffa500';
/** Border width after a node has been successfully expanded */
const EXPANDED_BORDER_WIDTH = 3;
/** Default (restored) border width when expansion fails or is aborted */
const DEFAULT_BORDER_WIDTH = 2;
/** Ignore a repeated Ctrl+click describe of the same IRI within this window (the clicks of a double-click) */
const DESCRIBE_DEDUPE_MS = 500;

/** True when the click carried Ctrl (Windows/Linux) or Cmd (macOS) */
function hasDescribeModifier(params: any): boolean {
  const e = params?.event?.srcEvent ?? params?.event;
  return !!(e && (e.ctrlKey || e.metaKey));
}

function isMacPlatform(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || '');
}

/**
 * YASR plugin for visualizing SPARQL CONSTRUCT results as graphs
 */
class GraphPlugin {
  private yasr: Yasr;
  private network: any | null;
  private currentTheme: string;
  private themeObserver: MutationObserver | null;
  private resizeObserver: ResizeObserver | null;
  private nodesDataSet: any;
  private edgesDataSet: any;
  private triples: RDFTriple[] | null;
  private prefixMap: Map<string, string> | null;
  private settings: GraphPluginSettings;
  private settingsPanelOpen: boolean = false;
  private clickOutsideHandler: ((e: MouseEvent) => void) | null = null;
  private expansionAbortController: AbortController | null = null;
  private uriToNodeId: Map<string, number> = new Map();
  /** Elements this plugin put into the host toolbar slot (host API only) */
  private toolbarItems: HTMLElement[] = [];
  /** The button that opens the settings panel (floating or toolbar) */
  private settingsButton: HTMLButtonElement | null = null;
  /** Key of the toolbar control to focus again after a settings redraw */
  private pendingFocus: string | null = null;
  private lastDescribe: { iri: string; at: number } | null = null;

  constructor(yasr: Yasr) {
    this.yasr = yasr;
    this.network = null;
    this.currentTheme = getCurrentTheme();
    this.themeObserver = null;
    this.resizeObserver = null;
    this.nodesDataSet = null;
    this.edgesDataSet = null;
    this.triples = null;
    this.prefixMap = null;
    this.settings = loadSettings();
  }

  /**
   * Plugin priority (higher = shown first in tabs)
   */
  static get priority(): number {
    return 20;
  }

  /**
   * Plugin label for tab display
   */
  static get label(): string {
    return 'Graph';
  }

  /**
   * Help/documentation URL
   */
  static get helpReference(): string {
    return 'https://yasgui-doc.matdata.eu/docs/user-guide#graph-plugin';
  }

  /**
   * Check if plugin can handle the current results
   * @returns True if results are from CONSTRUCT or DESCRIBE query
   */
  canHandleResults(): boolean {
    if (!this.yasr || !this.yasr.results) return false;

    const results = this.yasr.results;
    
    // Check if results have RDF triple structure (subject/predicate/object)
    if (results.getBindings && typeof results.getBindings === 'function') {
      const bindings = results.getBindings();
      if (bindings && bindings.length > 0) {
        const firstBinding = bindings[0];
        // CONSTRUCT and DESCRIBE results have subject, predicate, object variables
        return (
          firstBinding.subject !== undefined &&
          firstBinding.predicate !== undefined &&
          firstBinding.object !== undefined
        );
      }
    }
    
    return false;
  }

  /**
   * Render the graph visualization
   */
  draw(): void {
    // Save settings panel state
    const wasPanelOpen = this.settingsPanelOpen;
    
    // Abort any ongoing expansion when redrawing
    if (this.expansionAbortController) {
      this.expansionAbortController.abort();
      this.expansionAbortController = null;
    }
    
    // Reset URI to node ID mapping on full redraw
    this.uriToNodeId = new Map();
    
    // Clear previous content
    this.yasr.resultsEl.innerHTML = '';
    this.clearToolbar();
    this.settingsButton = null;
    
    try {
      // Parse RDF triples from results
      this.triples = parseConstructResults(this.yasr.results);
      
      // Handle empty results
      if (!this.triples || this.triples.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'yasgui-graph-plugin-empty-state';
        emptyDiv.textContent = 'No graph data to visualize';
        this.yasr.resultsEl.appendChild(emptyDiv);
        return;
      }
      // Add performance warning for large graphs
      if (this.triples.length > 1000) {
        console.warn('Large graph detected (>1000 triples). Rendering may be slow.');
      }
      
      // Extract prefixes
      this.prefixMap = extractPrefixes(this.yasr);
      
      // Get current theme colors
      this.currentTheme = getCurrentTheme();
      const themeColors = getThemeNodeColors(this.currentTheme);
      
      // Transform triples to graph data
      const { nodes, edges } = triplesToGraph(this.triples, this.prefixMap, themeColors, this.settings);
      
      // Create container
      const container = document.createElement('div');
      container.className = 'yasgui-graph-plugin-container';
      container.id = 'yasgui-graph-plugin-container';
      this.yasr.resultsEl.appendChild(container);
      
      // Create vis-network DataSets
      this.nodesDataSet = new DataSet(this.prepareNodes(nodes, themeColors));
      this.edgesDataSet = new DataSet(edges);
      
      // Initialize network
      const options = getDefaultNetworkOptions(themeColors, this.settings);
      
      this.network = new Network(
        container,
        { nodes: this.nodesDataSet, edges: this.edgesDataSet },
        options
      );
      
      // Setup custom HTML tooltip rendering
      this.setupHtmlTooltips(container);
      
      // Apply background color to canvas
      this.applyCanvasBackground(themeColors.background);
      
      // Setup ResizeObserver to adjust container height based on parent
      // This must be done immediately, not in stabilization callback
      // Workaround for viz-network bug: must use fixed pixel height
      this.setupContainerResize(container);
      
      // Handle stabilization and initial view
      if (this.settings.physicsEnabled) {
        // If physics is enabled, wait for stabilization before fitting
        this.network.on('stabilizationIterationsDone', () => {
          this.network.setOptions({ physics: { enabled: true } });
          // Fit the graph to view after layout is complete
          this.network.fit({ maxZoomLevel: 3.0 });
        });
      } else {
        // If physics is disabled, fit immediately
        // Use setTimeout to ensure the network is fully initialized
        setTimeout(() => {
          if (this.network) {
            this.network.fit({ maxZoomLevel: 3.0 });
          }
        }, 100);
      }
      
      // Fix nodes in place after the user manually drags them
      this.network.on('dragEnd', (params: { nodes: (string | number)[] }) => {
        if (params.nodes.length > 0) {
          const positions = this.network.getPositions(params.nodes);
          const updates = params.nodes.map((id: string | number) => ({
            id,
            x: positions[id].x,
            y: positions[id].y,
            fixed: { x: true, y: true },
          }));
          this.nodesDataSet.update(updates);
        }
      });
      
      // Setup double-click to expand nodes
      this.setupNodeExpansion();

      // Setup Ctrl/Cmd+click to open the host describe panel (host API only)
      this.setupNodeDescribe();
      
      // Build URI→node-ID map for incremental expansion merges (URI nodes only)
      this.uriToNodeId = new Map();
      this.nodesDataSet.get().forEach((node: any) => {
        if (node.uri) {
          this.uriToNodeId.set(node.uri, node.id);
        }
      });
      
      // Setup theme change observer
      if (!this.themeObserver) {
        this.themeObserver = watchThemeChanges((newTheme) => {
          this.applyTheme(newTheme);
        });
      }
      
      // Add controls AFTER network is created: host toolbar slot when available, floating buttons otherwise
      this.renderControls(container);

      // Re-open settings panel if it was open before redraw
      if (wasPanelOpen) {
        this.toggleSettingsPanel(container);
      }

    } catch (error) {
      console.error('Error rendering graph:', error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'yasgui-graph-plugin-error';
      errorDiv.textContent = 'Error rendering graph. See console for details.';
      this.yasr.resultsEl.appendChild(errorDiv);
    }
  }

  /**
   * Setup custom HTML tooltip rendering for vis-network
   * @param container - The graph container element
   */
  private setupHtmlTooltips(container: HTMLElement): void {
    if (!this.network) return;
    
    let hideTimeout: number | null = null;
    
    // Create tooltip on hover start
    this.network.on('hoverNode', (params: any) => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      const nodeId = params.node;
      const node = this.nodesDataSet.get(nodeId);
      
      if (node && node.title) {
        this.showHtmlTooltip(container, node.title, params.pointer.DOM);
      }
    });
    
    this.network.on('hoverEdge', (params: any) => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      const edgeId = params.edge;
      const edge = this.edgesDataSet.get(edgeId);
      
      if (edge && edge.title) {
        this.showHtmlTooltip(container, edge.title, params.pointer.DOM);
      }
    });
    
    // Hide tooltip on blur with delay to allow mouse to move into tooltip
    this.network.on('blurNode', () => {
      hideTimeout = window.setTimeout(() => {
        this.hideHtmlTooltipIfNotHovered(container);
      }, 200);
    });
    
    this.network.on('blurEdge', () => {
      hideTimeout = window.setTimeout(() => {
        this.hideHtmlTooltipIfNotHovered(container);
      }, 200);
    });
    
    // Hide tooltip when dragging or zooming
    this.network.on('dragStart', () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      this.hideHtmlTooltip(container);
    });
    
    this.network.on('zoom', () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      this.hideHtmlTooltip(container);
    });
  }

  /**
   * Show HTML tooltip at specified position
   * @param container - Container element
   * @param htmlContent - HTML content to display
   * @param position - Mouse position {x, y}
   */
  private showHtmlTooltip(container: HTMLElement, htmlContent: string, position: { x: number; y: number }): void {
    // Remove existing tooltip if any
    this.hideHtmlTooltip(container);
    
    // Create new tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'yasgui-graph-tooltip-container';
    tooltip.innerHTML = htmlContent;
    
    // Position tooltip near mouse cursor
    tooltip.style.position = 'absolute';
    tooltip.style.left = `${position.x + 10}px`;
    tooltip.style.top = `${position.y + 10}px`;
    tooltip.style.zIndex = '1000';
    
    // Add mouse leave handler to hide tooltip when mouse leaves it
    tooltip.addEventListener('mouseleave', () => {
      this.hideHtmlTooltip(container);
    });
    
    container.appendChild(tooltip);
    
    // Adjust position if tooltip goes off-screen
    const rect = tooltip.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    if (rect.right > containerRect.right) {
      tooltip.style.left = `${position.x - rect.width - 10}px`;
    }
    if (rect.bottom > containerRect.bottom) {
      tooltip.style.top = `${position.y - rect.height - 10}px`;
    }
  }

  /**
   * Hide HTML tooltip
   * @param container - Container element
   */
  private hideHtmlTooltip(container: HTMLElement): void {
    const existingTooltip = container.querySelector('.yasgui-graph-tooltip-container');
    if (existingTooltip) {
      existingTooltip.remove();
    }
  }

  /**
   * Hide HTML tooltip only if mouse is not hovering over it
   * @param container - Container element
   */
  private hideHtmlTooltipIfNotHovered(container: HTMLElement): void {
    const existingTooltip = container.querySelector('.yasgui-graph-tooltip-container');
    if (existingTooltip) {
      // Check if mouse is currently over the tooltip
      const isHovered = existingTooltip.matches(':hover');
      if (!isHovered) {
        existingTooltip.remove();
      }
    }
  }

  /**
   * Apply theme to existing network
   * @param newTheme - 'light' or 'dark'
   */
  private applyTheme(newTheme: string): void {
    if (!this.network || !this.nodesDataSet || !this.triples || !this.prefixMap) {
      return;
    }
    
    this.currentTheme = newTheme;
    const themeColors = getThemeNodeColors(newTheme);
    
    // Preserve fixed positions of manually dragged nodes before clearing
    const fixedNodes: Record<string | number, { x: number; y: number }> = {};
    this.nodesDataSet.get().forEach((node: { id: string | number; fixed?: boolean | { x?: boolean; y?: boolean }; x?: number; y?: number }) => {
      const isFixed = node.fixed === true || (typeof node.fixed === 'object' && node.fixed?.x && node.fixed?.y);
      if (isFixed && node.x !== undefined && node.y !== undefined) {
        fixedNodes[node.id] = { x: node.x, y: node.y };
      }
    });

    // Regenerate graph data with new theme colors
    const { nodes, edges } = triplesToGraph(this.triples, this.prefixMap, themeColors, this.settings);
    
    // Update DataSets
    this.nodesDataSet.clear();
    this.nodesDataSet.add(this.prepareNodes(nodes, themeColors));
    this.edgesDataSet.clear();
    this.edgesDataSet.add(edges);

    // Restore fixed positions for manually dragged nodes
    const fixedIds = Object.keys(fixedNodes);
    if (fixedIds.length > 0) {
      const updates = fixedIds.map((id) => ({
        id,
        x: fixedNodes[id].x,
        y: fixedNodes[id].y,
        fixed: { x: true, y: true },
      }));
      this.nodesDataSet.update(updates);
    }
    
    // Update network options
    const options = getDefaultNetworkOptions(themeColors, this.settings);
    this.network.setOptions(options);
    
    // Update canvas background
    this.applyCanvasBackground(themeColors.background);
  }
  
  /**
   * Apply background color to vis-network canvas using CSS custom property
   * @param color - Background color
   */
  private applyCanvasBackground(color: string): void {
    if (this.network && this.network.body && this.network.body.container) {
      // Set CSS custom property on container instead of inline style
      (this.network.body.container as HTMLElement).style.setProperty('--yasgui-graph-canvas-bg', color);
    }
  }
  
  /**
   * Setup ResizeObserver to adjust container height based on parent
   * Workaround for viz-network bug: container must have fixed pixel height
   * @param container - The graph container element
   */
  private setupContainerResize(container: HTMLElement): void {
    const parent = container.parentElement;
    if (!parent) return;
    
    // Function to update container height to match parent
    const updateHeight = () => {
      const parentHeight = parent.clientHeight;
      if (parentHeight > 0) {
        container.style.height = `${parentHeight}px`;
        // Trigger network redraw after resize
        if (this.network) {
          this.network.fit({ maxZoomLevel: 1000.0 });
        }
      }
    };
    
    // Initial height adjustment
    updateHeight();
    
    // Watch for parent size changes
    this.resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    
    this.resizeObserver.observe(parent);
  }

  /**
   * Toggle the settings panel open/closed
   * @param container - The graph container element
   */
  private toggleSettingsPanel(container: HTMLElement): void {
    const existing = container.querySelector('.yasgui-graph-settings-panel');
    if (existing) {
      existing.remove();
      this.settingsPanelOpen = false;
      this.removeClickOutsideHandler();
    } else {
      const panel = this.createSettingsPanel(container);
      if (this.toolbarItems.length > 0) {
        // Docked under the host toolbar instead of under the floating buttons
        panel.classList.add('yasgui-graph-settings-panel--docked');
      }
      container.appendChild(panel);
      this.settingsPanelOpen = true;
      this.setupClickOutsideHandler(container, panel);
    }
    this.syncSettingsButton();
  }

  /** Reflect the settings panel state on its button */
  private syncSettingsButton(): void {
    if (!this.settingsButton) return;
    this.settingsButton.setAttribute('aria-expanded', String(this.settingsPanelOpen));
    this.settingsButton.classList.toggle('is-active', this.settingsPanelOpen);
  }

  /**
   * Setup click-outside-to-close handler for settings panel
   * @param container - The graph container element
   * @param panel - The settings panel element
   */
  private setupClickOutsideHandler(container: HTMLElement, panel: HTMLElement): void {
    // Remove any existing handler
    this.removeClickOutsideHandler();
    
    // Create new handler
    this.clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside the panel and not on the settings button
      if (!panel.contains(target) && !this.isSettingsButton(target)) {
        this.toggleSettingsPanel(container);
      }
    };
    
    // Add handler with a small delay to avoid immediate closing
    setTimeout(() => {
      document.addEventListener('click', this.clickOutsideHandler!);
    }, 100);
  }

  /**
   * Remove the click-outside handler
   */
  private removeClickOutsideHandler(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
      this.clickOutsideHandler = null;
    }
  }

  /**
   * Check if a node is the settings button or inside it
   * @param node - The node to check
   */
  private isSettingsButton(node: Node): boolean {
    let current: Node | null = node;
    while (current) {
      if (current instanceof Element && current.classList.contains('yasgui-graph-settings-button')) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }

  /**
   * Build and return the settings panel element
   * @param container - The graph container element (used to re-draw on change)
   */
  private createSettingsPanel(_container: HTMLElement): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'yasgui-graph-settings-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Graph settings');

    const title = document.createElement('div');
    title.className = 'yasgui-graph-settings-title';
    title.textContent = 'Graph settings';
    panel.appendChild(title);

    // Helper: create a section header
    const addSection = (label: string) => {
      const h = document.createElement('div');
      h.className = 'yasgui-graph-settings-section';
      h.textContent = label;
      panel.appendChild(h);
    };

    // Helper: create a labeled toggle row
    const addToggle = (
      label: string,
      checked: boolean,
      onChange: (v: boolean) => void
    ) => {
      const row = document.createElement('label');
      row.className = 'yasgui-graph-settings-row';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = checked;
      input.addEventListener('change', () => onChange(input.checked));
      const span = document.createElement('span');
      span.textContent = label;
      row.appendChild(input);
      row.appendChild(span);
      panel.appendChild(row);
    };

    // Helper: create a labeled select row
    const addSelect = <T extends string>(
      label: string,
      options: { value: T; label: string }[],
      current: T,
      onChange: (v: T) => void
    ) => {
      const row = document.createElement('div');
      row.className = 'yasgui-graph-settings-row';
      const lbl = document.createElement('span');
      lbl.textContent = label;
      const sel = document.createElement('select');
      sel.className = 'yasgui-graph-settings-select';
      options.forEach((o) => {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        if (o.value === current) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', () => onChange(sel.value as T));
      row.appendChild(lbl);
      row.appendChild(sel);
      panel.appendChild(row);
    };

    // Re-draw graph after a setting change (keeping panel open)
    const applyAndRedraw = () => {
      saveSettings(this.settings);
      // Re-draw entire graph to reflect new settings
      // The draw() method will restore the settings panel since settingsPanelOpen = true
      this.draw();
    };

    // ── Arrows ──────────────────────────────────────────────
    addSection('Arrows');
    addSelect(
      'Style',
      [
        { value: 'curved', label: 'Curved' },
        { value: 'straight', label: 'Straight' },
      ],
      this.settings.edgeStyle,
      (v) => { this.settings.edgeStyle = v; applyAndRedraw(); }
    );

    // ── Predicate labels ─────────────────────────────────────
    addSection('Predicate display');
    addSelect(
      'Display',
      [
        { value: 'label', label: 'Label (prefixed URI)' },
        { value: 'icon',  label: 'Icon / symbol' },
        { value: 'none',  label: 'Hidden' },
      ],
      this.settings.predicateDisplay,
      (v) => { this.settings.predicateDisplay = v; applyAndRedraw(); }
    );

    // ── Compact mode ─────────────────────────────────────────
    addSection('Compact mode');
    addToggle('Compact mode', this.settings.compactMode, (v) => {
      this.settings.compactMode = v; applyAndRedraw();
    });

    // ── Additional settings ──────────────────────────────────
    addSection('Display');
    addToggle('Show node labels', this.settings.showNodeLabels, (v) => {
      this.settings.showNodeLabels = v; applyAndRedraw();
    });
    addToggle('Enable physics', this.settings.physicsEnabled, (v) => {
      this.settings.physicsEnabled = v; applyAndRedraw();
    });
    addSelect(
      'Node size',
      [
        { value: 'small',  label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large',  label: 'Large' },
      ],
      this.settings.nodeSize,
      (v) => { this.settings.nodeSize = v; applyAndRedraw(); }
    );

    return panel;
  }

  /**
   * Setup double-click handler for node expansion
   */
  private setupNodeExpansion(): void {
    if (!this.network) return;

    this.network.on('doubleClick', (params: any) => {
      if (params.nodes.length === 0) return;

      // Ctrl/Cmd+double-click opens the host describe panel (via 'click'); don't also expand.
      // Without the host API, Ctrl/Cmd+double-click still expands as before.
      if (hasDescribeModifier(params) && getHostDescribe(this.yasr)) return;

      const nodeId = params.nodes[0];
      const node = this.nodesDataSet.get(nodeId);

      // Only expand URI nodes (not literals or blank nodes)
      if (node && node.uri && !node.uri.startsWith('_:')) {
        this.expandNode(node.uri);
      }
    });
  }

  /**
   * Setup Ctrl+click (Cmd+click on macOS) on a resource node to open the host's
   * shared describe panel. Only active when yasr exposes the host API; otherwise
   * clicks behave exactly as before.
   */
  private setupNodeDescribe(): void {
    if (!this.network) return;

    this.network.on('click', (params: any) => {
      if (!params || !params.nodes || params.nodes.length === 0) return;
      if (!hasDescribeModifier(params)) return;
      const describe = getHostDescribe(this.yasr);
      if (!describe) return;

      const node = this.nodesDataSet.get(params.nodes[0]);
      const iri = this.getResourceIri(node);
      if (!iri) return;

      // The two clicks of a Ctrl+double-click must not open the panel twice
      const now = Date.now();
      if (this.lastDescribe && this.lastDescribe.iri === iri && now - this.lastDescribe.at < DESCRIBE_DEDUPE_MS) {
        return;
      }
      this.lastDescribe = { iri, at: now };

      try {
        Promise.resolve(describe(iri, { source: DESCRIBE_SOURCE })).catch((error) => {
          console.error('yasgui-graph-plugin: describe failed', iri, error);
        });
      } catch (error) {
        console.error('yasgui-graph-plugin: describe failed', iri, error);
      }
    });
  }

  /**
   * IRI of a resource node, or null for literals and blank nodes
   */
  private getResourceIri(node: any): string | null {
    if (!node || node.type === 'literal' || typeof node.uri !== 'string') return null;
    if (node.uri.startsWith('_:')) return null;
    return node.uri;
  }

  /**
   * Convert transformer nodes into vis-network nodes: apply the highlight colour
   * for the selected state and, when the host describe panel is available, add
   * the Ctrl/Cmd+click hint to resource tooltips.
   */
  private prepareNodes(nodes: GraphNode[], themeColors: ThemeColors): any[] {
    const canDescribe = !!getHostDescribe(this.yasr);
    const hint = `<div class="yasgui-tooltip-hint">${isMacPlatform() ? 'Cmd' : 'Ctrl'}+click to describe</div>`;
    return nodes.map((node) => {
      const prepared: any = { ...node, color: withHighlightColor(node.color, themeColors.highlight) };
      if (canDescribe && this.getResourceIri(node) && typeof node.title === 'string') {
        prepared.title = node.title.replace(/<\/div>\s*$/, `${hint}</div>`);
        if (prepared.title === node.title) prepared.title = node.title + hint;
      }
      return prepared;
    });
  }

  /**
   * Render the graph controls: into the host toolbar slot when yasr provides one,
   * otherwise as the floating buttons over the graph.
   * @param container - The graph container element
   */
  private renderControls(container: HTMLElement): void {
    const bar = getHostToolbar(this.yasr);
    if (bar) {
      this.renderHostToolbar(bar, container);
    } else {
      this.renderFloatingControls(container);
    }
    this.syncSettingsButton();
  }

  /**
   * Floating buttons in the top-right corner of the graph (yasr without host toolbar).
   * @deprecated Kept as the fallback for yasr builds without `getPluginToolbar`; to be removed in the next major.
   */
  private renderFloatingControls(container: HTMLElement): void {
    const controls = document.createElement('div');
    controls.className = 'yasgui-graph-controls';
    container.appendChild(controls);

    const fitButton = document.createElement('button');
    fitButton.type = 'button';
    fitButton.className = 'yasgui-graph-button';
    fitButton.innerHTML = `${icon('maximize', 14)}<span>Zoom to fit</span>`;
    fitButton.onclick = () => this.zoomToFit();
    controls.appendChild(fitButton);

    const settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'yasgui-graph-button yasgui-graph-settings-button';
    settingsButton.setAttribute('aria-label', 'Graph settings');
    settingsButton.setAttribute('aria-haspopup', 'dialog');
    settingsButton.innerHTML = `${icon('slidersHorizontal', 14)}<span>Settings</span>`;
    settingsButton.onclick = () => this.toggleSettingsPanel(container);
    controls.appendChild(settingsButton);
    this.settingsButton = settingsButton;
  }

  /**
   * Controls in the shared yasr plugin toolbar (host API), styled by yasr's
   * .yasr_toolbar* classes. View settings sits at the far right.
   */
  private renderHostToolbar(bar: HTMLDivElement, container: HTMLElement): void {
    const add = (el: HTMLElement) => {
      bar.appendChild(el);
      this.toolbarItems.push(el);
    };

    const group = document.createElement('div');
    group.className = 'yasr_toolbarGroup yasgui-graph-toolbar';

    const changeSetting = <K extends keyof GraphPluginSettings>(key: K, value: GraphPluginSettings[K]) => {
      this.settings[key] = value;
      saveSettings(this.settings);
      this.pendingFocus = String(key);
      this.draw();
    };

    const addSelect = <K extends 'edgeStyle' | 'predicateDisplay'>(
      key: K,
      label: string,
      options: { value: GraphPluginSettings[K]; label: string }[]
    ) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'yasr_toolbarSelect';
      const span = document.createElement('span');
      span.textContent = label;
      const select = document.createElement('select');
      select.dataset.graphControl = key;
      options.forEach((o) => {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        if (o.value === this.settings[key]) opt.selected = true;
        select.appendChild(opt);
      });
      select.addEventListener('change', () => changeSetting(key, select.value as GraphPluginSettings[K]));
      wrapper.appendChild(span);
      wrapper.appendChild(select);
      group.appendChild(wrapper);
    };

    const makeButton = (key: string, label: string, iconName?: IconName) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'yasr_toolbarButton';
      button.dataset.graphControl = key;
      button.innerHTML = `${iconName ? icon(iconName) : ''}<span>${label}</span>`;
      return button;
    };

    addSelect('edgeStyle', 'Edges', [
      { value: 'curved', label: 'Curved' },
      { value: 'straight', label: 'Straight' },
    ]);
    addSelect('predicateDisplay', 'Edge labels', [
      { value: 'label', label: 'Prefixed IRI' },
      { value: 'icon', label: 'Icon' },
      { value: 'none', label: 'Hidden' },
    ]);

    const compact = makeButton('compactMode', 'Compact', 'minimize2');
    compact.setAttribute('aria-pressed', String(this.settings.compactMode));
    compact.title = 'Hide literal and class nodes; show them in tooltips';
    compact.addEventListener('click', () => changeSetting('compactMode', !this.settings.compactMode));
    group.appendChild(compact);

    const fit = makeButton('zoomToFit', 'Zoom to fit', 'maximize');
    fit.addEventListener('click', () => this.zoomToFit());
    group.appendChild(fit);

    add(group);

    const spacer = document.createElement('div');
    spacer.className = 'yasr_toolbarSpacer';
    add(spacer);

    const settingsButton = makeButton('viewSettings', 'View settings', 'slidersHorizontal');
    settingsButton.classList.add('yasgui-graph-settings-button');
    settingsButton.setAttribute('aria-haspopup', 'dialog');
    settingsButton.addEventListener('click', () => this.toggleSettingsPanel(container));
    add(settingsButton);
    this.settingsButton = settingsButton;

    if (this.pendingFocus) {
      const target = bar.querySelector<HTMLElement>(`[data-graph-control="${this.pendingFocus}"]`);
      this.pendingFocus = null;
      target?.focus();
    }
  }

  /** Remove the elements this plugin added to the host toolbar slot */
  private clearToolbar(): void {
    this.toolbarItems.forEach((el) => el.remove());
    this.toolbarItems = [];
  }

  /** Fit the whole graph into view */
  private zoomToFit(): void {
    if (this.network) {
      this.network.fit({ maxZoomLevel: 1000.0, animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
    }
  }

  /**
   * Expand a node by executing a DESCRIBE query for the given URI and
   * merging the returned triples into the existing graph.
   * @param uri - URI of the node to expand
   */
  private async expandNode(uri: string): Promise<void> {
    if (!this.yasr.executeQuery) {
      console.warn('yasgui-graph-plugin: background query execution not available (yasr.executeQuery is not configured)');
      return;
    }
    if (!this.triples || !this.prefixMap) return;

    // Abort any ongoing expansion
    if (this.expansionAbortController) {
      this.expansionAbortController.abort();
    }
    const controller = new AbortController();
    this.expansionAbortController = controller;

    // Capture original node appearance so we can restore it precisely
    const nodeId = this.uriToNodeId.get(uri);
    let originalColor: any = undefined;
    let originalBorderWidth: number | undefined = undefined;
    if (nodeId !== undefined) {
      const node = this.nodesDataSet.get(nodeId);
      if (node) {
        originalColor = node.color;
        originalBorderWidth = node.borderWidth;
      }
      // Apply loading indicator: orange border, visible in all node states (normal, selected, hover)
      const loadingBackground =
        typeof originalColor === 'string' ? originalColor : originalColor?.background;
      this.nodesDataSet.update({
        id: nodeId,
        borderWidth: LOADING_BORDER_WIDTH,
        borderWidthSelected: LOADING_BORDER_WIDTH,
        color: {
          border: LOADING_BORDER_COLOR,
          background: loadingBackground,
          highlight: { border: LOADING_BORDER_COLOR, background: loadingBackground },
          hover: { border: LOADING_BORDER_COLOR, background: loadingBackground },
        },
      });
    }

    const restoreNode = (borderWidth: number) => {
      if (nodeId !== undefined) {
        this.nodesDataSet.update({ id: nodeId, borderWidth, borderWidthSelected: borderWidth, color: originalColor });
      }
    };

    try {
      const response = await this.yasr.executeQuery(`DESCRIBE <${uri}>`, {
        acceptHeader: 'text/turtle',
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        restoreNode(originalBorderWidth ?? DEFAULT_BORDER_WIDTH);
        return;
      }

      const newTriples = await parseBackgroundQueryResponse(response);

      if (controller.signal.aborted) {
        restoreNode(originalBorderWidth ?? DEFAULT_BORDER_WIDTH);
        return;
      }

      // Deduplicate against existing triples
      const existingKeys = new Set(
        this.triples.map((t) => `${t.subject}|${t.predicate}|${t.object.value}`)
      );
      const uniqueNew = newTriples.filter(
        (t) => !existingKeys.has(`${t.subject}|${t.predicate}|${t.object.value}`)
      );

      if (uniqueNew.length > 0) {
        this.triples = [...this.triples, ...uniqueNew];
        this.mergeNewTriples();
      }

      // Mark as expanded: restore border with a thicker width to signal expansion
      restoreNode(EXPANDED_BORDER_WIDTH);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        restoreNode(originalBorderWidth ?? DEFAULT_BORDER_WIDTH);
        return;
      }
      console.error('yasgui-graph-plugin: error expanding node', uri, error);
      // Restore original node appearance on error
      restoreNode(originalBorderWidth ?? DEFAULT_BORDER_WIDTH);
    }
  }

  /**
   * Incrementally add new triples to the vis-network DataSets without a full redraw.
   * New nodes and edges are added; existing ones are left untouched.
   * Expects `this.triples` to already include the new triples.
   */
  private mergeNewTriples(): void {
    if (!this.triples || !this.prefixMap || !this.nodesDataSet || !this.edgesDataSet) return;

    const themeColors = getThemeNodeColors(this.currentTheme);

    // Regenerate the full graph from all triples (new IDs are stable for existing nodes)
    const { nodes, edges } = triplesToGraph(this.triples, this.prefixMap, themeColors, this.settings);

    // Find nodes not yet in the DataSet
    const existingValues = new Set(this.nodesDataSet.get().map((n: any) => n.fullValue));
    const nodesToAdd = nodes.filter((n) => !existingValues.has(n.fullValue));

    // Find edges not yet in the DataSet (compare by from+predicate+to)
    const existingEdgeKeys = new Set(
      this.edgesDataSet.get().map((e: any) => `${e.from}|${e.predicate}|${e.to}`)
    );
    const edgesToAdd = edges.filter(
      (e) => !existingEdgeKeys.has(`${e.from}|${e.predicate}|${e.to}`)
    );

    if (nodesToAdd.length > 0) {
      this.nodesDataSet.add(this.prepareNodes(nodesToAdd, themeColors));
      // Update uriToNodeId map with newly added URI nodes only
      nodesToAdd.forEach((n: any) => {
        if (n.uri != null) {
          this.uriToNodeId.set(n.uri, n.id);
        }
      });
    }
    if (edgesToAdd.length > 0) {
      this.edgesDataSet.add(edgesToAdd);
    }
  }

  /**
   * @returns Icon element
   */
  getIcon(): HTMLElement {
    const iconEl = document.createElement('div');
    iconEl.className = 'yasgui-graph-icon';
    iconEl.setAttribute('aria-label', 'Graph visualization');
    iconEl.innerHTML = icon('share2');
    return iconEl;
  }
  
  /**
   * Cleanup when plugin is destroyed
   */
  destroy(): void {
    this.removeClickOutsideHandler();
    this.clearToolbar();
    this.settingsButton = null;
    if (this.expansionAbortController) {
      this.expansionAbortController.abort();
      this.expansionAbortController = null;
    }
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.network) {
      this.network.destroy();
      this.network = null;
    }
  }
}

export default GraphPlugin;
