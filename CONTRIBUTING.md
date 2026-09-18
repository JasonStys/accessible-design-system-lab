# Contributing

## Development contract

1. Use Node.js 22.12–24.x and install with `npm ci`.
2. Preserve native HTML behavior before adding roles, keyboard handlers, or focus code.
3. Add or update unit tests for state logic and Playwright tests for browser interaction.
4. Update component, accessibility, and keyboard documentation with every contract change.
5. Run `npm run symbols` after authored source changes.
6. Run `npm run verify` and `npm run test:e2e` before opening a pull request.

## Change review

Pull requests should describe the user problem, interaction contract, accessibility impact,
API/visual compatibility, tests, and manual checks. Breaking changes require an ADR and migration
note. Generated output belongs only under documented report locations.

## Source documentation

Authored code files start with a purpose header and point to `docs/code-index.md` for exact symbol
locations. Functions document behavior and invariants rather than restating their syntax.
