// Domain types for the Vendas module (Phase 3).
// A Sale never stores money logic of its own — it feeds the existing Financeiro
// Transaction abstraction (see buildIncomeTransactionInput in calculations.ts).

export type SalesChannel = "nuvemshop" | "instagram" | "whatsapp" | "outro";

export type DiscountKind = "percentual" | "valor_fixo" | "frete_gratis";

export type Discount = {
  kind: DiscountKind;
  code?: string;
  description?: string;
  /** 0-100. Só é usado quando kind é "percentual". */
  percent?: number;
  /** Centavos. Só é usado quando kind é "valor_fixo". */
  amount?: number;
  /** Se este cupom pode ser combinado com outras promoções (informativo, não afeta o cálculo). */
  acumulativo?: boolean;
};

export type Sale = {
  id: string;
  date: string; // ISO yyyy-MM-dd
  contactId?: string;
  productId: string;
  quantity: number;
  /** Mantido para compatibilidade com vendas antigas e com o relatório de cupons — espelha discount?.code quando há um cupom estruturado. */
  couponCode?: string;
  /** Preço cheio (produto × quantidade) antes de desconto e frete. Ausente em vendas registradas antes desta estrutura — nesses casos totalAmount já é o valor final. */
  subtotal?: number;
  discount?: Discount;
  /** Frete efetivamente cobrado do cliente, em centavos. Zero quando o cupom é frete grátis. */
  shippingAmount?: number;
  /** Custo real do frete para a marca, em centavos — pode ser maior que o cobrado (ex: frete grátis concedido ao cliente). */
  shippingCost?: number;
  /** Valor final pago pelo cliente = subtotal − desconto + frete cobrado. É o que vira receita no Financeiro. */
  totalAmount: number; // cents
  channel: SalesChannel;
  notes?: string;
  /** Id of the Transaction (lib/finance) created to register this sale's revenue. */
  transactionId: string;
  createdAt: string;
  updatedAt: string;
};
