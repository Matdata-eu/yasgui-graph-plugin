const esbuild = require('esbuild');

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

// Build all formats
Promise.all(builds.map(config => esbuild.build(config)))
  .then(() => {
    console.log('✅ Build complete:');
    console.log('   - dist/yasgui-graph-plugin.esm.js (ES Module for bundlers)');
    console.log('   - dist/yasgui-graph-plugin.cjs.js (CommonJS for Node.js)');
    console.log('   - dist/yasgui-graph-plugin.min.js (IIFE for browsers/unpkg)');
  })
  .catch((err) => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });
