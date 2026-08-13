import { prisma } from "@/lib/db";
import { statoArchivio, TIPI_ATTO, type StatoArchivio, type TipoAtto } from "@/lib/atti";
import { fattoDelGiorno } from "@/lib/prima-pagina";
import type { CivicTopicKey } from "@/lib/civic-topics";

/*
  I dati del monitor della pipeline degli atti (cruscotto, forma C — scelta da
  Lorenzo il 2026-08-09 sui tre mockup iniettati).

  I conteggi si chiedono al database con `count`/`groupBy`, mai contando righe
  mostrate — e qui non c'è nemmeno una lista da cui farsi tentare.
*/

export type MonitorAtti = {
  stato: StatoArchivio;
  totale: number;
  ultimaPubblicazione: Date | null;
  ultimaLetturaRiuscita: Date | null;
  perTipo: Array<{ tipo: TipoAtto; totale: number }>;
  perTema: Array<{ tema: CivicTopicKey; totale: number }>;
  senzaTema: number;
};

export async function getMonitorAtti(): Promise<MonitorAtti> {
  const adesso = new Date();
  const [totale, ultimo, ultimaLettura, perTipoGrezzi, perTemaGrezzi, senzaTema] = await Promise.all([
    prisma.atto.count(),
    prisma.atto.findFirst({ orderBy: { inizioPubblicazione: "desc" }, select: { inizioPubblicazione: true } }),
    prisma.letturaAtti.findFirst({
      where: { esito: "riuscita" },
      orderBy: { iniziataIl: "desc" },
      select: { finitaIl: true, iniziataIl: true },
    }),
    prisma.atto.groupBy({ by: ["tipo"], _count: { _all: true } }),
    prisma.atto.groupBy({ by: ["temaCivico"], _count: { _all: true }, where: { NOT: { temaCivico: null } } }),
    prisma.atto.count({ where: { temaCivico: null } }),
  ]);

  // L'ordine dei tipi è quello canonico di TIPI_ATTO, non quello del groupBy:
  // così «Determinazione» non scavalca «Delibera» a seconda dei numeri.
  const contoTipo = new Map(perTipoGrezzi.map((r) => [r.tipo, r._count._all]));
  const perTipo = TIPI_ATTO.filter((t) => contoTipo.has(t)).map((t) => ({ tipo: t, totale: contoTipo.get(t)! }));

  const perTema = perTemaGrezzi
    .map((r) => ({ tema: r.temaCivico as CivicTopicKey, totale: r._count._all }))
    .sort((a, b) => b.totale - a.totale);

  return {
    stato: statoArchivio({
      totaleAtti: totale,
      ultimaPubblicazione: ultimo?.inizioPubblicazione ?? null,
      ultimaLetturaRiuscita: ultimaLettura ? (ultimaLettura.finitaIl ?? ultimaLettura.iniziataIl) : null,
      adesso,
    }),
    totale,
    ultimaPubblicazione: ultimo?.inizioPubblicazione ?? null,
    ultimaLetturaRiuscita: ultimaLettura ? (ultimaLettura.finitaIl ?? ultimaLettura.iniziataIl) : null,
    perTipo,
    perTema,
    senzaTema,
  };
}

// ---------------------------------------------------------------------------
// La prima pagina (Ondata 10)
// ---------------------------------------------------------------------------

/** Un atto come lo vede la prima pagina. La logica di scelta sta in `lib/prima-pagina.ts`. */
export type AttoInPrimaPagina = {
  chiave: string;
  tipo: TipoAtto;
  anno: number;
  numero: number;
  /** L'oggetto UFFICIALE, mai riscritto: resta visibile accanto al titolo umano. */
  oggetto: string;
  ufficio: string;
  temaCivico: CivicTopicKey | null;
  inizioPubblicazione: Date;
  urlFonte: string;
  titoloRedazionale: string | null;
  sommarioRedazionale: string | null;
  curatoIl: Date | null;
};

