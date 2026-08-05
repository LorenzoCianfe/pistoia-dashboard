/**
 * «Valutazioni dei servizi» — il catalogo e le regole di dominio.
 *
 * Modulo **neutro** di proposito (niente `"use client"`, niente `server-only`):
 * lo importano le pagine, che sono Server Component, le azioni, il seed e i
 * test (`AGENTS.md` §3, ondata 6/5).
 *
 * ## In una riga
 *
 * **La valutazione non è mai un verdetto che la piattaforma emette: è la
 * seconda colonna accanto a un numero che la piattaforma aveva già.**
 *
 * È questa frase che tiene la funzione lontana dalle sue due morti naturali —
 * il muro di lamentele e la sala d'attesa — ed è il motivo per cui una scheda
 * senza nemmeno un voto ha comunque qualcosa di vero da dire.
 *
 * ## Le due famiglie non si fondono mai
 *
 * `sportello` è una media di **episodi** (una pratica, una data, un ufficio);
 * `condizione` è un **umore** su uno stato continuo. Una classifica unica che
 * mettesse «Anagrafe 4,1» sopra «Sicurezza 2,1» affermerebbe che le due cose
 * sono confrontabili, e non lo sono. Da qui anche la rinuncia al nome «Pistoia
 * Index»: un nome che promette un indice costringe prima o poi qualcuno a
 * calcolarlo.
 *
 * Ne discendono due calcoli diversi, e sono l'unica asimmetria del modulo:
 * gli sportelli mediano **tutto lo storico** (una recensione di una visita del
 * 2024 resta vera come verbale di quella visita), le condizioni una **finestra
 * mobile** (un voto sulla pulizia del 2024 è scaduto: la strada è stata
 * spazzata da allora).
 *
 * Piano completo, con le dodici decisioni che lo governano:
 * `docs/piano-rating-servizi.md`.
 */

// ---------------------------------------------------------------------------
// La scala
// ---------------------------------------------------------------------------

export const STELLE_MIN = 1;
export const STELLE_MAX = 5;

/**
 * Le stelle sono ammesse dove la scala a tacche è stata **tolta**, e la
 * differenza non è di forma.
 *
 * `/promesse` mostrava una tacca sull'intervallo 0→totale degli impegni: vero
 * in aritmetica, ma nessuno aveva mai fissato «tutti gli impegni chiusi oggi»
 * come traguardo, quindi la tacca a un sesto si leggeva «non avete fatto quasi
 * niente». Qui l'intervallo è **fissato davvero** e da chi vota: 1 è pessimo,
 * 5 è ottimo, e lo dichiara chi mette la stella.
 */
export function stelleValide(n: number): boolean {
  return Number.isInteger(n) && n >= STELLE_MIN && n <= STELLE_MAX;
}

/** Giorni della finestra mobile su cui si media una condizione della città. */
export const FINESTRA_CONDIZIONE_GIORNI = 90;

/**
 * Giorni di silenzio dopo che a una persona è stata chiesta una valutazione.
 *
 * Contato **al centro**, non per canale. Gli ingressi sono sei — segnalazione
 * risolta, menu, campagna mensile, report del mese, pop-up, QR — e sei canali
 * che chiedono ciascuno per sé fanno sembrare la piattaforma una questua.
 */
export const RICHIESTA_SILENZIO_GIORNI = 30;

// ---------------------------------------------------------------------------
// La conservazione dei dati di chi vota
// ---------------------------------------------------------------------------

/**
 * Giorni oltre i quali l'IP di una valutazione va cancellato.
 *
 * **Due dati con due scopi hanno due vite** (decisione di Lorenzo, 2026-08-03),
 * ed è l'opposto del «tutti i dati possibili immaginabili» da cui la scoperta
 * era partita.
 *
 * L'IP serve a **riconoscere un abuso**, che si manifesta in giorni o
 * settimane: sei mesi sono già generosi rispetto allo scopo, e cancellarlo
 * riduce ciò che un'eventuale fuga esporrebbe — cioè *chi ha criticato la
 * polizia locale, e da quale indirizzo*. Su una piattaforma dove si valuta
 * anche la sicurezza urbana quella è la riga di rischio più alta del modello.
 *
 * L'**email** non ha una scadenza propria: è la chiave d'identità che regge la
 * regola mensile e la revoca, quindi vive esattamente quanto la valutazione a
 * cui appartiene, e sparisce con lei.
 *
 * Il numero di telefono **non si raccoglie**: contro una valutazione sullo
 * spazzamento non è proporzionato allo scopo, e non fa niente che l'email non
 * faccia già.
 *
 * ⚠️ Va dichiarato su `/privacy` insieme alla finalità. Applicato in R-3.
 */
