import GraphPlugin from './GraphPlugin';

// Declare global Window interface extension
declare global {
  interface Window {
    Yasgui?: {
      Yasr?: {
        registerPlugin: (name: string, plugin: any) => void;
      };
    };
  }
}

// Auto-register plugin if Yasgui is available (UMD global)
if (typeof window !== 'undefined' && window.Yasgui && window.Yasgui.Yasr) {
  window.Yasgui.Yasr.registerPlugin('Graph', GraphPlugin);
}

export default GraphPlugin;
