"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/common/chart-placeholder";
import { formatCurrencyCents } from "@/lib/currency";
import {
  calculateCaixa,
  calculateCapital,
  calculateCashFlow,
  calculatePatrimonioLiquidoProxy,
} from "@/lib/finance/calculations";
import { monthBounds } from "@/lib/finance/period";
import { useFinance } from "@/lib/finance/finance-provider";

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-paper-mist p-3">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-body-lg font-medium text-foreground">{value}</span>
      {hint ? <span className="text-caption text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

export function CashflowPanel({ monthId }: { monthId: string }) {
  const { transactions } = useFinance();
  const period = monthBounds(monthId);
  const cashFlow = calculateCashFlow(transactions, period, 0);
  const caixa = calculateCaixa(transactions);
  const capital = calculateCapital(transactions);
  const patrimonio = calculatePatrimonioLiquidoProxy(transactions);

  const chartData = [
    { label: "Saldo inicial", value: Math.max(cashFlow.saldoInicial, 0), color: "var(--color-silver)" },
    { label: "Entradas", value: cashFlow.entradas, color: "var(--color-vivid-green)" },
    { label: "Saídas", value: cashFlow.saidas, color: "var(--color-tangerine)" },
    { label: "Saldo final", value: Math.max(cashFlow.saldoFinal, 0), color: "var(--color-electric-blue)" },
    { label: "Projetado", value: Math.max(cashFlow.caixaProjetado, 0), color: "var(--color-deep-sapphire)" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de caixa do mês</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <BarChart data={chartData} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Row label="Saldo inicial" value={formatCurrencyCents(cashFlow.saldoInicial)} />
            <Row label="Entradas" value={formatCurrencyCents(cashFlow.entradas)} />
            <Row label="Saídas" value={formatCurrencyCents(cashFlow.saidas)} />
            <Row label="Saldo final" value={formatCurrencyCents(cashFlow.saldoFinal)} />
            <Row label="A receber" value={formatCurrencyCents(cashFlow.aReceber)} />
            <Row label="A pagar" value={formatCurrencyCents(cashFlow.aPagar)} />
          </div>
          <Row
            label="Caixa projetado"
            value={formatCurrencyCents(cashFlow.caixaProjetado)}
            hint="Saldo final + a receber − a pagar"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Separações obrigatórias</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Row label="Caixa (realizado)" value={formatCurrencyCents(caixa)} hint="Dinheiro que já entrou e saiu de fato" />
          <Row
            label="Patrimônio (aprox.)"
            value={formatCurrencyCents(patrimonio)}
            hint="Caixa + a receber − a pagar. Estoque e ativos entram em fases futuras."
          />
          <Row
            label="Capital do proprietário"
            value={formatCurrencyCents(capital.capitalLiquido)}
            hint={`Aportado ${formatCurrencyCents(capital.capitalAportado)} · Retirado ${formatCurrencyCents(capital.capitalRetirado)}`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
