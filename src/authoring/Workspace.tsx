/**
 * File: Workspace.tsx
 * Author: Jason Stys
 * Purpose: Author, validate, preview, reorder, save/import and export actual public-library blueprints.
 * Symbols/variables and exact lines: docs/code-index.md. Draft text and applied preview are deliberately separate.
 * Boundary: preview actions are local UI only; native storage is exposed through a narrow owned-window bridge.
 */
import { useState, type CSSProperties } from "react";
import { Button, Combobox, DataTable, Dialog, Tabs, TextField } from "../index";
import {
  cssSource,
  buttonContrast,
  paletteBlock,
  parseProject,
  preparedProject,
  reactSource,
  type Block,
  type DesignProject,
} from "./project";
import "./workspace.css";

interface SavedDesign {
  revision: string;
  project: DesignProject | null;
}
interface NativeDesign {
  load: () => Promise<SavedDesign>;
  save: (request: {
    revision: string;
    serialized: string;
  }) => Promise<SavedDesign>;
  importProject: () => Promise<string | null>;
  exportFile: (request: {
    kind: "project" | "react" | "css";
    serialized: string;
  }) => Promise<boolean>;
  quit: () => Promise<void>;
}
declare global {
  interface Window {
    designStudio?: NativeDesign;
  }
}
const palette: Block["kind"][] = [
  "text",
  "field",
  "button",
  "choice",
  "table",
  "tabs",
  "dialog",
];

/** Use real exported components for every block; keys remount changed interactive content intentionally. */
function BlockPreview({ block }: { block: Block }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  switch (block.kind) {
    case "text":
      return (
        <section>
          <h3>{block.title}</h3>
          <p>{block.body}</p>
        </section>
      );
    case "field":
      return (
        <TextField
          label={block.label}
          description={block.help}
          type={block.type}
          required={block.required}
        />
      );
    case "button":
      return (
        <div>
          <Button
            variant={block.variant}
            onClick={() =>
              setMessage(`${block.label} activated (preview only).`)
            }
          >
            {block.label}
          </Button>
          <p role="status">{message}</p>
        </div>
      );
    case "choice":
      return <Combobox label={block.label} options={block.options} />;
    case "table":
      return (
        <DataTable
          caption={block.caption}
          columns={block.columns.map((column) => ({
            ...column,
            sortable: true,
          }))}
          rows={block.rows.map((row) => ({ ...row, sortValues: row.values }))}
          pageSize={block.pageSize}
        />
      );
    case "tabs":
      return (
        <Tabs
          aria-label={block.label}
          items={block.items.map((item) => ({
            id: item.id,
            label: item.label,
            panel: item.text,
          }))}
        />
      );
    case "dialog":
      return (
        <section>
          <Button onClick={() => setOpen(true)}>{block.trigger}</Button>
          <Dialog
            title={block.title}
            description={block.description}
            open={open}
            onOpenChange={setOpen}
          >
            <p>
              This is a functional preview, without account or server changes.
            </p>
          </Dialog>
        </section>
      );
  }
}

