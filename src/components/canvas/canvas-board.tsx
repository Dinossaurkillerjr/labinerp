"use client";

import * as React from "react";
import { toast } from "sonner";
import { useCanvas } from "@/lib/canvas/canvas-provider";
import { CanvasToolbar } from "@/components/canvas/canvas-toolbar";
import { CanvasElementContent, elementBaseClassName } from "@/components/canvas/canvas-element-view";
import {
  screenToCanvas,
  zoomViewport,
  createTextElement,
  createStickyElement,
  createArrowElement,
  createLinkElement,
  createGroupElement,
  createDrawingElement,
  createImageElement,
  getNextZIndex,
  resizeElement,
  duplicateElement,
} from "@/lib/canvas/calculations";
import type { CanvasElement, Point, Viewport } from "@/lib/canvas/types";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function nowISO() {
  return new Date().toISOString();
}

const GRID_SIZE = 28;
const DRAG_THRESHOLD = 3;

type DragState =
  | { kind: "pan"; startClient: Point; startViewport: Viewport }
  | { kind: "move"; startClient: Point; startPositions: Record<string, Point>; moved: boolean }
  | { kind: "resize"; id: string; startClient: Point; startWidth: number; startHeight: number }
  | { kind: "arrow-endpoint"; id: string; handle: "start" | "end"; startClient: Point; startX: number; startY: number; startWidth: number; startHeight: number }
  | { kind: "select-rect"; startCanvas: Point; currentCanvas: Point }
  | { kind: "draw"; points: Point[] };

