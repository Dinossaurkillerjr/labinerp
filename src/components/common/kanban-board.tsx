"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { cn } from "@/lib/utils";

const DRAG_THRESHOLD = 4;

/**
 * Generic Kanban board: columns + draggable cards, using pointer events
 * (not the native HTML5 draggable API, which is unreliable across browsers/
 * input devices — see Fase 5.5 report for why). A card commits to "open"
 * when released without moving past the threshold, and to "move" when
 * released over a different column.
 */
export function KanbanBoard<T extends { id: string }>({
  columns,
  items,
  getColumnId,
  onMove,
  onOpenItem,
  renderCard,
  onAddToColumn,
  emptyTitle = "Nada por aqui ainda",
  emptyDescription,
  emptyAction,
}: {
  columns: { id: string; label: string }[];
  items: T[];
  getColumnId: (item: T) => string;
  onMove: (itemId: string, columnId: string) => void;
  onOpenItem: (item: T) => void;
  renderCard: (item: T) => React.ReactNode;
  onAddToColumn?: (columnId: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}) {
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const grouped = React.useMemo(() => {
    const map: Record<string, T[]> = Object.fromEntries(columns.map((c) => [c.id, []]));
    for (const item of items) {
      const columnId = getColumnId(item);
      (map[columnId] ??= []).push(item);
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, columns]);

  function columnIdAtPoint(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-kanban-column]");
    return el?.dataset.kanbanColumn ?? null;
  }

  function handlePointerDown(e: React.PointerEvent, item: T) {
    if ((e.target as HTMLElement).closest("button, a, input, textarea")) return;
    const card = e.currentTarget as HTMLElement;
    card.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;

    function handleMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        moved = true;
        setDraggingId(item.id);
      }
      if (moved) {
        setDragOverColumn(columnIdAtPoint(ev.clientX, ev.clientY));
      }
    }

    function handleUp(ev: PointerEvent) {
      card.removeEventListener("pointermove", handleMove);
      card.removeEventListener("pointerup", handleUp);
      card.removeEventListener("pointercancel", handleUp);
      if (moved) {
        const columnId = columnIdAtPoint(ev.clientX, ev.clientY);
        if (columnId && columnId !== getColumnId(item)) onMove(item.id, columnId);
      } else {
        onOpenItem(item);
      }
      setDraggingId(null);
      setDragOverColumn(null);
    }

    card.addEventListener("pointermove", handleMove);
    card.addEventListener("pointerup", handleUp);
    card.addEventListener("pointercancel", handleUp);
  }

  function handleKeyDown(e: React.KeyboardEvent, item: T) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenItem(item);
    }
  }

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {columns.map((column) => (
        <div
          key={column.id}
          data-kanban-column={column.id}
          className={cn(
            "flex select-none flex-col gap-2 rounded-xl border border-border bg-paper-mist/60 p-3 transition-colors",
            dragOverColumn === column.id && "border-electric-blue bg-sidebar-accent/30"
          )}
        >
          <div className="flex items-center justify-between px-0.5">
            <span className="text-body font-medium text-foreground">
              {column.label} <span className="text-muted-foreground">({grouped[column.id]?.length ?? 0})</span>
            </span>
            {onAddToColumn ? (
              <Button variant="ghost" size="icon-sm" aria-label={`Adicionar em ${column.label}`} onClick={() => onAddToColumn(column.id)}>
                <Plus className="size-4" />
              </Button>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            {(grouped[column.id] ?? []).map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onPointerDown={(e) => handlePointerDown(e, item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                className={cn(
                  "touch-none rounded-lg border border-border bg-card p-2.5 text-left shadow-subtle transition-colors hover:border-electric-blue/40",
                  draggingId === item.id && "opacity-50"
                )}
              >
                {renderCard(item)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
