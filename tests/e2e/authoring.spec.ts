/** File: authoring.spec.ts
 * Author: Jason Stys
 * Purpose: Exercise real desktop/mobile blueprint authoring, last-good preview, actual components and literal export.
 * State: browser-memory designs only; no native persistence claim, external server or fixture backend.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { parseProject, preparedProject } from "../../src/authoring/project";

test("designer edits real component data, rejects bad input and downloads the exact applied blueprint", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Prepared input", { exact: true })
    .selectOption("operations");
  const draft = page.getByLabel("Blueprint JSON", { exact: true });
  const preview = page.getByRole("region", {
    name: "Applied interactive preview",
  });
  const project = preparedProject("operations");
  project.title = "Shift handover <img src=x onerror=alert(1)>";
  await draft.fill(JSON.stringify(project));
  await page
    .getByRole("button", { name: "Validate and apply preview", exact: true })
    .click();
  await expect(
    preview.getByRole("heading", { name: project.title, exact: true }),
  ).toBeVisible();
  await expect(preview.locator("img")).toHaveCount(0);
  await preview
    .getByRole("button", { name: "Sort by Asset ascending", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    preview.getByRole("button", {
      name: "Sort by Asset descending",
      exact: true,
    }),
  ).toBeFocused();
  await preview.getByRole("tab", { name: "Morning" }).focus();
  await page.keyboard.press("End");
  await expect(preview.getByRole("tab", { name: "Evening" })).toBeFocused();
  await draft.fill(JSON.stringify({ ...project, schema: 9 }));
  await page
    .getByRole("button", { name: "Validate and apply preview", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Unsupported");
  await expect(
    preview.getByRole("heading", { name: project.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export PROJECT", exact: true }),
  ).toBeDisabled();
  await draft.fill(JSON.stringify(project));
  await page
    .getByRole("button", { name: "Validate and apply preview", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export PROJECT", exact: true })
    .click();
  const result = await download;
  const path = await result.path();
  if (!path) throw new Error("The browser did not retain its actual download");
  expect(JSON.parse(await readFile(path, "utf8"))).toEqual(project);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("outline actions preserve applied order and a real dialog returns focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Add dialog", exact: true }).click();
  await page
    .getByLabel("Selected block", { exact: true })
    .selectOption("dialog-1");
  await page.getByRole("button", { name: "Move up", exact: true }).click();
  const draft = page.getByLabel("Blueprint JSON", { exact: true });
  expect(
    parseProject(await draft.inputValue()).blocks.map(
      (item: { id: string }) => item.id,
    ),
  ).toEqual(["introduction", "contact", "priority", "dialog-1", "submit"]);
  const preview = page.getByRole("region", {
    name: "Applied interactive preview",
  });
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
  const original = await draft.inputValue();
  await page.getByLabel("Selected block JSON", { exact: true }).fill("");
  await expect(
    page.getByRole("button", { name: "Export PROJECT", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Add field", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("discard");
  expect(await draft.inputValue()).toBe(original);
  await expect(
    page.getByLabel("Selected block JSON", { exact: true }),
  ).toHaveValue("");
  await page
    .getByRole("button", { name: "Discard selected edits", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remove selected block", exact: true })
    .click();
  await expect(
    preview.getByRole("button", { name: "Review changes", exact: true }),
  ).toHaveCount(0);
});
