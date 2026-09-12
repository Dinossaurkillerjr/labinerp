"use client";

import * as React from "react";
import type { ChecklistItem, Task, TaskPriority, TaskStatus } from "./types";
import { tasksReducer, type TasksAction, type TasksState } from "./tasks-reducer";
import { usePersistentReducer } from "@/lib/persistent-reducer";
import { SEED_TASKS } from "./seed";

const STORAGE_KEY = "erp-tasks-v1";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function seededState(): TasksState {
  return { tasks: SEED_TASKS };
}

export type NewTaskInput = {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
};

type TasksContextValue = {
  tasks: Task[];
  addTask: (input: NewTaskInput) => Task;
  updateTask: (id: string, changes: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setChecklist: (id: string, checklist: ChecklistItem[]) => void;
  reorderTasks: (orderedIds: string[]) => void;
  getTask: (id: string) => Task | undefined;
};

const TasksContext = React.createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = usePersistentReducer<TasksState, TasksAction>(
    tasksReducer,
    seededState,
    STORAGE_KEY,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState })
  );

  const value = React.useMemo<TasksContextValue>(
    () => ({
      tasks: state.tasks,

      addTask(input: NewTaskInput): Task {
        const timestamp = nowISO();
        const task: Task = {
          id: makeId(),
          title: input.title,
          status: input.status ?? "a_fazer",
          priority: input.priority,
          dueDate: input.dueDate,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        dispatch({ type: "ADD_TASK", task });
        return task;
      },

      updateTask(id, changes) {
        dispatch({ type: "UPDATE_TASK", id, changes, at: nowISO() });
      },

      deleteTask(id) {
        dispatch({ type: "DELETE_TASK", id });
      },

      setTaskStatus(id, status) {
        dispatch({ type: "SET_STATUS", id, status, at: nowISO() });
      },

      setChecklist(id, checklist) {
        dispatch({ type: "SET_CHECKLIST", id, checklist, at: nowISO() });
      },

      reorderTasks(orderedIds) {
        dispatch({ type: "REORDER_TASKS", orderedIds, at: nowISO() });
      },

      getTask(id) {
        return state.tasks.find((t) => t.id === id);
      },
    }),
    [state, dispatch]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = React.useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}
