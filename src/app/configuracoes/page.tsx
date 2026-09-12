"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/common/page-header";
import { Field } from "@/components/common/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useSettings } from "@/lib/settings/settings-provider";
import { DASHBOARD_WIDGETS } from "@/lib/settings/types";

export default function ConfiguracoesPage() {
  const { settings, updateSettings, toggleWidget } = useSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configurações"
        description="Preferências gerais do ERP."
      />

      <Card>
        <CardHeader>
          <CardTitle>Alertas de negócio</CardTitle>
          <CardDescription>Controla quando um produto é sinalizado com margem baixa.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field label="Margem mínima aceitável" hint="Produtos com margem igual ou abaixo deste percentual aparecem na central de notificações.">
            <div className="flex max-w-40 items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={settings.marginThresholdPercent}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                  updateSettings({ marginThresholdPercent: value });
                  toast.success("Preferência salva.");
                }}
              />
              <span className="text-body text-muted-foreground">%</span>
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Personalize a visão inicial do ERP.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div>
              <p className="text-body font-medium text-foreground">Visão detalhada por padrão</p>
              <p className="text-caption text-muted-foreground">Mostra os cards do Dashboard com mais números logo de início.</p>
            </div>
            <Switch
              checked={settings.dashboardDetailed}
              onCheckedChange={(checked) => updateSettings({ dashboardDetailed: checked })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-body font-medium text-foreground">Widgets visíveis</p>
            {DASHBOARD_WIDGETS.map((widget) => (
              <div key={widget.id} className="flex items-center justify-between rounded-lg bg-paper-mist px-3 py-2">
                <span className="text-body text-foreground">{widget.label}</span>
                <Switch
                  checked={!settings.hiddenDashboardWidgets.includes(widget.id)}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
