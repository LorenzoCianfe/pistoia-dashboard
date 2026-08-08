import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import {
  getContatoriAdmin,
  getValutazioneDaEsaminare,
  getValutazioniDaEsaminare,
} from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import {
  CodaConDettaglio,
  FuoriDallaCoda,
  TornaAllaCoda,
} from "@/components/admin/coda";
import { ListaValutazioni } from "@/components/admin/liste-code";
import { ControlliRecensione } from "@/components/valutazioni/controlli-staff";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Recensione · Area Comune" };

/** La risposta a UNA recensione (R-4, forma A2). */
export default async function ValutazioneAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [contatori, coda, voce] = await Promise.all([
    getContatoriAdmin(),
    getValutazioniDaEsaminare(),
    getValutazioneDaEsaminare(id),
  ]);
  if (!voce) notFound();

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Valutazioni dei servizi"
        description="Le recensioni con parole che aspettano il Comune: rispondi alla singola o segnala alla redazione. Il quadro del mese si risponde dalla scheda del servizio."
        icon={<Star size={22} className="text-teal" />}
      />

      <NavAdmin contatori={contatori} />

      <Card>
        <CodaConDettaglio
          lista={<ListaValutazioni voci={coda} attivo={voce.id} />}
        >
          <TornaAllaCoda href="/admin/valutazioni" testo="Tutte le recensioni" />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StarRating value={voce.stelle} size={14} />
            <span className="text-sm font-semibold">{voce.servizio}</span>
            <span className="text-xs text-muted-2">
              {voce.autore} · {formatDate(voce.quando)}
            </span>
          </div>

          {voce.testo ? (
            <p className="mt-2 whitespace-pre-line text-base leading-relaxed">
              «{voce.testo}»
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Un voto senza parole: non c&apos;è niente a cui rispondere.
            </p>
          )}

          <p className="mt-1 text-xs">
            <Link
              href={`/valutazioni/${voce.servizioId}`}
              className="inline-flex min-h-11 items-center gap-1 text-teal hover:underline"
            >
              Apri la scheda del servizio
              <ArrowUpRight size={13} aria-hidden />
            </Link>
          </p>

          {/* Come sulle altre code: si chiede alla lista, non a una seconda
              copia di `VALUTAZIONE_DA_ESAMINARE`. */}
          {!coda.some((v) => v.id === voce.id) ? (
            <FuoriDallaCoda>
              {voce.rimossa
                ? "Questa recensione è stata rimossa dalla redazione."
                : voce.segnalata
                  ? "Già segnalata alla redazione: resta pubblicata finché non decide, ed è uscita dalla coda."
                  : "Il Comune ha già risposto: è uscita dalla coda."}
            </FuoriDallaCoda>
          ) : null}

          {/*
            Rimuovere non si può da qui, per costruzione: queste azioni non lo
            sanno fare, e quelle che lo sanno fare (`actions/redazione.ts`)
            rifiutano gli account del Comune. È il cancello della fase R-4.
          */}
          <ControlliRecensione
            valutazioneId={voce.id}
            segnalata={voce.segnalata}
            haRisposta={voce.haRisposta}
          />
        </CodaConDettaglio>
      </Card>
    </div>
  );
}
