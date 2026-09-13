"use client";

import * as React from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/common/currency-input";
import { DateInput } from "@/components/common/date-input";
import { Combobox } from "@/components/common/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DrawerForm, DrawerFormActions } from "@/components/common/drawer-form";
import { useFinance } from "@/lib/finance/finance-provider";
import { GROUPS_BY_TYPE, PAYMENT_SOURCE_LABELS, capitalCategoryFor } from "@/lib/finance/categories";
import type { PaymentSource, Transaction, TransactionType } from "@/lib/finance/types";

const TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: "income", label: "Receita" },
  { value: "expense", label: "Despesa" },
  { value: "owner_contribution", label: "Aporte" },
  { value: "owner_withdrawal", label: "Retirada" },
];

const PAYMENT_SOURCE_OPTIONS: PaymentSource[] = [
  "conta_marca",
  "conta_pessoal",
  "dinheiro",
  "cartao",
  "outro",
];

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const STATUS_LABEL_BY_TYPE: Record<TransactionType, { pendente: string; concluido: string }> = {
  income: { pendente: "A receber", concluido: "Recebido" },
  owner_contribution: { pendente: "A receber", concluido: "Recebido" },
  expense: { pendente: "A pagar", concluido: "Pago" },
  owner_withdrawal: { pendente: "A pagar", concluido: "Pago" },
};

