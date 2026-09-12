import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  /** Percentage change vs. previous period. Positive is up, negative is down. */
  trend?: number;
  className?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-body font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent className="flex flex-wrap items-end justify-between gap-x-2 gap-y-1">
        <span className="text-heading-sm font-display text-foreground">{value}</span>
        {trend !== undefined ? (
          <span
            className={cn(
              "flex shrink-0 items-center gap-0.5 text-caption font-medium whitespace-nowrap",
              trend >= 0 ? "text-vivid-green" : "text-destructive"
            )}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="size-3.5 shrink-0" />
            ) : (
              <ArrowDownRight className="size-3.5 shrink-0" />
            )}
            {Math.abs(trend)}%
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
