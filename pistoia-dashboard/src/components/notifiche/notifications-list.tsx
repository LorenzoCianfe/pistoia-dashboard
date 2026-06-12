"use client";

import { useMemo, useState, useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Vote,
  HardHat,
  Bell,
  Check,
  CheckCheck,
  Megaphone,
  Lightbulb,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/notifications";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { accent } from "@/lib/colors";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/lib/data/notifiche";

const TYPE: Record<string, { icon: LucideIcon; color: string; label: string }> =
  {
    answer: { icon: MessageCircle, color: "teal", label: "Risposte" },
    poll: { icon: Vote, color: "viola", label: "Sondaggi" },
    opera: { icon: HardHat, color: "amber", label: "Cantieri" },
    report: { icon: Megaphone, color: "amber", label: "Segnalazioni" },
    proposal: { icon: Lightbulb, color: "green", label: "Proposte" },
    verification: { icon: BadgeCheck, color: "teal", label: "Profilo" },
    system: { icon: Bell, color: "green", label: "Comune" },
  };

const DAY = 24 * 60 * 60 * 1000;

/** Bucket temporale: il raggruppamento rende scansionabile la lista. */
function bucketOf(createdAt: Date, now: number): string {
  const age = now - new Date(createdAt).getTime();
  if (age < DAY) return "Oggi";
  if (age < 7 * DAY) return "Questa settimana";
  return "Più vecchie";
}

export function NotificationsList({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<string | null>(null);
  // Istante di riferimento per i bucket, fissato al mount (richiesto dalla
  // purezza del render: Date.now() non può vivere nello useMemo).
  const [now] = useState(() => Date.now());
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

  // Chip solo per i temi davvero presenti nella lista.
  const presentLabels = useMemo(() => {
    const seen = new Set<string>();
    for (const n of items) seen.add((TYPE[n.type] ?? TYPE.system).label);
    return [...seen];
  }, [items]);

  const filtered = filter
    ? items.filter((n) => (TYPE[n.type] ?? TYPE.system).label === filter)
    : items;

  // Raggruppamento per recency, stabile rispetto all'ordine originale.
  const groups = useMemo(() => {
    const map = new Map<string, NotificationItem[]>();
    for (const n of filtered) {
      const key = bucketOf(n.createdAt, now);
      const list = map.get(key) ?? [];
      list.push(n);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [filtered, now]);

  function markOne(n: NotificationItem) {
    startTransition(async () => {
      addOptimistic({ type: "one", id: n.id });
      await markNotificationReadAction(n.id);
    });
  }

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
    <div className="space-y-4">
      {/* Filtri per tema: appaiono solo se c'è più di un tema. */}
      {presentLabels.length > 1 ? (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filtra le notifiche per tema"
        >
          <FilterChip active={filter === null} onClick={() => setFilter(null)}>
            Tutte
          </FilterChip>
          {presentLabels.map((label) => (
            <FilterChip
              key={label}
              active={filter === label}
              onClick={() => setFilter(filter === label ? null : label)}
            >
              {label}
            </FilterChip>
          ))}
        </div>
      ) : null}

      <Card className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <p className="text-sm text-muted" aria-live="polite">
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

        {filtered.length === 0 ? (
          <EmptyState
            compact
            className="m-5 border-0"
            title={
              filter ? `Nessuna notifica su «${filter}»` : "Nessuna notifica per ora"
            }
            description="Quando il Comune risponde o succede qualcosa nei tuoi temi, lo trovi qui."
          />
        ) : (
          groups.map(([label, list]) => (
            <section key={label} aria-label={label}>
              <h2 className="border-b border-border bg-surface-2/50 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {label}
              </h2>
              <ul className="divide-y divide-border">
                {list.map((n) => {
                  const t = TYPE[n.type] ?? TYPE.system;
                  const Icon = t.icon;
                  const a = accent(t.color);
                  return (
                    <li key={n.id} className="group/riga relative flex">
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
                      {/* Azione rapida inline: letta senza aprire. */}
                      {!n.read ? (
                        <button
                          type="button"
                          onClick={() => markOne(n)}
                          disabled={pending}
                          aria-label={`Segna come letta: ${n.title}`}
                          title="Segna come letta"
                          className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-2 opacity-0 transition-opacity hover:bg-surface-3 hover:text-foreground focus-visible:opacity-100 group-hover/riga:opacity-100"
                        >
                          <Check size={15} />
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </Card>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-transparent bg-foreground text-bg"
          : "border-border-strong bg-surface text-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
