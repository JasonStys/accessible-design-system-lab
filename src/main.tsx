/**
 * File: main.tsx
 * Purpose: Mount the catalog into the semantic document root with React strict-mode checks.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: rootElement is the required application mount point.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/tokens.css";
import "./styles/components.css";

const rootElement = document.querySelector<HTMLElement>("#root");
if (!rootElement) throw new Error("Missing #root application mount point");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
