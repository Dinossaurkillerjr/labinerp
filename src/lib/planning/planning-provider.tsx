"use client";

import * as React from "react";
import {
  planningReducer,
  EMPTY_PLANNING_STATE,
  type PlanningAction,
  type PlanningState,
} from "./planning-reducer";
import type { BudgetKind, CategoryBudget, ProfitAllocation } from "./types";
import { useSupabaseReducer } from "@/lib/supabase/use-supabase-reducer";
import { diffByKey } from "@/lib/supabase/diff-collection";
import { deleteAllocations, deleteBudgets, fetchAllocations, fetchBudgets, upsertAllocations, upsertBudgets } from "./repository";

function nowISO(): string {
  return new Date().toISOString();
}

async function fetchInitial(userId: string): Promise<PlanningState> {
  const [allocations, budgets] = await Promise.all([fetchAllocations(userId), fetchBudgets(userId)]);
  return { allocations, budgets };
}

async function sync(userId: string, previous: PlanningState, next: PlanningState): Promise<void> {
  const allocationsDiff = diffByKey((a) => a.monthId, previous.allocations, next.allocations);
  const budgetsDiff = diffByKey((b) => b.categoryId, previous.budgets, next.budgets);

  await Promise.all([
    upsertAllocations(userId, [...allocationsDiff.inserted, ...allocationsDiff.updated]),
    deleteAllocations(userId, allocationsDiff.deletedIds),
    upsertBudgets(userId, [...budgetsDiff.inserted, ...budgetsDiff.updated]),
    deleteBudgets(userId, budgetsDiff.deletedIds),
  ]);
}

export type ProfitAllocationInput = {
  reinvestimento: number;
  reserva: number;
  retirada: number;
  outro: number;
  notes?: string;
};

type PlanningContextValue = {
  allocations: ProfitAllocation[];
  budgets: CategoryBudget[];
  getAllocation: (monthId: string) => ProfitAllocation | undefined;
  setAllocation: (monthId: string, input: ProfitAllocationInput) => void;
  removeAllocation: (monthId: string) => void;
  getBudget: (categoryId: string) => CategoryBudget | undefined;
  setBudget: (categoryId: string, kind: BudgetKind, value: number) => void;
  removeBudget: (categoryId: string) => void;
};

const PlanningContext = React.createContext<PlanningContextValue | null>(null);

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useSupabaseReducer<PlanningState, PlanningAction>(
    planningReducer,
    EMPTY_PLANNING_STATE,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState }),
    fetchInitial,
    sync
  );

  const value = React.useMemo<PlanningContextValue>(
    () => ({
      allocations: state.allocations,
      budgets: state.budgets,

      getAllocation(monthId) {
        return state.allocations.find((a) => a.monthId === monthId);
      },

      setAllocation(monthId, input) {
        dispatch({
          type: "SET_ALLOCATION",
          allocation: { monthId, ...input, updatedAt: nowISO() },
        });
      },

      removeAllocation(monthId) {
        dispatch({ type: "REMOVE_ALLOCATION", monthId });
      },

      getBudget(categoryId) {
        return state.budgets.find((b) => b.categoryId === categoryId);
      },

      setBudget(categoryId, kind, value) {
        dispatch({ type: "SET_BUDGET", budget: { categoryId, kind, value } });
      },

      removeBudget(categoryId) {
        dispatch({ type: "REMOVE_BUDGET", categoryId });
      },
    }),
    [state, dispatch]
  );

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning() {
  const ctx = React.useContext(PlanningContext);
  if (!ctx) throw new Error("usePlanning must be used within a PlanningProvider");
  return ctx;
}
