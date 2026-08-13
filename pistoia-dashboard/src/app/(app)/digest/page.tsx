import type { Metadata } from "next";
import Link from "next/link";
import {
  Newspaper,
  Megaphone,
  HardHat,
  Lightbulb,
  Landmark,
  CalendarDays,
  ArrowRight,
  Star,
} from "lucide-react";
import { getMonthlyDigest } from "@/lib/data/digest";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { SectionHeader } from "@/components/ui/section-header";
import { PrintButton } from "@/components/trasparenza/print-button";
import { TimbroMetodologia } from "@/components/valutazioni/timbro-metodologia";
import { Wordmark } from "@/components/brand/wordmark";
import { reportCategory, proposalStatus } from "@/lib/community";
import { decisionOutcome } from "@/lib/transparency";
import { formatDate, formatDateShort, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Report civico del mese",
  description:
    "Il riepilogo mensile della città: segnalazioni, opere, proposte, decisioni ed eventi — esportabile in PDF.",
};

/*
  Civic digest pubblico mensile (A2 §19, O3): la città in una pagina,
  calcolata dai dati della piattaforma sugli ultimi 30 giorni. L'export PDF
  è la stampa del browser su uno stile print curato (variant print: di
  Tailwind) — zero dipendenze.
*/

const monthFmt = new Intl.DateTimeFormat("it-IT", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Rome",
});

