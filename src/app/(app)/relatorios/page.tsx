"use client";

import * as React from "react";
import { PageHeader } from "@/components/common/page-header";
import { PeriodSelector } from "@/components/common/period-selector";
import { DateInput } from "@/components/common/date-input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { resolvePeriodRange, type PeriodPreset } from "@/lib/reports/period-range";
import { SalesReportPanel } from "@/components/reports/sales-report-panel";
import { ProductsReportPanel } from "@/components/reports/products-report-panel";
import { FinanceReportPanel } from "@/components/reports/finance-report-panel";
import { ContactsReportPanel } from "@/components/reports/contacts-report-panel";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toISODate(date?: Date): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function RelatoriosPage() {
  const [preset, setPreset] = React.useState<PeriodPreset>("mes");
  const [customStart, setCustomStart] = React.useState<Date | undefined>();
  const [customEnd, setCustomEnd] = React.useState<Date | undefined>();

  const today = todayISO();
  const range = resolvePeriodRange(preset, today, {
    start: toISODate(customStart) ?? today,
    end: toISODate(customEnd) ?? today,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Relatórios"
        description="Visões objetivas de vendas, produtos, financeiro e contatos — sem BI empresarial."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodSelector value={preset} onChange={setPreset} includeCustom />
            {preset === "personalizado" ? (
              <>
                <DateInput value={customStart} onValueChange={setCustomStart} placeholder="Início" className="w-40" />
                <DateInput value={customEnd} onValueChange={setCustomEnd} placeholder="Fim" className="w-40" />
              </>
            ) : null}
          </div>
        }
      />

      <Tabs defaultValue="vendas">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="pt-4">
          <SalesReportPanel range={range} />
        </TabsContent>
        <TabsContent value="produtos" className="pt-4">
          <ProductsReportPanel range={range} />
        </TabsContent>
        <TabsContent value="financeiro" className="pt-4">
          <FinanceReportPanel range={range} />
        </TabsContent>
        <TabsContent value="contatos" className="pt-4">
          <ContactsReportPanel range={range} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
