/**
 * File: vite.config.ts
 * Purpose: Build the documentation/demo site and configure deterministic Vitest coverage.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: siteInputs keeps the React and vanilla examples in one reproducible build.
 */
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const siteInputs = {
  catalog: resolve(import.meta.dirname, "index.html"),
  vanilla: resolve(import.meta.dirname, "vanilla.html"),
};

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/site",
    rollupOptions: { input: siteInputs },
  },
  test: {
    coverage: {
      include: ["src/components/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      thresholds: { lines: 90, functions: 90, branches: 80, statements: 90 },
    },
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["src/test/setup.ts"],
  },
});
