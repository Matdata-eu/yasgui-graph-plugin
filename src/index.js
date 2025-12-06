import GraphPlugin from './GraphPlugin.js';

// Auto-register plugin if Yasgui is available (UMD global)
if (typeof window !== 'undefined' && window.Yasgui && window.Yasgui.Yasr) {
  window.Yasgui.Yasr.registerPlugin('graph', GraphPlugin);
}

export default GraphPlugin;
