/**
 * Feature detection for the yasr host API (MatGUI yasr, host API version 1).
 *
 * Newer yasr builds expose `yasr.hostApi` plus a shared describe panel
 * (`yasr.describe`) and a plugin toolbar slot (`yasr.getPluginToolbar`).
 * Older yasr builds have none of these; every helper here then returns null
 * and the plugin keeps its own floating controls. Never check version strings.
 */
import type { Yasr, YasrDescribeOptions } from './types';

/** Label shown by the host describe panel as "Opened from Graph" */
export const DESCRIBE_SOURCE = 'Graph';

/**
 * The host describe function, bound to yasr, or null when the host has no shared describe panel.
 */
export function getHostDescribe(
  yasr: Yasr | null | undefined
): ((iri: string, options?: YasrDescribeOptions) => Promise<void> | void) | null {
  if (!yasr || !yasr.hostApi?.describe || typeof yasr.describe !== 'function') return null;
  return yasr.describe.bind(yasr);
}

/**
 * The host plugin toolbar slot, or null when the host does not provide one.
 */
export function getHostToolbar(yasr: Yasr | null | undefined): HTMLDivElement | null {
  if (!yasr || !yasr.hostApi?.toolbar || typeof yasr.getPluginToolbar !== 'function') return null;
  try {
    return yasr.getPluginToolbar() || null;
  } catch (error) {
    console.warn('yasgui-graph-plugin: getPluginToolbar failed, using floating controls', error);
    return null;
  }
}
