import { cn } from "@/lib/utils";

const TAG_COLORS = {
  neutral: "bg-paper-mist text-charcoal",
  blue: "bg-[#dbeaff] text-[#1e3a8a]",
  green: "bg-soft-mint text-[#166534]",
  orange: "bg-[#ffedd5] text-[#9a3412]",
  violet: "bg-[#ede9fe] text-[#5b21b6]",
} as const;

export type TagColor = keyof typeof TAG_COLORS;

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
