import { cn } from "@/lib/utils";
import type { TagColor } from "@/lib/tags";

const TAG_COLORS: Record<TagColor, string> = {
  neutral: "bg-paper-mist text-charcoal",
  blue: "bg-[#dbeaff] text-[#1e3a8a]",
  green: "bg-soft-mint text-[#166534]",
  orange: "bg-[#ffedd5] text-[#9a3412]",
  violet: "bg-[#ede9fe] text-[#5b21b6]",
};

// Re-exported so existing `import type { TagColor } from "@/components/common/tag"`
// call sites keep working — @/lib/tags is now the single source of truth.
export type { TagColor };

export function Tag({
  children,
  color = "neutral",
  className,
}: {
  children: React.ReactNode;
  color?: TagColor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-medium whitespace-nowrap",
        TAG_COLORS[color],
        className
      )}
    >
      {children}
    </span>
  );
}
