// Domain types for the Tarefas module (Phase 4).

export type TaskStatus = "a_fazer" | "em_andamento" | "concluido";

export type TaskPriority = "baixa" | "media" | "alta";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type TaskAttachment = {
  id: string;
  name: string;
};

export type TaskRelations = {
  productId?: string;
  saleId?: string;
  contactId?: string;
};

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;

  // Everything below is optional — a task can be created with just a title.
  description?: string;
  priority?: TaskPriority;
  dueDate?: string; // ISO yyyy-MM-dd
  category?: string;
  checklist?: ChecklistItem[];
  attachments?: TaskAttachment[];
  relations?: TaskRelations;
  completedAt?: string;
  /** Manual ordering within a day, used by "Planejar amanhã". Lower comes first. */
  order?: number;
};

/** A status column, customizable but kept simple — no branching workflow rules. */
export type StatusColumn = {
  id: TaskStatus;
  label: string;
};

export const DEFAULT_STATUS_COLUMNS: StatusColumn[] = [
  { id: "a_fazer", label: "A fazer" },
  { id: "em_andamento", label: "Em andamento" },
  { id: "concluido", label: "Concluído" },
];
