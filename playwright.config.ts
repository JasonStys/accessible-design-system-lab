/**
 * File: playwright.config.ts
 * Purpose: Exercise desktop, mobile, keyboard, reduced-motion, RTL, and accessibility scenarios.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: projects is the supported browser/viewport verification matrix; the test
 * server lifecycle is managed by scripts/run-browser-tests.mjs.
 */
import { defineConfig, devices } from "@playwright/test";

const projects = [
  { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
];

export default defineConfig({
  expect: { timeout: 5_000 },
  fullyParallel: true,
  projects,
  reporter: [["list"], ["html", { open: "never" }]],
  testDir: "tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
});
