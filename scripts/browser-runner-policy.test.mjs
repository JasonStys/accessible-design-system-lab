/**
 * File: browser-runner-policy.test.mjs
 * Purpose: Test the actual CI recipe and independent mutations of its two browser-setup jobs.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: original is the real checked-in workflow; mutants never write source or change OS configuration.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { validateBrowserSetup } from "./browser-runner-policy.mjs";
const original = readFileSync(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
).replaceAll("\r\n", "\n");

test("both actual browser jobs retain the actual bounded host proof and original test commands", () => {
  validateBrowserSetup(original);
});
for (const [label, before, after] of [
  [
    "moving runner image",
    "    runs-on: ubuntu-24.04",
    "    runs-on: ubuntu-latest",
  ],
  ["unbounded setup", "    timeout-minutes: 20", "    timeout-minutes: 120"],
  [
    "unowned browser cache",
    "${{ github.workspace }}/.runtime/ci-playwright",
    "/tmp/unknown-shared-browser",
  ],
  [
    "wrong browser download",
    "run: npx playwright install chromium",
    "run: npx playwright install firefox",
  ],
  [
    "missing actual host proof",
    "run: node scripts/browser-host-proof.mjs",
    "run: echo omitted",
  ],
  [
    "skipped host validation",
    "run: node scripts/browser-host-proof.mjs",
    "run: PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 node scripts/browser-host-proof.mjs",
  ],
  [
    "masked host failure",
    "run: node scripts/browser-host-proof.mjs",
    "run: node scripts/browser-host-proof.mjs || true",
  ],
  [
    "removed installed consumer",
    "run: npm run package:smoke",
    "run: echo omitted",
  ],
  ["removed browser journeys", "run: npm run test:e2e", "run: echo omitted"],
  [
    "removed audit",
    "run: npm audit --audit-level=moderate",
    "run: echo omitted",
  ],
]) {
  test(`reject ${label} in the actual workflow`, () => {
    assert.ok(original.includes(before));
    assert.throws(() => validateBrowserSetup(original.replace(before, after)));
  });
}

test("duplicate actual browser job cannot hide a weaker last declaration", () => {
  assert.throws(() =>
    validateBrowserSetup(
      original + "\n  browser:\n    runs-on: ubuntu-latest\n",
    ),
  );
});
