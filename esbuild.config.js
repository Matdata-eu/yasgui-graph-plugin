const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Build configurations for different module formats
const builds = [
  // ES Module (for bundlers like webpack, vite, rollup)
  {
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['es2018'],
    format: 'esm',
    outfile: 'dist/yasgui-graph-plugin.esm.js',
    external: ['vis-network'], // Don't bundle vis-network for ESM
    loader: {
      '.js': 'js',
    },
  },
  // CommonJS (for Node.js)
  {
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['es2018'],
    format: 'cjs',
    outfile: 'dist/yasgui-graph-plugin.cjs.js',
    external: ['vis-network'], // Don't bundle vis-network for CJS
    loader: {
      '.js': 'js',
    },
  },
  // IIFE (for browsers via unpkg.com and script tags)
  {
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['es2018'],
    format: 'iife',
    globalName: 'GraphPlugin',
    outfile: 'dist/yasgui-graph-plugin.min.js',
    external: [], // Bundle vis-network for browser usage
    loader: {
      '.js': 'js',
    },
  },
];

// TypeScript declaration content
const typeDeclaration = `// Type definitions for @matdata/yasgui-graph-plugin
// Project: https://github.com/Matdata-eu/yasgui-graph-plugin

declare module '@matdata/yasgui-graph-plugin' {
  import type { Plugin, DownloadInfo } from '@zazuko/yasr/build/ts/plugins';
  import type Yasr from '@zazuko/yasr';

  /**
   * YASGUI plugin for visualizing SPARQL CONSTRUCT and DESCRIBE query results as interactive graphs
   */
  export default class GraphPlugin implements Plugin<any> {
    /**
     * Plugin priority (higher = shown first in tabs)
     */
    priority: number;

    /**
     * Plugin label for tab display
     */
    label?: string;

    /**
     * Reference to help documentation
     */
    helpReference?: string;

    /**
     * Check if plugin can handle the current results
     * @returns True if results are from CONSTRUCT or DESCRIBE query
     */
    canHandleResults(): boolean;

    /**
     * Render the graph visualization
     */
    draw(persistentConfig: any, runtimeConfig?: any): Promise<void> | void;

    /**
     * Get icon element for plugin tab
     */
    getIcon(): Element | undefined;

    /**
     * Download the current visualization as PNG
     */
    download(filename?: string): DownloadInfo | undefined;

    /**
     * Cleanup resources when plugin is destroyed
     */
    destroy?(): void;

    /**
     * Get vis-network configuration options
     * @returns Network options for vis-network
     */
    getNetworkOptions(): any;
  }
}
`;

// Build all formats
Promise.all(builds.map(config => esbuild.build(config)))
  .then(() => {
    // Create TypeScript declaration file
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    fs.writeFileSync(path.join(distDir, 'index.d.ts'), typeDeclaration);
    
    console.log('✅ Build complete:');
    console.log('   - dist/yasgui-graph-plugin.esm.js (ES Module for bundlers)');
    console.log('   - dist/yasgui-graph-plugin.cjs.js (CommonJS for Node.js)');
    console.log('   - dist/yasgui-graph-plugin.min.js (IIFE for browsers/unpkg)');
    console.log('   - dist/index.d.ts (TypeScript declarations)');
  })
  .catch((err) => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });
