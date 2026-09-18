/**
 * File: check-bundle.mjs
 * Purpose: Enforce compressed JavaScript and CSS package budgets with machine-readable evidence.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: budgets and artifacts define the bounded package-cost contract.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const budgets = { css: 16_000, javascript: 36_000 };
const artifacts = {
  css: join(repositoryRoot, "dist", "package", "accessible-design-system.css"),
  javascript: join(
    repositoryRoot,
    "dist",
    "package",
    "accessible-design-system.js",
  ),
};

/** Measure gzip bytes, write stable evidence, and fail when a budget is exceeded. */
function main() {
  const report = {
    budgets,
    results: {},
    schemaVersion: 1,
  };
  let failed = false;
  for (const [kind, path] of Object.entries(artifacts)) {
    if (!existsSync(path)) throw new Error(`Missing build artifact: ${path}`);
    const rawBytes = readFileSync(path).byteLength;
    const gzipBytes = gzipSync(readFileSync(path), { level: 9 }).byteLength;
    const budget = budgets[kind];
    report.results[kind] = {
      budget,
      gzipBytes,
      passed: gzipBytes <= budget,
      rawBytes,
    };
    failed ||= gzipBytes > budget;
  }
  const reportPath = join(
    repositoryRoot,
    "docs",
    "reports",
    "generated",
    "bundle-budget.json",
  );
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(report.results, null, 2));
  if (failed) process.exitCode = 1;
}

main();
