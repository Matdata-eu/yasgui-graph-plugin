/**
 * Inline Lucide icons (https://lucide.dev, ISC licence) used by the plugin UI.
 * Stroke icons drawn in currentColor, so they follow the surrounding text colour.
 * Inlined on purpose: the plugin needs only a handful and adds no runtime dependency.
 */

const ICON_PATHS = {
  /** Lucide "sliders-horizontal": view settings */
  slidersHorizontal:
    '<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/>' +
    '<line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/>' +
    '<line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/>' +
    '<line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/>' +
    '<line x1="16" x2="16" y1="18" y2="22"/>',
  /** Lucide "maximize": zoom to fit */
  maximize:
    '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/>' +
    '<path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  /** Lucide "minimize-2": compact mode */
  minimize2:
    '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>' +
    '<line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>',
  /** Lucide "share-2": graph view (plugin tab icon) */
  share2:
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>' +
    '<line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>',
} as const;

export type IconName = keyof typeof ICON_PATHS;

/**
 * Return an inline SVG string for a Lucide icon.
 * @param name - Icon name
 * @param size - Width and height in px (default 16)
 */
export function icon(name: IconName, size = 16): string {
  return (
    `<svg class="yasgui-graph-lucide" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ` +
    `aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${ICON_PATHS[name]}</svg>`
  );
}
