import { cn } from "@/lib/utils";
import type { Notification } from "@/components/providers/ui-provider";

export function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: Notification;
  onNavigate?: (href: string) => void;
}) {
  const Wrapper = notification.href && onNavigate ? "button" : "div";

  return (
    <Wrapper
      onClick={notification.href && onNavigate ? () => onNavigate(notification.href!) : undefined}
      className={cn(
        "flex w-full gap-2.5 border-b border-border px-3 py-2.5 text-left last:border-b-0",
        !notification.read && "bg-sidebar-accent/30",
        notification.href && onNavigate && "cursor-pointer hover:bg-paper-mist"
      )}
    >
      <div
        className={cn(
          "mt-1.5 size-1.5 shrink-0 rounded-full",
          notification.read ? "bg-transparent" : "bg-electric-blue"
        )}
      />
      <div className="flex flex-col gap-0.5">
        <p className="text-body font-medium text-foreground">{notification.title}</p>
        <p className="text-body text-muted-foreground">{notification.description}</p>
        <p className="text-caption text-muted-foreground">{notification.createdAt}</p>
      </div>
    </Wrapper>
  );
}
