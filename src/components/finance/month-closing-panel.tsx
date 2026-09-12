"use client";

import { Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCurrencyCents } from "@/lib/currency";
import { calculateCapital, calculateCashFlow, calculateResultado } from "@/lib/finance/calculations";
import { formatMonthLabel, monthBounds } from "@/lib/finance/period";
import { useFinance } from "@/lib/finance/finance-provider";

function SummaryTile({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-lg bg-paper-mist p-3">
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className={warn ? "text-body-lg font-medium text-tangerine" : "text-body-lg font-medium text-foreground"}>{value}</p>
    </div>
  );
}

export function MonthClosingPanel({ monthId }: { monthId: string }) {
  const { transactions, categories, monthClosings, closeMonth, reopenMonth } = useFinance();
  const period = monthBounds(monthId);
  const resultado = calculateResultado(transactions, period, categories);
  const cashFlow = calculateCashFlow(transactions, period, 0);
  const capital = calculateCapital(transactions, period);

  const closing = monthClosings.find((m) => m.id === monthId);
  const isClosed = closing?.status === "fechado";

  const pendingInMonth = transactions.filter((t) => t.date.slice(0, 7) === monthId && t.status === "pendente");
  const pendingCount = pendingInMonth.length;
  const pendingTotal = pendingInMonth.reduce((sum, t) => sum + t.amount, 0);

  function handleClose() {
    closeMonth(monthId);
    toast.success(`${formatMonthLabel(monthId)} fechado.`);
  }

  function handleReopen() {
    reopenMonth(monthId);
    toast.success(`${formatMonthLabel(monthId)} reaberto para edição.`);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Fechamento — {formatMonthLabel(monthId)}</CardTitle>
        <StatusBadge status={isClosed ? "concluido" : "pendente"} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-body text-muted-foreground">
          Revise o resumo abaixo antes de fechar — depois de fechado, o mês não pode ser alterado sem reabertura explícita.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryTile label="Receita" value={formatCurrencyCents(resultado.receita)} />
          <SummaryTile label="Despesas + custos" value={formatCurrencyCents(resultado.custoProdutos + resultado.despesasOperacionais)} />
          <SummaryTile label="Lucro líquido" value={formatCurrencyCents(resultado.lucroLiquido)} />
          <SummaryTile label="Saldo final de caixa" value={formatCurrencyCents(cashFlow.saldoFinal)} />
          <SummaryTile label="Aportes" value={formatCurrencyCents(capital.capitalAportado)} />
          <SummaryTile label="Retiradas" value={formatCurrencyCents(capital.capitalRetirado)} />
          <SummaryTile label="Contas pendentes" value={String(pendingCount)} warn={pendingCount > 0} />
          <SummaryTile label="Valor pendente" value={formatCurrencyCents(pendingTotal)} warn={pendingCount > 0} />
        </div>

        {pendingCount > 0 && !isClosed ? (
          <p className="text-caption text-tangerine">
            Há {pendingCount} lançamento(s) pendente(s) somando {formatCurrencyCents(pendingTotal)} neste mês. Você ainda pode
            fechar, mas revise antes para não perder de vista o que ainda falta confirmar.
          </p>
        ) : null}

        <div className="flex justify-end">
          {isClosed ? (
            <Button variant="outline" onClick={handleReopen}>
              <LockOpen className="size-4" />
              Reabrir mês
            </Button>
          ) : (
            <Button onClick={handleClose}>
              <Lock className="size-4" />
              Fechar mês
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
