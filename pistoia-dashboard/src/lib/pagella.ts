import type { Riga } from "@/lib/costo-amministrazione";

/**
 * «La pagella della giunta» — materie, controlli e formula del voto.
 *
 * Modulo **neutro** come `lib/valutazioni.ts`: lo importano la pagina, la
 * metodologia (che ne interpola le costanti) e i test. Niente database: le
 * edizioni sono ricognizioni manuali versionate nel repository, sul modello
 * di `lib/costo-amministrazione.ts` — e ne riusano il tipo {@link Riga},
 * perché due definizioni della stessa «cifra con fonte» sono peggio di
 * nessuna.
 *
 * ## La regola che governa il modulo (piano-pagella.md §0)
 *
 * Il voto è un conteggio che si può rifare a mano: 1 + 9 × la quota dei
 * controlli superati, dove ogni controllo ha un traguardo fissato da una
 * norma — mai dalla Redazione. Dove nessuna norma fissa un traguardo, il
 * voto non esiste: si contano i fatti (Promesse) o si dichiara che cosa
 * accenderebbe la materia (Sicurezza, Decoro, Ascolto).
 *
 * ## Perché `EDIZIONI` è vuoto
 *
 * Un'edizione inventata su una giunta vera non è un dato dimostrativo: il
 * seed non semina pagelle, e un test fa da guardiano. La prima edizione
 * nasce dalla prima ricognizione reale, non prima del termine dell'art. 14
 * ({@link SCADENZA_ART14}) — ed esce già timbrata con la versione della
 * metodologia che l'ha calcolata.
 */

// ---------------------------------------------------------------------------
// Le date che ancorano la prima edizione
// ---------------------------------------------------------------------------

/** Proclamazione del sindaco: fa partire i tre mesi dell'art. 14 c. 2. */
export const PROCLAMAZIONE_GIUNTA = "2026-05-27";

/**
 * Il termine dell'art. 14 D.Lgs 33/2013 per la giunta in carica: tre mesi
 * dalla proclamazione. Prima di questa data un'assenza sul portale è ancora
 * dentro i termini di legge, e giudicarla sarebbe un'accusa tratta da un
 * dato mancante — lo stesso difetto già evitato su
 * `/trasparenza/costo-amministrazione`.
 */
export const SCADENZA_ART14 = "2026-08-27";

const MESI = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
] as const;

/** «2026-08-27» → «27 agosto 2026», senza passare da `Date` e dai fusi. */
export function dataItaliana(iso: string): string {
  const [anno, mese, giorno] = iso.split("-").map(Number);
  return `${giorno} ${MESI[mese - 1]} ${anno}`;
}

// ---------------------------------------------------------------------------
// Le materie e i due regimi
// ---------------------------------------------------------------------------

/**
 * - `voto`: esiste una lista di controlli con traguardo normativo → 1–10.
 * - `fatti`: i fatti si censiscono con la fonte, ma nessuna norma fissa un
 *   traguardo da contare → niente voto, mai.
 * - `senza-fonte`: oggi nessuna fonte reale regge un giudizio → la materia
 *   dichiara che cosa la accenderebbe.
 */
export type RegimeMateria = "voto" | "fatti" | "senza-fonte";

export type MateriaPagella = {
  /** Ancora stabile: `/pagella#trasparenza`. */
  id: string;
  nome: string;
  regime: RegimeMateria;
  /** Che cosa si conta, o perché non si può — la voce onesta della card. */
  descrizione: string;
  /** Solo per `senza-fonte`: la condizione dichiarata che la farebbe entrare. */
  cosaLaAccenderebbe?: string;
};

