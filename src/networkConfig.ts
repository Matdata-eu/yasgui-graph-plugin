import type { NetworkOptions, ThemeColors } from './types';
import type { GraphPluginSettings } from './settings';

/**
 * Get default vis-network configuration options
 * @param themeColors - Theme-specific colors for nodes, edges, and text
 * @param settings - Optional plugin settings to override defaults
 * @returns vis-network options object
 */
export function getDefaultNetworkOptions(themeColors: ThemeColors, settings?: Partial<GraphPluginSettings>): NetworkOptions {
  const curved = !settings || settings.edgeStyle !== 'straight';
  const nodeSizeMap = { small: 6, medium: 10, large: 16 };
  const nodeSize = settings?.nodeSize ? nodeSizeMap[settings.nodeSize] : 10;
  const showNodeLabels = settings?.showNodeLabels !== false;

  return {    
    // Configure canvas background color based on theme
    configure: {
      enabled: false
    },
    
    physics: {
      enabled: settings?.physicsEnabled !== false,
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
      size: nodeSize,
      font: {
        size: showNodeLabels ? 12 : 0,
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
        enabled: curved,
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
