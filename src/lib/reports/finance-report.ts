import type { Category, Transaction } from "@/lib/finance/types";
import {
  calculateCapital,
  calculateCashFlow,
  calculateResultado,
  sumByCategory,
  type Capital,
  type CashFlow,
  type Resultado,
} from "@/lib/finance/calculations";
import { formatMonthLabel } from "@/lib/finance/period";
import type { PeriodRange } from "./period-range";

export type FinanceReport = {
  resultado: Resultado;
  cashFlow: CashFlow;
  capital: Capital;
  despesasPorCategoria: { category: string; label: string; amount: number }[];
  /** Lucro líquido por mês, para os meses cobertos pelo período selecionado. */
  lucroEvolucao: { label: string; value: number }[];
};

function monthsBetween(startISO: string, endISO: string): string[] {
  const months: string[] = [];
  let cursor = startISO.slice(0, 7);
  const end = endISO.slice(0, 7);
  while (cursor <= end) {
    months.push(cursor);
    const [year, month] = cursor.split("-").map(Number);
    const next = new Date(Date.UTC(year, month, 1));
    cursor = next.toISOString().slice(0, 7);
  }
  return months;
}

/**
 * Reuses lib/finance/calculations directly for every number here — this
 * module only groups the existing, already-tested results by period.
 */
export function buildFinanceReport(
  transactions: Transaction[],
  categories: Category[],
  range: PeriodRange
): FinanceReport {
  const resultado = calculateResultado(transactions, range, categories);
  const cashFlow = calculateCashFlow(transactions, range, 0);
  const capital = calculateCapital(transactions, range);

  const expensesInRange = transactions.filter(
    (t) => t.type === "expense" && t.status !== "cancelado" && t.date >= range.start && t.date <= range.end
  );
  const categoryMap = new Map(categories.map((c) => [c.id, c.label]));
  const despesasPorCategoria = Object.entries(sumByCategory(expensesInRange))
    .map(([category, amount]) => ({ category, label: categoryMap.get(category) ?? category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const lucroEvolucao = monthsBetween(range.start, range.end).map((monthId) => {
    const monthResultado = calculateResultado(transactions, { start: `${monthId}-01`, end: `${monthId}-31` }, categories);
    return { label: formatMonthLabel(monthId).split(" de ")[0].slice(0, 3), value: monthResultado.lucroLiquido };
  });

  return { resultado, cashFlow, capital, despesasPorCategoria, lucroEvolucao };
}
