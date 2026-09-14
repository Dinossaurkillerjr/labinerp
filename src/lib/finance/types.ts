// Domain types for the Financeiro module (Phase 2).
// All monetary values are integers in cents (BRL) to keep math exact and deterministic.

export type TransactionType =
  | "income" // receita
  | "expense" // despesa/custo
  | "owner_contribution" // aporte
  | "owner_withdrawal"; // retirada

export type PaymentSource =
  | "conta_pessoal"
  | "conta_marca"
  | "dinheiro"
  | "cartao"
  | "outro";

/** Realization status of a transaction. */
export type TransactionStatus = "pendente" | "concluido" | "cancelado";

export type CategoryGroup = "receita" | "custo" | "despesa" | "capital";

export type Category = {
  id: string;
  label: string;
  group: CategoryGroup;
  /** true for categories the user created (as opposed to the seeded defaults). */
  custom?: boolean;
};

export type Attachment = {
  id: string;
  name: string;
};

export type InstallmentInfo = {
  /** 1-based index of this installment. */
  number: number;
  /** Total number of installments in the operation. */
  total: number;
};

export type TransactionRelations = {
  /** Id of the installment group this transaction belongs to, if any. */
  installmentGroupId?: string;
  /** Id of the recurring rule that generated this transaction, if any. */
  recurrenceId?: string;
  /** Id of the Sale (lib/sales) this transaction was generated from, if any — e.g. the revenue or the shipping-cost expense of a sale. */
  saleId?: string;
};

export type EditHistoryEntry = {
  at: string; // ISO datetime
  fields: string[];
};

export type Transaction = {
  id: string;
  type: TransactionType;
  /** Amount in cents. Always a positive number; sign is derived from `type`. */
  amount: number;
  /** Competência date (ISO yyyy-MM-dd) — when the transaction "happened" financially. */
  date: string;
  category: string; // Category["id"]
  description: string;
  paymentSource: PaymentSource;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  editHistory?: EditHistoryEntry[];
  notes?: string;
  attachments?: Attachment[];
  relations?: TransactionRelations;
  /** Vencimento (due date), relevant for pending payables/receivables. */
  dueDate?: string;
  installment?: InstallmentInfo;
};

export type InstallmentGroup = {
  id: string;
  description: string;
  totalAmount: number;
  installmentsCount: number;
  createdAt: string;
};

export type RecurrenceFrequency = "mensal";

export type RecurringRule = {
  id: string;
  description: string;
  amount: number;
  category: string;
  paymentSource: PaymentSource;
  type: Extract<TransactionType, "expense" | "income">;
  frequency: RecurrenceFrequency;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
  active: boolean;
  createdAt: string;
};

export type MonthClosingStatus = "aberto" | "fechado";

export type MonthClosing = {
  /** yyyy-MM */
  id: string;
  status: MonthClosingStatus;
  closedAt?: string;
  reopenedAt?: string;
};
