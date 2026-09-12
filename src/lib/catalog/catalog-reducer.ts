import type { Product } from "./types";

export type CatalogState = {
  products: Product[];
};

export const EMPTY_CATALOG_STATE: CatalogState = { products: [] };

export type CatalogAction =
  | { type: "HYDRATE"; state: CatalogState }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; id: string; changes: Partial<Product>; at: string }
  | { type: "DELETE_PRODUCT"; id: string }
  /** Persists a simulation result onto the real product — the only path that lets a
   *  simulation affect real data, and only when the caller explicitly asks for it. */
  | { type: "APPLY_SIMULATION"; id: string; costComponents: Product["costComponents"]; price: number; at: string };

export function catalogReducer(state: CatalogState, action: CatalogAction): CatalogState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.product] };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.id ? { ...p, ...action.changes, updatedAt: action.at } : p
        ),
      };

    case "DELETE_PRODUCT":
      return { ...state, products: state.products.filter((p) => p.id !== action.id) };

    case "APPLY_SIMULATION":
      return {
        ...state,
        products: state.products.map((p) =>
          p.id === action.id
            ? { ...p, costComponents: action.costComponents, price: action.price, updatedAt: action.at }
            : p
        ),
      };

    default:
      return state;
  }
}
