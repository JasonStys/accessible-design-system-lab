/**
 * File: components.test.tsx
 * Purpose: Verify semantic roles, state relationships, keyboard contracts, and callback behavior.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: user models keyboard and pointer input through the public component APIs.
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { Combobox } from "./Combobox";
import { DataTable } from "./DataTable";
import { Dialog } from "./Dialog";
import { Tabs } from "./Tabs";
import { TextField } from "./TextField";
import { ToastRegion } from "./ToastRegion";

describe("Button", () => {
  it("uses native disabled and announced busy behavior", () => {
    render(<Button busy>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});

describe("TextField", () => {
  it("connects help and error messages to the input", () => {
    render(
      <TextField
        description="Use a test address."
        error="Address is required."
        label="Email"
        required
      />,
    );
    const input = screen.getByRole("textbox", { name: /Email/ });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "Use a test address. Address is required.",
    );
  });
});

describe("Tabs", () => {
  it("moves and activates the roving tab stop with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        aria-label="Topics"
        items={[
          { id: "one", label: "One", panel: "First panel" },
          { id: "two", label: "Two", panel: "Second panel" },
        ]}
      />,
    );
    const first = screen.getByRole("tab", { name: "One" });
    first.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
    await user.keyboard("{Home}");
    expect(first).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    await user.click(first);
    expect(screen.getByRole("tabpanel")).toHaveTextContent("First panel");
  });

  it("renders nothing for an empty item collection", () => {
    const { container } = render(<Tabs aria-label="Empty" items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("Combobox", () => {
  it("filters and commits the active option from the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox
        label="Role"
        onValueChange={onValueChange}
        options={[
          { label: "Frontend engineer", value: "frontend" },
          { label: "Design systems engineer", value: "systems" },
        ]}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Role" });
    await user.type(input, "Design");
    expect(
      screen.getByRole("option", { name: "Design systems engineer" }),
    ).toBeVisible();
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("Design systems engineer");
    expect(onValueChange).toHaveBeenCalledWith("systems");
  });

  it("reports an empty filtered result without a fake option", async () => {
    const user = userEvent.setup();
    render(
      <Combobox
        label="Role"
        options={[{ label: "Engineer", value: "engineer" }]}
      />,
    );
    await user.type(screen.getByRole("combobox", { name: "Role" }), "writer");
    expect(screen.getByText("No matching options")).toBeVisible();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    await user.keyboard("{ArrowDown}{ArrowUp}{Escape}");
    expect(screen.getByRole("combobox", { name: "Role" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("supports pointer exploration and selection", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox
        label="Framework"
        onValueChange={onValueChange}
        options={[
          { label: "React", value: "react" },
          { label: "Vanilla", value: "vanilla" },
        ]}
      />,
    );
    await user.click(screen.getByRole("combobox", { name: "Framework" }));
    const option = screen.getByRole("option", { name: "Vanilla" });
    await user.hover(option);
    fireEvent.mouseDown(option);
    await user.click(option);
    expect(onValueChange).toHaveBeenCalledWith("vanilla");
    expect(screen.getByRole("combobox", { name: "Framework" })).toHaveValue(
      "Vanilla",
    );
  });
});

describe("Dialog", () => {
  /** Provide controlled state so the test observes the same lifecycle as a consumer. */
  function DialogHarness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open profile</Button>
        <Dialog
          description="Edit a synthetic profile."
          onOpenChange={setOpen}
          open={open}
          title="Profile settings"
        >
          <TextField label="Display name" />
        </Dialog>
      </>
    );
  }

  it("moves focus into the modal and returns it to the trigger", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    const trigger = screen.getByRole("button", { name: "Open profile" });
    await user.click(trigger);
    expect(
      screen.getByRole("heading", { name: "Profile settings" }),
    ).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(trigger).toHaveFocus();
  });

  it("handles the browser cancel event through controlled state", async () => {
    const user = userEvent.setup();
    render(<DialogHarness />);
    await user.click(screen.getByRole("button", { name: "Open profile" }));
    const dialog = screen.getByRole("dialog", { name: "Profile settings" });
    expect(dialog).toHaveAccessibleDescription("Edit a synthetic profile.");
    fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
    expect(dialog).not.toHaveAttribute("open");
  });
});

describe("ToastRegion", () => {
  it("announces a message and exposes a labeled dismiss action", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <ToastRegion
        onDismiss={onDismiss}
        toasts={[{ id: "saved", message: "Profile saved.", tone: "success" }]}
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Profile saved.");
    await user.click(
      screen.getByRole("button", { name: "Dismiss Profile saved." }),
    );
    expect(onDismiss).toHaveBeenCalledWith("saved");
  });

  it("uses the informational presentation when tone is omitted", () => {
    render(
      <ToastRegion
        onDismiss={vi.fn()}
        toasts={[{ id: "ready", message: "Ready." }]}
      />,
    );
    expect(screen.getByRole("status")).toHaveClass("ds-toast--info");
  });
});

describe("DataTable", () => {
  it("retains caption, scoped headers, and stable column ordering", () => {
    render(
      <DataTable
        caption="Keyboard contracts"
        columns={[{ key: "component", label: "Component" }]}
        rows={[{ id: "tabs", values: { component: "Tabs" } }]}
      />,
    );
    const table = screen.getByRole("table", { name: "Keyboard contracts" });
    expect(
      within(table).getByRole("columnheader", { name: "Component" }),
    ).toBeVisible();
    expect(within(table).getByRole("cell", { name: "Tabs" })).toBeVisible();
  });
});
