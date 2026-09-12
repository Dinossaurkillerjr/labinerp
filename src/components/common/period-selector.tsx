"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PeriodPreset } from "@/lib/reports/period-range";

const PRESET_LABELS: Record<PeriodPreset, string> = {
  mes: "Este mês",
  ultimos30: "Últimos 30 dias",
  trimestre: "Este trimestre",
  ano: "Este ano",
  personalizado: "Personalizado",
};

export function PeriodSelector({
  value,
  onChange,
  includeCustom = false,
  className,
}: {
  value: PeriodPreset;
  onChange: (preset: PeriodPreset) => void;
  includeCustom?: boolean;
  className?: string;
}) {
  const presets: PeriodPreset[] = ["mes", "ultimos30", "trimestre", "ano", ...(includeCustom ? (["personalizado"] as const) : [])];

  return (
    <Select value={value} onValueChange={(v) => onChange(v as PeriodPreset)}>
      <SelectTrigger className={className ?? "w-44"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {presets.map((preset) => (
          <SelectItem key={preset} value={preset}>
            {PRESET_LABELS[preset]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
