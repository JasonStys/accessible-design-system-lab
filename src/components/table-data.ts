/**
 * File: table-data.ts
 * Author: Jason Stys
 * Purpose: Sort explicit primitive keys stably, independently of rendered React cell content.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: missing keys and nonfinite numbers always sort last; ordinal preserves ties.
 */
export type SortValue = string | number | null;
export interface SortableRow {
  id: string;
  sortValues?: Readonly<Record<string, SortValue>>;
}

/** Compare deterministic code-unit strings/numbers; numbers precede strings, with missing values last. */
function comparison(
  left: Exclude<SortValue, null>,
  right: Exclude<SortValue, null>,
): number {
  if (typeof left !== typeof right) return typeof left === "number" ? -1 : 1;
  return left < right ? -1 : left > right ? 1 : 0;
}

/** O(rows log rows) time/O(rows) memory; never mutate input or infer keys from rendered elements. */
export function sortedRows<T extends SortableRow>(
  rows: readonly T[],
  key: string | null,
  direction: "ascending" | "descending",
): T[] {
  if (key === null) return [...rows];
  return rows
    .map((row, ordinal) => ({ row, ordinal }))
    .sort((left, right) => {
      let a = left.row.sortValues?.[key] ?? null;
      let b = right.row.sortValues?.[key] ?? null;
      if (typeof a === "number" && !Number.isFinite(a)) a = null;
      if (typeof b === "number" && !Number.isFinite(b)) b = null;
      if (a === null) return b === null ? left.ordinal - right.ordinal : 1;
      if (b === null) return -1;
      const order = comparison(a, b);
      return (
        (direction === "ascending" ? order : -order) ||
        left.ordinal - right.ordinal
      );
    })
    .map(({ row }) => row);
}
