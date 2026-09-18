# Bundle budget

The complete library—not individual cherry-picked components—must remain within:

- JavaScript: 36,000 gzip bytes.
- CSS: 16,000 gzip bytes.

`npm run bundle:check` measures maximum-compression gzip size and writes
`docs/reports/generated/bundle-budget.json`. CI uploads the report as build evidence and fails on a
regression. Raw size is retained for diagnosis but is not the pass/fail metric.

The September 18, 2026 production package build measured:

| Artifact   | Raw bytes | Gzip bytes | Budget | Result |
| ---------- | --------: | ---------: | -----: | ------ |
| JavaScript |     7,834 |      2,487 | 36,000 | Pass   |
| CSS        |     7,142 |      2,020 | 16,000 | Pass   |

These numbers describe the reusable library package. The demo catalog and Storybook include their
own application and documentation dependencies and are intentionally excluded from this budget.
