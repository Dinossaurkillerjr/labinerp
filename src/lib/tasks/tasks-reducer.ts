import type { ChecklistItem, Task, TaskStatus } from "./types";

export type TasksState = {
  tasks: Task[];
};

export const EMPTY_TASKS_STATE: TasksState = { tasks: [] };

export type TasksAction =
  | { type: "HYDRATE"; state: TasksState }
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; id: string; changes: Partial<Task>; at: string }
  | { type: "DELETE_TASK"; id: string }
  | { type: "SET_STATUS"; id: string; status: TaskStatus; at: string }
  | { type: "SET_CHECKLIST"; id: string; checklist: ChecklistItem[]; at: string }
  | { type: "REORDER_TASKS"; orderedIds: string[]; at: string };

export function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.task] };

    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, ...action.changes, updatedAt: action.at } : t)),
      };

    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };

    case "SET_STATUS":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id
            ? {
                ...t,
                status: action.status,
                updatedAt: action.at,
                completedAt: action.status === "concluido" ? action.at : undefined,
              }
            : t
        ),
      };

    case "SET_CHECKLIST":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, checklist: action.checklist, updatedAt: action.at } : t
        ),
      };

    case "REORDER_TASKS": {
      const orderById = new Map(action.orderedIds.map((id, index) => [id, index]));
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          orderById.has(t.id) ? { ...t, order: orderById.get(t.id), updatedAt: action.at } : t
        ),
      };
    }

    default:
      return state;
  }
}