export default async function DigestPage() {
  const digest = await getMonthlyDigest();
  const period = monthFmt.format(digest.generatedAt);

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Report civico del mese"
        description={`Cosa è successo a Pistoia negli ultimi ${digest.periodDays} giorni, in una pagina. Numeri calcolati in tempo reale dai dati della piattaforma.`}
        icon={<Newspaper size={26} />}
        action={<span className="print:hidden"><PrintButton /></span>}
      />

      {/* Testata visibile solo in stampa: il PDF si presenta da solo.
          Il marchio va senza segno: il quadrato pieno in stampa è un
          rettangolo di toner che non aggiunge niente al foglio. */}
      <div className="hidden items-center gap-3 border-b border-border pb-4 print:flex">
        <div>
          <Wordmark segno={false} />
          <p className="text-lg font-bold leading-tight">
            Report civico di Pistoia · {period}
          </p>
          <p className="text-xs text-muted">
            Generato il {formatDate(digest.generatedAt)} · dati dimostrativi
          </p>
        </div>
      </div>

      {/* Colpo d'occhio */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Segnalazioni ricevute" value={formatNumber(digest.reports.received)} />
        <Stat label="Segnalazioni risolte" value={formatNumber(digest.reports.resolved)} />
        <Stat label="Nuove proposte" value={formatNumber(digest.proposals.new)} />
        <Stat label="Cantieri in corso" value={formatNumber(digest.opere.inCorso)} />
      </div>

      {/* Segnalazioni */}
      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Megaphone size={18} className="text-teal" aria-hidden />
          Segnalazioni
        </h2>
        <p className="text-sm leading-relaxed text-muted">
          {formatNumber(digest.reports.received)} ricevute e{" "}
          {formatNumber(digest.reports.resolved)} risolte nel periodo;{" "}
          {formatNumber(digest.reports.confirmedByCitizens)} risoluzioni confermate
          direttamente dai cittadini.
        </p>
        {digest.reports.topCategories.length > 0 ? (
          <p className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-medium text-muted-2">Temi più segnalati:</span>
            {digest.reports.topCategories.map((c) => (
              <Badge key={c.category} color={reportCategory(c.category).color}>
                {reportCategory(c.category).label} · {c.count}
              </Badge>
            ))}
          </p>
        ) : null}
      </Card>

      {/* Valutazioni dei servizi (R-5, forma C1): prima il dato, poi
          l'invito. La card regge lo stato a zero — che è quello vero del
          giorno uno — con la colonna dura; l'invito sparisce in stampa. Il
          blocco è CONTENUTO del report, non una sollecitazione: non tocca il
          contatore unico (decisione 2026-08-04). */}
      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Star size={18} className="text-teal" aria-hidden />
          Valutazioni dei servizi
        </h2>
        <ValutazioniDelMese v={digest.valutazioni} />
        <Link
          href="/valutazioni"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline print:hidden"
        >
          Di&apos; come sta la tua zona
          <ArrowRight size={15} aria-hidden />
        </Link>
        {/* Il colophon (B2) resta anche in stampa: un report citato senza
            versione è un report non verificabile. */}
        <TimbroMetodologia />
      </Card>

      {/* Opere */}
      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <HardHat size={18} className="text-teal" aria-hidden />
          Opere aggiornate
        </h2>
        {digest.opere.updates.length === 0 ? (
          <p className="text-sm text-muted">Nessun aggiornamento di cantiere nel periodo.</p>
        ) : (
          <ul className="divide-y divide-border">
            {digest.opere.updates.map((u) => (
              <li key={u.id} className="flex items-center gap-3 py-2.5">
                <span className="w-12 shrink-0 text-sm font-bold tabular-nums text-teal">
                  {u.progress}%
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/opere/${u.opera.id}`}
                    className="block truncate text-sm font-medium hover:text-teal"
                  >
                    {u.opera.name}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted-2">
                    {u.note} · {formatDateShort(u.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* `grid-cols-1` esplicito: senza, la traccia implicita è `auto` e il
          suo minimo è il min-content — un badge nowrap allarga la colonna
          oltre il viewport a 360px (AGENTS §3, ondata 7, trappola 5; emerso
          appena il digest è entrato in shots con R-5). */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 print:grid-cols-2">
        {/* Proposte più sostenute */}
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Lightbulb size={18} className="text-teal" aria-hidden />
            Proposte più sostenute
          </h2>
          {digest.proposals.top.length === 0 ? (
            <p className="text-sm text-muted">Nessuna proposta attiva.</p>
          ) : (
            <ul className="divide-y divide-border">
              {digest.proposals.top.map((p) => (
                <li key={p.id} className="py-2.5">
                  <Link
                    href={`/proposte/${p.id}`}
                    className="block truncate text-sm font-medium hover:text-teal"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-2">
                    {formatNumber(p.supports)} sostegni
                    <Badge color={proposalStatus(p.status).color} className="px-2 py-0.5">
                      {proposalStatus(p.status).label}
                    </Badge>
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-2">
            {formatNumber(digest.proposals.answered)} proposte hanno ricevuto risposta
            ufficiale nel periodo.
          </p>
        </Card>

        {/* Decisioni del periodo */}
        <Card className="space-y-3">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Landmark size={18} className="text-teal" aria-hidden />
            Decisioni prese
          </h2>
          {digest.decisions.length === 0 ? (
            <p className="text-sm text-muted">Nessuna decisione nel periodo.</p>
          ) : (
            <ul className="divide-y divide-border">
              {digest.decisions.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.title}</p>
                    <p className="mt-0.5 text-xs text-muted-2">{formatDateShort(d.decidedAt)}</p>
                  </div>
                  <Badge color={decisionOutcome(d.outcome).color}>
                    {decisionOutcome(d.outcome).label}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/decisioni"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline print:hidden"
          >
            Archivio completo
            <ArrowRight size={15} aria-hidden />
          </Link>
        </Card>
      </div>

      {/* Eventi in arrivo */}
      <Card className="space-y-3">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <CalendarDays size={18} className="text-teal" aria-hidden />
          Prossimi appuntamenti
        </h2>
        {digest.events.length === 0 ? (
          <p className="text-sm text-muted">Nessun evento in programma.</p>
        ) : (
          <ul className="divide-y divide-border">
            {digest.events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <span className="w-20 shrink-0 text-xs font-semibold text-muted">
                  {formatDateShort(e.startAt)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  {e.location ? (
                    <p className="mt-0.5 truncate text-xs text-muted-2">{e.location}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="bg-surface-2/40">
        <p className="text-sm text-muted">
          {formatNumber(digest.community.posts)} conversazioni in Comunità e{" "}
          {formatNumber(digest.polls.active)} sondaggi aperti nel periodo. Report
          generato il {formatDate(digest.generatedAt)} su <strong>dati
          dimostrativi</strong>: la versione reale citerebbe le fonti di ogni numero.
        </p>
      </Card>
    </div>
  );
}

/**
 * Il paragrafo delle Valutazioni: apre su ciò che si sa. Con medie le dice,
 * col campione accanto (nessuna soglia, /metodologia regola 3); se i voti del
 * periodo sono tutti sugli sportelli lo dichiara; a zero racconta la colonna
 * dura — le mediane di chiusura, mai il volume accostato alle stelle (la
 * frase cita solo i tempi, che reggono un giudizio anche su `sicurezza`).
 */
function ValutazioniDelMese({
  v,
}: {
  v: {
    entrate: number;
    condizioni: {
      id: string;
      nome: string;
      materia: string;
      media: { valore: number | null; campione: number };
      giorniMediani: number | null;
    }[];
  };
}) {
  const pubblicate = v.condizioni.filter((c) => c.media.valore != null);
  const conMediana = v.condizioni.filter((c) => c.giorniMediani != null);
  const mediane =
    conMediana.length > 0 ? (
      <>
        {" "}
        Quello che la piattaforma sa da sé c&apos;è già: le segnalazioni{" "}
        {conMediana.map((c, i) => (
          <span key={c.id}>
            {i > 0 ? (i === conMediana.length - 1 ? " e " : ", ") : ""}
            {c.materia}
            {i === 0 ? " si chiudono in " : " in "}
            <strong>{formatNumber(c.giorniMediani!)}</strong>
            {i === 0 ? (c.giorniMediani === 1 ? " giorno mediano" : " giorni mediani") : ""}
          </span>
        ))}
        .
      </>
    ) : null;

  if (pubblicate.length > 0) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Nel periodo sono entrate {formatNumber(v.entrate)} valutazioni.{" "}
        {pubblicate.map((c, i) => (
          <span key={c.id}>
            {i > 0 ? " · " : ""}
            <strong>{c.nome}</strong>: {c.media.valore!.toFixed(1).replace(".", ",")}{" "}
            su 5 da {formatNumber(c.media.campione)} voti
          </span>
        ))}
        {pubblicate.length < v.condizioni.length
          ? ". Le altre condizioni non hanno ancora voti."
          : "."}
      </p>
    );
  }

  if (v.entrate > 0) {
    return (
      <p className="text-sm leading-relaxed text-muted">
        Nel periodo sono entrate {formatNumber(v.entrate)}{" "}
        {v.entrate === 1 ? "valutazione, tutta" : "valutazioni, tutte"} sugli
        sportelli: le condizioni della città non hanno ancora voti.{mediane}
      </p>
    );
  }

  return (
    <p className="text-sm leading-relaxed text-muted">
      Le schede sono aperte e le stelle, per ora, dichiarate in attesa: la
      media compare col primo voto, insieme al numero di voti che la
      compone.{mediane}
    </p>
  );
}
