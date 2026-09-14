import { describe, expect, it } from "vitest";
import {
  buildMonthlyHistory,
  calculateUnallocatedProfit,
  buildCategoryDistribution,
  buildCategoryPercentSeries,
  buildCategoryReference,
  buildPlanningInsights,
  buildBudgetProgress,
  RECENT_WINDOW_MONTHS,
} from "./calculations";
import { DEFAULT_CATEGORIES } from "@/lib/finance/categories";
import { makeTransaction } from "@/lib/finance/test-helpers";
import type { ProfitAllocation } from "./types";

describe("buildMonthlyHistory", () => {
  it("monta um snapshot por mês reaproveitando calculateResultado/calculateCapital", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 10000, category: "venda", date: "2026-08-10" }),
      makeTransaction({ type: "expense", amount: 3000, category: "marketing", date: "2026-08-10" }),
      makeTransaction({ type: "income", amount: 20000, category: "venda", date: "2026-09-10" }),
      makeTransaction({ type: "owner_contribution", amount: 5000, category: "aporte", date: "2026-09-05" }),
    ];

    const history = buildMonthlyHistory(transactions, DEFAULT_CATEGORIES, [], ["2026-08", "2026-09"]);
    expect(history).toHaveLength(2);
    expect(history[0].resultado.receita).toBe(10000);
    expect(history[0].resultado.lucroLiquido).toBe(7000);
    expect(history[1].resultado.receita).toBe(20000);
    expect(history[1].capitalAportado).toBe(5000);
    expect(history[1].margemPercent).toBeCloseTo(100, 5); // sem custos em setembro
  });

  it("anexa a destinação de lucro do mês quando existir", () => {
    const allocation: ProfitAllocation = {
      monthId: "2026-09",
      reinvestimento: 1000,
      reserva: 0,
      retirada: 0,
      outro: 0,
      updatedAt: "2026-09-30T00:00:00.000Z",
    };
    const history = buildMonthlyHistory([], DEFAULT_CATEGORIES, [allocation], ["2026-09"]);
    expect(history[0].allocation).toEqual(allocation);
  });

  it("mês sem destinação fica sem o campo allocation", () => {
    const history = buildMonthlyHistory([], DEFAULT_CATEGORIES, [], ["2026-09"]);
    expect(history[0].allocation).toBeUndefined();
  });
});

describe("calculateUnallocatedProfit", () => {
  it("sem destinação, todo o lucro fica não alocado", () => {
    expect(calculateUnallocatedProfit(400000, undefined)).toBe(400000);
  });

  it("subtrai reinvestimento + reserva + retirada + outro do lucro líquido", () => {
    const allocation: ProfitAllocation = {
      monthId: "2026-09",
      reinvestimento: 200000,
      reserva: 100000,
      retirada: 100000,
      outro: 0,
      updatedAt: "2026-09-30T00:00:00.000Z",
    };
    expect(calculateUnallocatedProfit(400000, allocation)).toBe(0);
  });

  it("destinação parcial deixa parte do lucro não alocada", () => {
    const allocation: ProfitAllocation = {
      monthId: "2026-09",
      reinvestimento: 100000,
      reserva: 0,
      retirada: 0,
      outro: 0,
      updatedAt: "2026-09-30T00:00:00.000Z",
    };
    expect(calculateUnallocatedProfit(400000, allocation)).toBe(300000);
  });
});

