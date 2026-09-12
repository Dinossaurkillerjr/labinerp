import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";

export default function FinanceiroPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Financeiro"
        description="Caixa, receitas, despesas e resultado da marca."
      />
      <EmptyState
        icon={Wallet}
        title="Módulo financeiro chega na Fase 2"
        description="Aqui você vai controlar caixa, resultado, patrimônio e capital do proprietário."
      />
    </div>
  );
}
