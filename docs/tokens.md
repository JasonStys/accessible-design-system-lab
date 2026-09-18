# Tokens and theming

`src/styles/tokens.css` exposes `--ds-*` custom properties for color, typography, spacing, radius,
shadow, motion, control sizing, and content width.

## Environmental variants

- `[data-theme="dark"]` switches semantic color tokens and declares a dark color scheme.
- `[data-density="compact"]` reduces control and spacing tokens without shrinking text.
- `dir="rtl"` works through logical CSS properties and a focused layout adjustment.
- `forced-colors: active` preserves system colors and removes non-essential shadows.
- `prefers-reduced-motion: reduce` reduces decorative transition and animation duration.

Consumers may override semantic tokens at an application boundary. They must re-run contrast,
forced-color, zoom, and interaction checks after overrides. Raw palette values are intentionally not
part of the public contract.
