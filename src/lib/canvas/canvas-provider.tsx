"use client";

import * as React from "react";
import type { CanvasElement } from "./types";
import { canvasReducer, type CanvasAction, type CanvasState } from "./canvas-reducer";
import { usePersistentReducer } from "@/lib/persistent-reducer";
import { pushHistory, undoHistory, redoHistory, type HistoryStack } from "./calculations";
import { SEED_ELEMENTS } from "./seed";

const STORAGE_KEY = "erp-canvas-v1";

function seededState(): CanvasState {
  return { elements: SEED_ELEMENTS };
}

type CanvasContextValue = {
  elements: CanvasElement[];
  /** Adds one or more elements as a single undoable step. */
  addElements: (elements: CanvasElement[]) => void;
  /** Commits a change to one element (move/resize/edit) as a single undoable step. */
  updateElement: (id: string, changes: Partial<CanvasElement>) => void;
  /** Commits changes to several elements at once (e.g. multi-select drag) as one undoable step. */
  updateElements: (updates: { id: string; changes: Partial<CanvasElement> }[]) => void;
  deleteElements: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const CanvasContext = React.createContext<CanvasContextValue | null>(null);

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = usePersistentReducer<CanvasState, CanvasAction>(
    canvasReducer,
    seededState,
    STORAGE_KEY,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState })
  );

  // Undo/redo history lives only in memory (never persisted): it holds full
  // element-array snapshots, which would otherwise bloat localStorage with
  // duplicated image data URLs. Losing undo history on reload is an accepted
  // trade-off — see the Phase 4 report.
  const [history, setHistory] = React.useState<HistoryStack<CanvasElement[]>>({ past: [], future: [] });

  function commit(action: CanvasAction) {
    setHistory((h) => pushHistory(h, state.elements));
    dispatch(action);
  }

  const value = React.useMemo<CanvasContextValue>(
    () => ({
      elements: state.elements,

      addElements(elements) {
        commit({ type: "ADD_ELEMENTS", elements });
      },

      updateElement(id, changes) {
        commit({ type: "UPDATE_ELEMENT", id, changes });
      },

      updateElements(updates) {
        commit({ type: "UPDATE_ELEMENTS", updates });
      },

      deleteElements(ids) {
        commit({ type: "DELETE_ELEMENTS", ids });
      },

      undo() {
        const result = undoHistory(history, state.elements);
        if (!result) return;
        setHistory(result.stack);
        dispatch({ type: "HYDRATE", state: { elements: result.restored } });
      },

      redo() {
        const result = redoHistory(history, state.elements);
        if (!result) return;
        setHistory(result.stack);
        dispatch({ type: "HYDRATE", state: { elements: result.restored } });
      },

      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, history, dispatch]
  );

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvas() {
  const ctx = React.useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within a CanvasProvider");
  return ctx;
}
