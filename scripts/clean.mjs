/**
 * File: clean.mjs
 * Purpose: Remove only known generated build and verification directories before reproducible builds.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: generatedDirectories is an explicit allowlist contained by the repository root.
 */
import { rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedDirectories = [
  "coverage",
  "dist",
  "playwright-report",
  "storybook-static",
  "test-results",
];

/** Remove allowlisted generated directories without following computed or external paths. */
function main() {
  for (const directory of generatedDirectories)
    rmSync(join(repositoryRoot, directory), { force: true, recursive: true });
  console.log(`Removed ${generatedDirectories.length} generated directories.`);
}

main();
