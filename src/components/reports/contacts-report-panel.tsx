"use client";

import { Users } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { useSales } from "@/lib/sales/sales-provider";
import { buildContactsReport } from "@/lib/reports/contacts-report";
import type { PeriodRange } from "@/lib/reports/period-range";
import { formatCurrencyCents } from "@/lib/currency";

export function ContactsReportPanel({ range }: { range: PeriodRange }) {
  const { contacts } = useContacts();
  const { sales } = useSales();
  const report = buildContactsReport(contacts, sales, range);

  const columns: DataTableColumn<(typeof report.topContacts)[number]>[] = [
    { key: "nome", header: "Contato", render: (r) => r.nome },
    { key: "compras", header: "Compras", align: "right", render: (r) => r.quantidadeCompras },
    { key: "total", header: "Total comprado", align: "right", render: (r) => formatCurrencyCents(r.totalComprado) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Novos no período" value={String(report.novos)} icon={Users} />
        <StatCard label="Clientes" value={String(report.clientes)} icon={Users} />
        <StatCard label="Recorrentes" value={String(report.recorrentes)} icon={Users} />
        <StatCard label="Inativos" value={String(report.inativos)} icon={Users} />
      </div>

      {report.topContacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhuma compra vinculada a contato neste período"
          description="Vincule um contato às vendas para ver o histórico de compras aqui."
        />
      ) : (
        <DataTable columns={columns} data={report.topContacts.map((r) => ({ ...r, id: r.contactId }))} />
      )}
    </div>
  );
}
