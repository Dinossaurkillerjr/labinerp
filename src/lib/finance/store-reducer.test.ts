import { describe, expect, it } from "vitest";
import { financeReducer, EMPTY_FINANCE_STATE } from "./store-reducer";
import { makeTransaction } from "./test-helpers";

describe("financeReducer", () => {
  it("UPDATE_TRANSACTION marca edited=true e registra o histórico", () => {
    const transaction = makeTransaction({ amount: 1000 });
    const state = financeReducer(EMPTY_FINANCE_STATE, { type: "ADD_TRANSACTION", transaction });

    const updated = financeReducer(state, {
      type: "UPDATE_TRANSACTION",
      id: transaction.id,
      changes: { amount: 2000 },
      at: "2026-02-01T00:00:00.000Z",
    });

    const result = updated.transactions[0];
    expect(result.amount).toBe(2000);
    expect(result.edited).toBe(true);
    expect(result.editHistory).toHaveLength(1);
    expect(result.editHistory?.[0].fields).toEqual(["amount"]);
  });

  it("UPDATE_TRANSACTION não marca edited quando nada muda de fato", () => {
    const transaction = makeTransaction({ amount: 1000 });
    const state = financeReducer(EMPTY_FINANCE_STATE, { type: "ADD_TRANSACTION", transaction });

    const updated = financeReducer(state, {
      type: "UPDATE_TRANSACTION",
      id: transaction.id,
      changes: { amount: 1000 },
      at: "2026-02-01T00:00:00.000Z",
    });

    expect(updated.transactions[0].edited).toBe(false);
  });

  it("CLOSE_MONTH e REOPEN_MONTH alternam o status corretamente", () => {
    let state = financeReducer(EMPTY_FINANCE_STATE, {
      type: "CLOSE_MONTH",
      monthId: "2026-01",
      at: "2026-02-01T00:00:00.000Z",
    });
    expect(state.monthClosings[0].status).toBe("fechado");

    state = financeReducer(state, {
      type: "REOPEN_MONTH",
      monthId: "2026-01",
      at: "2026-02-02T00:00:00.000Z",
    });
    expect(state.monthClosings[0].status).toBe("aberto");
    expect(state.monthClosings[0].reopenedAt).toBe("2026-02-02T00:00:00.000Z");
  });

  it("DELETE_TRANSACTION remove a transação", () => {
    const transaction = makeTransaction();
    let state = financeReducer(EMPTY_FINANCE_STATE, { type: "ADD_TRANSACTION", transaction });
    expect(state.transactions).toHaveLength(1);

    state = financeReducer(state, { type: "DELETE_TRANSACTION", id: transaction.id });
    expect(state.transactions).toHaveLength(0);
  });

  it("HYDRATE substitui o estado inteiro (usado para carregar dados persistidos após a montagem)", () => {
    const persisted = {
      ...EMPTY_FINANCE_STATE,
      transactions: [makeTransaction({ id: "persisted-1" })],
    };
    const state = financeReducer(EMPTY_FINANCE_STATE, { type: "HYDRATE", state: persisted });
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0].id).toBe("persisted-1");
  });
});
