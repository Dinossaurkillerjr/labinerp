// Domain types for Financeiro → Planejamento.
//
// This module is an interpretation layer over the existing Financeiro data —
// it never stores a financial fact of its own. Everything here is either a
// user declaration (allocation, budget) or a pure derived view built from
// lib/finance transactions. Amounts are cents, like everywhere else.

/**
 * How the user chose to classify a month's lucro líquido after the fact —
 * a label on the result, not a movement. Setting a "retirada" here does NOT
 * create a Transaction; a real retirada is still registered separately in
 * Financeiro (owner_withdrawal), exactly as before.
 */
export type ProfitAllocation = {
  /** yyyy-MM */
  monthId: string;
  reinvestimento: number;
  reserva: number;
  retirada: number;
  outro: number;
  notes?: string;
  updatedAt: string;
};

export type BudgetKind = "valor" | "percentual";

/**
 * An optional, user-defined reference for a category — "meta mensal", not a
 * rule. Reuses Category["id"] from lib/finance/categories.ts; no parallel
 * category list is created.
 */
export type CategoryBudget = {
  categoryId: string;
  kind: BudgetKind;
  /** Cents when kind is "valor"; 0-100 when kind is "percentual". */
  value: number;
};
