import type { CanvasElement } from "./types";

export type CanvasState = {
  elements: CanvasElement[];
};

export const EMPTY_CANVAS_STATE: CanvasState = { elements: [] };

export type CanvasAction =
  | { type: "HYDRATE"; state: CanvasState }
  | { type: "ADD_ELEMENT"; element: CanvasElement }
  | { type: "ADD_ELEMENTS"; elements: CanvasElement[] }
  | { type: "UPDATE_ELEMENT"; id: string; changes: Partial<CanvasElement> }
  | { type: "UPDATE_ELEMENTS"; updates: { id: string; changes: Partial<CanvasElement> }[] }
  | { type: "DELETE_ELEMENTS"; ids: string[] };

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_ELEMENT":
      return { elements: [...state.elements, action.element] };

    case "ADD_ELEMENTS":
      return { elements: [...state.elements, ...action.elements] };

    case "UPDATE_ELEMENT":
      return {
        elements: state.elements.map((el) =>
          el.id === action.id ? ({ ...el, ...action.changes } as CanvasElement) : el
        ),
      };

    case "UPDATE_ELEMENTS": {
      const changesById = new Map(action.updates.map((u) => [u.id, u.changes]));
      return {
        elements: state.elements.map((el) =>
          changesById.has(el.id) ? ({ ...el, ...changesById.get(el.id) } as CanvasElement) : el
        ),
      };
    }

    case "DELETE_ELEMENTS": {
      const idSet = new Set(action.ids);
      return { elements: state.elements.filter((el) => !idSet.has(el.id)) };
    }

    default:
      return state;
  }
}