export const MATERIE_PAGELLA: MateriaPagella[] = [
  {
    id: "trasparenza",
    nome: "Trasparenza",
    regime: "voto",
    descrizione:
      "Che cosa il D.Lgs 33/2013 obbliga a pubblicare sulla giunta, ed entro " +
      "quando. Il traguardo — tutto pubblicato, nei termini — lo fissa la " +
      "legge, non la Redazione.",
  },
  {
    id: "spesa",
    nome: "Spesa",
    regime: "voto",
    descrizione:
      "I vincoli di legge sul denaro: bilanci approvati nei termini del " +
      "TUEL, pagamenti entro i termini del D.Lgs 231/2002.",
  },
  {
    id: "promesse",
    nome: "Promesse",
    regime: "fatti",
    descrizione:
      "Gli impegni delle linee programmatiche di mandato (TUEL art. 46), " +
      "censiti uno per uno con la propria fonte. Se un impegno dichiara una " +
      "data, il suo rispetto si conta; il totale no — un «% mantenute» " +
      "sarebbe la scala a tacche già tolta da /promesse.",
  },
  {
    id: "sicurezza",
    nome: "Sicurezza",
    regime: "senza-fonte",
    descrizione:
      "I delitti ISTAT sono provinciali, annuali e arrivano con circa due " +
      "anni di ritardo: attribuirli a una giunta in carica non sarebbe onesto.",
    cosaLaAccenderebbe:
      "Un dato comunale, tempestivo e attribuibile al periodo giudicato.",
  },
  {
    id: "decoro",
    nome: "Decoro",
    regime: "senza-fonte",
    descrizione:
      "Le segnalazioni della piattaforma sono dimostrative, e un voto vero " +
      "non può nascere da dati dichiarati finti.",
    cosaLaAccenderebbe:
      "Segnalazioni vere, con la piattaforma in produzione.",
  },
  {
    id: "ascolto",
    nome: "Ascolto",
    regime: "senza-fonte",
    descrizione:
      "Nessun dato pubblicato misura i tempi di risposta ai cittadini.",
    cosaLaAccenderebbe:
      "Richieste di accesso civico vere, coi loro tempi di risposta — " +
      "un'azione verso il Comune, che resta una decisione a parte.",
  },
];

export function materiaPagella(id: string): MateriaPagella | null {
  return MATERIE_PAGELLA.find((m) => m.id === id) ?? null;
}

export function materieDi(regime: RegimeMateria): MateriaPagella[] {
  return MATERIE_PAGELLA.filter((m) => m.regime === regime);
}

// ---------------------------------------------------------------------------
// I controlli — definiti dalle norme, verificati dalla ricognizione
// ---------------------------------------------------------------------------

export type ControlloPagella = {
  /** Ancora stabile del controllo, citabile dalla metodologia. */
  id: string;
  materiaId: "trasparenza" | "spesa";
  /** Che cosa deve risultare vero perché il controllo sia superato. */
  controllo: string;
  /** Chi fissa il traguardo: la norma, mai la Redazione. */
  traguardoDi: string;
};

/**
 * La lista la definiscono le norme; la ricognizione ne verifica lo **stato**,
 * non inventa la lista. Se un controllo si rivelerà mal posto, la lista
 * cambia PRIMA della prima edizione, con bump di versione e voce nel
 * registro — mai in silenzio (piano-pagella.md §4).
 */
export const CONTROLLI: ControlloPagella[] = [
  {
    id: "art14-nomina",
    materiaId: "trasparenza",
    controllo:
      "Atto di nomina o proclamazione, con la durata dell'incarico, per ogni componente della giunta",
    traguardoDi: "D.Lgs 33/2013, art. 14, c. 1, lett. a",
  },
  {
    id: "art14-curriculum",
    materiaId: "trasparenza",
    controllo: "Curriculum di ogni componente della giunta",
    traguardoDi: "D.Lgs 33/2013, art. 14, c. 1, lett. b",
  },
  {
    id: "art14-compensi",
    materiaId: "trasparenza",
    controllo:
      "Compensi connessi alla carica, con viaggi di servizio e missioni",
    traguardoDi: "D.Lgs 33/2013, art. 14, c. 1, lett. c",
  },
  {
    id: "art14-cariche",
    materiaId: "trasparenza",
    controllo:
      "Altre cariche presso enti pubblici o privati e altri incarichi con oneri pubblici",
    traguardoDi: "D.Lgs 33/2013, art. 14, c. 1, lett. d–e",
  },
  {
    id: "art14-patrimonio",
    materiaId: "trasparenza",
    controllo:
      "Situazione patrimoniale e dichiarazione dei redditi dei titolari",
    traguardoDi: "D.Lgs 33/2013, art. 14, c. 1, lett. f",
  },
  {
    id: "art14-termini",
    materiaId: "trasparenza",
    controllo:
      "Tutto quanto sopra pubblicato entro tre mesi dalla proclamazione",
    traguardoDi: `D.Lgs 33/2013, art. 14, c. 2 — entro il ${dataItaliana(SCADENZA_ART14)}`,
  },
  {
    id: "art33-indicatore",
    materiaId: "trasparenza",
    controllo:
      "Indicatore trimestrale di tempestività dei pagamenti pubblicato",
    traguardoDi: "D.Lgs 33/2013, art. 33",
  },
  {
    id: "tuel-preventivo",
    materiaId: "spesa",
    controllo:
      "Bilancio di previsione approvato entro il termine di legge (o la proroga ufficiale)",
    traguardoDi: "TUEL, art. 151, c. 1",
  },
  {
    id: "tuel-rendiconto",
    materiaId: "spesa",
    controllo: "Rendiconto della gestione approvato entro il 30 aprile",
    traguardoDi: "TUEL, art. 227, c. 2",
  },
  {
    id: "pagamenti-termini",
    materiaId: "spesa",
    controllo:
      "Pagamenti entro i termini: l'indicatore di tempestività dentro i limiti di legge",
    traguardoDi: "D.Lgs 231/2002, art. 4",
  },
];

