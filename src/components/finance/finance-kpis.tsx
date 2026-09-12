"use client";

import { Wallet, TrendingUp, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { StatCard } from "@/components/common/stat-card";
import { formatCurrencyCents } from "@/lib/currency";
import {
  calculateCaixa,
  calculateCashFlow,
  calculateResultado,
} from "@/lib/finance/calculations";
import { monthBounds } from "@/lib/finance/period";
import { useFinance } from "@/lib/finance/finance-provider";

export function FinanceKpis({ monthId }: { monthId: string }) {
  const { transactions, categories } = useFinance();
  const period = monthBounds(monthId);

  const caixa = calculateCaixa(transactions);
  const resultado = calculateResultado(transactions, period, categories);
  const cashFlow = calculateCashFlow(transactions, period, 0);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard label="Caixa atual" value={formatCurrencyCents(caixa)} icon={Wallet} />
      <StatCard
        label="Resultado do mês"
        value={formatCurrencyCents(resultado.lucroLiquido)}
        icon={TrendingUp}
      />
      <StatCard label="A pagar" value={formatCurrencyCents(cashFlow.aPagar)} icon={ArrowDownCircle} />
      <StatCard label="A receber" value={formatCurrencyCents(cashFlow.aReceber)} icon={ArrowUpCircle} />
    </div>
  );
}
