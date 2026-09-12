"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatCurrencyCents, parseCurrencyDigitsToCents } from "@/lib/currency";

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
      value={value === 0 ? "" : formatCurrencyCents(value)}
      onChange={(event) => {
        onValueChange(parseCurrencyDigitsToCents(event.target.value));
      }}
    />
  );
}
