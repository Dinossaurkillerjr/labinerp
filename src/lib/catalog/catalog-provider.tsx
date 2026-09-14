"use client";

import * as React from "react";
import type { CostComponent, Product, ProductStatus } from "./types";
import { catalogReducer, EMPTY_CATALOG_STATE, type CatalogAction, type CatalogState } from "./catalog-reducer";
import { useSupabaseReducer } from "@/lib/supabase/use-supabase-reducer";
import { diffById } from "@/lib/supabase/diff-collection";
import { deleteProducts, fetchProducts, upsertProducts } from "./repository";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

async function fetchInitial(userId: string): Promise<CatalogState> {
  return { products: await fetchProducts(userId) };
}

async function sync(userId: string, previous: CatalogState, next: CatalogState): Promise<void> {
  const { inserted, updated, deletedIds } = diffById(previous.products, next.products);
  await Promise.all([upsertProducts(userId, [...inserted, ...updated]), deleteProducts(userId, deletedIds)]);
}

export type NewProductInput = {
  name: string;
  status?: ProductStatus;
  price?: number;
};

type CatalogContextValue = {
  products: Product[];
  addProduct: (input: NewProductInput) => Product;
  updateProduct: (id: string, changes: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCostComponent: (productId: string, component: Omit<CostComponent, "id">) => void;
  removeCostComponent: (productId: string, componentId: string) => void;
  applySimulation: (productId: string, costComponents: CostComponent[], price: number) => void;
  getProduct: (id: string) => Product | undefined;
};

const CatalogContext = React.createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useSupabaseReducer<CatalogState, CatalogAction>(
    catalogReducer,
    EMPTY_CATALOG_STATE,
    (hydratedState) => ({ type: "HYDRATE" as const, state: hydratedState }),
    fetchInitial,
    sync
  );

  const value = React.useMemo<CatalogContextValue>(() => {
    function addProduct(input: NewProductInput): Product {
      const timestamp = nowISO();
      const product: Product = {
        id: makeId(),
        name: input.name,
        status: input.status ?? "rascunho",
        price: input.price,
        costComponents: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      dispatch({ type: "ADD_PRODUCT", product });
      return product;
    }

    function updateProduct(id: string, changes: Partial<Product>) {
      dispatch({ type: "UPDATE_PRODUCT", id, changes, at: nowISO() });
    }

    function deleteProduct(id: string) {
      dispatch({ type: "DELETE_PRODUCT", id });
    }

    function addCostComponent(productId: string, component: Omit<CostComponent, "id">) {
      const product = state.products.find((p) => p.id === productId);
      if (!product) return;
      const newComponent: CostComponent = { id: makeId(), ...component };
      updateProduct(productId, { costComponents: [...product.costComponents, newComponent] });
    }

    function removeCostComponent(productId: string, componentId: string) {
      const product = state.products.find((p) => p.id === productId);
      if (!product) return;
      updateProduct(productId, {
        costComponents: product.costComponents.filter((c) => c.id !== componentId),
      });
    }

    function applySimulation(productId: string, costComponents: CostComponent[], price: number) {
      dispatch({ type: "APPLY_SIMULATION", id: productId, costComponents, price, at: nowISO() });
    }

    function getProduct(id: string) {
      return state.products.find((p) => p.id === id);
    }

    return {
      products: state.products,
      addProduct,
      updateProduct,
      deleteProduct,
      addCostComponent,
      removeCostComponent,
      applySimulation,
      getProduct,
    };
  }, [state, dispatch]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = React.useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}
