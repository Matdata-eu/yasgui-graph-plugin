import type { Yasr, RDFTriple } from './types';
import { extractPrefixes } from './prefixUtils';
import { getDefaultNetworkOptions } from './networkConfig';
import { parseConstructResults } from './parsers';
import { triplesToGraph } from './transformers';
import { Network, DataSet } from 'vis-network/standalone';
import { getCurrentTheme, getThemeNodeColors, watchThemeChanges } from './themeUtils';
import { loadSettings, saveSettings } from './settings';
import type { GraphPluginSettings } from './settings';
import '../styles/index.css';

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
    
    // Clear previous content
    this.yasr.resultsEl.innerHTML = '';
    
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
      this.nodesDataSet = new DataSet(nodes);
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
      
      // Setup theme change observer
      if (!this.themeObserver) {
        this.themeObserver = watchThemeChanges((newTheme) => {
          this.applyTheme(newTheme);
        });
      }
      
      // Add controls container AFTER network is created
      const controls = document.createElement('div');
      controls.className = 'yasgui-graph-controls';
      container.appendChild(controls);
      
      // Add "Zoom to Fit" button
      const fitButton = document.createElement('button');
      fitButton.className = 'yasgui-graph-button';
      fitButton.textContent = 'Zoom to Fit';
      fitButton.onclick = () => {
        if (this.network) {
          this.network.fit({ maxZoomLevel: 1000.0, animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
        }
      };
      controls.appendChild(fitButton);

      // Add "Settings" button
      const settingsButton = document.createElement('button');
      settingsButton.className = 'yasgui-graph-button yasgui-graph-settings-button';
      settingsButton.setAttribute('aria-label', 'Graph settings');
      settingsButton.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M8 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.434.901-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.892 3.434-.901 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.892-1.64-.901-3.434-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.474l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
      </svg> Settings`;
      settingsButton.onclick = () => {
        this.toggleSettingsPanel(container);
      };
      controls.appendChild(settingsButton);
      
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
    this.nodesDataSet.add(nodes);
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
      container.appendChild(panel);
      this.settingsPanelOpen = true;
      this.setupClickOutsideHandler(container, panel);
    }
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
    title.textContent = 'Graph Settings';
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
   * Get icon for plugin tab
   * @returns Icon element
   */
  getIcon(): HTMLElement {
    const icon = document.createElement('div');
    icon.className = 'yasgui-graph-icon';
    icon.setAttribute('aria-label', 'Graph visualization');
    
    // Create SVG icon for graph visualization
    icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="3" cy="3" r="2" />
      <circle cx="13" cy="3" r="2" />
      <circle cx="8" cy="13" r="2" />
      <line x1="4.5" y1="4" x2="7" y2="11.5" stroke="currentColor" stroke-width="1.5" />
      <line x1="11.5" y1="4" x2="9" y2="11.5" stroke="currentColor" stroke-width="1.5" />
      <line x1="5" y1="3" x2="11" y2="3" stroke="currentColor" stroke-width="1.5" />
    </svg>`;
    
    return icon;
  }
  
  /**
   * Cleanup when plugin is destroyed
   */
  destroy(): void {
    this.removeClickOutsideHandler();
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
