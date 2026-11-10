# Testing strategy

## Risk model

The highest risks are broken keyboard paths, incorrect focus restoration, inaccessible names or
relationships, package exports that work only inside the repository, CSS regressions across
environmental modes, and undocumented limits.

## Test pyramid

```text
          Playwright + axe
       package and build tests
    component interaction tests
 repository/static contract checks
```

## Coverage by area

| Area                   | Test type                            | Representative cases                                                                         |
| ---------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Component state        | Vitest + Testing Library             | busy button, field descriptions, tabs, filter/selection, dismissal                           |
| Focus/modal            | Unit + Playwright                    | initial focus, Escape, trigger restoration                                                   |
| Integrated UI          | Playwright                           | theme, density, RTL, mobile/desktop, reduced motion                                          |
| Accessibility          | semantic assertions + axe            | names, roles, descriptions, automated WCAG rules                                             |
| Framework independence | Playwright                           | vanilla dialog opens, closes, announces, restores focus                                      |
| Package contract       | clean temporary consumer             | installed public imports/CSS, seven exports, actual React DOM sort/page/focus/states and axe |
| Performance            | gzip budget                          | JavaScript ≤36 KB; CSS ≤16 KB                                                                |
| Documentation          | repository scripts                   | required files, links, headers, symbol-index freshness                                       |
| Security               | npm audit, dependency review, CodeQL | complete locked graph, pull-request changes, static analysis                                 |

## Coverage thresholds

Authored components must maintain at least 90% statements, lines, and functions and 80% branches.
Coverage is a change detector, not a substitute for meaningful assertions.

## Visual testing

Version one verifies computed theme/density/motion contracts and responsive layout behavior rather
than committing operating-system-sensitive pixel screenshots. Storybook supplies stable isolated
states for manual review. Hosted visual-diff service integration is the next step if the component
surface grows or multiple contributors need approval workflows.

## Manual gaps

Follow [the screen-reader checklist](reports/manual-screen-reader-checklist.md) before a release.
Manual results must identify browser, operating system, assistive technology, version, and observed
differences; a passing checkbox without that context is not acceptable evidence.

## Final archive consumer

Install Chromium with `npx playwright install chromium` before `npm run verify` or `npm run package:smoke`. The latter requires a completed library/declaration build. It packs directly into a canonical private temporary directory, installs the final TGZ outside this repository with scripts disabled and empty private npm configuration, and pins React19.3.1/react-dom19.3.1/scheduler0.28.0 to the reviewed lock's versions and archive integrities. A credential-filtered child environment excludes tokens and Node injection variables.

The independent consumer imports only the public package namespace and stylesheet, with no source aliases. Genuine Vite builds those imports; a new Chromium context exercises actual React DOM. Independent fixtures assert numeric sorting of formatted strings, stable ties, missing values last, page limits, caption focus after navigation, literal markup as text, installed CSS, loading/error/empty states, seven runtime exports, no page errors, axe0 and no external browser requests. The server binds its own ephemeral numeric-loopback port and closes with its browser; only the verified owned temporary root is removed.

This adds a shipping-boundary test to the existing component/catalog tests. Chromium/axe does not establish screen-reader or universal accessibility conformance, and the exact archive checksum is not publisher authentication. The library is packaged locally/CI without an automatic npm publication or native desktop installer. [Observed evidence](reports/installed-consumer-2026-11-09.md) distinguishes this consumer from historical export-name checks.
