// Domain types for the Canvas module (Phase 4) — a single infinite board.

export type CanvasElementType = "text" | "sticky" | "image" | "drawing" | "arrow" | "link" | "group";

export type BaseCanvasElement = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  createdAt: string;
  updatedAt: string;
};

export type TextElement = BaseCanvasElement & { type: "text"; content: string };

export type StickyElement = BaseCanvasElement & { type: "sticky"; content: string; color: string };

export type ImageElement = BaseCanvasElement & { type: "image"; src: string };

export type Point = { x: number; y: number };

export type DrawingElement = BaseCanvasElement & { type: "drawing"; points: Point[]; color: string };

/** Anchored by (x, y) → (x + width, y + height). */
export type ArrowElement = BaseCanvasElement & { type: "arrow"; color: string };

export type LinkElement = BaseCanvasElement & { type: "link"; url: string; title?: string };

/** A labeled frame for visual grouping — does not parent other elements. */
export type GroupElement = BaseCanvasElement & { type: "group"; label: string };

export type CanvasElement =
  | TextElement
  | StickyElement
  | ImageElement
  | DrawingElement
  | ArrowElement
  | LinkElement
  | GroupElement;

export type Viewport = { x: number; y: number; scale: number };

export const STICKY_COLORS = ["#fef3c7", "#dcfce7", "#dbeafe", "#fce7f3", "#ede9fe"] as const;

export const DEFAULT_ELEMENT_SIZE: Record<CanvasElementType, { width: number; height: number }> = {
  text: { width: 200, height: 60 },
  sticky: { width: 200, height: 160 },
  image: { width: 240, height: 180 },
  drawing: { width: 0, height: 0 }, // computed from points
  arrow: { width: 160, height: 0 },
  link: { width: 260, height: 72 },
  group: { width: 320, height: 240 },
};
