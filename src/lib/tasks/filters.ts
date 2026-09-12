import type { StatusColumn, Task, TaskPriority, TaskStatus } from "./types";

export type TaskPeriod = "todas" | "hoje" | "semana" | "atrasadas";

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function isOverdue(task: Task, todayISO: string): boolean {
  return Boolean(task.dueDate) && task.dueDate! < todayISO && task.status !== "concluido";
}

export function filterByPeriod(tasks: Task[], period: TaskPeriod, todayISO: string): Task[] {
  if (period === "todas") return tasks;

  if (period === "hoje") {
    return tasks.filter((t) => t.dueDate === todayISO);
  }

  if (period === "semana") {
    const weekEnd = addDays(todayISO, 6);
    return tasks.filter((t) => t.dueDate && t.dueDate >= todayISO && t.dueDate <= weekEnd);
  }

  // atrasadas
  return tasks.filter((t) => isOverdue(t, todayISO));
}

export type TaskFilters = {
  period?: TaskPeriod;
  priority?: TaskPriority;
  status?: TaskStatus;
  search?: string;
};

export function applyTaskFilters(tasks: Task[], filters: TaskFilters, todayISO: string): Task[] {
  let result = tasks;
  if (filters.period) result = filterByPeriod(result, filters.period, todayISO);
  if (filters.priority) result = result.filter((t) => t.priority === filters.priority);
  if (filters.status) result = result.filter((t) => t.status === filters.status);
  if (filters.search?.trim()) {
    const term = filters.search.trim().toLowerCase();
    result = result.filter(
      (t) => t.title.toLowerCase().includes(term) || t.description?.toLowerCase().includes(term)
    );
  }
  return result;
}

function taskSortKey(task: Task): number {
  return task.order ?? new Date(task.createdAt).getTime();
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => taskSortKey(a) - taskSortKey(b));
}

export function groupByStatus(tasks: Task[], columns: StatusColumn[]): Record<TaskStatus, Task[]> {
  const grouped = Object.fromEntries(columns.map((c) => [c.id, [] as Task[]])) as Record<TaskStatus, Task[]>;
  for (const task of sortTasks(tasks)) {
    if (grouped[task.status]) grouped[task.status].push(task);
  }
  return grouped;
}

export const NO_DATE_BUCKET = "sem-data";

export type AgendaGroup = { date: string; tasks: Task[] };

/** Groups tasks by due date (yyyy-MM-dd), ascending; tasks without a date go last, under NO_DATE_BUCKET. */
export function groupByDate(tasks: Task[]): AgendaGroup[] {
  const buckets = new Map<string, Task[]>();
  for (const task of tasks) {
    const key = task.dueDate ?? NO_DATE_BUCKET;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(task);
  }

  const dated = [...buckets.entries()]
    .filter(([date]) => date !== NO_DATE_BUCKET)
    .sort(([a], [b]) => (a < b ? -1 : 1));
  const undated = buckets.get(NO_DATE_BUCKET);

  const groups = dated.map(([date, groupTasks]) => ({ date, tasks: sortTasks(groupTasks) }));
  if (undated?.length) groups.push({ date: NO_DATE_BUCKET, tasks: sortTasks(undated) });
  return groups;
}

/** Tasks due tomorrow, used by the "Planejar amanhã" flow. */
export function getTasksForDate(tasks: Task[], dateISO: string): Task[] {
  return sortTasks(tasks.filter((t) => t.dueDate === dateISO));
}

export function tomorrowISO(todayISO: string): string {
  return addDays(todayISO, 1);
}