export type PrimaPagina = {
  /**
   * Il giorno di cui la prima pagina parla: **l'ultima pubblicazione**, mai
   * «oggi». Nell'archivio i fine settimana e le feste non hanno atti — misurato
   * su `dev.db`: fra il 13 luglio e l'11 agosto 2026 mancano tutti i sabati e
   * tutte le domeniche — quindi una home che dicesse «oggi il Comune ha
   * deciso…» di lunedì mattina starebbe mentendo. `null` = archivio vuoto.
   */
  giorno: Date | null;
  /** L'atto curato che apre, oppure `null`: senza cura non c'è apertura. */
  apertura: AttoInPrimaPagina | null;
  /** Il fiume: gli atti di quel giorno, i più recenti per primi. Troncato. */
  fiume: AttoInPrimaPagina[];
  /** Quanti atti ha davvero quel giorno — chiesto al database, non alla lista. */
  attiDelGiorno: number;
  conteggi: {
    /** L'anno a cui si riferisce `nelAnno`: si scrive in pagina, non si deduce. */
    anno: number;
    nelAnno: number;
    ultimiSetteGiorni: number;
    totale: number;
  };
  /** «aggiornato» · «fermo» · «mai-letto»: in produzione l'archivio è ancora vuoto. */
  stato: StatoArchivio;
};

/**
 * Quante righe del fiume vanno in pagina.
 *
 * Sei e non trentuno: l'11 agosto 2026 il Comune ha pubblicato **31 atti** (il
 * massimo misurato in trenta giorni è 40), e nove ordinanze su dieci di quel
 * giorno erano divieti di sosta per cantiere. Un elenco completo in prima
 * pagina sarebbe un muro; il numero vero resta scritto accanto, quindi la
 * troncatura non nasconde niente — `attiDelGiorno` lo dichiara.
 */
const RIGHE_FIUME = 6;

const CAMPI_PRIMA_PAGINA = {
  chiave: true,
  tipo: true,
  anno: true,
  numero: true,
  oggetto: true,
  ufficio: true,
  temaCivico: true,
  inizioPubblicazione: true,
  urlFonte: true,
  titoloRedazionale: true,
  sommarioRedazionale: true,
  curatoIl: true,
} as const;

/**
 * Tutto ciò che la prima pagina pubblica mostra degli atti.
 *
 * ⚠️ **I conteggi si chiedono al database con `count`, mai contando le righe
 * mostrate** (`AGENTS.md` §3, ondata 7, 2 — un quartiere con quaranta
 * segnalazioni ne dichiarava sei). Qui la tentazione sarebbe forte perché il
 * fiume è già in mano: `attiDelGiorno` è un `count` a parte proprio per questo.
 *
 * `adesso` è un parametro e non `new Date()` letto dentro: una pagina che
 * cambia con la data va poter essere provata a una data scelta, e un test che
 * dipende dall'orologio passa oggi e fallisce fra un mese (è la stessa scelta
 * di `statoPubblicazione` in `lib/costo-amministrazione.ts`).
 */
export async function getPrimaPagina(adesso: Date = new Date()): Promise<PrimaPagina> {
  const anno = adesso.getUTCFullYear();
  const inizioAnno = new Date(Date.UTC(anno, 0, 1));
  const settimana = new Date(adesso.getTime() - 7 * 86_400_000);

  const [ultimo, totale, nelAnno, ultimiSetteGiorni, ultimaLettura] = await Promise.all([
    prisma.atto.findFirst({
      orderBy: { inizioPubblicazione: "desc" },
      select: { inizioPubblicazione: true },
    }),
    prisma.atto.count(),
    prisma.atto.count({ where: { inizioPubblicazione: { gte: inizioAnno } } }),
    prisma.atto.count({ where: { inizioPubblicazione: { gte: settimana } } }),
    prisma.letturaAtti.findFirst({
      where: { esito: "riuscita" },
      orderBy: { iniziataIl: "desc" },
      select: { finitaIl: true, iniziataIl: true },
    }),
  ]);

  const giorno = ultimo?.inizioPubblicazione ?? null;
  const stato = statoArchivio({
    totaleAtti: totale,
    ultimaPubblicazione: giorno,
    ultimaLetturaRiuscita: ultimaLettura ? (ultimaLettura.finitaIl ?? ultimaLettura.iniziataIl) : null,
    adesso,
  });

  const conteggi = { anno, nelAnno, ultimiSetteGiorni, totale };

  // Archivio vuoto: è lo stato della PRODUZIONE finché la lettura schedulata
  // non esiste (`docs/pipeline-atti-schedulata.md` §2). Non è un caso di
  // scuola, ed è per questo che la prima pagina lo tratta come uno stato
  // disegnato invece che come un ramo che nessuno ha guardato.
  if (!giorno) {
    return { giorno: null, apertura: null, fiume: [], attiDelGiorno: 0, conteggi, stato };
  }

  const fineGiorno = new Date(giorno.getTime() + 86_400_000);
  const delGiorno = { inizioPubblicazione: { gte: giorno, lt: fineGiorno } };

  const [attiDelGiorno, fiume, curati] = await Promise.all([
    prisma.atto.count({ where: delGiorno }),
    prisma.atto.findMany({
      where: delGiorno,
      // `numero` scende insieme al tipo: dentro lo stesso giorno il numero è
      // l'ordine in cui il Comune ha protocollato, cioè il più vicino a «prima
      // e dopo» che l'archivio possieda.
      orderBy: [{ inizioPubblicazione: "desc" }, { numero: "desc" }],
      take: RIGHE_FIUME,
      select: CAMPI_PRIMA_PAGINA,
    }),
    // Gli atti curati di quel giorno: sono zero o pochissimi (li scrive una
    // persona), quindi la scelta fra loro si fa in memoria con la funzione pura
    // che i test coprono, invece che dentro un `orderBy` che nessun test vede.
    prisma.atto.findMany({
      where: { ...delGiorno, NOT: { titoloRedazionale: null } },
      select: CAMPI_PRIMA_PAGINA,
    }),
  ]);

  return {
    giorno,
    apertura: fattoDelGiorno(curati as AttoInPrimaPagina[]),
    fiume: fiume as AttoInPrimaPagina[],
    attiDelGiorno,
    conteggi,
    stato,
  };
}

