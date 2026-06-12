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
} from "lucide-react";
import { getMonthlyDigest } from "@/lib/data/digest";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/ui/stat";
import { SectionHeader } from "@/components/ui/section-header";
import { PrintButton } from "@/components/trasparenza/print-button";
import { Crest } from "@/components/brand/crest";
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

      {/* Testata visibile solo in stampa: il PDF si presenta da solo. */}
      <div className="hidden items-center gap-3 border-b border-border pb-4 print:flex">
        <Crest className="h-10 w-auto" />
        <div>
          <p className="text-lg font-bold leading-tight">
            Pistoia — Report civico · {period}
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

      <div className="grid gap-5 lg:grid-cols-2 print:grid-cols-2">
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
