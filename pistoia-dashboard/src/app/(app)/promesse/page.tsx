import type { Metadata } from "next";
import Link from "next/link";
import { Target, ArrowRight, CalendarClock } from "lucide-react";
import { getCommitments, type CommitmentItem } from "@/lib/data/transparency";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { DisplayNumber } from "@/components/signature/display-number";
import {
  commitmentStatus,
  COMMITMENT_STATUS,
  COMMITMENT_STATUS_ORDER,
} from "@/lib/transparency";
import { campioneSufficiente } from "@/lib/citystats";
import { accent } from "@/lib/colors";
import { formatDate, formatNumber } from "@/lib/format";

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
  const inCorso = byStatus("in_corso").length;
  const fermi = byStatus("rimandato").length + byStatus("non_fattibile").length;

  /*
    Niente scala a tacche, e la ragione vale la riga. L'intervallo 0→tracciati
    è aritmeticamente vero — non puoi completarne più di quanti ne hai presi —
    ma NON è un traguardo: nessuno ha promesso che tutti e sei fossero fatti
    oggi, e due sono in corso e uno appena assunto. La tacca attiva a un sesto
    della scala si legge come «non avete fatto quasi niente», che è una
    conclusione, non il dato. È la stessa distinzione del «Dossier persona»
    (ROADMAP.md §6): si riporta il record, non se ne inferisce un voto.

    Resta invece la regola del campione minimo (`lib/citystats.ts`), applicata
    a ciò che la pagina DICE del numero: sotto soglia il conteggio è esatto ma
    non regge una lettura d'insieme, e la pagina lo dichiara invece di lasciare
    che il lettore la tragga.
  */
  const campioneRegge = campioneSufficiente(commitments.length);

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Promesse e risultati"
        description="Il ciclo completo tra ascolto e risultato: ogni impegno pubblico del Comune con il suo stato reale — anche quando è «rimandato» o «non fattibile», con il perché."
        icon={<Target size={26} />}
      />

      {/*
        L'apertura che mancava: la pagina partiva dalle pastiglie di riepilogo,
        cioè da cinque numeri di pari peso, e nessuno dei cinque è la domanda
        che si porta qui chi arriva — «di quello che avevate promesso, quanto
        avete fatto?».

        La cifra è un CONTEGGIO e non una percentuale, di proposito. «Il 43%
        delle promesse è stato mantenuto» somiglia a un voto, e lo darebbe
        contando come mancato anche un impegno preso la settimana scorsa: il
        denominatore include tutto ciò che è ancora in corso. Il conteggio dice
        un fatto verificabile, e la frase sotto rende conto del resto senza
        chiamarlo fallimento.
      */}
      {commitments.length > 0 ? (
        <Card>
          <DisplayNumber
            value={done}
            unit={done === 1 ? "impegno" : "impegni"}
            label="Portati a termine"
          />
          <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
            su {formatNumber(commitments.length)}{" "}
            {commitments.length === 1 ? "impegno tracciato" : "impegni tracciati"}
            {inCorso > 0 ? (
              <>
                {" · "}
                <span className="font-semibold text-teal">
                  {formatNumber(inCorso)}
                </span>{" "}
                {inCorso === 1 ? "è in corso" : "sono in corso"}
              </>
            ) : null}
            {fermi > 0 ? (
              <>
                {" · "}
                {formatNumber(fermi)}{" "}
                {fermi === 1
                  ? "è rimandato o dichiarato non fattibile"
                  : "sono rimandati o dichiarati non fattibili"}
                , con il motivo scritto nella scheda
              </>
            ) : null}
            .
            {!campioneRegge ? (
              <>
                {" "}
                Gli impegni tracciati sono ancora pochi: il conteggio è esatto,
                ma non basta a dire come sta andando il mandato.
              </>
            ) : null}
          </p>
        </Card>
      ) : null}

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
        {/*
          La pastiglia «{done} su {total} completati» viveva qui: ora la dice la
          cifra display in apertura, più grande e con il resto del quadro
          accanto. Ripeterla a 12px darebbe due protagonisti allo stesso numero
          (DESIGN.md §12) — le pastiglie restano la ripartizione per stato, che
          è un'altra informazione.
        */}
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
