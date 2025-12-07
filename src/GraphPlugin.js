import { extractPrefixes } from './prefixUtils.js';
import { getDefaultNetworkOptions } from './networkConfig.js';
import { parseConstructResults } from './parsers.js';
import { triplesToGraph } from './transformers.js';
import { Network, DataSet } from 'vis-network/standalone';
import { getCurrentTheme, getThemeNodeColors, watchThemeChanges } from './themeUtils.js';

// Get vis-network classes
function getVisNetwork() {
  return { Network, DataSet };
}

/**
 * YASR plugin for visualizing SPARQL CONSTRUCT results as graphs
 */
class GraphPlugin {
  constructor(yasr) {
    this.yasr = yasr;
    this.network = null;
    this.currentTheme = getCurrentTheme();
    this.themeObserver = null;
  }

  /**
   * Plugin priority (higher = shown first in tabs)
   */
  static get priority() {
    return 20;
  }

  /**
   * Plugin label for tab display
   */
  static get label() {
    return 'Graph';
  }

  /**
   * Check if plugin can handle the current results
   * @returns {boolean} True if results are from CONSTRUCT or DESCRIBE query
   */
  canHandleResults() {
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
  draw() {
    // Clear previous content
    this.yasr.resultsEl.innerHTML = '';
    
    try {
      // Parse RDF triples from results
      const triples = parseConstructResults(this.yasr.results);
      
      // Handle empty results
      if (!triples || triples.length === 0) {
        this.yasr.resultsEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No graph data to visualize</div>';
        return;
      }
      
      // Extract prefixes (pass both results and yasr instance)
      const prefixMap = extractPrefixes(this.yasr);
      
      // Get current theme colors
      this.currentTheme = getCurrentTheme();
      const themeColors = getThemeNodeColors(this.currentTheme);
      
      // Transform triples to graph data
      const { nodes, edges } = triplesToGraph(triples, prefixMap, themeColors);
      
      // Create container
      const container = document.createElement('div');
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.minHeight = '600px';
      container.style.position = 'relative';
      container.style.overflow = 'hidden';
      this.yasr.resultsEl.appendChild(container);
      
      // Get vis-network classes
      const { Network, DataSet } = getVisNetwork();
      
      // Create vis-network DataSets
      const nodesDataSet = new DataSet(nodes);
      const edgesDataSet = new DataSet(edges);
      
      // Initialize network
      const options = getDefaultNetworkOptions(themeColors);
      
      // Store DataSets for theme updates
      this.nodesDataSet = nodesDataSet;
      this.edgesDataSet = edgesDataSet;
      this.triples = triples;
      this.prefixMap = prefixMap;
      this.network = new Network(
        container,
        { nodes: nodesDataSet, edges: edgesDataSet },
        options
      );
      
      // Track network readiness
      this.networkReady = false;
      
      // Disable physics after stabilization (performance optimization)
      this.network.on('stabilizationIterationsDone', () => {
        this.network.setOptions({ physics: { enabled: true } });
        this.networkReady = true;
      });
      
      // Setup theme change observer
      if (!this.themeObserver) {
        this.themeObserver = watchThemeChanges((newTheme) => {
          this.applyTheme(newTheme);
        });
      }
      
      // Add controls container AFTER network is created
      const controls = document.createElement('div');
      controls.style.position = 'absolute';
      controls.style.top = '10px';
      controls.style.right = '10px';
      controls.style.zIndex = '10000';
      controls.style.display = 'flex';
      controls.style.gap = '10px';
      controls.style.pointerEvents = 'auto';
      container.appendChild(controls);
      
      // Add "Zoom to Fit" button
      const fitButton = document.createElement('button');
      fitButton.textContent = 'Zoom to Fit';
      fitButton.style.padding = '8px 12px';
      fitButton.style.background = '#4CAF50';
      fitButton.style.color = 'white';
      fitButton.style.border = 'none';
      fitButton.style.borderRadius = '4px';
      fitButton.style.cursor = 'pointer';
      fitButton.style.fontSize = '14px';
      fitButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      fitButton.onmouseover = () => fitButton.style.background = '#45a049';
      fitButton.onmouseout = () => fitButton.style.background = '#4CAF50';
      fitButton.onclick = () => {
        if (this.network) {
          this.network.fit({ animation: { duration: 300, easingFunction: 'easeInOutQuad' } });
        }
      };
      controls.appendChild(fitButton);
      
      // Add performance warning for large graphs
      if (triples.length > 1000) {
        console.warn('Large graph detected (>1000 triples). Rendering may be slow.');
      }
      
    } catch (error) {
      console.error('Error rendering graph:', error);
      this.yasr.resultsEl.innerHTML = '<div style="padding: 20px; color: red;">Error rendering graph. See console for details.</div>';
    }
  }

  /**
   * Apply theme to existing network
   * @param {string} newTheme - 'light' or 'dark'
   */
  applyTheme(newTheme) {
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
  }

  /**
   * Get icon for plugin tab
   * @returns {Element} Icon element
   */
  getIcon() {
    const icon = document.createElement('div');
    icon.setAttribute('aria-label', 'Graph visualization');
    icon.style.display = 'inline-flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    
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
  destroy() {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    if (this.network) {
      this.network.destroy();
      this.network = null;
    }
  }
}

export default GraphPlugin;
