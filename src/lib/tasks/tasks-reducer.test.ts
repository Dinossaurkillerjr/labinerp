import { describe, expect, it } from "vitest";
import { tasksReducer, EMPTY_TASKS_STATE } from "./tasks-reducer";
import type { Task } from "./types";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "t1",
    title: "Trocar foto do produto",
    status: "a_fazer",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("tasksReducer", () => {
  it("ADD_TASK cria uma tarefa só com título (criação rápida)", () => {
    const state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask() });
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe("Trocar foto do produto");
    expect(state.tasks[0].priority).toBeUndefined();
    expect(state.tasks[0].dueDate).toBeUndefined();
  });

  it("UPDATE_TASK adiciona detalhes depois (complexidade progressiva)", () => {
    let state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask() });
    state = tasksReducer(state, {
      type: "UPDATE_TASK",
      id: "t1",
      changes: { priority: "alta", dueDate: "2026-09-20" },
      at: "2026-09-02T00:00:00.000Z",
    });
    expect(state.tasks[0].priority).toBe("alta");
    expect(state.tasks[0].dueDate).toBe("2026-09-20");
  });

  it("UPDATE_TASK remove a prioridade quando enviada como undefined (\"Sem prioridade\")", () => {
    let state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask({ priority: "alta" }) });
    expect(state.tasks[0].priority).toBe("alta");
    state = tasksReducer(state, {
      type: "UPDATE_TASK",
      id: "t1",
      changes: { priority: undefined },
      at: "2026-09-02T00:00:00.000Z",
    });
    expect(state.tasks[0].priority).toBeUndefined();
  });

  it("UPDATE_TASK guarda tags coloridas na tarefa", () => {
    let state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask() });
    state = tasksReducer(state, {
      type: "UPDATE_TASK",
      id: "t1",
      changes: { tags: [{ id: "tag-1", label: "Urgente", color: "orange" }] },
      at: "2026-09-02T00:00:00.000Z",
    });
    expect(state.tasks[0].tags).toEqual([{ id: "tag-1", label: "Urgente", color: "orange" }]);
  });

  it("SET_STATUS move a tarefa de coluna e marca completedAt ao concluir", () => {
    let state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask() });
    state = tasksReducer(state, { type: "SET_STATUS", id: "t1", status: "concluido", at: "2026-09-03T00:00:00.000Z" });
    expect(state.tasks[0].status).toBe("concluido");
    expect(state.tasks[0].completedAt).toBe("2026-09-03T00:00:00.000Z");
  });

  it("SET_STATUS limpa completedAt ao voltar a tarefa para outra coluna", () => {
    let state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask({ status: "concluido", completedAt: "2026-09-03T00:00:00.000Z" }) });
    state = tasksReducer(state, { type: "SET_STATUS", id: "t1", status: "a_fazer", at: "2026-09-04T00:00:00.000Z" });
    expect(state.tasks[0].completedAt).toBeUndefined();
  });

  it("SET_CHECKLIST atualiza os itens de checklist", () => {
    let state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask() });
    state = tasksReducer(state, {
      type: "SET_CHECKLIST",
      id: "t1",
      checklist: [{ id: "c1", label: "Fotografar", done: true }],
      at: "2026-09-02T00:00:00.000Z",
    });
    expect(state.tasks[0].checklist).toEqual([{ id: "c1", label: "Fotografar", done: true }]);
  });

  it("REORDER_TASKS define a ordem manual (usado no Planejar amanhã)", () => {
    let state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask({ id: "a" }) });
    state = tasksReducer(state, { type: "ADD_TASK", task: makeTask({ id: "b" }) });
    state = tasksReducer(state, { type: "REORDER_TASKS", orderedIds: ["b", "a"], at: "2026-09-02T00:00:00.000Z" });
    const byId = Object.fromEntries(state.tasks.map((t) => [t.id, t.order]));
    expect(byId.b).toBe(0);
    expect(byId.a).toBe(1);
  });

  it("DELETE_TASK remove a tarefa", () => {
    let state = tasksReducer(EMPTY_TASKS_STATE, { type: "ADD_TASK", task: makeTask() });
    state = tasksReducer(state, { type: "DELETE_TASK", id: "t1" });
    expect(state.tasks).toHaveLength(0);
  });

  it("HYDRATE substitui o estado inteiro com os dados persistidos", () => {
    const persisted = { tasks: [makeTask({ id: "persisted-1" })] };
    const state = tasksReducer(EMPTY_TASKS_STATE, { type: "HYDRATE", state: persisted });
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].id).toBe("persisted-1");
  });
});
