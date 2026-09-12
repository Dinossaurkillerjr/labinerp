import { describe, expect, it } from "vitest";
import {
  calculateSaleCost,
  calculateSaleProfit,
  buildIncomeTransactionInput,
  aggregateContactHistory,
} from "./calculations";
import type { Product } from "@/lib/catalog/types";
import type { Sale } from "./types";

const product: Product = {
  id: "prod-1",
  name: "Camiseta Oversized Preta",
  status: "ativo",
  price: 12900,
  costComponents: [
    { id: "c1", category: "produto_pod", amount: 4500 },
    { id: "c2", category: "frete", amount: 1200 },
  ],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("calculateSaleCost", () => {
  it("multiplica o custo unitário do produto pela quantidade", () => {
    expect(calculateSaleCost(product, 3)).toBe((4500 + 1200) * 3);
  });
});

describe("calculateSaleProfit", () => {
  it("calcula o lucro da venda com base no custo do produto", () => {
    const profit = calculateSaleProfit(38700, product, 3); // 3x R$ 129,00
    expect(profit).toBe(38700 - (4500 + 1200) * 3);
  });
});

describe("buildIncomeTransactionInput", () => {
  it("gera um input de receita compatível com o Financeiro (categoria venda)", () => {
    const input = buildIncomeTransactionInput({
      date: "2026-09-10",
      totalAmount: 12900,
      productName: "Camiseta Oversized Preta",
      channel: "Instagram",
    });

    expect(input.type).toBe("income");
    expect(input.category).toBe("venda");
    expect(input.amount).toBe(12900);
    expect(input.status).toBe("concluido");
    expect(input.description).toContain("Camiseta Oversized Preta");
  });
});

describe("aggregateContactHistory", () => {
  const sales: Sale[] = [
    {
      id: "s1",
      date: "2026-09-01",
      contactId: "ct1",
      productId: "prod-1",
      quantity: 1,
      totalAmount: 12900,
      channel: "instagram",
      transactionId: "t1",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-01T00:00:00.000Z",
    },
    {
      id: "s2",
      date: "2026-09-10",
      contactId: "ct1",
      productId: "prod-1",
      quantity: 2,
      totalAmount: 25800,
      channel: "whatsapp",
      transactionId: "t2",
      createdAt: "2026-09-10T00:00:00.000Z",
      updatedAt: "2026-09-10T00:00:00.000Z",
    },
    {
      id: "s3",
      date: "2026-09-05",
      contactId: "ct2",
      productId: "prod-1",
      quantity: 1,
      totalAmount: 12900,
      channel: "nuvemshop",
      transactionId: "t3",
      createdAt: "2026-09-05T00:00:00.000Z",
      updatedAt: "2026-09-05T00:00:00.000Z",
    },
  ];

  it("soma total comprado e quantidade de compras só do contato pedido", () => {
    const history = aggregateContactHistory(sales, "ct1");
    expect(history.totalPurchased).toBe(12900 + 25800);
    expect(history.purchaseCount).toBe(2);
    expect(history.lastPurchaseDate).toBe("2026-09-10");
  });

  it("retorna vazio para contato sem compras", () => {
    const history = aggregateContactHistory(sales, "ct-sem-compras");
    expect(history.totalPurchased).toBe(0);
    expect(history.purchaseCount).toBe(0);
    expect(history.lastPurchaseDate).toBeUndefined();
  });
});
