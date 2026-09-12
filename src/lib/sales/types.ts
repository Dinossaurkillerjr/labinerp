// Domain types for the Vendas module (Phase 3).
// A Sale never stores money logic of its own — it feeds the existing Financeiro
// Transaction abstraction (see buildIncomeTransactionInput in calculations.ts).

export type SalesChannel = "nuvemshop" | "instagram" | "whatsapp" | "outro";

export type Sale = {
  id: string;
  date: string; // ISO yyyy-MM-dd
  contactId?: string;
  productId: string;
  quantity: number;
  couponCode?: string;
  totalAmount: number; // cents
  channel: SalesChannel;
  notes?: string;
  /** Id of the Transaction (lib/finance) created to register this sale's revenue. */
  transactionId: string;
  createdAt: string;
  updatedAt: string;
};