// ---------------------------------------------------------------------------
// La giornata che la redazione può curare
// ---------------------------------------------------------------------------

/**
 * Un atto come lo vede chi lo cura.
 *
 * Porta l'`id`, che `AttoInPrimaPagina` non ha: è la chiave con cui si scrive,
 * e la superficie pubblica non scrive niente. Due select invece di uno solo più
 * largo, così la pagina pubblica non spedisce al browser un identificativo che
 * non le serve.
 */
export type AttoDaCurare = {
  id: string;
  chiave: string;
  tipo: TipoAtto;
  numero: number;
  oggetto: string;
  ufficio: string;
  titoloRedazionale: string | null;
  sommarioRedazionale: string | null;
  curatoIl: Date | null;
};

export type GiornataDaCurare = {
  giorno: Date | null;
  /** **Tutti** gli atti del giorno, non un campione: vedi sotto. */
  atti: AttoDaCurare[];
  /** Quello che oggi apre la prima pagina, se c'è. */
  curato: AttoDaCurare | null;
};

/**
 * Gli atti fra cui la redazione sceglie il fatto del giorno.
 *
 * ⚠️ **Non c'è un `take`, e la scelta è deliberata.** Il giorno più affollato
 * misurato in trenta giorni ne ha 40, e troncare qui significherebbe che
 * l'atto notevole, se cade oltre la soglia, **non è curabile affatto** — cioè
 * un limite funzionale nascosto dentro una query. La prima pagina tronca (sei
 * righe, col numero vero accanto) perché lì la troncatura è una scelta di
 * lettura; qui sarebbe una porta chiusa.
 *
 * È il giorno di cui parla la prima pagina, quindi **l'ultima pubblicazione** e
 * non «oggi»: curare un giorno che la home non mostra sarebbe lavoro buttato.
 */
export async function getGiornataDaCurare(): Promise<GiornataDaCurare> {
  const ultimo = await prisma.atto.findFirst({
    orderBy: { inizioPubblicazione: "desc" },
    select: { inizioPubblicazione: true },
  });
  const giorno = ultimo?.inizioPubblicazione ?? null;
  if (!giorno) return { giorno: null, atti: [], curato: null };

  const fine = new Date(giorno.getTime() + 86_400_000);
  const atti = (await prisma.atto.findMany({
    where: { inizioPubblicazione: { gte: giorno, lt: fine } },
    orderBy: [{ numero: "desc" }],
    select: {
      id: true,
      chiave: true,
      tipo: true,
      numero: true,
      oggetto: true,
      ufficio: true,
      titoloRedazionale: true,
      sommarioRedazionale: true,
      curatoIl: true,
    },
  })) as AttoDaCurare[];

  // La stessa funzione pura che sceglie l'apertura in prima pagina: qui serve a
  // dire alla redazione **quale** dei curati sta aprendo davvero, che con due
  // atti curati nello stesso giorno non è ovvio.
  return { giorno, atti, curato: fattoDelGiorno(atti) };
}