export const CONSERVAZIONE_IP_GIORNI = 180;

/**
 * Il momento prima del quale un IP non deve più esistere in archivio.
 *
 * Pura e con la data esplicita per essere provata a date fisse, come
 * `statoPubblicazione()` in `lib/costo-amministrazione.ts`. La applica l'azione
 * del voto a ogni scrittura: una demo locale non ha un cron, e agganciare la
 * pulizia all'evento che produce il dato la rende automatica senza
 * infrastruttura.
 */
export function limiteConservazioneIp(
  oggi: Date,
  giorni: number = CONSERVAZIONE_IP_GIORNI,
): Date {
  return new Date(oggi.getTime() - giorni * 86_400_000);
}

// ---------------------------------------------------------------------------
// Il catalogo
// ---------------------------------------------------------------------------

export type Famiglia = "sportello" | "condizione";

export type Servizio = {
  /** Slug stabile: è anche la chiave della riga `Servizio` e l'URL. */
  id: string;
  famiglia: Famiglia;
  nome: string;
  /** Che cosa si sta valutando, in una riga, al cittadino. */
  descrizione: string;
  /** La domanda che la scheda pone. Cambia con la famiglia, non col servizio. */
  icona: string;
  ordine: number;
  /**
   * Categorie di `Report` da cui viene la **colonna dura** — ciò che la
   * piattaforma sa già, e che riempie la scheda dal primo giorno mentre le
   * stelle sono ancora zero. Vuoto per gli sportelli, che un dato oggettivo
   * non ce l'hanno.
   */
  categorieReport: string[];
  /**
   * Il nome con la preposizione articolata giusta davanti — «sulla pulizia»,
   * «sull'illuminazione», «sui trasporti».
   *
   * Dichiarato e non derivato. Comporre «su» più il nome minuscolo sembra
   * innocuo e produceva «2 segnalazioni **su pulizia**»: in italiano la
   * preposizione dipende da genere, numero e lettera iniziale, e cinque
   * stringhe scritte a mano costano meno di una regola che sbaglia. Assente
   * sugli sportelli, che una colonna dura non ce l'hanno.
   */
  materia?: string;
  /**
   * Vero quando il **volume** delle segnalazioni non si può accostare alle
   * stelle. Vedi {@link volumeAccostabile}.
   */
  volumeAmbiguo?: true;
};

/**
 * Undici caselle, e sono poche di proposito.
 *
 * Il vincolo che ha bloccato questa funzione fin dall'inizio non è mai stato il
 * dato: sono **pochi votanti divisi su troppi bersagli**. La granularità è
 * l'unica leva vera su quel vincolo, e cinque condizioni per dodici quartieri
 * farebbero sessanta caselle prima ancora di contare gli sportelli — cioè
 * sessanta schede che dicono «pochi dati», che non è una piattaforma di
 * valutazioni ma una sala d'attesa con una griglia.
 *
 * Il quartiere quindi non nasce come casella sua: si accende col primo voto
 * che lo nomina ({@link quartiereSbloccato}), e i suoi voti confluiscono
 * comunque nel dato cittadino.
 */
