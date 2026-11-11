/** File: scripts/test-native-app.mjs
 * Author: Jason Stys
 * Purpose: Use the actual compiled full authoring app twice with realistic edits, public components and durable state.
 * Functions: launch/finish own a marked synthetic profile; imports/exports use genuine new-file IO and fixed dialogs.
 * State: this harness never opens normal AppData, installs an app, changes a shortcut or forces a successful exit.
 */
import {
  _electron as electron,
  expect,
} from "../desktop/node_modules/@playwright/test/index.mjs";
import { mkdir, mkdtemp, readFile, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import http from "node:http";
import {
  preparedProject,
  reactSource,
  cssSource,
} from "../src/authoring/project.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const executable = resolve(
  process.env.ADS_NATIVE_EXECUTABLE ??
    join(root, "release/pilot-001/win-unpacked/AccessibleDesignStudio.exe"),
);
const output = resolve(
  root,
  process.env.ADS_NATIVE_PROOF ?? "artifacts/native/pilot-001",
);
if (!output.startsWith(join(root, "artifacts/native") + sep))
  throw new Error("Use a fresh project-native proof directory.");
await mkdir(dirname(output), { recursive: true });
await mkdir(output);
const scratch = await mkdtemp(join(tmpdir(), "ads-native-consumer-"));
await writeFile(join(scratch, "acceptance.marker"), "ads-owned-native-test\n", {
  flag: "wx",
  mode: 0o600,
});
const metadata = JSON.parse(
  await readFile(
    join(dirname(executable), "resources/native/SOURCE.json"),
    "utf8",
  ),
);
expect(metadata.version).toBe("1.1.0");
expect(metadata.source).toBe(
  execFileSync(
    "git",
    ["-c", `safe.directory=${root.replaceAll("\\", "/")}`, "rev-parse", "HEAD"],
    { cwd: root, encoding: "utf8" },
  ).trim(),
);
for (const name of [
  "main.cjs",
  "preload.cjs",
  "files.cjs",
  "profile.cjs",
  "assets.cjs",
])
  expect(metadata.owner[name]).toBe(
    createHash("sha256")
      .update(await readFile(join(root, "desktop", name)))
      .digest("hex"),
  );
if (process.env.CI) expect(metadata.sourceDirty).toBe(false);
const environment = Object.fromEntries(
  Object.entries(process.env).filter(([key]) =>
    ["SYSTEMROOT", "WINDIR", "TEMP", "TMP"].includes(key.toUpperCase()),
  ),
);
environment.PATH = join(process.env.SYSTEMROOT ?? "C:/Windows", "System32");
environment.ADS_NATIVE_ACCEPTANCE_ROOT = scratch;
const outsideRequests = [],
  pageErrors = [];
let proxyRequests = 0,
  current;
const proxy = http.createServer((_request, response) => {
  proxyRequests++;
  response.writeHead(502);
  response.end();
});
proxy.listen(0, "127.0.0.1");
await once(proxy, "listening");

async function launch() {
  const application = await electron.launch({
    executablePath: executable,
    args: [
      `--proxy-server=http://127.0.0.1:${proxy.address().port}`,
      "--proxy-bypass-list=<-loopback>",
    ],
    env: environment,
    timeout: 60_000,
  });
  current = application;
  const page = await application.firstWindow({ timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: "Blueprint workspace" }),
  ).toBeVisible();
  await expect(
    page.getByText("Accessible Design Studio 1.1.0", { exact: false }),
  ).toBeVisible();
  const origin = new URL(page.url()).origin;
  expect(new URL(page.url()).hostname).toBe("127.0.0.1");
  expect(
    await application.evaluate(
      ({ BrowserWindow }, url) =>
        BrowserWindow.getAllWindows()[0].webContents.session.resolveProxy(url),
      origin,
    ),
  ).toBe("DIRECT");
  expect(
    await application.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].isVisible(),
    ),
  ).toBe(true);
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== origin)
      outsideRequests.push(request.url());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  return { application, page };
}
async function finish(application, page) {
  const exit = once(application.process(), "exit");
  await page
    .getByRole("button", { name: "Quit application", exact: true })
    .click();
  let timer;
  const result = await Promise.race([
    exit,
    new Promise((_resolve, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new Error(
              "Native owner did not exit normally after accepted file work",
            ),
          ),
        20_000,
      );
    }),
  ]).finally(() => clearTimeout(timer));
  expect(result).toEqual([0, null]);
  await expect
    .poll(() =>
      stat(join(scratch, "workspace/workspace.lock")).then(
        () => true,
        (failure) => {
          if (failure.code === "ENOENT") return false;
          throw failure;
        },
      ),
    )
    .toBe(false);
  current = undefined;
}

