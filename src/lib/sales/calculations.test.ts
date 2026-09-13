import { describe, expect, it } from "vitest";
import {
  calculateSaleCost,
  calculateSaleProfit,
  buildIncomeTransactionInput,
  calculateDiscountAmount,
  calculateShippingCharged,
  calculateSaleBreakdown,
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

describe("calculateDiscountAmount", () => {
  it("calcula desconto percentual sobre o subtotal", () => {
    expect(calculateDiscountAmount(20000, { kind: "percentual", percent: 10 })).toBe(2000);
  });

  it("calcula desconto de valor fixo, sem passar do subtotal", () => {
    expect(calculateDiscountAmount(10000, { kind: "valor_fixo", amount: 3000 })).toBe(3000);
    expect(calculateDiscountAmount(1000, { kind: "valor_fixo", amount: 3000 })).toBe(1000); // nunca desconta mais que o subtotal
  });

  it("frete grátis não desconta o subtotal", () => {
    expect(calculateDiscountAmount(14800, { kind: "frete_gratis" })).toBe(0);
  });

  it("sem cupom, não há desconto", () => {
    expect(calculateDiscountAmount(14800, undefined)).toBe(0);
  });
});

describe("calculateShippingCharged", () => {
  it("cobra o custo real de frete quando não há frete grátis", () => {
    expect(calculateShippingCharged(3000, undefined)).toBe(3000);
    expect(calculateShippingCharged(3000, { kind: "percentual", percent: 10 })).toBe(3000);
  });

  it("zera o frete cobrado quando o cupom é frete grátis, mesmo com custo real", () => {
    expect(calculateShippingCharged(3000, { kind: "frete_gratis" })).toBe(0);
  });
});

describe("calculateSaleBreakdown", () => {
  it("R$148 + frete grátis (custo real R$30 para a marca) → total R$148", () => {
    const breakdown = calculateSaleBreakdown({
      subtotal: 14800,
      discount: { kind: "frete_gratis" },
      shippingCost: 3000,
    });
    expect(breakdown.discountAmount).toBe(0);
    expect(breakdown.shippingAmount).toBe(0);
    expect(breakdown.shippingCost).toBe(3000); // custo real fica registrado mesmo não sendo cobrado
    expect(breakdown.totalAmount).toBe(14800);
  });

  it("R$200 + 10% de desconto → desconto R$20, total R$180", () => {
    const breakdown = calculateSaleBreakdown({
      subtotal: 20000,
      discount: { kind: "percentual", percent: 10 },
      shippingCost: 0,
    });
    expect(breakdown.discountAmount).toBe(2000);
    expect(breakdown.totalAmount).toBe(18000);
  });

  it("sem cupom e com frete cobrado, o frete soma ao total", () => {
    const breakdown = calculateSaleBreakdown({ subtotal: 10000, shippingCost: 1500 });
    expect(breakdown.discountAmount).toBe(0);
    expect(breakdown.shippingAmount).toBe(1500);
    expect(breakdown.totalAmount).toBe(11500);
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
