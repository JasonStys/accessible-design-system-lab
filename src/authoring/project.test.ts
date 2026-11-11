/** File: project.test.ts
 * Purpose: Independent blueprint bounds, literal-code injection and real TypeScript syntax regressions.
 * Symbols/state: fresh prepared/handwritten inputs only; no app profile, network or code execution.
 */
import { describe, expect, it } from "vitest";
import ts from "typescript";
import {
  cssSource,
  paletteBlock,
  parseProject,
  preparedProject,
  reactSource,
  MAX_PROJECT_BYTES,
  buttonContrast,
  type DesignProject,
} from "./project";

const encode = (value: unknown) => JSON.stringify(value);
const valid = () => preparedProject();

describe("bounded blueprint schema", () => {
  it.each(["service", "operations", "preferences"] as const)(
    "validates editable %s input without shared state",
    (name) => {
      const first = preparedProject(name),
        second = preparedProject(name);
      expect(parseProject(encode(first))).toEqual(first);
      first.blocks.length = 0;
      expect(second.blocks.length).toBeGreaterThan(0);
    },
  );
  it("supports all seven kinds and empty designs", () => {
    const value = valid();
    value.blocks = (
      ["text", "field", "button", "choice", "table", "tabs", "dialog"] as const
    ).map((kind) => paletteBlock(kind, `${kind}-one`));
    expect(parseProject(encode(value)).blocks).toHaveLength(7);
    value.blocks = [];
    expect(parseProject(encode(value)).blocks).toEqual([]);
  });
  it.each([
    null,
    true,
    1,
    [],
    {},
    { ...valid(), extra: "ignored?" },
    { ...valid(), schema: 2 },
    { ...valid(), title: " " },
    { ...valid(), description: "x".repeat(501) },
  ])("rejects malformed or unknown project structure %j", (value) => {
    expect(() => parseProject(encode(value))).toThrow();
  });
  it("bounds actual UTF8 bytes before parsing, not just character count", () => {
    expect(() => parseProject(" ".repeat(MAX_PROJECT_BYTES + 1))).toThrow(
      /64KiB/,
    );
    expect(() =>
      parseProject(
        encode({ ...valid(), description: "🚀".repeat(MAX_PROJECT_BYTES / 3) }),
      ),
    ).toThrow(/64KiB/);
    expect(() => parseProject("{")).toThrow();
  });
  it.each([
    { theme: "future" },
    { density: "tiny" },
    { direction: "vertical" },
    { accent: "red;url(https://foreign.invalid)" },
    { accent: "#fff" },
    { extra: true },
  ])("rejects untyped appearance input %j", (change) => {
    const value = valid();
    expect(() =>
      parseProject(
        encode({ ...value, appearance: { ...value.appearance, ...change } }),
      ),
    ).toThrow();
  });
  it("rejects absent, repeated, malformed, control-character and excessive blocks", () => {
    for (const blocks of [
      [null],
      [{ kind: "html", id: "unsafe" }],
      [paletteBlock("text", "same"), paletteBlock("field", "same")],
      [{ ...paletteBlock("field", "field"), required: "yes" }],
      [{ ...paletteBlock("field", "field"), type: "password" }],
      [{ ...paletteBlock("text", "text"), title: "\u0000" }],
      Array.from({ length: 21 }, (_, index) =>
        paletteBlock("text", `id-${String(index)}`),
      ),
    ]) {
      expect(() => parseProject(encode({ ...valid(), blocks }))).toThrow();
    }
    expect(() => paletteBlock("text", "../escape")).toThrow();
    expect(() => paletteBlock("missing" as "text", "one")).toThrow();
  });
  it("enforces table column/row identities, complete values, typed text and page bounds", () => {
    const value = preparedProject("operations"),
      table = value.blocks.find((item) => item.kind === "table");
    if (!table) throw new Error("Missing independent fixture");
    const changes: unknown[] = [
      { columns: [] },
      { columns: [table.columns[0], table.columns[0]] },
      { columns: Array(7).fill(table.columns[0]) },
      { rows: [{ id: "one", values: { asset: "A" } }] },
      { rows: [{ id: "one", values: { asset: 1, status: "Ready" } }] },
      { rows: [table.rows[0], table.rows[0]] },
      { rows: Array(51).fill(table.rows[0]) },
      { pageSize: 0 },
      { pageSize: 21 },
      { pageSize: 1.5 },
      { pageSize: true },
    ];
    for (const change of changes)
      expect(() =>
        parseProject(
          encode({ ...value, blocks: [{ ...table, ...(change as object) }] }),
        ),
      ).toThrow();
    expect(
      parseProject(
        encode({ ...value, blocks: [{ ...table, rows: [], pageSize: 20 }] }),
      ).blocks,
    ).toHaveLength(1);
  });
  it("bounds choice and tab option lists and rejects repeated IDs", () => {
    for (const block of [
      { ...paletteBlock("choice", "one"), options: [] },
      {
        ...paletteBlock("choice", "one"),
        options: [
          { value: "same", label: "A" },
          { value: "same", label: "B" },
        ],
      },
      {
        ...paletteBlock("choice", "one"),
        options: [{ value: "valid", label: "" }],
      },
      {
        ...paletteBlock("tabs", "one"),
        items: [
          { id: "same", label: "A", text: "A" },
          { id: "same", label: "B", text: "B" },
        ],
      },
      { ...paletteBlock("tabs", "one"), items: [] },
      { ...paletteBlock("button", "one"), variant: "unknown" },
    ])
      expect(() =>
        parseProject(encode({ ...valid(), blocks: [block] })),
      ).toThrow();
  });
});

