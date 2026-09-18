/**
 * File: App.tsx
 * Purpose: Provide an interactive catalog that demonstrates themes, density, direction, and component contracts.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: theme, density, direction, dialogOpen, and toasts drive isolated demo state.
 */
import { useState } from "react";
import {
  Button,
  Combobox,
  DataTable,
  Dialog,
  Tabs,
  TextField,
  ToastRegion,
  type ToastMessage,
} from "./index";
import "./styles/demo.css";

const roleOptions = [
  { label: "Frontend engineer", value: "frontend" },
  { label: "Full-stack engineer", value: "full-stack" },
  { label: "Design systems engineer", value: "design-systems" },
  { label: "Accessibility specialist", value: "accessibility" },
] as const;

const interactionRows = [
  {
    id: "dialog",
    values: {
      component: "Dialog",
      keys: "Tab, Shift+Tab, Escape",
      behavior: "Native modal focus containment",
    },
  },
  {
    id: "tabs",
    values: {
      component: "Tabs",
      keys: "Arrows, Home, End",
      behavior: "Roving tab stop with automatic activation",
    },
  },
  {
    id: "combobox",
    values: {
      component: "Combobox",
      keys: "Arrows, Enter, Escape",
      behavior: "Filtered listbox selection",
    },
  },
] as const;

/** Render the complete catalog and its theme/direction controls. */
export function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">(
    "comfortable",
  );
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([
    { id: "initial", message: "Component checks are ready.", tone: "success" },
  ]);

  /** Add a stable live-region message for the selected role. */
  function announceSelection(value: string) {
    setToasts((current) => [
      ...current,
      {
        id: `${value}-${String(current.length)}`,
        message: `Selected ${value}.`,
        tone: "info",
      },
    ]);
  }

  return (
    <div data-density={density} data-theme={theme} dir={direction}>
      <main className="demo-shell" id="main-content">
        <header className="demo-hero">
          <div>
            <span className="demo-eyebrow">
              Native-first component engineering
            </span>
            <h1 className="demo-title">Accessible Design System Lab</h1>
            <p className="demo-summary">
              Tested React components, durable CSS tokens, semantic HTML, and a
              framework-independent example—with exact limits documented.
            </p>
            <p>
              <a href="/vanilla.html">
                Open the vanilla JavaScript interoperability example
              </a>
            </p>
          </div>
          <aside className="demo-evidence" aria-label="Verification summary">
            <strong>90%+</strong>
            <span>line and function coverage budget</span>
            <hr />
            <strong>2</strong>
            <span>responsive browser profiles</span>
          </aside>
        </header>

        <section aria-label="Display controls" className="demo-toolbar">
          <Button
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
            variant="secondary"
          >
            Theme: {theme}
          </Button>
          <Button
            onClick={() =>
              setDensity((current) =>
                current === "comfortable" ? "compact" : "comfortable",
              )
            }
            variant="secondary"
          >
            Density: {density}
          </Button>
          <Button
            onClick={() =>
              setDirection((current) => (current === "ltr" ? "rtl" : "ltr"))
            }
            variant="secondary"
          >
            Direction: {direction.toUpperCase()}
          </Button>
        </section>

        <div className="demo-grid">
          <section className="demo-specimen">
            <h2>Buttons and dialog</h2>
            <p>Native buttons retain browser keyboard and disabled behavior.</p>
            <div className="demo-stack">
              <Button onClick={() => setDialogOpen(true)}>
                Open preferences
              </Button>
              <Button variant="secondary">Secondary action</Button>
              <Button variant="danger">Destructive action</Button>
            </div>
            <Dialog
              description="Update the demonstration profile without leaving the catalog."
              onOpenChange={setDialogOpen}
              open={dialogOpen}
              title="Component preferences"
            >
              <TextField
                description="This example never sends data."
                label="Display name"
                placeholder="Jordan"
              />
            </Dialog>
          </section>

          <section className="demo-specimen">
            <h2>Form field and combobox</h2>
            <div className="demo-stack" style={{ display: "grid" }}>
              <TextField
                description="Use a work address only for this synthetic example."
                label="Email address"
                placeholder="name@example.test"
                type="email"
              />
              <Combobox
                label="Target role"
                onValueChange={announceSelection}
                options={roleOptions}
              />
            </div>
          </section>

          <section className="demo-specimen demo-full-width">
            <h2>Keyboard-oriented tabs</h2>
            <Tabs
              aria-label="Component engineering topics"
              items={[
                {
                  id: "semantics",
                  label: "Semantics",
                  panel: (
                    <p>
                      Native elements establish the baseline interaction
                      contract.
                    </p>
                  ),
                },
                {
                  id: "focus",
                  label: "Focus",
                  panel: (
                    <p>
                      Visible focus and deterministic return paths are tested.
                    </p>
                  ),
                },
                {
                  id: "motion",
                  label: "Motion",
                  panel: (
                    <p>
                      Reduced-motion preferences collapse decorative
                      transitions.
                    </p>
                  ),
                },
              ]}
            />
          </section>

          <section className="demo-specimen demo-full-width">
            <h2>Interaction reference</h2>
            <DataTable
              caption="Keyboard contracts by component"
              columns={[
                { key: "component", label: "Component" },
                { key: "keys", label: "Keys" },
                { key: "behavior", label: "Behavior" },
              ]}
              rows={interactionRows}
            />
          </section>

          <section className="demo-specimen demo-full-width">
            <h2>Status messages</h2>
            <ToastRegion
              onDismiss={(id) =>
                setToasts((current) =>
                  current.filter((toast) => toast.id !== id),
                )
              }
              toasts={toasts}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
