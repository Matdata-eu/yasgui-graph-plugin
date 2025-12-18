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
  
  return {
    uri: styles.getPropertyValue('--yasgui-graph-uri').trim() || '#97C2FC',
    literal: styles.getPropertyValue('--yasgui-graph-literal').trim() || '#a6c8a6ff',
    blankNode: styles.getPropertyValue('--yasgui-graph-blank-node').trim() || (theme === 'dark' ? '#888888' : '#c5c5c5ff'),
    typeObject: styles.getPropertyValue('--yasgui-graph-type-object').trim() || '#e15b13ff',
    text: styles.getPropertyValue('--yasgui-graph-text').trim() || (theme === 'dark' ? '#e0e0e0' : '#000000'),
    edge: styles.getPropertyValue('--yasgui-graph-edge').trim() || (theme === 'dark' ? '#666666' : '#cccccc'),
    edgeLabel: styles.getPropertyValue('--yasgui-graph-edge-label').trim() || (theme === 'dark' ? '#cccccc' : '#666666'),
    edgeLabelBackground: styles.getPropertyValue('--yasgui-graph-edge-label-bg').trim() || (theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'),
    background: styles.getPropertyValue('--yasgui-graph-background').trim() || (theme === 'dark' ? '#1e1e1e' : '#ffffff'),
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
