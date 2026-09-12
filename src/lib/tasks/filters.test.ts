import { describe, expect, it } from "vitest";
import {
  applyTaskFilters,
  filterByPeriod,
  groupByDate,
  groupByStatus,
  isOverdue,
  getTasksForDate,
  tomorrowISO,
  NO_DATE_BUCKET,
} from "./filters";
import { DEFAULT_STATUS_COLUMNS, type Task } from "./types";

const TODAY = "2026-09-15";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: `t-${Math.random()}`,
    title: "Tarefa",
    status: "a_fazer",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("isOverdue", () => {
  it("é atrasada quando a data de vencimento já passou e não está concluída", () => {
    expect(isOverdue(makeTask({ dueDate: "2026-09-10" }), TODAY)).toBe(true);
  });

  it("não é atrasada se já está concluída", () => {
    expect(isOverdue(makeTask({ dueDate: "2026-09-10", status: "concluido" }), TODAY)).toBe(false);
  });

  it("não é atrasada sem data de vencimento", () => {
    expect(isOverdue(makeTask(), TODAY)).toBe(false);
  });
});

describe("filterByPeriod", () => {
  const tasks = [
    makeTask({ id: "hoje", dueDate: TODAY }),
    makeTask({ id: "amanha", dueDate: "2026-09-16" }),
    makeTask({ id: "semana", dueDate: "2026-09-20" }),
    makeTask({ id: "fora-da-semana", dueDate: "2026-09-25" }),
    makeTask({ id: "atrasada", dueDate: "2026-09-01" }),
    makeTask({ id: "sem-data" }),
  ];

  it('"hoje" retorna só tarefas com vencimento hoje', () => {
    const result = filterByPeriod(tasks, "hoje", TODAY);
    expect(result.map((t) => t.id)).toEqual(["hoje"]);
  });

  it('"semana" retorna tarefas nos próximos 7 dias (incluindo hoje)', () => {
    const result = filterByPeriod(tasks, "semana", TODAY);
    expect(result.map((t) => t.id).sort()).toEqual(["amanha", "hoje", "semana"].sort());
  });

  it('"atrasadas" retorna tarefas vencidas e não concluídas', () => {
    const result = filterByPeriod(tasks, "atrasadas", TODAY);
    expect(result.map((t) => t.id)).toEqual(["atrasada"]);
  });

  it('"todas" retorna tudo sem filtrar', () => {
    expect(filterByPeriod(tasks, "todas", TODAY)).toHaveLength(tasks.length);
  });
});

describe("applyTaskFilters", () => {
  const tasks = [
    makeTask({ id: "a", priority: "alta", status: "a_fazer", title: "Fechar fornecedor" }),
    makeTask({ id: "b", priority: "baixa", status: "concluido", title: "Responder email" }),
  ];

  it("combina prioridade, status e busca", () => {
    expect(applyTaskFilters(tasks, { priority: "alta" }, TODAY).map((t) => t.id)).toEqual(["a"]);
    expect(applyTaskFilters(tasks, { status: "concluido" }, TODAY).map((t) => t.id)).toEqual(["b"]);
    expect(applyTaskFilters(tasks, { search: "fornecedor" }, TODAY).map((t) => t.id)).toEqual(["a"]);
  });
});

describe("groupByStatus", () => {
  it("agrupa tarefas nas colunas de status para o Kanban", () => {
    const tasks = [
      makeTask({ id: "a", status: "a_fazer" }),
      makeTask({ id: "b", status: "em_andamento" }),
      makeTask({ id: "c", status: "a_fazer" }),
    ];
    const grouped = groupByStatus(tasks, DEFAULT_STATUS_COLUMNS);
    expect(grouped.a_fazer.map((t) => t.id)).toEqual(["a", "c"]);
    expect(grouped.em_andamento.map((t) => t.id)).toEqual(["b"]);
    expect(grouped.concluido).toEqual([]);
  });
});

describe("groupByDate", () => {
  it("agrupa por data ascendente e joga tarefas sem data no fim", () => {
    const tasks = [
      makeTask({ id: "later", dueDate: "2026-09-20" }),
      makeTask({ id: "none" }),
      makeTask({ id: "earlier", dueDate: "2026-09-10" }),
    ];
    const groups = groupByDate(tasks);
    expect(groups.map((g) => g.date)).toEqual(["2026-09-10", "2026-09-20", NO_DATE_BUCKET]);
  });
});

describe("planejar amanhã", () => {
  it("tomorrowISO calcula o dia seguinte corretamente", () => {
    expect(tomorrowISO(TODAY)).toBe("2026-09-16");
  });

  it("getTasksForDate retorna só as tarefas daquele dia, ordenadas", () => {
    const tasks = [
      makeTask({ id: "b", dueDate: "2026-09-16", order: 2 }),
      makeTask({ id: "a", dueDate: "2026-09-16", order: 1 }),
      makeTask({ id: "outro-dia", dueDate: "2026-09-17" }),
    ];
    expect(getTasksForDate(tasks, "2026-09-16").map((t) => t.id)).toEqual(["a", "b"]);
  });
});