export const SERVIZI: Servizio[] = [
  // --- Servizi allo sportello ---------------------------------------------
  {
    id: "anagrafe",
    famiglia: "sportello",
    nome: "Anagrafe",
    descrizione: "Carta d'identità, residenza, certificati, stato civile.",
    icona: "id-card",
    ordine: 1,
    categorieReport: [],
  },
  {
    id: "tributi",
    famiglia: "sportello",
    nome: "Tributi",
    descrizione: "IMU, TARI, avvisi di pagamento e rateizzazioni.",
    icona: "receipt",
    ordine: 2,
    categorieReport: [],
  },
  {
    id: "edilizia",
    famiglia: "sportello",
    nome: "Sportello unico edilizia",
    descrizione: "Permessi di costruire, SCIA, pratiche edilizie.",
    icona: "building-2",
    ordine: 3,
    categorieReport: [],
  },
  {
    id: "prenotazioni",
    famiglia: "sportello",
    nome: "Prenotazioni e appuntamenti",
    descrizione: "Prenotare uno sportello, spostare o disdire un appuntamento.",
    icona: "calendar-clock",
    ordine: 4,
    categorieReport: [],
  },
  {
    id: "permessi-ztl",
    famiglia: "sportello",
    nome: "Permessi ZTL e sosta",
    descrizione: "Permessi per residenti, contrassegni, abbonamenti alla sosta.",
    icona: "car",
    ordine: 5,
    categorieReport: [],
  },
  {
    id: "protocollo",
    famiglia: "sportello",
    nome: "Protocollo e accesso agli atti",
    descrizione: "Depositare istanze, chiedere documenti, accesso civico.",
    icona: "file-text",
    ordine: 6,
    categorieReport: [],
  },

  // --- Condizioni della città ---------------------------------------------
  {
    id: "pulizia",
    famiglia: "condizione",
    nome: "Pulizia",
    descrizione: "Spazzamento, cestini, raccolta, decoro delle strade.",
    icona: "trash-2",
    ordine: 7,
    categorieReport: ["rifiuti", "decoro"],
    materia: "sulla pulizia",
  },
  {
    id: "illuminazione",
    famiglia: "condizione",
    nome: "Illuminazione",
    descrizione: "Lampioni, luce nelle strade e nelle piazze.",
    icona: "lightbulb",
    ordine: 8,
    categorieReport: ["illuminazione"],
    materia: "sull'illuminazione",
  },
  {
    id: "verde",
    famiglia: "condizione",
    nome: "Verde pubblico",
    descrizione: "Parchi, giardini, alberature, sfalcio.",
    icona: "trees",
    ordine: 9,
    categorieReport: ["verde", "parchi"],
    materia: "sul verde pubblico",
  },
  {
    id: "trasporti",
    famiglia: "condizione",
    nome: "Trasporti",
    descrizione: "Autobus, fermate, collegamenti con le frazioni.",
    icona: "bus",
    ordine: 10,
    categorieReport: ["trasporto"],
    materia: "sui trasporti",
  },
  {
    id: "sicurezza",
    famiglia: "condizione",
    nome: "Sicurezza urbana",
    descrizione: "Come ci si sente per strada, di giorno e di sera.",
    icona: "shield",
    ordine: 11,
    categorieReport: ["sicurezza"],
    materia: "sulla sicurezza urbana",
    volumeAmbiguo: true,
  },
];

export function servizio(id: string): Servizio | null {
  return SERVIZI.find((s) => s.id === id) ?? null;
}

export function serviziDi(famiglia: Famiglia): Servizio[] {
  return SERVIZI.filter((s) => s.famiglia === famiglia).sort(
    (a, b) => a.ordine - b.ordine,
  );
}

/** L'intestazione del tabellone: dice **che cosa misura**, non come si chiama. */
export const TITOLO_FAMIGLIA: Record<Famiglia, { titolo: string; sottotitolo: string }> = {
  sportello: {
    titolo: "Servizi allo sportello",
    sottotitolo: "Media di esperienze vere, con una data e un ufficio",
  },
  condizione: {
    titolo: "Come sta la città",
    sottotitolo: "Polso degli ultimi tre mesi: si rinnova ogni mese",
  },
};

/** La domanda che si pone a chi vota. Cambia con la famiglia, mai col servizio. */
export const DOMANDA_FAMIGLIA: Record<Famiglia, string> = {
  sportello: "Com'è andata?",
  condizione: "Com'è messa la tua zona?",
};

/**
 * Vero se il **volume** delle segnalazioni si può accostare alle stelle.
 *
 * Per la pulizia «tante segnalazioni e chiusure lente» si legge naturalmente
 * come «va peggio». Per la sicurezza **no**: più segnalazioni può voler dire
 * più vigilanza, non più pericolo. Una scheda che accostasse un volume in
 * crescita a due stelle suggerirebbe un nesso che il dato non contiene, ed è la
 * stessa famiglia di difetto della percentuale tinta di rosso su un campione
 * minuscolo — un'aritmetica esatta che si legge come un'accusa.
 *
 * Dove è falso, la frase di sintesi parla solo dei **tempi di chiusura**, che
 * un giudizio sul Comune lo reggono davvero.
 */
