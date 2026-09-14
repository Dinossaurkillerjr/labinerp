"use client";

import * as React from "react";
import type {
  Category,
  PaymentSource,
  RecurringRule,
  Transaction,
  TransactionRelations,
  TransactionStatus,
  TransactionType,
} from "./types";
import { DEFAULT_CATEGORIES } from "./categories";
import {
  EMPTY_FINANCE_STATE,
  financeReducer,
  type FinanceAction,
  type FinanceState,
} from "./store-reducer";
import {
  addMonthsToISODate,
  splitAmountIntoInstallments,
} from "./calculations";
import { generateMissingOccurrences } from "./recurrence";
import { useSupabaseReducer } from "@/lib/supabase/use-supabase-reducer";
import { diffById } from "@/lib/supabase/diff-collection";
import {
  deleteCustomCategories,
  deleteInstallmentGroups,
  deleteMonthClosings,
  deleteRecurringRules,
  deleteTransactionRows,
  fetchCustomCategories,
  fetchInstallmentGroups,
  fetchMonthClosings,
  fetchRecurringRules,
  fetchTransactions,
  upsertCustomCategories,
  upsertInstallmentGroups,
  upsertMonthClosings,
  upsertRecurringRules,
  upsertTransactions,
} from "./repository";

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

/**
 * Fetches every Financeiro sub-collection, then generates any recurring
 * occurrences that are due but missing (exactly like the old localStorage
 * version did right after hydrating) — persisting the newly generated
 * transactions immediately, since they won't exist in `previous` for the
 * sync effect to pick up otherwise.
 */
async function fetchInitial(userId: string): Promise<FinanceState> {
  const [transactions, customCategories, installmentGroups, recurringRules, monthClosings] = await Promise.all([
    fetchTransactions(userId),
    fetchCustomCategories(userId),
    fetchInstallmentGroups(userId),
    fetchRecurringRules(userId),
    fetchMonthClosings(userId),
  ]);

  const horizon = addMonthsToISODate(todayISO(), RECURRENCE_HORIZON_MONTHS);
  const generated = recurringRules.flatMap((rule) =>
    generateMissingOccurrences(rule, transactions, horizon, makeId, nowISO())
  );
  if (generated.length > 0) {
    await upsertTransactions(userId, generated);
  }

  return {
    transactions: [...transactions, ...generated],
    customCategories,
    installmentGroups,
    recurringRules,
    monthClosings,
  };
}

async function sync(userId: string, previous: FinanceState, next: FinanceState): Promise<void> {
  const transactionsDiff = diffById(previous.transactions, next.transactions);
  const categoriesDiff = diffById(previous.customCategories, next.customCategories);
  const installmentGroupsDiff = diffById(previous.installmentGroups, next.installmentGroups);
  const recurringRulesDiff = diffById(previous.recurringRules, next.recurringRules);
  const monthClosingsDiff = diffById(previous.monthClosings, next.monthClosings);

  await Promise.all([
    upsertTransactions(userId, [...transactionsDiff.inserted, ...transactionsDiff.updated]),
    deleteTransactionRows(userId, transactionsDiff.deletedIds),
    upsertCustomCategories(userId, [...categoriesDiff.inserted, ...categoriesDiff.updated]),
    deleteCustomCategories(userId, categoriesDiff.deletedIds),
    upsertInstallmentGroups(userId, [...installmentGroupsDiff.inserted, ...installmentGroupsDiff.updated]),
    deleteInstallmentGroups(userId, installmentGroupsDiff.deletedIds),
    upsertRecurringRules(userId, [...recurringRulesDiff.inserted, ...recurringRulesDiff.updated]),
    deleteRecurringRules(userId, recurringRulesDiff.deletedIds),
    upsertMonthClosings(userId, [...monthClosingsDiff.inserted, ...monthClosingsDiff.updated]),
    deleteMonthClosings(userId, monthClosingsDiff.deletedIds),
  ]);
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
  relations?: TransactionRelations;
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
  installmentGroups: FinanceState["installmentGroups"];
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
  const [state, dispatch] = useSupabaseReducer<FinanceState, FinanceAction>(
    financeReducer,
    EMPTY_FINANCE_STATE,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState }),
    fetchInitial,
    sync
  );

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
      installmentGroups: state.installmentGroups,
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
  }, [state, categories, isMonthClosed, dispatch]);

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = React.useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within a FinanceProvider");
  return ctx;
}
