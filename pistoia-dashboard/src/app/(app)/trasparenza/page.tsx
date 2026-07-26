import type { Metadata } from "next";
import { Landmark, Wallet, HardHat, Target, Newspaper } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { getCityState } from "@/lib/data/citystate";
import { getDecisions, getCommitments } from "@/lib/data/transparency";
import { SectionHeader } from "@/components/ui/section-header";
import { HubNow, HubSections, type HubSection } from "@/components/app/hub";
import { formatConteggio, formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Trasparenza",
  description:
    "Come va la città: dove vanno i soldi, a che punto sono i cantieri, cosa è stato deciso e cosa è stato promesso.",
};

/*
  Pagina-contenitore della trasparenza (Fase A, A-2).

  Il titolo della pagina è la domanda in chiaro — «Come va la città» — mentre
  l'etichetta nel menu è «Trasparenza»: in una scheda della barra in basso,
  a 375px di larghezza, la domanda per esteso non ci sta. Il nome breve è
  quello che il prodotto già usava come titolo di gruppo, quindi non introduce
  vocabolario nuovo. (Vedi `docs/piano-esecuzione-fase-a.md`, §Nomi.)

  Le cifre vengono da `getCityState()`: è la stessa sorgente de "La mia città",
  quindi le due pagine non possono dire due percentuali diverse della stessa
  città.
*/

export default async function TrasparenzaPage() {
  await requireUser();
  const [state, decisions, commitments] = await Promise.all([
    getCityState(),
    getDecisions(),
    getCommitments(),
  ]);

  const tasso = state.reports.resolvedRate;

  return (
    <div className="space-y-6 page-enter">
      <SectionHeader
        eyebrow="Trasparenza"
        title="Come va la città"
        description="Dove vanno i soldi, a che punto sono i cantieri, cosa è stato deciso e cosa era stato promesso. Ogni numero porta con sé come è stato calcolato."
        icon={<Landmark size={26} />}
      />

      <HubNow
        stats={[
          {
            value: `${formatNumber(state.opere.inCorso)}`,
            label: "cantieri in corso",
            href: "/opere",
          },
          {
            // `resolvedRate` è `null` con zero segnalazioni: in quel caso non
            // è "0%", è un dato che non esiste, e non va mostrato come cifra.
            value: tasso === null ? "—" : `${tasso}%`,
            label: "segnalazioni risolte",
            href: "/segnalazioni",
          },
          {
            value: formatNumber(commitments.length),
            label: "impegni tracciati",
            href: "/promesse",
          },
        ]}
      />

      <HubSections
        sections={
          [
            {
              href: "/bilancio",
              label: "Bilancio",
              description:
                "Dove vengono programmate e spese le risorse del Comune, spiegate parola per parola.",
              icon: Wallet,
              status: "Bilancio 2026",
            },
            {
              href: "/opere",
              label: "Opere",
              description:
                "I cantieri aperti, il lavoro fatto contro il tempo passato, e chi ne risponde.",
              icon: HardHat,
              status: `${formatNumber(state.opere.inCorso)} in corso · avanzamento medio ${state.opere.avgProgress}%`,
            },
            {
              href: "/decisioni",
              label: "Decisioni",
              description:
                "L'archivio delle scelte dell'amministrazione, con l'esito e il motivo in linguaggio semplice.",
              icon: Landmark,
              status: formatConteggio(
                decisions.length,
                "decisione pubblicata",
                "decisioni pubblicate",
              ),
            },
            {
              href: "/promesse",
              label: "Promesse",
              description:
                "Gli impegni presi, il loro stato e la scadenza. Anche quando la scadenza è passata.",
              icon: Target,
              status: formatConteggio(
                commitments.length,
                "impegno tracciato",
                "impegni tracciati",
              ),
            },
            {
              href: "/digest",
              label: "Report del mese",
              description:
                "Il riepilogo degli ultimi 30 giorni, calcolato dai dati e scaricabile in PDF.",
              icon: Newspaper,
              status: null,
            },
          ] satisfies HubSection[]
        }
      />
    </div>
  );
}
