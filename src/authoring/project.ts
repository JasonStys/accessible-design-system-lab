/**
 * File: project.ts
 * Author: Jason Stys
 * Purpose: Validate bounded design blueprints and generate literal React/CSS exports without evaluation.
 * Symbols/variables and exact lines: docs/code-index.md. Project/block IDs are local document keys.
 * State: caller-owned values only; no storage, network, HTML parsing, code execution or credentials.
 */
export interface Choice {
  value: string;
  label: string;
}
export interface Column {
  key: string;
  label: string;
}
export type Block =
  | { id: string; kind: "text"; title: string; body: string }
  | {
      id: string;
      kind: "field";
      label: string;
      help: string;
      type: "text" | "email" | "number";
      required: boolean;
    }
  | {
      id: string;
      kind: "button";
      label: string;
      variant: "primary" | "secondary" | "danger";
    }
  | { id: string; kind: "choice"; label: string; options: Choice[] }
  | {
      id: string;
      kind: "table";
      caption: string;
      columns: Column[];
      rows: { id: string; values: Record<string, string> }[];
      pageSize: number;
    }
  | {
      id: string;
      kind: "tabs";
      label: string;
      items: { id: string; label: string; text: string }[];
    }
  | {
      id: string;
      kind: "dialog";
      title: string;
      description: string;
      trigger: string;
    };

export interface DesignProject {
  schema: 1;
  title: string;
  description: string;
  appearance: {
    theme: "light" | "dark";
    density: "comfortable" | "compact";
    direction: "ltr" | "rtl";
    accent: string;
  };
  blocks: Block[];
}
export const MAX_PROJECT_BYTES = 65_536;
const keyPattern = /^[a-z][a-z0-9-]{0,39}$/;
const encoder = new TextEncoder();

/** Refuse unknown/missing fields before reading a closed record; never merge untrusted properties. */
function record(
  value: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Expected a design object.");
  const result = value as Record<string, unknown>;
  if (Object.keys(result).sort().join("|") !== [...keys].sort().join("|"))
    throw new Error("Design fields do not match the documented schema.");
  return result;
}
/** Bound text independently of document size; preserve ordinary Unicode and line breaks. */
function text(value: unknown, max = 120, allowEmpty = false): string {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (!allowEmpty && !value.trim()) ||
    Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return (
        (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127
      );
    })
  )
    throw new Error(
      "Design text is empty, too long or contains control characters.",
    );
  return value;
}
/** Validate a stable local key and a closed enumeration. */
function key(value: unknown): string {
  if (typeof value !== "string" || !keyPattern.test(value))
    throw new Error(
      "IDs must start with a lowercase letter and use at most40 lowercase letters, digits or hyphens.",
    );
  return value;
}
function choice<T extends string>(value: unknown, values: readonly T[]): T {
  if (typeof value !== "string" || !values.includes(value as T))
    throw new Error("Unknown design option.");
  return value as T;
}
function list(value: unknown, max: number, empty = false): unknown[] {
  if (!Array.isArray(value) || value.length > max || (!empty && !value.length))
    throw new Error("Design list is empty or exceeds its bound.");
  return value;
}
function unique(values: string[]): void {
  if (new Set(values).size !== values.length)
    throw new Error("Repeated design IDs are not allowed.");
}

