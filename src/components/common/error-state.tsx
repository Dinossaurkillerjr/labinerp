import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Algo deu errado",
  description = "Não foi possível carregar esses dados. Tente novamente.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-paper-mist px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <p className="text-body-lg font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-body text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
