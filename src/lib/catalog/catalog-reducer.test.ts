import { describe, expect, it } from "vitest";
import { catalogReducer, EMPTY_CATALOG_STATE } from "./catalog-reducer";
import type { Product } from "./types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Camiseta Oversized",
    status: "ativo",
    price: 20000,
    costComponents: [{ id: "c1", category: "produto_pod", amount: 13500 }],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("catalogReducer", () => {
  it("ADD_PRODUCT adiciona um produto com poucos campos (cadastro progressivo)", () => {
    const minimal: Product = {
      id: "p2",
      name: "Camiseta Simples",
      status: "rascunho",
      costComponents: [],
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    const state = catalogReducer(EMPTY_CATALOG_STATE, { type: "ADD_PRODUCT", product: minimal });
    expect(state.products).toHaveLength(1);
    expect(state.products[0].price).toBeUndefined();
  });

  it("UPDATE_PRODUCT permite adicionar campos extras depois (progressive disclosure)", () => {
    let state = catalogReducer(EMPTY_CATALOG_STATE, { type: "ADD_PRODUCT", product: makeProduct({ sku: undefined }) });
    state = catalogReducer(state, {
      type: "UPDATE_PRODUCT",
      id: "p1",
      changes: { sku: "CAM-001", collection: "Verão 2026" },
      at: "2026-01-02T00:00:00.000Z",
    });
    expect(state.products[0].sku).toBe("CAM-001");
    expect(state.products[0].collection).toBe("Verão 2026");
  });

  it("APPLY_SIMULATION só altera o produto quando explicitamente chamado", () => {
    let state = catalogReducer(EMPTY_CATALOG_STATE, { type: "ADD_PRODUCT", product: makeProduct() });
    const originalCost = state.products[0].costComponents;

    // Simulação em si não passa pelo reducer (é cálculo puro em outro módulo) —
    // aqui garantimos que só a ação explícita ADD_PRODUCT/APPLY_SIMULATION muda o estado.
    expect(state.products[0].costComponents).toBe(originalCost);

    state = catalogReducer(state, {
      type: "APPLY_SIMULATION",
      id: "p1",
      costComponents: [...originalCost, { id: "brinde", category: "outros_custos", amount: 800 }],
      price: 20000,
      at: "2026-01-03T00:00:00.000Z",
    });

    expect(state.products[0].costComponents).toHaveLength(2);
  });

  it("DELETE_PRODUCT remove o produto", () => {
    let state = catalogReducer(EMPTY_CATALOG_STATE, { type: "ADD_PRODUCT", product: makeProduct() });
    state = catalogReducer(state, { type: "DELETE_PRODUCT", id: "p1" });
    expect(state.products).toHaveLength(0);
  });

  it("HYDRATE substitui o estado inteiro com os dados persistidos", () => {
    const persisted = { products: [makeProduct({ id: "persisted-1" })] };
    const state = catalogReducer(EMPTY_CATALOG_STATE, { type: "HYDRATE", state: persisted });
    expect(state.products).toHaveLength(1);
    expect(state.products[0].id).toBe("persisted-1");
  });
});
