import type { Metadata } from "next";
import { Star } from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { getContatoriAdmin, getValutazioniDaEsaminare } from "@/lib/data/admin";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { NavAdmin } from "@/components/admin/nav-admin";
import { ListaValutazioni } from "@/components/admin/liste-code";

export const metadata: Metadata = { title: "Valutazioni · Area Comune" };

/*
  R-4, forma A2: il posto di lavoro del Comune sulle valutazioni.

  Rispondere e segnalare sì; rimuovere no — rimuove solo la redazione, e le
  azioni di rimozione rifiutano gli account del Comune.

  ⚠️ **Qui il taglio del 2026-08-07 ha lasciato un buco vero, non un'altezza.**
  La pagina chiamava `getRecensioniRecenti()`, che tronca a sei, mentre il
  contatore chiedeva al database e diceva **32**: le altre 26 non erano
  raggiungibili da nessuna parte dell'applicazione. Adesso lista e contatore
  fanno **la stessa domanda** (`VALUTAZIONE_DA_ESAMINARE`), quindi non possono
  più divergere — ed è la ragione per cui `lib/data/admin.ts` tiene le
  condizioni in costanti condivise invece di ricopiarle.
*/
export default async function ValutazioniAdminPage() {
  await requireAdmin();
  const [contatori, recensioni] = await Promise.all([
    getContatoriAdmin(),
    getValutazioniDaEsaminare(),
  ]);

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
        <p className="mb-3 text-sm text-muted">
          {recensioni.length === 0
            ? "Niente in coda: i voti senza parole non hanno niente a cui rispondere."
            : `${recensioni.length} senza risposta, dalla più recente. Aprine una per rispondere. Rimuovere non si può da qui: rimuove solo la redazione.`}
        </p>
        <ListaValutazioni voci={recensioni} />
      </Card>
    </div>
  );
}
