"use client";

import { Plus, ShoppingBag, Receipt, Package, Users, CheckSquare, PenTool } from "lucide-react";
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
import { TransactionForm } from "@/components/finance/transaction-form";
import { SaleForm } from "@/components/sales/sale-form";
import { ProductForm } from "@/components/catalog/product-form";
import { ContactForm } from "@/components/contacts/contact-form";
import { toast } from "sonner";
import * as React from "react";

function PlaceholderQuickCreateForm({ label, onDone }: { label: string; onDone: () => void }) {
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

  function openPlaceholder(label: string) {
    openDrawer({
      title: label,
      description: "Registro rápido — você pode detalhar depois.",
      content: <PlaceholderQuickCreateForm label={label} onDone={closeDrawer} />,
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
        <DropdownMenuItem
          onSelect={() =>
            openDrawer({
              title: "Nova venda",
              description: "Registra a receita no Financeiro automaticamente.",
              content: <SaleForm onDone={closeDrawer} />,
            })
          }
        >
          <ShoppingBag /> Nova venda
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            openDrawer({
              title: "Novo lançamento",
              description: "Tipo → categoria → dados essenciais → salvar.",
              content: <TransactionForm defaultType="expense" onDone={closeDrawer} />,
            })
          }
        >
          <Receipt /> Nova despesa
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            openDrawer({
              title: "Novo produto",
              description: "Comece com o essencial — você pode detalhar depois.",
              content: <ProductForm onDone={closeDrawer} />,
            })
          }
        >
          <Package /> Novo produto
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            openDrawer({
              title: "Novo contato",
              description: "Comece com o nome — você pode detalhar depois.",
              content: <ContactForm onDone={closeDrawer} />,
            })
          }
        >
          <Users /> Novo contato
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openPlaceholder("Nova tarefa")}>
          <CheckSquare /> Nova tarefa
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => openPlaceholder("Nova nota no canvas")}>
          <PenTool /> Nova nota no canvas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
