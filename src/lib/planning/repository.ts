import { createClient } from "@/lib/supabase/client";
import type { CategoryBudget, ProfitAllocation } from "./types";

// ProfitAllocation and CategoryBudget both use a business key (monthId /
// categoryId) as their identity, not a synthetic uuid, so the app-level
// `id` diffById needs is derived here rather than stored directly.

type ProfitAllocationRow = {
  month_id: string;
  user_id: string;
  reinvestimento: number;
  reserva: number;
  retirada: number;
  outro: number;
  notes: string | null;
  updated_at: string;
};

function rowToAllocation(row: ProfitAllocationRow): ProfitAllocation {
  return {
    monthId: row.month_id,
    reinvestimento: row.reinvestimento,
    reserva: row.reserva,
    retirada: row.retirada,
    outro: row.outro,
    notes: row.notes ?? undefined,
    updatedAt: row.updated_at,
  };
}

export async function fetchAllocations(userId: string): Promise<ProfitAllocation[]> {
  const { data, error } = await createClient().from("profit_allocations").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data as ProfitAllocationRow[]).map(rowToAllocation);
}

export async function upsertAllocations(userId: string, allocations: ProfitAllocation[]): Promise<void> {
  if (allocations.length === 0) return;
  const { error } = await createClient()
    .from("profit_allocations")
    .upsert(
      allocations.map((a) => ({
        month_id: a.monthId,
        user_id: userId,
        reinvestimento: a.reinvestimento,
        reserva: a.reserva,
        retirada: a.retirada,
        outro: a.outro,
        notes: a.notes ?? null,
        updated_at: a.updatedAt,
      }))
    );
  if (error) throw error;
}

export async function deleteAllocations(userId: string, monthIds: string[]): Promise<void> {
  if (monthIds.length === 0) return;
  const { error } = await createClient()
    .from("profit_allocations")
    .delete()
    .eq("user_id", userId)
    .in("month_id", monthIds);
  if (error) throw error;
}

type CategoryBudgetRow = { category_id: string; user_id: string; kind: string; value: number };

export async function fetchBudgets(userId: string): Promise<CategoryBudget[]> {
  const { data, error } = await createClient().from("category_budgets").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data as CategoryBudgetRow[]).map((row) => ({
    categoryId: row.category_id,
    kind: row.kind as CategoryBudget["kind"],
    value: row.value,
  }));
}

export async function upsertBudgets(userId: string, budgets: CategoryBudget[]): Promise<void> {
  if (budgets.length === 0) return;
  const { error } = await createClient()
    .from("category_budgets")
    .upsert(budgets.map((b) => ({ category_id: b.categoryId, user_id: userId, kind: b.kind, value: b.value })));
  if (error) throw error;
}

export async function deleteBudgets(userId: string, categoryIds: string[]): Promise<void> {
  if (categoryIds.length === 0) return;
  const { error } = await createClient()
    .from("category_budgets")
    .delete()
    .eq("user_id", userId)
    .in("category_id", categoryIds);
  if (error) throw error;
}