/** A genuine accepted asynchronous file choice must finish its actual new-file write before repeated Close exits. */
async function finishAfterHeldExport(application, page, project) {
  const target = join(scratch, "quit-retained-export.css");
  await application.evaluate(({ dialog }, file) => {
    dialog.showSaveDialog = () =>
      new Promise((resolve) => {
        globalThis.releaseOwnedDesignExport = () =>
          resolve({ canceled: false, filePath: file });
      });
  }, target);
  await page.getByRole("button", { name: "Export CSS", exact: true }).click();
  await expect
    .poll(() =>
      application.evaluate(() => typeof globalThis.releaseOwnedDesignExport),
    )
    .toBe("function");
  const exit = once(application.process(), "exit");
  await application.evaluate(({ BrowserWindow }) => {
    const owner = BrowserWindow.getAllWindows()[0];
    owner.close();
    owner.close();
  });
  expect(application.process().exitCode).toBeNull();
  expect(
    await application.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].isVisible(),
    ),
  ).toBe(true);
  expect(
    await application.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].getTitle(),
    ),
  ).toContain("finishing local file work");
  expect((await stat(join(scratch, "workspace/workspace.lock"))).isFile()).toBe(
    true,
  );
  await application.evaluate(() => globalThis.releaseOwnedDesignExport());
  let timer;
  const result = await Promise.race([
    exit,
    new Promise((_resolve, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new Error(
              "Retained export did not complete before normal native exit",
            ),
          ),
        20_000,
      );
    }),
  ]).finally(() => clearTimeout(timer));
  expect(result).toEqual([0, null]);
  expect(await readFile(target, "utf8")).toBe(cssSource(project));
  await expect
    .poll(() =>
      stat(join(scratch, "workspace/workspace.lock")).then(
        () => true,
        (failure) => {
          if (failure.code === "ENOENT") return false;
          throw failure;
        },
      ),
    )
    .toBe(false);
  current = undefined;
}

