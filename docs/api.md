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
