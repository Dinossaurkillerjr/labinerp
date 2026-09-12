import type {
  Category,
  InstallmentGroup,
  MonthClosing,
  RecurringRule,
  Transaction,
  TransactionStatus,
} from "./types";
import { diffTransactionFields } from "./edit";

export type FinanceState = {
  transactions: Transaction[];
  customCategories: Category[];
  installmentGroups: InstallmentGroup[];
  recurringRules: RecurringRule[];
  monthClosings: MonthClosing[];
};

export const EMPTY_FINANCE_STATE: FinanceState = {
  transactions: [],
  customCategories: [],
  installmentGroups: [],
  recurringRules: [],
  monthClosings: [],
};

export type FinanceAction =
  | { type: "HYDRATE"; state: FinanceState }
  | { type: "ADD_TRANSACTION"; transaction: Transaction }
  | { type: "ADD_TRANSACTIONS"; transactions: Transaction[] }
  | { type: "UPDATE_TRANSACTION"; id: string; changes: Partial<Transaction>; at: string }
  | { type: "DELETE_TRANSACTION"; id: string }
  | { type: "SET_STATUS"; id: string; status: TransactionStatus; at: string }
  | { type: "ADD_INSTALLMENT_GROUP"; group: InstallmentGroup }
  | { type: "ADD_CUSTOM_CATEGORY"; category: Category }
  | { type: "ADD_RECURRING_RULE"; rule: RecurringRule }
  | { type: "TOGGLE_RECURRING_RULE"; id: string; active: boolean }
  | { type: "CLOSE_MONTH"; monthId: string; at: string }
  | { type: "REOPEN_MONTH"; monthId: string; at: string };

export function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_TRANSACTION":
      return { ...state, transactions: [...state.transactions, action.transaction] };

    case "ADD_TRANSACTIONS":
      return { ...state, transactions: [...state.transactions, ...action.transactions] };

    case "UPDATE_TRANSACTION": {
      return {
        ...state,
        transactions: state.transactions.map((t) => {
          if (t.id !== action.id) return t;
          const changedFields = diffTransactionFields(t, action.changes);
          if (changedFields.length === 0) return t;
          return {
            ...t,
            ...action.changes,
            edited: true,
            updatedAt: action.at,
            editHistory: [...(t.editHistory ?? []), { at: action.at, fields: changedFields }],
          };
        }),
      };
    }

    case "DELETE_TRANSACTION":
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };

    case "SET_STATUS":
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.id ? { ...t, status: action.status, updatedAt: action.at } : t
        ),
      };

    case "ADD_INSTALLMENT_GROUP":
      return { ...state, installmentGroups: [...state.installmentGroups, action.group] };

    case "ADD_CUSTOM_CATEGORY":
      return { ...state, customCategories: [...state.customCategories, action.category] };

    case "ADD_RECURRING_RULE":
      return { ...state, recurringRules: [...state.recurringRules, action.rule] };

    case "TOGGLE_RECURRING_RULE":
      return {
        ...state,
        recurringRules: state.recurringRules.map((r) =>
          r.id === action.id ? { ...r, active: action.active } : r
        ),
      };

    case "CLOSE_MONTH": {
      const exists = state.monthClosings.some((m) => m.id === action.monthId);
      const monthClosings = exists
        ? state.monthClosings.map((m) =>
            m.id === action.monthId ? { ...m, status: "fechado" as const, closedAt: action.at } : m
          )
        : [...state.monthClosings, { id: action.monthId, status: "fechado" as const, closedAt: action.at }];
      return { ...state, monthClosings };
    }

    case "REOPEN_MONTH":
      return {
        ...state,
        monthClosings: state.monthClosings.map((m) =>
          m.id === action.monthId
            ? { ...m, status: "aberto" as const, reopenedAt: action.at }
            : m
        ),
      };

    default:
      return state;
  }
}
