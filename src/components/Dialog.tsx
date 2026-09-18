/**
 * File: Dialog.tsx
 * Purpose: Wrap the native dialog element with controlled state, initial focus, Escape handling, and focus return.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: dialogRef, titleRef, and returnFocusRef preserve modal focus invariants.
 */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./Button";

export interface DialogProps {
  children: ReactNode;
  description?: string;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}

/** Synchronize controlled React state with the browser's native modal-dialog lifecycle. */
export function Dialog({
  children,
  description,
  onOpenChange,
  open,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const generatedId = useId();
  const titleId = `dialog-title-${generatedId}`;
  const descriptionId = description
    ? `dialog-description-${generatedId}`
    : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.showModal();
      titleRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [open]);

  /** Keep the component controlled when the browser closes the dialog through Escape or form behavior. */
  function handleClose() {
    onOpenChange(false);
    returnFocusRef.current?.focus();
  }

  return (
    <dialog
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="ds-dialog"
      onCancel={() => onOpenChange(false)}
      onClose={handleClose}
      ref={dialogRef}
    >
      <div className="ds-dialog__surface">
        <h2 id={titleId} ref={titleRef} tabIndex={-1}>
          {title}
        </h2>
        {description ? <p id={descriptionId}>{description}</p> : null}
        <div className="ds-dialog__content">{children}</div>
        <div className="ds-dialog__actions">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}
