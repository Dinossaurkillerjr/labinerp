import { describe, expect, it } from "vitest";
import { canvasReducer, EMPTY_CANVAS_STATE } from "./canvas-reducer";
import { createTextElement } from "./calculations";

const NOW = "2026-09-15T12:00:00.000Z";

describe("canvasReducer", () => {
  it("ADD_ELEMENT adiciona um elemento", () => {
    const el = createTextElement("t1", 0, 0, NOW, 1);
    const state = canvasReducer(EMPTY_CANVAS_STATE, { type: "ADD_ELEMENT", element: el });
    expect(state.elements).toHaveLength(1);
  });

  it("UPDATE_ELEMENT altera só o elemento indicado (usado para mover/redimensionar)", () => {
    const a = createTextElement("a", 0, 0, NOW, 1);
    const b = createTextElement("b", 0, 0, NOW, 2);
    let state = canvasReducer(EMPTY_CANVAS_STATE, { type: "ADD_ELEMENTS", elements: [a, b] });
    state = canvasReducer(state, { type: "UPDATE_ELEMENT", id: "a", changes: { x: 100, y: 50 } });

    expect(state.elements.find((e) => e.id === "a")).toMatchObject({ x: 100, y: 50 });
    expect(state.elements.find((e) => e.id === "b")).toMatchObject({ x: 0, y: 0 });
  });

  it("UPDATE_ELEMENTS aplica mudanças em lote (multi-seleção)", () => {
    const a = createTextElement("a", 0, 0, NOW, 1);
    const b = createTextElement("b", 10, 10, NOW, 2);
    let state = canvasReducer(EMPTY_CANVAS_STATE, { type: "ADD_ELEMENTS", elements: [a, b] });
    state = canvasReducer(state, {
      type: "UPDATE_ELEMENTS",
      updates: [
        { id: "a", changes: { x: 5, y: 5 } },
        { id: "b", changes: { x: 15, y: 15 } },
      ],
    });
    expect(state.elements.find((e) => e.id === "a")).toMatchObject({ x: 5, y: 5 });
    expect(state.elements.find((e) => e.id === "b")).toMatchObject({ x: 15, y: 15 });
  });

  it("DELETE_ELEMENTS remove os elementos indicados", () => {
    const a = createTextElement("a", 0, 0, NOW, 1);
    const b = createTextElement("b", 0, 0, NOW, 2);
    let state = canvasReducer(EMPTY_CANVAS_STATE, { type: "ADD_ELEMENTS", elements: [a, b] });
    state = canvasReducer(state, { type: "DELETE_ELEMENTS", ids: ["a"] });
    expect(state.elements.map((e) => e.id)).toEqual(["b"]);
  });

  it("HYDRATE substitui o estado inteiro (carregar do storage ou restaurar undo)", () => {
    const persisted = { elements: [createTextElement("persisted-1", 0, 0, NOW, 1)] };
    const state = canvasReducer(EMPTY_CANVAS_STATE, { type: "HYDRATE", state: persisted });
    expect(state.elements).toHaveLength(1);
    expect(state.elements[0].id).toBe("persisted-1");
  });
});
