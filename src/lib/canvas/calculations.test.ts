import { describe, expect, it } from "vitest";
import {
  clampScale,
  screenToCanvas,
  zoomViewport,
  createTextElement,
  createStickyElement,
  createDrawingElement,
  boundingBoxOfPoints,
  moveElement,
  resizeElement,
  duplicateElement,
  getNextZIndex,
  pushHistory,
  undoHistory,
  redoHistory,
  type HistoryStack,
} from "./calculations";

const NOW = "2026-09-15T12:00:00.000Z";

describe("clampScale", () => {
  it("mantém o zoom dentro dos limites mínimo e máximo", () => {
    expect(clampScale(0.01)).toBe(0.2);
    expect(clampScale(10)).toBe(3);
    expect(clampScale(1.5)).toBe(1.5);
  });
});

describe("screenToCanvas / zoomViewport", () => {
  it("converte um ponto de tela para o espaço do canvas considerando pan e zoom", () => {
    const viewport = { x: 100, y: 50, scale: 2 };
    expect(screenToCanvas({ x: 300, y: 150 }, viewport)).toEqual({ x: 100, y: 50 });
  });

  it("zoom mantém o ponto pivô fixo na tela", () => {
    const viewport = { x: 0, y: 0, scale: 1 };
    const pivot = { x: 200, y: 200 };
    const zoomed = zoomViewport(viewport, 2, pivot);
    // o mesmo ponto de tela deve mapear para o mesmo ponto de canvas antes e depois
    const before = screenToCanvas(pivot, viewport);
    const after = screenToCanvas(pivot, zoomed);
    expect(after.x).toBeCloseTo(before.x, 5);
    expect(after.y).toBeCloseTo(before.y, 5);
    expect(zoomed.scale).toBe(2);
  });
});

describe("element factories", () => {
  it("cria um elemento de texto com tamanho padrão", () => {
    const el = createTextElement("t1", 10, 20, NOW, 1);
    expect(el).toMatchObject({ id: "t1", type: "text", x: 10, y: 20, content: "" });
    expect(el.width).toBeGreaterThan(0);
  });

  it("cria um sticky note com cor padrão", () => {
    const el = createStickyElement("s1", 0, 0, NOW, 1);
    expect(el.type).toBe("sticky");
    expect(el.color).toBeTruthy();
  });
});

describe("boundingBoxOfPoints / createDrawingElement", () => {
  it("calcula a caixa delimitadora de um traço", () => {
    const box = boundingBoxOfPoints([{ x: 10, y: 10 }, { x: 50, y: 30 }, { x: 20, y: 60 }]);
    expect(box).toEqual({ x: 10, y: 10, width: 40, height: 50 });
  });

  it("armazena os pontos do desenho relativos à origem do elemento", () => {
    const el = createDrawingElement("d1", [{ x: 10, y: 10 }, { x: 50, y: 30 }], NOW, 1);
    expect(el.x).toBe(10);
    expect(el.y).toBe(10);
    expect(el.points).toEqual([{ x: 0, y: 0 }, { x: 40, y: 20 }]);
  });
});

describe("moveElement / resizeElement", () => {
  it("move um elemento por um delta", () => {
    const el = createTextElement("t1", 10, 10, NOW, 1);
    const moved = moveElement(el, 5, -5);
    expect(moved.x).toBe(15);
    expect(moved.y).toBe(5);
  });

  it("redimensiona respeitando um tamanho mínimo", () => {
    const el = createTextElement("t1", 0, 0, NOW, 1);
    const resized = resizeElement(el, 5, 5);
    expect(resized.width).toBeGreaterThanOrEqual(24);
    expect(resized.height).toBeGreaterThanOrEqual(24);
  });
});

describe("duplicateElement / getNextZIndex", () => {
  it("duplica com novo id, deslocado, e z-index acima dos existentes", () => {
    const original = createTextElement("t1", 10, 10, NOW, 3);
    const dup = duplicateElement(original, "t2", "2026-09-15T13:00:00.000Z", 4);
    expect(dup.id).toBe("t2");
    expect(dup.x).toBe(34);
    expect(dup.y).toBe(34);
    expect(dup.zIndex).toBe(4);
  });

  it("getNextZIndex retorna o maior z-index + 1", () => {
    const elements = [createTextElement("a", 0, 0, NOW, 2), createTextElement("b", 0, 0, NOW, 5)];
    expect(getNextZIndex(elements)).toBe(6);
  });
});

describe("undo/redo history", () => {
  it("pushHistory acumula estados e limpa o future", () => {
    let stack: HistoryStack<number> = { past: [], future: [1] };
    stack = pushHistory(stack, 1);
    expect(stack.past).toEqual([1]);
    expect(stack.future).toEqual([]);
  });

  it("undoHistory restaura o último estado e move o atual para future", () => {
    const stack: HistoryStack<number> = { past: [1, 2], future: [] };
    const result = undoHistory(stack, 3);
    expect(result?.restored).toBe(2);
    expect(result?.stack.past).toEqual([1]);
    expect(result?.stack.future).toEqual([3]);
  });

  it("redoHistory reaplica o próximo estado do future", () => {
    const stack: HistoryStack<number> = { past: [1], future: [3] };
    const result = redoHistory(stack, 2);
    expect(result?.restored).toBe(3);
    expect(result?.stack.past).toEqual([1, 2]);
    expect(result?.stack.future).toEqual([]);
  });

  it("undo/redo retornam null quando não há histórico", () => {
    expect(undoHistory({ past: [], future: [] }, 1)).toBeNull();
    expect(redoHistory({ past: [], future: [] }, 1)).toBeNull();
  });

  it("respeita o limite de histórico (não cresce indefinidamente)", () => {
    let stack: HistoryStack<number> = { past: [], future: [] };
    for (let i = 0; i < 10; i++) stack = pushHistory(stack, i, 5);
    expect(stack.past).toHaveLength(5);
    expect(stack.past).toEqual([5, 6, 7, 8, 9]);
  });
});
