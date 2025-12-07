/**
 * Get default vis-network configuration options
 * @param {Object} themeColors - Theme-specific colors for nodes, edges, and text
 * @returns {Object} vis-network options object
 */
function getDefaultNetworkOptions(themeColors) {
  return {
    autoResize: true,
    width: '100%',
    height: '100%',
    
    physics: {
      enabled: true,
      stabilization: {
        enabled: true,
        iterations: 200, // Max iterations for performance (<2s target)
        updateInterval: 25,
      },
      barnesHut: {
        gravitationalConstant: -2000,
        centralGravity: 0.3,
        springLength: 95,
        springConstant: 0.04,
        damping: 0.09,
      },
    },
    
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      hover: true,
      tooltipDelay: 300, // 300ms hover delay per spec
    },
    
    nodes: {
      shape: "dot",
      size: 10,
      font: {
        size: 12,
        color: themeColors.text,
      },
      borderWidth: 1,
      borderWidthSelected: 2,
      labelHighlightBold: true,
    },
    
    edges: {
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.6,
        },
      },
      smooth: {
        enabled: true,
        type: 'dynamic',
      },
      font: {
        size: 12,
        align: 'middle',
        color: themeColors.edgeLabel,
        background: themeColors.edgeLabelBackground,
        strokeWidth: 0,  // Remove white outline/halo
      },
      color: {
        color: themeColors.edge,
      },
    },
  };
}

export {
  getDefaultNetworkOptions,
};
