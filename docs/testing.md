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

| Area                   | Test type                            | Representative cases                                               |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------ |
| Component state        | Vitest + Testing Library             | busy button, field descriptions, tabs, filter/selection, dismissal |
| Focus/modal            | Unit + Playwright                    | initial focus, Escape, trigger restoration                         |
| Integrated UI          | Playwright                           | theme, density, RTL, mobile/desktop, reduced motion                |
| Accessibility          | semantic assertions + axe            | names, roles, descriptions, automated WCAG rules                   |
| Framework independence | Playwright                           | vanilla dialog opens, closes, announces, restores focus            |
| Package contract       | clean temporary consumer             | packed files and seven runtime exports                             |
| Performance            | gzip budget                          | JavaScript ≤36 KB; CSS ≤16 KB                                      |
| Documentation          | repository scripts                   | required files, links, headers, symbol-index freshness             |
| Security               | npm audit, dependency review, CodeQL | production graph, pull-request changes, static analysis            |

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
