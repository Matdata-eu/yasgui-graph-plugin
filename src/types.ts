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

export interface Yasr {
  results: YasrResults;
  resultsEl: HTMLElement;
  getPrefixes?(): Record<string, string>;
}
