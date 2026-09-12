"use client";

import { Lock, LockOpen } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { formatCurrencyCents } from "@/lib/currency";
import { calculateCashFlow, calculateResultado } from "@/lib/finance/calculations";
import { formatMonthLabel, monthBounds } from "@/lib/finance/period";
import { useFinance } from "@/lib/finance/finance-provider";

export function MonthClosingPanel({ monthId }: { monthId: string }) {
  const { transactions, categories, monthClosings, closeMonth, reopenMonth } = useFinance();
  const period = monthBounds(monthId);
  const resultado = calculateResultado(transactions, period, categories);
  const cashFlow = calculateCashFlow(transactions, period, 0);

  const closing = monthClosings.find((m) => m.id === monthId);
  const isClosed = closing?.status === "fechado";

  const pendingCount = transactions.filter(
    (t) => t.date.slice(0, 7) === monthId && t.status === "pendente"
  ).length;

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-paper-mist p-3">
            <p className="text-caption text-muted-foreground">Receita</p>
            <p className="text-body-lg font-medium text-foreground">{formatCurrencyCents(resultado.receita)}</p>
          </div>
          <div className="rounded-lg bg-paper-mist p-3">
            <p className="text-caption text-muted-foreground">Lucro líquido</p>
            <p className="text-body-lg font-medium text-foreground">{formatCurrencyCents(resultado.lucroLiquido)}</p>
          </div>
          <div className="rounded-lg bg-paper-mist p-3">
            <p className="text-caption text-muted-foreground">Saldo final de caixa</p>
            <p className="text-body-lg font-medium text-foreground">{formatCurrencyCents(cashFlow.saldoFinal)}</p>
          </div>
          <div className="rounded-lg bg-paper-mist p-3">
            <p className="text-caption text-muted-foreground">Pendências no mês</p>
            <p className="text-body-lg font-medium text-foreground">{pendingCount}</p>
          </div>
        </div>

        {pendingCount > 0 && !isClosed ? (
          <p className="text-caption text-tangerine">
            Há {pendingCount} lançamento(s) pendente(s) neste mês. Você ainda pode fechar, mas revise antes.
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
