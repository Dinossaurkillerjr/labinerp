import type { Category, Transaction } from "./types";
import { DEFAULT_CATEGORIES } from "./categories";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A transaction only affects realized caixa/resultado once it is settled. */
export function isRealized(transaction: Transaction): boolean {
  return transaction.status === "concluido";
}

export function isPending(transaction: Transaction): boolean {
  return transaction.status === "pendente";
}

function inPeriod(transaction: Transaction, start?: string, end?: string): boolean {
  if (start && transaction.date < start) return false;
  if (end && transaction.date > end) return false;
  return true;
}

function categoryGroup(categoryId: string, categories: Category[]): Category["group"] | undefined {
  return categories.find((c) => c.id === categoryId)?.group;
}

export type Period = { start?: string; end?: string };

// ---------------------------------------------------------------------------
// Caixa (realized cash only)
// ---------------------------------------------------------------------------

/**
 * Realized cash balance contributed by a set of transactions.
 * Aportes increase caixa, retiradas decrease it, exactly like income/expense,
 * but they are tracked separately for capital purposes (see calculateCapital).
 */
export function calculateCaixa(transactions: Transaction[], period: Period = {}): number {
  return transactions
    .filter((t) => isRealized(t) && inPeriod(t, period.start, period.end))
    .reduce((total, t) => {
      const isInflow = t.type === "income" || t.type === "owner_contribution";
      return total + (isInflow ? t.amount : -t.amount);
    }, 0);
}

// ---------------------------------------------------------------------------
// Resultado (DRE simplificado) — competência, exclui aporte/retirada
// ---------------------------------------------------------------------------

export type Resultado = {
  receita: number;
  custoProdutos: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroLiquido: number;
};

export function calculateResultado(
  transactions: Transaction[],
  period: Period = {},
  categories: Category[] = DEFAULT_CATEGORIES
): Resultado {
  const inScope = transactions.filter(
    (t) => t.status !== "cancelado" && inPeriod(t, period.start, period.end)
  );

  const receita = inScope
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const custoProdutos = inScope
    .filter((t) => t.type === "expense" && categoryGroup(t.category, categories) === "custo")
    .reduce((sum, t) => sum + t.amount, 0);

  const despesasOperacionais = inScope
    .filter((t) => t.type === "expense" && categoryGroup(t.category, categories) === "despesa")
    .reduce((sum, t) => sum + t.amount, 0);

  const lucroBruto = receita - custoProdutos;
  const lucroLiquido = lucroBruto - despesasOperacionais;

  return { receita, custoProdutos, lucroBruto, despesasOperacionais, lucroLiquido };
}

// ---------------------------------------------------------------------------
// Capital do proprietário
// ---------------------------------------------------------------------------

export type Capital = {
  capitalAportado: number;
  capitalRetirado: number;
  capitalLiquido: number;
};

export function calculateCapital(transactions: Transaction[], period: Period = {}): Capital {
  const realized = transactions.filter((t) => isRealized(t) && inPeriod(t, period.start, period.end));

  const capitalAportado = realized
    .filter((t) => t.type === "owner_contribution")
    .reduce((sum, t) => sum + t.amount, 0);

  const capitalRetirado = realized
    .filter((t) => t.type === "owner_withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    capitalAportado,
    capitalRetirado,
    capitalLiquido: capitalAportado - capitalRetirado,
  };
}

// ---------------------------------------------------------------------------
// Fluxo de caixa
// ---------------------------------------------------------------------------

export type CashFlow = {
  saldoInicial: number;
  entradas: number;
  saidas: number;
  saldoFinal: number;
  aReceber: number;
  aPagar: number;
  caixaProjetado: number;
};

export function calculateCashFlow(
  transactions: Transaction[],
  period: Period,
  saldoInicial: number
): CashFlow {
  const realizedInPeriod = transactions.filter(
    (t) => isRealized(t) && inPeriod(t, period.start, period.end)
  );

  const entradas = realizedInPeriod
    .filter((t) => t.type === "income" || t.type === "owner_contribution")
    .reduce((sum, t) => sum + t.amount, 0);

  const saidas = realizedInPeriod
    .filter((t) => t.type === "expense" || t.type === "owner_withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoFinal = saldoInicial + entradas - saidas;

  const pendingInPeriod = transactions.filter(
    (t) => isPending(t) && inPeriod(t, period.start, period.end)
  );

  const aReceber = pendingInPeriod
    .filter((t) => t.type === "income" || t.type === "owner_contribution")
    .reduce((sum, t) => sum + t.amount, 0);

  const aPagar = pendingInPeriod
    .filter((t) => t.type === "expense" || t.type === "owner_withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    saldoInicial,
    entradas,
    saidas,
    saldoFinal,
    aReceber,
    aPagar,
    caixaProjetado: saldoFinal + aReceber - aPagar,
  };
}

// ---------------------------------------------------------------------------
// Patrimônio (proxy simplificado até haver módulo de estoque/ativos)
// ---------------------------------------------------------------------------

export function calculatePatrimonioLiquidoProxy(transactions: Transaction[]): number {
  const caixa = calculateCaixa(transactions);
  const pendentes = transactions.filter(isPending);
  const aReceber = pendentes
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const aPagar = pendentes
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  return caixa + aReceber - aPagar;
}

// ---------------------------------------------------------------------------
// Parcelamento
// ---------------------------------------------------------------------------

/**
 * Splits a total amount into N installments without losing or gaining cents:
 * any remainder from integer division is distributed one cent at a time to
 * the first installments. E.g. 1000 cents / 3 => [334, 333, 333].
 */
export function splitAmountIntoInstallments(totalAmount: number, count: number): number[] {
  if (count <= 0) throw new Error("installments count must be greater than zero");
  const base = Math.floor(totalAmount / count);
  const remainder = totalAmount - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

/** Adds `months` calendar months to an ISO date (yyyy-MM-dd), keeping the day when possible. */
export function addMonthsToISODate(isoDate: string, months: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, day));
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Agregações auxiliares (para gráficos/listas)
// ---------------------------------------------------------------------------

export function sumByCategory(
  transactions: Transaction[],
  period: Period = {}
): Record<string, number> {
  const inScope = transactions.filter(
    (t) => t.status !== "cancelado" && inPeriod(t, period.start, period.end)
  );
  const totals: Record<string, number> = {};
  for (const t of inScope) {
    totals[t.category] = (totals[t.category] ?? 0) + t.amount;
  }
  return totals;
}
