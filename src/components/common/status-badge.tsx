import { cn } from "@/lib/utils";

export type Status =
  | "pendente"
  | "concluido"
  | "atrasado"
  | "cancelado"
  | "rascunho";

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-[#fef3c7] text-[#92400e]" },
  concluido: { label: "Concluído", className: "bg-soft-mint text-[#166534]" },
  atrasado: { label: "Atrasado", className: "bg-[#fee2e2] text-[#991b1b]" },
  cancelado: { label: "Cancelado", className: "bg-paper-mist text-fog" },
  rascunho: { label: "Rascunho", className: "bg-paper-mist text-steel" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium whitespace-nowrap",
        config.className,
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}
