/**
 * File: table-data.test.ts
 * Author: Jason Stys
 * Purpose: Independently expected stable sort/null/mixed-key results and immutable input oracles.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: IDs expose ties, while display values are deliberately unrelated to sort keys.
 */
import { expect, test } from "vitest";
import { sortedRows } from "./table-data";

test("numeric keys, ties and all missing/nonfinite keys have deterministic order", () => {
  const rows = [
    { id: "ten", sortValues: { key: 10 } },
    { id: "first-two", sortValues: { key: 2 } },
    { id: "missing" },
    { id: "second-two", sortValues: { key: 2 } },
    { id: "null", sortValues: { key: null } },
    { id: "nan", sortValues: { key: NaN } },
    { id: "infinite", sortValues: { key: Infinity } },
  ];
  const before = [...rows];
  expect(sortedRows(rows, "key", "ascending").map((row) => row.id)).toEqual([
    "first-two",
    "second-two",
    "ten",
    "missing",
    "null",
    "nan",
    "infinite",
  ]);
  expect(sortedRows(rows, "key", "descending").map((row) => row.id)).toEqual([
    "ten",
    "first-two",
    "second-two",
    "missing",
    "null",
    "nan",
    "infinite",
  ]);
  expect(sortedRows(rows, null, "ascending")).toEqual(rows);
  expect(sortedRows(rows, null, "ascending")).not.toBe(rows);
  expect(rows).toEqual(before);
});

test("mixed primitive types are ordered without coercing or parsing rendered content", () => {
  const rows = [
    { id: "string", sortValues: { key: "2" } },
    { id: "zero", sortValues: { key: 0 } },
    { id: "empty", sortValues: { key: "" } },
    { id: "a", sortValues: { key: "A" } },
    { id: "b", sortValues: { key: "B" } },
  ];
  expect(sortedRows(rows, "key", "ascending").map((row) => row.id)).toEqual([
    "zero",
    "empty",
    "string",
    "a",
    "b",
  ]);
  expect(sortedRows(rows, "key", "descending").map((row) => row.id)).toEqual([
    "b",
    "a",
    "string",
    "empty",
    "zero",
  ]);
  expect(sortedRows([], "key", "ascending")).toEqual([]);
});
