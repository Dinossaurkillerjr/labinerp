"use client";

import * as React from "react";
import type { Discount, Sale, SalesChannel } from "./types";
import { salesReducer, type SalesAction, type SalesState } from "./sales-reducer";
import { SEED_SALES } from "./seed";
import { buildIncomeTransactionInput } from "./calculations";
import { useFinance } from "@/lib/finance/finance-provider";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import { usePersistentReducer } from "@/lib/persistent-reducer";

const STORAGE_KEY = "erp-sales-v1";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function seededState(): SalesState {
  return { sales: SEED_SALES };
}

export type NewSaleInput = {
  date: string;
  contactId?: string;
  productId: string;
  quantity: number;
  couponCode?: string;
  subtotal?: number;
  discount?: Discount;
  shippingAmount?: number;
  shippingCost?: number;
  totalAmount: number;
  channel: SalesChannel;
  notes?: string;
};

type SalesContextValue = {
  sales: Sale[];
  addSale: (input: NewSaleInput) => Sale;
  deleteSale: (id: string) => void;
};

const SalesContext = React.createContext<SalesContextValue | null>(null);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = usePersistentReducer<SalesState, SalesAction>(
    salesReducer,
    seededState,
    STORAGE_KEY,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState })
  );
  const { addTransaction, deleteTransaction } = useFinance();
  const { getProduct } = useCatalog();

  const value = React.useMemo<SalesContextValue>(
    () => ({
      sales: state.sales,

      addSale(input: NewSaleInput): Sale {
        const product = getProduct(input.productId);
        const timestamp = nowISO();

        // The sale never records revenue itself — it reuses the existing
        // Financeiro `addTransaction`, so "receita" keeps a single definition.
        const transaction = addTransaction(
          buildIncomeTransactionInput({
            date: input.date,
            totalAmount: input.totalAmount,
            productName: product?.name ?? "Produto",
            channel: input.channel,
          })
        );

        const sale: Sale = {
          id: makeId(),
          ...input,
          transactionId: transaction.id,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        dispatch({ type: "ADD_SALE", sale });
        return sale;
      },

      deleteSale(id: string) {
        const sale = state.sales.find((s) => s.id === id);
        if (sale) deleteTransaction(sale.transactionId);
        dispatch({ type: "DELETE_SALE", id });
      },
    }),
    [state, dispatch, addTransaction, deleteTransaction, getProduct]
  );

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

export function useSales() {
  const ctx = React.useContext(SalesContext);
  if (!ctx) throw new Error("useSales must be used within a SalesProvider");
  return ctx;
}
