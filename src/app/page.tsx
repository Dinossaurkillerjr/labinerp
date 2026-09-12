import { Wallet, ShoppingBag, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { BarChart, Sparkline } from "@/components/common/chart-placeholder";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { StatusBadge } from "@/components/common/status-badge";
import { PriorityBadge } from "@/components/common/priority-badge";
import { Tag } from "@/components/common/tag";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  mockKpis,
  mockCashFlow,
  mockSparkline,
  mockRecentSales,
  mockUpcomingPayments,
  mockAlerts,
  type MockSale,
  type MockPayment,
} from "@/lib/mock-data";
import { DashboardTasksStatCard, DashboardPriorityTasksCard } from "@/components/dashboard/dashboard-tasks-summary";

const salesColumns: DataTableColumn<MockSale>[] = [
  { key: "cliente", header: "Cliente", render: (row) => row.cliente },
  {
    key: "canal",
    header: "Canal",
    render: (row) => <Tag color={row.canal === "E-commerce" ? "blue" : row.canal === "Instagram" ? "violet" : "green"}>{row.canal}</Tag>,
  },
  { key: "valor", header: "Valor", align: "right", render: (row) => row.valor },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
  { key: "data", header: "Data", align: "right", render: (row) => row.data },
];

const paymentsColumns: DataTableColumn<MockPayment>[] = [
  { key: "descricao", header: "Descrição", render: (row) => row.descricao },
  { key: "vencimento", header: "Vencimento", render: (row) => row.vencimento },
  { key: "prioridade", header: "Prioridade", render: (row) => <PriorityBadge priority={row.prioridade} /> },
  { key: "valor", header: "Valor", align: "right", render: (row) => row.valor },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-heading text-foreground">Dashboard</h1>
        <p className="text-body text-muted-foreground">
          Visão geral da operação da marca.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Caixa" value={mockKpis.caixa.value} icon={Wallet} trend={mockKpis.caixa.trend} />
        <StatCard label="Vendas" value={mockKpis.vendas.value} icon={ShoppingBag} trend={mockKpis.vendas.trend} />
        <DashboardTasksStatCard />
        <StatCard label="Lucro" value={mockKpis.lucro.value} icon={TrendingUp} trend={mockKpis.lucro.trend} />
        <StatCard label="Despesas" value={mockKpis.despesas.value} icon={TrendingDown} trend={mockKpis.despesas.trend} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fluxo de caixa da semana</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={mockCashFlow} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendência de vendas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Sparkline data={mockSparkline} className="h-16 w-full" />
            <p className="text-caption text-muted-foreground">Últimos 10 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Últimas vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={salesColumns} data={mockRecentSales} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="flex gap-2.5 rounded-lg bg-paper-mist p-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-tangerine" />
                <div>
                  <p className="text-body font-medium text-foreground">{alert.titulo}</p>
                  <p className="text-caption text-muted-foreground">{alert.descricao}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={paymentsColumns} data={mockUpcomingPayments} />
          </CardContent>
        </Card>

        <DashboardPriorityTasksCard />
      </div>
    </div>
  );
}
