/**
 * File: vite.lib.config.ts
 * Purpose: Produce the tree-shakeable component package and its single opt-in stylesheet.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: packageEntry and externalDependencies define the public package boundary.
 */
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const packageEntry = resolve(import.meta.dirname, "src/index.ts");
const externalDependencies = ["react", "react-dom", "react/jsx-runtime"];

export default defineConfig({
  plugins: [react()],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: packageEntry,
      fileName: "accessible-design-system",
      formats: ["es"],
      name: "AccessibleDesignSystem",
    },
    outDir: "dist/package",
    rollupOptions: { external: externalDependencies },
  },
});