/** Parse one closed block into freshly constructed plain data; counts bound preview and code generation. */
function block(value: unknown): Block {
  if (!value || typeof value !== "object" || !("kind" in value))
    throw new Error("A block kind is required.");
  const kind = choice(value.kind, [
    "text",
    "field",
    "button",
    "choice",
    "table",
    "tabs",
    "dialog",
  ] as const);
  const fields = {
    text: ["title", "body"],
    field: ["label", "help", "type", "required"],
    button: ["label", "variant"],
    choice: ["label", "options"],
    table: ["caption", "columns", "rows", "pageSize"],
    tabs: ["label", "items"],
    dialog: ["title", "description", "trigger"],
  };
  const row = record(value, ["id", "kind", ...fields[kind]]);
  const id = key(row.id);
  switch (kind) {
    case "text":
      return {
        id,
        kind,
        title: text(row.title),
        body: text(row.body, 1000, true),
      };
    case "field": {
      if (typeof row.required !== "boolean")
        throw new Error("Field required must be a boolean.");
      return {
        id,
        kind,
        label: text(row.label),
        help: text(row.help, 400, true),
        type: choice(row.type, ["text", "email", "number"] as const),
        required: row.required,
      };
    }
    case "button":
      return {
        id,
        kind,
        label: text(row.label),
        variant: choice(row.variant, [
          "primary",
          "secondary",
          "danger",
        ] as const),
      };
    case "choice": {
      const options = list(row.options, 20).map((item) => {
        const option = record(item, ["value", "label"]);
        return { value: key(option.value), label: text(option.label) };
      });
      unique(options.map((item) => item.value));
      return { id, kind, label: text(row.label), options };
    }
    case "tabs": {
      const items = list(row.items, 6).map((item) => {
        const tab = record(item, ["id", "label", "text"]);
        return {
          id: key(tab.id),
          label: text(tab.label),
          text: text(tab.text, 1000, true),
        };
      });
      unique(items.map((item) => item.id));
      return { id, kind, label: text(row.label), items };
    }
    case "dialog":
      return {
        id,
        kind,
        title: text(row.title),
        description: text(row.description, 1000),
        trigger: text(row.trigger),
      };
    case "table": {
      const columns = list(row.columns, 6).map((item) => {
        const column = record(item, ["key", "label"]);
        return { key: key(column.key), label: text(column.label) };
      });
      unique(columns.map((item) => item.key));
      const rows = list(row.rows, 50, true).map((item) => {
        const tableRow = record(item, ["id", "values"]),
          values = record(
            tableRow.values,
            columns.map((item) => item.key),
          );
        return {
          id: key(tableRow.id),
          values: Object.fromEntries(
            columns.map((column) => [
              column.key,
              text(values[column.key], 300, true),
            ]),
          ),
        };
      });
      unique(rows.map((item) => item.id));
      if (
        !Number.isSafeInteger(row.pageSize) ||
        (row.pageSize as number) < 1 ||
        (row.pageSize as number) > 20
      )
        throw new Error("Table page size must be1..20.");
      return {
        id,
        kind,
        caption: text(row.caption),
        columns,
        rows,
        pageSize: row.pageSize as number,
      };
    }
  }
}

/** Accept at most64KiB and20 blocks. JSON strings are data; no callbacks/HTML/CSS/URLs are accepted. */
export function parseProject(serialized: string): DesignProject {
  if (encoder.encode(serialized).length > MAX_PROJECT_BYTES)
    throw new Error("Design project exceeds64KiB.");
  const data: unknown = JSON.parse(serialized),
    row = record(data, [
      "schema",
      "title",
      "description",
      "appearance",
      "blocks",
    ]);
  if (row.schema !== 1) throw new Error("Unsupported design project schema.");
  const appearance = record(row.appearance, [
    "theme",
    "density",
    "direction",
    "accent",
  ]);
  if (
    typeof appearance.accent !== "string" ||
    !/^#[0-9a-f]{6}$/i.test(appearance.accent)
  )
    throw new Error("Accent must be a six-digit hexadecimal color.");
  const blocks = list(row.blocks, 20, true).map(block);
  unique(blocks.map((item) => item.id));
  return {
    schema: 1,
    title: text(row.title, 80),
    description: text(row.description, 500, true),
    appearance: {
      theme: choice(appearance.theme, ["light", "dark"] as const),
      density: choice(appearance.density, ["comfortable", "compact"] as const),
      direction: choice(appearance.direction, ["ltr", "rtl"] as const),
      accent: appearance.accent,
    },
    blocks,
  };
}

