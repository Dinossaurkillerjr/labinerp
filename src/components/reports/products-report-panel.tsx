"use client";

import { Package } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { buildProductsReport, type ProductReportRow } from "@/lib/reports/products-report";
import { useSales } from "@/lib/sales/sales-provider";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import type { PeriodRange } from "@/lib/reports/period-range";
import { formatCurrencyCents } from "@/lib/currency";

export function ProductsReportPanel({ range }: { range: PeriodRange }) {
  const { sales } = useSales();
  const { products } = useCatalog();
  const rows = buildProductsReport(sales, products, range);

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum produto vendido neste período"
        description="Assim que houver vendas, o desempenho por produto aparece aqui."
      />
    );
  }

  const columns: DataTableColumn<ProductReportRow>[] = [
    { key: "nome", header: "Produto", render: (r) => r.nome },
    { key: "quantidade", header: "Vendidos", align: "right", render: (r) => r.quantidadeVendida },
    { key: "faturamento", header: "Faturamento", align: "right", render: (r) => formatCurrencyCents(r.faturamento) },
    { key: "custo", header: "Custo", align: "right", render: (r) => formatCurrencyCents(r.custoTotal) },
    {
      key: "lucro",
      header: "Lucro",
      align: "right",
      render: (r) => <span className={r.lucro >= 0 ? "text-vivid-green" : "text-destructive"}>{formatCurrencyCents(r.lucro)}</span>,
    },
    { key: "margem", header: "Margem", align: "right", render: (r) => `${r.margemPercent.toFixed(0)}%` },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows.map((r) => ({ ...r, id: r.productId }))}
    />
  );
}