export function volumeAccostabile(s: Servizio): boolean {
  return s.volumeAmbiguo !== true;
}

// ---------------------------------------------------------------------------
// Il periodo
// ---------------------------------------------------------------------------

/** `AAAA-MM` della data. È la chiave del rinnovo mensile e dell'andamento. */
export function periodoDi(quando: Date): string {
  const m = `${quando.getUTCMonth() + 1}`.padStart(2, "0");
  return `${quando.getUTCFullYear()}-${m}`;
}

/** Il primo istante della finestra mobile su cui si media una condizione. */
export function inizioFinestra(
  oggi: Date,
  giorni: number = FINESTRA_CONDIZIONE_GIORNI,
): Date {
  return new Date(oggi.getTime() - giorni * 86_400_000);
}

/**
 * Gli ultimi `n` periodi fino a `oggi`, dal più vecchio al più recente.
 *
 * Serve all'andamento, che ha **un punto al mese**: un mese senza voti resta
 * un buco dichiarato, non uno zero. Uno zero direbbe «valutato pessimo», che è
 * il contrario di «nessuno ha risposto».
 */
export function ultimiPeriodi(oggi: Date, n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth() - i, 1));
    out.push(periodoDi(d));
  }
  return out;
}

// ---------------------------------------------------------------------------
// La media, dal primo voto
// ---------------------------------------------------------------------------

export type Media = {
  /** Media a una cifra decimale, oppure `null` quando non c'è nemmeno un voto. */
  valore: number | null;
  /** Quante valutazioni la compongono. */
  campione: number;
};

/**
 * La media, dal primo voto — e il patto che la rende pubblicabile.
 *
 * Fino al 2026-08-05 qui c'era una soglia (20, dichiaratamente provvisoria):
 * sotto, la media taceva e la scheda contava quanti voti mancavano. Scrivendo
 * `/metodologia` la soglia è stata sciolta in **nessuna soglia** (decisione di
 * Lorenzo, registrata nel registro delle modifiche, v1.0). L'autoselezione di
 * chi recensisce — si scrive da furiosi o da entusiasti, e sui piccoli numeri
 * quella tendenza è gran parte del risultato — resta vera; ma una soglia tace
 * il dato proprio dove i votanti sono pochi, cioè in una città media quasi
 * ovunque e quasi sempre. La correzione scelta non è il silenzio: è il
 * **campione stampato accanto, sempre**. La riga della composizione è portante
 * e non decorativa — se qualcuno la stacca dalla media, il modello crolla.
 *
 * L'unica assenza è l'assenza vera: a zero voti `valore` è `null` e la scheda
 * lo dichiara, invece di decorarlo — lo stesso rifiuto dell'assenza travestita
 * che ha tolto la cifra da `/organigramma` e la scala a tacche da `/promesse`.
 */
export function media(stelle: number[]): Media {
  const valide = stelle.filter(stelleValide);
  const campione = valide.length;
  if (campione === 0) return { valore: null, campione: 0 };
  const somma = valide.reduce((t, n) => t + n, 0);
  return { valore: Math.round((somma / campione) * 10) / 10, campione };
}

// ---------------------------------------------------------------------------
// La composizione del campione
// ---------------------------------------------------------------------------

/**
 * Le proprietà di una valutazione che contano per la composizione.
 * Deliberatamente strutturale e non il tipo Prisma: il modulo resta neutro e i
 * test non hanno bisogno di un database.
 */
export type ValutazioneContata = {
  stelle: number;
  emailConfermata: boolean;
  canale: string;
  quartiereId?: string | null;
  rimossaIl?: Date | null;
};

export type Composizione = {
  totale: number;
  confermate: number;
  daQr: number;
};

/**
 * Da che cosa è fatta la media.
 *
 * **Non è decorazione ed è portante.** La scelta del 2026-08-03 è il modello
 * Trustpilot: nessun filtro su chi vota, e la credibilità viene dalla
 * trasparenza invece che dal cancello. Tolta questa riga, resta una media
 * aperta a chiunque senza niente che aiuti a pesarla — cioè il peggio di
 * entrambi i disegni. Non può stare sotto una piega né dentro un tooltip.
 *
 * Confermate e non confermate **contano entrambe** (il voto entra subito): la
 * conferma fa un lavoro visibile qui, invece di restare nel database.
 */
