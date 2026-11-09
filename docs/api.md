# Component API

All runtime exports are available from `accessible-design-system-lab`; styles are opt-in through
`accessible-design-system-lab/styles.css`.

## Button

Extends native button attributes. `variant` accepts `primary`, `secondary`, or `danger`. `busy`
announces `aria-busy`, disables activation, and renders a decorative spinner.

## TextField

Extends native input attributes except `id`, which remains optional. `label` is required;
`description` and `error` are connected through `aria-describedby`. `error` sets
`aria-invalid=true` and uses an alert role.

## Dialog

Controlled by `open` and `onOpenChange`. `title` provides the accessible name; optional
`description` supplies a concise description. Children render in the content area. The component
uses native `showModal`, handles Escape, and restores focus.

## Tabs

Requires an accessible label and an ordered `items` collection of `{ id, label, panel }`.
`defaultValue` selects the initial ID. Item IDs must be unique and stable.

## Combobox

Accepts a visible `label`, ordered `{ label, value }` options, and optional `onValueChange`. It is a
small local-data combobox; remote lookup, multi-select, and virtualization are deliberately outside
version-one scope.

## ToastRegion

Accepts ordered toast messages and `onDismiss(id)`. Messages may use `info`, `success`, or
`warning` presentation. The polite live region never auto-dismisses content, avoiding timing and
pause-control problems.

## DataTable

Accepts a visible caption, stable columns, and rows keyed by ID. Cells are read from each row's
`values` record in column order. Consumer code owns domain formatting and row-header decisions.

Columns may declare `sortable: true`; each row then supplies the corresponding
`sortValues` primitive key independently of its rendered React cell. This prevents
lexical sorting of formatted numbers such as “12 milliseconds” before “3 milliseconds”.
Numbers and deterministic code-unit strings are supported; missing/null/nonfinite
keys sort last in both directions. Equal keys retain incoming row order. Ascending
mixed types put numbers before strings; descending reverses that type order.
Consumers own locale-specific collation/ranks and meaningful domain keys.

`pageSize` is an optional positive safe integer. Paging announces the shown range,
clamps a requested page when rows shrink and focuses the persistent caption after
page navigation. Sorting resets to page1 and keeps focus on the header button.
`aria-sort` appears only on the effective sorted column; removing that column
restores incoming row order. Requested-page intent may become available again if
rows subsequently grow. Unique row IDs/column keys and at least one column are
required; invalid component configuration throws a developer contract error.

`state="loading"` and `state="error"` suppress stale rows and disable sorting/paging.
An optional plain-text `message` customizes the loading/error/empty announcement;
errors use an alert, other results use a polite status. The default is `ready`.
Data fetching/filtering/retry and authentication remain consumer responsibilities.

```tsx
<DataTable
  caption="Synthetic service checks"
  columns={[{ key: "latency", label: "Latency", sortable: true }]}
  rows={[
    { id: "alpha", values: { latency: "12 ms" }, sortValues: { latency: 12 } },
    {
      id: "beta",
      values: { latency: "Unknown" },
      sortValues: { latency: null },
    },
  ]}
  pageSize={10}
/>
```
