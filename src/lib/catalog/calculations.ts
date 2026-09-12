import type { CostComponent, ProductAdjustment, SimulationResult } from "./types";

export function calculateProductCost(components: CostComponent[]): number {
  return components.reduce((sum, c) => sum + c.amount, 0);
}

export type Margin = { profit: number; marginPercent: number };

/** Margin is relative to price (profit / price), the conventional retail definition. */
export function calculateMargin(price: number, cost: number): Margin {
  const profit = price - cost;
  const marginPercent = price > 0 ? (profit / price) * 100 : 0;
  return { profit, marginPercent };
}

export type CostCompositionItem = {
  componentId: string;
  category: string;
  amount: number;
  /** Share of the total cost, 0-100. */
  percent: number;
};

export function calculateCostComposition(components: CostComponent[]): CostCompositionItem[] {
  const total = calculateProductCost(components);
  return components.map((c) => ({
    componentId: c.id,
    category: c.category,
    amount: c.amount,
    percent: total > 0 ? (c.amount / total) * 100 : 0,
  }));
}

/**
 * Applies a set of adjustments to a product's cost/price WITHOUT mutating the
 * original components or the product itself — the caller decides separately
 * whether to persist the result (see catalog-provider `applySimulation`).
 */
export function simulateProduct(
  base: { costComponents: CostComponent[]; price?: number },
  adjustments: ProductAdjustment[]
): SimulationResult {
  const baseCost = calculateProductCost(base.costComponents);

  let components = [...base.costComponents];
  let price = base.price ?? 0;
  let discountTotal = 0;

  for (const adjustment of adjustments) {
    switch (adjustment.kind) {
      case "add_component":
        components = [...components, adjustment.component];
        break;
      case "remove_component":
        components = components.filter((c) => c.id !== adjustment.componentId);
        break;
      case "price_override":
        price = adjustment.price;
        break;
      case "discount":
        discountTotal += adjustment.amount;
        break;
    }
  }

  const simulatedCost = calculateProductCost(components);
  const finalPrice = Math.max(0, price - discountTotal);
  const { profit, marginPercent } = calculateMargin(finalPrice, simulatedCost);
  const composition = calculateCostComposition(components).map((item) => ({
    componentId: item.componentId,
    category: item.category,
    amount: item.amount,
    percent: item.percent,
  }));

  return {
    baseCost,
    simulatedCost,
    price: finalPrice,
    profit,
    marginPercent,
    composition,
  };
}
