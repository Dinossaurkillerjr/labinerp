// Planejamento is an interpretation layer over lib/finance — every number
// here comes from calculateResultado/calculateCapital/sumByCategory, already
// tested in lib/finance. Nothing here recomputes a financial rule; this file
// only groups, compares and describes those existing numbers.

import type { Category, Transaction } from "@/lib/finance/types";
import { calculateCapital, calculateResultado, sumByCategory, type Resultado } from "@/lib/finance/calculations";
import { formatMonthLabel, monthBounds } from "@/lib/finance/period";
import type { BudgetKind, CategoryBudget, ProfitAllocation } from "./types";

// ---------------------------------------------------------------------------
// 1-3. Histórico mensal (o que aconteceu, mês a mês)
// ---------------------------------------------------------------------------

export type MonthlySnapshot = {
  monthId: string;
  label: string;
  resultado: Resultado;
  margemPercent: number;
  capitalAportado: number;
  capitalRetirado: number;
  allocation?: ProfitAllocation;
};

/** Reaproveita calculateResultado/calculateCapital para cada mês — nenhum cálculo novo. */
export function buildMonthlyHistory(
  transactions: Transaction[],
  categories: Category[],
  allocations: ProfitAllocation[],
  monthIds: string[]
): MonthlySnapshot[] {
  const allocationByMonth = new Map(allocations.map((a) => [a.monthId, a]));
  return monthIds.map((monthId) => {
    const bounds = monthBounds(monthId);
    const resultado = calculateResultado(transactions, bounds, categories);
    const capital = calculateCapital(transactions, bounds);
    return {
      monthId,
      label: formatMonthLabel(monthId),
      resultado,
      margemPercent: resultado.receita > 0 ? (resultado.lucroLiquido / resultado.receita) * 100 : 0,
      capitalAportado: capital.capitalAportado,
      capitalRetirado: capital.capitalRetirado,
      allocation: allocationByMonth.get(monthId),
    };
  });
}

// ---------------------------------------------------------------------------
// 2. Destinação do resultado — uma classificação, nunca uma movimentação.
// ---------------------------------------------------------------------------

/**
 * O que sobrou do lucro líquido depois da destinação declarada pelo usuário.
 * Puramente informativo: não gera nem espera nenhuma Transaction.
 */
export function calculateUnallocatedProfit(lucroLiquido: number, allocation?: ProfitAllocation): number {
  if (!allocation) return lucroLiquido;
  const allocated = allocation.reinvestimento + allocation.reserva + allocation.retirada + allocation.outro;
  return lucroLiquido - allocated;
}

// ---------------------------------------------------------------------------
// 4. Análise por categoria (distribuição de custos/despesas no período)
// ---------------------------------------------------------------------------

export type CategoryDistributionRow = {
  categoryId: string;
  label: string;
  amount: number;
  /** 0-100. Zero quando não há receita no período (evita divisão por zero). */
  percentOfReceita: number;
};

/**
 * Como custos/despesas se distribuíram no período, e quanto cada categoria
 * representa da receita — nunca inclui receita/capital, e nunca impõe um
 * percentual ideal (isso é papel das Referências, seção 5).
 */
export function buildCategoryDistribution(
  transactions: Transaction[],
  categories: Category[],
  range: { start: string; end: string },
  trackedCategoryIds?: string[]
): CategoryDistributionRow[] {
  const resultado = calculateResultado(transactions, range, categories);
  const expensesInRange = transactions.filter(
    (t) => t.type === "expense" && t.status !== "cancelado" && t.date >= range.start && t.date <= range.end
  );
  const categoryMap = new Map(categories.map((c) => [c.id, c.label]));
  const totals = sumByCategory(expensesInRange);

  let rows = Object.entries(totals).map(([categoryId, amount]) => ({
    categoryId,
    label: categoryMap.get(categoryId) ?? categoryId,
    amount,
    percentOfReceita: resultado.receita > 0 ? (amount / resultado.receita) * 100 : 0,
  }));

  if (trackedCategoryIds && trackedCategoryIds.length > 0) {
    rows = rows.filter((r) => trackedCategoryIds.includes(r.categoryId));
  }

  return rows.sort((a, b) => b.amount - a.amount);
}

