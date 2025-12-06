/**
 * Get default vis-network configuration options
 * @returns {Object} vis-network options object
 */
function getDefaultNetworkOptions() {
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
      shape: 'dot',
      size: 20,
      font: {
        size: 14,
        color: '#000000',
        align: 'center',
        vadjust: 0,
        multi: false,
      },
      borderWidth: 2,
      borderWidthSelected: 3,
      labelHighlightBold: true,
      fixed: {
        x: false,
        y: false,
      },
    },
    
    edges: {
      arrows: {
        to: {
          enabled: true,
          scaleFactor: 0.5,
        },
      },
      smooth: {
        enabled: true,
        type: 'dynamic',
      },
      font: {
        size: 12,
        align: 'middle',
      },
    },
  };
}

export {
  getDefaultNetworkOptions,
};
