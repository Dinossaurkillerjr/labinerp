import { calculateProductCost } from "@/lib/catalog/calculations";
import type { Product } from "@/lib/catalog/types";
import type { NewTransactionInput } from "@/lib/finance/finance-provider";
import type { Discount, Sale } from "./types";

/** Cost of goods for a given quantity, based on the product's current cost structure. */
export function calculateSaleCost(product: Product, quantity: number): number {
  return calculateProductCost(product.costComponents) * quantity;
}

export function calculateSaleProfit(totalAmount: number, product: Product, quantity: number): number {
  return totalAmount - calculateSaleCost(product, quantity);
}

/**
 * Translates a sale into the input shape the existing Financeiro `addTransaction`
 * expects — this is the single integration point between Vendas and Financeiro,
 * so the meaning of "receita" is defined once, in lib/finance, and reused here.
 */
export function buildIncomeTransactionInput(input: {
  date: string;
  totalAmount: number;
  productName: string;
  channel: string;
  saleId?: string;
}): NewTransactionInput {
  return {
    type: "income",
    amount: input.totalAmount,
    date: input.date,
    category: "venda", // Category["id"] from lib/finance/categories.ts (group "receita")
    description: `Venda — ${input.productName} (${input.channel})`,
    paymentSource: "conta_marca",
    status: "concluido",
    relations: input.saleId ? { saleId: input.saleId } : undefined,
  };
}

/**
 * O cliente pagar R$0 de frete (frete grátis) não significa que a marca teve
 * custo R$0 — o custo real vira uma despesa própria (categoria "frete", já
 * tratada como custo/COGS pelo Financeiro), nunca um abatimento da receita.
 * A venda continua sendo uma única receita; isto é sempre uma segunda
 * transação, de despesa, vinculada à venda via relations.saleId.
 */
export function buildShippingExpenseTransactionInput(input: {
  saleId: string;
  date: string;
  shippingCost: number;
  productName: string;
  /** Se o frete já foi pago no momento do registro. Default: pendente. */
  settled?: boolean;
}): NewTransactionInput {
  return {
    type: "expense",
    amount: input.shippingCost,
    date: input.date,
    category: "frete", // Category["id"] from lib/finance/categories.ts (group "custo")
    description: `Frete — ${input.productName}`,
    paymentSource: "conta_marca",
    status: input.settled ? "concluido" : "pendente",
    dueDate: input.settled ? undefined : input.date,
    relations: { saleId: input.saleId },
  };
}

export type ShippingExpenseReconciliation =
  | { action: "none" }
  | { action: "create"; input: NewTransactionInput }
  | { action: "update"; transactionId: string; input: NewTransactionInput }
  | { action: "delete"; transactionId: string };

/**
 * Decide o que fazer com a despesa de frete de uma venda, dado o custo real
 * atual e a despesa já vinculada (se houver) — nunca cria uma segunda despesa
 * quando já existe uma (só atualiza), e remove/desvincula quando o custo é
 * zerado. Usado tanto na criação quanto na edição da venda (sales-provider),
 * então "editar sem duplicar" e "remover o custo" têm uma única definição.
 */
export function reconcileShippingExpense(params: {
  saleId: string;
  date: string;
  shippingCost: number;
  productName: string;
  existingShippingTransactionId?: string;
}): ShippingExpenseReconciliation {
  const { saleId, date, shippingCost, productName, existingShippingTransactionId } = params;

  if (shippingCost > 0 && existingShippingTransactionId) {
    return {
      action: "update",
      transactionId: existingShippingTransactionId,
      input: buildShippingExpenseTransactionInput({ saleId, date, shippingCost, productName }),
    };
  }
  if (shippingCost > 0 && !existingShippingTransactionId) {
    return { action: "create", input: buildShippingExpenseTransactionInput({ saleId, date, shippingCost, productName }) };
  }
  if (shippingCost <= 0 && existingShippingTransactionId) {
    return { action: "delete", transactionId: existingShippingTransactionId };
  }
  return { action: "none" };
}

/**
 * Desconto efetivamente concedido sobre o subtotal, a partir da estrutura do
 * cupom. Frete grátis não desconta o preço do produto — ele zera o frete
 * cobrado (ver calculateShippingCharged), então aqui não gera desconto.
 */
export function calculateDiscountAmount(subtotal: number, discount?: Discount): number {
  if (!discount) return 0;
  if (discount.kind === "percentual") {
    return Math.round((subtotal * (discount.percent ?? 0)) / 100);
  }
  if (discount.kind === "valor_fixo") {
    return Math.min(discount.amount ?? 0, subtotal);
  }
  return 0; // frete_gratis
}

/** Frete efetivamente cobrado do cliente — zero quando o cupom é frete grátis, senão igual ao custo real. */
export function calculateShippingCharged(shippingCost: number, discount?: Discount): number {
  if (discount?.kind === "frete_gratis") return 0;
  return shippingCost;
}

export type SaleBreakdown = {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  shippingCost: number;
  totalAmount: number;
};

/**
 * Separa com clareza os quatro valores de uma venda: o que o cliente pagaria
 * sem desconto (subtotal), o desconto concedido, o frete cobrado do cliente e
 * o custo real de frete para a marca — e deriva o valor final pago, que é o
 * único número que vira receita no Financeiro (buildIncomeTransactionInput).
 */
export function calculateSaleBreakdown(params: {
  subtotal: number;
  discount?: Discount;
  shippingCost: number;
}): SaleBreakdown {
  const discountAmount = calculateDiscountAmount(params.subtotal, params.discount);
  const shippingAmount = calculateShippingCharged(params.shippingCost, params.discount);
  const totalAmount = Math.max(0, params.subtotal - discountAmount) + shippingAmount;
  return {
    subtotal: params.subtotal,
    discountAmount,
    shippingAmount,
    shippingCost: params.shippingCost,
    totalAmount,
  };
}

export type ContactHistory = {
  totalPurchased: number;
  purchaseCount: number;
  lastPurchaseDate?: string;
};

export function aggregateContactHistory(sales: Sale[], contactId: string): ContactHistory {
  const contactSales = sales.filter((s) => s.contactId === contactId);
  const totalPurchased = contactSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const lastPurchaseDate = contactSales
    .map((s) => s.date)
    .sort()
    .at(-1);

  return { totalPurchased, purchaseCount: contactSales.length, lastPurchaseDate };
}
