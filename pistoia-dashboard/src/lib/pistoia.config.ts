// Costanti istituzionali del Comune di Pistoia.
// Un unico punto di verità per i codici usati dai filtri sulle fonti nazionali
// (Fase 2: BDAP, SIOPE+, OpenCUP, ReGiS/OpenPNRR, ANAC).

export const PISTOIA = {
  /** Denominazione ufficiale dell'ente. */
  ente: "Comune di Pistoia",

  /** Codice ISTAT del comune — chiave di filtro per OpenCUP/ISTAT. */
  codiceIstat: "047014",

  /** Codice catastale (Belfiore). */
  codiceCatastale: "G713",

  /** Sigla provincia e regione. */
  provincia: "PT",
  regione: "Toscana",

  /** CAP del capoluogo. */
  cap: "51100",

  // I codici seguenti vanno censiti dalle anagrafiche ufficiali prima
  // dell'ETL di Fase 2 (non inventarli: ogni dato deve essere verificabile).
  /** Codice ente BDAP/RGS — da censire dall'anagrafica OpenBDAP. */
  codiceBdap: null as string | null,
  /** Partita IVA / Codice fiscale dell'ente — da censire dal sito istituzionale. */
  partitaIva: null as string | null,

  /** Sito istituzionale. */
  sitoIstituzionale: "https://www.comune.pistoia.it",

  /** Centro città — coerente con PISTOIA_CENTER in lib/map.ts. */
  centro: { lat: 43.9333, lng: 10.9167 },
} as const;
