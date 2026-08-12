/*
  LA PIPELINE DEGLI ATTI (Ondata 8) — la parte pura: chiavi, tipi, tema civico
  e lettura del CSV. Il lato che tocca la rete e il database sta in
  `scripts/atti.mjs`; qui non c'è niente che non si possa provare con un test.

  La ricognizione della fonte, con le misure che giustificano OGNI scelta di
  questo file, sta in `docs/fonti-atti.md`. Le tre che contano di più:

  1. `Url atto` identifica la PUBBLICAZIONE, non l'atto: lo stesso atto sta
     sull'albo e nello storico con due id consecutivi (§2.2). Usarlo come
     chiave produce 385 doppioni, cioè la stessa delibera mostrata due volte.
  2. Le griglie non hanno le stesse colonne (24 e 25): si mappa per NOME,
     mai per posizione (§2.3).
  3. Il tema civico si deduce dall'UFFICIO, non dalla `Classifica` del portale,
     che è un titolario di protocollo con un raccoglitore di scarto che si
     mangia tutta la Cultura (§4).
*/

import { CIVIC_TOPICS, type CivicTopicKey } from "@/lib/civic-topics";

// ---------------------------------------------------------------------------
// I tipi di atto
// ---------------------------------------------------------------------------

/**
 * Gli atti che il Comune emette in proprio. Sull'albo compaiono anche
 * `ATTI DI ALTRI ENTI`, `ALTRI ATTI DELL' ENTE` e `ALTRI ATTI` (35 righe
 * misurate): sono avvisi pubblicati PER CONTO DI TERZI — Publiacqua, l'Unione
 * dei Comuni Valdera — e avvisi che contengono dati personali di cittadini
 * («avviso cambio cognome per il sig. …»). Non sono atti del Comune e non
 * entrano: l'archivio tiene le decisioni di questa amministrazione.
 */
export const TIPI_ATTO = [
  "DELIBERA DI GIUNTA",
  "DELIBERA DI CONSIGLIO",
  "DETERMINAZIONE DEL DIRIGENTE",
  "ORDINANZA",
  "DECRETO",
] as const;

export type TipoAtto = (typeof TIPI_ATTO)[number];

export function isTipoAtto(s: string): s is TipoAtto {
  return (TIPI_ATTO as readonly string[]).includes(s);
}

/** Come si nomina un tipo in pagina: il portale scrive in maiuscolo, noi no. */
export const ETICHETTA_TIPO: Record<TipoAtto, string> = {
  "DELIBERA DI GIUNTA": "Delibera di giunta",
  "DELIBERA DI CONSIGLIO": "Delibera di consiglio",
  "DETERMINAZIONE DEL DIRIGENTE": "Determinazione dirigenziale",
  ORDINANZA: "Ordinanza",
  DECRETO: "Decreto",
};

/**
 * L'organo che decide. Serve a distinguere ciò che è politico (giunta,
 * consiglio) da ciò che è gestionale (dirigenti) — la distinzione che rende
 * leggibile un archivio in cui le delibere sono il 10%.
 */
export const ORGANO_TIPO: Record<TipoAtto, "politico" | "gestionale"> = {
  "DELIBERA DI GIUNTA": "politico",
  "DELIBERA DI CONSIGLIO": "politico",
  "DETERMINAZIONE DEL DIRIGENTE": "gestionale",
  ORDINANZA: "gestionale",
  DECRETO: "gestionale",
};

// ---------------------------------------------------------------------------
// L'identità di un atto
// ---------------------------------------------------------------------------

export type ChiaveAtto = {
  tipo: string;
  anno: number;
  numero: number;
  annoRegistrazione: number;
  numeroRegistrazione: number;
  idPubblicazione: string;
};

/**
 * L'identità è `tipo/anno/numero`, con due ripieghi misurati:
 *
 * - 39 righe hanno `anno` o `numero` a zero (il portale scrive così «non
 *   registrato»): si ripiega sul numero di REGISTRAZIONE all'albo;
 * - 3 righe hanno a zero anche quello: si ripiega sull'id della pubblicazione.
 *
 * Il terzo ripiego non è pignoleria. Senza, due delibere di giunta del 2024
 * davvero diverse — «Pistoia Blues Festival» e «Festa europea della musica» —
 * collassano su una sola chiave e una delle due SPARISCE. Un archivio che
 * perde una delibera è peggio di un archivio che ne mostra una in più.
 *
 * Misurato su 26.943 righe: 26.591 atti distinti.
 */