export function composizione(valutazioni: ValutazioneContata[]): Composizione {
  const vive = valutazioni.filter(nonRimossa);
  return {
    totale: vive.length,
    confermate: vive.filter((v) => v.emailConfermata).length,
    daQr: vive.filter((v) => v.canale === "qr").length,
  };
}

/** Una valutazione rimossa non conta in nessun calcolo, mai. */
export function nonRimossa(v: ValutazioneContata): boolean {
  return v.rimossaIl == null;
}

// ---------------------------------------------------------------------------
// Lo sblocco del quartiere
// ---------------------------------------------------------------------------

/**
 * Vero quando un quartiere ha una media propria da mostrare.
 *
 * Una condizione nasce **sulla città intera** e i voti col quartiere
 * confluiscono comunque nel dato cittadino. «Nessuna soglia» (2026-08-05) vale
 * anche qui: il quartiere si accende **col primo voto suo**, col campione
 * dichiarato accanto come ovunque — non esiste una quota da superare.
 *
 * Nessuna superficie rende ancora le medie locali: la regola sta qui, decisa e
 * provata, per il giorno in cui la mappa arriverà. Se quel giorno servisse
 * ripensarla, il posto è il registro delle modifiche di `/metodologia`.
 */
export function quartiereSbloccato(
  valutazioniDelQuartiere: ValutazioneContata[],
): boolean {
  return valutazioniDelQuartiere.filter(nonRimossa).length > 0;
}

// ---------------------------------------------------------------------------
// Chi può votare di nuovo, e quando
// ---------------------------------------------------------------------------

export type VotoPrecedente = {
  servizioId: string;
  periodo: string;
  email: string;
};

/**
 * Se questa persona può votare questo servizio adesso.
 *
 * Le due famiglie hanno due cadenze, e seguono la loro natura invece di una
 * regola unica imposta:
 *
 * - **sportello, a episodio** — recensisci ogni pratica che fai davvero, come
 *   su TripAdvisor recensisci ogni soggiorno. Nessun tetto qui: un tetto
 *   temporale punirebbe chi allo sportello ci va spesso, che è esattamente chi
 *   ha più da dire;
 * - **condizione, una al mese** — il voto vale un mese e poi si rinnova. È
 *   l'unica cadenza che rende l'andamento una misura: confronta le stesse
 *   persone nel tempo invece di seguire chi si è iscritto di recente.
 *
 * La chiave è l'email, non l'account: senza account l'identità è quella, ed è
 * la ragione per cui l'email è obbligatoria anche dal QR.
 */
export function puoVotare(
  s: Servizio,
  email: string,
  periodo: string,
  precedenti: VotoPrecedente[],
): boolean {
  if (s.famiglia === "sportello") return true;
  const chiave = email.trim().toLowerCase();
  return !precedenti.some(
    (p) =>
      p.servizioId === s.id &&
      p.periodo === periodo &&
      p.email.trim().toLowerCase() === chiave,
  );
}

// ---------------------------------------------------------------------------
// Come compare chi scrive
// ---------------------------------------------------------------------------

/**
 * Il nome pubblico di chi ha scritto.
 *
 * **«Marco B.» è il default per tutti**, compreso chi ha un account verificato
 * (decisione di Lorenzo, 2026-08-03): il nome intero è un atto deliberato —
 * una casella spuntata — invece di una conseguenza dell'essersi registrati.
 * Protegge anche chi recensisce sul serio: chi critica un servizio sociale non
 * dovrebbe finire indicizzato per nome e cognome.
 *
 * Senza nome si è «Anonimo», e non è un ripiego: è la stessa scelta che
 * `/segnalazioni` offre già con l'invio anonimo.
 */
export function nomePubblico(
  nomeVisualizzato: string | null | undefined,
  mostraNomeIntero: boolean,
): string {
  const nome = (nomeVisualizzato ?? "").trim().replace(/\s+/g, " ");
  if (!nome) return "Anonimo";
  if (mostraNomeIntero) return nome;

  const parti = nome.split(" ");
  if (parti.length === 1) return parti[0];
  const iniziali = parti
    .slice(1)
    .map((p) => `${p[0]!.toUpperCase()}.`)
    .join(" ");
  return `${parti[0]} ${iniziali}`;
}

// ---------------------------------------------------------------------------
// Il testo che va a schermo
// ---------------------------------------------------------------------------

