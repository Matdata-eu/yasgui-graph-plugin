const esbuild = require('esbuild');

// Build configuration
const config = {
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2018'],
  format: 'iife',
  globalName: 'GraphPlugin',
  outfile: 'dist/yasgui-graph-plugin.min.js',
  external: [],
  // Resolve ES module extensions
  loader: {
    '.js': 'js',
  },
};

esbuild
  .build(config)
  .then(() => console.log('✅ Build complete: dist/yasgui-graph-plugin.min.js'))
  .catch((err) => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });
