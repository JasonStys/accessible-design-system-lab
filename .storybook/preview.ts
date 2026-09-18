/**
 * File: preview.ts
 * Purpose: Apply package styles and fail Storybook accessibility checks when violations are detected.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: preview centralizes global a11y and documentation behavior.
 */
import type { Preview } from "@storybook/react-vite";
import "../src/styles/tokens.css";
import "../src/styles/components.css";
import "../src/styles/demo.css";

const preview: Preview = {
  parameters: {
    a11y: { test: "error" },
    controls: { expanded: true },
    docs: { toc: true },
  },
  tags: ["autodocs"],
};

export default preview;
