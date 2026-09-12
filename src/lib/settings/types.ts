// App-wide, single-user preferences — small and flat on purpose.

export type Settings = {
  /** Products at or below this margin trigger a "Margem baixa" notification. */
  marginThresholdPercent: number;
  /** Dashboard view density. */
  dashboardDetailed: boolean;
  /** Ids of dashboard widgets the user chose to hide. */
  hiddenDashboardWidgets: string[];
};

export const DEFAULT_SETTINGS: Settings = {
  marginThresholdPercent: 15,
  dashboardDetailed: false,
  hiddenDashboardWidgets: [],
};

export const DASHBOARD_WIDGETS = [
  { id: "fluxo-caixa", label: "Fluxo de caixa da semana" },
  { id: "tendencia-vendas", label: "Tendência de vendas" },
  { id: "ultimas-vendas", label: "Últimas vendas" },
  { id: "alertas", label: "Alertas" },
  { id: "proximos-pagamentos", label: "Próximos pagamentos" },
  { id: "tarefas-prioritarias", label: "Tarefas prioritárias" },
] as const;
