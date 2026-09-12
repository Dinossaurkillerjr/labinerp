"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/common/combobox";
import { CurrencyInput } from "@/components/common/currency-input";
import { useFinance } from "@/lib/finance/finance-provider";
import type { CostComponent } from "@/lib/catalog/types";

let localCounter = 0;
function tempId(): string {
  localCounter += 1;
  return `tmp-${Date.now()}-${localCounter}`;
}

export function CostComponentsEditor({
  components,
  onChange,
}: {
  components: CostComponent[];
  onChange: (components: CostComponent[]) => void;
}) {
  // Reuses the "custo" categories already defined in the Financeiro module
  // (Produto POD, Etiqueta, Embalagem, Frete, Taxas, Outros) instead of a
  // separate vocabulary — see lib/finance/categories.ts.
  const { categories } = useFinance();
  const costCategories = categories.filter((c) => c.group === "custo");

  function updateComponent(id: string, changes: Partial<CostComponent>) {
    onChange(components.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  }

  function removeComponent(id: string) {
    onChange(components.filter((c) => c.id !== id));
  }

  function addComponent() {
    onChange([...components, { id: tempId(), category: costCategories[0]?.id ?? "outros_custos", amount: 0 }]);
  }

  return (
    <div className="flex flex-col gap-2">
      {components.map((component) => (
        <div key={component.id} className="flex items-center gap-2">
          <div className="flex-1">
            <Combobox
              options={costCategories.map((c) => ({ value: c.id, label: c.label }))}
              value={component.category}
              onValueChange={(value) => updateComponent(component.id, { category: value })}
            />
          </div>
          <div className="w-32">
            <CurrencyInput
              value={component.amount}
              onValueChange={(amount) => updateComponent(component.id, { amount })}
            />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Remover componente"
            onClick={() => removeComponent(component.id)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-fit" onClick={addComponent} type="button">
        <Plus className="size-3.5" />
        Adicionar componente de custo
      </Button>
    </div>
  );
}
