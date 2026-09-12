"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/lib/nav";
import {
  Plus,
  ShoppingBag,
  Package,
  Users,
  CheckSquare,
} from "lucide-react";

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Busca global" description="Navegue ou crie algo novo">
      <Command>
        <CommandInput placeholder="Buscar páginas, ações, registros..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Ações rápidas">
            <CommandItem onSelect={() => go("/vendas")}>
              <ShoppingBag /> Nova venda
            </CommandItem>
            <CommandItem onSelect={() => go("/produtos")}>
              <Package /> Novo produto
            </CommandItem>
            <CommandItem onSelect={() => go("/contatos")}>
              <Users /> Novo contato
            </CommandItem>
            <CommandItem onSelect={() => go("/tarefas")}>
              <CheckSquare /> Nova tarefa
            </CommandItem>
            <CommandItem onSelect={() => go("/canvas")}>
              <Plus /> Nova nota no canvas
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navegar">
            {NAV_ITEMS.map((item) => (
              <CommandItem key={item.href} onSelect={() => go(item.href)}>
                <item.icon />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
