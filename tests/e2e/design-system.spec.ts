/**
 * File: design-system.spec.ts
 * Purpose: Verify real-browser keyboard, modal, accessibility, responsive, RTL, and vanilla behavior.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: AxeBuilder audits the rendered document after deterministic interactions.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("sortable paginated table retains native semantics, announced ranges and keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  const table = page.getByRole("table", {
    name: "Keyboard contracts by component",
  });
  const sort = table.getByRole("button", {
    name: "Sort by Component ascending",
  });
  await sort.focus();
  await page.keyboard.press("Enter");
  await expect(
    table.getByRole("button", { name: "Sort by Component descending" }),
  ).toBeFocused();
  await expect(table.getByRole("columnheader").first()).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await expect(table.locator("tbody tr").first()).toContainText("Combobox");
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(table.locator("caption")).toBeFocused();
  await expect(table.locator("tbody tr")).toHaveCount(1);
  await expect(table.locator("tbody")).toContainText("Tabs");
  await expect(
    page.getByRole("status").filter({ hasText: "Rows 3–3 of 3" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Next page" })).toBeDisabled();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Direction: LTR" }).click();
  await page.getByRole("button", { name: "Previous page" }).click();
  await expect(table.locator("caption")).toBeFocused();
  await expect(table.locator("tbody tr")).toHaveCount(2);
});

test("catalog supports keyboard navigation and a native modal lifecycle", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open preferences" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Component preferences" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Component preferences" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open preferences" }),
  ).toBeFocused();

  const semantics = page.getByRole("tab", { name: "Semantics" });
  await semantics.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Focus" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("catalog has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("theme, density, direction, and reduced motion remain operable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Theme: light" }).click();
  await page.getByRole("button", { name: "Density: comfortable" }).click();
  await page.getByRole("button", { name: "Direction: LTR" }).click();
  const application = page.locator("[data-theme]");
  await expect(application).toHaveAttribute("data-theme", "dark");
  await expect(application).toHaveAttribute("data-density", "compact");
  await expect(application).toHaveAttribute("dir", "rtl");
  const transitionDuration = await page
    .getByRole("button", { name: "Theme: dark" })
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).transitionDuration),
    );
  expect(transitionDuration).toBeGreaterThan(0);
  expect(transitionDuration).toBeLessThanOrEqual(0.00001);
});

test("vanilla example opens and closes without React", async ({ page }) => {
  await page.goto("/vanilla.html");
  await page.getByRole("button", { name: "Review settings" }).click();
  await expect(
    page.getByRole("dialog", { name: "Review settings" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Settings dialog closed.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review settings" }),
  ).toBeFocused();
});