/** Supply editable application data, not separate demo applications or pre-authorized stored state. */
export function preparedProject(
  name: "service" | "operations" | "preferences" = "service",
): DesignProject {
  const common: DesignProject = {
    schema: 1,
    title: "Service request",
    description:
      "A keyboard-friendly service intake blueprint. Values entered in its preview are never submitted.",
    appearance: {
      theme: "light",
      density: "comfortable",
      direction: "ltr",
      accent: "#1558d6",
    },
    blocks: [],
  };
  if (name === "service")
    common.blocks = [
      {
        id: "introduction",
        kind: "text",
        title: "Request equipment support",
        body: "Describe the affected equipment and select an urgency.",
      },
      {
        id: "contact",
        kind: "field",
        label: "Contact email",
        help: "Use a synthetic address while presenting this design.",
        type: "email",
        required: true,
      },
      {
        id: "priority",
        kind: "choice",
        label: "Urgency",
        options: [
          { value: "routine", label: "Routine — next business day" },
          { value: "urgent", label: "Urgent — review required" },
        ],
      },
      {
        id: "submit",
        kind: "button",
        label: "Preview request",
        variant: "primary",
      },
    ];
  if (name === "operations") {
    common.title = "Operations review";
    common.blocks = [
      {
        id: "shift",
        kind: "tabs",
        label: "Shift observations",
        items: [
          {
            id: "morning",
            label: "Morning",
            text: "Three inspections completed; one review remains.",
          },
          {
            id: "evening",
            label: "Evening",
            text: "Planned maintenance starts after equipment shutdown.",
          },
        ],
      },
      {
        id: "assets",
        kind: "table",
        caption: "Inspection queue",
        columns: [
          { key: "asset", label: "Asset" },
          { key: "status", label: "Status" },
        ],
        rows: [
          { id: "pump-a", values: { asset: "Pump A", status: "Needs review" } },
          { id: "panel-b", values: { asset: "Panel B", status: "Complete" } },
          { id: "fan-c", values: { asset: "Fan C", status: "Scheduled" } },
        ],
        pageSize: 2,
      },
    ];
  }
  if (name === "preferences") {
    common.title = "Account preferences";
    common.appearance.direction = "rtl";
    common.blocks = [
      {
        id: "name",
        kind: "field",
        label: "Display name",
        help: "Preview only; no account is created.",
        type: "text",
        required: false,
      },
      {
        id: "confirmation",
        kind: "dialog",
        title: "Review preferences",
        description:
          "This native modal demonstrates focus containment, Escape and focus return. It makes no account changes.",
        trigger: "Review changes",
      },
    ];
  }
  return common;
}

/** Create a validated palette block with an available stable ID. */
export function paletteBlock(kind: Block["kind"], id: string): Block {
  const samples = [
    ...preparedProject().blocks,
    ...preparedProject("operations").blocks,
    ...preparedProject("preferences").blocks,
  ];
  const sample = samples.find((item) => item.kind === kind);
  if (!sample) throw new Error("Unknown palette block.");
  return block({ ...sample, id });
}

