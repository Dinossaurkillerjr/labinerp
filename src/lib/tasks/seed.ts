import type { Task } from "./types";

function iso(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

const now = new Date().toISOString();

export const SEED_TASKS: Task[] = [
  {
    id: "seed-task-1",
    title: "Fechar fornecedor de tecido",
    status: "a_fazer",
    priority: "alta",
    dueDate: iso(0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-task-2",
    title: "Revisar fotos da nova coleção",
    status: "em_andamento",
    priority: "media",
    dueDate: iso(1),
    description: "Selecionar as 10 melhores fotos para o feed.",
    checklist: [
      { id: "c1", label: "Selecionar fotos", done: true },
      { id: "c2", label: "Editar cores", done: false },
      { id: "c3", label: "Exportar em alta resolução", done: false },
    ],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-task-3",
    title: "Responder DMs do Instagram",
    status: "a_fazer",
    priority: "media",
    dueDate: iso(0),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-task-4",
    title: "Planejar campanha do dia dos pais",
    status: "a_fazer",
    priority: "baixa",
    dueDate: iso(5),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-task-5",
    title: "Pagar aluguel do ateliê",
    status: "a_fazer",
    priority: "alta",
    dueDate: iso(-2),
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "seed-task-6",
    title: "Trocar foto do produto Camiseta Oversized",
    status: "concluido",
    priority: "baixa",
    completedAt: now,
    createdAt: now,
    updatedAt: now,
  },
];
