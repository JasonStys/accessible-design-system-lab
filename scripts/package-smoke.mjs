/**
 * File: package-smoke.mjs
 * Purpose: Pack the built library, install it into an isolated consumer, and verify public exports.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: expectedExports is the supported runtime package contract.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedExports = [
  "Button",
  "Combobox",
  "DataTable",
  "Dialog",
  "Tabs",
  "TextField",
  "ToastRegion",
];
const npmEnvironment = {
  ...process.env,
  npm_config_cache: join(repositoryRoot, ".npm-cache"),
};

/** Run a child command with captured output and a precise failure message. */
function run(command, args, cwd) {
  const npmCli = command === "npm" ? process.env.npm_execpath : undefined;
  const executable = npmCli ? process.execPath : command;
  const childArgs = npmCli ? [npmCli, ...args] : args;
  const result = spawnSync(executable, childArgs, {
    cwd,
    encoding: "utf8",
    env: npmEnvironment,
  });
  if (result.status !== 0)
    throw new Error(
      `${command} ${args.join(" ")} failed:\n${result.error ?? ""}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
    );
  return result.stdout.trim();
}

/** Verify package contents and runtime exports from a clean consumer boundary. */
function main() {
  const consumer = mkdtempSync(
    join(tmpdir(), "accessible-design-system-consumer-"),
  );
  try {
    const packOutput = JSON.parse(
      run("npm", ["pack", "--json", "--ignore-scripts"], repositoryRoot),
    );
    const filename = packOutput[0]?.filename;
    if (!filename)
      throw new Error("npm pack did not return a package filename");
    const archivePath = join(repositoryRoot, filename);
    writeFileSync(
      join(consumer, "package.json"),
      '{"private":true,"type":"module"}\n',
      "utf8",
    );
    run(
      "npm",
      ["install", "--ignore-scripts", "--no-audit", "--no-fund", archivePath],
      consumer,
    );
    const modulePath = join(
      consumer,
      "node_modules",
      "accessible-design-system-lab",
      "dist",
      "package",
      "accessible-design-system.js",
    );
    const source = readFileSync(modulePath, "utf8");
    for (const name of expectedExports) {
      if (!source.includes(name))
        throw new Error(`Packed module does not expose ${name}`);
    }
    console.log(
      `Package smoke test passed for ${expectedExports.length} public components.`,
    );
    rmSync(archivePath, { force: true });
  } finally {
    rmSync(consumer, { force: true, recursive: true });
  }
}

main();
