"use client";

import * as React from "react";
import type {
  Category,
  PaymentSource,
  RecurringRule,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "./types";
import { DEFAULT_CATEGORIES } from "./categories";
import {
  EMPTY_FINANCE_STATE,
  financeReducer,
  type FinanceState,
} from "./store-reducer";
import {
  addMonthsToISODate,
  splitAmountIntoInstallments,
} from "./calculations";
import { generateMissingOccurrences } from "./recurrence";
import {
  SEED_INSTALLMENT_TRANSACTIONS,
  SEED_RECURRING_RULES,
  SEED_TRANSACTIONS,
} from "./seed";

const STORAGE_KEY = "erp-finance-v1";
const RECURRENCE_HORIZON_MONTHS = 2;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function todayISO(): string {
  return nowISO().slice(0, 10);
}

function loadInitialState(): FinanceState {
  const seeded: FinanceState = {
    ...EMPTY_FINANCE_STATE,
    transactions: [...SEED_TRANSACTIONS, ...SEED_INSTALLMENT_TRANSACTIONS],
    recurringRules: SEED_RECURRING_RULES,
    installmentGroups: [
      {
        id: "seed-group-1",
        description: "Máquina de costura — 3x",
        totalAmount: 60000,
        installmentsCount: 3,
        createdAt: nowISO(),
      },
    ],
  };

  if (typeof window === "undefined") return seeded;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seeded;
    const parsed = JSON.parse(raw) as FinanceState;
    if (!parsed.transactions) return seeded;
    return parsed;
  } catch {
    return seeded;
  }
}

export type NewTransactionInput = {
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  description: string;
  paymentSource: PaymentSource;
  status: TransactionStatus;
  dueDate?: string;
  notes?: string;
};

export type NewInstallmentInput = Omit<NewTransactionInput, "amount" | "status"> & {
  totalAmount: number;
  installmentsCount: number;
  /** Whether the first installment is already settled. */
  firstInstallmentSettled: boolean;
};

export type NewRecurringRuleInput = {
  description: string;
  amount: number;
  category: string;
  paymentSource: PaymentSource;
  type: Extract<TransactionType, "expense" | "income">;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
};

