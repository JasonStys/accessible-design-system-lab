# Architecture

## Context and goals

The repository demonstrates a maintainable design-system slice for teams that need accessible,
themeable React components without hiding browser behavior behind a large runtime. Version one
optimizes for reviewability, keyboard reliability, small package cost, and honest evidence—not the
number of components.

Functional requirements:

- Seven reusable components, isolated stories, an integrated catalog, and a vanilla example.
- Light/dark themes, density, logical properties, RTL, forced colors, and reduced motion.
- Typed exports and a consumer-install smoke test.
- Automated unit, browser, axe, bundle, documentation, security, and CI checks.

Non-functional requirements:

- Node 22/24 verification; React 19 peer contract; evergreen browser target.
- Gzip budgets of 36 KB JavaScript and 16 KB CSS for the complete package.
- Deterministic builds from `package-lock.json`; no network calls at runtime.
- Keyboard operations complete without timing-dependent animation.

## High-level design

```text
                    ┌───────────────────────────┐
                    │ explicit package exports  │
                    └─────────────┬─────────────┘
                                  │
            ┌─────────────────────┼────────────────────┐
            ▼                     ▼                    ▼
  React components        token/component CSS     public types
  native primitives       opt-in stylesheet       declaration build
            │                     │                    │
            └──────────────┬──────┴────────────────────┘
                           ▼
         Storybook ── integrated demo ── vanilla example
              │             │                    │
              └───── Vitest/Playwright/axe ──────┘
                           │
             bundle/package/repository/CodeQL gates
```

## Component boundaries and data flow

Components accept caller-owned data and emit callbacks. They do not share global state. IDs used
for ARIA relationships come from React `useId`, while user-facing state remains controlled where
external coordination matters (`Dialog`) and local where it is self-contained (`Tabs`, `Combobox`).

CSS has three layers:

1. `tokens.css` defines meaning and environmental variants.
2. `components.css` styles public classes and focus states.
3. `demo.css` is excluded from the package API and exists only for portfolio presentation.

The package build externalizes React and React DOM. A separate declaration build emits public
types. The demo build consumes the same source exports rather than copying components.

## Reliability and error handling

- Missing required DOM roots throw immediately during bootstrap.
- The vanilla example verifies all selector contracts before attaching events.
- Empty tab collections render nothing rather than constructing invalid roles.
- Combobox filtering retains a bounded active index and presents a non-option empty state.
- Dialog focus is captured before opening and restored on both controlled and browser-driven close.

## Scale and performance

The library contains no server, cache, queue, or persistent store. Browser work scales with the
number of rendered items. Tabs and tables render in `O(n)`; combobox filtering is `O(n × m)` for
`n` options and average label length `m`. See [complexity.md](complexity.md).

Horizontal scaling is a consumer-application concern. Package distribution scales through static
registry/CDN caching because artifacts are immutable per version.

## Tradeoffs

- Native `<dialog>` provides modality and focus containment with less custom code, but requires the
  documented evergreen-browser baseline.
- Automatic tab activation is fast and predictable for local panels; async panels should adopt
  manual activation.
- One CSS entry point is easy to consume but limits per-component CSS tree shaking. The enforced
  gzip budget makes that cost explicit.
- Storybook enables isolated review but materially increases development dependencies; it does not
  enter the runtime package.

## Growth triggers

Revisit the design when a component needs server rendering across multiple React roots, async tab
panels, list virtualization above roughly 200 combobox options, localization beyond bidirectional
layout, or a second framework implementation. Those changes should precede new abstraction, not
follow it.
