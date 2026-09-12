const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formats an integer amount in cents as "R$ 0,00". */
export function formatCurrencyCents(cents: number): string {
  return formatter.format(cents / 100);
}

/** Formats an integer amount in cents as a signed value, e.g. "+R$ 10,00" / "-R$ 10,00". */
export function formatSignedCurrencyCents(cents: number): string {
  const sign = cents > 0 ? "+" : cents < 0 ? "-" : "";
  return `${sign}${formatCurrencyCents(Math.abs(cents))}`;
}

/** Extracts digits from free-form text and returns the integer cents value. */
export function parseCurrencyDigitsToCents(text: string): number {
  const digitsOnly = text.replace(/\D/g, "");
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}