/**
 * Il testo di una recensione, o `null` se non ne ha uno da mostrare.
 *
 * Una valutazione rimossa non restituisce mai il proprio testo — e in database
 * quel campo viene azzerato, non nascosto: il motivo più frequente di rimozione
 * sono i **dati di un terzo**, che vanno tolti davvero.
 */
export function testoVisibile(v: {
  testo?: string | null;
  rimossaIl?: Date | null;
}): string | null {
  if (v.rimossaIl != null) return null;
  const t = (v.testo ?? "").trim();
  return t.length > 0 ? t : null;
}

// ---------------------------------------------------------------------------
// La colonna dura
// ---------------------------------------------------------------------------

/** Ciò che la piattaforma già sapeva, prima che qualcuno votasse. */
export type ColonnaDura = {
  /** Segnalazioni conteggiabili aperte nell'ultimo anno. **Un fatto.** */
  segnalazioni: number;
  /** Quante hanno una data di risoluzione. */
  risolte: number;
  /**
   * Giorni **mediani** fra apertura e chiusura, oppure `null`.
   *
   * `null` anche quando le chiuse ci sono ma sono **troppo poche**: vedi
   * {@link colonnaDuraDa}.
   */
  giorniMediani: number | null;
  /** Falso su `sicurezza`: vedi {@link volumeAccostabile}. */
  volumeAccostabile: boolean;
  /** Falso quando non c'è niente di dicibile senza forzare il dato. */
  haQualcosaDaDire: boolean;
};

/**
 * La mediana, e non la media, dei giorni di chiusura.
 *
 * Una sola pratica ferma da due anni sposta la media di settimane e racconta un
 * Comune che non chiude niente. La mediana dice quanto ci mette il caso
 * *tipico*, che è la domanda di chi legge.
 */
export function mediana(valori: number[]): number | null {
  if (valori.length === 0) return null;
  const v = [...valori].sort((a, b) => a - b);
  const m = Math.floor(v.length / 2);
  return v.length % 2 === 1 ? v[m] : Math.round((v[m - 1] + v[m]) / 2);
}

/**
 * Costruisce la colonna dura, e distingue **un fatto da un giudizio**.
 *
 * La distinzione è tutta la funzione, e nasce da un difetto visto dal vivo il
 * 2026-08-03: la pagina scriveva «2 segnalazioni quest'anno, chiuse in 7 giorni»
 * come se fosse il dato solido su cui la scheda si appoggia. **Sette giorni
 * mediani su due casi non è una misura**, è la stessa accusa su campione
 * minuscolo che `CAMPIONE_MINIMO_PER_GIUDIZIO` esiste per fermare — e faceva
 * più danno qui che altrove, perché è la metà della pagina che dovrebbe essere
 * quella affidabile.
 *
 * Da qui la regola: il **conteggio** è un fatto e si mostra sempre («la città
 * ha aperto due segnalazioni» è vero e basta); la **mediana** è una sintesi e
 * vuole il campione minimo, contato sulle chiuse — che sono le uniche che
 * producono una durata.
 *
 * Nota di misura: il campione minimo è quello di `citystats` (5) e **resta
 * anche ora che le medie a stelle non hanno soglia** (2026-08-05). Non è
 * un'incoerenza: la media è un'opinione aggregata che va a schermo col suo
 * campione stampato accanto, la mediana è la metà della pagina che si presenta
 * come il fatto solido — e un «caso tipico» calcolato su due casi non è un
 * caso tipico. Se qualcuno unificasse le due regole per simmetria, i test
 * della colonna dura cadrebbero.
 */
export function colonnaDuraDa(
  s: Servizio,
  giorniDiChiusura: number[],
  segnalazioni: number,
  campioneMinimo: number,
): ColonnaDura {
  const accostabile = volumeAccostabile(s);
  const giorniMediani =
    giorniDiChiusura.length >= campioneMinimo ? mediana(giorniDiChiusura) : null;

  return {
    segnalazioni,
    risolte: giorniDiChiusura.length,
    giorniMediani,
    volumeAccostabile: accostabile,
    // Su `sicurezza` il volume non si può accostare alle stelle, quindi senza
    // una mediana non resta niente da dire: meglio non aprire il riquadro che
    // aprirlo su una frase monca.
    haQualcosaDaDire: accostabile ? segnalazioni > 0 : giorniMediani != null,
  };
}
