const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Build configurations for different module formats
const buildConfigs = [
  // ES Module (for bundlers like webpack, vite, rollup)
  {
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['es2018'],
    format: 'esm',
    outfile: 'dist/yasgui-graph-plugin.esm.js',
    external: [], // Bundle vis-network
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
    external: [], // Bundle vis-network
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
const typeDeclaration = `declare module '@matdata/yasgui-graph-plugin';
`;

// Build all formats
Promise.all(buildConfigs.map(config => esbuild.build(config)))
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
