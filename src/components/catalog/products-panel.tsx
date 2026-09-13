"use client";

import * as React from "react";
import { toast } from "sonner";
import { MoreHorizontal, Plus, FlaskConical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { StatusBadge, type Status } from "@/components/common/status-badge";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import { useUI } from "@/components/providers/ui-provider";
import { ProductForm } from "@/components/catalog/product-form";
import { ProductSimulator } from "@/components/catalog/product-simulator";
import { calculateMargin, calculateProductCost } from "@/lib/catalog/calculations";
import { formatCurrencyCents } from "@/lib/currency";
import type { Product, ProductStatus } from "@/lib/catalog/types";

const STATUS_MAP: Record<ProductStatus, Status> = {
  ativo: "concluido",
  rascunho: "rascunho",
  arquivado: "cancelado",
};

export function ProductsPanel() {
  const { products, deleteProduct } = useCatalog();
  const { openDrawer, closeDrawer, confirm } = useUI();
  const [search, setSearch] = React.useState("");

  const filtered = products.filter((p) =>
    search.trim() ? p.name.toLowerCase().includes(search.trim().toLowerCase()) : true
  );

  function openCreate() {
    openDrawer({
      title: "Novo produto",
      description: "Comece com o essencial — você pode detalhar depois.",
      content: <ProductForm onDone={closeDrawer} />,
    });
  }

  function openEdit(product: Product) {
    openDrawer({
      title: "Editar produto",
      content: <ProductForm product={product} onDone={closeDrawer} />,
    });
  }

  function openSimulate(product: Product) {
    openDrawer({
      title: `Simular — ${product.name}`,
      description: "A simulação nunca altera o produto real, a menos que você aplique.",
      widthClassName: "sm:max-w-lg",
      content: <ProductSimulator product={product} onDone={closeDrawer} />,
    });
  }

  function handleDelete(product: Product) {
    confirm({
      title: "Excluir produto?",
      description: `"${product.name}" será removido do catálogo. Vendas já registradas não são afetadas.`,
      onConfirm: () => {
        deleteProduct(product.id);
        toast.success("Produto excluído.");
      },
    });
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      header: "Produto",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          {row.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- external, arbitrary URL
            <img
              src={row.image}
              alt=""
              className="size-8 shrink-0 rounded-md border border-border object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <span className="text-foreground">{row.name}</span>
        </div>
      ),
    },
    {
      key: "cost",
      header: "Custo",
      align: "right",
      render: (row) => formatCurrencyCents(calculateProductCost(row.costComponents)),
    },
    {
      key: "price",
      header: "Preço",
      align: "right",
      render: (row) => (row.price ? formatCurrencyCents(row.price) : "—"),
    },
    {
      key: "margin",
      header: "Margem",
      align: "right",
      render: (row) => {
        const cost = calculateProductCost(row.costComponents);
        const { marginPercent } = calculateMargin(row.price ?? 0, cost);
        return row.price ? `${marginPercent.toFixed(0)}%` : "—";
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={STATUS_MAP[row.status]} />,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Ações">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => openEdit(row)}>Editar</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => openSimulate(row)}>
              <FlaskConical /> Simular
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(row)}>
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto..." className="pl-8" />
        </div>
        <Button className="ml-auto" onClick={openCreate}>
          <Plus className="size-4" />
          Novo produto
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyTitle="Nenhum produto cadastrado"
        emptyDescription="Crie seu primeiro produto — você pode começar só com o nome."
        emptyAction={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Adicionar produto
          </Button>
        }
      />
    </div>
  );
}
