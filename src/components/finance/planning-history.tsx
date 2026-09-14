"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { formatCurrencyCents } from "@/lib/currency";
import { monthIdsUpTo } from "@/lib/finance/period";
import { useFinance } from "@/lib/finance/finance-provider";
import { usePlanning } from "@/lib/planning/planning-provider";
import { buildMonthlyHistory, type MonthlySnapshot } from "@/lib/planning/calculations";

const HISTORY_MONTHS = 6;

/** Seção 3 — para cada mês: receita, custos, despesas, lucro, margem, aportes, retiradas e destinação. */
export function PlanningHistory({ monthId }: { monthId: string }) {
  const { transactions, categories } = useFinance();
  const { allocations } = usePlanning();

  const monthIds = monthIdsUpTo(monthId, HISTORY_MONTHS);
  const history = [...buildMonthlyHistory(transactions, categories, allocations, monthIds)].reverse();

  const columns: DataTableColumn<MonthlySnapshot & { id: string }>[] = [
    { key: "month", header: "Mês", render: (r) => r.label },
    { key: "receita", header: "Receita", align: "right", render: (r) => formatCurrencyCents(r.resultado.receita) },
    { key: "custos", header: "Custos", align: "right", render: (r) => formatCurrencyCents(r.resultado.custoProdutos) },
    { key: "despesas", header: "Despesas", align: "right", render: (r) => formatCurrencyCents(r.resultado.despesasOperacionais) },
    { key: "lucro", header: "Lucro", align: "right", render: (r) => formatCurrencyCents(r.resultado.lucroLiquido) },
    {
      key: "margem",
      header: "Margem",
      align: "right",
      render: (r) => (r.resultado.receita > 0 ? `${r.margemPercent.toFixed(0)}%` : "—"),
    },
    { key: "aportes", header: "Aportes", align: "right", render: (r) => formatCurrencyCents(r.capitalAportado) },
    { key: "retiradas", header: "Retiradas", align: "right", render: (r) => formatCurrencyCents(r.capitalRetirado) },
    {
      key: "destinacao",
      header: "Destinação",
      align: "right",
      render: (r) =>
        r.allocation
          ? formatCurrencyCents(r.allocation.reinvestimento + r.allocation.reserva + r.allocation.retirada + r.allocation.outro)
          : "—",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico mensal</CardTitle>
        <CardDescription>Últimos {HISTORY_MONTHS} meses, o mais recente primeiro — compare as colunas entre as linhas.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={history.map((h) => ({ ...h, id: h.monthId }))}
          emptyTitle="Sem histórico ainda"
          emptyDescription="O histórico mensal aparece aqui conforme os meses passam."
        />
      </CardContent>
    </Card>
  );
}
