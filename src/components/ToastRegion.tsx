/**
 * File: ToastRegion.tsx
 * Purpose: Announce non-blocking status messages without moving keyboard focus.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: toasts is rendered in stable insertion order for predictable announcements.
 */
import { Button } from "./Button";

export interface ToastMessage {
  id: string;
  message: string;
  tone?: "info" | "success" | "warning";
}

export interface ToastRegionProps {
  onDismiss: (id: string) => void;
  toasts: readonly ToastMessage[];
}

/** Render a labeled live region whose messages remain dismissible by keyboard. */
export function ToastRegion({ onDismiss, toasts }: ToastRegionProps) {
  return (
    <section
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions"
      className="ds-toasts"
    >
      {toasts.map((toast) => (
        <div
          className={`ds-toast ds-toast--${toast.tone ?? "info"}`}
          key={toast.id}
          role="status"
        >
          <span>{toast.message}</span>
          <Button
            aria-label={`Dismiss ${toast.message}`}
            onClick={() => onDismiss(toast.id)}
            variant="secondary"
          >
            Dismiss
          </Button>
        </div>
      ))}
    </section>
  );
}
