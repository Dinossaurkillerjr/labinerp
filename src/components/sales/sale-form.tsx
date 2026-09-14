"use client";

import * as React from "react";
import { toast } from "sonner";
import { Field } from "@/components/common/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/common/currency-input";
import { DateInput } from "@/components/common/date-input";
import { Combobox } from "@/components/common/combobox";
import { CollapsibleSection } from "@/components/common/collapsible-section";
import { Switch } from "@/components/ui/switch";
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
import { useUI } from "@/components/providers/ui-provider";
import { ContactForm } from "@/components/contacts/contact-form";
import { calculateSaleBreakdown } from "@/lib/sales/calculations";
import { formatCurrencyCents } from "@/lib/currency";
import type { Contact } from "@/lib/contacts/types";
import type { DiscountKind, Sale, SalesChannel } from "@/lib/sales/types";

const CHANNEL_OPTIONS: { value: SalesChannel; label: string }[] = [
  { value: "nuvemshop", label: "Nuvemshop" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "outro", label: "Outro" },
];

/** Sentinel for "sem cupom" — DiscountKind itself has no "none" member because
 *  a persisted Discount is only ever created when the user actually picks one. */
const NO_DISCOUNT = "nenhum" as const;
type DiscountKindOption = DiscountKind | typeof NO_DISCOUNT;

const DISCOUNT_KIND_OPTIONS: { value: DiscountKindOption; label: string }[] = [
  { value: NO_DISCOUNT, label: "Sem cupom" },
  { value: "percentual", label: "Percentual (%)" },
  { value: "valor_fixo", label: "Valor fixo (R$)" },
  { value: "frete_gratis", label: "Frete grátis" },
];

