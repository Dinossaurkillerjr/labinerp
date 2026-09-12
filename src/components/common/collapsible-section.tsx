"use client";

import * as React from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Progressive disclosure toggle: starts collapsed with a "+ Mostrar mais campos"
 * trigger, revealing its children only when the user asks for them. Used by
 * Produto and Contato forms so the initial cadastro stays short.
 */
export function CollapsibleSection({
  label = "Mostrar mais campos",
  defaultOpen = false,
  children,
  className,
}: {
  label?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  if (open) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {children}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex w-fit items-center gap-1 text-caption text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="size-3.5 rotate-180" />
          Ocultar campos extras
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "flex w-fit items-center gap-1.5 text-body text-electric-blue hover:underline",
        className
      )}
    >
      <Plus className="size-3.5" />
      {label}
    </button>
  );
}
