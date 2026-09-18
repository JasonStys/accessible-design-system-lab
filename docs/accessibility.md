# Accessibility contract

## Scope

This project demonstrates tested accessibility engineering; it does not claim complete WCAG
conformance. Automated checks cannot evaluate content quality, reading order in every assistive
technology, cognitive usability, or all platform combinations.

## Interaction contracts

| Component | Keyboard behavior                            | Focus invariant                                                      |
| --------- | -------------------------------------------- | -------------------------------------------------------------------- |
| Button    | Enter/Space from the native button           | Browser-managed visible focus                                        |
| Dialog    | Tab/Shift+Tab remain modal; Escape closes    | Initial focus enters; close returns to trigger                       |
| Tabs      | Left/Right and Up/Down wrap; Home/End jump   | Exactly one tab has `tabIndex=0`                                     |
| Combobox  | Arrows move; Enter commits; Escape collapses | DOM focus stays on input; active option uses `aria-activedescendant` |
| Toast     | Tab reaches explicit dismiss button          | New status text does not steal focus                                 |
| Table     | Native browse/table navigation               | Overflow wrapper can receive keyboard focus                          |

## Automated coverage

- Testing Library checks roles, names, descriptions, validity, focus, and callbacks.
- Playwright covers desktop and mobile Chromium, keyboard paths, native dialog behavior, RTL,
  reduced motion, and the vanilla example.
- axe-core checks WCAG 2 A/AA and WCAG 2.1 A/AA rules against the integrated catalog.
- Storybook's a11y addon is configured to treat detected violations as errors during supported story
  test execution and provides an interactive inspection panel.
- CSS includes visible focus, logical properties, forced-colors behavior, and reduced-motion rules.

## Manual coverage and limits

The [manual screen-reader checklist](reports/manual-screen-reader-checklist.md) records what requires
human verification. Automated success does not prove:

- natural announcements across NVDA, JAWS, VoiceOver, and TalkBack;
- useful names or instructions in every consumer-provided content combination;
- sufficient contrast after consumers override tokens;
- cognitive clarity, error recovery, touch ergonomics, or zoom behavior in every embedding layout;
- full WCAG, ADA, Section 508, or other legal compliance.

## Native-first rule

Use the native element when it supplies the required semantics and interaction. ARIA supplements
relationships for composite widgets; it does not replace buttons, inputs, headings, tables, or the
modal behavior of `<dialog>`.
