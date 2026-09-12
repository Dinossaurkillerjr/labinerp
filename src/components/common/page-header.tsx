export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-heading text-foreground">{title}</h1>
        {description ? (
          <p className="text-body text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
