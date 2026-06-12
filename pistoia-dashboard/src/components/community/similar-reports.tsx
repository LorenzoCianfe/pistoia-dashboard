"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Users, Check } from "lucide-react";
import { confirmReportAction } from "@/app/actions/reports";
import { reportStatus } from "@/lib/community";
import { accent } from "@/lib/colors";
import { formatRelativeTime } from "@/lib/format";
import type { SimilarReport } from "@/lib/data/reports";

/*
  Anti-duplicati (A1 §2): mentre il cittadino sceglie categoria e zona,
  suggeriamo le segnalazioni aperte simili. "Anche io" pesa più di un
  doppione: un click e la segnalazione esistente guadagna priorità.
*/
export function SimilarReports({
  category,
  neighborhoodId,
}: {
  category: string | null;
  neighborhoodId: string | null;
}) {
  // I risultati portano la chiave con cui sono stati cercati: se la selezione
  // cambia, quelli vecchi spariscono in render senza reset negli effect.
  const [fetched, setFetched] = useState<{
    key: string;
    items: SimilarReport[];
  } | null>(null);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const key = category ? `${category}:${neighborhoodId ?? ""}` : null;
  const results = fetched && fetched.key === key ? fetched.items : [];

  useEffect(() => {
    if (!category || !key) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ categoria: category });
        if (neighborhoodId) params.set("quartiere", neighborhoodId);
        const res = await fetch(`/api/segnalazioni/simili?${params}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`simili ${res.status}`);
        const data = (await res.json()) as { results: SimilarReport[] };
        setFetched({ key, items: data.results });
      } catch {
        if (!ctrl.signal.aborted) setFetched({ key, items: [] });
      }
    }, 250);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [category, neighborhoodId, key]);

  if (!category || results.length === 0) return null;

  function alsoMe(id: string) {
    startTransition(async () => {
      const res = await confirmReportAction(id);
      if (res.ok && res.confirmed) {
        setConfirmed((prev) => new Set(prev).add(id));
      }
    });
  }

  return (
    <div
      role="region"
      aria-label="Segnalazioni simili già aperte"
      className="rounded-[var(--radius-sm)] border border-[color-mix(in_oklab,var(--amber)_35%,transparent)] bg-[var(--amber-soft)]/40 p-4"
    >
      <p className="text-sm font-semibold">
        Qualcuno potrebbe averlo già segnalato
      </p>
      <p className="mt-0.5 text-xs text-muted">
        Se è lo stesso problema, un «Anche io» vale più di un doppione.
      </p>
      <ul className="mt-3 space-y-2">
        {results.map((r) => {
          const st = reportStatus(r.status);
          const mine = r.confirmedByMe || confirmed.has(r.id);
          return (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-[var(--surface)] px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/segnalazioni/${r.id}`}
                  className="block truncate text-sm font-medium hover:text-teal"
                >
                  {r.title}
                </Link>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-2">
                  <span style={{ color: accent(st.color).fg }}>{st.label}</span>
                  {r.neighborhoodName ? <span>· {r.neighborhoodName}</span> : null}
                  <span suppressHydrationWarning>
                    · {formatRelativeTime(r.createdAt)}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Users size={11} aria-hidden /> {r.confirmations}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => alsoMe(r.id)}
                disabled={mine}
                className={
                  mine
                    ? "inline-flex shrink-0 items-center gap-1 rounded-pill bg-teal-soft px-3 py-1.5 text-xs font-semibold text-teal"
                    : "inline-flex shrink-0 items-center gap-1 rounded-pill border border-border-strong px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-teal hover:text-teal"
                }
              >
                {mine ? <Check size={12} aria-hidden /> : null}
                {mine ? "Confermato" : "Anche io"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
