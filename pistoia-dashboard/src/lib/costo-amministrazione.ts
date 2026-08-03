/**
 * «Il costo dell'amministrazione» — la catena di calcolo e le sue fonti.
 *
 * Modulo **neutro** di proposito (niente `"use client"`, niente `server-only`):
 * lo importano sia la pagina, che è un Server Component, sia i test. In un file
 * client le costanti diventerebbero riferimenti client per chi le importa da
 * server, e l'aggancio sparirebbe senza un errore (AGENTS.md §3, ondata 6/5).
 *
 * ## Perché questa pagina può esistere prima che il Comune pubblichi
 *
 * **Le indennità non le decide il Comune.** Sono fissate a livello nazionale
 * per fascia demografica: il Comune non ha margine. La cifra si ricava da legge
 * più popolazione, e il dato comunale servirà a confermarla, non a produrla.
 * Senza questo la pagina si aprirebbe su «dato non pubblicato», che su
 * un'assenza ancora dentro i termini di legge è un'accusa tratta da un dato
 * mancante — lo stesso difetto già pagato su `/organigramma` e `/promesse`.
 *
 * ## La regola che governa il modulo
 *
 * Ogni cifra è una {@link Riga} con la propria fonte, e
 * {@link vociPubblicabili} **scarta** le voci la cui riga non porta un URL.
 * Non è una decorazione: una cifra sull'indennità di una persona reale, senza
 * l'atto da cui viene, è un'affermazione su quella persona.
 *
 * Documentazione completa delle fonti, con citazioni alla lettera:
 * `docs/fonti-costo-amministrazione.md`.
 */

/** Una fonte primaria, con ciò che sostiene e quando è stata consultata. */
export type Riga = {
  /** L'affermazione che la fonte sostiene, il più possibile nelle sue parole. */
  affermazione: string;
  /** Nome leggibile dell'atto. */
  fonte: string;
  /** URL dell'atto. **Senza questo la voce non va a schermo.** */
  urlFonte: string;
  /** Data di consultazione, ISO `AAAA-MM-GG`. */
  dataConsultazione: string;
};

const CONSULTATE = "2026-07-31";

// ---------------------------------------------------------------------------
// Gli anelli della catena
// ---------------------------------------------------------------------------

/**
 * La base: il trattamento economico complessivo dei presidenti di regione.
 *
 * Il numero **e** le dodici mensilità vengono dalla stessa frase. La seconda
 * decide l'annualizzazione, che altrimenti sarebbe un'ipotesi: il fondo statale
 * viene ripartito su tredici mensilità, perché comprende l'accantonamento di
 * fine mandato, e chi guardasse solo quello annualizzerebbe per 13.
 */
export const BASE_MENSILE = 13_800;
export const MENSILITA = 12;

export const RIGA_BASE: Riga = {
  affermazione:
    "L'indennità dei sindaci è parametrata al trattamento economico complessivo dei presidenti delle regioni, «il cui importo massimo è stato fissato in euro 13.800 mensili per dodici mensilità».",
  fonte: "Ministero dell'Interno, decreto 30 maggio 2022 — Allegato A, Nota metodologica",
  urlFonte: "https://dait.interno.gov.it/documenti/decreto-fl-30-05-2022-all-a.pdf",
  dataConsultazione: CONSULTATE,
};

/** Quota del sindaco di un capoluogo di provincia fino a 100.000 abitanti. */
export const QUOTA_SINDACO = 0.7;

export const RIGA_SINDACO: Riga = {
  affermazione:
    "«70 per cento per i sindaci dei comuni capoluogo di provincia con popolazione fino a 100.000 abitanti» — art. 1 comma 583 della legge 234/2021, citato alla lettera nelle premesse del decreto.",
  fonte:
    "Decreto Ministro dell'Interno – Ministro dell'Economia, 5 febbraio 2026 (avviso in G.U. n. 75 del 31 marzo 2026)",
  urlFonte: "https://dait.interno.gov.it/documenti/decreto-fl-05-02-2026.pdf",
  dataConsultazione: CONSULTATE,
};

/**
 * Quota del vicesindaco: **75%**, non 55%.
 *
 * L'art. 4 del D.M. 119/2000 gradua per fasce, e la fascia «50.001–100.000»
 * **in quell'articolo non esiste**: esiste nell'art. 3, che è la promozione di
 * classe dei capoluoghi e riguarda il *sindaco*. Chi porta quella fascia
 * sull'art. 4 atterra sul comma 4 (55%, fascia 10.001–50.000) invece che sul
 * comma 5. Pistoia sta sopra i 50.000 abitanti, quindi 75%.
 */
