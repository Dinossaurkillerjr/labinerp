import type { Category, RecurringRule, Transaction } from "./types";

// Seed data used only when the local store is empty (first run). This gives the
// Financeiro module something real to show without requiring a backend yet.

function iso(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

const now = new Date().toISOString();

export const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "seed-1",
    type: "owner_contribution",
    amount: 500000,
    date: iso(-40),
    category: "aporte",
    description: "Aporte inicial para abertura da marca",
    paymentSource: "conta_pessoal",
    status: "concluido",
    createdAt: now,
    updatedAt: now,
    edited: false,
  },
  {
    id: "seed-2",
    type: "income",
    amount: 34900,
    date: iso(-5),
    category: "venda",
    description: "Venda Ana Beatriz Souza — E-commerce",
    paymentSource: "conta_marca",
    status: "concluido",
    createdAt: now,
    updatedAt: now,
    edited: false,
  },
  {
    id: "seed-3",
    type: "income",
    amount: 52000,
    date: iso(-3),
    category: "venda",
    description: "Venda Juliana Prado — WhatsApp",
    paymentSource: "conta_marca",
    status: "concluido",
    createdAt: now,
    updatedAt: now,
    edited: false,
  },
  {
    id: "seed-4",
    type: "income",
    amount: 18990,
    date: iso(1),
    dueDate: iso(1),
    category: "venda",
    description: "Venda Carlos Mendes — Instagram",
    paymentSource: "conta_marca",
    status: "pendente",
    createdAt: now,
    updatedAt: now,
    edited: false,
  },
  {
    id: "seed-5",
    type: "expense",
    amount: 24000,
    date: iso(-10),
    category: "produto_pod",
    description: "Produção de camisetas — lote 12",
    paymentSource: "conta_marca",
    status: "concluido",
    createdAt: now,
    updatedAt: now,
    edited: false,
  },
  {
    id: "seed-6",
    type: "expense",
    amount: 8900,
    date: iso(-10),
    category: "frete",
    description: "Frete do lote 12",
    paymentSource: "conta_marca",
    status: "concluido",
    createdAt: now,
    updatedAt: now,
    edited: false,
  },
  {
    id: "seed-7",
    type: "expense",
    amount: 180000,
    date: iso(4),
    dueDate: iso(4),
    category: "outras_despesas",
    description: "Aluguel do ateliê",
    paymentSource: "conta_marca",
    status: "pendente",
    createdAt: now,
    updatedAt: now,
    edited: false,
  },
  {
    id: "seed-8",
    type: "owner_withdrawal",
    amount: 60000,
    date: iso(-15),
    category: "retirada",
    description: "Retirada de pró-labore",
    paymentSource: "conta_marca",
    status: "concluido",
    createdAt: now,
    updatedAt: now,
    edited: false,
  },
];

export const SEED_INSTALLMENT_TRANSACTIONS: Transaction[] = (() => {
  const groupId = "seed-group-1";
  const parts = [20000, 20000, 20000];
  return parts.map((amount, index) => ({
    id: `seed-installment-${index + 1}`,
    type: "expense" as const,
    amount,
    date: iso(-30 + index * 30),
    category: "equipamentos",
    description: "Máquina de costura — 3x",
    paymentSource: "cartao" as const,
    status: index === 0 ? ("concluido" as const) : ("pendente" as const),
    createdAt: now,
    updatedAt: now,
    edited: false,
    relations: { installmentGroupId: groupId },
    installment: { number: index + 1, total: 3 },
  }));
})();

export const SEED_RECURRING_RULES: RecurringRule[] = [
  {
    id: "seed-rule-1",
    description: "Nuvemshop",
    amount: 8990,
    category: "plataforma",
    paymentSource: "cartao",
    type: "expense",
    frequency: "mensal",
    dayOfMonth: 8,
    startDate: iso(-95).slice(0, 8) + "01",
    active: true,
    createdAt: now,
  },
];

export const CUSTOM_CATEGORIES_SEED: Category[] = [];
