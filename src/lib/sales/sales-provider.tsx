"use client";

import * as React from "react";
import type { Discount, Sale, SalesChannel } from "./types";
import { salesReducer, EMPTY_SALES_STATE, type SalesAction, type SalesState } from "./sales-reducer";
import { buildIncomeTransactionInput, reconcileShippingExpense } from "./calculations";
import { useFinance } from "@/lib/finance/finance-provider";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import { useSupabaseReducer } from "@/lib/supabase/use-supabase-reducer";
import { diffById } from "@/lib/supabase/diff-collection";
import { deleteSales, fetchSales, upsertSales } from "./repository";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

async function fetchInitial(userId: string): Promise<SalesState> {
  return { sales: await fetchSales(userId) };
}

async function sync(userId: string, previous: SalesState, next: SalesState): Promise<void> {
  const { inserted, updated, deletedIds } = diffById(previous.sales, next.sales);
  await Promise.all([upsertSales(userId, [...inserted, ...updated]), deleteSales(userId, deletedIds)]);
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
  updateSale: (id: string, input: NewSaleInput) => void;
  deleteSale: (id: string) => void;
};

const SalesContext = React.createContext<SalesContextValue | null>(null);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useSupabaseReducer<SalesState, SalesAction>(
    salesReducer,
    EMPTY_SALES_STATE,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState }),
    fetchInitial,
    sync
  );
  const { addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { getProduct } = useCatalog();

  const value = React.useMemo<SalesContextValue>(
    () => ({
      sales: state.sales,

      addSale(input: NewSaleInput): Sale {
        const product = getProduct(input.productId);
        const timestamp = nowISO();
        const saleId = makeId();

        // The sale never records revenue itself — it reuses the existing
        // Financeiro `addTransaction`, so "receita" keeps a single definition.
        const transaction = addTransaction(
          buildIncomeTransactionInput({
            date: input.date,
            totalAmount: input.totalAmount,
            productName: product?.name ?? "Produto",
            channel: input.channel,
            saleId,
          })
        );

        // O custo real de frete nunca reduz a receita — vira uma despesa
        // própria (categoria "frete"), só quando de fato há custo. A venda
        // continua sendo uma única receita.
        const reconciliation = reconcileShippingExpense({
          saleId,
          date: input.date,
          shippingCost: input.shippingCost ?? 0,
          productName: product?.name ?? "Produto",
        });
        const shippingTransactionId =
          reconciliation.action === "create" ? addTransaction(reconciliation.input).id : undefined;

        const sale: Sale = {
          id: saleId,
          ...input,
          transactionId: transaction.id,
          shippingTransactionId,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        dispatch({ type: "ADD_SALE", sale });
        return sale;
      },

      updateSale(id: string, input: NewSaleInput) {
        const existing = state.sales.find((s) => s.id === id);
        if (!existing) return;
        const product = getProduct(input.productId);
        const timestamp = nowISO();

        // Sempre atualiza a mesma transação de receita — nunca cria uma segunda.
        updateTransaction(
          existing.transactionId,
          buildIncomeTransactionInput({
            date: input.date,
            totalAmount: input.totalAmount,
            productName: product?.name ?? "Produto",
            channel: input.channel,
            saleId: id,
          })
        );

        // Mesma decisão usada na criação — nunca duplica a despesa de frete
        // ao editar, e desvincula/remove quando o custo é zerado.
        const reconciliation = reconcileShippingExpense({
          saleId: id,
          date: input.date,
          shippingCost: input.shippingCost ?? 0,
          productName: product?.name ?? "Produto",
          existingShippingTransactionId: existing.shippingTransactionId,
        });

        let shippingTransactionId = existing.shippingTransactionId;
        if (reconciliation.action === "update") {
          updateTransaction(reconciliation.transactionId, reconciliation.input);
        } else if (reconciliation.action === "create") {
          shippingTransactionId = addTransaction(reconciliation.input).id;
        } else if (reconciliation.action === "delete") {
          deleteTransaction(reconciliation.transactionId);
          shippingTransactionId = undefined;
        }

        dispatch({
          type: "UPDATE_SALE",
          id,
          changes: { ...input, shippingTransactionId },
          at: timestamp,
        });
      },

      deleteSale(id: string) {
        const sale = state.sales.find((s) => s.id === id);
        if (sale) {
          deleteTransaction(sale.transactionId);
          if (sale.shippingTransactionId) deleteTransaction(sale.shippingTransactionId);
        }
        dispatch({ type: "DELETE_SALE", id });
      },
    }),
    [state, dispatch, addTransaction, updateTransaction, deleteTransaction, getProduct]
  );

  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

export function useSales() {
  const ctx = React.useContext(SalesContext);
  if (!ctx) throw new Error("useSales must be used within a SalesProvider");
  return ctx;
}
