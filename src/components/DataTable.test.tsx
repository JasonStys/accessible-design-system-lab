/**
 * File: DataTable.test.tsx
 * Author: Jason Stys
 * Purpose: Verify real component keyboard sorting, pagination focus, prop changes and data states.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: rows and columns distinguish rendered content from explicit numeric keys.
 */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { DataTable } from "./DataTable";

const columns = [
  { key: "name", label: "Service", sortable: true },
  { key: "latency", label: "Latency", sortable: true },
  { key: "note", label: "Note" },
] as const;
const rows = [
  {
    id: "z",
    values: { name: <strong>Zeta</strong>, latency: "12 milliseconds" },
    sortValues: { name: "Zeta", latency: 12 },
  },
  {
    id: "a",
    values: { name: "Alpha", latency: "3 milliseconds" },
    sortValues: { name: "Alpha", latency: 3 },
  },
  {
    id: "b",
    values: { name: "Beta", latency: "Unknown" },
    sortValues: { name: "Beta", latency: null },
  },
] as const;

test("native header buttons sort explicit keys, reset page and announce exact ranges", async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      caption="Service health"
      columns={columns}
      rows={rows}
      pageSize={2}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(screen.getByText("Service health")).toHaveFocus();
  expect(screen.getByRole("status")).toHaveTextContent("Rows 3–3 of 3");
  expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  const sort = screen.getByRole("button", {
    name: "Sort by Latency ascending",
  });
  sort.focus();
  await user.keyboard("{Enter}");
  expect(sort).toHaveFocus();
  expect(screen.getByRole("status")).toHaveTextContent(
    "Rows 1–2 of 3. Sorted by Latency, ascending",
  );
  expect(sort.closest("th")).toHaveAttribute("aria-sort", "ascending");
  expect(screen.getAllByRole("row")[1]).toHaveTextContent("Alpha");
  expect(
    screen.queryByRole("cell", { name: "Unknown" }),
  ).not.toBeInTheDocument();
  await user.click(sort);
  expect(sort.closest("th")).toHaveAttribute("aria-sort", "descending");
  expect(screen.getAllByRole("row")[1]).toHaveTextContent("Zeta");
  await user.click(
    screen.getByRole("button", { name: "Sort by Service ascending" }),
  );
  expect(sort.closest("th")).not.toHaveAttribute("aria-sort");
  expect(screen.getAllByRole("row")[1]).toHaveTextContent("Alpha");
  await user.click(screen.getByRole("button", { name: "Next page" }));
  await user.click(screen.getByRole("button", { name: "Previous page" }));
  expect(screen.getByText("Service health")).toHaveFocus();
});

test("empty/loading/error and shrinking datasets never leave phantom rows or enabled actions", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <DataTable caption="Evidence" columns={columns} rows={rows} pageSize={1} />,
  );
  await user.click(screen.getByRole("button", { name: "Next page" }));
  await user.click(screen.getByRole("button", { name: "Next page" }));
  rerender(
    <DataTable
      caption="Evidence"
      columns={columns}
      rows={rows.slice(0, 1)}
      pageSize={1}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Rows 1–1 of 1");
  rerender(
    <DataTable caption="Evidence" columns={columns} rows={[]} pageSize={1} />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("No matching rows");
  expect(
    screen.getByRole("button", { name: "Sort by Service ascending" }),
  ).toBeDisabled();
  rerender(
    <DataTable
      caption="Evidence"
      columns={columns}
      rows={rows}
      state="loading"
      message="Loading synthetic evidence"
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Loading synthetic evidence",
  );
  expect(screen.queryByRole("cell", { name: "Alpha" })).not.toBeInTheDocument();
  rerender(
    <DataTable
      caption="Evidence"
      columns={columns}
      rows={rows}
      state="error"
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("could not be loaded");
  expect(within(screen.getByRole("table")).getByRole("cell")).toHaveTextContent(
    "Data unavailable",
  );
  rerender(
    <DataTable
      caption="Evidence"
      columns={columns}
      rows={rows}
      state="loading"
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Loading table data");
});

test.each([0, -1, 1.5, NaN, Infinity])(
  "invalid page size %s fails as a developer contract error",
  (pageSize) => {
    expect(() =>
      render(
        <DataTable
          caption="Contract"
          columns={columns}
          rows={rows}
          pageSize={pageSize}
        />,
      ),
    ).toThrow("pageSize");
  },
);
test("removing a sorted column clears its effective sort rather than claiming an invisible order", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <DataTable caption="Changing schema" columns={columns} rows={rows} />,
  );
  await user.click(
    screen.getByRole("button", { name: "Sort by Latency ascending" }),
  );
  expect(screen.getAllByRole("row")[1]).toHaveTextContent("Alpha");
  rerender(
    <DataTable caption="Changing schema" columns={[columns[0]]} rows={rows} />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("Original row order");
  expect(screen.getAllByRole("row")[1]).toHaveTextContent("Zeta");
  expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
});

test("ambiguous column keys, empty columns and duplicate row identities are rejected", () => {
  expect(() =>
    render(<DataTable caption="Contract" columns={[]} rows={rows} />),
  ).toThrow("unique");
  expect(() =>
    render(
      <DataTable
        caption="Contract"
        columns={[columns[0], columns[0]]}
        rows={rows}
      />,
    ),
  ).toThrow("unique");
  expect(() =>
    render(
      <DataTable
        caption="Contract"
        columns={columns}
        rows={[rows[0], rows[0]]}
      />,
    ),
  ).toThrow("unique");
});
