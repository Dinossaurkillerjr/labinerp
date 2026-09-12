"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationItem } from "@/components/common/notification-item";
import { EmptyState } from "@/components/common/empty-state";
import { useUI } from "@/components/providers/ui-provider";
import { useTasks } from "@/lib/tasks/tasks-provider";
import { deriveTaskNotifications } from "@/lib/tasks/notifications";

function nowMs(): number {
  return Date.now();
}

export function NotificationsMenu() {
  const { notifications, markAllNotificationsRead } = useUI();
  const { tasks } = useTasks();

  const taskNotifications = React.useMemo(() => {
    const now = nowMs();
    const today = new Date(now).toISOString().slice(0, 10);
    return deriveTaskNotifications(tasks, today, now);
  }, [tasks]);

  const allNotifications = [...taskNotifications, ...notifications];
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute top-1 right-1 flex size-3.5 items-center justify-center rounded-full bg-electric-blue text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-body font-medium text-foreground">Notificações</span>
          {notifications.some((n) => !n.read) ? (
            <button
              onClick={markAllNotificationsRead}
              className="text-caption text-electric-blue hover:underline"
            >
              Marcar todas como lidas
            </button>
          ) : null}
        </div>
        {allNotifications.length === 0 ? (
          <EmptyState
            className="border-0 py-8"
            title="Sem notificações"
            description="Você está em dia."
          />
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {allNotifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
