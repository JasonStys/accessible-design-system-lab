/**
 * File: TextField.tsx
 * Purpose: Associate labels, help text, validation messages, and stable identifiers with a native input.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: generatedId, descriptionId, and errorId form the accessible naming contract.
 */
import { useId, type InputHTMLAttributes } from "react";

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> {
  description?: string;
  error?: string;
  id?: string;
  label: string;
}

/** Render a labeled native input with deterministic descriptive relationships. */
export function TextField({
  description,
  error,
  id,
  label,
  required,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? `field-${generatedId}`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="ds-field">
      <label className="ds-field__label" htmlFor={inputId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {description ? (
        <p className="ds-field__description" id={descriptionId}>
          {description}
        </p>
      ) : null}
      <input
        {...props}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error) || undefined}
        className="ds-field__input"
        id={inputId}
        required={required}
      />
      {error ? (
        <p className="ds-field__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
