"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/common/chart-placeholder";
import { PeriodSelector } from "@/components/common/period-selector";
import { DateInput } from "@/components/common/date-input";
import { formatCurrencyCents } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useFinance } from "@/lib/finance/finance-provider";
import { buildFinanceComparison } from "@/lib/reports/finance-report";
import { resolvePeriodRange, type PeriodPreset } from "@/lib/reports/period-range";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toISODate(date?: Date): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function Variation({ percent, invertColor }: { percent?: number; invertColor?: boolean }) {
  if (percent === undefined) {
    return <span className="text-caption text-muted-foreground">sem período anterior para comparar</span>;
  }
  const isUp = percent >= 0;
  // Para despesas, subir é ruim — a cor de "bom/ruim" inverte, a seta de direção não.
  const good = invertColor ? !isUp : isUp;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-caption font-medium",
        good ? "text-vivid-green" : "text-destructive"
      )}
    >
      {isUp ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
      {Math.abs(Math.round(percent))}% vs. período anterior
    </span>
  );
}

export function FinanceComparisonPanel() {
  const { transactions, categories } = useFinance();
  const [preset, setPreset] = React.useState<PeriodPreset>("mes");
  const [customStart, setCustomStart] = React.useState<Date | undefined>();
  const [customEnd, setCustomEnd] = React.useState<Date | undefined>();

  const today = todayISO();
  const range = resolvePeriodRange(preset, today, {
    start: toISODate(customStart) ?? today,
    end: toISODate(customEnd) ?? today,
  });
  const comparison = buildFinanceComparison(transactions, categories, range);

  const chartData = [
    { label: "Receita (atual)", value: comparison.current.receita, color: "var(--color-vivid-green)" },
    { label: "Despesas (atual)", value: comparison.currentDespesasTotais, color: "var(--color-tangerine)" },
    { label: "Receita (anterior)", value: comparison.previous.receita, color: "var(--color-silver)" },
    { label: "Despesas (anterior)", value: comparison.previousDespesasTotais, color: "var(--color-silver)" },
  ];

  const hasAnyData = chartData.some((d) => d.value > 0);

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <CardTitle>Receitas × despesas</CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector value={preset} onChange={setPreset} includeCustom />
          {preset === "personalizado" ? (
            <>
              <DateInput value={customStart} onValueChange={setCustomStart} placeholder="Início" className="w-36" />
              <DateInput value={customEnd} onValueChange={setCustomEnd} placeholder="Fim" className="w-36" />
            </>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {hasAnyData ? (
          <BarChart data={chartData} />
        ) : (
          <p className="text-body text-muted-foreground">Sem lançamentos no período selecionado.</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-lg bg-paper-mist p-3">
            <span className="text-caption text-muted-foreground">Receita</span>
            <span className="text-body-lg font-medium text-foreground">{formatCurrencyCents(comparison.current.receita)}</span>
            <Variation percent={comparison.receitaVariacaoPercent} />
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-paper-mist p-3">
            <span className="text-caption text-muted-foreground">Despesas</span>
            <span className="text-body-lg font-medium text-foreground">{formatCurrencyCents(comparison.currentDespesasTotais)}</span>
            <Variation percent={comparison.despesasVariacaoPercent} invertColor />
          </div>
          <div className="flex flex-col gap-1 rounded-lg bg-paper-mist p-3">
            <span className="text-caption text-muted-foreground">Lucro líquido</span>
            <span className="text-body-lg font-medium text-foreground">{formatCurrencyCents(comparison.current.lucroLiquido)}</span>
            <Variation percent={comparison.lucroVariacaoPercent} />
          </div>
        </div>
        <p className="text-caption text-muted-foreground">
          Comparado a {comparison.previousRange.start.split("-").reverse().join("/")} – {comparison.previousRange.end.split("-").reverse().join("/")}, mesma duração do período selecionado.
        </p>
      </CardContent>
    </Card>
  );
}
