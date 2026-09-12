"use client";

import * as React from "react";
import { PeriodSelector } from "@/components/common/period-selector";
import { Switch } from "@/components/ui/switch";
import { resolvePeriodRange, type PeriodPreset } from "@/lib/reports/period-range";
import { useSettings } from "@/lib/settings/settings-provider";
import { DASHBOARD_WIDGETS } from "@/lib/settings/types";
import {
  CaixaKpiCard,
  VendasKpiCard,
  LucroKpiCard,
  DespesasKpiCard,
} from "@/components/dashboard/dashboard-kpis";
import { DashboardTasksStatCard, DashboardPriorityTasksCard } from "@/components/dashboard/dashboard-tasks-summary";
import {
  WeeklyCashFlowCard,
  SalesTrendCard,
  RecentSalesCard,
  UpcomingPaymentsCard,
  AlertsCard,
} from "@/components/dashboard/dashboard-widgets";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const { settings, updateSettings } = useSettings();
  const [preset, setPreset] = React.useState<PeriodPreset>("mes");
  const today = todayISO();
  const range = resolvePeriodRange(preset, today);

  const isHidden = (id: string) => settings.hiddenDashboardWidgets.includes(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-heading text-foreground">Dashboard</h1>
          <p className="text-body text-muted-foreground">
            Visão geral da operação da marca — {range.label.toLowerCase()}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-caption text-muted-foreground">
            Detalhado
            <Switch
              checked={settings.dashboardDetailed}
              onCheckedChange={(checked) => updateSettings({ dashboardDetailed: checked })}
            />
          </label>
          <PeriodSelector value={preset} onChange={setPreset} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <CaixaKpiCard range={range} />
        <VendasKpiCard range={range} />
        <DashboardTasksStatCard todayISO={today} />
        <LucroKpiCard range={range} />
        <DespesasKpiCard range={range} todayISO={today} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {!isHidden("fluxo-caixa") ? <WeeklyCashFlowCard todayISO={today} /> : null}
        {!isHidden("tendencia-vendas") ? <SalesTrendCard todayISO={today} /> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {!isHidden("ultimas-vendas") ? <RecentSalesCard /> : null}
        {!isHidden("alertas") ? <AlertsCard todayISO={today} /> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!isHidden("proximos-pagamentos") ? <UpcomingPaymentsCard /> : null}
        {!isHidden("tarefas-prioritarias") ? <DashboardPriorityTasksCard /> : null}
      </div>

      {DASHBOARD_WIDGETS.every((w) => isHidden(w.id)) ? (
        <p className="text-center text-body text-muted-foreground">
          Todos os widgets estão ocultos. Reative-os em Configurações.
        </p>
      ) : null}
    </div>
  );
}