export const QUOTA_VICESINDACO = 0.75;

export const RIGA_VICESINDACO: Riga = {
  affermazione:
    "«Al vicesindaco di comuni con popolazione superiore a 50.000 abitanti è corrisposta un'indennità mensile di funzione pari al 75% di quella prevista per il sindaco» — D.M. 119/2000, art. 4 comma 5, testo vigente.",
  fonte: "D.M. 4 aprile 2000, n. 119, art. 4 — Normattiva",
  urlFonte:
    "https://www.normattiva.it/uri-res/N2Ls?urn:nir:ministero.interno:decreto:2000-04-04;119~art4",
  dataConsultazione: CONSULTATE,
};

/** Quota degli assessori: fascia 50.000–250.000 abitanti. */
export const QUOTA_ASSESSORE = 0.6;

export const RIGA_ASSESSORE: Riga = {
  affermazione:
    "«Agli assessori di comuni con popolazione fra i 50.000 ed i 250.000 abitanti è corrisposta un'indennità mensile di funzione pari al 60% di quella prevista per il sindaco» — D.M. 119/2000, art. 4 comma 9.",
  fonte: "D.M. 4 aprile 2000, n. 119, art. 4 — Normattiva",
  urlFonte:
    "https://www.normattiva.it/uri-res/N2Ls?urn:nir:ministero.interno:decreto:2000-04-04;119~art4",
  dataConsultazione: CONSULTATE,
};

export const RIGA_PRESIDENTE_CONSIGLIO: Riga = {
  affermazione:
    "«Ai presidenti dei consigli di comuni superiori a 15.000 abitanti è corrisposta un'indennità mensile di funzione pari a quella degli assessori di comuni della stessa classe demografica» — D.M. 119/2000, art. 5 comma 3.",
  fonte: "D.M. 4 aprile 2000, n. 119, art. 5 — Normattiva",
  urlFonte:
    "https://www.normattiva.it/uri-res/N2Ls?urn:nir:ministero.interno:decreto:2000-04-04;119~art5",
  dataConsultazione: CONSULTATE,
};

/** Frazione dell'indennità del sindaco che il gettone di un consigliere non può superare. */
export const FRAZIONE_TETTO_CONSIGLIERE = 1 / 4;

export const RIGA_CONSIGLIERE: Riga = {
  affermazione:
    "«In nessun caso l'ammontare percepito nell'ambito di un mese da un consigliere può superare l'importo pari ad un quarto dell'indennità massima prevista per il rispettivo sindaco» — TUEL art. 82 comma 2.",
  fonte: "D.Lgs. 267/2000 (TUEL), art. 82 — Normattiva, testo in vigore dal 1º gennaio 2020",
  urlFonte:
    "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2000-08-18;267~art82",
  dataConsultazione: CONSULTATE,
};

/**
 * Popolazione di Pistoia al 31 dicembre 2024, da ISTAT diretto.
 *
 * Serve a collocare il Comune nelle fasce, non a moltiplicare nulla. La fascia
 * regge con qualunque data disponibile (89.054 al 31/12/2023, 88.889 al
 * 31/12/2024, 89.094 stimati al 31/12/2025): sono tutte sotto i 100.000 e sopra
 * i 50.000, che sono le due soglie che contano.
 */
export const POPOLAZIONE = 88_889;

export const RIGA_POPOLAZIONE: Riga = {
  affermazione:
    "Pistoia (codice ISTAT 047014) conta 88.889 residenti al 31 dicembre 2024. La fascia demografica si àncora alla popolazione risultante dall'ultimo censimento ufficiale, non a quella residente corrente.",
  fonte: "ISTAT, Popolazione residente — serie POSAS, comune 047014",
  urlFonte: "https://demo.istat.it/app/?i=POS",
  dataConsultazione: CONSULTATE,
};

// ---------------------------------------------------------------------------
// Gli importi
// ---------------------------------------------------------------------------

export const INDENNITA_SINDACO = Math.round(BASE_MENSILE * QUOTA_SINDACO);
export const INDENNITA_VICESINDACO = Math.round(INDENNITA_SINDACO * QUOTA_VICESINDACO);
export const INDENNITA_ASSESSORE = Math.round(INDENNITA_SINDACO * QUOTA_ASSESSORE);
export const INDENNITA_PRESIDENTE_CONSIGLIO = INDENNITA_ASSESSORE;
export const TETTO_CONSIGLIERE = Math.round(
  INDENNITA_SINDACO * FRAZIONE_TETTO_CONSIGLIERE,
);

