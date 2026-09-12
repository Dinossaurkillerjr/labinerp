"use client";

import { Plus, ShoppingBag, Package, Users, CheckSquare, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUI } from "@/components/providers/ui-provider";
import { Field } from "@/components/common/field";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/common/currency-input";
import { DrawerForm, DrawerFormActions } from "@/components/common/drawer-form";
import { toast } from "sonner";
import * as React from "react";

const QUICK_ACTIONS = [
  { key: "venda", label: "Nova venda", icon: ShoppingBag },
  { key: "produto", label: "Novo produto", icon: Package },
  { key: "contato", label: "Novo contato", icon: Users },
  { key: "tarefa", label: "Nova tarefa", icon: CheckSquare },
  { key: "nota", label: "Nova nota no canvas", icon: PenTool },
] as const;

function QuickCreateForm({ label, onDone }: { label: string; onDone: () => void }) {
  const [nome, setNome] = React.useState("");
  const [valor, setValor] = React.useState(0);

  return (
    <>
      <DrawerForm>
        <Field label="Nome">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={`Nome ${label.toLowerCase()}`}
          />
        </Field>
        <Field label="Valor" hint="Pode ser ajustado depois.">
          <CurrencyInput value={valor} onValueChange={setValor} />
        </Field>
      </DrawerForm>
      <DrawerFormActions
        onCancel={onDone}
        onSubmit={() => {
          toast.success(`${label} criado(a) com sucesso.`);
          onDone();
        }}
      />
    </>
  );
}

export function QuickActionButton() {
  const { openDrawer, closeDrawer } = useUI();

  function handleSelect(key: string, label: string) {
    openDrawer({
      title: label,
      description: "Registro rápido — você pode detalhar depois.",
      content: <QuickCreateForm label={label} onDone={closeDrawer} />,
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" className="rounded-full shadow-subtle" aria-label="Criar novo">
          <Plus className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Criar novo</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {QUICK_ACTIONS.map((action) => (
          <DropdownMenuItem key={action.key} onSelect={() => handleSelect(action.key, action.label)}>
            <action.icon />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
