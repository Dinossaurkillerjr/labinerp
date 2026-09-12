import { describe, expect, it } from "vitest";
import { diffTransactionFields } from "./edit";
import { makeTransaction } from "./test-helpers";

describe("diffTransactionFields", () => {
  it("detecta apenas os campos que mudaram", () => {
    const original = makeTransaction({ amount: 1000, description: "Original" });
    const changed = diffTransactionFields(original, { amount: 2000, description: "Original" });
    expect(changed).toEqual(["amount"]);
  });

  it("ignora campos de bookkeeping", () => {
    const original = makeTransaction();
    const changed = diffTransactionFields(original, {
      updatedAt: "2099-01-01T00:00:00.000Z",
      edited: true,
    });
    expect(changed).toEqual([]);
  });

  it("retorna vazio quando nada muda", () => {
    const original = makeTransaction({ amount: 1000 });
    expect(diffTransactionFields(original, { amount: 1000 })).toEqual([]);
  });
});
