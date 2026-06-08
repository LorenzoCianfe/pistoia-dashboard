"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Vote,
  HardHat,
  Bell,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications";
import { Card } from "@/components/ui/card";
import { accent } from "@/lib/colors";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/lib/data/notifiche";

const TYPE: Record<string, { icon: LucideIcon; color: string }> = {
  answer: { icon: MessageCircle, color: "teal" },
  poll: { icon: Vote, color: "viola" },
  opera: { icon: HardHat, color: "amber" },
  system: { icon: Bell, color: "green" },
};

export function NotificationsList({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, addOptimistic] = useOptimistic(
    notifications,
    (
      list,
      action: { type: "one"; id: string } | { type: "all" },
    ): NotificationItem[] =>
      action.type === "all"
        ? list.map((n) => ({ ...n, read: true }))
        : list.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
  );
  const unread = items.filter((n) => !n.read).length;

  function open(n: NotificationItem) {
    startTransition(async () => {
      if (!n.read) {
        addOptimistic({ type: "one", id: n.id });
        await markNotificationReadAction(n.id);
      }
      if (n.href) router.push(n.href);
    });
  }

  function markAll() {
    startTransition(async () => {
      addOptimistic({ type: "all" });
      await markAllNotificationsReadAction();
    });
  }

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <p className="text-sm text-muted">
          {unread > 0 ? `${unread} non lette` : "Tutto letto"}
        </p>
        <button
          type="button"
          onClick={markAll}
          disabled={pending || unread === 0}
          className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-medium text-teal transition-colors hover:bg-teal-soft disabled:opacity-40"
        >
          <CheckCheck size={16} />
          Segna tutte come lette
        </button>
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-muted">
          Nessuna notifica per ora.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((n) => {
            const t = TYPE[n.type] ?? TYPE.system;
            const Icon = t.icon;
            const a = accent(t.color);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={cn(
                    "flex w-full items-start gap-3.5 px-5 py-4 text-left transition-colors hover:bg-surface-2/60",
                    !n.read && "bg-teal-soft/30",
                  )}
                >
                  <span
                    className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full"
                    style={{ backgroundColor: a.soft, color: a.fg }}
                  >
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold leading-snug">
                      {n.title}
                      {!n.read ? (
                        <span className="size-2 shrink-0 rounded-full bg-teal" />
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                    <p
                      className="mt-1 text-xs text-muted-2"
                      suppressHydrationWarning
                    >
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
