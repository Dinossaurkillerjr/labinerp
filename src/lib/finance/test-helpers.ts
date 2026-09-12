import type { Transaction } from "./types";

let counter = 0;

/** Builds a valid Transaction for tests, with sensible defaults that can be overridden. */
export function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  counter += 1;
  const now = "2026-01-01T12:00:00.000Z";
  return {
    id: `t${counter}`,
    type: "expense",
    amount: 1000,
    date: "2026-01-10",
    category: "outros_custos",
    description: "Transação de teste",
    paymentSource: "conta_marca",
    status: "concluido",
    createdAt: now,
    updatedAt: now,
    edited: false,
    ...overrides,
  };
}
