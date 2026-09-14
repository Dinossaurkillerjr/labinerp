"use client";

import * as React from "react";
import type { ChecklistItem, Task, TaskPriority, TaskStatus } from "./types";
import { tasksReducer, EMPTY_TASKS_STATE, type TasksAction, type TasksState } from "./tasks-reducer";
import { useSupabaseReducer } from "@/lib/supabase/use-supabase-reducer";
import { diffById } from "@/lib/supabase/diff-collection";
import { deleteTasks, fetchTasks, upsertTasks } from "./repository";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

async function fetchInitial(userId: string): Promise<TasksState> {
  return { tasks: await fetchTasks(userId) };
}

async function sync(userId: string, previous: TasksState, next: TasksState): Promise<void> {
  const { inserted, updated, deletedIds } = diffById(previous.tasks, next.tasks);
  await Promise.all([upsertTasks(userId, [...inserted, ...updated]), deleteTasks(userId, deletedIds)]);
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
  const [state, dispatch] = useSupabaseReducer<TasksState, TasksAction>(
    tasksReducer,
    EMPTY_TASKS_STATE,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState }),
    fetchInitial,
    sync
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