/** Keep the complete original catalog alongside a practical editable blueprint workflow. */
export function Workspace() {
  const initial = preparedProject();
  const [applied, setApplied] = useState(initial);
  const [draft, setDraft] = useState(JSON.stringify(initial, null, 2));
  const [selected, setSelected] = useState(initial.blocks[0]?.id ?? "");
  const [blockText, setBlockText] = useState<string | null>(null);
  const [revision, setRevision] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(
    "Prepared input is editable and unsaved. Apply before saving or exporting.",
  );
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const native = window.designStudio;
  const selectedBlock = applied.blocks.find((item) => item.id === selected);
  const selectedSource = selectedBlock
    ? JSON.stringify(selectedBlock, null, 2)
    : "";
  const blockDirty = blockText !== null && blockText !== selectedSource;
  const dirty = draft !== JSON.stringify(applied, null, 2) || blockDirty;
  const contrast = buttonContrast(applied.appearance.accent);

  /** Apply only a fully valid complete document; invalid input retains the previous good preview. */
  function apply(serialized = draft, acceptBlock = false) {
    if (blockDirty && !acceptBlock)
      throw new Error(
        "Apply or explicitly discard the selected block edits before another design operation.",
      );
    const next = parseProject(serialized);
    setApplied(next);
    setDraft(JSON.stringify(next, null, 2));
    setError("");
    setSelected(
      next.blocks.some((item) => item.id === selected)
        ? selected
        : (next.blocks[0]?.id ?? ""),
    );
    setBlockText(null);
    setStatus(
      "Preview applied. Save explicitly to replace the current local project.",
    );
    return next;
  }
  /** Report authored failures without losing edited input, last good preview or durable state. */
  function guarded(action: () => void) {
    try {
      action();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Design operation failed.",
      );
    }
  }
  async function task(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Native design operation failed.",
      );
    } finally {
      setBusy(false);
    }
  }
  /** Work on a validated current draft so palette/reorder actions never silently discard pending JSON edits. */
  function change(
    changeProject: (project: DesignProject) => void,
    acceptBlock = false,
  ) {
    if (blockDirty && !acceptBlock)
      throw new Error(
        "Apply or explicitly discard the selected block edits first.",
      );
    const current = parseProject(draft);
    changeProject(current);
    apply(JSON.stringify(current), acceptBlock);
  }
  /** Use a browser download only for the in-memory website; native uses explicit new-file dialogs. */
  async function exportFile(kind: "project" | "react" | "css") {
    if (dirty) throw new Error("Apply the current draft before exporting.");
    const serialized = JSON.stringify(applied, null, 2);
    if (native) {
      const saved = await native.exportFile({ kind, serialized });
      setStatus(
        saved ? "New export file saved." : "Export canceled; nothing changed.",
      );
      return;
    }
    const content =
      kind === "react"
        ? reactSource(applied)
        : kind === "css"
          ? cssSource(applied)
          : serialized;
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download =
      kind === "react"
        ? "Blueprint.tsx"
        : kind === "css"
          ? "blueprint.css"
          : "blueprint.json";
    link.click();
    URL.revokeObjectURL(url);
    setStatus(
      "Export prepared by the browser. Keep TSX and CSS together for your reviewed React project.",
    );
  }
  return (
    <section
      className="authoring-workspace"
      aria-labelledby="authoring-heading"
    >
      <header className="authoring-heading">
        <div>
          <p className="demo-eyebrow">
            Real component authoring · by Jason Stys
          </p>
          <h2 id="authoring-heading">Blueprint workspace</h2>
          <p>
            Create a bounded component layout, test real interactions and export
            editable React/CSS. The original component catalog remains below.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setHelp(true)}>
          Workspace help
        </Button>
      </header>
      <div className="authoring-actions">
        <label>
          Prepared input
          <select
            aria-label="Prepared input"
            disabled={busy}
            defaultValue=""
            onChange={(event) => {
              const name = event.target.value;
              if (
                name === "service" ||
                name === "operations" ||
                name === "preferences"
              ) {
                guarded(() => {
                  apply(JSON.stringify(preparedProject(name)));
                  setStatus(
                    "Prepared input loaded into the unsaved editor; no durable state changed.",
                  );
                });
              }
              event.target.value = "";
            }}
          >
            <option value="" disabled>
              Choose a realistic blueprint
            </option>
            <option value="service">Service intake</option>
            <option value="operations">Operations review</option>
            <option value="preferences">Preferences and modal</option>
          </select>
        </label>
        <Button
          disabled={busy || !native}
          variant="secondary"
          onClick={() =>
            void task(async () => {
              if (!native) return;
              if (dirty)
                throw new Error(
                  "Apply or explicitly replace your edited draft before loading.",
                );
              const saved = await native.load();
              setRevision(saved.revision);
              setLoaded(true);
              if (saved.project) apply(JSON.stringify(saved.project));
              setStatus(
                saved.project
                  ? "Saved local project loaded."
                  : "No saved project yet; this profile is ready for an explicit Save.",
              );
            })
          }
        >
          Load saved project
        </Button>
        <Button
          disabled={busy || !native || !loaded || dirty}
          onClick={() =>
            void task(async () => {
              if (!native) return;
              const saved = await native.save({
                revision,
                serialized: JSON.stringify(applied),
              });
              setRevision(saved.revision);
              setStatus(
                "Current project saved locally. Your prior complete revision remains as the bounded previous file.",
              );
            })
          }
        >
          Save project
        </Button>
        <Button
          disabled={busy || !native}
          variant="secondary"
          onClick={() =>
            void task(async () => {
              if (!native) return;
              const value = await native.importProject();
              if (value !== null) {
                apply(value);
                setStatus(
                  "Validated import is in the editor; Save remains explicit.",
                );
              } else setStatus("Import canceled; editor unchanged.");
            })
          }
        >
          Import project file
        </Button>
        {(["project", "react", "css"] as const).map((kind) => (
          <Button
            key={kind}
            disabled={busy || dirty}
            variant="secondary"
            onClick={() => void task(() => exportFile(kind))}
          >
            Export {kind === "react" ? "React" : kind.toUpperCase()}
          </Button>
        ))}
        {native ? (
          <Button
            disabled={busy}
            variant="secondary"
            onClick={() =>
              void task(async () => {
                await native.quit();
              })
            }
          >
            Quit application
          </Button>
        ) : null}
      </div>
      <p role="status" aria-live="polite">
        {status}
      </p>
      {error ? (
        <p role="alert" className="authoring-error">
          {error}
        </p>
      ) : null}
      {!native ? (
        <p>
          Browser mode keeps this editor in memory. The downloadable application
          adds explicit private local project storage and file dialogs.
        </p>
      ) : (
        <p>
          One trusted OS-owner local profile. Load once before Save; exports
          contain your text and are plaintext. No account or network service is
          used.
        </p>
      )}
      <div className="authoring-grid">
        <section aria-labelledby="editor-heading">
          <h3 id="editor-heading">Design document</h3>
          <label>
            Blueprint JSON
            <textarea
              aria-label="Blueprint JSON"
              spellCheck={false}
              rows={22}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <Button disabled={busy} onClick={() => guarded(() => apply())}>
            Validate and apply preview
          </Button>
          <p>
            {dirty
              ? "Edited draft has not been applied. Save and export stay disabled."
              : `${String(applied.blocks.length)} /20 blocks. Current preview matches the validated draft.`}
          </p>
          <fieldset disabled={busy}>
            <legend>Add a real component</legend>
            <div className="authoring-actions">
              {palette.map((kind) => (
                <Button
                  variant="secondary"
                  key={kind}
                  onClick={() =>
                    guarded(() =>
                      change((project) => {
                        let count = 1;
                        while (
                          project.blocks.some(
                            (item) => item.id === `${kind}-${String(count)}`,
                          )
                        )
                          count++;
                        project.blocks.push(
                          paletteBlock(kind, `${kind}-${String(count)}`),
                        );
                      }),
                    )
                  }
                >
                  Add {kind}
                </Button>
              ))}
            </div>
          </fieldset>
          <label>
            Selected block
            <select
              aria-label="Selected block"
              value={selected}
              onChange={(event) => {
                if (blockDirty) {
                  setError(
                    "Apply or explicitly discard the selected block edits before switching selection.",
                  );
                  return;
                }
                setSelected(event.target.value);
                setBlockText(null);
              }}
            >
              <option value="">No selection</option>
              {applied.blocks.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} — {item.kind}
                </option>
              ))}
            </select>
          </label>
          <div className="authoring-actions">
            {([-1, 1] as const).map((offset) => (
              <Button
                key={offset}
                disabled={!selected || busy}
                variant="secondary"
                onClick={() =>
                  guarded(() =>
                    change((project) => {
                      const index = project.blocks.findIndex(
                          (item) => item.id === selected,
                        ),
                        target = index + offset;
                      if (
                        index < 0 ||
                        target < 0 ||
                        target >= project.blocks.length
                      )
                        return;
                      const removed = project.blocks.splice(index, 1)[0];
                      if (removed) project.blocks.splice(target, 0, removed);
                    }),
                  )
                }
              >
                Move {offset < 0 ? "up" : "down"}
              </Button>
            ))}
            <Button
              disabled={!selected || busy}
              variant="danger"
              onClick={() =>
                guarded(() =>
                  change((project) => {
                    project.blocks = project.blocks.filter(
                      (item) => item.id !== selected,
                    );
                  }),
                )
              }
            >
              Remove selected block
            </Button>
          </div>
          <label>
            Selected block JSON
            <textarea
              aria-label="Selected block JSON"
              rows={10}
              spellCheck={false}
              disabled={!selected}
              value={blockText ?? selectedSource}
              onChange={(event) => setBlockText(event.target.value)}
            />
          </label>
          <Button
            disabled={!selected || blockText === null || busy}
            onClick={() =>
              guarded(() =>
                change((project) => {
                  if (blockText === null)
                    throw new Error("Edit the selected block first.");
                  const value: unknown = JSON.parse(blockText),
                    index = project.blocks.findIndex(
                      (item) => item.id === selected,
                    );
                  if (index < 0) throw new Error("Select a current block.");
                  const candidate = {
                    ...project,
                    blocks: project.blocks.map((item, itemIndex) =>
                      itemIndex === index ? value : item,
                    ),
                  };
                  const next = parseProject(JSON.stringify(candidate));
                  project.blocks = next.blocks;
                }, true),
              )
            }
          >
            Apply selected block
          </Button>
          <Button
            disabled={blockText === null || busy}
            variant="secondary"
            onClick={() => {
              setBlockText(null);
              setError("");
              setStatus(
                "Selected block edits discarded; the applied preview and saved project are unchanged.",
              );
            }}
          >
            Discard selected edits
          </Button>
          {blockDirty ? (
            <p>
              Selected block edits are unapplied. Apply them or explicitly
              discard them before changing the design, saving or exporting.
            </p>
          ) : null}
        </section>
        <section aria-labelledby="preview-heading">
          <h3 id="preview-heading">Applied interactive preview</h3>
          <p>
            Button text contrast: {contrast.ratio.toFixed(2)}:1 against the
            chosen accent. Other states, text, focus and assistive technology
            still require review.
          </p>
          <div
            className="authoring-preview"
            data-theme={applied.appearance.theme}
            data-density={applied.appearance.density}
            dir={applied.appearance.direction}
            style={
              {
                "--ds-color-primary": applied.appearance.accent,
                "--ds-color-primary-hover": applied.appearance.accent,
                "--ds-color-primary-contrast": contrast.foreground,
              } as CSSProperties
            }
          >
            <h2>{applied.title}</h2>
            <p>{applied.description}</p>
            {applied.blocks.map((item) => (
              <BlockPreview block={item} key={JSON.stringify(item)} />
            ))}
            {!applied.blocks.length ? (
              <p>No blocks. Add a component to begin.</p>
            ) : null}
          </div>
          <details>
            <summary>Generated React source</summary>
            <pre className="authoring-source">{reactSource(applied)}</pre>
          </details>
          <details>
            <summary>Generated CSS</summary>
            <pre className="authoring-source">{cssSource(applied)}</pre>
          </details>
        </section>
      </div>
      <Dialog
        title="Using the blueprint workspace"
        description="Bounded authoring with real components and explicit private local storage."
        open={help}
        onOpenChange={setHelp}
      >
        <ol>
          <li>
            Choose prepared input or edit the complete JSON. At most20 blocks,6
            table columns,50 table rows and64KiB are accepted.
          </li>
          <li>
            Validate and apply. A rejected edit keeps your last good preview and
            saved file intact.
          </li>
          <li>
            Use the keyboard in the actual field, choice, table, tabs and native
            modal components. Buttons only announce preview activation.
          </li>
          <li>
            In the application, Load saved project once to obtain its current
            revision; Save is explicit and refuses stale revisions.
            Prepared/imported input does not overwrite it.
          </li>
          <li>
            Export JSON for later editing; export React and CSS together for a
            real React project with the library installed. Generated callbacks
            are safe preview actions, not business logic or a working account
            form.
          </li>
          <li>
            Quit waits for accepted local file work. A crashed/stale owner lock
            is preserved for manual review; never delete a lock belonging to a
            running instance.
          </li>
        </ol>
        <p>
          Created by Jason Stys · <span>github.com/JasonStys</span>. Automated
          contrast/axe checks are partial evidence, not accessibility
          certification.
        </p>
      </Dialog>
      <p>
        Accessible Design Studio 1.1.0 · Created by Jason Stys ·
        github.com/JasonStys
      </p>
    </section>
  );
}
