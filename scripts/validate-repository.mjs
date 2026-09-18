/**
 * File: validate-repository.mjs
 * Purpose: Enforce documentation, source-header, local-link, and sensitive-content repository invariants.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: requiredFiles and headerExtensions define the reviewable portfolio contract.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "README.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "LICENSE",
  "docs/accessibility.md",
  "docs/api.md",
  "docs/architecture.md",
  "docs/code-index.md",
  "docs/complexity.md",
  "docs/file-catalog.md",
  "docs/operations.md",
  "docs/research.md",
  "docs/testing.md",
  "docs/tokens.md",
  "docs/adr/0001-native-first-react-and-css.md",
  "docs/reports/bundle-budget.md",
  "docs/reports/manual-screen-reader-checklist.md",
  "docs/reports/test-summary.md",
  "docs/reports/validation.md",
];
const headerExtensions = new Set([
  ".ts",
  ".tsx",
  ".mjs",
  ".js",
  ".css",
  ".sh",
  ".yml",
  ".yaml",
  ".html",
]);
const excludedDirectories = new Set([
  ".git",
  ".npm-cache",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "storybook-static",
  "test-results",
]);
const prohibitedPatterns = [
  {
    label: "private key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  { label: "company-specific reference", pattern: /opto[ -]?22/i },
];

/** Recursively return authored files without dependency caches or generated reports. */
function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory())
      return excludedDirectories.has(entry.name) ? [] : walk(path);
    return [path];
  });
}

/** Return broken local Markdown targets while leaving remote availability to network-aware review. */
function brokenMarkdownLinks(path) {
  const markdown = readFileSync(path, "utf8");
  return [...markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].flatMap((match) => {
    const target = match[1].replace(/^<|>$/g, "");
    if (/^(?:https?:|mailto:|#)/.test(target)) return [];
    const localTarget = decodeURIComponent(target.split(/[?#]/, 1)[0]);
    return existsSync(resolve(dirname(path), localTarget)) ? [] : [target];
  });
}

/** Validate required files, source headers, local links, and accidental sensitive content. */
function main() {
  const failures = [];
  for (const requiredFile of requiredFiles) {
    if (!existsSync(join(repositoryRoot, requiredFile)))
      failures.push(`Missing required file: ${requiredFile}`);
  }
  for (const path of walk(repositoryRoot)) {
    const repositoryPath = relative(repositoryRoot, path).replaceAll("\\", "/");
    const content = readFileSync(path, "utf8");
    if (extname(path) === ".md") {
      for (const target of brokenMarkdownLinks(path))
        failures.push(
          `Broken local Markdown link in ${repositoryPath}: ${target}`,
        );
    }
    if (headerExtensions.has(extname(path))) {
      const firstLines = content.split(/\r?\n/).slice(0, 12).join("\n");
      if (!firstLines.includes("File:") || !firstLines.includes("Purpose:"))
        failures.push(`Source header is incomplete: ${repositoryPath}`);
    }
    for (const prohibited of prohibitedPatterns) {
      if (prohibited.pattern.test(content))
        failures.push(
          `Found prohibited ${prohibited.label} content in ${repositoryPath}`,
        );
    }
  }
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(
    "Repository structure, links, source headers, and sensitive-content checks are valid.",
  );
}

main();
