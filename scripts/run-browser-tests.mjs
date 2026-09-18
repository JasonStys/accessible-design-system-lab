/**
 * File: scripts/run-browser-tests.mjs
 * Purpose: Build and serve the catalog while Playwright exercises it, then close the server cleanly.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: host and port identify the loopback-only preview used by browser tests.
 */
import { spawn } from "node:child_process";
import { build, preview } from "vite";

const host = "127.0.0.1";
const port = 4173;

/** Run the Playwright CLI with inherited output and return its numeric exit code. */
function runPlaywright() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["node_modules/@playwright/test/cli.js", "test"],
      { stdio: "inherit" },
    );
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Playwright stopped after receiving ${signal}.`));
        return;
      }
      resolve(code ?? 1);
    });
  });
}

await build({ configFile: "vite.config.ts" });
const server = await preview({
  configFile: "vite.config.ts",
  preview: { host, port, strictPort: true },
});

try {
  process.exitCode = await runPlaywright();
} finally {
  await server.close();
}