function readImageFile(file: File): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxWidth = 420;
        const scale = img.naturalWidth > maxWidth ? maxWidth / img.naturalWidth : 1;
        resolve({ src, width: img.naturalWidth * scale, height: img.naturalHeight * scale });
      };
      img.onerror = () => resolve({ src, width: 240, height: 180 });
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export function CanvasBoard() {
  const { elements, addElements, updateElement, updateElements, deleteElements, undo, redo, canUndo, canRedo } = useCanvas();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastPointerCanvasPos = React.useRef<Point>({ x: 400, y: 300 });

  const [viewport, setViewport] = React.useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [drawMode, setDrawMode] = React.useState(false);
  const [drag, setDrag] = React.useState<DragState | null>(null);
  const [dragOverride, setDragOverride] = React.useState<Record<string, Partial<CanvasElement>>>({});

  const elementById = React.useMemo(() => new Map(elements.map((el) => [el.id, el])), [elements]);
  const sortedElements = React.useMemo(() => [...elements].sort((a, b) => a.zIndex - b.zIndex), [elements]);

  function toCanvasPoint(clientX: number, clientY: number): Point {
    const rect = containerRef.current!.getBoundingClientRect();
    return screenToCanvas({ x: clientX - rect.left, y: clientY - rect.top }, viewport);
  }

  function viewportCenterCanvasPoint(): Point {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 400, y: 300 };
    return screenToCanvas({ x: rect.width / 2, y: rect.height / 2 }, viewport);
  }

  // ---------------------------------------------------------------------
  // Adding elements
  // ---------------------------------------------------------------------

  function addAndSelect(element: CanvasElement, startEditing = false) {
    addElements([element]);
    setSelectedIds([element.id]);
    if (startEditing) setEditingId(element.id);
  }

  function handleAdd(kind: "text" | "sticky" | "arrow" | "link" | "group") {
    const { x, y } = viewportCenterCanvasPoint();
    const zIndex = getNextZIndex(elements);
    const now = nowISO();
    if (kind === "text") return addAndSelect(createTextElement(makeId(), x - 100, y - 30, now, zIndex), true);
    if (kind === "sticky") return addAndSelect(createStickyElement(makeId(), x - 100, y - 80, now, zIndex), true);
    if (kind === "arrow") return addAndSelect(createArrowElement(makeId(), x - 80, y, now, zIndex));
    if (kind === "link") return addAndSelect(createLinkElement(makeId(), x - 130, y - 36, now, zIndex, ""), true);
    if (kind === "group") return addAndSelect(createGroupElement(makeId(), x - 160, y - 120, now, zIndex));
  }

  function duplicateSelection() {
    if (selectedIds.length === 0) return;
    const now = nowISO();
    let zIndex = getNextZIndex(elements);
    const copies = selectedIds
      .map((id) => elementById.get(id))
      .filter((el): el is CanvasElement => Boolean(el))
      .map((el) => duplicateElement(el, makeId(), now, zIndex++));
    addElements(copies);
    setSelectedIds(copies.map((c) => c.id));
  }

  function deleteSelection() {
    if (selectedIds.length === 0) return;
    deleteElements(selectedIds);
    setSelectedIds([]);
  }

  // ---------------------------------------------------------------------
  // Pointer interaction (pan / select / move / resize / draw)
  // ---------------------------------------------------------------------

  function handlePointerDown(e: React.PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("textarea, input, a, button")) return; // let native controls behave normally

    containerRef.current?.setPointerCapture(e.pointerId);
    const clientPoint = { x: e.clientX, y: e.clientY };
    const canvasPoint = toCanvasPoint(e.clientX, e.clientY);

    const resizeHandle = target.closest("[data-resize-handle]");
    const arrowHandle = target.closest("[data-arrow-handle]");
    const elementNode = target.closest<HTMLElement>("[data-canvas-element]");

    if (resizeHandle && elementNode) {
      const el = elementById.get(elementNode.dataset.canvasElement!);
      if (el) setDrag({ kind: "resize", id: el.id, startClient: clientPoint, startWidth: el.width, startHeight: el.height });
      return;
    }

    if (arrowHandle && elementNode) {
      const el = elementById.get(elementNode.dataset.canvasElement!);
      if (el && el.type === "arrow") {
        setDrag({
          kind: "arrow-endpoint",
          id: el.id,
          handle: arrowHandle.getAttribute("data-arrow-handle") as "start" | "end",
          startClient: clientPoint,
          startX: el.x,
          startY: el.y,
          startWidth: el.width,
          startHeight: el.height,
        });
      }
      return;
    }

    if (elementNode) {
      const id = elementNode.dataset.canvasElement!;
      if (e.shiftKey) {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
        return;
      }
      const nextSelection = selectedIds.includes(id) ? selectedIds : [id];
      setSelectedIds(nextSelection);
      const startPositions: Record<string, Point> = {};
      for (const selId of nextSelection) {
        const el = elementById.get(selId);
        if (el) startPositions[selId] = { x: el.x, y: el.y };
      }
      setDrag({ kind: "move", startClient: clientPoint, startPositions, moved: false });
      return;
    }

    // Background
    if (drawMode) {
      setDrag({ kind: "draw", points: [canvasPoint] });
      return;
    }
    if (e.shiftKey) {
      setDrag({ kind: "select-rect", startCanvas: canvasPoint, currentCanvas: canvasPoint });
      return;
    }
    setDrag({ kind: "pan", startClient: clientPoint, startViewport: viewport });
    if (!e.shiftKey) setSelectedIds([]);
  }

  function handlePointerMove(e: React.PointerEvent) {
    lastPointerCanvasPos.current = toCanvasPoint(e.clientX, e.clientY);
    if (!drag) return;

    if (drag.kind === "pan") {
      const dx = e.clientX - drag.startClient.x;
      const dy = e.clientY - drag.startClient.y;
      setViewport({ ...drag.startViewport, x: drag.startViewport.x + dx, y: drag.startViewport.y + dy });
      return;
    }

    if (drag.kind === "move") {
      const dx = (e.clientX - drag.startClient.x) / viewport.scale;
      const dy = (e.clientY - drag.startClient.y) / viewport.scale;
      if (Math.hypot(e.clientX - drag.startClient.x, e.clientY - drag.startClient.y) > DRAG_THRESHOLD) {
        setDrag({ ...drag, moved: true });
      }
      const overrides: Record<string, Partial<CanvasElement>> = {};
      for (const [id, start] of Object.entries(drag.startPositions)) {
        overrides[id] = { x: start.x + dx, y: start.y + dy };
      }
      setDragOverride(overrides);
      return;
    }

    if (drag.kind === "resize") {
      const dx = (e.clientX - drag.startClient.x) / viewport.scale;
      const dy = (e.clientY - drag.startClient.y) / viewport.scale;
      setDragOverride({ [drag.id]: { width: drag.startWidth + dx, height: drag.startHeight + dy } });
      return;
    }

    if (drag.kind === "arrow-endpoint") {
      const dx = (e.clientX - drag.startClient.x) / viewport.scale;
      const dy = (e.clientY - drag.startClient.y) / viewport.scale;
      if (drag.handle === "end") {
        setDragOverride({ [drag.id]: { width: drag.startWidth + dx, height: drag.startHeight + dy } });
      } else {
        setDragOverride({
          [drag.id]: {
            x: drag.startX + dx,
            y: drag.startY + dy,
            width: drag.startWidth - dx,
            height: drag.startHeight - dy,
          },
        });
      }
      return;
    }

    if (drag.kind === "select-rect") {
      const canvasPoint = toCanvasPoint(e.clientX, e.clientY);
      setDrag({ ...drag, currentCanvas: canvasPoint });
      return;
    }

    if (drag.kind === "draw") {
      const canvasPoint = toCanvasPoint(e.clientX, e.clientY);
      setDrag({ ...drag, points: [...drag.points, canvasPoint] });
    }
  }

  function handlePointerUp() {
    if (!drag) return;

    if (drag.kind === "move" && drag.moved) {
      updateElements(
        Object.entries(dragOverride).map(([id, changes]) => ({ id, changes }))
      );
    } else if (drag.kind === "resize") {
      const el = elementById.get(drag.id);
      const override = dragOverride[drag.id];
      if (el && override) {
        const resized = resizeElement(el, override.width ?? el.width, override.height ?? el.height);
        updateElement(drag.id, { width: resized.width, height: resized.height });
      }
    } else if (drag.kind === "arrow-endpoint") {
      const override = dragOverride[drag.id];
      if (override) updateElement(drag.id, override);
    } else if (drag.kind === "select-rect") {
      const { startCanvas, currentCanvas } = drag;
      const rect = {
        x: Math.min(startCanvas.x, currentCanvas.x),
        y: Math.min(startCanvas.y, currentCanvas.y),
        width: Math.abs(currentCanvas.x - startCanvas.x),
        height: Math.abs(currentCanvas.y - startCanvas.y),
      };
      const intersecting = elements
        .filter((el) => el.x < rect.x + rect.width && el.x + el.width > rect.x && el.y < rect.y + rect.height && el.y + el.height > rect.y)
        .map((el) => el.id);
      setSelectedIds((prev) => [...new Set([...prev, ...intersecting])]);
    } else if (drag.kind === "draw") {
      if (drag.points.length > 1) {
        const element = createDrawingElement(makeId(), drag.points, nowISO(), getNextZIndex(elements));
        addElements([element]);
      }
      setDrawMode(false);
    }

    setDrag(null);
    setDragOverride({});
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const rect = containerRef.current!.getBoundingClientRect();
      const pivot = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setViewport((v) => zoomViewport(v, e.deltaY < 0 ? 1.1 : 0.9, pivot));
    } else {
      setViewport((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
    }
  }

  function zoomBy(factor: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    const pivot = rect ? { x: rect.width / 2, y: rect.height / 2 } : { x: 0, y: 0 };
    setViewport((v) => zoomViewport(v, factor, pivot));
  }

  // ---------------------------------------------------------------------
  // Images: drag-and-drop from the desktop + Ctrl+V paste
  // ---------------------------------------------------------------------

  async function insertImageFile(file: File, point: Point) {
    try {
      const { src, width, height } = await readImageFile(file);
      const element = createImageElement(makeId(), point.x - width / 2, point.y - height / 2, nowISO(), getNextZIndex(elements), src, width, height);
      addAndSelect(element);
    } catch {
      toast.error("Não foi possível carregar essa imagem.");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const point = toCanvasPoint(e.clientX, e.clientY);
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith("image/"));
    files.forEach((file) => insertImageFile(file, point));
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = [...e.clipboardData.items].filter((item) => item.type.startsWith("image/"));
    if (items.length === 0) return;
    e.preventDefault();
    for (const item of items) {
      const file = item.getAsFile();
      if (file) insertImageFile(file, lastPointerCanvasPos.current);
    }
  }

  // ---------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------

  function handleKeyDown(e: React.KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("textarea, input")) return;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
      e.preventDefault();
      duplicateSelection();
      return;
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      if (selectedIds.length > 0) {
        e.preventDefault();
        deleteSelection();
      }
    }
  }

  const selectRectStyle = drag?.kind === "select-rect" ? drag : null;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      className="relative h-full w-full touch-none overflow-hidden rounded-xl border border-border bg-canvas-white outline-none"
      style={{
        backgroundImage: "radial-gradient(circle, var(--color-ash) 1px, transparent 1px)",
        backgroundSize: `${GRID_SIZE * viewport.scale}px ${GRID_SIZE * viewport.scale}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      {elements.length === 0 ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="max-w-xs text-center">
            <p className="text-body-lg font-medium text-foreground">Seu canvas está vazio</p>
            <p className="mt-1 text-body text-muted-foreground">
              Use a barra acima para adicionar texto, notas ou links — ou arraste uma imagem aqui, ou cole com Ctrl+V.
            </p>
          </div>
        </div>
      ) : null}

      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}
      >
        {sortedElements.map((element) => {
          const merged = { ...element, ...dragOverride[element.id] } as CanvasElement;
          const selected = selectedIds.includes(element.id);
          return (
            <div
              key={element.id}
              data-canvas-element={element.id}
              className={elementBaseClassName(element, selected)}
              style={{ left: merged.x, top: merged.y, width: merged.width, height: merged.height, zIndex: merged.zIndex }}
            >
              <CanvasElementContent
                element={merged}
                editing={editingId === element.id}
                onStartEdit={() => setEditingId(element.id)}
                onCommitText={(value) => {
                  updateElement(element.id, { content: value } as Partial<CanvasElement>);
                  setEditingId(null);
                }}
                onCommitUrl={(url, title) => {
                  updateElement(element.id, { url, title } as Partial<CanvasElement>);
                  setEditingId(null);
                }}
              />
              {selected && element.type !== "drawing" && element.type !== "arrow" ? (
                <div
                  data-resize-handle="true"
                  className="absolute -right-1.5 -bottom-1.5 size-3 cursor-se-resize rounded-full border-2 border-electric-blue bg-canvas-white"
                />
              ) : null}
              {selected && element.type === "arrow" ? (
                <>
                  <div data-arrow-handle="start" className="absolute -left-1.5 -top-1.5 size-3 cursor-move rounded-full border-2 border-electric-blue bg-canvas-white" />
                  <div
                    data-arrow-handle="end"
                    className="absolute size-3 cursor-move rounded-full border-2 border-electric-blue bg-canvas-white"
                    style={{ left: merged.width - 6, top: merged.height - 6 }}
                  />
                </>
              ) : null}
            </div>
          );
        })}

        {drag?.kind === "draw" ? (
          <svg className="pointer-events-none absolute left-0 top-0 overflow-visible">
            <polyline
              points={drag.points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#171717"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>

      {selectRectStyle ? (
        <div
          className="pointer-events-none absolute border border-electric-blue bg-electric-blue/10"
          style={{
            left: Math.min(selectRectStyle.startCanvas.x, selectRectStyle.currentCanvas.x) * viewport.scale + viewport.x,
            top: Math.min(selectRectStyle.startCanvas.y, selectRectStyle.currentCanvas.y) * viewport.scale + viewport.y,
            width: Math.abs(selectRectStyle.currentCanvas.x - selectRectStyle.startCanvas.x) * viewport.scale,
            height: Math.abs(selectRectStyle.currentCanvas.y - selectRectStyle.startCanvas.y) * viewport.scale,
          }}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
        <CanvasToolbar
          drawMode={drawMode}
          onToggleDraw={() => setDrawMode((v) => !v)}
          onAdd={handleAdd}
          onZoomIn={() => zoomBy(1.2)}
          onZoomOut={() => zoomBy(1 / 1.2)}
          onResetView={() => setViewport({ x: 0, y: 0, scale: 1 })}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          hasSelection={selectedIds.length > 0}
          onDuplicateSelection={duplicateSelection}
          onDeleteSelection={deleteSelection}
        />
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-border bg-card px-2.5 py-1 text-caption text-muted-foreground shadow-subtle">
        {Math.round(viewport.scale * 100)}%
      </div>
    </div>
  );
}
