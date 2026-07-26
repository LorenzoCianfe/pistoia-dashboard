import type { Metadata } from "next";
import { MapPinned, Map as MapIcon, CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getNeighborhoodsWithCounts } from "@/lib/data/neighborhoods";
import { getPublishedEvents } from "@/lib/data/events";
import { SectionHeader } from "@/components/ui/section-header";
import { HubNow, HubSections, type HubSection } from "@/components/app/hub";
import { formatConteggio, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Territorio",
  description:
    "Pistoia vista dallo spazio e dal tempo: la mappa, i quartieri e cosa succede in città nei prossimi giorni.",
};

/*
  Pagina-contenitore del territorio (Fase A, A-2).

  Mette insieme le tre letture dello stesso oggetto — la città — che prima
  erano tre voci di pari livello nella barra laterale: dove sta una cosa
  (mappa), a chi appartiene un'area (quartieri), quando succede (eventi).

  La mappa in particolare non era una sezione ma una *vista*: 41 righe di
  contenitore attorno al componente Leaflet, che disegna i dati di segnalazioni,
  opere, eventi e avvisi. Come voce di primo livello prometteva un contenuto
  proprio che non ha.
*/

export default async function TerritorioPage() {
  const user = await requireUser();

  const [neighborhoods, events] = await Promise.all([
    getNeighborhoodsWithCounts(user.id),
    getPublishedEvents(user.id),
  ]);

  // `getPublishedEvents` separa già passato e futuro, e lo fa sulla data di
  // FINE: un evento iniziato ieri e che dura tre giorni è ancora in corso.
  const prossimi = events.upcoming.length;

  const sections: HubSection[] = [
    {
      href: "/mappa",
      label: "Mappa",
      description:
        "Tutto quello che ha una posizione: opere, segnalazioni, eventi, avvisi, uffici, scuole, verde.",
      icon: MapIcon,
      status: "Layer attivabili uno per uno",
    },
    {
      href: "/quartieri",
      label: "Quartieri",
      description:
        "Ogni area con le sue segnalazioni, opere, proposte e discussioni. Seguine uno per restare aggiornato.",
      icon: MapPinned,
      status: formatConteggio(neighborhoods.length, "quartiere", "quartieri"),
    },
    {
      href: "/eventi",
      label: "Eventi",
      description:
        "Il calendario del Comune e delle associazioni del territorio, mese per mese.",
      icon: CalendarDays,
      status:
        prossimi > 0 ? `${formatNumber(prossimi)} in arrivo` : "Nessuno in programma",
    },
  ];

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Territorio"
        title="Il territorio di Pistoia"
        description="La stessa città vista in tre modi: dove stanno le cose, a quale quartiere appartengono, e quando succedono."
        icon={<MapPinned size={26} />}
      />

      <HubNow
        stats={[
          {
            value: formatNumber(neighborhoods.length),
            label: "quartieri",
            href: "/quartieri",
          },
          {
            value: formatNumber(prossimi),
            label: "eventi in arrivo",
            href: "/eventi",
          },
          {
            value: formatNumber(
              neighborhoods.reduce((tot, n) => tot + n.segnalazioni.conteggiabili, 0),
            ),
            label: "segnalazioni sul territorio",
            href: "/mappa",
          },
        ]}
      />

      <HubSections sections={sections} />
    </div>
  );
}
