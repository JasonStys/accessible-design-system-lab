/**
 * File: index.ts
 * Purpose: Define the public, tree-shakeable component and type export surface.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: exports are intentionally explicit to prevent accidental package API growth.
 */
import "./styles/tokens.css";
import "./styles/components.css";

export { Button, type ButtonProps } from "./components/Button";
export {
  Combobox,
  type ComboboxOption,
  type ComboboxProps,
} from "./components/Combobox";
export {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
  type DataTableRow,
} from "./components/DataTable";
export { Dialog, type DialogProps } from "./components/Dialog";
export { Tabs, type TabItem, type TabsProps } from "./components/Tabs";
export { TextField, type TextFieldProps } from "./components/TextField";
export {
  ToastRegion,
  type ToastMessage,
  type ToastRegionProps,
} from "./components/ToastRegion";
