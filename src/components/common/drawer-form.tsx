import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DrawerForm({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col gap-4 py-4", className)}>{children}</div>;
}

export function DrawerFormActions({
  onCancel,
  onSubmit,
  submitLabel = "Salvar",
  cancelLabel = "Cancelar",
  submitting,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitting?: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-end gap-2">
      <Button variant="outline" onClick={onCancel} type="button">
        {cancelLabel}
      </Button>
      <Button onClick={onSubmit} disabled={submitting} type="button">
        {submitting ? "Salvando..." : submitLabel}
      </Button>
    </div>
  );
}
