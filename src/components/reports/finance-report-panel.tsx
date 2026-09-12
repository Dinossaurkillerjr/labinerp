"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { BarChart } from "@/components/common/chart-placeholder";
import { EmptyState } from "@/components/common/empty-state";
import { useFinance } from "@/lib/finance/finance-provider";
import { buildFinanceReport } from "@/lib/reports/finance-report";
import type { PeriodRange } from "@/lib/reports/period-range";
import { formatCurrencyCents } from "@/lib/currency";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

export function FinanceReportPanel({ range }: { range: PeriodRange }) {
  const { transactions, categories } = useFinance();
  const report = buildFinanceReport(transactions, categories, range);

  const categoriaColumns: DataTableColumn<(typeof report.despesasPorCategoria)[number]>[] = [
    { key: "label", header: "Categoria", render: (r) => r.label },
    { key: "amount", header: "Total", align: "right", render: (r) => formatCurrencyCents(r.amount) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Receita" value={formatCurrencyCents(report.resultado.receita)} icon={TrendingUp} />
        <StatCard label="Despesas + custos" value={formatCurrencyCents(report.resultado.custoProdutos + report.resultado.despesasOperacionais)} icon={TrendingDown} />
        <StatCard label="Lucro líquido" value={formatCurrencyCents(report.resultado.lucroLiquido)} icon={PiggyBank} />
        <StatCard label="Saldo de caixa" value={formatCurrencyCents(report.cashFlow.saldoFinal)} icon={Wallet} />
      </div>

      <Card>
        <CardHeader><CardTitle>Evolução do lucro</CardTitle></CardHeader>
        <CardContent>
          {report.lucroEvolucao.length > 1 ? (
            <BarChart data={report.lucroEvolucao.map((p) => ({ ...p, value: Math.max(p.value, 0) }))} />
          ) : (
            <p className="text-body text-muted-foreground">Selecione um período maior (trimestre ou ano) para ver a evolução mês a mês.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Despesas por categoria</CardTitle></CardHeader>
          <CardContent>
            <DataTable
              columns={categoriaColumns}
              data={report.despesasPorCategoria.map((r) => ({ ...r, id: r.category }))}
              emptyTitle="Nenhuma despesa no período"
              emptyDescription="As despesas lançadas no Financeiro aparecem aqui por categoria."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Capital do proprietário</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {report.capital.capitalAportado === 0 && report.capital.capitalRetirado === 0 ? (
              <EmptyState className="border-0 py-6" title="Sem aportes ou retiradas no período" />
            ) : (
              <>
                <div className="flex justify-between text-body">
                  <span className="text-muted-foreground">Aportes</span>
                  <span className="text-foreground">{formatCurrencyCents(report.capital.capitalAportado)}</span>
                </div>
                <div className="flex justify-between text-body">
                  <span className="text-muted-foreground">Retiradas</span>
                  <span className="text-foreground">{formatCurrencyCents(report.capital.capitalRetirado)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-body-lg font-medium">
                  <span className="text-foreground">Capital líquido</span>
                  <span className="text-foreground">{formatCurrencyCents(report.capital.capitalLiquido)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
