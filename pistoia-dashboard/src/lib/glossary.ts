// Glossario dei termini amministrativi (A2 §27, quick win O3).
// Contenuto redazionale statico: niente DB, niente fetch — la pagina
// /glossario e i tooltip <GlossaryTip> leggono da qui.

export type GlossaryTerm = {
  /** Chiave stabile, kebab-case. */
  slug: string;
  term: string;
  /** Definizione in linguaggio cittadino, una o due frasi. */
  definition: string;
  /** Dove capita di incontrarlo, es. "Bilancio". */
  context?: string;
};

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "avanzo",
    term: "Avanzo di bilancio",
    definition:
      "I soldi che il Comune ha incassato e non ha speso entro la fine dell'anno. Non sono \"soldi persi\": possono essere usati l'anno dopo, ad esempio per investimenti.",
    context: "Bilancio",
  },
  {
    slug: "impegni",
    term: "Impegni di spesa",
    definition:
      "La quota del bilancio che il Comune ha già \"prenotato\" con atti formali: contratti firmati, lavori affidati. Un impegno alto significa che i soldi stanziati si stanno trasformando in cose concrete.",
    context: "Bilancio",
  },
  {
    slug: "riscossione",
    term: "Riscossione",
    definition:
      "La percentuale delle entrate previste (tasse, tariffe, trasferimenti) che il Comune ha effettivamente incassato.",
    context: "Bilancio",
  },
  {
    slug: "pnrr",
    term: "PNRR",
    definition:
      "Il Piano Nazionale di Ripresa e Resilienza: fondi europei che finanziano opere e progetti con scadenze precise. Se un'opera è \"PNRR\" i tempi sono vincolanti.",
    context: "Bilancio e opere",
  },
  {
    slug: "delibera",
    term: "Delibera",
    definition:
      "La decisione formale presa dalla Giunta o dal Consiglio comunale. È il documento con cui una scelta diventa ufficiale.",
    context: "Decisioni",
  },
  {
    slug: "ordinanza",
    term: "Ordinanza",
    definition:
      "Un ordine del Sindaco o di un dirigente con effetto immediato, di solito per motivi di sicurezza, salute o viabilità (es. chiusura di una strada).",
    context: "Avvisi",
  },
  {
    slug: "rup",
    term: "RUP",
    definition:
      "Responsabile Unico del Procedimento: la persona del Comune che segue un'opera pubblica dall'inizio alla fine e ne risponde.",
    context: "Opere",
  },
  {
    slug: "cup",
    term: "CUP",
    definition:
      "Codice Unico di Progetto: il codice nazionale che identifica un'opera pubblica e permette di seguirla nelle banche dati dello Stato.",
    context: "Opere",
  },
  {
    slug: "variante-urbanistica",
    term: "Variante urbanistica",
    definition:
      "Una modifica al piano che regola cosa si può costruire e dove. Serve, ad esempio, per cambiare la destinazione di un'area.",
    context: "Territorio",
  },
  {
    slug: "consultazione",
    term: "Consultazione pubblica",
    definition:
      "Un percorso in cui il Comune chiede il parere dei cittadini prima di decidere. Il risultato non è vincolante ma orienta la scelta.",
    context: "Partecipazione",
  },
  {
    slug: "bilancio-partecipativo",
    term: "Bilancio partecipativo",
    definition:
      "Una parte del bilancio che i cittadini decidono direttamente, votando i progetti da finanziare.",
    context: "Partecipazione",
  },
  {
    slug: "ztl",
    term: "ZTL",
    definition:
      "Zona a Traffico Limitato: un'area dove l'accesso in auto è consentito solo a chi ha un permesso, controllato dai varchi con telecamera.",
    context: "Mobilità",
  },
];

/** Lookup per slug; null se il termine non esiste. */
export function glossaryTerm(slug: string): GlossaryTerm | null {
  return GLOSSARY.find((t) => t.slug === slug) ?? null;
}
