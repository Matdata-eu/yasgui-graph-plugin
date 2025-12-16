import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "demo",
  publicDir: false,
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: false,
  },
  resolve: {
    alias: {
      "@matdata/yasgui-graph-plugin": resolve(__dirname, "src/index.js"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  build: {
    outDir: "../dist",
  },
  esbuild: {
    target: "es2020",
  },
});
