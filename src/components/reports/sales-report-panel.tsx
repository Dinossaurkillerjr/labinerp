"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Tag, type TagColor } from "@/components/common/tag";
import { useSales } from "@/lib/sales/sales-provider";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { buildSalesReport } from "@/lib/reports/sales-report";
import type { PeriodRange } from "@/lib/reports/period-range";
import { formatCurrencyCents } from "@/lib/currency";
import { ShoppingBag, Receipt, TrendingUp } from "lucide-react";
import type { SalesChannel } from "@/lib/sales/types";

const CHANNEL_LABELS: Record<SalesChannel, string> = {
  nuvemshop: "Nuvemshop",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  outro: "Outro",
};
const CHANNEL_TAG_COLOR: Record<SalesChannel, TagColor> = {
  nuvemshop: "blue",
  instagram: "violet",
  whatsapp: "green",
  outro: "neutral",
};

export function SalesReportPanel({ range }: { range: PeriodRange }) {
  const { sales } = useSales();
  const { products } = useCatalog();
  const { contacts } = useContacts();
  const report = buildSalesReport(sales, products, contacts, range);

  if (report.quantidade === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nenhuma venda neste período"
        description="Ajuste o período ou registre vendas para ver o relatório aqui."
      />
    );
  }

  const canalColumns: DataTableColumn<(typeof report.porCanal)[number]>[] = [
    { key: "canal", header: "Canal", render: (r) => <Tag color={CHANNEL_TAG_COLOR[r.canal]}>{CHANNEL_LABELS[r.canal]}</Tag> },
    { key: "quantidade", header: "Vendas", align: "right", render: (r) => r.quantidade },
    { key: "faturamento", header: "Faturamento", align: "right", render: (r) => formatCurrencyCents(r.faturamento) },
  ];

  const produtoColumns: DataTableColumn<(typeof report.porProduto)[number]>[] = [
    { key: "nome", header: "Produto", render: (r) => r.nome },
    { key: "quantidade", header: "Qtd", align: "right", render: (r) => r.quantidade },
    { key: "faturamento", header: "Faturamento", align: "right", render: (r) => formatCurrencyCents(r.faturamento) },
  ];

  const contatoColumns: DataTableColumn<(typeof report.porContato)[number]>[] = [
    { key: "nome", header: "Contato", render: (r) => r.nome },
    { key: "quantidade", header: "Compras", align: "right", render: (r) => r.quantidade },
    { key: "faturamento", header: "Total", align: "right", render: (r) => formatCurrencyCents(r.faturamento) },
  ];

  const cupomColumns: DataTableColumn<(typeof report.cupons)[number]>[] = [
    { key: "codigo", header: "Cupom", render: (r) => r.codigo },
    { key: "usos", header: "Usos", align: "right", render: (r) => r.usos },
    { key: "faturamento", header: "Faturamento", align: "right", render: (r) => formatCurrencyCents(r.faturamento) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Faturamento" value={formatCurrencyCents(report.faturamento)} icon={TrendingUp} />
        <StatCard label="Quantidade de vendas" value={String(report.quantidade)} icon={ShoppingBag} />
        <StatCard label="Ticket médio" value={formatCurrencyCents(report.ticketMedio)} icon={Receipt} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Por canal</CardTitle></CardHeader>
          <CardContent><DataTable columns={canalColumns} data={report.porCanal.map((r, i) => ({ ...r, id: String(i) }))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Por produto</CardTitle></CardHeader>
          <CardContent><DataTable columns={produtoColumns} data={report.porProduto.map((r) => ({ ...r, id: r.productId }))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Por contato</CardTitle></CardHeader>
          <CardContent>
            <DataTable
              columns={contatoColumns}
              data={report.porContato.map((r) => ({ ...r, id: r.contactId }))}
              emptyTitle="Nenhuma venda com contato vinculado"
              emptyDescription="Vincule um contato às vendas para ver esse recorte."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Uso de cupons</CardTitle></CardHeader>
          <CardContent>
            <DataTable
              columns={cupomColumns}
              data={report.cupons.map((r, i) => ({ ...r, id: String(i) }))}
              emptyTitle="Nenhum cupom usado"
              emptyDescription="Vendas com cupom aparecem aqui."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
