"use client";

import * as React from "react";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, PiggyBank, Percent } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/common/stat-card";
import { Field } from "@/components/common/field";
import { CurrencyInput } from "@/components/common/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatCurrencyCents } from "@/lib/currency";
import { calculateResultado } from "@/lib/finance/calculations";
import { formatMonthLabel, monthBounds } from "@/lib/finance/period";
import { useFinance } from "@/lib/finance/finance-provider";
import { usePlanning } from "@/lib/planning/planning-provider";
import { calculateUnallocatedProfit } from "@/lib/planning/calculations";
import type { ProfitAllocation } from "@/lib/planning/types";
import { cn } from "@/lib/utils";

/**
 * Formulário de destinação de um único mês. Montado com `key={monthId}` pelo
 * componente pai — trocar de mês remonta este componente do zero, o que já
 * reinicializa os campos a partir de `existing` sem precisar de um efeito
 * sincronizando state a partir de props.
 */
function AllocationForm({
  monthId,
  lucroLiquido,
  existing,
}: {
  monthId: string;
  lucroLiquido: number;
  existing?: ProfitAllocation;
}) {
  const { setAllocation } = usePlanning();
  const [reinvestimento, setReinvestimento] = React.useState(existing?.reinvestimento ?? 0);
  const [reserva, setReserva] = React.useState(existing?.reserva ?? 0);
  const [retirada, setRetirada] = React.useState(existing?.retirada ?? 0);
  const [outro, setOutro] = React.useState(existing?.outro ?? 0);
  const [notes, setNotes] = React.useState(existing?.notes ?? "");

  const unallocated = calculateUnallocatedProfit(lucroLiquido, {
    monthId,
    reinvestimento,
    reserva,
    retirada,
    outro,
    updatedAt: "",
  });

  function handleSave() {
    setAllocation(monthId, { reinvestimento, reserva, retirada, outro, notes: notes || undefined });
    toast.success("Destinação do resultado salva.");
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Reinvestimento">
          <CurrencyInput value={reinvestimento} onValueChange={setReinvestimento} />
        </Field>
        <Field label="Reserva">
          <CurrencyInput value={reserva} onValueChange={setReserva} />
        </Field>
        <Field label="Retirada" hint="Registro, não a retirada em si.">
          <CurrencyInput value={retirada} onValueChange={setRetirada} />
        </Field>
        <Field label="Outro" optional>
          <CurrencyInput value={outro} onValueChange={setOutro} />
        </Field>
      </div>

      <Field label="Notas" optional>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Detalhes sobre esta destinação..." />
      </Field>

      <div className="flex items-center justify-between rounded-lg bg-paper-mist p-3">
        <span className="text-body text-muted-foreground">Não alocado</span>
        <span className={cn("text-body-lg font-medium", unallocated < 0 ? "text-destructive" : "text-foreground")}>
          {formatCurrencyCents(unallocated)}
        </span>
      </div>

      <Button onClick={handleSave} className="w-fit">
        Salvar destinação
      </Button>
    </>
  );
}

/**
 * "O que aconteceu" (seção 1) + "destinação do resultado" (seção 2). A
 * destinação é só uma classificação sobre o lucro já calculado — nada aqui
 * cria ou altera uma Transaction; uma retirada real continua sendo registrada
 * normalmente em Financeiro.
 */
export function PlanningOverview({ monthId }: { monthId: string }) {
  const { transactions, categories } = useFinance();
  const { getAllocation } = usePlanning();

  const resultado = calculateResultado(transactions, monthBounds(monthId), categories);
  const margemPercent = resultado.receita > 0 ? (resultado.lucroLiquido / resultado.receita) * 100 : 0;
  const existing = getAllocation(monthId);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Receita" value={formatCurrencyCents(resultado.receita)} icon={TrendingUp} />
        <StatCard
          label="Custos + despesas"
          value={formatCurrencyCents(resultado.custoProdutos + resultado.despesasOperacionais)}
          icon={TrendingDown}
        />
        <StatCard label="Lucro líquido" value={formatCurrencyCents(resultado.lucroLiquido)} icon={PiggyBank} />
        <StatCard label="Margem" value={`${margemPercent.toFixed(0)}%`} icon={Percent} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Destinação do resultado — {formatMonthLabel(monthId)}</CardTitle>
          <CardDescription>
            Uma classificação sobre o que já aconteceu com o lucro, não uma movimentação financeira. Uma retirada real
            continua sendo registrada em Financeiro → Novo lançamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <AllocationForm key={monthId} monthId={monthId} lucroLiquido={resultado.lucroLiquido} existing={existing} />
        </CardContent>
      </Card>
    </div>
  );
}