describe("buildCategoryDistribution", () => {
  const range = { start: "2026-09-01", end: "2026-09-30" };

  it("distribui despesas por categoria e calcula % da receita do período", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 10000, category: "venda", date: "2026-09-05" }),
      makeTransaction({ type: "expense", amount: 1200, category: "marketing", date: "2026-09-05" }),
      makeTransaction({ type: "expense", amount: 300, category: "software", date: "2026-09-10" }),
    ];
    const rows = buildCategoryDistribution(transactions, DEFAULT_CATEGORIES, range);
    expect(rows[0]).toMatchObject({ categoryId: "marketing", amount: 1200, percentOfReceita: 12 });
    expect(rows[1]).toMatchObject({ categoryId: "software", amount: 300, percentOfReceita: 3 });
  });

  it("nunca inclui receita nem capital na distribuição", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 10000, category: "venda", date: "2026-09-05" }),
      makeTransaction({ type: "owner_contribution", amount: 5000, category: "aporte", date: "2026-09-05" }),
    ];
    const rows = buildCategoryDistribution(transactions, DEFAULT_CATEGORIES, range);
    expect(rows).toHaveLength(0);
  });

  it("filtra para as categorias acompanhadas quando informadas", () => {
    const transactions = [
      makeTransaction({ type: "expense", amount: 1200, category: "marketing", date: "2026-09-05" }),
      makeTransaction({ type: "expense", amount: 300, category: "software", date: "2026-09-10" }),
    ];
    const rows = buildCategoryDistribution(transactions, DEFAULT_CATEGORIES, range, ["marketing"]);
    expect(rows).toHaveLength(1);
    expect(rows[0].categoryId).toBe("marketing");
  });

  it("sem receita no período, percentOfReceita é zero (não divide por zero)", () => {
    const transactions = [makeTransaction({ type: "expense", amount: 1200, category: "marketing", date: "2026-09-05" })];
    const rows = buildCategoryDistribution(transactions, DEFAULT_CATEGORIES, range);
    expect(rows[0].percentOfReceita).toBe(0);
  });
});

describe("buildCategoryPercentSeries / buildCategoryReference", () => {
  function makeMonthlyMarketing(monthId: string, amount: number, receita: number) {
    const day = "-10";
    return [
      makeTransaction({ type: "income", amount: receita, category: "venda", date: `${monthId}${day}` }),
      makeTransaction({ type: "expense", amount, category: "marketing", date: `${monthId}${day}` }),
    ];
  }

  it("sem nenhum mês, referência fica indisponível", () => {
    const ref = buildCategoryReference("marketing", "Marketing", []);
    expect(ref.trend).toBe("indisponivel");
    expect(ref.sampleSize).toBe(0);
  });

  it("com um único mês (o atual, sem histórico anterior), referência fica indisponível", () => {
    const transactions = makeMonthlyMarketing("2026-09", 1800, 10000);
    const series = buildCategoryPercentSeries(transactions, DEFAULT_CATEGORIES, "marketing", ["2026-09"]);
    const ref = buildCategoryReference("marketing", "Marketing", series);
    expect(ref.trend).toBe("indisponivel");
    expect(ref.currentPercent).toBe(18);
    expect(ref.historicalAveragePercent).toBeUndefined();
  });

  it("com histórico suficiente, calcula média, mediana, mín, máx e tendência de alta", () => {
    const transactions = [
      ...makeMonthlyMarketing("2026-05", 1000, 10000), // 10%
      ...makeMonthlyMarketing("2026-06", 1200, 10000), // 12%
      ...makeMonthlyMarketing("2026-07", 1300, 10000), // 13%
      ...makeMonthlyMarketing("2026-08", 1400, 10000), // 14%
      ...makeMonthlyMarketing("2026-09", 3000, 10000), // 30% — bem acima da média histórica
    ];
    const monthIds = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];
    const series = buildCategoryPercentSeries(transactions, DEFAULT_CATEGORIES, "marketing", monthIds);
    const ref = buildCategoryReference("marketing", "Marketing", series);

    expect(ref.sampleSize).toBe(4);
    expect(ref.currentPercent).toBe(30);
    expect(ref.historicalAveragePercent).toBeCloseTo(12.25, 5);
    expect(ref.min).toBeCloseTo(10, 5);
    expect(ref.max).toBeCloseTo(14, 5);
    expect(ref.trend).toBe("alta");
    expect(ref.recentAveragePercent).toBeCloseTo((12 + 13 + 14) / 3, 5); // últimos 3 meses anteriores ao atual
  });

  it("sem RECENT_WINDOW_MONTHS meses anteriores, recentAveragePercent fica indefinido", () => {
    const transactions = [...makeMonthlyMarketing("2026-08", 1000, 10000), ...makeMonthlyMarketing("2026-09", 1000, 10000)];
    const series = buildCategoryPercentSeries(transactions, DEFAULT_CATEGORIES, "marketing", ["2026-08", "2026-09"]);
    const ref = buildCategoryReference("marketing", "Marketing", series);
    expect(ref.sampleSize).toBeLessThan(RECENT_WINDOW_MONTHS);
    expect(ref.recentAveragePercent).toBeUndefined();
  });

  it("gasto estável perto da média histórica não gera tendência de alta/queda", () => {
    const transactions = [
      ...makeMonthlyMarketing("2026-06", 1000, 10000),
      ...makeMonthlyMarketing("2026-07", 1000, 10000),
      ...makeMonthlyMarketing("2026-08", 1000, 10000),
      ...makeMonthlyMarketing("2026-09", 1020, 10000), // variação pequena
    ];
    const monthIds = ["2026-06", "2026-07", "2026-08", "2026-09"];
    const series = buildCategoryPercentSeries(transactions, DEFAULT_CATEGORIES, "marketing", monthIds);
    const ref = buildCategoryReference("marketing", "Marketing", series);
    expect(ref.trend).toBe("estavel");
  });
});

