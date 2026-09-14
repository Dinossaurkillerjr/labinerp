import { describe, expect, it } from "vitest";
import { planningReducer, EMPTY_PLANNING_STATE } from "./planning-reducer";
import type { ProfitAllocation } from "./types";

function makeAllocation(overrides: Partial<ProfitAllocation> = {}): ProfitAllocation {
  return {
    monthId: "2026-09",
    reinvestimento: 200000,
    reserva: 100000,
    retirada: 100000,
    outro: 0,
    updatedAt: "2026-09-30T00:00:00.000Z",
    ...overrides,
  };
}

describe("planningReducer", () => {
  it("SET_ALLOCATION adiciona uma destinação para o mês", () => {
    const state = planningReducer(EMPTY_PLANNING_STATE, { type: "SET_ALLOCATION", allocation: makeAllocation() });
    expect(state.allocations).toHaveLength(1);
    expect(state.allocations[0].monthId).toBe("2026-09");
  });

  it("SET_ALLOCATION substitui a destinação existente do mesmo mês em vez de duplicar", () => {
    let state = planningReducer(EMPTY_PLANNING_STATE, { type: "SET_ALLOCATION", allocation: makeAllocation() });
    state = planningReducer(state, {
      type: "SET_ALLOCATION",
      allocation: makeAllocation({ reinvestimento: 300000 }),
    });
    expect(state.allocations).toHaveLength(1);
    expect(state.allocations[0].reinvestimento).toBe(300000);
  });

  it("REMOVE_ALLOCATION remove a destinação do mês", () => {
    let state = planningReducer(EMPTY_PLANNING_STATE, { type: "SET_ALLOCATION", allocation: makeAllocation() });
    state = planningReducer(state, { type: "REMOVE_ALLOCATION", monthId: "2026-09" });
    expect(state.allocations).toHaveLength(0);
  });

  it("SET_BUDGET adiciona uma meta para a categoria", () => {
    const state = planningReducer(EMPTY_PLANNING_STATE, {
      type: "SET_BUDGET",
      budget: { categoryId: "marketing", kind: "valor", value: 150000 },
    });
    expect(state.budgets).toHaveLength(1);
    expect(state.budgets[0]).toEqual({ categoryId: "marketing", kind: "valor", value: 150000 });
  });

  it("SET_BUDGET substitui a meta existente da mesma categoria em vez de duplicar", () => {
    let state = planningReducer(EMPTY_PLANNING_STATE, {
      type: "SET_BUDGET",
      budget: { categoryId: "marketing", kind: "valor", value: 150000 },
    });
    state = planningReducer(state, {
      type: "SET_BUDGET",
      budget: { categoryId: "marketing", kind: "percentual", value: 15 },
    });
    expect(state.budgets).toHaveLength(1);
    expect(state.budgets[0]).toEqual({ categoryId: "marketing", kind: "percentual", value: 15 });
  });

  it("REMOVE_BUDGET remove a meta da categoria", () => {
    let state = planningReducer(EMPTY_PLANNING_STATE, {
      type: "SET_BUDGET",
      budget: { categoryId: "marketing", kind: "valor", value: 150000 },
    });
    state = planningReducer(state, { type: "REMOVE_BUDGET", categoryId: "marketing" });
    expect(state.budgets).toHaveLength(0);
  });

  it("HYDRATE substitui o estado inteiro com os dados persistidos", () => {
    const persisted = { allocations: [makeAllocation({ monthId: "persisted" })], budgets: [] };
    const state = planningReducer(EMPTY_PLANNING_STATE, { type: "HYDRATE", state: persisted });
    expect(state.allocations[0].monthId).toBe("persisted");
  });
});
