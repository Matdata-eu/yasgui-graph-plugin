const esbuild = require('esbuild');
const { sassPlugin } = require('esbuild-sass-plugin');
const fs = require('fs');
const path = require('path');

// Build configurations for different module formats
const buildConfigs = [
  // ES Module (for bundlers like webpack, vite, rollup)
  {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['es2018'],
    format: 'esm',
    outfile: 'dist/yasgui-graph-plugin.esm.js',
    external: [], // Bundle vis-network
    loader: {
      '.ts': 'ts',
    },
    plugins: [sassPlugin()],
  },
  // CommonJS (for Node.js)
  {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: false,
    sourcemap: true,
    target: ['es2018'],
    format: 'cjs',
    outfile: 'dist/yasgui-graph-plugin.cjs.js',
    external: [], // Bundle vis-network
    loader: {
      '.ts': 'ts',
    },
    plugins: [sassPlugin()],
  },
  // IIFE (for browsers via unpkg.com and script tags)
  {
    entryPoints: ['src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['es2018'],
    format: 'iife',
    globalName: 'GraphPlugin',
    outfile: 'dist/yasgui-graph-plugin.min.js',
    external: [], // Bundle vis-network for browser usage
    loader: {
      '.ts': 'ts',
    },
    plugins: [sassPlugin()],
  },
];

// Build TypeScript declarations
async function buildDeclarations() {
  const { execSync } = require('child_process');
  try {
    execSync('tsc --emitDeclarationOnly', { stdio: 'inherit' });
    console.log('✅ TypeScript declarations generated');
  } catch (err) {
    console.warn('⚠️  TypeScript declarations generation failed (non-fatal)');
  }
}

// Build all formats
Promise.all(buildConfigs.map(config => esbuild.build(config)))
  .then(async () => {
    // Generate TypeScript declarations
    await buildDeclarations();
    
    console.log('✅ Build complete:');
    console.log('   - dist/yasgui-graph-plugin.esm.js (ES Module for bundlers)');
    console.log('   - dist/yasgui-graph-plugin.cjs.js (CommonJS for Node.js)');
    console.log('   - dist/yasgui-graph-plugin.min.js (IIFE for browsers/unpkg)');
    console.log('   - dist/*.d.ts (TypeScript declarations)');
    console.log('   - Styles bundled inline');
  })
  .catch((err) => {
    console.error('❌ Build failed:', err);
    process.exit(1);
  });
