import type { ThemeColors } from './types';

/**
 * Theme utilities for Yasgui Graph Plugin
 * Implements theme detection and dynamic color application
 */

/**
 * Get current theme from document
 * @returns 'light' or 'dark'
 */
export function getCurrentTheme(): string {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * Get theme colors from CSS custom properties
 * @returns Theme color configuration
 */
export function getThemeColors(): Record<string, string> {
  const styles = getComputedStyle(document.documentElement);
  
  return {
    background: styles.getPropertyValue('--yasgui-bg-primary').trim() || '#ffffff',
    text: styles.getPropertyValue('--yasgui-text-primary').trim() || '#000000',
    textSecondary: styles.getPropertyValue('--yasgui-text-secondary').trim() || '#666666',
    border: styles.getPropertyValue('--yasgui-border-color').trim() || '#cccccc',
    accent: styles.getPropertyValue('--yasgui-accent-color').trim() || '#0066cc',
  };
}

/**
 * Get theme-aware node colors from CSS custom properties
 * @param theme - 'light' or 'dark'
 * @returns Color configuration for different node types
 */
export function getThemeNodeColors(theme: string): ThemeColors {
  const styles = getComputedStyle(document.documentElement);
  const dark = theme === 'dark';
  const read = (name: string, fallback: string) => styles.getPropertyValue(name).trim() || fallback;

  // Data colour roles (MatData tokens): resources = brand, literals = ink, highlight = amber.
  // The plugin's own --yasgui-graph-* variables stay the override points.
  return {
    uri: read('--yasgui-graph-uri', read('--yasgui-brand', dark ? '#5aa8f2' : '#0563bb')),
    literal: read('--yasgui-graph-literal', read('--yasgui-ink', dark ? '#eef1ef' : '#1c2633')),
    blankNode: read('--yasgui-graph-blank-node', dark ? '#888888' : '#c5c5c5ff'),
    typeObject: read('--yasgui-graph-type-object', '#e15b13ff'),
    text: read('--yasgui-graph-text', dark ? '#e0e0e0' : '#000000'),
    edge: read('--yasgui-graph-edge', dark ? '#666666' : '#cccccc'),
    edgeLabel: read('--yasgui-graph-edge-label', dark ? '#cccccc' : '#666666'),
    edgeLabelBackground: read('--yasgui-graph-edge-label-bg', dark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'),
    background: read('--yasgui-graph-background', dark ? '#1e1e1e' : '#ffffff'),
    highlight: read('--yasgui-graph-highlight', read('--yasgui-highlight', dark ? '#f5c242' : '#f2b300')),
  };
}

/**
 * Create a MutationObserver to watch for theme changes
 * @param callback - Function to call when theme changes
 * @returns Observer instance
 */
export function watchThemeChanges(callback: (theme: string) => void): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const theme = getCurrentTheme();
        callback(theme);
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  return observer;
}
