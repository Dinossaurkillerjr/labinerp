"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";

export function Breadcrumbs() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  return (
    <div className="flex items-center gap-1.5 text-body text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        Início
      </Link>
      {current && current.href !== "/" ? (
        <>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{current.title}</span>
        </>
      ) : null}
    </div>
  );
}
