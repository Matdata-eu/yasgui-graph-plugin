/**
 * Type definitions for YASGUI Graph Plugin
 */

// SPARQL result types
export interface RDFTriple {
  subject: string;
  predicate: string;
  object: RDFObject;
}

export interface RDFObject {
  value: string;
  type: 'uri' | 'literal' | 'bnode';
  datatype?: string;
  lang?: string;
}

// Graph node and edge types
export interface GraphNode {
  id: number;
  uri: string | null;
  label: string;
  color: string;
  type: 'uri' | 'literal';
  fullValue: string;
  title: string;
  size?: number;
  /** vis-network shape override, e.g. 'circularImage' when schema:image is present */
  shape?: string;
  /** Image URL used when shape is 'circularImage' (from schema:image) */
  image?: string;
  /** Font configuration for the node label (overrides global font settings) */
  font?: { size: number };
}

export interface GraphEdge {
  id: string;
  from: number;
  to: number;
  label: string;
  predicate: string;
  title: string;
  arrows: string;
}

// Theme color types
export interface ThemeColors {
  blankNode: string;
  literal: string;
  typeObject: string;
  uri: string;
  background: string;
  text: string;
  edge: string;
  edgeLabel: string;
  edgeLabelBackground: string;
  /** Colour of the one highlighted (selected) item. Optional for backwards compatibility. */
  highlight?: string;
}

// vis-network types
export interface NetworkOptions {
  configure: {
    enabled: boolean;
  };
  physics: {
    enabled: boolean;
    stabilization: {
      enabled: boolean;
      iterations: number;
      updateInterval: number;
    };
    barnesHut: {
      gravitationalConstant: number;
      centralGravity: number;
      springLength: number;
      springConstant: number;
      damping: number;
    };
  };
  interaction: {
    dragNodes: boolean;
    dragView: boolean;
    zoomView: boolean;
    hover: boolean;
    tooltipDelay: number;
    hideEdgesOnDrag?: boolean;
    hideEdgesOnZoom?: boolean;
  };
  nodes: {
    shape: string;
    size: number;
    font: {
      size: number;
      color: string;
    };
    borderWidth: number;
    borderWidthSelected: number;
    labelHighlightBold: boolean;
  };
  edges: {
    arrows: {
      to: {
        enabled: boolean;
        scaleFactor: number;
      };
    };
    smooth: {
      enabled: boolean;
      type: string;
      roundness: number;
    };
    font: {
      size: number;
      align: string;
      color: string;
      background: string;
      strokeWidth: number;
    };
    color: {
      color: string;
      highlight?: string;
      hover?: string;
    };
  };
}

// YASR types
export interface YasrBinding {
  subject?: { value: string; type: string };
  predicate?: { value: string; type: string };
  object?: { value: string; type: string; datatype?: string; 'xml:lang'?: string };
}

export interface YasrResults {
  getBindings(): YasrBinding[];
}

export interface PluginQueryOptions {
  acceptHeader?: string;
  /** Optional AbortSignal used to cancel in-flight query requests */
  signal?: AbortSignal;
}

/** Capabilities advertised by a yasr that implements the host API (version 1). */
export interface YasrHostApi {
  version: number;
  describe?: boolean;
  toolbar?: boolean;
}

export interface YasrDescribeOptions {
  direction?: 'outgoing' | 'incoming';
  /** Label of the calling view, shown as "Opened from <source>" */
  source?: string;
  newHistory?: boolean;
}

export interface Yasr {
  results: YasrResults;
  resultsEl: HTMLElement;
  getPrefixes?(): Record<string, string>;
  executeQuery?(query: string, options?: PluginQueryOptions): Promise<any>;
  /** Present on yasr builds with the host API; absent on older ones. Feature-detect, never version-check. */
  hostApi?: YasrHostApi;
  /** Open the shared describe panel (host API) */
  describe?(iri: string, options?: YasrDescribeOptions): Promise<void> | void;
  /** Close the shared describe panel (host API) */
  closeDescribe?(): void;
  /** Toolbar slot rendered under the yasr header (host API); emptied by yasr before every plugin draw() */
  getPluginToolbar?(): HTMLDivElement;
}
