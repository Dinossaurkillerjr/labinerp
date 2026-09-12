import { describe, expect, it } from "vitest";
import { buildFinanceReport } from "./finance-report";
import { DEFAULT_CATEGORIES } from "@/lib/finance/categories";
import { makeTransaction } from "@/lib/finance/test-helpers";

describe("buildFinanceReport", () => {
  it("reaproveita exatamente os cálculos do Financeiro (resultado, fluxo, capital)", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 10000, category: "venda", date: "2026-09-05", status: "concluido" }),
      makeTransaction({ type: "expense", amount: 3000, category: "produto_pod", date: "2026-09-05", status: "concluido" }),
      makeTransaction({ type: "owner_contribution", amount: 5000, category: "aporte", date: "2026-09-05", status: "concluido" }),
    ];
    const range = { start: "2026-09-01", end: "2026-09-30", label: "" };
    const report = buildFinanceReport(transactions, DEFAULT_CATEGORIES, range);

    expect(report.resultado.receita).toBe(10000);
    expect(report.resultado.lucroLiquido).toBe(7000); // aporte não entra
    expect(report.capital.capitalAportado).toBe(5000);
    expect(report.cashFlow.entradas).toBe(15000); // receita + aporte, realizados
  });

  it("agrupa despesas por categoria dentro do período", () => {
    const transactions = [
      makeTransaction({ type: "expense", amount: 1000, category: "marketing", date: "2026-09-05" }),
      makeTransaction({ type: "expense", amount: 500, category: "marketing", date: "2026-09-10" }),
      makeTransaction({ type: "expense", amount: 300, category: "software", date: "2026-09-15" }),
    ];
    const range = { start: "2026-09-01", end: "2026-09-30", label: "" };
    const report = buildFinanceReport(transactions, DEFAULT_CATEGORIES, range);
    expect(report.despesasPorCategoria[0]).toMatchObject({ category: "marketing", amount: 1500 });
  });

  it("calcula a evolução de lucro mês a mês dentro do período", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 10000, category: "venda", date: "2026-07-10" }),
      makeTransaction({ type: "income", amount: 20000, category: "venda", date: "2026-09-10" }),
    ];
    const range = { start: "2026-07-01", end: "2026-09-30", label: "" };
    const report = buildFinanceReport(transactions, DEFAULT_CATEGORIES, range);
    expect(report.lucroEvolucao).toHaveLength(3);
    expect(report.lucroEvolucao[0].value).toBe(10000);
    expect(report.lucroEvolucao[2].value).toBe(20000);
  });
});
