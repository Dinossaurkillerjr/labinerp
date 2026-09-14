import type { CategoryBudget, ProfitAllocation } from "./types";

export type PlanningState = {
  /** No máximo uma por monthId. */
  allocations: ProfitAllocation[];
  /** No máximo uma por categoryId. */
  budgets: CategoryBudget[];
};

export const EMPTY_PLANNING_STATE: PlanningState = { allocations: [], budgets: [] };

export type PlanningAction =
  | { type: "HYDRATE"; state: PlanningState }
  | { type: "SET_ALLOCATION"; allocation: ProfitAllocation }
  | { type: "REMOVE_ALLOCATION"; monthId: string }
  | { type: "SET_BUDGET"; budget: CategoryBudget }
  | { type: "REMOVE_BUDGET"; categoryId: string };

export function planningReducer(state: PlanningState, action: PlanningAction): PlanningState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "SET_ALLOCATION": {
      const exists = state.allocations.some((a) => a.monthId === action.allocation.monthId);
      const allocations = exists
        ? state.allocations.map((a) => (a.monthId === action.allocation.monthId ? action.allocation : a))
        : [...state.allocations, action.allocation];
      return { ...state, allocations };
    }

    case "REMOVE_ALLOCATION":
      return { ...state, allocations: state.allocations.filter((a) => a.monthId !== action.monthId) };

    case "SET_BUDGET": {
      const exists = state.budgets.some((b) => b.categoryId === action.budget.categoryId);
      const budgets = exists
        ? state.budgets.map((b) => (b.categoryId === action.budget.categoryId ? action.budget : b))
        : [...state.budgets, action.budget];
      return { ...state, budgets };
    }

    case "REMOVE_BUDGET":
      return { ...state, budgets: state.budgets.filter((b) => b.categoryId !== action.categoryId) };

    default:
      return state;
  }
}
