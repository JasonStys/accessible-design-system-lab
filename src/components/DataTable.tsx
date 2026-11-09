/**
 * File: DataTable.tsx
 * Author: Jason Stys
 * Purpose: Preserve native table navigation and relationships while styling structured comparison data.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: columns determines stable header and cell ordering.
 */
import { useRef, useState, type ReactNode } from "react";
import { sortedRows, type SortValue } from "./table-data";

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface DataTableRow {
  id: string;
  values: Readonly<Record<string, ReactNode>>;
  sortValues?: Readonly<Record<string, SortValue>>;
}

export interface DataTableProps {
  caption: string;
  columns: readonly DataTableColumn[];
  rows: readonly DataTableRow[];
  pageSize?: number;
  state?: "ready" | "loading" | "error";
  message?: string;
}

/** Render comparison data with a visible caption and scoped column headers. */
export function DataTable({
  caption,
  columns,
  rows,
  pageSize,
  state = "ready",
  message,
}: DataTableProps) {
  const [sort, setSort] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [requestedPage, setPage] = useState(0);
  const captionRef = useRef<HTMLTableCaptionElement>(null);
  if (
    !columns.length ||
    new Set(columns.map((column) => column.key)).size !== columns.length ||
    new Set(rows.map((row) => row.id)).size !== rows.length
  )
    throw new Error(
      "DataTable requires at least one unique column key and unique row IDs",
    );
  if (
    pageSize !== undefined &&
    (!Number.isSafeInteger(pageSize) || pageSize < 1)
  )
    throw new Error("DataTable pageSize must be a positive safe integer");
  const active =
    sort && columns.some((column) => column.key === sort.key && column.sortable)
      ? sort
      : null;
  const ordered = sortedRows(
    rows,
    active?.key ?? null,
    active?.direction ?? "ascending",
  );
  const size = pageSize ?? Math.max(1, rows.length);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const page = Math.min(requestedPage, pages - 1);
  const visible = ordered.slice(page * size, (page + 1) * size);
  const announcement =
    state === "loading"
      ? (message ?? "Loading table data.")
      : state === "error"
        ? (message ?? "Table data could not be loaded.")
        : rows.length === 0
          ? (message ?? "No matching rows.")
          : `Rows ${String(page * size + 1)}–${String(Math.min((page + 1) * size, rows.length))} of ${String(rows.length)}.${active ? ` Sorted by ${columns.find((column) => column.key === active.key)?.label ?? active.key}, ${active.direction}.` : " Original row order."}`;

  /** Move focus to the persistent caption after paging so a disabled page button cannot lose keyboard focus. */
  function goToPage(next: number) {
    setPage(next);
    captionRef.current?.focus();
  }
  return (
    <>
      <p role={state === "error" ? "alert" : "status"}>{announcement}</p>
      <div className="ds-table-scroll" tabIndex={0}>
        <table className="ds-table">
          <caption
            ref={captionRef}
            tabIndex={pageSize === undefined ? undefined : -1}
          >
            {caption}
          </caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    active?.key === column.key ? active.direction : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="ds-button ds-button--secondary"
                      disabled={state !== "ready" || rows.length === 0}
                      aria-label={`Sort by ${column.label} ${active?.key === column.key && active.direction === "ascending" ? "descending" : "ascending"}`}
                      onClick={() => {
                        setSort({
                          key: column.key,
                          direction:
                            active?.key === column.key &&
                            active.direction === "ascending"
                              ? "descending"
                              : "ascending",
                        });
                        setPage(0);
                      }}
                    >
                      {column.label}
                      {active?.key === column.key
                        ? active.direction === "ascending"
                          ? " ↑"
                          : " ↓"
                        : ""}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state === "ready" &&
              visible.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td key={column.key}>{row.values[column.key]}</td>
                  ))}
                </tr>
              ))}
            {(state !== "ready" || rows.length === 0) && (
              <tr>
                <td colSpan={columns.length}>
                  {state === "ready"
                    ? "No rows to display."
                    : state === "loading"
                      ? "Loading…"
                      : "Data unavailable."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pageSize !== undefined && (
        <nav aria-label={`${caption} pages`}>
          <button
            type="button"
            className="ds-button ds-button--secondary"
            disabled={state !== "ready" || page === 0}
            onClick={() => goToPage(page - 1)}
          >
            Previous page
          </button>
          <span>
            {" "}
            Page {page + 1} of {pages}{" "}
          </span>
          <button
            type="button"
            className="ds-button ds-button--secondary"
            disabled={state !== "ready" || page + 1 >= pages}
            onClick={() => goToPage(page + 1)}
          >
            Next page
          </button>
        </nav>
      )}
    </>
  );
}
