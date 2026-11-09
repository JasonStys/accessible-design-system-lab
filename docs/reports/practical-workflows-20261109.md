# Sortable and paginated native table validation — 2026-11-09

Jason Stys: practical component workflow and observed automated evidence.

DataTable now supports explicit primitive sort keys, stable ties, null/nonfinite
values last, native header buttons/aria-sort, page rendering and clear data states.
Domain formatting remains independent of sorting. Pagination focuses the caption;
sorting preserves header focus and resets the page. Data/schema shrinkage cannot
produce an empty phantom page or invisible sorted-column claim. Static callers
remain supported.

The live catalog demonstrates keyboard sorting/paging and RTL; Storybook adds a
service-latency example with an explicitly missing measurement. Storybook telemetry
is explicitly disabled. Public package/declaration consumer checks are retained.

## Local checks

After the patched dependency graph was installed, the complete `npm run verify`
passed:23 tests,99.28% lines/96.79% statements/94.58% branches; DataTable100% lines
and98.68% branches, pure sort helper100%. All10 real desktop/mobile Chromium
journeys passed. Public package smoke, strict types/lint, Storybook/site/library,
indexes and hygiene passed. Library gzip sizes:3638B JS/36000B budget and2020B
CSS/16000B budget. Full npm audit returned0 vulnerabilities. Storybook's existing
large vendor-chunk advisory remains a documentation-tool build warning; library
budget gates are unchanged and pass.

Component/pure tests cover exact numeric/string/mixed/null/missing/nonfinite
ordering, stable ties, immutable input, real keyboard interactions, focus,
data/schema changes, data states and invalid row/column/page-size contracts.
Desktop/mobile Chromium journeys cover Enter sorting, updated button name,
aria-sort, page range/count, caption focus, RTL, WCAG Axe and existing
dialog/combobox/vanilla contracts on dedicated test port18473. Strict TypeScript,
ESLint, source index, repository/header/link validation, library/site/Storybook,
consumer smoke and unchanged compressed bundle budgets are required.

An initial browser locator requested the old ascending button name after sorting
intentionally changed it to descending; it now asserts the same header's correct
new name and focus. Lint/type issues were corrected without relaxing rules.
Existing formatting-only metadata drift was normalized by the repo formatter.

## Limits

Automated Axe and keyboard tests do not establish WCAG conformance or replace the
manual screen-reader checklist. NVDA/JAWS/VoiceOver and engines outside the declared
matrix were not manually validated. Sorting is deterministic code-unit/numeric
ordering, not locale collation. Data is held/sorted in memory, not streamed or
virtualized; consumers own authorization, fetching and retries. Only synthetic
examples were used. Parent owns remote CI/publication; no Actions triggered here.

## Dependency correction

The complete npm audit found15 development-tool findings hidden by the previous
production-only audit. Exact leaf overrides update glob14.0.4, minimatch11.0.5,
undici8.12.4 and zod4.6.7 while retaining the existing top-level tooling versions.
The full lint/type/component/package/site/Storybook/browser gates must pass with
these overrides; major downgrades suggested by forced audit repair were not used.
CI now audits the complete graph at moderate severity. Primary reviewed findings:
[glob cancellation](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4),
[minimatch amplification](https://github.com/advisories/GHSA-g3hv-75wg-m249),
[Zod collection limits](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5).
