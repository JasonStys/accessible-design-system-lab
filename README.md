# Accessible Design System Lab

[![CI](https://github.com/JasonStys/accessible-design-system-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/JasonStys/accessible-design-system-lab/actions/workflows/ci.yml)
[![CodeQL](https://github.com/JasonStys/accessible-design-system-lab/actions/workflows/codeql.yml/badge.svg)](https://github.com/JasonStys/accessible-design-system-lab/actions/workflows/codeql.yml)

A native-first React component library and engineering laboratory for semantic HTML, resilient CSS,
keyboard interaction, focus management, automated accessibility checks, package design, and honest
quality evidence.

The project avoids unsupported conformance claims. Automated tools catch only part of the
accessibility surface, so the exact automated criteria and remaining manual checks are published in
[the accessibility contract](docs/accessibility.md).

## What this demonstrates

- TypeScript and React API design with strict types and explicit public exports.
- Semantic HTML before ARIA: native buttons, inputs, tables, and `<dialog>` provide the baseline.
- CSS custom-property themes, compact density, forced-color behavior, reduced motion, logical
  properties, responsive layout, and right-to-left rendering.
- Keyboard-oriented dialog, tab, and combobox state machines with documented invariants.
- Storybook 10 documentation and accessibility inspection.
- Vitest unit/component tests, Playwright desktop/mobile workflows, axe checks, package-consumer
  smoke tests, bundle budgets, CodeQL, dependency review, and repository validation.
- A framework-independent HTML/JavaScript dialog demonstrating interoperability.

## Component summary

| Component     | Major behavior                                              | Native foundation         |
| ------------- | ----------------------------------------------------------- | ------------------------- |
| `Button`      | Visual variants, busy/disabled state                        | `<button>`                |
| `TextField`   | Label, description, error, stable IDs                       | `<label>` + `<input>`     |
| `Dialog`      | Controlled modal state, initial focus, Escape, focus return | `<dialog>.showModal()`    |
| `Tabs`        | Roving tab stop, arrows, Home/End, automatic activation     | `<button>` + tab roles    |
| `Combobox`    | Filtering, active descendant, keyboard selection            | `<input>` + listbox roles |
| `ToastRegion` | Polite announcements and explicit dismissal                 | live region + `<button>`  |
| `DataTable`   | Caption, scoped headers, horizontal overflow focus          | `<table>`                 |

## Quick start

Prerequisites: Node.js 22.12–24.x and npm 11.

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. The React catalog is at `/`; the standalone HTML/JavaScript example
is at `/vanilla.html`.

Storybook runs separately:

```bash
npm run storybook
```

## Consumer example

```tsx
import { Button, TextField } from "accessible-design-system-lab";
import "accessible-design-system-lab/styles.css";

export function ProfileForm() {
  return (
    <form>
      <TextField
        label="Display name"
        description="Shown to other demo users."
      />
      <Button type="submit">Save profile</Button>
    </form>
  );
}
```

The package is built and packed in CI but is not automatically published. This keeps releases
intentional and prevents the portfolio repository from implying support commitments it does not
make.

## Verification

```bash
npm run verify
npx playwright install chromium
npm run test:e2e
```

`npm run verify` performs formatting, linting, strict type checking, coverage tests, application and
library builds, gzip budget enforcement, clean-consumer package installation, Storybook build,
generated code-index freshness, and documentation/repository validation. Playwright is separate
because browser installation is an explicit environment step.

See [testing strategy](docs/testing.md), [validation evidence](docs/reports/validation.md), and
[manual screen-reader checklist](docs/reports/manual-screen-reader-checklist.md).

## Architecture at a glance

```text
consumer application
      │
      ├── explicit React exports ── native HTML behavior
      │              │
      │              └── CSS token and component layers
      │
      ├── Storybook catalog ─────── isolated review + axe panel
      ├── Vite demo site ────────── integrated responsive scenarios
      └── vanilla example ───────── semantic HTML + ES module

verification: Vitest → build/package → Playwright/axe → CI/CodeQL
```

The full design, assumptions, data flow, tradeoffs, and growth triggers are in
[architecture.md](docs/architecture.md).

## Repository map

| Path                 | Purpose                                                              |
| -------------------- | -------------------------------------------------------------------- |
| `src/components/`    | Public components and focused component tests                        |
| `src/styles/`        | Tokens, reusable component styles, and demo-only layout              |
| `src/stories/`       | Isolated Storybook states                                            |
| `src/vanilla/`       | Framework-independent progressive-enhancement example                |
| `tests/e2e/`         | Real-browser keyboard, responsive, axe, RTL, and vanilla scenarios   |
| `.storybook/`        | Storybook framework, documentation, and a11y configuration           |
| `.github/workflows/` | Least-privilege CI, CodeQL, and dependency review                    |
| `scripts/`           | Clean, bundle, package, symbol-index, and repository checks          |
| `docs/`              | Architecture, APIs, accessibility, operations, research, and reports |

[The file catalog](docs/file-catalog.md) explains every authored file group, while the generated
[code index](docs/code-index.md) records exact function, class, type, and important-variable lines.

## Documentation

- [Architecture](docs/architecture.md)
- [Accessibility contract](docs/accessibility.md)
- [Component API](docs/api.md)
- [Tokens and theming](docs/tokens.md)
- [Testing strategy](docs/testing.md)
- [Complexity and performance](docs/complexity.md)
- [Operations and releases](docs/operations.md)
- [Research references](docs/research.md)
- [Architecture decision record](docs/adr/0001-native-first-react-and-css.md)
- [Test summary](docs/reports/test-summary.md)
- [Validation report](docs/reports/validation.md)
- [Bundle budget](docs/reports/bundle-budget.md)

## Security and limitations

This is a component-engineering portfolio project, not a certification suite. It contains no
authentication, secrets, analytics collection, or remote API calls. Review the
[security policy](SECURITY.md) and the documented [accessibility limitations](docs/accessibility.md)
before reuse.

## License

[MIT](LICENSE)
