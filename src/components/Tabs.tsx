/**
 * File: Tabs.tsx
 * Purpose: Implement an automatically activated tablist with roving tab stops and arrow-key navigation.
 * Symbols and line locations: see docs/code-index.md.
 * Important variables: selectedId and tabRefs maintain the selection and keyboard-focus state machine.
 */
import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}

export interface TabsProps {
  "aria-label": string;
  defaultValue?: string;
  items: readonly TabItem[];
}

/** Render tabs whose arrow, Home, and End keys move and activate focus in constant UI space. */
export function Tabs({
  "aria-label": ariaLabel,
  defaultValue,
  items,
}: TabsProps) {
  const baseId = useId();
  const initialId = defaultValue ?? items[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState(initialId);
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  /** Resolve a keyboard command to the next tab index and move selection with focus. */
  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      nextIndex = (currentIndex + 1) % items.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = items.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextItem = items[nextIndex];
    if (!nextItem) return;
    setSelectedId(nextItem.id);
    tabRefs.current.get(nextItem.id)?.focus();
  }

  if (items.length === 0) return null;
  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0];
  if (!selectedItem) return null;

  return (
    <div className="ds-tabs">
      <div aria-label={ariaLabel} className="ds-tabs__list" role="tablist">
        {items.map((item, index) => {
          const selected = item.id === selectedItem.id;
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;
          return (
            <button
              aria-controls={panelId}
              aria-selected={selected}
              className="ds-tabs__tab"
              id={tabId}
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div
        aria-labelledby={`${baseId}-tab-${selectedItem.id}`}
        className="ds-tabs__panel"
        id={`${baseId}-panel-${selectedItem.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        {selectedItem.panel}
      </div>
    </div>
  );
}
