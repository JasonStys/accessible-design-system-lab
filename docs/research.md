# Research references

The implementation uses primary documentation and treats examples as design input rather than
proof of conformance.

- [WAI-ARIA Authoring Practices: Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
  — focus entry, containment, Escape, close control, and focus return expectations.
- [W3C Technique H102: Native HTML dialog](https://www.w3.org/WAI/WCAG21/Techniques/html/H102)
  — browser-managed modal and focus behavior.
- [Storybook accessibility testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)
  — a11y addon behavior, automated limits, and CI integration.
- [Playwright accessibility testing](https://playwright.dev/docs/accessibility-testing)
  — axe integration within real-browser workflows.
- [React `useId`](https://react.dev/reference/react/useId) — stable identifiers for accessibility
  relationships rather than list or cache keys.
- [Vite 8 announcement](https://vite.dev/blog/announcing-vite8) — supported Node range and current
  Vite/React plugin architecture.

Automated axe checks identify a useful subset of issues. Manual assistive-technology review remains
mandatory for release claims.