/** Escape JavaScript literals including HTML-sensitive characters; no imported source is executed. */
function literal(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

/** Export working public-library React usage; buttons are explicitly non-submitting preview actions. */
export function reactSource(project: DesignProject): string {
  const validated = parseProject(JSON.stringify(project));
  const kinds = new Set(validated.blocks.map((item) => item.kind));
  const messageState = kinds.has("button") || kinds.has("choice");
  const dialogState = kinds.has("dialog");
  const imports = new Set<string>();
  for (const kind of kinds) {
    if (kind === "button" || kind === "dialog") imports.add("Button");
    if (kind === "field") imports.add("TextField");
    if (kind === "choice") imports.add("Combobox");
    if (kind === "table") imports.add("DataTable");
    if (kind === "tabs") imports.add("Tabs");
    if (kind === "dialog") imports.add("Dialog");
  }
  const declarations = [
    messageState ? '  const [message, setMessage] = useState("");' : "",
    dialogState
      ? "  const [dialog, setDialog] = useState<string | null>(null);"
      : "",
  ]
    .filter(Boolean)
    .join("\n");
  const children = validated.blocks.map((item) => {
    switch (item.kind) {
      case "text":
        return `<section><h2>{${literal(item.title)}}</h2><p>{${literal(item.body)}}</p></section>`;
      case "field":
        return `<TextField label={${literal(item.label)}} description={${literal(item.help)}} type={${literal(item.type)}} required={${String(item.required)}} />`;
      case "button":
        return `<Button variant={${literal(item.variant)}} onClick={() => setMessage(${literal(item.label + " activated (preview only).")})}>{${literal(item.label)}}</Button>`;
      case "choice":
        return `<Combobox label={${literal(item.label)}} options={${literal(item.options)}} onValueChange={setMessage} />`;
      case "table":
        return `<DataTable caption={${literal(item.caption)}} columns={${literal(item.columns.map((column) => ({ ...column, sortable: true })))}} rows={${literal(item.rows.map((row) => ({ ...row, sortValues: row.values })))}} pageSize={${String(item.pageSize)}} />`;
      case "tabs":
        return `<Tabs aria-label={${literal(item.label)}} items={${literal(item.items)}.map(item => ({ id: item.id, label: item.label, panel: item.text }))} />`;
      case "dialog":
        return `<section><Button onClick={() => setDialog(${literal(item.id)})}>{${literal(item.trigger)}}</Button><Dialog title={${literal(item.title)}} description={${literal(item.description)}} open={dialog === ${literal(item.id)}} onOpenChange={open => setDialog(open ? ${literal(item.id)} : null)}><p>Preview only.</p></Dialog></section>`;
    }
  });
  return `// Authored with Accessible Design System Lab by Jason Stys.\n// Preview actions do not submit or save user data. Add your own reviewed business logic.\n${messageState || dialogState ? 'import { useState } from "react";\n' : ""}${imports.size ? `import { ${[...imports].sort().join(", ")} } from "accessible-design-system-lab";\n` : ""}import "accessible-design-system-lab/styles.css";\nimport "./blueprint.css";\n\nexport function Blueprint() {\n${declarations}\n  return <main className="authored-blueprint" data-theme=${literal(validated.appearance.theme)} data-density=${literal(validated.appearance.density)} dir=${literal(validated.appearance.direction)}>\n    <h1>{${literal(validated.title)}}</h1><p>{${literal(validated.description)}}</p>\n    ${children.join("\n    ")}\n    ${messageState ? '<p role="status">{message}</p>' : ""}\n  </main>;\n}\n`;
}

/** Generate only typed color/layout tokens. Arbitrary CSS, URLs and executable templates are refused. */
export function cssSource(project: DesignProject): string {
  const safe = parseProject(JSON.stringify(project));
  return `/* Authored with Accessible Design System Lab by Jason Stys. */\n.authored-blueprint { --ds-color-primary: ${safe.appearance.accent}; --ds-color-primary-hover: ${safe.appearance.accent}; --ds-color-primary-contrast: ${buttonContrast(safe.appearance.accent).foreground}; display: grid; gap: 1rem; padding: 1.5rem; max-width: 72rem; margin: auto; font-family: system-ui, sans-serif; color: var(--ds-color-text); background: var(--ds-color-surface); }\n`;
}

/** Choose black/white button text by actual sRGB contrast; this is not a full accessibility audit. */
export function buttonContrast(accent: string): {
  foreground: string;
  ratio: number;
} {
  const values = [1, 3, 5].map(
    (offset) => parseInt(accent.slice(offset, offset + 2), 16) / 255,
  );
  const linear = values.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  const luminance =
    (linear[0] ?? 0) * 0.2126 +
    (linear[1] ?? 0) * 0.7152 +
    (linear[2] ?? 0) * 0.0722;
  const dark = (luminance + 0.05) / 0.05,
    light = 1.05 / (luminance + 0.05);
  return light >= dark
    ? { foreground: "#ffffff", ratio: light }
    : { foreground: "#000000", ratio: dark };
}
