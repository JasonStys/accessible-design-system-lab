# ADR 0001: Native-first React components with CSS custom properties

- Status: accepted
- Date: 2026-09-18

## Context

The portfolio needs focused evidence of frontend API design, semantic HTML, CSS engineering,
keyboard interaction, accessibility testing, package distribution, and documentation. A headless
runtime, a styled React library, and Web Components were considered.

## Decision

Build a small styled React 19 library that preserves native HTML foundations and exposes semantic
CSS custom properties. Use native `<dialog>` for modality, React `useId` for relationships, Vite for
site/package builds, Storybook for isolated states, Vitest for component behavior, and Playwright
plus axe for integrated browser evidence. Include a pure HTML/JavaScript example to demonstrate
that the principles are not framework-specific.

## Consequences

Benefits:

- less custom focus and form code than a div/ARIA-first implementation;
- direct, typed React consumption with a small runtime surface;
- themes and density work without a JavaScript styling runtime;
- the vanilla example exposes the semantic foundation clearly.

Costs:

- consumers need the documented evergreen browser baseline for native dialog;
- styles are opinionated rather than completely headless;
- React is a peer requirement;
- Storybook increases development-install size, although it is excluded from runtime artifacts.

## Revisit when

A second framework becomes a concrete requirement, consumers need per-component CSS splitting,
native dialog support no longer matches the browser contract, or async/virtualized composites need
different state machinery.
