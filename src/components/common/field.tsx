import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-body font-medium text-foreground">
        {label}
        {optional ? (
          <span className="text-caption font-normal text-muted-foreground">(opcional)</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p className="text-caption text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-caption text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