describe("literal public-library exports", () => {
  it("computes independently known black/white contrast and selects readable text for a yellow accent", () => {
    expect(buttonContrast("#000000")).toEqual({
      foreground: "#ffffff",
      ratio: 21,
    });
    expect(buttonContrast("#ffffff")).toEqual({
      foreground: "#000000",
      ratio: 21,
    });
    const yellow = buttonContrast("#ffff00");
    expect(yellow.foreground).toBe("#000000");
    expect(yellow.ratio).toBeCloseTo(19.556, 3);
  });
  it.each(["service", "operations", "preferences"] as const)(
    "exports %s with only the required public imports and state",
    (name) => {
      const source = reactSource(preparedProject(name));
      if (name === "operations") {
        expect(source).not.toContain("useState");
        expect(source).not.toContain("TextField");
      }
      if (name === "service") expect(source).not.toContain("setDialog");
      if (name === "preferences") expect(source).not.toContain("setMessage");
      expect(source).not.toContain("eval(");
    },
  );
  it("exports an empty blueprint without unused component/state imports", () => {
    const project = { ...valid(), blocks: [] };
    const source = reactSource(project);
    expect(source).not.toContain("useState");
    expect(source).not.toContain("import { ");
    expect(source).toContain("export function Blueprint");
  });
  it("generates syntactically valid TSX for every supported component and only safe preview callbacks", () => {
    const value: DesignProject = {
      ...valid(),
      blocks: (
        [
          "text",
          "field",
          "button",
          "choice",
          "table",
          "tabs",
          "dialog",
        ] as const
      ).map((kind) => paletteBlock(kind, `${kind}-one`)),
    };
    const result = reactSource(value);
    const compiled = ts.transpileModule(result, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2023,
        module: ts.ModuleKind.ESNext,
      },
      reportDiagnostics: true,
      fileName: "Blueprint.tsx",
    });
    expect(compiled.diagnostics).toEqual([]);
    for (const component of [
      "TextField",
      "Button",
      "Combobox",
      "DataTable",
      "Tabs",
      "Dialog",
    ])
      expect(result).toContain(`<${component}`);
    expect(result).toContain('from "accessible-design-system-lab"');
    expect(result).toContain("preview only");
    expect(result).not.toContain("dangerouslySetInnerHTML");
  });
  it("keeps script-like text inert in TSX/CSS without evaluating it", () => {
    const value = valid();
    value.title = '<script>alert("x")</script>';
    value.blocks = [
      {
        id: "literal",
        kind: "text",
        title: "{globalThis.compromised=true}",
        body: "</script>\u2028&",
      },
    ];
    const source = reactSource(value);
    expect(source).not.toContain("<script>");
    expect(source).toContain("\\u003cscript\\u003e");
    expect(source).toContain('{"{globalThis.compromised=true}"}');
    expect(source).toContain("\\u2028");
    const style = cssSource(value);
    expect(style).toContain("--ds-color-primary: #1558d6");
    expect(style).not.toContain(value.title);
    expect(() =>
      reactSource({
        ...value,
        appearance: { ...value.appearance, accent: "url(x)" },
      }),
    ).toThrow();
    expect(() =>
      cssSource({ ...value, blocks: [undefined as never] }),
    ).toThrow();
  });
});
