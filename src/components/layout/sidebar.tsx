"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
          M
        </div>
        <span className="font-display text-body-lg text-sidebar-foreground">
          da Marca
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-2 text-body text-sidebar-foreground transition-colors",
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="size-4 shrink-0" strokeWidth={2} />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3 text-caption text-muted-foreground">
        ERP da Marca · Fase 1
      </div>
    </aside>
  );
}