// ---------------------------------------------------------------------------
// 5. Histórico → referência (médias, mediana, mínimo, máximo, tendência simples)
// ---------------------------------------------------------------------------

export type CategoryMonthlyPercent = { monthId: string; amount: number; percentOfReceita: number };

/** Série mensal de uma categoria como valor e % da receita — do mês mais antigo ao mais recente. */
export function buildCategoryPercentSeries(
  transactions: Transaction[],
  categories: Category[],
  categoryId: string,
  monthIds: string[]
): CategoryMonthlyPercent[] {
  return monthIds.map((monthId) => {
    const bounds = monthBounds(monthId);
    const resultado = calculateResultado(transactions, bounds, categories);
    const amount = transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === categoryId &&
          t.status !== "cancelado" &&
          t.date >= bounds.start &&
          t.date <= bounds.end
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return { monthId, amount, percentOfReceita: resultado.receita > 0 ? (amount / resultado.receita) * 100 : 0 };
  });
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export const RECENT_WINDOW_MONTHS = 3;
/** Diferença mínima (em pontos percentuais relativos) para chamar de "alta"/"queda" — evita ruído de mês a mês. */
const TREND_THRESHOLD_PERCENT = 10;

export type Trend = "alta" | "queda" | "estavel" | "indisponivel";

export type CategoryReference = {
  categoryId: string;
  label: string;
  currentPercent: number;
  currentAmount: number;
  /** undefined quando não há nenhum mês anterior para comparar. */
  historicalAveragePercent?: number;
  /** undefined até haver pelo menos RECENT_WINDOW_MONTHS meses anteriores. */
  recentAveragePercent?: number;
  min?: number;
  max?: number;
  median?: number;
  trend: Trend;
  /** Quantos meses anteriores (excluindo o atual) entraram na referência. */
  sampleSize: number;
};

/**
 * Transforma uma série mensal (já com o mês atual como último item) em
 * referências descritivas: média histórica, média recente, mínimo, máximo,
 * mediana e uma tendência simples — nunca uma previsão estatística, nunca
 * uma recomendação de quanto gastar.
 */
export function buildCategoryReference(
  categoryId: string,
  label: string,
  series: CategoryMonthlyPercent[]
): CategoryReference {
  if (series.length === 0) {
    return { categoryId, label, currentPercent: 0, currentAmount: 0, trend: "indisponivel", sampleSize: 0 };
  }

  const current = series[series.length - 1];
  const past = series.slice(0, -1);

  if (past.length === 0) {
    return {
      categoryId,
      label,
      currentPercent: current.percentOfReceita,
      currentAmount: current.amount,
      trend: "indisponivel",
      sampleSize: 0,
    };
  }

  const pastPercents = past.map((p) => p.percentOfReceita);
  const historicalAveragePercent = average(pastPercents);
  const recentPercents = pastPercents.slice(-RECENT_WINDOW_MONTHS);
  const recentAveragePercent = past.length >= RECENT_WINDOW_MONTHS ? average(recentPercents) : undefined;

  let trend: Trend = "estavel";
  if (historicalAveragePercent > 0) {
    const diffPercent = ((current.percentOfReceita - historicalAveragePercent) / historicalAveragePercent) * 100;
    if (diffPercent > TREND_THRESHOLD_PERCENT) trend = "alta";
    else if (diffPercent < -TREND_THRESHOLD_PERCENT) trend = "queda";
  }

  return {
    categoryId,
    label,
    currentPercent: current.percentOfReceita,
    currentAmount: current.amount,
    historicalAveragePercent,
    recentAveragePercent,
    min: Math.min(...pastPercents),
    max: Math.max(...pastPercents),
    median: median(pastPercents),
    trend,
    sampleSize: past.length,
  };
}

// ---------------------------------------------------------------------------
// 6. Recomendações — mensagens descritivas, nunca prescritivas.
// ---------------------------------------------------------------------------

export type PlanningInsight = { id: string; message: string };

/**
 * Gera observações descritivas comparando o mês atual ao histórico da própria
 * operação — nunca "gaste X%", sempre "está acima/abaixo da sua média".
 * Exige dados suficientes (ver CategoryReference.trend === "indisponivel" e
 * o tamanho mínimo do histórico de margem); sem eles, não gera nada.
 */
export function buildPlanningInsights(params: {
  categoryReferences: CategoryReference[];
  marginHistory: { monthId: string; margemPercent: number }[]; // mais antigo primeiro, último = mês atual
}): PlanningInsight[] {
  const insights: PlanningInsight[] = [];

  for (const ref of params.categoryReferences) {
    if (ref.trend === "indisponivel" || ref.historicalAveragePercent === undefined) continue;

    if (ref.trend === "alta") {
      insights.push({
        id: `categoria-alta-${ref.categoryId}`,
        message: `Seu gasto com ${ref.label} está acima da sua média histórica.`,
      });
    } else if (ref.trend === "queda") {
      insights.push({
        id: `categoria-queda-${ref.categoryId}`,
        message: `Seu gasto com ${ref.label} está abaixo da sua média histórica.`,
      });
    }

    if (
      ref.recentAveragePercent !== undefined &&
      ref.historicalAveragePercent > 0 &&
      ref.recentAveragePercent > ref.historicalAveragePercent * 1.1
    ) {
      insights.push({
        id: `categoria-tendencia-${ref.categoryId}`,
        message: `Seu custo com ${ref.label} aumentou como percentual da receita nos últimos ${RECENT_WINDOW_MONTHS} meses.`,
      });
    }
  }

  const past = params.marginHistory.slice(0, -1);
  const current = params.marginHistory.at(-1);
  if (current && past.length >= 2) {
    const priorAverage = average(past.map((m) => m.margemPercent));
    if (priorAverage !== 0) {
      const diffPercent = ((current.margemPercent - priorAverage) / Math.abs(priorAverage)) * 100;
      if (diffPercent > TREND_THRESHOLD_PERCENT) {
        insights.push({
          id: "margem-acima-media",
          message: `Este mês apresentou margem acima da média dos últimos ${past.length} meses.`,
        });
      } else if (diffPercent < -TREND_THRESHOLD_PERCENT) {
        insights.push({
          id: "margem-abaixo-media",
          message: `Este mês apresentou margem abaixo da média dos últimos ${past.length} meses.`,
        });
      }
    }
  }

  return insights;
}

// ---------------------------------------------------------------------------
// 7. Orçamento — somente como referência (planejado × realizado).
// ---------------------------------------------------------------------------

export type BudgetProgress = {
  categoryId: string;
  label: string;
  kind: BudgetKind;
  plannedAmount: number;
  realizedAmount: number;
  /** planejado − realizado. Positivo = dentro do orçamento; negativo = estourou. */
  differenceAmount: number;
};

/** Resolve cada meta (valor fixo ou % da receita) contra o realizado do período — uma ferramenta de referência, não uma regra. */
export function buildBudgetProgress(
  budgets: CategoryBudget[],
  distribution: CategoryDistributionRow[],
  categories: Category[],
  receita: number
): BudgetProgress[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c.label]));
  const realizedByCategory = new Map(distribution.map((d) => [d.categoryId, d.amount]));

  return budgets.map((budget) => {
    const plannedAmount = budget.kind === "valor" ? budget.value : Math.round((receita * budget.value) / 100);
    const realizedAmount = realizedByCategory.get(budget.categoryId) ?? 0;
    return {
      categoryId: budget.categoryId,
      label: categoryMap.get(budget.categoryId) ?? budget.categoryId,
      kind: budget.kind,
      plannedAmount,
      realizedAmount,
      differenceAmount: plannedAmount - realizedAmount,
    };
  });
}