// ---------------------------------------------------------------------------
// Chi ricopre le cariche
// ---------------------------------------------------------------------------

export type Ruolo = "sindaco" | "vicesindaca" | "assessore" | "presidente-consiglio";

export type Voce = {
  id: string;
  /** Come si chiama la carica, al genere di chi la ricopre. */
  carica: string;
  persona: string;
  ruolo: Ruolo;
  /** Come si ottiene l'importo, in una riga leggibile. */
  calcolo: string;
  importoMensile: number;
  /**
   * Vero quando l'importo è un **massimo di legge** e non un compenso.
   * Il renderer lo dice a parole: un tetto presentato come costo è un numero
   * inventato con l'aria di essere calcolato.
   */
  tetto?: boolean;
  /** Falso per chi non fa parte della giunta e quindi non entra nel totale. */
  inGiunta: boolean;
  riga: Riga;
};

/**
 * La giunta proclamata il 27 maggio 2026 e presentata il 10 giugno 2026.
 *
 * Sono nove persone: sindaco, vicesindaca e sette assessori. La vicesindaca è
 * **anche** assessora, ma le indennità non si cumulano (TUEL art. 82 c. 5):
 * conta una volta sola, al 75%. Da qui «sette assessori» e non otto.
 *
 * Le deleghe non compaiono qui di proposito: questa pagina parla di costi, e
 * un elenco di deleghe riportato a metà sarebbe un dato inventato per omissione.
 * Stanno sulla pagina del Comune, che è linkata.
 */
const RIGA_GIUNTA: Riga = {
  affermazione:
    "Il sindaco Giovanni Capecchi presenta la giunta: Stefania Nesi «Vicesindaca», più Olimpia Banci, Sandro Giannessi, Matteo Giusti, Mattia Nesti, Marica Setaro, Elena Sinimberghi e Riccardo Trallori assessori.",
  fonte: "Comune di Pistoia — presentazione della giunta, 10 giugno 2026",
  urlFonte:
    "https://www.comune.pistoia.it/it/news/presentata-oggi-pomeriggio-dal-sindaco-giovanni-capecchi-la-giunta",
  dataConsultazione: CONSULTATE,
};

const RIGA_CONSIGLIO: Riga = {
  affermazione:
    "Il presidente del consiglio comunale di Pistoia è Paolo Tosi. I consiglieri sono 32.",
  fonte: "Comune di Pistoia — Consiglio comunale",
  urlFonte: "https://www.comune.pistoia.it/it/unita_organizzative/consiglio-comunale",
  dataConsultazione: CONSULTATE,
};

const ASSESSORI = [
  "Olimpia Banci",
  "Sandro Giannessi",
  "Matteo Giusti",
  "Mattia Nesti",
  "Marica Setaro",
  "Elena Sinimberghi",
  "Riccardo Trallori",
] as const;

