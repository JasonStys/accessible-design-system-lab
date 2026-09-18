/**
 * File: setup.ts
 * Purpose: Extend Vitest assertions and provide the native dialog methods absent from jsdom.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: dialogPrototype receives behaviorally minimal showModal and close test doubles.
 */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

const dialogPrototype = HTMLDialogElement.prototype;

Object.defineProperties(dialogPrototype, {
  close: {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    },
  },
  showModal: {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  },
});
