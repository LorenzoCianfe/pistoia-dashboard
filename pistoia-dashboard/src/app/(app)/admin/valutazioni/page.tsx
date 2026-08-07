import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin } from "@/lib/data/admin";
import { getRecensioniRecenti } from "@/lib/data/valutazioni";
import { ControlliRecensione } from "@/components/valutazioni/controlli-staff";
import { StarRating } from "@/components/ui/star-rating";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";

export const metadata: Metadata = { title: "Valutazioni · Area Comune" };

/*
  R-4, forma A2: il posto di lavoro del Comune sulle valutazioni.

  Rispondere e segnalare sì; rimuovere no — rimuove solo la redazione, e le
  azioni di rimozione rifiutano gli account del Comune.

  ⚠️ **La lista è troncata a sei e il contatore no**, ed è la ragione per cui il
  contatore serve: prenderlo dalla lista sarebbe la trappola 2 dell'ondata 7
  (`AGENTS.md` §3) e darebbe un tetto di sei a un numero che tetti non ne ha.

  Misurato il 2026-08-07, al primo caricamento: **32 senza risposta contro 6 in
  pagina.** Il numero non è un dettaglio del seed, è un buco che nessuno vedeva
  finché nessuno contava — le altre 26 non sono raggiungibili da qui. Il rimedio
  è lo stesso delle altre code lunghe (lista + dettaglio, `docs/piano-admin.md`
  §6) e non si fa dentro il taglio; finché non arriva, la pagina **dice** che
  mostra le più recenti, invece di lasciar credere che siano tutte.
*/
export default async function ValutazioniAdminPage() {
  await requireAdmin();
  const [contatori, recensioni] = await Promise.all([
    getContatoriAdmin(),
    getRecensioniRecenti(),
  ]);

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Riservato al Comune"
        title="Valutazioni dei servizi"
        description="Le ultime recensioni con parole: rispondi alla singola o segnala alla redazione. Il quadro del mese si risponde dalla scheda del servizio."
        icon={<Star size={22} className="text-teal" />}
      />

      <NavAdmin contatori={contatori} />

      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Star size={18} className="text-teal" aria-hidden />
            Le più recenti
          </h2>
          <p className="text-xs text-muted-2">
            {contatori.valutazioni === 0
              ? "Nessuna senza risposta"
              : `${contatori.valutazioni} senza risposta in tutto`}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted">
          Qui compaiono le ultime scritte, non tutte. Rimuovere non si può da
          qui: rimuove solo la redazione.
        </p>
        {recensioni.length === 0 ? (
          <p className="mt-4 border-t border-border pt-3 text-sm text-muted">
            Nessuna recensione scritta, ancora: i voti senza testo non hanno
            niente a cui rispondere.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {recensioni.map((r) => (
              <li key={r.id} className="border-t border-border pt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <Link
                      href={`/valutazioni/${r.servizioId}`}
                      className="font-semibold hover:underline"
                    >
                      {r.servizio}
                    </Link>
                    <StarRating value={r.stelle} size={12} />
                    <span className="text-muted">{r.autore}</span>
                  </p>
                  <p className="text-xs text-muted-2">
                    <time dateTime={r.quando.toISOString()}>
                      {r.quando.toLocaleDateString("it-IT", {
                        day: "numeric",
                        month: "long",
                      })}
                    </time>
                  </p>
                </div>
                {r.testo ? (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    «{r.testo}»
                  </p>
                ) : null}
                <ControlliRecensione
                  valutazioneId={r.id}
                  segnalata={r.segnalata}
                  haRisposta={r.haRisposta}
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
