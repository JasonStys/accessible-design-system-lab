# Validation report

## Scope

This report records the reproducible validation contract for release `1.0.0`. Local results below
were produced on September 18, 2026 with Node.js 24.18.1 and the locked dependency graph.

## Required commands

```bash
npm ci
npm run verify
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev --audit-level=high
```

## Evidence status

| Gate                                  | Result                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------- |
| Format, lint, strict types            | Pass                                                                            |
| Component tests and coverage          | Pass: 12 tests; 95.53% statements, 89.47% branches, 97.05% functions            |
| Package, site, and Storybook builds   | Pass                                                                            |
| Bundle budget and consumer smoke test | Pass: 2,487-byte JS gzip, 2,020-byte CSS gzip, seven exports installed          |
| Desktop/mobile Playwright and axe     | Pass: 8 scenarios across both viewport projects; zero configured axe violations |
| Repository and documentation policy   | Pass                                                                            |
| Full and production dependency audits | Pass: zero known vulnerabilities                                                |
| GitHub Actions CI and CodeQL          | Pass: linked below                                                              |

The complete `npm run verify` command and the separately managed `npm run test:e2e` command both
returned exit code zero. The generated machine-readable bundle result is retained in
[`generated/bundle-budget.json`](generated/bundle-budget.json).

GitHub verified source commit `e81d801f3db53a64dc027bfb4b6d04cb33dddc64` on Ubuntu with Node.js
22 and 24. The hosted evidence is retained in [CI run 35399793421](https://github.com/JasonStys/accessible-design-system-lab/actions/runs/35399793421)
and [CodeQL run 35399793416](https://github.com/JasonStys/accessible-design-system-lab/actions/runs/35399793416).

Automated success will not be described as complete WCAG conformance. Manual assistive-technology
coverage remains separately tracked.
