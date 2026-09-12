import { describe, expect, it } from "vitest";
import { salesReducer, EMPTY_SALES_STATE } from "./sales-reducer";
import type { Sale } from "./types";

const sale: Sale = {
  id: "s1",
  date: "2026-09-10",
  contactId: "ct1",
  productId: "prod-1",
  quantity: 1,
  totalAmount: 12900,
  channel: "instagram",
  transactionId: "t1",
  createdAt: "2026-09-10T00:00:00.000Z",
  updatedAt: "2026-09-10T00:00:00.000Z",
};

describe("salesReducer", () => {
  it("ADD_SALE adiciona a venda com a relação de transactionId preservada", () => {
    const state = salesReducer(EMPTY_SALES_STATE, { type: "ADD_SALE", sale });
    expect(state.sales).toHaveLength(1);
    expect(state.sales[0].transactionId).toBe("t1");
    expect(state.sales[0].productId).toBe("prod-1");
    expect(state.sales[0].contactId).toBe("ct1");
  });

  it("DELETE_SALE remove a venda", () => {
    let state = salesReducer(EMPTY_SALES_STATE, { type: "ADD_SALE", sale });
    state = salesReducer(state, { type: "DELETE_SALE", id: "s1" });
    expect(state.sales).toHaveLength(0);
  });

  it("HYDRATE substitui o estado inteiro com os dados persistidos", () => {
    const persisted = { sales: [{ ...sale, id: "persisted-1" }] };
    const state = salesReducer(EMPTY_SALES_STATE, { type: "HYDRATE", state: persisted });
    expect(state.sales).toHaveLength(1);
    expect(state.sales[0].id).toBe("persisted-1");
  });
});
