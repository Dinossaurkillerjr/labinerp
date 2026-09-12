"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formats a value in cents (integer) as "R$ 0,00". */
function formatCents(cents: number) {
  return formatter.format(cents / 100);
}

export function CurrencyInput({
  value,
  onValueChange,
  className,
  placeholder = "R$ 0,00",
  ...props
}: {
  /** Value in cents. */
  value: number;
  onValueChange: (cents: number) => void;
  className?: string;
} & Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type">) {
  return (
    <Input
      {...props}
      inputMode="numeric"
      placeholder={placeholder}
      className={cn("text-right tabular-nums", className)}
      value={value === 0 ? "" : formatCents(value)}
      onChange={(event) => {
        const digitsOnly = event.target.value.replace(/\D/g, "");
        onValueChange(digitsOnly ? parseInt(digitsOnly, 10) : 0);
      }}
    />
  );
}
