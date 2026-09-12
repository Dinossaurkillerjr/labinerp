"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/common/field";
import { Combobox } from "@/components/common/combobox";
import { CurrencyInput } from "@/components/common/currency-input";
import { CostSummary } from "@/components/catalog/cost-summary";
import { simulateProduct, calculateProductCost, calculateMargin } from "@/lib/catalog/calculations";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import { useFinance } from "@/lib/finance/finance-provider";
import { formatCurrencyCents } from "@/lib/currency";
import type { Product, ProductAdjustment } from "@/lib/catalog/types";

let localCounter = 0;
function tempId() {
  localCounter += 1;
  return `sim-${Date.now()}-${localCounter}`;
}

export function ProductSimulator({ product, onDone }: { product: Product; onDone: () => void }) {
  const { applySimulation } = useCatalog();
  const { categories } = useFinance();
  const costCategories = categories.filter((c) => c.group === "custo");

  const [extraCategory, setExtraCategory] = React.useState(costCategories[0]?.id ?? "outros_custos");
  const [extraAmount, setExtraAmount] = React.useState(0);
  const [addedComponents, setAddedComponents] = React.useState<{ id: string; category: string; amount: number }[]>([]);
  const [priceOverride, setPriceOverride] = React.useState(product.price ?? 0);
  const [discount, setDiscount] = React.useState(0);

  const baseCost = calculateProductCost(product.costComponents);
  const baseMargin = calculateMargin(product.price ?? 0, baseCost);

  const adjustments: ProductAdjustment[] = [
    ...addedComponents.map((c) => ({ kind: "add_component" as const, component: c })),
    { kind: "price_override" as const, price: priceOverride },
    ...(discount > 0 ? [{ kind: "discount" as const, amount: discount }] : []),
  ];

  const result = simulateProduct(product, adjustments);

  function addExtraComponent() {
    if (extraAmount <= 0) {
      toast.error("Informe um valor para o item da simulação.");
      return;
    }
    setAddedComponents((prev) => [...prev, { id: tempId(), category: extraCategory, amount: extraAmount }]);
    setExtraAmount(0);
  }

  function removeExtraComponent(id: string) {
    setAddedComponents((prev) => prev.filter((c) => c.id !== id));
  }

  function handleApply() {
    applySimulation(product.id, [...product.costComponents, ...addedComponents], result.price);
    toast.success("Simulação aplicada ao produto real.");
    onDone();
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div>
        <p className="text-body font-medium text-foreground">Produto real</p>
        <p className="text-caption text-muted-foreground">
          Custo {formatCurrencyCents(baseCost)} · Lucro {formatCurrencyCents(baseMargin.profit)} · Margem{" "}
          {baseMargin.marginPercent.toFixed(1)}%
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
        <p className="text-body font-medium text-foreground">Adicionar item à simulação</p>
        <p className="text-caption text-muted-foreground">Ex: brinde, embalagem especial, custo extra pontual.</p>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Field label="Categoria">
              <Combobox
                options={costCategories.map((c) => ({ value: c.id, label: c.label }))}
                value={extraCategory}
                onValueChange={setExtraCategory}
              />
            </Field>
          </div>
          <div className="w-32">
            <Field label="Valor">
              <CurrencyInput value={extraAmount} onValueChange={setExtraAmount} />
            </Field>
          </div>
          <Button variant="outline" size="icon" onClick={addExtraComponent} type="button" aria-label="Adicionar">
            <Plus className="size-4" />
          </Button>
        </div>

        {addedComponents.length > 0 ? (
          <div className="flex flex-col gap-1 pt-1">
            {addedComponents.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-caption">
                <span className="text-foreground">
                  {costCategories.find((cat) => cat.id === c.category)?.label ?? c.category} — {formatCurrencyCents(c.amount)}
                </span>
                <button onClick={() => removeExtraComponent(c.id)} aria-label="Remover" type="button">
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Novo preço" optional hint="Deixe igual ao real se não for alterar.">
          <CurrencyInput value={priceOverride} onValueChange={setPriceOverride} />
        </Field>
        <Field label="Desconto" optional>
          <CurrencyInput value={discount} onValueChange={setDiscount} />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-body font-medium text-foreground">Resultado simulado</p>
        <CostSummary components={[...product.costComponents, ...addedComponents]} price={result.price} />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-soft-mint/40 p-3">
        <div>
          <p className="text-caption text-muted-foreground">Custo real → simulado</p>
          <p className="text-body font-medium text-foreground">
            {formatCurrencyCents(result.baseCost)} → {formatCurrencyCents(result.simulatedCost)}
          </p>
        </div>
        <Button onClick={handleApply} type="button">
          Aplicar à realidade
        </Button>
      </div>
    </div>
  );
}
