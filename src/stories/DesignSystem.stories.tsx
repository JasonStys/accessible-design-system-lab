/**
 * File: DesignSystem.stories.tsx
 * Purpose: Document each public component in isolation with realistic accessible names and states.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: meta defines the catalog hierarchy; story exports provide reviewable states.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Button,
  Combobox,
  DataTable,
  Dialog,
  Tabs,
  TextField,
  ToastRegion,
  type ToastMessage,
} from "../index";

const meta = {
  title: "Accessible Design System/Public components",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Buttons: Story = {
  render: () => (
    <div className="demo-stack">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button busy>Saving</Button>
    </div>
  ),
};

export const FormControls: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <TextField
        description="Help text remains connected to the field."
        label="Project name"
      />
      <TextField
        error="A value is required."
        label="Required project"
        required
      />
      <Combobox
        label="Role"
        options={[
          { label: "Frontend engineer", value: "frontend" },
          { label: "Accessibility specialist", value: "a11y" },
        ]}
      />
    </div>
  ),
};

/** Demonstrate controlled native-dialog state inside Storybook. */
function DialogStory() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog onOpenChange={setOpen} open={open} title="Storybook dialog">
        <p>
          The native dialog owns modality while React owns application state.
        </p>
      </Dialog>
    </>
  );
}

export const ModalDialog: Story = { render: () => <DialogStory /> };

export const KeyboardTabs: Story = {
  render: () => (
    <Tabs
      aria-label="Story topics"
      items={[
        { id: "one", label: "Semantics", panel: "Prefer native semantics." },
        {
          id: "two",
          label: "Focus",
          panel: "Keep focus visible and predictable.",
        },
      ]}
    />
  ),
};

export const NativeTable: Story = {
  render: () => (
    <DataTable
      caption="Component support"
      columns={[
        { key: "name", label: "Component" },
        { key: "status", label: "Status" },
      ]}
      rows={[{ id: "button", values: { name: "Button", status: "Verified" } }]}
    />
  ),
};

/** Demonstrate dismissible messages without timing-dependent auto-removal. */
function ToastStory() {
  const [toasts, setToasts] = useState<ToastMessage[]>([
    { id: "saved", message: "Changes saved.", tone: "success" },
  ]);
  return (
    <ToastRegion
      onDismiss={(id) =>
        setToasts((current) => current.filter((toast) => toast.id !== id))
      }
      toasts={toasts}
    />
  );
}

export const Notifications: Story = { render: () => <ToastStory /> };
