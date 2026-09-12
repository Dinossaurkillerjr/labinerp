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
import { DrawerForm, DrawerFormActions } from "@/components/common/drawer-form";
import { useCatalog } from "@/lib/catalog/catalog-provider";
import { useContacts } from "@/lib/contacts/contacts-provider";
import { useSales } from "@/lib/sales/sales-provider";
import type { SalesChannel } from "@/lib/sales/types";

const CHANNEL_OPTIONS: { value: SalesChannel; label: string }[] = [
  { value: "nuvemshop", label: "Nuvemshop" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "outro", label: "Outro" },
];

function toISODate(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function SaleForm({ onDone }: { onDone: () => void }) {
  const { products } = useCatalog();
  const { contacts } = useContacts();
  const { addSale } = useSales();

  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [contactId, setContactId] = React.useState("");
  const [productId, setProductId] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [couponCode, setCouponCode] = React.useState("");
  const [totalAmount, setTotalAmount] = React.useState(0);
  const [totalTouched, setTotalTouched] = React.useState(false);
  const [channel, setChannel] = React.useState<SalesChannel>("nuvemshop");
  const [notes, setNotes] = React.useState("");

  // Suggests a total from the product's price × quantity, but never overrides
  // a value the user has already typed directly into the currency field.
  function suggestTotal(nextProductId: string, nextQuantity: number) {
    if (totalTouched) return;
    const product = products.find((p) => p.id === nextProductId);
    if (product?.price) setTotalAmount(product.price * nextQuantity);
  }

  function handleProductChange(nextProductId: string) {
    setProductId(nextProductId);
    suggestTotal(nextProductId, quantity);
  }

  function handleQuantityChange(nextQuantity: number) {
    setQuantity(nextQuantity);
    suggestTotal(productId, nextQuantity);
  }

  function handleSubmit() {
    if (!productId) {
      toast.error("Selecione o produto vendido.");
      return;
    }
    if (!date) {
      toast.error("Selecione a data da venda.");
      return;
    }
    if (totalAmount <= 0) {
      toast.error("Informe o valor total da venda.");
      return;
    }

    addSale({
      date: toISODate(date),
      contactId: contactId || undefined,
      productId,
      quantity,
      couponCode: couponCode || undefined,
      totalAmount,
      channel,
      notes: notes || undefined,
    });

    toast.success("Venda registrada — a receita já entrou no Financeiro.");
    onDone();
  }

  return (
    <>
      <DrawerForm>
        <Field label="Data">
          <DateInput value={date} onValueChange={setDate} />
        </Field>

        <Field label="Produto">
          <Combobox
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            value={productId}
            onValueChange={handleProductChange}
            placeholder="Selecionar produto"
          />
        </Field>

        <Field label="Cliente/contato" optional>
          <Combobox
            options={contacts.map((c) => ({ value: c.id, label: c.name }))}
            value={contactId}
            onValueChange={setContactId}
            placeholder="Selecionar contato"
          />
        </Field>

        <Field label="Quantidade">
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => handleQuantityChange(Math.max(1, Number(e.target.value) || 1))}
          />
        </Field>

        <Field label="Cupom" optional>
          <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Ex: BEMVINDO10" />
        </Field>

        <Field label="Valor total" hint="Sugerido a partir do preço do produto — ajuste se necessário.">
          <CurrencyInput
            value={totalAmount}
            onValueChange={(value) => {
              setTotalAmount(value);
              setTotalTouched(true);
            }}
          />
        </Field>

        <Field label="Canal">
          <Select value={channel} onValueChange={(value) => setChannel(value as SalesChannel)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CHANNEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Observações" optional>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </Field>
      </DrawerForm>
      <DrawerFormActions onCancel={onDone} onSubmit={handleSubmit} submitLabel="Registrar venda" />
    </>
  );
}
