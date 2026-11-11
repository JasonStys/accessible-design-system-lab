/**
 * File: package-smoke.mjs
 * Author: Jason Stys
 * Purpose: Install the final TGZ in a private consumer, build its public imports and exercise real React DOM behavior.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: expectedExports, reviewedLock and consumer; source aliases and existing servers are never used.
 */
import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { build, preview } from "vite";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  paletteBlock,
  preparedProject,
  reactSource,
  cssSource,
} from "../src/authoring/project.ts";

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
const reviewedLock = JSON.parse(
  await readFile(join(repositoryRoot, "package-lock.json"), "utf8"),
);
const npmEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name, value]) =>
      typeof value === "string" &&
      !/(?:TOKEN|PASSWORD|SECRET|CREDENTIAL|AUTH|COOKIE)|^NODE_OPTIONS$|^NODE_PATH$/iu.test(
        name,
      ),
  ),
);
npmEnvironment.npm_config_cache =
  process.env.npm_config_cache ?? join(repositoryRoot, ".npm-cache");

/** Invoke the existing npm JS CLI with scripts disabled, deadlines and bounded public diagnostics. */
function runNpm(args, cwd) {
  const cli = process.env.npm_execpath;
  if (!cli || !/npm-cli\.js$/u.test(cli.replaceAll("\\", "/")))
    throw new Error(
      "Run package smoke through npm run package:smoke so the exact npm CLI is known.",
    );
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd,
    encoding: "utf8",
    env: npmEnvironment,
    timeout: 120_000,
    maxBuffer: 2 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.status !== 0)
    throw new Error(
      `Consumer npm command failed: ${result.error ?? ""}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
    );
  return result.stdout.trim();
}

/** Write an independent consumer that imports only the installed package and declared public stylesheet. */
async function consumerFiles(consumer, archivePath) {
  const peers = Object.fromEntries(
    ["react", "react-dom", "scheduler", "@types/react", "@types/react-dom"].map(
      (name) => {
        const entry = reviewedLock.packages[`node_modules/${name}`];
        assert.ok(
          entry?.version && entry.integrity,
          `Reviewed ${name} peer identity missing`,
        );
        return [name, entry.version];
      },
    ),
  );
  await writeFile(
    join(consumer, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        ...peers,
        "accessible-design-system-lab": `file:${archivePath.replaceAll("\\", "/")}`,
      },
    }),
  );
  await writeFile(join(consumer, "empty-user.npmrc"), "");
  await writeFile(join(consumer, "empty-global.npmrc"), "");
  runNpm(
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--registry=https://registry.npmjs.org/",
      `--userconfig=${join(consumer, "empty-user.npmrc")}`,
      `--globalconfig=${join(consumer, "empty-global.npmrc")}`,
    ],
    consumer,
  );
  const installed = JSON.parse(
    await readFile(join(consumer, "package-lock.json"), "utf8"),
  );
  for (const name of Object.keys(peers)) {
    const actual = installed.packages[`node_modules/${name}`];
    const reviewed = reviewedLock.packages[`node_modules/${name}`];
    assert.equal(actual.version, reviewed.version, `${name} version drift`);
    assert.equal(
      actual.integrity,
      reviewed.integrity,
      `${name} archive integrity drift`,
    );
  }
  const installedRoot = await realpath(
    join(consumer, "node_modules/accessible-design-system-lab"),
  );
  assert.ok(
    installedRoot.startsWith(consumer + sep) &&
      !installedRoot.startsWith(repositoryRoot + sep),
  );
  const manifest = JSON.parse(
    await readFile(join(installedRoot, "package.json"), "utf8"),
  );
  assert.equal(manifest.name, "accessible-design-system-lab");
  await writeFile(
    join(consumer, "index.html"),
    '<!doctype html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Installed package consumer</title><div id="root"></div><script type="module" src="/consumer.js"></script></html>',
  );
  await writeFile(
    join(consumer, "consumer.js"),
    `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Public from 'accessible-design-system-lab';
import 'accessible-design-system-lab/styles.css';
const exported = Object.keys(Public).sort();
if (${JSON.stringify(expectedExports)}.some(name => !Public[name] || !['function','object'].includes(typeof Public[name]))) throw new Error('Runtime export missing');
window.installedExports = exported;
const rows = [
 {id:'bravo', values:{product:'Bravo',units:'12 units'},sortValues:{units:12}},
 {id:'alpha', values:{product:'Alpha',units:'2 units'},sortValues:{units:2}},
 {id:'unknown',values:{product:'<img src=x onerror="injected=true">',units:'Unknown'},sortValues:{units:null}},
 {id:'twin',values:{product:'Alpha twin',units:'2 units'},sortValues:{units:2}},
];
function App(){
 const [state,setState]=useState('ready'); const [empty,setEmpty]=useState(false);
 return React.createElement('main',null,
  React.createElement('h1',null,'Installed package consumer'),
  React.createElement('div',{role:'group','aria-label':'Fixture scenarios'},
   ...['ready','loading','error'].map(value=>React.createElement(Public.Button,{key:value,onClick:()=>{setState(value);setEmpty(false)}},value)),
   React.createElement(Public.Button,{onClick:()=>{setState('ready');setEmpty(true)}},'empty')),
  React.createElement(Public.DataTable,{caption:'Installed stock',columns:[{key:'product',label:'Product'},{key:'units',label:'Units',sortable:true}],rows:empty?[]:rows,pageSize:2,state}));
}

createRoot(document.getElementById('root')).render(React.createElement(App));
`,
  );
  return manifest.version;
}

/** Compile every generated variant against the actual installed public package with strict unused/type checks. */
async function generatedConsumer(consumer) {
  const all = preparedProject();
  all.title = "Generated component blueprint";
  all.blocks = [
    "text",
    "field",
    "button",
    "choice",
    "table",
    "tabs",
    "dialog",
  ].map((kind) => paletteBlock(kind, kind + "-one"));
  const projects = {
    all,
    service: preparedProject(),
    operations: preparedProject("operations"),
    preferences: preparedProject("preferences"),
    empty: { ...preparedProject(), blocks: [] },
  };
  for (const [name, project] of Object.entries(projects))
    await writeFile(
      join(consumer, "Blueprint-" + name + ".tsx"),
      reactSource(project),
    );
  // A real React bundler normally supplies CSS ambient types (for example vite/client).
  // Declare only that asset-import contract here; runtime build still resolves actual CSS bytes.
  await writeFile(
    join(consumer, "bundler-env.d.ts"),
    'declare module "*.css";\n',
  );
  await writeFile(join(consumer, "blueprint.css"), cssSource(all));
  const result = spawnSync(
    process.execPath,
    [
      join(repositoryRoot, "node_modules/typescript/bin/tsc"),
      "--strict",
      "--noUnusedLocals",
      "--noUnusedParameters",
      "--skipLibCheck",
      "--target",
      "ES2023",
      "--lib",
      "DOM,ES2023",
      "--module",
      "ESNext",
      "--moduleResolution",
      "Bundler",
      "--jsx",
      "react-jsx",
      "--outDir",
      "generated",
      "bundler-env.d.ts",
      ...Object.keys(projects).map((name) => "Blueprint-" + name + ".tsx"),
    ],
    {
      cwd: consumer,
      env: npmEnvironment,
      encoding: "utf8",
      windowsHide: true,
      timeout: 30_000,
      maxBuffer: 1024 * 1024,
    },
  );
  assert.equal(result.status, 0, result.stdout + result.stderr);
  await mkdir(join(consumer, "generated"), { recursive: true });
  await writeFile(join(consumer, "generated/blueprint.css"), cssSource(all));
  await writeFile(
    join(consumer, "blueprint.html"),
    '<!doctype html><html lang="en"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Generated blueprint consumer</title><div id="root"></div><script type="module" src="/blueprint-entry.js"></script></html>',
  );
  await writeFile(
    join(consumer, "blueprint-entry.js"),
    'import { createElement } from "react"; import { createRoot } from "react-dom/client"; import { Blueprint } from "./generated/Blueprint-all.js"; createRoot(document.getElementById("root")).render(createElement(Blueprint));',
  );
}

/** Exercise the compiled generated output, not the repository preview component or a source alias. */
async function exerciseGenerated(page) {
  await page
    .getByRole("heading", {
      name: "Generated component blueprint",
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page
      .locator(".authored-blueprint")
      .evaluate((element) => globalThis.getComputedStyle(element).display),
    "grid",
  );
  await page
    .getByRole("textbox", { name: "Contact email", exact: false })
    .fill("synthetic@example.test");
  await page
    .getByRole("button", { name: "Preview request", exact: true })
    .click();
  assert.equal(
    await page
      .getByRole("status")
      .filter({ hasText: "Preview request activated" })
      .count(),
    1,
  );
  await page
    .getByRole("button", { name: "Sort by Asset ascending", exact: true })
    .click();
  assert.equal(await page.locator('th[aria-sort="ascending"]').count(), 1);
  await page
    .getByRole("button", { name: "Review changes", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Review preferences", exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  assert.equal(
    await page
      .getByRole("button", { name: "Review changes", exact: true })
      .evaluate((element) => element === globalThis.document.activeElement),
    true,
  );
  assert.deepEqual(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
    [],
  );
}

/** Exercise actual installed-package DOM, numeric ordering, pagination focus and state transitions. */
async function exercise(page) {
  const table = page.getByRole("table", {
    name: "Installed stock",
    exact: true,
  });
  await table.waitFor();
  assert.deepEqual(
    await page.evaluate(() => globalThis.installedExports),
    [...expectedExports].sort(),
  );
  assert.deepEqual(
    await table.locator("tbody tr td:first-child").allTextContents(),
    ["Bravo", "Alpha"],
  );
  const sort = page.getByRole("button", {
    name: "Sort by Units ascending",
    exact: true,
  });
  await sort.focus();
  await sort.press("Enter");
  await page.waitForFunction(
    () =>
      globalThis.document.querySelector('th[aria-sort="ascending"]') !== null,
  );
  assert.deepEqual(
    await table.locator("tbody tr td:first-child").allTextContents(),
    ["Alpha", "Alpha twin"],
  );
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await page.waitForFunction(
    () => globalThis.document.activeElement?.tagName === "CAPTION",
  );
  assert.deepEqual(
    await table.locator("tbody tr td:first-child").allTextContents(),
    ["Bravo", '<img src=x onerror="injected=true">'],
  );
  assert.equal(
    await page
      .getByRole("button", { name: "Next page", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(await page.locator("img").count(), 0);
  await page
    .getByRole("button", { name: "Previous page", exact: true })
    .click();
  await page.waitForFunction(
    () => globalThis.document.activeElement?.tagName === "CAPTION",
  );
  await page
    .getByRole("button", { name: "Sort by Units descending", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      globalThis.document.querySelector('th[aria-sort="descending"]') !== null,
  );
  assert.deepEqual(
    await table.locator("tbody tr td:first-child").allTextContents(),
    ["Bravo", "Alpha"],
  );
  assert.equal(
    await table.evaluate(
      (element) => globalThis.getComputedStyle(element).borderCollapse,
    ),
    "collapse",
  );
  assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
  await page.getByRole("button", { name: "loading", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Loading table data." })
    .waitFor();
  assert.equal(
    await page.getByRole("button", { name: /Sort by Units/u }).isDisabled(),
    true,
  );
  await page.getByRole("button", { name: "error", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Table data could not be loaded." })
    .waitFor();
  await page.getByRole("button", { name: "empty", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "No matching rows." })
    .waitFor();
  assert.equal(
    await page
      .getByRole("button", { name: "Next page", exact: true })
      .isDisabled(),
    true,
  );
}

/** Pack/install/build only within a verified owned directory, then stop only owned browser/listener resources. */
async function main() {
  const consumer = await realpath(
    await mkdtemp(join(tmpdir(), "accessible-design-system-consumer-")),
  );
  let server;
  let browser;
  try {
    const pack = JSON.parse(
      runNpm(
        ["pack", "--json", "--ignore-scripts", "--pack-destination", consumer],
        repositoryRoot,
      ),
    );
    const filename = pack[0]?.filename;
    assert.ok(
      typeof filename === "string" &&
        basename(filename) === filename &&
        /^[a-z0-9._-]+\.tgz$/u.test(filename),
    );
    const archivePath = join(consumer, filename);
    const archiveHash = createHash("sha256")
      .update(await readFile(archivePath))
      .digest("hex");
    const version = await consumerFiles(consumer, archivePath);
    await generatedConsumer(consumer);
    await build({
      root: consumer,
      configFile: false,
      build: {
        outDir: "site",
        emptyOutDir: true,
        rollupOptions: {
          input: {
            catalog: join(consumer, "index.html"),
            blueprint: join(consumer, "blueprint.html"),
          },
        },
      },
      logLevel: "warn",
    });
    server = await preview({
      root: consumer,
      configFile: false,
      build: { outDir: "site" },
      preview: { host: "127.0.0.1", port: 0, strictPort: true },
      logLevel: "warn",
    });
    const address = server.httpServer.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    const outside = [];
    const pageErrors = [];
    browser = await chromium.launch({ headless: true, env: npmEnvironment });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(5_000);
    page.setDefaultNavigationTimeout(10_000);
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.route("**/*", (route) => {
      if (new URL(route.request().url()).origin !== origin) {
        outside.push(route.request().url());
        return route.abort();
      }
      return route.continue();
    });
    await page.goto(origin);
    await exercise(page);
    await page.goto(origin + "/blueprint.html");
    await exerciseGenerated(page);
    assert.deepEqual(outside, []);
    assert.deepEqual(pageErrors, []);
    console.log(
      JSON.stringify({
        consumer:
          "actual installed TGZ public exports and CSS; genuine Vite build/Chromium React DOM; no source aliases",
        version,
        archiveSha256: archiveHash,
        runtimeExports: expectedExports.length,
        checks: [
          "mount",
          "numeric stable sort",
          "page bounds",
          "caption focus",
          "literal text",
          "installed stylesheet",
          "loading",
          "error",
          "empty",
          "axe0",
          "externalRequests0",
          "five strict generated React variants",
          "actual compiled generated component interactions",
        ],
      }),
    );
  } finally {
    if (browser) await browser.close();
    if (server) await server.close();
    assert.ok(
      consumer.startsWith(resolve(tmpdir()) + sep) ||
        consumer.startsWith((await realpath(tmpdir())) + sep),
    );
    assert.ok(
      basename(consumer).startsWith("accessible-design-system-consumer-"),
    );
    await rm(consumer, {
      force: true,
      recursive: true,
      maxRetries: 5,
      retryDelay: 100,
    });
  }
}

await main();
