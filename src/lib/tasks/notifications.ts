import type { Task } from "./types";
import { isOverdue } from "./filters";

export type TaskNotification = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

const RECENTLY_COMPLETED_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Derives inbox notifications from the current task list — overdue, due
 * today, and recently completed. These are computed live (not stored), so
 * they always reflect the current state instead of going stale.
 */
export function deriveTaskNotifications(tasks: Task[], todayISO: string, nowMs: number): TaskNotification[] {
  const overdue = tasks.filter((t) => isOverdue(t, todayISO));
  const dueToday = tasks.filter((t) => t.dueDate === todayISO && t.status !== "concluido");
  const recentlyCompleted = tasks.filter(
    (t) => t.completedAt && nowMs - new Date(t.completedAt).getTime() <= RECENTLY_COMPLETED_WINDOW_MS
  );

  const notifications: TaskNotification[] = [
    ...overdue.map((t) => ({
      id: `task-overdue-${t.id}`,
      title: "Tarefa atrasada",
      description: t.title,
      createdAt: t.dueDate!,
      read: false,
    })),
    ...dueToday.map((t) => ({
      id: `task-due-today-${t.id}`,
      title: "Tarefa vence hoje",
      description: t.title,
      createdAt: t.dueDate!,
      read: false,
    })),
    ...recentlyCompleted.map((t) => ({
      id: `task-completed-${t.id}`,
      title: "Tarefa concluída",
      description: t.title,
      createdAt: t.completedAt!,
      read: false,
    })),
  ];

  return notifications.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
