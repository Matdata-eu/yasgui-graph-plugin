import type { Yasr, RDFTriple } from './types';
import { extractPrefixes } from './prefixUtils';
import { getDefaultNetworkOptions } from './networkConfig';
import { parseConstructResults } from './parsers';
import { triplesToGraph } from './transformers';
import { Network, DataSet } from 'vis-network/standalone';
import { getCurrentTheme, getThemeNodeColors, watchThemeChanges } from './themeUtils';
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
      const { nodes, edges } = triplesToGraph(this.triples, this.prefixMap, themeColors);
      
      // Create container
      const container = document.createElement('div');
      container.className = 'yasgui-graph-plugin-container';
      container.id = 'yasgui-graph-plugin-container';
      this.yasr.resultsEl.appendChild(container);
      
      // Create vis-network DataSets
      this.nodesDataSet = new DataSet(nodes);
      this.edgesDataSet = new DataSet(edges);
      
      // Initialize network
      const options = getDefaultNetworkOptions(themeColors);
      
      this.network = new Network(
        container,
        { nodes: this.nodesDataSet, edges: this.edgesDataSet },
        options
      );
      
      // Apply background color to canvas
      this.applyCanvasBackground(themeColors.background);
      
      // Disable physics after stabilization and fit to view
      this.network.on('stabilizationIterationsDone', () => {
        this.network.setOptions({ physics: { enabled: true } });
        // Fit the graph to view after layout is complete
        this.network.fit({ maxZoomLevel: 3.0 });
        
        // Setup ResizeObserver to adjust container height based on parent
        // Workaround for viz-network bug: must use fixed pixel height
        this.setupContainerResize(container);
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

    } catch (error) {
      console.error('Error rendering graph:', error);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'yasgui-graph-plugin-error';
      errorDiv.textContent = 'Error rendering graph. See console for details.';
      this.yasr.resultsEl.appendChild(errorDiv);
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
    
    // Regenerate graph data with new theme colors
    const { nodes, edges } = triplesToGraph(this.triples, this.prefixMap, themeColors);
    
    // Update DataSets
    this.nodesDataSet.clear();
    this.nodesDataSet.add(nodes);
    this.edgesDataSet.clear();
    this.edgesDataSet.add(edges);
    
    // Update network options
    const options = getDefaultNetworkOptions(themeColors);
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