try {
  const first = await launch(),
    { application, page } = first;
  await page
    .getByRole("button", { name: "Workspace help", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Using the blueprint workspace" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Workspace help", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Save project", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Load saved project", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "No saved project" }),
  ).toBeVisible();
  await page
    .getByLabel("Prepared input", { exact: true })
    .selectOption("operations");
  const draft = page.getByLabel("Blueprint JSON", { exact: true });
  const custom = preparedProject("operations");
  custom.title = "Manufacturing shift review";
  custom.appearance.accent = "#e0a000";
  await draft.fill(JSON.stringify(custom));
  await page
    .getByRole("button", { name: "Validate and apply preview", exact: true })
    .click();
  const preview = page.getByRole("region", {
    name: "Applied interactive preview",
  });
  await expect(
    preview.getByRole("heading", { name: "Manufacturing shift review" }),
  ).toBeVisible();
  await preview.getByRole("tab", { name: "Evening" }).focus();
  await page.keyboard.press("Home");
  await expect(preview.getByRole("tab", { name: "Morning" })).toBeFocused();
  await preview
    .getByRole("button", { name: "Sort by Asset ascending", exact: true })
    .click();
  await expect(preview.locator('th[aria-sort="ascending"]')).toContainText(
    "Asset",
  );
  await preview.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(preview.getByRole("table")).toContainText("Pump A");
  await page.getByRole("button", { name: "Add field", exact: true }).click();
  await page
    .getByLabel("Selected block", { exact: true })
    .selectOption("field-1");
  await page.getByLabel("Selected block JSON", { exact: true }).fill(
    JSON.stringify({
      id: "inspection-notes",
      kind: "field",
      label: "Inspector notes",
      help: "Synthetic shift observations only.",
      type: "text",
      required: true,
    }),
  );
  await page
    .getByRole("button", { name: "Apply selected block", exact: true })
    .click();
  await expect(
    preview.getByLabel("Inspector notes", { exact: false }),
  ).toBeVisible();
  await preview
    .getByLabel("Inspector notes", { exact: false })
    .fill("Pump A reviewed at shift handover.");
  await page
    .getByLabel("Selected block", { exact: true })
    .selectOption("inspection-notes");
  await page.getByRole("button", { name: "Move up", exact: true }).click();
  const finalProject = JSON.parse(await draft.inputValue());
  expect(finalProject.blocks.map((item) => item.id)).toEqual([
    "shift",
    "inspection-notes",
    "assets",
  ]);
  await draft.fill(JSON.stringify({ ...finalProject, title: "" }));
  await page
    .getByRole("button", { name: "Validate and apply preview", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("empty");
  await expect(
    preview.getByRole("heading", { name: "Manufacturing shift review" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save project", exact: true }),
  ).toBeDisabled();
  await draft.fill(JSON.stringify(finalProject));
  await page
    .getByRole("button", { name: "Validate and apply preview", exact: true })
    .click();
  await page.getByRole("button", { name: "Save project", exact: true }).click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Current project saved locally" }),
  ).toBeVisible();
  const currentFile = join(scratch, "workspace/project.json"),
    saved = await readFile(currentFile);
  expect(JSON.parse(saved.toString())).toEqual(finalProject);
  await page.locator("section.authoring-workspace").screenshot({
    path: join(output, "native-authored-blueprint.png"),
  });
  for (const [, button, filename, expected] of [
    [
      "project",
      "Export PROJECT",
      "blueprint.json",
      JSON.stringify(finalProject, null, 2) + "\n",
    ],
    ["react", "Export React", "Blueprint.tsx", reactSource(finalProject)],
    ["css", "Export CSS", "blueprint.css", cssSource(finalProject)],
  ]) {
    const target = join(scratch, filename);
    await application.evaluate(({ dialog }, file) => {
      dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
    }, target);
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect
      .poll(() => readFile(target, "utf8").catch(() => ""))
      .toBe(expected);
    await page.getByRole("button", { name: button, exact: true }).click();
    await expect(page.getByRole("alert")).toContainText(
      "Destination already exists",
    );
    expect(await readFile(target, "utf8")).toBe(expected);
  }
  const imported = join(scratch, "preferences.json");
  await writeFile(imported, JSON.stringify(preparedProject("preferences")), {
    flag: "wx",
  });
  await application.evaluate(({ dialog }, file) => {
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [file],
    });
  }, imported);
  await page
    .getByRole("button", { name: "Import project file", exact: true })
    .click();
  await expect(
    preview.getByRole("heading", { name: "Account preferences" }),
  ).toBeVisible();
  expect(await readFile(currentFile)).toEqual(saved);
  await preview
    .getByRole("button", { name: "Review changes", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Review preferences" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    preview.getByRole("button", { name: "Review changes", exact: true }),
  ).toBeFocused();
  await writeFile(imported, Buffer.from([255, 123, 125]));
  await page
    .getByRole("button", { name: "Import project file", exact: true })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    preview.getByRole("heading", { name: "Account preferences" }),
  ).toBeVisible();
  expect(await readFile(currentFile)).toEqual(saved);
  await page
    .getByRole("button", { name: "Load saved project", exact: true })
    .click();
  await expect(
    preview.getByRole("heading", { name: "Manufacturing shift review" }),
  ).toBeVisible();
  await page.locator("section.authoring-workspace").screenshot({
    path: join(output, "native-project-and-export.png"),
  });
  await finishAfterHeldExport(application, page, finalProject);
  const second = await launch();
  await second.page
    .getByRole("button", { name: "Load saved project", exact: true })
    .click();
  await expect(
    second.page
      .getByRole("region", { name: "Applied interactive preview" })
      .getByRole("heading", { name: "Manufacturing shift review" }),
  ).toBeVisible();
  expect(await readFile(currentFile)).toEqual(saved);
  await finish(second.application, second.page);
  expect(outsideRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(proxyRequests).toBe(0);
  const receipt = {
    schema: 1,
    passed: true,
    product: "accessible-design-system-lab",
    version: metadata.version,
    source: metadata.source,
    sourceDirty: metadata.sourceDirty,
    actualLaunches: 2,
    normalExitCodes: [0, 0],
    visibleNativeWindow: true,
    realPublicComponents: true,
    actualExports: ["project JSON", "React TSX", "CSS"],
    staleAndInvalidPreserveState: true,
    actualAcceptedExportCompletedBeforeRepeatedClose: true,
    persistedProjectSha256: createHash("sha256").update(saved).digest("hex"),
    outsideRequests: 0,
    inheritedProxyRequests: 0,
    normalUserProfileOpened: false,
  };
  await writeFile(
    join(output, "acceptance.json"),
    JSON.stringify(receipt, null, 2) + "\n",
    { flag: "wx" },
  );
  console.log(JSON.stringify(receipt));
} catch (failure) {
  await writeFile(
    join(output, "failure.json"),
    JSON.stringify({ message: String(failure), outsideRequests, pageErrors }) +
      "\n",
    { flag: "wx" },
  );
  if (current)
    await current.evaluate(({ app }) => app.quit()).catch(() => undefined);
  throw failure;
} finally {
  await new Promise((resolve, reject) =>
    proxy.close((failure) => (failure ? reject(failure) : resolve())),
  );
}
