/**
 * File: Button.tsx
 * Purpose: Preserve native button behavior while applying consistent visual variants and busy state.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: variant and busy determine presentation without replacing button semantics.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  busy?: boolean;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

/** Render a native button with an optional announced busy state. */
export function Button({
  busy = false,
  children,
  className = "",
  disabled,
  variant = "primary",
  ...props
}: ButtonProps) {
  const classes = ["ds-button", `ds-button--${variant}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      aria-busy={busy || undefined}
      className={classes}
      disabled={busy ? true : disabled}
      type="button"
      {...props}
    >
      {busy ? <span aria-hidden="true" className="ds-button__spinner" /> : null}
      <span>{children}</span>
    </button>
  );
}
