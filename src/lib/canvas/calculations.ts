import {
  DEFAULT_ELEMENT_SIZE,
  STICKY_COLORS,
  type ArrowElement,
  type CanvasElement,
  type DrawingElement,
  type GroupElement,
  type ImageElement,
  type LinkElement,
  type Point,
  type StickyElement,
  type TextElement,
  type Viewport,
} from "./types";

// ---------------------------------------------------------------------------
// Viewport (pan/zoom)
// ---------------------------------------------------------------------------

export const MIN_SCALE = 0.2;
export const MAX_SCALE = 3;

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/** Converts a point in screen space (e.g. clientX/Y) into canvas space, given the current viewport. */
export function screenToCanvas(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.x) / viewport.scale,
    y: (point.y - viewport.y) / viewport.scale,
  };
}

/**
 * Zooms the viewport by `factor`, keeping `pivot` (screen space, e.g. the mouse
 * position) visually anchored in place.
 */
export function zoomViewport(viewport: Viewport, factor: number, pivot: Point): Viewport {
  const nextScale = clampScale(viewport.scale * factor);
  const canvasPivot = screenToCanvas(pivot, viewport);
  return {
    scale: nextScale,
    x: pivot.x - canvasPivot.x * nextScale,
    y: pivot.y - canvasPivot.y * nextScale,
  };
}

// ---------------------------------------------------------------------------
// Element factories
// ---------------------------------------------------------------------------

function base(id: string, x: number, y: number, now: string, zIndex: number) {
  return { id, x, y, zIndex, createdAt: now, updatedAt: now };
}

export function createTextElement(id: string, x: number, y: number, now: string, zIndex: number, content = ""): TextElement {
  return { ...base(id, x, y, now, zIndex), ...DEFAULT_ELEMENT_SIZE.text, type: "text", content };
}

export function createStickyElement(
  id: string,
  x: number,
  y: number,
  now: string,
  zIndex: number,
  content = "",
  color: string = STICKY_COLORS[0]
): StickyElement {
  return { ...base(id, x, y, now, zIndex), ...DEFAULT_ELEMENT_SIZE.sticky, type: "sticky", content, color };
}

export function createImageElement(
  id: string,
  x: number,
  y: number,
  now: string,
  zIndex: number,
  src: string,
  width = DEFAULT_ELEMENT_SIZE.image.width,
  height = DEFAULT_ELEMENT_SIZE.image.height
): ImageElement {
  return { ...base(id, x, y, now, zIndex), width, height, type: "image", src };
}

export function boundingBoxOfPoints(points: Point[]): { x: number; y: number; width: number; height: number } {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export function createDrawingElement(
  id: string,
  points: Point[],
  now: string,
  zIndex: number,
  color = "#171717"
): DrawingElement {
  const box = boundingBoxOfPoints(points);
  // Points are stored relative to the element's own (x, y) origin.
  const relativePoints = points.map((p) => ({ x: p.x - box.x, y: p.y - box.y }));
  return { ...base(id, box.x, box.y, now, zIndex), width: box.width, height: box.height, type: "drawing", points: relativePoints, color };
}

export function createArrowElement(
  id: string,
  x: number,
  y: number,
  now: string,
  zIndex: number,
  width = DEFAULT_ELEMENT_SIZE.arrow.width,
  height = DEFAULT_ELEMENT_SIZE.arrow.height,
  color = "#2563eb"
): ArrowElement {
  return { ...base(id, x, y, now, zIndex), width, height, type: "arrow", color };
}

export function createLinkElement(
  id: string,
  x: number,
  y: number,
  now: string,
  zIndex: number,
  url: string,
  title?: string
): LinkElement {
  return { ...base(id, x, y, now, zIndex), ...DEFAULT_ELEMENT_SIZE.link, type: "link", url, title };
}

export function createGroupElement(id: string, x: number, y: number, now: string, zIndex: number, label = "Grupo"): GroupElement {
  return { ...base(id, x, y, now, zIndex), ...DEFAULT_ELEMENT_SIZE.group, type: "group", label };
}

// ---------------------------------------------------------------------------
// Manipulation
// ---------------------------------------------------------------------------

export function moveElement<T extends CanvasElement>(element: T, dx: number, dy: number): T {
  return { ...element, x: element.x + dx, y: element.y + dy };
}

const MIN_ELEMENT_SIZE = 24;

export function resizeElement<T extends CanvasElement>(element: T, width: number, height: number): T {
  return { ...element, width: Math.max(MIN_ELEMENT_SIZE, width), height: Math.max(MIN_ELEMENT_SIZE, height) };
}

export function getNextZIndex(elements: CanvasElement[]): number {
  return elements.reduce((max, el) => Math.max(max, el.zIndex), 0) + 1;
}

export const DUPLICATE_OFFSET = 24;

export function duplicateElement(element: CanvasElement, id: string, now: string, zIndex: number): CanvasElement {
  return {
    ...element,
    id,
    x: element.x + DUPLICATE_OFFSET,
    y: element.y + DUPLICATE_OFFSET,
    zIndex,
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Undo/redo history — generic, works over any snapshot type (element arrays here).
// ---------------------------------------------------------------------------

export type HistoryStack<T> = { past: T[]; future: T[] };

export const EMPTY_HISTORY: HistoryStack<never> = { past: [], future: [] };

export function pushHistory<T>(stack: HistoryStack<T>, snapshot: T, limit = 50): HistoryStack<T> {
  return { past: [...stack.past, snapshot].slice(-limit), future: [] };
}

export function undoHistory<T>(
  stack: HistoryStack<T>,
  current: T
): { stack: HistoryStack<T>; restored: T } | null {
  if (stack.past.length === 0) return null;
  const restored = stack.past[stack.past.length - 1];
  return {
    stack: { past: stack.past.slice(0, -1), future: [current, ...stack.future] },
    restored,
  };
}

export function redoHistory<T>(
  stack: HistoryStack<T>,
  current: T
): { stack: HistoryStack<T>; restored: T } | null {
  if (stack.future.length === 0) return null;
  const restored = stack.future[0];
  return {
    stack: { past: [...stack.past, current], future: stack.future.slice(1) },
    restored,
  };
}