export const VOCI: Voce[] = [
  {
    id: "sindaco",
    carica: "Sindaco",
    persona: "Giovanni Capecchi",
    ruolo: "sindaco",
    calcolo: "70% di 13.800 €",
    importoMensile: INDENNITA_SINDACO,
    inGiunta: true,
    riga: RIGA_SINDACO,
  },
  {
    id: "vicesindaca",
    carica: "Vicesindaca",
    persona: "Stefania Nesi",
    ruolo: "vicesindaca",
    calcolo: `75% dell'indennità del sindaco`,
    importoMensile: INDENNITA_VICESINDACO,
    inGiunta: true,
    riga: RIGA_VICESINDACO,
  },
  ...ASSESSORI.map<Voce>((persona) => ({
    id: `assessore-${persona.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    carica: "Assessore",
    persona,
    ruolo: "assessore",
    calcolo: "60% dell'indennità del sindaco",
    importoMensile: INDENNITA_ASSESSORE,
    inGiunta: true,
    riga: RIGA_ASSESSORE,
  })),
  {
    id: "presidente-consiglio",
    carica: "Presidente del consiglio comunale",
    persona: "Paolo Tosi",
    ruolo: "presidente-consiglio",
    calcolo: "come un assessore, cioè 60% dell'indennità del sindaco",
    importoMensile: INDENNITA_PRESIDENTE_CONSIGLIO,
    inGiunta: false,
    riga: RIGA_PRESIDENTE_CONSIGLIO,
  },
];

/** Le fonti che raccontano *chi* ricopre le cariche, distinte da quelle sugli importi. */
export const RIGHE_PERSONE: Riga[] = [RIGA_GIUNTA, RIGA_CONSIGLIO];

/** Le fonti della catena di calcolo, nell'ordine in cui si applicano. */
export const RIGHE_CATENA: Riga[] = [
  RIGA_BASE,
  RIGA_POPOLAZIONE,
  RIGA_SINDACO,
  RIGA_VICESINDACO,
  RIGA_ASSESSORE,
  RIGA_PRESIDENTE_CONSIGLIO,
  RIGA_CONSIGLIERE,
];

// ---------------------------------------------------------------------------
// Il rifiuto delle righe senza fonte
// ---------------------------------------------------------------------------

/**
 * Una riga è pubblicabile solo se dichiara un URL http(s) e una data.
 *
 * Il controllo è deliberatamente severo sulla forma dell'URL: una stringa vuota
 * o un `#` passerebbero un semplice test di verità e produrrebbero un link che
 * non porta da nessuna parte — cioè l'apparenza di una fonte, che è peggio
 * dell'assenza dichiarata.
 */
export function rigaPubblicabile(riga: Riga | undefined | null): riga is Riga {
  if (!riga) return false;
  if (!/^https?:\/\/\S+$/.test(riga.urlFonte.trim())) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(riga.dataConsultazione)) return false;
  return riga.affermazione.trim().length > 0 && riga.fonte.trim().length > 0;
}

/** Le voci che possono andare a schermo: quelle la cui riga porta una fonte. */
export function vociPubblicabili(voci: Voce[] = VOCI): Voce[] {
  return voci.filter((v) => rigaPubblicabile(v.riga));
}

/** Le righe di fonte che possono andare a schermo. */
export function righePubblicabili(righe: Riga[]): Riga[] {
  return righe.filter(rigaPubblicabile);
}

// ---------------------------------------------------------------------------
// I totali
// ---------------------------------------------------------------------------

/**
 * Il costo mensile della giunta: solo voci **pubblicabili** e solo `inGiunta`.
 *
 * Il filtro non è pignoleria. Se una voce perdesse la fonte, sommarla comunque
 * farebbe comparire a schermo una cifra display costruita anche su ciò che la
 * pagina si è rifiutata di mostrare — e il totale sarebbe l'unico posto in cui
 * quel dato sopravvive, invisibile.
 */
export function costoMensileGiunta(voci: Voce[] = VOCI): number {
  return vociPubblicabili(voci)
    .filter((v) => v.inGiunta)
    .reduce((tot, v) => tot + v.importoMensile, 0);
}

export function costoAnnuoGiunta(voci: Voce[] = VOCI): number {
  return costoMensileGiunta(voci) * MENSILITA;
}

// ---------------------------------------------------------------------------
// La pubblicazione che il Comune deve ancora fare
// ---------------------------------------------------------------------------

/** Proclamazione del sindaco: da qui decorrono i tre mesi dell'art. 14. */
export const PROCLAMAZIONE = new Date("2026-05-27T00:00:00Z");

/** Scadenza dell'obbligo di pubblicazione dei compensi (art. 14 c. 2 D.Lgs 33/2013). */
export const SCADENZA_ART14 = new Date("2026-08-27T00:00:00Z");

export const RIGA_ART14: Riga = {
  affermazione:
    "L'art. 14 del D.Lgs. 33/2013 obbliga le amministrazioni a pubblicare i compensi dei titolari di incarichi politici entro tre mesi dall'elezione o dalla nomina.",
  fonte: "D.Lgs. 14 marzo 2013, n. 33, art. 14 — Normattiva",
  urlFonte:
    "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2013-03-14;33~art14",
  dataConsultazione: CONSULTATE,
};

export type StatoPubblicazione = {
  /** `attesa` finché i tre mesi non sono scaduti; poi `scaduta`. */
  stato: "attesa" | "scaduta";
  /** Giorni che mancano alla scadenza (0 se è passata). */
  giorniAllaScadenza: number;
};

/**
 * Dove siamo rispetto ai tre mesi dell'art. 14.
 *
 * Prende `oggi` come parametro invece di leggere l'orologio: una pagina che
 * cambia tono a una certa data va poter essere provata a quella data, e un
 * test che dipende da `new Date()` passa oggi e fallisce ad agosto.
 */
export function statoPubblicazione(oggi: Date = new Date()): StatoPubblicazione {
  const ms = SCADENZA_ART14.getTime() - oggi.getTime();
  if (ms <= 0) return { stato: "scaduta", giorniAllaScadenza: 0 };
  return { stato: "attesa", giorniAllaScadenza: Math.ceil(ms / 86_400_000) };
}
