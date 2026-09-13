"use client";

import { Repeat, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { useFinance } from "@/lib/finance/finance-provider";
import { useUI } from "@/components/providers/ui-provider";
import { TransactionForm } from "@/components/finance/transaction-form";
import { formatCurrencyCents } from "@/lib/currency";
import { PAYMENT_SOURCE_LABELS } from "@/lib/finance/categories";

export function RecurringRulesPanel() {
  const { recurringRules, categories, toggleRecurringRule } = useFinance();
  const { openDrawer, closeDrawer } = useUI();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  function openNewRecurrence() {
    openDrawer({
      title: "Nova recorrência",
      description: "Lançamentos futuros são gerados automaticamente a partir da data de início.",
      content: <TransactionForm onDone={closeDrawer} defaultType="expense" defaultMode="recorrente" />,
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Recorrências</CardTitle>
        <Button size="sm" variant="outline" onClick={openNewRecurrence}>
          <Plus className="size-3.5" />
          Nova recorrência
        </Button>
      </CardHeader>
      <CardContent>
        {recurringRules.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="Nenhuma recorrência cadastrada"
            description="Crie despesas recorrentes como ChatGPT, Nuvemshop ou MEI para gerar lançamentos futuros automaticamente."
          />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {recurringRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-body font-medium text-foreground">{rule.description}</span>
                  <span className="text-caption text-muted-foreground">
                    {categoryMap.get(rule.category)?.label ?? rule.category} · {PAYMENT_SOURCE_LABELS[rule.paymentSource]} · todo dia {rule.dayOfMonth}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-body-lg font-medium text-foreground">{formatCurrencyCents(rule.amount)}</span>
                  <Switch checked={rule.active} onCheckedChange={(checked) => toggleRecurringRule(rule.id, checked)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