export function controlliDi(
  materiaId: ControlloPagella["materiaId"],
): ControlloPagella[] {
  return CONTROLLI.filter((c) => c.materiaId === materiaId);
}

// ---------------------------------------------------------------------------
// Il voto — un conteggio ricontabile, mai una stima
// ---------------------------------------------------------------------------

export const VOTO_MIN = 1;
export const VOTO_MAX = 10;

/**
 * `1 + 9 × quota`, arrotondato: zero controlli superati = 1, tutti = 10.
 *
 * Il pavimento a {@link VOTO_MIN} tiene la scala sull'1–10 promesso in
 * pagina (decisione del 2026-08-05); il 10 significa «tutto ciò che era
 * dovuto», non «bravissimi» — lo dice la metodologia, regola 14. Input non
 * interi o fuori intervallo sono un errore di programma, non un dato: si
 * rifiutano, mai si correggono.
 */
export function votoPagella(superati: number, totale: number): number {
  if (
    !Number.isInteger(superati) ||
    !Number.isInteger(totale) ||
    totale < 1 ||
    superati < 0 ||
    superati > totale
  ) {
    throw new Error(
      `votoPagella: conteggio non valido (${superati} su ${totale})`,
    );
  }
  return VOTO_MIN + Math.round((VOTO_MAX - VOTO_MIN) * (superati / totale));
}

// ---------------------------------------------------------------------------
// Le edizioni — ricognizioni manuali, versionate nel repository
// ---------------------------------------------------------------------------

/** L'esito di un controllo in una edizione: superato o no, con la prova. */
export type EsitoControllo = {
  controlloId: string;
  superato: boolean;
  /** La prova: senza `urlFonte` l'esito non va a schermo. */
  riga: Riga;
};

export type EdizionePagella = {
  /** Il trimestre giudicato: `2026-T3`. */
  periodo: string;
  /** `AAAA-MM-GG` della ricognizione. */
  dataConsultazioni: string;
  /**
   * Il timbro, scattato alla scrittura dell'edizione e mai ricalcolato:
   * senza, una pagella vecchia diventa incontestabile perché nessuno sa più
   * con quali regole fu prodotta (ROADMAP.md §6, prerequisito 3).
   */
  versioneMetodologia: string;
  esiti: EsitoControllo[];
  /** La replica: le date dichiarano lo stato, anche quando è un silenzio. */
  replicaRichiestaIl?: string;
  replicaRicevutaIl?: string;
  replicaTesto?: string;
};

/**
 * Vuoto finché la prima ricognizione reale non esiste: il seed non semina
 * pagelle. Guardiano in `tests/unit/pagella.test.ts`.
 */
export const EDIZIONI: EdizionePagella[] = [];

/** Come `vociPubblicabili`: un esito senza URL della fonte non va a schermo. */
export function esitiPubblicabili(esiti: EsitoControllo[]): EsitoControllo[] {
  return esiti.filter((e) => e.riga.urlFonte.trim().length > 0);
}

/**
 * Il voto di una materia in una edizione — o `null`, e il `null` è la
 * regola più importante del modulo: se anche un solo controllo della
 * materia manca o non è pubblicabile, il voto NON esce. Togliere righe dal
 * denominatore gonfierebbe il voto in silenzio; un voto che non può
 * mostrare tutte le sue righe non si riconta, e un voto che non si riconta
 * è un'opinione.
 */
export function votoMateria(
  edizione: EdizionePagella,
  materiaId: ControlloPagella["materiaId"],
): { voto: number; superati: number; totale: number } | null {
  const attesi = controlliDi(materiaId);
  if (attesi.length === 0) return null;

  const pubblicabili = esitiPubblicabili(edizione.esiti);
  const perControllo = new Map(pubblicabili.map((e) => [e.controlloId, e]));

  const esiti = attesi.map((c) => perControllo.get(c.id));
  if (esiti.some((e) => e === undefined)) return null;

  const superati = esiti.filter((e) => e!.superato).length;
  return {
    voto: votoPagella(superati, attesi.length),
    superati,
    totale: attesi.length,
  };
}
