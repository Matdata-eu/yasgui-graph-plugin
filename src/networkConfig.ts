import type { NetworkOptions, ThemeColors } from './types';

/**
 * Get default vis-network configuration options
 * @param themeColors - Theme-specific colors for nodes, edges, and text
 * @returns vis-network options object
 */
export function getDefaultNetworkOptions(themeColors: ThemeColors): NetworkOptions {
  return {    
    // Configure canvas background color based on theme
    configure: {
      enabled: false
    },
    
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
      hideEdgesOnDrag: false,
      hideEdgesOnZoom: false,
    },
    
    nodes: {
      shape: 'dot',
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
        roundness: 0.5,
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
