import { formatCurrencyCents } from "@/lib/currency";
import { calculateCostComposition, calculateMargin, calculateProductCost } from "@/lib/catalog/calculations";
import { useFinance } from "@/lib/finance/finance-provider";
import type { CostComponent } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const COMPOSITION_COLORS = [
  "bg-electric-blue",
  "bg-vivid-green",
  "bg-tangerine",
  "bg-lavender",
  "bg-deep-sapphire",
  "bg-silver",
];

export function CostSummary({
  components,
  price,
  className,
}: {
  components: CostComponent[];
  price?: number;
  className?: string;
}) {
  const { categories } = useFinance();
  const categoryMap = new Map(categories.map((c) => [c.id, c.label]));

  const cost = calculateProductCost(components);
  const { profit, marginPercent } = calculateMargin(price ?? 0, cost);
  const composition = calculateCostComposition(components);

  return (
    <div className={cn("flex flex-col gap-3 rounded-lg bg-paper-mist p-3", className)}>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-caption text-muted-foreground">Custo total</p>
          <p className="text-body-lg font-medium text-foreground">{formatCurrencyCents(cost)}</p>
        </div>
        <div>
          <p className="text-caption text-muted-foreground">Lucro</p>
          <p className={cn("text-body-lg font-medium", profit >= 0 ? "text-vivid-green" : "text-destructive")}>
            {formatCurrencyCents(profit)}
          </p>
        </div>
        <div>
          <p className="text-caption text-muted-foreground">Margem</p>
          <p className={cn("text-body-lg font-medium", marginPercent >= 0 ? "text-foreground" : "text-destructive")}>
            {marginPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {composition.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex h-2 w-full overflow-hidden rounded-full">
            {composition.map((item, index) => (
              <div
                key={item.componentId}
                className={COMPOSITION_COLORS[index % COMPOSITION_COLORS.length]}
                style={{ width: `${item.percent}%` }}
              />
            ))}
          </div>
          <div className="flex flex-col gap-1">
            {composition.map((item, index) => (
              <div key={item.componentId} className="flex items-center justify-between text-caption">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className={cn("size-2 rounded-full", COMPOSITION_COLORS[index % COMPOSITION_COLORS.length])} />
                  {categoryMap.get(item.category) ?? item.category}
                </span>
                <span className="text-foreground">
                  {formatCurrencyCents(item.amount)} · {item.percent.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
