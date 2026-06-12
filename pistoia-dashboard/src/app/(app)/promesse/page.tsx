import type { Metadata } from "next";
import Link from "next/link";
import { Target, ArrowRight, CalendarClock } from "lucide-react";
import { getCommitments, type CommitmentItem } from "@/lib/data/transparency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import {
  commitmentStatus,
  COMMITMENT_STATUS,
  COMMITMENT_STATUS_ORDER,
} from "@/lib/transparency";
import { accent } from "@/lib/colors";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Promesse e risultati",
  description:
    "Il tracker pubblico degli impegni del Comune: promesso, in corso, completato — o rimandato, con il perché.",
};

/*
  "Promesse e risultati" (A1 §30, O3): accountability leggibile. Gli impegni
  sono raggruppati per stato (prima ciò che si muove) e ogni scheda dichiara
  origine, scadenza comunicata e ultima nota di aggiornamento.
*/

function CommitmentCard({ c }: { c: CommitmentItem }) {
  const st = commitmentStatus(c.status);
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge color={st.color}>{st.label}</Badge>
        {c.sourceLabel ? (
          <span className="text-xs text-muted-2">Nasce da: {c.sourceLabel}</span>
        ) : null}
        <span className="ml-auto text-xs text-muted-2" suppressHydrationWarning>
          promesso il {formatDate(c.promisedAt)}
        </span>
      </div>
      <h3 className="text-base font-bold tracking-tight">{c.title}</h3>
      <p className="text-sm leading-relaxed text-muted">{c.description}</p>
      {c.statusNote ? (
        <p className="rounded-[var(--radius-sm)] bg-surface-2/60 px-3.5 py-2.5 text-sm leading-relaxed">
          {c.statusNote}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {c.dueLabel ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
            <CalendarClock size={13} aria-hidden />
            {c.dueLabel}
          </span>
        ) : null}
        {c.href ? (
          <Link
            href={c.href}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
          >
            Segui l&apos;avanzamento
            <ArrowRight size={15} aria-hidden />
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

export default async function PromessePage() {
  const commitments = await getCommitments();
  const byStatus = (s: string) => commitments.filter((c) => c.status === s);
  const done = byStatus("completato").length;

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Promesse e risultati"
        description="Il ciclo completo tra ascolto e risultato: ogni impegno pubblico del Comune con il suo stato reale — anche quando è «rimandato» o «non fattibile», con il perché."
        icon={<Target size={26} />}
      />

      {/* Riepilogo a colpo d'occhio */}
      <div className="flex flex-wrap gap-2">
        {COMMITMENT_STATUS_ORDER.map((s) => {
          const n = byStatus(s).length;
          if (n === 0) return null;
          const meta = COMMITMENT_STATUS[s];
          return (
            <span
              key={s}
              className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1.5 text-xs font-semibold"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: accent(meta.color).fg }}
                aria-hidden
              />
              {meta.label}: {n}
            </span>
          );
        })}
        {commitments.length > 0 ? (
          <span className="inline-flex items-center rounded-pill bg-surface-2 px-3 py-1.5 text-xs text-muted">
            {done} su {commitments.length} completati
          </span>
        ) : null}
      </div>

      {commitments.length === 0 ? (
        <EmptyState
          title="Nessun impegno tracciato"
          description="Quando il Comune assumerà impegni pubblici, qui ne vedrai lo stato passo passo."
        />
      ) : (
        <div className="space-y-8">
          {COMMITMENT_STATUS_ORDER.map((s) => {
            const group = byStatus(s);
            if (group.length === 0) return null;
            const meta = COMMITMENT_STATUS[s];
            return (
              <section key={s} aria-labelledby={`promesse-${s}`}>
                <h2
                  id={`promesse-${s}`}
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-2"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: accent(meta.color).fg }}
                    aria-hidden
                  />
                  {meta.label}
                </h2>
                <div className="mt-3 space-y-4 stagger">
                  {group.map((c) => (
                    <CommitmentCard key={c.id} c={c} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          Impegni <strong>dimostrativi</strong>: in una versione reale questa
          pagina traccerebbe il programma di mandato e gli impegni presi in
          Consiglio, con aggiornamenti firmati dagli uffici.
        </p>
      </Card>
    </div>
  );
}
