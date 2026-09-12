import { calculateProductCost } from "@/lib/catalog/calculations";
import type { Product } from "@/lib/catalog/types";
import type { NewTransactionInput } from "@/lib/finance/finance-provider";
import type { Sale } from "./types";

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
}): NewTransactionInput {
  return {
    type: "income",
    amount: input.totalAmount,
    date: input.date,
    category: "venda", // Category["id"] from lib/finance/categories.ts (group "receita")
    description: `Venda — ${input.productName} (${input.channel})`,
    paymentSource: "conta_marca",
    status: "concluido",
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
