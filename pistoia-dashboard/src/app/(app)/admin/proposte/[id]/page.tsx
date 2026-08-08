import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import {
  getContatoriAdmin,
  getPropostaDaValutare,
  getProposteDaValutare,
} from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import {
  CodaConDettaglio,
  FuoriDallaCoda,
  TornaAllaCoda,
} from "@/components/admin/coda";
import { ListaProposte } from "@/components/admin/liste-code";
import { RevisioneProposta } from "@/components/admin/proposal-review";
import { proposalStatus } from "@/lib/community";
import { formatDate, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Proposta · Area Comune" };

/*
  La valutazione di UNA proposta.

  ⚠️ **Il problema e il testo della proposta compaiono qui per la prima volta.**
  La coda mostrava il solo titolo, e sotto ci metteva il modulo che decide se la
  proposta si fa: si giudicava un titolo. È la stessa asimmetria della
  descrizione delle segnalazioni, e la ragione per cui la gerarchia di questa
  pagina mette **il merito prima del macchinario**.
*/
export default async function PropostaAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [contatori, coda, voce] = await Promise.all([
    getContatoriAdmin(),
    getProposteDaValutare(),
    getPropostaDaValutare(id),
  ]);
  if (!voce) notFound();

  const stato = proposalStatus(voce.status);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Proposte cittadine"
        description="Le proposte ordinate per sostegno: aggiorna lo stato e rispondi ufficialmente."
        icon={<Lightbulb size={22} className="text-teal" />}
      />

      <NavAdmin contatori={contatori} />

      <Card>
        <CodaConDettaglio lista={<ListaProposte voci={coda} attivo={voce.id} />}>
          <TornaAllaCoda href="/admin/proposte" testo="Tutte le proposte" />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge color={stato.color}>{stato.label}</Badge>
            <span className="text-xs font-semibold tabular-nums">
              {formatNumber(voce.supports)} sostegni
            </span>
            {voce.quartiere ? (
              <span className="text-xs text-muted-2">· {voce.quartiere}</span>
            ) : null}
          </div>

          <h2 className="mt-1.5 text-lg font-semibold leading-snug">
            {voce.title}
          </h2>

          {voce.problema ? (
            <div className="mt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                Il problema
              </p>
              <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-muted">
                {voce.problema}
              </p>
            </div>
          ) : null}

          <div className="mt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-2">
              La proposta
            </p>
            <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-muted">
              {voce.descrizione}
            </p>
          </div>

          <p className="mt-2 text-xs text-muted-2">
            Proposta il {formatDate(voce.createdAt)} da {voce.autore}
          </p>

          {voce.rispostaCorrente ? (
            <div className="mt-3 rounded-[var(--radius-sm)] border border-border bg-surface-2/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                Risposta già pubblicata
              </p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted">
                {voce.rispostaCorrente}
              </p>
            </div>
          ) : null}

          <p className="mt-1 text-xs">
            <Link
              href={`/proposte/${voce.id}`}
              className="inline-flex min-h-11 items-center gap-1 text-teal hover:underline"
            >
              Apri la scheda pubblica
              <ArrowUpRight size={13} aria-hidden />
            </Link>
          </p>

          {/* Come sulle segnalazioni: la coda ce l'abbiamo già in pagina. */}
          {!coda.some((v) => v.id === voce.id) ? (
            <FuoriDallaCoda>
              Questa proposta è <strong>{stato.label.toLowerCase()}</strong>: è
              uscita dalla coda, e resta modificabile da qui.
            </FuoriDallaCoda>
          ) : null}

          <RevisioneProposta
            item={{
              id: voce.id,
              status: voce.status,
              estimatedImpact: voce.estimatedImpact,
              estimatedCost: voce.estimatedCost,
              estimatedTime: voce.estimatedTime,
              feasibility: voce.feasibility,
            }}
          />
        </CodaConDettaglio>
      </Card>
    </div>
  );
}
