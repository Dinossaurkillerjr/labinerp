"use client";

import { Plus, ShoppingBag, Receipt, Package, Users, CheckSquare, PenTool } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { TransactionForm } from "@/components/finance/transaction-form";
import { SaleForm } from "@/components/sales/sale-form";
import { ProductForm } from "@/components/catalog/product-form";
import { ContactForm } from "@/components/contacts/contact-form";
import { TaskForm } from "@/components/tasks/task-form";

export function QuickActionButton() {
  const { openDrawer, closeDrawer } = useUI();
  const router = useRouter();

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
        <DropdownMenuItem
          onSelect={() =>
            openDrawer({
              title: "Nova tarefa",
              description: "Só o título é obrigatório.",
              content: <TaskForm onDone={closeDrawer} />,
            })
          }
        >
          <CheckSquare /> Nova tarefa
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => router.push("/canvas")}>
          <PenTool /> Nova nota no canvas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
