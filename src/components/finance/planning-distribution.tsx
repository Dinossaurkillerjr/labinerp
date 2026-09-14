"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/common/chart-placeholder";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { Tag } from "@/components/common/tag";
import { formatCurrencyCents } from "@/lib/currency";
import { monthBounds } from "@/lib/finance/period";
import { useFinance } from "@/lib/finance/finance-provider";
import { useSettings } from "@/lib/settings/settings-provider";
import { buildCategoryDistribution, type CategoryDistributionRow } from "@/lib/planning/calculations";

/** Seção 4 — como custos/despesas se distribuíram no mês, e quanto cada categoria representa da receita. */
export function PlanningDistribution({ monthId }: { monthId: string }) {
  const { transactions, categories } = useFinance();
  const { settings, updateSettings } = useSettings();

  const range = monthBounds(monthId);
  const tracked = settings.planningTrackedCategoryIds;
  const rows = buildCategoryDistribution(transactions, categories, range, tracked);

  const despesaCategories = categories.filter((c) => c.group === "custo" || c.group === "despesa");

  function toggleTracked(categoryId: string) {
    const next = tracked.includes(categoryId)
      ? tracked.filter((id) => id !== categoryId)
      : [...tracked, categoryId];
    updateSettings({ planningTrackedCategoryIds: next });
  }

  const chartData = rows.slice(0, 8).map((r) => ({ label: r.label, value: r.amount }));

  const columns: DataTableColumn<CategoryDistributionRow & { id: string }>[] = [
    { key: "label", header: "Categoria", render: (r) => r.label },
    { key: "amount", header: "Total", align: "right", render: (r) => formatCurrencyCents(r.amount) },
    { key: "percent", header: "% da receita", align: "right", render: (r) => `${r.percentOfReceita.toFixed(1)}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de custos e despesas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {rows.length > 0 ? <BarChart data={chartData} /> : null}

        <DataTable
          columns={columns}
          data={rows.map((r) => ({ ...r, id: r.categoryId }))}
          emptyTitle="Nenhuma despesa no período"
          emptyDescription="As despesas lançadas no Financeiro aparecem aqui por categoria."
        />

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-caption text-muted-foreground">
            Categorias acompanhadas no Planejamento (nenhuma selecionada = todas)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {despesaCategories.map((c) => (
              <button key={c.id} type="button" onClick={() => toggleTracked(c.id)}>
                <Tag color={tracked.includes(c.id) ? "blue" : "neutral"}>{c.label}</Tag>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
