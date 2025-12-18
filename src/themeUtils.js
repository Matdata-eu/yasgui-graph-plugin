/**
 * Theme utilities for Yasgui Graph Plugin
 * Implements theme detection and dynamic color application
 */

/**
 * Get current theme from document
 * @returns {string} 'light' or 'dark'
 */
function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

/**
 * Get theme colors from CSS custom properties
 * @returns {Object} Theme color configuration
 */
function getThemeColors() {
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
 * Get theme-aware node colors
 * @param {string} theme - 'light' or 'dark'
 * @returns {Object} Color configuration for different node types
 */
function getThemeNodeColors(theme) {
  if (theme === 'dark') {
    return {
      uri: '#97C2FC',           // Light blue for URIs
      literal: '#a6c8a6ff',     // Light green for literals
      blankNode: '#888888',     // Medium grey for blank nodes (darker than light mode)
      typeObject: '#e15b13ff',  // Orange for rdf:type objects
      text: '#e0e0e0',          // Light text for dark backgrounds
      edge: '#666666',          // Darker edges
      edgeLabel: '#cccccc',     // Lighter edge labels
      edgeLabelBackground: 'rgba(30, 30, 30, 0.8)',  // Dark semi-transparent background
      background: '#1e1e1e',    // Dark background for canvas
    };
  }
  
  // Light mode (default)
  return {
    uri: '#97C2FC',           // Light blue for URIs
    literal: '#a6c8a6ff',     // Light green for literals
    blankNode: '#c5c5c5ff',   // Light grey for blank nodes
    typeObject: '#e15b13ff',  // Orange for rdf:type objects
    text: '#000000',          // Black text
    edge: '#cccccc',          // Light grey edges
    edgeLabel: '#666666',     // Dark grey edge labels
    edgeLabelBackground: 'rgba(255, 255, 255, 0.8)',  // Light semi-transparent background
    background: '#ffffff',    // Light background for canvas
  };
}

/**
 * Create a MutationObserver to watch for theme changes
 * @param {Function} callback - Function to call when theme changes
 * @returns {MutationObserver} Observer instance
 */
function watchThemeChanges(callback) {
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

export {
  getCurrentTheme,
  getThemeColors,
  getThemeNodeColors,
  watchThemeChanges,
};
