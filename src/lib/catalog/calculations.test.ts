import { describe, expect, it } from "vitest";
import {
  calculateProductCost,
  calculateMargin,
  calculateCostComposition,
  simulateProduct,
} from "./calculations";
import type { CostComponent } from "./types";

const components: CostComponent[] = [
  { id: "c1", category: "produto_pod", amount: 11000 },
  { id: "c2", category: "etiqueta", amount: 300 },
  { id: "c3", category: "embalagem", amount: 400 },
  { id: "c4", category: "frete", amount: 1200 },
  { id: "c5", category: "taxas", amount: 600 },
];

describe("calculateProductCost", () => {
  it("soma todos os componentes de custo", () => {
    expect(calculateProductCost(components)).toBe(11000 + 300 + 400 + 1200 + 600);
  });

  it("retorna 0 sem componentes", () => {
    expect(calculateProductCost([])).toBe(0);
  });
});

describe("calculateMargin", () => {
  it("calcula lucro e margem percentual sobre o preço", () => {
    const { profit, marginPercent } = calculateMargin(20000, 13500);
    expect(profit).toBe(6500);
    expect(marginPercent).toBeCloseTo(32.5, 5);
  });

  it("não divide por zero quando o preço é 0", () => {
    expect(calculateMargin(0, 100).marginPercent).toBe(0);
  });
});

describe("calculateCostComposition", () => {
  it("calcula o percentual de cada componente no custo total", () => {
    const composition = calculateCostComposition([
      { id: "a", category: "produto_pod", amount: 75 },
      { id: "b", category: "frete", amount: 25 },
    ]);

    expect(composition.find((c) => c.componentId === "a")?.percent).toBe(75);
    expect(composition.find((c) => c.componentId === "b")?.percent).toBe(25);
  });
});

describe("simulateProduct", () => {
  const base = {
    costComponents: [{ id: "c1", category: "outros_custos", amount: 13500 }],
    price: 20000,
  };

  it("exemplo do spec: custo R$135 + brinde R$8 = custo simulado R$143", () => {
    const result = simulateProduct(base, [
      { kind: "add_component", component: { id: "brinde", category: "outros_custos", amount: 800 } },
    ]);

    expect(result.baseCost).toBe(13500);
    expect(result.simulatedCost).toBe(14300);
  });

  it("NUNCA muta os componentes originais do produto", () => {
    const originalLength = base.costComponents.length;
    simulateProduct(base, [
      { kind: "add_component", component: { id: "brinde", category: "outros_custos", amount: 800 } },
    ]);

    expect(base.costComponents).toHaveLength(originalLength);
    expect(base.costComponents[0].amount).toBe(13500);
  });

  it("recalcula lucro e margem com o novo custo", () => {
    const result = simulateProduct(base, [
      { kind: "add_component", component: { id: "brinde", category: "outros_custos", amount: 800 } },
    ]);

    expect(result.profit).toBe(20000 - 14300);
    expect(result.marginPercent).toBeCloseTo(((20000 - 14300) / 20000) * 100, 5);
  });

  it("aplica desconto reduzindo o preço final, não o custo", () => {
    const result = simulateProduct(base, [{ kind: "discount", amount: 2000 }]);
    expect(result.price).toBe(18000);
    expect(result.simulatedCost).toBe(13500);
  });

  it("permite remover um componente na simulação", () => {
    const twoComponents = {
      costComponents: [
        { id: "a", category: "frete", amount: 1000 },
        { id: "b", category: "taxas", amount: 500 },
      ],
      price: 5000,
    };
    const result = simulateProduct(twoComponents, [{ kind: "remove_component", componentId: "b" }]);
    expect(result.simulatedCost).toBe(1000);
  });
});
