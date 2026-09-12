import { describe, expect, it } from "vitest";
import {
  calculateCaixa,
  calculateCapital,
  calculateCashFlow,
  calculateResultado,
  splitAmountIntoInstallments,
  addMonthsToISODate,
  sumByCategory,
} from "./calculations";
import { makeTransaction } from "./test-helpers";

describe("calculateCaixa", () => {
  it("soma receitas e aportes, subtrai despesas e retiradas, apenas realizados", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 1000, status: "concluido" }),
      makeTransaction({ type: "expense", amount: 300, status: "concluido" }),
      makeTransaction({ type: "owner_contribution", amount: 500, status: "concluido" }),
      makeTransaction({ type: "owner_withdrawal", amount: 200, status: "concluido" }),
      // pendente não deve contar
      makeTransaction({ type: "income", amount: 9999, status: "pendente" }),
    ];

    expect(calculateCaixa(transactions)).toBe(1000 - 300 + 500 - 200);
  });

  it("contas futuras (pendentes) não alteram o caixa realizado", () => {
    const transactions = [
      makeTransaction({ type: "expense", amount: 500, status: "pendente" }),
      makeTransaction({ type: "income", amount: 500, status: "pendente" }),
    ];

    expect(calculateCaixa(transactions)).toBe(0);
  });
});

describe("calculateResultado", () => {
  it("calcula lucro bruto e líquido corretamente", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 10000, category: "venda" }),
      makeTransaction({ type: "expense", amount: 3000, category: "produto_pod" }), // custo
      makeTransaction({ type: "expense", amount: 1000, category: "marketing" }), // despesa
    ];

    const resultado = calculateResultado(transactions);

    expect(resultado.receita).toBe(10000);
    expect(resultado.custoProdutos).toBe(3000);
    expect(resultado.lucroBruto).toBe(7000);
    expect(resultado.despesasOperacionais).toBe(1000);
    expect(resultado.lucroLiquido).toBe(6000);
  });

  it("aporte e retirada não contaminam o lucro", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 10000, category: "venda" }),
      makeTransaction({ type: "owner_contribution", amount: 5000, category: "aporte" }),
      makeTransaction({ type: "owner_withdrawal", amount: 2000, category: "retirada" }),
    ];

    const resultado = calculateResultado(transactions);

    expect(resultado.receita).toBe(10000);
    expect(resultado.lucroLiquido).toBe(10000);
  });

  it("ignora transações canceladas", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 10000, category: "venda", status: "cancelado" }),
    ];

    const resultado = calculateResultado(transactions);
    expect(resultado.receita).toBe(0);
  });
});

describe("calculateCapital", () => {
  it("separa capital aportado de capital retirado", () => {
    const transactions = [
      makeTransaction({ type: "owner_contribution", amount: 5000, status: "concluido" }),
      makeTransaction({ type: "owner_withdrawal", amount: 2000, status: "concluido" }),
      makeTransaction({ type: "owner_contribution", amount: 1000, status: "pendente" }), // não conta
    ];

    const capital = calculateCapital(transactions);

    expect(capital.capitalAportado).toBe(5000);
    expect(capital.capitalRetirado).toBe(2000);
    expect(capital.capitalLiquido).toBe(3000);
  });
});

describe("calculateCashFlow", () => {
  it("saldo inicial + entradas - saídas = saldo final", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 2000, status: "concluido", date: "2026-01-05" }),
      makeTransaction({ type: "expense", amount: 500, status: "concluido", date: "2026-01-06" }),
    ];

    const cashFlow = calculateCashFlow(
      transactions,
      { start: "2026-01-01", end: "2026-01-31" },
      1000
    );

    expect(cashFlow.entradas).toBe(2000);
    expect(cashFlow.saidas).toBe(500);
    expect(cashFlow.saldoFinal).toBe(1000 + 2000 - 500);
  });

  it("separa a pagar / a receber pendentes e calcula caixa projetado", () => {
    const transactions = [
      makeTransaction({ type: "income", amount: 1000, status: "pendente", date: "2026-01-15" }),
      makeTransaction({ type: "expense", amount: 400, status: "pendente", date: "2026-01-20" }),
    ];

    const cashFlow = calculateCashFlow(
      transactions,
      { start: "2026-01-01", end: "2026-01-31" },
      0
    );

    expect(cashFlow.saldoFinal).toBe(0);
    expect(cashFlow.aReceber).toBe(1000);
    expect(cashFlow.aPagar).toBe(400);
    expect(cashFlow.caixaProjetado).toBe(0 + 1000 - 400);
  });
});

describe("splitAmountIntoInstallments", () => {
  it("divide R$ 600 em 3x de R$ 200 exatos", () => {
    expect(splitAmountIntoInstallments(60000, 3)).toEqual([20000, 20000, 20000]);
  });

  it("distribui o resto sem perder centavos", () => {
    const parts = splitAmountIntoInstallments(1000, 3); // 333.33... each
    expect(parts).toEqual([334, 333, 333]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000);
  });
});

describe("addMonthsToISODate", () => {
  it("avança meses mantendo o dia", () => {
    expect(addMonthsToISODate("2026-09-15", 1)).toBe("2026-10-15");
    expect(addMonthsToISODate("2026-09-15", 2)).toBe("2026-11-15");
  });

  it("lida com virada de ano", () => {
    expect(addMonthsToISODate("2026-12-01", 2)).toBe("2027-02-01");
  });
});

describe("sumByCategory", () => {
  it("agrupa valores por categoria ignorando cancelados", () => {
    const transactions = [
      makeTransaction({ category: "marketing", amount: 100, status: "concluido" }),
      makeTransaction({ category: "marketing", amount: 50, status: "pendente" }),
      makeTransaction({ category: "software", amount: 30, status: "cancelado" }),
    ];

    expect(sumByCategory(transactions)).toEqual({ marketing: 150 });
  });
});