export function TransactionForm({
  transaction,
  onDone,
  defaultType,
  defaultMode,
}: {
  transaction?: Transaction;
  onDone: () => void;
  defaultType?: TransactionType;
  defaultMode?: "unico" | "parcelado" | "recorrente";
}) {
  const {
    categories,
    addTransaction,
    addInstallmentTransaction,
    addRecurringRule,
    updateTransaction,
    isMonthClosed,
  } = useFinance();

  const isEditing = Boolean(transaction);
  const [mode, setMode] = React.useState<"unico" | "parcelado" | "recorrente">(defaultMode ?? "unico");
  const [type, setType] = React.useState<TransactionType>(transaction?.type ?? defaultType ?? "expense");
  const [category, setCategory] = React.useState(
    transaction?.category ?? capitalCategoryFor(defaultType ?? "expense") ?? ""
  );
  const [description, setDescription] = React.useState(transaction?.description ?? "");
  const [amount, setAmount] = React.useState(transaction?.amount ?? 0);
  const [date, setDate] = React.useState<Date | undefined>(toDate(transaction?.date) ?? new Date());
  const [paymentSource, setPaymentSource] = React.useState<PaymentSource>(
    transaction?.paymentSource ?? "conta_marca"
  );
  const [settled, setSettled] = React.useState(transaction?.status === "concluido");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(toDate(transaction?.dueDate));
  const [notes, setNotes] = React.useState(transaction?.notes ?? "");
  const [installmentsCount, setInstallmentsCount] = React.useState(3);
  const [firstInstallmentSettled, setFirstInstallmentSettled] = React.useState(false);
  const [dayOfMonth, setDayOfMonth] = React.useState(5);

  const categoryOptions = React.useMemo(() => {
    const allowedGroups = GROUPS_BY_TYPE[type] as readonly string[];
    return categories
      .filter((c) => allowedGroups.includes(c.group))
      .map((c) => ({ value: c.id, label: c.label }));
  }, [categories, type]);

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);
    const capitalCategory = capitalCategoryFor(nextType);
    if (capitalCategory) {
      setCategory(capitalCategory);
      return;
    }
    const allowedGroups = GROUPS_BY_TYPE[nextType] as readonly string[];
    const categoryStillValid = categories.some(
      (c) => c.id === category && allowedGroups.includes(c.group)
    );
    if (!categoryStillValid) setCategory("");
  }

  const isCapitalType = type === "owner_contribution" || type === "owner_withdrawal";
  const canUseModes = !isEditing && (type === "expense" || type === "income");
  const statusLabels = STATUS_LABEL_BY_TYPE[type];
  const monthClosed = date ? isMonthClosed(toISODate(date)) : false;

  function handleSubmit() {
    if (!category) {
      toast.error("Selecione uma categoria.");
      return;
    }
    if (!description.trim()) {
      toast.error("Descreva o lançamento.");
      return;
    }
    if (amount <= 0) {
      toast.error("Informe um valor maior que zero.");
      return;
    }
    if (!date) {
      toast.error("Selecione a data.");
      return;
    }
    if (monthClosed) {
      toast.error("Este mês está fechado. Reabra-o em Fechamento mensal para editar.");
      return;
    }

    if (mode === "recorrente" && (type === "expense" || type === "income")) {
      addRecurringRule({
        description,
        amount,
        category,
        paymentSource,
        type,
        dayOfMonth,
        startDate: toISODate(date),
      });
      toast.success("Recorrência criada. Os próximos lançamentos foram gerados.");
      onDone();
      return;
    }

    if (mode === "parcelado") {
      addInstallmentTransaction({
        type,
        totalAmount: amount,
        installmentsCount,
        date: toISODate(date),
        category,
        description,
        paymentSource,
        notes: notes || undefined,
        firstInstallmentSettled,
      });
      toast.success(`Lançamento parcelado em ${installmentsCount}x criado.`);
      onDone();
      return;
    }

    const input = {
      type,
      amount,
      date: toISODate(date),
      category,
      description,
      paymentSource,
      status: settled ? ("concluido" as const) : ("pendente" as const),
      dueDate: settled ? undefined : toISODate(dueDate ?? date),
      notes: notes || undefined,
    };

    if (isEditing && transaction) {
      updateTransaction(transaction.id, input);
      toast.success("Lançamento atualizado.");
    } else {
      addTransaction(input);
      toast.success("Lançamento criado.");
    }
    onDone();
  }

  return (
    <>
      <DrawerForm>
        <Field label="Tipo">
          <Select value={type} onValueChange={(value) => handleTypeChange(value as TransactionType)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {canUseModes ? (
          <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
            <TabsList className="w-full">
              <TabsTrigger value="unico" className="flex-1">Único</TabsTrigger>
              <TabsTrigger value="parcelado" className="flex-1">Parcelado</TabsTrigger>
              <TabsTrigger value="recorrente" className="flex-1">Recorrente</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}

        {isCapitalType ? null : (
          <Field label="Categoria">
            <Combobox
              options={categoryOptions}
              value={category}
              onValueChange={setCategory}
              placeholder="Selecionar categoria"
            />
          </Field>
        )}

        <Field label="Descrição">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Venda Instagram" />
        </Field>

        <Field label={mode === "parcelado" ? "Valor total" : "Valor"}>
          <CurrencyInput value={amount} onValueChange={setAmount} />
        </Field>

        <Field label={mode === "recorrente" ? "Data de início" : "Data"}>
          <DateInput value={date} onValueChange={setDate} />
        </Field>

        <Field label="Forma de pagamento">
          <Select value={paymentSource} onValueChange={(value) => setPaymentSource(value as PaymentSource)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_SOURCE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {PAYMENT_SOURCE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {mode === "parcelado" ? (
          <>
            <Field label="Número de parcelas">
              <Input
                type="number"
                min={2}
                max={36}
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Math.max(2, Number(e.target.value) || 2))}
              />
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-body text-foreground">Primeira parcela já {statusLabels.concluido.toLowerCase()}</span>
              <Switch checked={firstInstallmentSettled} onCheckedChange={setFirstInstallmentSettled} />
            </div>
          </>
        ) : null}

        {mode === "recorrente" ? (
          <Field label="Dia do mês" hint="Lançamentos futuros serão gerados automaticamente.">
            <Input
              type="number"
              min={1}
              max={31}
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
            />
          </Field>
        ) : null}

        {mode === "unico" ? (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="text-body text-foreground">{statusLabels.concluido}</span>
              <Switch checked={settled} onCheckedChange={setSettled} />
            </div>
            {!settled ? (
              <Field label="Vencimento" optional>
                <DateInput value={dueDate ?? date} onValueChange={setDueDate} />
              </Field>
            ) : null}
          </>
        ) : null}

        <Field label="Notas" optional>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Detalhes adicionais..." />
        </Field>

        {monthClosed ? (
          <p className="text-caption text-destructive">
            O mês selecionado está fechado. Reabra-o na aba Fechamento mensal para salvar alterações.
          </p>
        ) : null}
      </DrawerForm>
      <DrawerFormActions
        onCancel={onDone}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? "Salvar alterações" : "Criar lançamento"}
      />
    </>
  );
}