describe("buildPlanningInsights", () => {
  it("sem dados suficientes (referências indisponíveis e histórico curto de margem), não gera nenhuma observação", () => {
    const insights = buildPlanningInsights({
      categoryReferences: [{ categoryId: "marketing", label: "Marketing", currentPercent: 10, currentAmount: 1000, trend: "indisponivel", sampleSize: 0 }],
      marginHistory: [{ monthId: "2026-09", margemPercent: 20 }],
    });
    expect(insights).toEqual([]);
  });

  it("categoria em alta gera uma observação descritiva (não prescritiva)", () => {
    const insights = buildPlanningInsights({
      categoryReferences: [
        {
          categoryId: "marketing",
          label: "Marketing",
          currentPercent: 30,
          currentAmount: 3000,
          historicalAveragePercent: 12,
          trend: "alta",
          sampleSize: 4,
        },
      ],
      marginHistory: [{ monthId: "2026-09", margemPercent: 20 }],
    });
    expect(insights).toContainEqual({ id: "categoria-alta-marketing", message: "Seu gasto com Marketing está acima da sua média histórica." });
    expect(insights.every((i) => !i.message.toLowerCase().includes("deveria"))).toBe(true);
  });

  it("margem do mês bem acima da média dos últimos meses gera observação", () => {
    const insights = buildPlanningInsights({
      categoryReferences: [],
      marginHistory: [
        { monthId: "2026-06", margemPercent: 20 },
        { monthId: "2026-07", margemPercent: 22 },
        { monthId: "2026-08", margemPercent: 21 },
        { monthId: "2026-09", margemPercent: 40 },
      ],
    });
    expect(insights.some((i) => i.id === "margem-acima-media")).toBe(true);
  });

  it("histórico de margem curto demais não gera observação sobre margem", () => {
    const insights = buildPlanningInsights({
      categoryReferences: [],
      marginHistory: [
        { monthId: "2026-08", margemPercent: 20 },
        { monthId: "2026-09", margemPercent: 40 },
      ],
    });
    expect(insights.some((i) => i.id.startsWith("margem-"))).toBe(false);
  });
});

describe("buildBudgetProgress", () => {
  const categories = DEFAULT_CATEGORIES;

  it("resolve meta em valor fixo contra o realizado", () => {
    const progress = buildBudgetProgress(
      [{ categoryId: "marketing", kind: "valor", value: 150000 }],
      [{ categoryId: "marketing", label: "Marketing", amount: 120000, percentOfReceita: 12 }],
      categories,
      1000000
    );
    expect(progress[0]).toMatchObject({ plannedAmount: 150000, realizedAmount: 120000, differenceAmount: 30000 });
  });

  it("resolve meta percentual da receita contra o realizado", () => {
    const progress = buildBudgetProgress(
      [{ categoryId: "marketing", kind: "percentual", value: 15 }],
      [{ categoryId: "marketing", label: "Marketing", amount: 200000, percentOfReceita: 20 }],
      categories,
      1000000 // 15% de 1.000.000 = 150.000
    );
    expect(progress[0]).toMatchObject({ plannedAmount: 150000, realizedAmount: 200000, differenceAmount: -50000 });
  });

  it("categoria sem gasto realizado no período conta como zero, não como ausente", () => {
    const progress = buildBudgetProgress([{ categoryId: "marketing", kind: "valor", value: 150000 }], [], categories, 1000000);
    expect(progress[0].realizedAmount).toBe(0);
  });
});