type FinanceContextValue = {
  transactions: Transaction[];
  categories: Category[];
  recurringRules: RecurringRule[];
  monthClosings: FinanceState["monthClosings"];
  addTransaction: (input: NewTransactionInput) => Transaction;
  addInstallmentTransaction: (input: NewInstallmentInput) => Transaction[];
  updateTransaction: (id: string, changes: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setTransactionStatus: (id: string, status: TransactionStatus) => void;
  addCategory: (label: string, group: Category["group"]) => Category;
  addRecurringRule: (input: NewRecurringRuleInput) => RecurringRule;
  toggleRecurringRule: (id: string, active: boolean) => void;
  isMonthClosed: (dateISO: string) => boolean;
  closeMonth: (monthId: string) => void;
  reopenMonth: (monthId: string) => void;
};

const FinanceContext = React.createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(financeReducer, undefined, loadInitialState);
  const hydrated = React.useRef(false);

  // Generate any missing recurring occurrences once, on first mount.
  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const horizon = addMonthsToISODate(todayISO(), RECURRENCE_HORIZON_MONTHS);
    const newTransactions = state.recurringRules.flatMap((rule) =>
      generateMissingOccurrences(rule, state.transactions, horizon, makeId, nowISO())
    );
    if (newTransactions.length > 0) {
      dispatch({ type: "ADD_TRANSACTIONS", transactions: newTransactions });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const categories = React.useMemo<Category[]>(
    () => [...DEFAULT_CATEGORIES, ...state.customCategories],
    [state.customCategories]
  );

  const isMonthClosed = React.useCallback(
    (dateISO: string) => {
      const monthId = dateISO.slice(0, 7);
      return state.monthClosings.find((m) => m.id === monthId)?.status === "fechado";
    },
    [state.monthClosings]
  );

  const value = React.useMemo<FinanceContextValue>(() => {
    function addTransaction(input: NewTransactionInput): Transaction {
      const timestamp = nowISO();
      const transaction: Transaction = {
        id: makeId(),
        ...input,
        createdAt: timestamp,
        updatedAt: timestamp,
        edited: false,
      };
      dispatch({ type: "ADD_TRANSACTION", transaction });
      return transaction;
    }

    function addInstallmentTransaction(input: NewInstallmentInput): Transaction[] {
      const timestamp = nowISO();
      const groupId = makeId();
      const amounts = splitAmountIntoInstallments(input.totalAmount, input.installmentsCount);

      const transactions: Transaction[] = amounts.map((amount, index) => {
        const date = addMonthsToISODate(input.date, index);
        const settled = index === 0 && input.firstInstallmentSettled;
        return {
          id: makeId(),
          type: input.type,
          amount,
          date,
          dueDate: settled ? undefined : date,
          category: input.category,
          description: input.description,
          paymentSource: input.paymentSource,
          status: settled ? "concluido" : "pendente",
          createdAt: timestamp,
          updatedAt: timestamp,
          edited: false,
          notes: input.notes,
          relations: { installmentGroupId: groupId },
          installment: { number: index + 1, total: input.installmentsCount },
        };
      });

      dispatch({
        type: "ADD_INSTALLMENT_GROUP",
        group: {
          id: groupId,
          description: input.description,
          totalAmount: input.totalAmount,
          installmentsCount: input.installmentsCount,
          createdAt: timestamp,
        },
      });
      dispatch({ type: "ADD_TRANSACTIONS", transactions });
      return transactions;
    }

    function updateTransaction(id: string, changes: Partial<Transaction>) {
      dispatch({ type: "UPDATE_TRANSACTION", id, changes, at: nowISO() });
    }

    function deleteTransaction(id: string) {
      dispatch({ type: "DELETE_TRANSACTION", id });
    }

    function setTransactionStatus(id: string, status: TransactionStatus) {
      dispatch({ type: "SET_STATUS", id, status, at: nowISO() });
    }

    function addCategory(label: string, group: Category["group"]): Category {
      const category: Category = {
        id: `${group}-${label.toLowerCase().replace(/\s+/g, "-")}-${makeId().slice(0, 6)}`,
        label,
        group,
        custom: true,
      };
      dispatch({ type: "ADD_CUSTOM_CATEGORY", category });
      return category;
    }

    function addRecurringRule(input: NewRecurringRuleInput): RecurringRule {
      const rule: RecurringRule = {
        id: makeId(),
        frequency: "mensal",
        active: true,
        createdAt: nowISO(),
        ...input,
      };
      dispatch({ type: "ADD_RECURRING_RULE", rule });

      const horizon = addMonthsToISODate(todayISO(), RECURRENCE_HORIZON_MONTHS);
      const generated = generateMissingOccurrences(rule, state.transactions, horizon, makeId, nowISO());
      if (generated.length > 0) {
        dispatch({ type: "ADD_TRANSACTIONS", transactions: generated });
      }
      return rule;
    }

    function toggleRecurringRule(id: string, active: boolean) {
      dispatch({ type: "TOGGLE_RECURRING_RULE", id, active });
    }

    function closeMonth(monthId: string) {
      dispatch({ type: "CLOSE_MONTH", monthId, at: nowISO() });
    }

    function reopenMonth(monthId: string) {
      dispatch({ type: "REOPEN_MONTH", monthId, at: nowISO() });
    }

    return {
      transactions: state.transactions,
      categories,
      recurringRules: state.recurringRules,
      monthClosings: state.monthClosings,
      addTransaction,
      addInstallmentTransaction,
      updateTransaction,
      deleteTransaction,
      setTransactionStatus,
      addCategory,
      addRecurringRule,
      toggleRecurringRule,
      isMonthClosed,
      closeMonth,
      reopenMonth,
    };
  }, [state, categories, isMonthClosed]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = React.useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within a FinanceProvider");
  return ctx;
}
