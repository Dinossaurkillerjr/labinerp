"use client";

import { Wallet, ShoppingBag, TrendingUp, TrendingDown } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { useFinance } from "@/lib/finance/finance-provider";
import { useSales } from "@/lib/sales/sales-provider";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { useSettings } from "@/lib/settings/settings-provider";
import {
  buildCaixaKpi,
  buildVendasKpi,
  buildLucroKpi,
  buildDespesasKpi,
} from "@/lib/dashboard/calculations";
import type { PeriodRange } from "@/lib/reports/period-range";
import { formatCurrencyCents } from "@/lib/currency";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-caption">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export function CaixaKpiCard({ range }: { range: PeriodRange }) {
  const { transactions } = useFinance();
  const { settings } = useSettings();
  const kpi = buildCaixaKpi(transactions, range);

  return (
    <StatCard
      label="Caixa"
      value={formatCurrencyCents(kpi.saldoAtual)}
      icon={Wallet}
      href="/financeiro"
      footer={
        settings.dashboardDetailed ? (
          <div className="flex flex-col gap-0.5">
            <DetailRow label="Entradas no período" value={formatCurrencyCents(kpi.entradas)} />
            <DetailRow label="Saídas no período" value={formatCurrencyCents(kpi.saidas)} />
          </div>
        ) : undefined
      }
    />
  );
}

export function VendasKpiCard({ range }: { range: PeriodRange }) {
  const { sales } = useSales();
  const { products } = useCatalog();
  const { contacts } = useContacts();
  const { settings } = useSettings();
  const kpi = buildVendasKpi(sales, products, contacts, range);

  return (
    <StatCard
      label="Vendas"
      value={formatCurrencyCents(kpi.faturamento)}
      icon={ShoppingBag}
      href="/vendas"
      trend={kpi.variacaoFaturamentoPercent !== undefined ? Math.round(kpi.variacaoFaturamentoPercent) : undefined}
      footer={
        settings.dashboardDetailed ? (
          <div className="flex flex-col gap-0.5">
            <DetailRow label="Quantidade" value={String(kpi.quantidade)} />
            <DetailRow label="Ticket médio" value={formatCurrencyCents(kpi.ticketMedio)} />
          </div>
        ) : undefined
      }
    />
  );
}

export function LucroKpiCard({ range }: { range: PeriodRange }) {
  const { transactions, categories } = useFinance();
  const { settings } = useSettings();
  const kpi = buildLucroKpi(transactions, categories, range);

  return (
    <StatCard
      label="Lucro"
      value={formatCurrencyCents(kpi.lucroLiquido)}
      icon={TrendingUp}
      href="/financeiro"
      footer={
        settings.dashboardDetailed ? (
          <div className="flex flex-col gap-0.5">
            <DetailRow label="Receita" value={formatCurrencyCents(kpi.receita)} />
            <DetailRow label="Custos + despesas" value={formatCurrencyCents(kpi.custos + kpi.despesas)} />
            <DetailRow label="Margem" value={`${kpi.margemPercent.toFixed(1)}%`} />
          </div>
        ) : undefined
      }
    />
  );
}

export function DespesasKpiCard({ range, todayISO }: { range: PeriodRange; todayISO: string }) {
  const { transactions, categories } = useFinance();
  const { settings } = useSettings();
  const kpi = buildDespesasKpi(transactions, categories, range, todayISO);

  return (
    <StatCard
      label="Despesas"
      value={formatCurrencyCents(kpi.total)}
      icon={TrendingDown}
      href="/financeiro"
      footer={
        settings.dashboardDetailed ? (
          <div className="flex flex-col gap-0.5">
            <DetailRow label="Pendentes" value={formatCurrencyCents(kpi.pendentes)} />
            <DetailRow label="Vencidas" value={formatCurrencyCents(kpi.vencidas)} />
            {kpi.porCategoria[0] ? <DetailRow label="Maior categoria" value={kpi.porCategoria[0].label} /> : null}
          </div>
        ) : undefined
      }
    />
  );
}
