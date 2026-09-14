"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FinanceKpis } from "@/components/finance/finance-kpis";
import { ResultadoPanel } from "@/components/finance/resultado-panel";
import { CashflowPanel } from "@/components/finance/cashflow-panel";
import { FinanceComparisonPanel } from "@/components/finance/finance-comparison-panel";
import { PlanningPanel } from "@/components/finance/planning-panel";
import { TransactionsPanel } from "@/components/finance/transactions-panel";
import { RecurringRulesPanel } from "@/components/finance/recurring-rules-panel";
import { MonthClosingPanel } from "@/components/finance/month-closing-panel";
import { TransactionForm } from "@/components/finance/transaction-form";
import { useUI } from "@/components/providers/ui-provider";
import { currentMonthId, formatMonthLabel, recentMonthIds } from "@/lib/finance/period";

export default function FinanceiroPage() {
  const { openDrawer, closeDrawer } = useUI();
  const [monthId, setMonthId] = React.useState(currentMonthId());
  const monthOptions = recentMonthIds(12);

  function openNewTransaction() {
    openDrawer({
      title: "Novo lançamento",
      description: "Tipo → categoria → dados essenciais → salvar.",
      content: <TransactionForm onDone={closeDrawer} />,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financeiro"
        description="Caixa, resultado, patrimônio e capital do proprietário — separados com clareza."
        action={
          <div className="flex items-center gap-2">
            <Select value={monthId} onValueChange={setMonthId}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {monthOptions.map((id) => (
                  <SelectItem key={id} value={id}>{formatMonthLabel(id)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openNewTransaction}>
              <Plus className="size-4" />
              Novo lançamento
            </Button>
          </div>
        }
      />

      <FinanceKpis monthId={monthId} />

      <Tabs defaultValue="transacoes">
        <TabsList>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="resultado">Resultado</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de caixa</TabsTrigger>
          <TabsTrigger value="planejamento">Planejamento</TabsTrigger>
          <TabsTrigger value="recorrencias">Recorrências</TabsTrigger>
          <TabsTrigger value="fechamento">Fechamento mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="transacoes" className="pt-4">
          <TransactionsPanel monthId={monthId} />
        </TabsContent>
        <TabsContent value="resultado" className="pt-4">
          <ResultadoPanel monthId={monthId} />
        </TabsContent>
        <TabsContent value="comparativo" className="pt-4">
          <FinanceComparisonPanel />
        </TabsContent>
        <TabsContent value="fluxo" className="pt-4">
          <CashflowPanel monthId={monthId} />
        </TabsContent>
        <TabsContent value="planejamento" className="pt-4">
          <PlanningPanel monthId={monthId} />
        </TabsContent>
        <TabsContent value="recorrencias" className="pt-4">
          <RecurringRulesPanel />
        </TabsContent>
        <TabsContent value="fechamento" className="pt-4">
          <MonthClosingPanel monthId={monthId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
