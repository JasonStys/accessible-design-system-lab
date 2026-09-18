/**
 * File: DataTable.tsx
 * Purpose: Preserve native table navigation and relationships while styling structured comparison data.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: columns determines stable header and cell ordering.
 */
import type { ReactNode } from "react";

export interface DataTableColumn {
  key: string;
  label: string;
}

export interface DataTableRow {
  id: string;
  values: Readonly<Record<string, ReactNode>>;
}

export interface DataTableProps {
  caption: string;
  columns: readonly DataTableColumn[];
  rows: readonly DataTableRow[];
}

/** Render comparison data with a visible caption and scoped column headers. */
export function DataTable({ caption, columns, rows }: DataTableProps) {
  return (
    <div className="ds-table-scroll" tabIndex={0}>
      <table className="ds-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>{row.values[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
