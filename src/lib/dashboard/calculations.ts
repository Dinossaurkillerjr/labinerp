// Dashboard KPI orchestration — every number here is computed by calling the
// existing domain calculations (lib/finance, lib/sales, lib/tasks); nothing
// is recomputed with new business rules, so the Financeiro guarantees
// (aporte/retirada never touch lucro, caixa ≠ resultado, etc.) hold here too.

import type { Category, Transaction } from "@/lib/finance/types";
import { calculateCaixa, calculateCashFlow, calculateResultado, sumByCategory } from "@/lib/finance/calculations";
import type { Sale } from "@/lib/sales/types";
import type { Product } from "@/lib/catalog/types";
import type { Contact } from "@/lib/contacts/types";
import { buildSalesReport } from "@/lib/reports/sales-report";
import type { PeriodRange } from "@/lib/reports/period-range";
import { percentChange, previousPeriodRange } from "@/lib/reports/period-range";
import type { Task } from "@/lib/tasks/types";
import { filterByPeriod, isOverdue as isTaskOverdue } from "@/lib/tasks/filters";

export type CaixaKpi = { saldoAtual: number; entradas: number; saidas: number };

export function buildCaixaKpi(transactions: Transaction[], range: PeriodRange): CaixaKpi {
  const saldoAtual = calculateCaixa(transactions);
  const cashFlow = calculateCashFlow(transactions, range, 0);
  return { saldoAtual, entradas: cashFlow.entradas, saidas: cashFlow.saidas };
}

export type VendasKpi = {
  faturamento: number;
  quantidade: number;
  ticketMedio: number;
  variacaoFaturamentoPercent?: number;
  variacaoQuantidadePercent?: number;
};

export function buildVendasKpi(sales: Sale[], products: Product[], contacts: Contact[], range: PeriodRange): VendasKpi {
  const current = buildSalesReport(sales, products, contacts, range);
  const previous = buildSalesReport(sales, products, contacts, previousPeriodRange(range));
  return {
    faturamento: current.faturamento,
    quantidade: current.quantidade,
    ticketMedio: current.ticketMedio,
    variacaoFaturamentoPercent: percentChange(current.faturamento, previous.faturamento),
    variacaoQuantidadePercent: percentChange(current.quantidade, previous.quantidade),
  };
}

export type LucroKpi = {
  receita: number;
  custos: number;
  despesas: number;
  lucroLiquido: number;
  margemPercent: number;
};

export function buildLucroKpi(transactions: Transaction[], categories: Category[], range: PeriodRange): LucroKpi {
  const resultado = calculateResultado(transactions, range, categories);
  return {
    receita: resultado.receita,
    custos: resultado.custoProdutos,
    despesas: resultado.despesasOperacionais,
    lucroLiquido: resultado.lucroLiquido,
    margemPercent: resultado.receita > 0 ? (resultado.lucroLiquido / resultado.receita) * 100 : 0,
  };
}

export type DespesasKpi = {
  total: number;
  porCategoria: { category: string; label: string; amount: number }[];
  pendentes: number;
  vencidas: number;
};

export function buildDespesasKpi(
  transactions: Transaction[],
  categories: Category[],
  range: PeriodRange,
  todayISO: string
): DespesasKpi {
  const expensesInRange = transactions.filter(
    (t) => t.type === "expense" && t.status !== "cancelado" && t.date >= range.start && t.date <= range.end
  );
  const total = expensesInRange.reduce((sum, t) => sum + t.amount, 0);

  const totalsByCategory = sumByCategory(expensesInRange);
  const categoryMap = new Map(categories.map((c) => [c.id, c.label]));
  const porCategoria = Object.entries(totalsByCategory)
    .map(([category, amount]) => ({ category, label: categoryMap.get(category) ?? category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Pending/overdue are operational — they matter regardless of the selected
  // period, so they look at all expense transactions, not just `range`.
  const pendingExpenses = transactions.filter((t) => t.type === "expense" && t.status === "pendente");
  const pendentes = pendingExpenses.reduce((sum, t) => sum + t.amount, 0);
  const vencidas = pendingExpenses
    .filter((t) => t.dueDate && t.dueDate < todayISO)
    .reduce((sum, t) => sum + t.amount, 0);

  return { total, porCategoria, pendentes, vencidas };
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function addDaysISO(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Realized inflow (income + aporte) per day, for the `days` ending on `todayISO`. */
export function buildWeeklyCashFlowSeries(
  transactions: Transaction[],
  todayISO: string,
  days = 7
): { label: string; value: number }[] {
  const series: { label: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysISO(todayISO, -i);
    const weekday = WEEKDAY_LABELS[new Date(date + "T00:00:00Z").getUTCDay()];
    const value = transactions
      .filter(
        (t) =>
          t.date === date &&
          t.status === "concluido" &&
          (t.type === "income" || t.type === "owner_contribution")
      )
      .reduce((sum, t) => sum + t.amount, 0);
    series.push({ label: weekday, value });
  }
  return series;
}

/** Number of sales per day, for the `days` ending on `todayISO` — a simple activity trend. */
export function buildSalesTrendSeries(sales: Sale[], todayISO: string, days = 10): number[] {
  const series: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = addDaysISO(todayISO, -i);
    series.push(sales.filter((s) => s.date === date).length);
  }
  return series;
}

export type TarefasKpi = { hoje: number; atrasadas: number; proximas: number; concluidas: number };

export function buildTarefasKpi(tasks: Task[], todayISO: string): TarefasKpi {
  const hoje = filterByPeriod(tasks, "hoje", todayISO).filter((t) => t.status !== "concluido").length;
  const atrasadas = tasks.filter((t) => isTaskOverdue(t, todayISO)).length;
  const proximas = filterByPeriod(tasks, "semana", todayISO).filter(
    (t) => t.status !== "concluido" && t.dueDate !== todayISO
  ).length;
  const concluidas = tasks.filter((t) => t.status === "concluido").length;
  return { hoje, atrasadas, proximas, concluidas };
}