export function chiaveAtto(c: ChiaveAtto): string {
  if (c.anno > 0 && c.numero > 0) return `${c.tipo}|${c.anno}/${c.numero}`;
  if (c.annoRegistrazione > 0 && c.numeroRegistrazione > 0) {
    return `${c.tipo}|reg:${c.annoRegistrazione}/${c.numeroRegistrazione}`;
  }
  return `${c.tipo}|pub:${c.idPubblicazione}`;
}

/** L'id della pubblicazione, che sta in fondo all'`Url atto`. */
export function idPubblicazione(urlAtto: string): string {
  return urlAtto.match(/\/display\/(\d+)/)?.[1] ?? urlAtto;
}

// ---------------------------------------------------------------------------
// Il tema civico, dedotto dall'ufficio proponente
// ---------------------------------------------------------------------------

/** Minuscole, accenti e apostrofi via. NFD + `\p{M}`: i segni combinanti non
 *  stanno in `\p{L}`, e dimenticarlo taglia gli accenti decomposti a metà. */
function normalizzaUfficio(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Regole per RADICE, in ordine: la prima che combacia vince. Un elenco
 * esaustivo dei 102 uffici di oggi si romperebbe in silenzio al 103°, e in
 * cinque anni di riorganizzazioni le varianti sono già molte
 * (`U.O. Mobilita'` e `U.O. Mobilita', Traffico e Segnaletica`).
 *
 * `null` significa «nessun tema civico», ed è un esito legittimo: un atto
 * senza tema è un fatto, un atto col tema sbagliato è un'affermazione falsa su
 * una decisione del Comune.
 */
const REGOLE_UFFICIO: ReadonlyArray<readonly [RegExp, CivicTopicKey | null]> = [
  // ---- Le esclusioni vengono PRIMA: uffici il cui nome contiene una radice
  // civica ma il cui mestiere è amministrativo. `U.O. Tassa Sui Rifiuti…`
  // contiene «rifiuti» ed è un ufficio tributi.
  [/tassa sui rifiuti|contenzioso tributario|imposte sugli immobili|imposta sulla pubblicita|entrate patrimoniali/, null],
  [/affari legali|spese di lite|procedimenti sanzionatori|procedure sanzionatorie|procedimento sanzionatorio|contenzioso/, null],
  [/personale|organizzazione, gestione e formazione|organizzazione, formazione/, null],
  [/bilancio|gestioni economali|contabile|contrattualistica|provveditorato|sua, contratti|stazione unica appaltante|finanziario|pianificazione, controllo|programmazione operativa|inventari/, null],
  [/segreteria|protocollo|sistemi informativi|informatici|privacy e statistica|privacy, sit|affari generali|servizi ausiliari|gestione amministrativa|gestione logistica/, null],
  [/anagrafe|stato civile|demografic|elettorale|leva/, null],
  [/rimborsi|oggetti smarriti/, null],
  // Urbanistica ed edilizia privata NON sono lavori pubblici: un permesso di
  // costruire non è un'opera. Deciso il 2026-08-11 (misurato prima): un tema
  // «urbanistica» avrebbe zero agganci nelle quattro tassonomie di contenuto e
  // vivrebbe solo di atti — resta fuori finché una tassonomia non avrà una
  // categoria urbanistica, o finché l'archivio (Ondata 11) non mostrerà il
  // bisogno del filtro davanti alla pagina vera. Vedi docs/fonti-atti.md §4.3.
  [/urbanistic|edilizia privata|paesaggistica|pianificazione intermedia|citta storica/, null],
  // Sicurezza sul lavoro (D.Lgs 81), non sicurezza urbana.
  [/prevenzione e protezione|prevenzione, protezione/, null],

  // ---- I temi veri, dal più specifico al più generico.
  [/edilizia scolastica|servizi educativi|educazione|istruzione|sistema educativo|scolastic/, "scuole"],
  [/viabilit|mobilit|traffico|segnaletica/, "mobilita"],
  [/protezione civile|polizia municipale|polizia locale|sicurezza del territorio|assetto idrogeologico|polizia edilizia/, "sicurezza"],
  [/verde pubblico|ambiente|tutela degli animali/, "ambiente"],
  [/cultura|bibliotec|musei|beni culturali/, "cultura"],
  [/sportiv/, "sport"],
  [/turismo/, "turismo"],
  [/commercio|annona|suap|attivita produttive|sviluppo economico|promozione territoriale/, "commercio"],
  // «Sociale e casa», deciso il 2026-08-11: i tre uffici del welfare e
  // dell'abitare (940 atti misurati, 176 negli ultimi 12 mesi). L'apostrofo di
  // «Opportunita'» diventa spazio in normalizzaUfficio, quindi la radice è
  // senza accento e senza apostrofo.
  [/servizi per l abitare|progettazione sociale|inclusione sociale|pari opportunita|promozione dell integrazione/, "sociale"],
  [/lavori pubblici|llpp|grandi opere|patrimonio|espropri|energia|impianti|infrastrutture/, "lavori"],
];

/**
 * Il tema civico di un atto si legge dall'ufficio che l'ha proposto.
 *
 * Il nome di un ufficio è composto, e il mestiere PRIMARIO è quello che apre:
 * «Servizio **Lavori Pubblici**, Patrimonio, Verde e Promozione Sportiva» fa
 * lavori pubblici, non sport. Si prova quindi prima il segmento di testa e poi
 * il nome intero — senza questa regola 395 atti di lavori pubblici finivano in
 * Sport e 66 di ambiente in Sicurezza.
 *
 * Copertura misurata: 18.515 atti su 26.978 (69%). Il resto è amministrazione
 * interna, per cui «nessun tema» è la risposta giusta.
 */
export function temaCivicoDaUfficio(ufficio: string): CivicTopicKey | null {
  const intero = normalizzaUfficio(ufficio);
  if (!intero) return null;
  const testa = intero.split(",")[0].trim();
  for (const [re, tema] of REGOLE_UFFICIO) if (re.test(testa)) return tema;
  for (const [re, tema] of REGOLE_UFFICIO) if (re.test(intero)) return tema;
  return null;
}

// ---------------------------------------------------------------------------
// Il CSV del portale
// ---------------------------------------------------------------------------

/**
 * Parser CSV vero: i campi virgolettati contengono virgole E a capo — gli
 * oggetti degli atti arrivano a 1.290 caratteri con dentro di tutto. Uno
 * `split(",")` spezzerebbe le righe in silenzio.
 */
export function parseCsv(testo: string): string[][] {
  const righe: string[][] = [];
  let campo = "";
  let riga: string[] = [];
  let dentro = false;
  for (let i = 0; i < testo.length; i++) {
    const c = testo[i];
    if (dentro) {
      if (c === '"') {
        if (testo[i + 1] === '"') {
          campo += '"';
          i++;
        } else dentro = false;
      } else campo += c;
    } else if (c === '"') dentro = true;
    else if (c === ",") {
      riga.push(campo);
      campo = "";
    } else if (c === "\n") {
      riga.push(campo);
      righe.push(riga);
      riga = [];
      campo = "";
    } else if (c !== "\r") campo += c;
  }
  if (campo || riga.length) {
    riga.push(campo);
    righe.push(riga);
  }
  return righe.filter((r) => r.length > 1 || r[0]?.trim());
}

/**
 * Righe come oggetti indicizzati per NOME di colonna.
 *
 * ⚠️ È la difesa contro la trappola §2.3: «Provvedimenti organi indirizzo
 * politico» ha 24 colonne, le altre tre 25 — in mezzo compare `Spesa
 * prevista`. Un parser posizionale sfalsa tutto ciò che viene dopo
 * `Data atto` su una griglia su quattro, senza dare errore.
 */
export function righeConIntestazione(testo: string): Record<string, string>[] {
  const righe = parseCsv(testo);
  if (righe.length < 1) return [];
  const testa = righe[0].map((c) => c.trim());
  return righe.slice(1).map((r) => {
    const o: Record<string, string> = {};
    testa.forEach((c, i) => {
      o[c] = (r[i] ?? "").trim();
    });
    return o;
  });
}

/** `31/12/2031` → Date. Il portale scrive solo in questo formato (verificato
 *  su 26.943 righe: zero eccezioni), ma una data illeggibile torna null
 *  invece di diventare un 1970 plausibile. */
export function dataItaliana(s: string): Date | null {
  const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, g, me, a] = m;
  const d = new Date(`${a}-${me}-${g}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Il portale risponde **500** con una pagina «Web Page Blocked» quando lo
 * user-agent sa di automazione: è il WAF, non un guasto. Chi legge lo stato
 * conclude «il portale è giù»; chi legge il corpo sa che è «ci hanno scambiati
 * per un bot», che si ripara e va detto in modo diverso.
 *
 * 🔴 **La finestra era 4.000 caratteri e non bastava, misurato il 2026-08-11
 * rompendo la lettura di proposito.** La pagina di blocco vera è lunga 39.133
 * caratteri e comincia con ~19KB di CSS inline: il `<title>` con la frase
 * incriminata arriva a **19.205**, «Web Page Blocked» a **38.709** e `MDAWAF`
 * a **38.749**. Dentro i primi 4.000 non c'è nessuna delle tre spie, quindi
 * questa funzione rispondeva `false` proprio sul caso per cui esiste, e la
 * lettura archiviava «errore» dove il fatto era «bloccata» — cioè la
 * distinzione che `docs/fonti-atti.md` §2.1 dichiara essenziale, perché le due
 * cose si riparano in modo diverso.
 *
 * 64.000 copre la pagina intera con margine. Non si guarda tutto il corpo
 * perché l'export dello storico è di 13,4MB e la spia, se c'è, è in testa.
 */
export function paginaDiBlocco(corpo: string): boolean {
  return /Web Page Blocked|The URL you requested has been blocked|MDAWAF/i.test(corpo.slice(0, 64_000));
}

/** L'export grande dichiara `text/html` e manda CSV: il tipo mente, il corpo
 *  no. Si riconosce dall'intestazione, che è sempre la stessa. */
export function sembraCsvDegliAtti(corpo: string): boolean {
  return corpo.trimStart().startsWith('"Proponente"');
}

// ---------------------------------------------------------------------------
// Il barattolo dei cookie
// ---------------------------------------------------------------------------

/**
 * La lettura non usa un browser (decisione del 2026-08-11, misurata): il WAF
 * guarda lo user-agent e l'export vuole la sessione del portlet, e tutte e due
 * le cose si fanno con `fetch` più questi cookie. Serviva Chromium — 427MB per
 * immagine, su un disco che si è già riempito al 100% una volta — per due
 * richieste GET.
 *
 * Il barattolo è volutamente minimo: nomi e valori, l'ultimo vince. Non serve
 * niente di più perché vive quanto una lettura di una griglia, in un processo
 * che non parla con nessun altro dominio — quindi `Domain`, `Path`, `Expires`
 * e `Secure` non cambierebbero nessuna decisione.
 */
export type Barattolo = Map<string, string>;

/**
 * ⚠️ **Le stringhe di `Set-Cookie` si prendono da `getSetCookie()`, mai
 * concatenate.** Un `Expires=Wed, 09 Sep 2026 10:00:00 GMT` contiene una
 * virgola: chi legge l'intestazione unita e la spezza sulle virgole taglia il
 * cookie in mezzo alla data e si porta a casa un nome che è un pezzo di data.
 * `Headers.getSetCookie()` restituisce le intestazioni già separate, ed è la
 * ragione per cui questa funzione prende un array e non una stringa.
 */
export function raccogliCookie(barattolo: Barattolo, intestazioni: readonly string[]): Barattolo {
  for (const riga of intestazioni) {
    const coppia = riga.split(";")[0];
    const i = coppia.indexOf("=");
    if (i <= 0) continue;
    const nome = coppia.slice(0, i).trim();
    const valore = coppia.slice(i + 1).trim();
    if (nome) barattolo.set(nome, valore);
  }
  return barattolo;
}

/** Il barattolo come intestazione `Cookie`. Vuoto = nessuna intestazione. */
export function intestazioneCookie(barattolo: Barattolo): string {
  return [...barattolo].map(([n, v]) => `${n}=${v}`).join("; ");
}

// ---------------------------------------------------------------------------
// Da riga del CSV ad atto
// ---------------------------------------------------------------------------

export type AttoLetto = {
  chiave: string;
  tipo: TipoAtto;
  anno: number;
  numero: number;
  oggetto: string;
  ufficio: string;
  temaCivico: CivicTopicKey | null;
  dirigente: string | null;
  /** Manca in 1 riga su 26.588 (un decreto del Sindaco del 2024). Si ordina
   *  per `inizioPubblicazione`, che invece c'è sempre. */
  dataAtto: Date | null;
  dataEsecutivita: Date | null;
  numeroAllegati: number;
  inizioPubblicazione: Date;
  finePubblicazione: Date | null;
  urlFonte: string;
  idPubblicazione: string;
  /** Serve a scegliere fra due pubblicazioni dello stesso atto. */
  numeroRegistrazione: number;
};

/**
 * Traduce una riga in un atto, oppure `null` se la riga non è un atto del
 * Comune o se le manca qualcosa senza cui non si può stare in archivio.
 * Non lancia: una riga malformata non deve far cadere una lettura di 26.588.
 */
export function rigaAdAtto(r: Record<string, string>): AttoLetto | null {
  const tipo = (r["Titolo sottocategoria"] ?? "").trim();
  if (!isTipoAtto(tipo)) return null;

  const oggetto = (r["Oggetto"] ?? "").trim();
  const urlFonte = (r["Url atto"] ?? "").trim();
  const inizio = dataItaliana(r["Data inizio pubblicazione"] ?? "");
  // Il minimo per stare in archivio: che cosa dice, da dove viene, e quando è
  // stato pubblicato. La fonte è obbligatoria perché il renderer rifiuta chi
  // non ce l'ha.
  //
  // ⚠️ `Data atto` NON è nel minimo, e la ragione è misurata: manca in una
  // riga su 26.588 — un decreto vero del Sindaco, con oggetto, fonte e data di
  // pubblicazione. Pretenderla buttava via un atto reale per un campo
  // secondario, e un archivio che perde un atto è peggio di uno con una data
  // vuota.
  if (!oggetto || !urlFonte || !inizio) return null;

  const num = (k: string) => {
    const n = Number.parseInt((r[k] ?? "").trim(), 10);
    return Number.isFinite(n) ? n : 0;
  };
  const ufficio = (r["Proponente descrizione"] ?? "").trim();
  const idPub = idPubblicazione(urlFonte);

  return {
    chiave: chiaveAtto({
      tipo,
      anno: num("Anno"),
      numero: num("Numero"),
      annoRegistrazione: num("Anno registrazione"),
      numeroRegistrazione: num("Numero registrazione"),
      idPubblicazione: idPub,
    }),
    tipo,
    anno: num("Anno"),
    numero: num("Numero"),
    oggetto,
    ufficio,
    temaCivico: temaCivicoDaUfficio(ufficio),
    dirigente: (r["Dirigente descrizione"] ?? "").trim() || null,
    dataAtto: dataItaliana(r["Data atto"] ?? ""),
    dataEsecutivita: dataItaliana(r["Data esecutività"] ?? ""),
    numeroAllegati: num("Numero allegati"),
    inizioPubblicazione: inizio,
    finePubblicazione: dataItaliana(r["Data fine pubblicazione"] ?? ""),
    urlFonte,
    idPubblicazione: idPub,
    numeroRegistrazione: num("Numero registrazione"),
  };
}

/** Le griglie da cui una riga può venire. */
export const GRIGLIE = ["storico", "albo", "provvedimenti", "generali"] as const;
export type Griglia = (typeof GRIGLIE)[number];

/**
 * Fra due pubblicazioni dello stesso atto vince quella da tenere.
 *
 * 1. **Lo storico batte l'albo**, perché l'URL dell'albo SCADE (mediana 15
 *    giorni) mentre quello dello storico è tenuto fino al 2031: conservare il
 *    primo significa mettere in archivio un collegamento che morirà.
 * 2. A parità di griglia vince il **numero di registrazione più alto**, cioè
 *    la pubblicazione più recente. È ciò che serve nell'unico caso misurato in
 *    cui le due copie differiscono davvero: una delle due dice di sé
 *    «PUBBLICAZIONE ERRATA (MANCANTE CERTIFICATO)», e la più recente è quella
 *    corretta.
 */
export function vinceSu(candidato: { griglia: Griglia; numeroRegistrazione: number }, attuale: { griglia: Griglia; numeroRegistrazione: number }): boolean {
  const peso = (g: Griglia) => (g === "storico" ? 2 : 1);
  if (peso(candidato.griglia) !== peso(attuale.griglia)) {
    return peso(candidato.griglia) > peso(attuale.griglia);
  }
  return candidato.numeroRegistrazione > attuale.numeroRegistrazione;
}

// ---------------------------------------------------------------------------
// La freschezza — soglie condivise fra il cancello e il cruscotto
// ---------------------------------------------------------------------------

/**
 * Dieci giorni, e non è un numero scelto a occhio. Misurato su 1.364 giorni di
 * pubblicazione fra il 2021 e il 2026: fra due giorni con almeno un atto la
 * mediana è **1 giorno**, il 99° percentile 4, e il buco più lungo mai visto
 * in cinque anni e mezzo è **5 giorni** — Ferragosto e Natale compresi. Dieci
 * è il doppio del peggiore osservato: mai rosso a torto, e uno stallo si vede
 * in poco più di una settimana.
 *
 * Una soglia condivisa si IMPORTA, non si riscrive: la usano il cancello
 * (`scripts/atti-freschezza.ts`) e il monitor sul cruscotto, e un test
 * verifica che restino la stessa.
 */
export const GIORNI_MASSIMI_SENZA_ATTI = 10;

/** La lettura gira ogni giorno; due giri saltati sono un fatto, non un ritardo. */
export const ORE_MASSIME_SENZA_LETTURA = 48;

export type StatoArchivio = "aggiornato" | "fermo" | "mai-letto";

/**
 * Lo stato dell'archivio in una parola, con le stesse soglie del cancello.
 * «fermo» non distingue il perché — lo fa il cancello, che ha i dettagli —
 * ma il cruscotto deve almeno smettere di dire «aggiornato».
 */
export function statoArchivio(dati: {
  totaleAtti: number;
  ultimaPubblicazione: Date | null;
  ultimaLetturaRiuscita: Date | null;
  adesso: Date;
}): StatoArchivio {
  if (dati.totaleAtti === 0) return "mai-letto";
  const oreDaLettura = dati.ultimaLetturaRiuscita
    ? (dati.adesso.getTime() - dati.ultimaLetturaRiuscita.getTime()) / 3_600_000
    : Infinity;
  const giorniDaPubblicazione = dati.ultimaPubblicazione
    ? (dati.adesso.getTime() - dati.ultimaPubblicazione.getTime()) / 86_400_000
    : Infinity;
  return oreDaLettura <= ORE_MASSIME_SENZA_LETTURA && giorniDaPubblicazione <= GIORNI_MASSIMI_SENZA_ATTI
    ? "aggiornato"
    : "fermo";
}

// Autocontrollo in sviluppo: ogni tema prodotto dalle regole deve esistere
// nella tassonomia canonica. Un refuso qui lascerebbe atti con un tema che
// nessuna pagina sa mostrare — lo stesso guardiano che civic-topics.ts tiene
// sulle proprie categorie.
if (process.env.NODE_ENV !== "production") {
  for (const [re, tema] of REGOLE_UFFICIO) {
    if (tema !== null && !(tema in CIVIC_TOPICS)) {
      throw new Error(`REGOLE_UFFICIO: tema "${tema}" (regola ${re}) non esiste in CIVIC_TOPICS`);
    }
  }
}
