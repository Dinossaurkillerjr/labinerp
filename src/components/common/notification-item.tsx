import { cn } from "@/lib/utils";
import type { Notification } from "@/components/providers/ui-provider";

export function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <div
      className={cn(
        "flex gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0",
        !notification.read && "bg-sidebar-accent/30"
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
    </div>
  );
}
