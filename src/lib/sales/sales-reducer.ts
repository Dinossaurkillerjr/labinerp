import type { Sale } from "./types";

export type SalesState = {
  sales: Sale[];
};

export const EMPTY_SALES_STATE: SalesState = { sales: [] };

export type SalesAction =
  | { type: "HYDRATE"; state: SalesState }
  | { type: "ADD_SALE"; sale: Sale }
  | { type: "UPDATE_SALE"; id: string; changes: Partial<Sale>; at: string }
  | { type: "DELETE_SALE"; id: string };

export function salesReducer(state: SalesState, action: SalesAction): SalesState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_SALE":
      return { ...state, sales: [...state.sales, action.sale] };
    case "UPDATE_SALE":
      return {
        ...state,
        sales: state.sales.map((s) =>
          s.id === action.id ? { ...s, ...action.changes, updatedAt: action.at } : s
        ),
      };
    case "DELETE_SALE":
      return { ...state, sales: state.sales.filter((s) => s.id !== action.id) };
    default:
      return state;
  }
}
