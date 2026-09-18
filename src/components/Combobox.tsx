/**
 * File: Combobox.tsx
 * Purpose: Provide a filterable single-select combobox with explicit listbox and active-option relationships.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: query, open, activeIndex, and filteredOptions form the interaction state machine.
 */
import { useId, useState, type ChangeEvent, type KeyboardEvent } from "react";

export interface ComboboxOption {
  label: string;
  value: string;
}

export interface ComboboxProps {
  label: string;
  onValueChange?: (value: string) => void;
  options: readonly ComboboxOption[];
}

/** Render a text-input combobox with predictable keyboard selection and escaped state. */
export function Combobox({ label, onValueChange, options }: ComboboxProps) {
  const generatedId = useId();
  const inputId = `combobox-${generatedId}`;
  const listboxId = `${inputId}-listbox`;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const filteredOptions = options.filter((option) =>
    option.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const boundedActiveIndex = Math.min(
    activeIndex,
    Math.max(0, filteredOptions.length - 1),
  );
  const activeOption = filteredOptions[boundedActiveIndex];

  /** Commit a selected option and collapse the popup. */
  function selectOption(option: ComboboxOption) {
    setQuery(option.label);
    setOpen(false);
    onValueChange?.(option.value);
  }

  /** Filter options while resetting keyboard navigation to the first match. */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    setActiveIndex(0);
    setOpen(true);
  }

  /** Apply the ARIA combobox keyboard contract without intercepting text-editing keys. */
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) =>
        filteredOptions.length ? (current + 1) % filteredOptions.length : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) =>
        filteredOptions.length
          ? (current - 1 + filteredOptions.length) % filteredOptions.length
          : 0,
      );
    } else if (event.key === "Enter" && open && activeOption) {
      event.preventDefault();
      selectOption(activeOption);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className="ds-combobox">
      <label className="ds-field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        aria-activedescendant={
          open && activeOption
            ? `${inputId}-option-${activeOption.value}`
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        className="ds-field__input"
        id={inputId}
        onBlur={() => setOpen(false)}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        role="combobox"
        value={query}
      />
      {open ? (
        <ul className="ds-combobox__listbox" id={listboxId} role="listbox">
          {filteredOptions.length ? (
            filteredOptions.map((option, index) => (
              <li
                aria-selected={index === boundedActiveIndex}
                className="ds-combobox__option"
                id={`${inputId}-option-${option.value}`}
                key={option.value}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                role="option"
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="ds-combobox__empty" role="presentation">
              No matching options
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
}
