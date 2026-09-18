/**
 * File: main.ts
 * Purpose: Configure Storybook 10 for React/Vite stories, generated docs, and accessibility inspection.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: config is the complete, explicit Storybook integration surface.
 */
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  stories: ["../src/**/*.stories.@(ts|tsx)"],
};

export default config;
