import { describe, expect, it } from "vitest";
import { capitalCategoryFor } from "./categories";

describe("capitalCategoryFor", () => {
  it("maps owner_contribution to the aporte category", () => {
    expect(capitalCategoryFor("owner_contribution")).toBe("aporte");
  });

  it("maps owner_withdrawal to the retirada category", () => {
    expect(capitalCategoryFor("owner_withdrawal")).toBe("retirada");
  });

  it("returns null for income and expense (they keep a user-picked category)", () => {
    expect(capitalCategoryFor("income")).toBeNull();
    expect(capitalCategoryFor("expense")).toBeNull();
  });
});