function toISODate(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function SaleForm({ sale, onDone }: { sale?: Sale; onDone: () => void }) {
  const { products } = useCatalog();
  const { contacts } = useContacts();
  const { addSale, updateSale } = useSales();
  const { openModal, closeModal } = useUI();
  const isEditing = Boolean(sale);

  const [date, setDate] = React.useState<Date | undefined>(toDate(sale?.date) ?? new Date());
  const [contactId, setContactId] = React.useState(sale?.contactId ?? "");
  const [productId, setProductId] = React.useState(sale?.productId ?? "");
  const [quantity, setQuantity] = React.useState(sale?.quantity ?? 1);
  // Vendas antigas (antes do breakdown estruturado) só têm totalAmount — nesse
  // caso ele vira o próprio subtotal, exatamente como já é exibido hoje.
  const [subtotal, setSubtotal] = React.useState(sale?.subtotal ?? sale?.totalAmount ?? 0);
  const [subtotalTouched, setSubtotalTouched] = React.useState(isEditing);
  const [channel, setChannel] = React.useState<SalesChannel>(sale?.channel ?? "nuvemshop");
  const [notes, setNotes] = React.useState(sale?.notes ?? "");

  const [discountKind, setDiscountKind] = React.useState<DiscountKindOption>(sale?.discount?.kind ?? NO_DISCOUNT);
  const [discountCode, setDiscountCode] = React.useState(sale?.discount?.code ?? "");
  const [discountDescription, setDiscountDescription] = React.useState(sale?.discount?.description ?? "");
  const [discountPercent, setDiscountPercent] = React.useState(sale?.discount?.percent ?? 10);
  const [discountAmount, setDiscountAmount] = React.useState(sale?.discount?.amount ?? 0);
  const [discountAcumulativo, setDiscountAcumulativo] = React.useState(sale?.discount?.acumulativo ?? false);
  const [shippingCost, setShippingCost] = React.useState(sale?.shippingCost ?? 0);

  // Suggests a subtotal from the product's price × quantity, but never
  // overrides a value the user has already typed directly into the field.
  function suggestSubtotal(nextProductId: string, nextQuantity: number) {
    if (subtotalTouched) return;
    const product = products.find((p) => p.id === nextProductId);
    if (product?.price) setSubtotal(product.price * nextQuantity);
  }

  function handleProductChange(nextProductId: string) {
    setProductId(nextProductId);
    suggestSubtotal(nextProductId, quantity);
  }

  function handleQuantityChange(nextQuantity: number) {
    setQuantity(nextQuantity);
    suggestSubtotal(productId, nextQuantity);
  }

  // Opens the same Contact form used in Contatos, stacked on top of the sale
  // drawer via the modal slot — the sale form stays open behind it, and the
  // new contact comes back selected here without a second, duplicate form.
  function openNewContact() {
    openModal({
      title: "Novo contato",
      description: "Comece com o nome — você pode detalhar depois.",
      content: (
        <ContactForm
          onDone={closeModal}
          onCreated={(created: Contact) => setContactId(created.id)}
        />
      ),
    });
  }

  const discount =
    discountKind === NO_DISCOUNT
      ? undefined
      : {
          kind: discountKind,
          code: discountCode.trim() || undefined,
          description: discountDescription.trim() || undefined,
          percent: discountKind === "percentual" ? discountPercent : undefined,
          amount: discountKind === "valor_fixo" ? discountAmount : undefined,
          acumulativo: discountAcumulativo || undefined,
        };

  const breakdown = calculateSaleBreakdown({ subtotal, discount, shippingCost });

  function handleSubmit() {
    if (!productId) {
      toast.error("Selecione o produto vendido.");
      return;
    }
    if (!date) {
      toast.error("Selecione a data da venda.");
      return;
    }
    if (subtotal <= 0) {
      toast.error("Informe o valor da venda.");
      return;
    }

    const payload = {
      date: toISODate(date),
      contactId: contactId || undefined,
      productId,
      quantity,
      couponCode: discount?.code,
      subtotal,
      discount,
      shippingAmount: breakdown.shippingAmount,
      shippingCost,
      totalAmount: breakdown.totalAmount,
      channel,
      notes: notes || undefined,
    };

    if (isEditing && sale) {
      updateSale(sale.id, payload);
      toast.success("Venda atualizada — o Financeiro foi recalculado.");
    } else {
      addSale(payload);
      toast.success("Venda registrada — a receita já entrou no Financeiro.");
    }
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
            onCreateNew={openNewContact}
            createLabel="Adicionar novo contato"
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

        <Field label="Subtotal" hint="Sugerido a partir do preço do produto — ajuste se necessário.">
          <CurrencyInput
            value={subtotal}
            onValueChange={(value) => {
              setSubtotal(value);
              setSubtotalTouched(true);
            }}
          />
        </Field>

        <Field label="Frete" optional hint="Custo real de frete para a marca. Cobrado do cliente, a menos que o cupom seja frete grátis.">
          <CurrencyInput value={shippingCost} onValueChange={setShippingCost} />
        </Field>

        <CollapsibleSection label="Adicionar cupom/desconto" defaultOpen={discountKind !== NO_DISCOUNT}>
          <Field label="Tipo de desconto">
            <Select value={discountKind} onValueChange={(value) => setDiscountKind(value as DiscountKindOption)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISCOUNT_KIND_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {discountKind !== NO_DISCOUNT ? (
            <>
              <Field label="Código do cupom" optional>
                <Input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="Ex: BEMVINDO10" />
              </Field>

              {discountKind === "percentual" ? (
                <Field label="Percentual de desconto">
                  <div className="flex max-w-32 items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                    />
                    <span className="text-body text-muted-foreground">%</span>
                  </div>
                </Field>
              ) : null}

              {discountKind === "valor_fixo" ? (
                <Field label="Valor do desconto">
                  <CurrencyInput value={discountAmount} onValueChange={setDiscountAmount} />
                </Field>
              ) : null}

              <Field label="Descrição" optional>
                <Input
                  value={discountDescription}
                  onChange={(e) => setDiscountDescription(e.target.value)}
                  placeholder="Ex: Cliente recorrente, campanha de aniversário..."
                />
              </Field>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <span className="text-body text-foreground">Acumulativo com outras promoções</span>
                <Switch checked={discountAcumulativo} onCheckedChange={setDiscountAcumulativo} />
              </div>
            </>
          ) : null}
        </CollapsibleSection>

        <div className="flex flex-col gap-1.5 rounded-lg bg-paper-mist p-3">
          <div className="flex justify-between text-body">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatCurrencyCents(breakdown.subtotal)}</span>
          </div>
          {breakdown.discountAmount > 0 ? (
            <div className="flex justify-between text-body">
              <span className="text-muted-foreground">Desconto concedido</span>
              <span className="text-destructive">− {formatCurrencyCents(breakdown.discountAmount)}</span>
            </div>
          ) : null}
          {shippingCost > 0 ? (
            <div className="flex justify-between text-body">
              <span className="text-muted-foreground">Frete cobrado do cliente</span>
              <span className="text-foreground">{formatCurrencyCents(breakdown.shippingAmount)}</span>
            </div>
          ) : null}
          {shippingCost > 0 && breakdown.shippingAmount !== shippingCost ? (
            <div className="flex justify-between text-caption text-muted-foreground">
              <span>Custo de frete para a marca (não cobrado)</span>
              <span>{formatCurrencyCents(shippingCost)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-1.5 text-body-lg font-medium">
            <span className="text-foreground">Total pago pelo cliente</span>
            <span className="text-foreground">{formatCurrencyCents(breakdown.totalAmount)}</span>
          </div>
        </div>

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
      <DrawerFormActions
        onCancel={onDone}
        onSubmit={handleSubmit}
        submitLabel={isEditing ? "Salvar alterações" : "Registrar venda"}
      />
    </>
  );
}
