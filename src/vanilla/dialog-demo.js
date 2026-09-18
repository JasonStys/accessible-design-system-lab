/**
 * File: dialog-demo.js
 * Purpose: Progressively enhance semantic HTML with a native modal dialog and status announcement.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: openButton, closeButton, dialog, and status are required DOM contracts.
 */
import "../styles/tokens.css";
import "../styles/components.css";
import "../styles/demo.css";

const openButton = document.querySelector("[data-dialog-open]");
const closeButton = document.querySelector("[data-dialog-close]");
const dialog = /** @type {HTMLDialogElement | null} */ (
  document.querySelector("[data-dialog]")
);
const status = /** @type {HTMLElement | null} */ (
  document.querySelector("[data-dialog-status]")
);

if (!(openButton instanceof HTMLButtonElement))
  throw new Error("Missing dialog trigger");
if (!(closeButton instanceof HTMLButtonElement))
  throw new Error("Missing dialog close button");
if (!(dialog instanceof HTMLDialogElement))
  throw new Error("Missing native dialog");
if (!(status instanceof HTMLElement))
  throw new Error("Missing dialog status region");

const nativeDialog = dialog;
const liveStatus = status;

/** Open the native modal and move focus to its heading for contextual reading. */
function openDialog() {
  nativeDialog.showModal();
  nativeDialog.querySelector("h2")?.focus();
  liveStatus.textContent = "Settings dialog opened.";
}

/** Close the native modal; the browser restores focus to the invoking button. */
function closeDialog() {
  nativeDialog.close();
  liveStatus.textContent = "Settings dialog closed.";
}

openButton.addEventListener("click", openDialog);
closeButton.addEventListener("click", closeDialog);
