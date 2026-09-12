import { describe, expect, it } from "vitest";
import { buildProductsReport, productsBelowMargin } from "./products-report";
import type { Sale } from "@/lib/sales/types";
import type { Product } from "@/lib/catalog/types";

const range = { start: "2026-09-01", end: "2026-09-30", label: "" };

const product: Product = {
  id: "p1",
  name: "Camiseta",
  status: "ativo",
  price: 10000,
  costComponents: [{ id: "c1", category: "produto_pod", amount: 6000 }],
  createdAt: "",
  updatedAt: "",
};

function makeSale(overrides: Partial<Sale>): Sale {
  return {
    id: `s-${Math.random()}`,
    date: "2026-09-10",
    productId: "p1",
    quantity: 1,
    totalAmount: 10000,
    channel: "instagram",
    transactionId: "t1",
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("buildProductsReport", () => {
  it("calcula quantidade, faturamento, custo e lucro por produto no período", () => {
    const sales = [makeSale({ quantity: 2, totalAmount: 20000 })];
    const [row] = buildProductsReport(sales, [product], range);
    expect(row.quantidadeVendida).toBe(2);
    expect(row.faturamento).toBe(20000);
    expect(row.custoTotal).toBe(12000); // 6000 * 2
    expect(row.lucro).toBe(8000);
    expect(row.margemPercent).toBeCloseTo(40, 5);
  });

  it("não inclui produtos sem vendas no período", () => {
    const rows = buildProductsReport([], [product], range);
    expect(rows).toHaveLength(0);
  });
});

describe("productsBelowMargin", () => {
  it("retorna produtos com margem igual ou abaixo do limite", () => {
    const lowMargin: Product = { ...product, id: "p2", price: 6500, costComponents: [{ id: "c", category: "produto_pod", amount: 6000 }] };
    const result = productsBelowMargin([product, lowMargin], 10);
    expect(result.map((p) => p.productId)).toEqual(["p2"]);
  });

  it("ignora produtos sem preço definido", () => {
    const noPrice: Product = { ...product, id: "p3", price: undefined };
    expect(productsBelowMargin([noPrice], 50)).toEqual([]);
  });
});
