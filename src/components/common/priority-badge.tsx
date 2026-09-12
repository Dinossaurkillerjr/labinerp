import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Priority = "alta" | "media" | "baixa";

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string; icon: typeof ArrowUp }> = {
  alta: { label: "Alta", className: "text-tangerine", icon: ArrowUp },
  media: { label: "Média", className: "text-steel", icon: ArrowRight },
  baixa: { label: "Baixa", className: "text-fog", icon: ArrowDown },
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const config = PRIORITY_CONFIG[priority];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-caption font-medium", config.className, className)}>
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}
