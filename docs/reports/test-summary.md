# Test summary

## Automated suites

- Component tests cover semantics, descriptions, invalid state, keyboard navigation, filtering,
  focus return, announcements, callbacks, captions, and headers.
- Browser tests cover desktop and mobile Chromium, dialog/tabs keyboard flows, theme/density/RTL,
  reduced motion, axe rules, and the standalone JavaScript example.
- Build tests cover declaration output, package and demo bundles, and Storybook static output.
- Package smoke tests install a packed archive into a clean temporary consumer.
- Static checks cover formatting, strict linting/types, symbol freshness, documentation links,
  headers, forbidden content, production dependencies, dependency diffs, and CodeQL.

## Thresholds

- Components: at least 90% statements, lines, and functions; 80% branches.
- Runtime package: at most 36 KB gzip JavaScript and 16 KB gzip CSS.
- Browser accessibility: zero violations for the configured axe WCAG 2/2.1 A/AA rule tags.

## Validated baseline

The September 18, 2026 baseline passed 12 component tests and 8 Playwright scenarios across
desktop and mobile Chromium. Component coverage reached 95.53% statements, 89.47% branches, 97.05%
functions, and 99.02% lines. Both full and production-only npm audits reported zero known
vulnerabilities.

Exact local and hosted results are recorded in [validation.md](validation.md). Automated axe and
semantic assertions do not replace the outstanding manual screen-reader checklist.
