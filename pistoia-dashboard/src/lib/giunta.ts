/**
 * La giunta del Comune di Pistoia — nove persone reali, ognuna con la fonte
 * che la dichiara.
 *
 * Modulo **neutro** di proposito (niente `"use client"`, niente `server-only`):
 * lo importano la pagina, che è un Server Component, il seed, che gira in Node,
 * e i test (AGENTS.md §3, ondata 6/5).
 *
 * ## Perché questi fatti non stanno nel seed
 *
 * Il seed contiene dati **dimostrativi**: segnalazioni, proposte e sondaggi
 * inventati, dichiarati come tali dal banner «Anteprima». Le persone di questo
 * modulo non sono in quella categoria — sono amministratori in carica, e un
 * dato sbagliato su di loro è un'affermazione su di loro. Tenerli in un file
 * che si chiama «seed», accanto a «Lampione spento in via Roma», confonde le
 * due cose nel punto in cui la distinzione conta di più.
 *
 * Il seed **importa da qui**: la tabella `Assessore` esiste solo per ancorare
 * i «Segui», e non conserva nessun fatto.
 *
 * ## La regola che governa il modulo
 *
 * Ogni persona è una riga con la propria fonte, e {@link componentiPubblicabili}
 * **scarta** chi non ne porta una. È la stessa regola di
 * `lib/costo-amministrazione.ts`, da cui questo modulo importa {@link Riga} e
 * `rigaPubblicabile` invece di ridefinirli: due definizioni della stessa regola
 * sono peggio di nessuna regola (AGENTS.md §3, ondata 7).
 *
 * ## Che cosa NON c'è, e perché
 *
 * **Le preferenze elettorali.** Il campo `votesElected` è stato rimosso, non
 * riempito con numeri veri, e la ragione è che per cinque persone su nove il
 * numero non esiste in nessuna fonte:
 *
 * 1. Un **candidato sindaco non riceve preferenze** — è votato sulla scheda del
 *    sindaco. Nell'elenco dei 357 candidati alle comunali del 24–25 maggio 2026
 *    «Giovanni Capecchi» non compare affatto.
 * 2. **Quattro assessori su otto non erano candidati** in nessuna delle dodici
 *    liste: Banci, Setaro, Sinimberghi e Trallori sono nomine del sindaco. Dare
 *    un numero agli altri quattro e lasciare vuoto a loro non è neutro — quel
 *    vuoto si legge «questi non li ha votati nessuno», che è falso.
 * 3. Per i quattro che una preferenza ce l'hanno (Nesi 1.776, Giusti 670,
 *    Nesti 463, Giannessi 368) il numero descrive **un seggio che hanno
 *    lasciato**: il TUEL art. 64 dichiara la carica di assessore incompatibile
 *    con quella di consigliere, e chi accetta la nomina «cessa dalla carica di
 *    consigliere all'atto dell'accettazione».
 * 4. E perfino il numero del sindaco è ambiguo: il portale elettorale del
 *    Comune si dichiara «DATI NON UFFICIALI» e ne consente tre letture (22.512
 *    voti al candidato, 21.478 al netto dei voti al solo sindaco, 21.572 come
 *    somma delle liste della coalizione), mentre la stampa ne pubblica una
 *    quarta.
 *
 * Al suo posto c'è {@link Componente.insediamento}, che dice **come** ciascuno
 * è arrivato dov'è: è vero per tutti e nove e viene da una fonte sola.
 *
 * Documentazione completa delle fonti: `docs/fonti-organigramma.md`.
 */

import { rigaPubblicabile, type Riga } from "./costo-amministrazione";

export type { Riga };

/** Data della ricognizione che ha prodotto ogni riga di questo modulo. */
const CONSULTATE = "2026-08-03";

export type RuoloGiunta = "sindaco" | "vicesindaca" | "assessore";

export type Componente = {
  /** Slug stabile: è anche la chiave della riga `Assessore`, così i «Segui» sopravvivono a un riseed. */
  id: string;
  nome: string;
  /**
   * La carica **alla lettera** come la scrive il Comune, genere compreso.
   * Non si deriva da un flag: «Assessora»/«Assessore» è una scelta del Comune
   * per quella persona, e riprodurla è più corretto che ricostruirla.
   */
  carica: string;
  ruolo: RuoloGiunta;
  /** Come questa persona è arrivata alla carica. Sostituisce le preferenze. */
  insediamento: string;
  /** Le deleghe enumerate dalla scheda, nell'ordine in cui la scheda le elenca. */
  deleghe: string[];
  /** Letta dal `mailto:` della scheda, mai dedotta da uno schema. */
  email: string;
  iniziali: string;
  colore: string;
  ordine: number;
  /** Ultimo aggiornamento dichiarato dalla scheda, ISO `AAAA-MM-GG`. */
  aggiornamentoScheda: string;
  riga: Riga;
};

const SCHEDA = "https://www.comune.pistoia.it/it/person/";

/**
 * Nove persone, nove fonti distinte.
 *
 * Ogni riga punta alla **scheda personale**, non alla notizia di presentazione
 * della giunta del 10 giugno 2026. Due ragioni: la notizia dà solo la carica e
 * non le deleghe enumerate, e due schede sono state aggiornate dopo (Nesi il 28
 * luglio, Giusti il 21 luglio). La scheda è la fonte più fresca.
 */
export const GIUNTA: Componente[] = [
  {
    id: "giovanni-capecchi",
    nome: "Giovanni Capecchi",
    carica: "Sindaco",
    ruolo: "sindaco",
    insediamento: "Eletto alle comunali del 24 e 25 maggio 2026, proclamato il 27 maggio",
    deleghe: [
      "Rappresentanza del Comune e direzione dell'attività politico-amministrativa",
      "Nomina e revoca degli assessori",
      "Convocazione e presidenza della giunta",
      "Ordinanze",
      "Coordinamento degli orari degli esercizi commerciali e dei servizi pubblici",
      "Nomina dei rappresentanti del Comune in enti e società partecipate",
    ],
    email: "sindaco@comune.pistoia.it",
    iniziali: "GC",
    colore: "red",
    ordine: 0,
    aggiornamentoScheda: "2026-06-15",
    riga: {
      affermazione:
        "«Il 27 maggio 2026 è stato proclamato sindaco di Pistoia Giovanni Capecchi, eletto alle consultazioni amministrative del 24 e 25 maggio.» La pagina elenca le competenze del sindaco e pubblica il recapito sindaco@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Sindaco",
      urlFonte: "https://www.comune.pistoia.it/it/unita_organizzative/sindaco",
      dataConsultazione: CONSULTATE,
    },
  },
  {
    id: "stefania-nesi",
    nome: "Stefania Nesi",
    carica:
      "Vicesindaca, Assessora a Politiche strategiche di area vasta, Attività produttive, Progettazione europea",
    ruolo: "vicesindaca",
    insediamento: "Nominata dal sindaco",
    deleghe: [
      "Politiche strategiche di area vasta",
      "Attività produttive, vivaismo e sviluppo economico sostenibile",
      "Progettazione europea",
      "Rapporti con il Consiglio Comunale",
    ],
    email: "s.nesi@comune.pistoia.it",
    iniziali: "SN",
    colore: "teal",
    ordine: 1,
    aggiornamentoScheda: "2026-07-28",
    riga: {
      affermazione:
        "Scheda personale: «Vicesindaca, Assessora a Politiche strategiche di area vasta, Attività produttive, Progettazione europea», con quattro deleghe enumerate e il recapito s.nesi@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Stefania Nesi",
      urlFonte: `${SCHEDA}nesi-stefania-1000482`,
      dataConsultazione: CONSULTATE,
    },
  },
  {
    id: "olimpia-banci",
    nome: "Olimpia Banci",
    carica: "Assessora a Commercio, Turismo, Sicurezza urbana",
    ruolo: "assessore",
    insediamento: "Nominata dal sindaco",
    deleghe: [
      "Turismo",
      "Strategie di promozione territoriale",
      "Commercio",
      "Arredo e riqualificazione urbana",
      "Sicurezza urbana",
      "Polizia locale",
      "Gemellaggi",
    ],
    email: "o.banci@comune.pistoia.it",
    iniziali: "OB",
    colore: "amber",
    ordine: 2,
    aggiornamentoScheda: "2026-06-15",
    riga: {
      affermazione:
        "Scheda personale: «Assessora a Commercio, Turismo, Sicurezza urbana», con sette deleghe enumerate e il recapito o.banci@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Olimpia Banci",
      urlFonte: `${SCHEDA}banci-olimpia`,
      dataConsultazione: CONSULTATE,
    },
  },
  {
    id: "sandro-giannessi",
    nome: "Sandro Giannessi",
    carica: "Assessore a Sociale, Salute, Politiche per la casa",
    ruolo: "assessore",
    insediamento: "Nominato dal sindaco",
    deleghe: [
      "Politiche di tutela e promozione della salute",
      "Politiche di inclusione sociale",
      "Politiche del volontariato e terzo settore",
      "Problematiche abitative ed edilizia residenziale pubblica",
    ],
    email: "s.giannessi@comune.pistoia.it",
    iniziali: "SG",
    colore: "red",
    ordine: 3,
    aggiornamentoScheda: "2026-06-18",
    riga: {
      affermazione:
        "Scheda personale: «Assessore a Sociale, Salute, Politiche per la casa», con quattro deleghe enumerate e il recapito s.giannessi@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Sandro Giannessi",
      urlFonte: `${SCHEDA}giannessi-sandro`,
      dataConsultazione: CONSULTATE,
    },
  },
  {
    id: "matteo-giusti",
    nome: "Matteo Giusti",
    carica:
      "Assessore a Lavori pubblici, Mobilità, Sport, Periferie e Decentramento, Politiche per la collina e la montagna",
    ruolo: "assessore",
    insediamento: "Nominato dal sindaco",
    deleghe: [
      "Lavori pubblici",
      "Edilizia scolastica",
      "Edilizia cimiteriale e cimiteri",
      "Politiche per l’accessibilità",
      "Mobilità e viabilità urbana e metropolitana",
      "Trasporto pubblico locale",
      "Viabilità e infrastrutture",
      "Politiche per le aree periferiche",
      "Impiantistica sportiva",
      "Promozione sportiva",
      "Assetto idrogeologico",
      "Politiche per la fascia collinare e montana",
    ],
    email: "m.giusti@comune.pistoia.it",
    iniziali: "MG",
    colore: "viola",
    ordine: 4,
    aggiornamentoScheda: "2026-07-21",
    riga: {
      affermazione:
        "Scheda personale: «Assessore a Lavori pubblici, Mobilità, Sport, Periferie e Decentramento, Politiche per la collina e la montagna», con dodici deleghe enumerate e il recapito m.giusti@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Matteo Giusti",
      urlFonte: `${SCHEDA}giusti-matteo-1000511`,
      dataConsultazione: CONSULTATE,
    },
  },
  {
    id: "mattia-nesti",
    nome: "Mattia Nesti",
    carica: "Assessore a Bilancio, Partecipate, Patrimonio, Ambiente",
    ruolo: "assessore",
    insediamento: "Nominato dal sindaco",
    deleghe: [
      "Bilancio, Stazione appaltante e Provveditorato",
      "Entrate",
      "Gestione partecipate",
      "Rigenerazione del patrimonio immobiliare",
      "Ciclo dei rifiuti",
      "Sostenibilità",
      "Economia Circolare",
      "Politiche energetiche e Transizione ecologica",
      "Igiene",
    ],
    email: "m.nesti@comune.pistoia.it",
    iniziali: "MN",
    colore: "green",
    ordine: 5,
    aggiornamentoScheda: "2026-06-18",
    riga: {
      affermazione:
        "Scheda personale: «Assessore a Bilancio, Partecipate, Patrimonio, Ambiente», con nove deleghe enumerate e il recapito m.nesti@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Mattia Nesti",
      urlFonte: `${SCHEDA}nesti-mattia-1000477`,
      dataConsultazione: CONSULTATE,
    },
  },
  {
    id: "marica-setaro",
    nome: "Marica Setaro",
    carica: "Assessora a Cultura, Università e Tradizioni",
    ruolo: "assessore",
    insediamento: "Nominata dal sindaco",
    deleghe: [
      "Politiche culturali",
      "Attività ed Istituti culturali",
      "Tradizioni",
      "Università e ricerca",
      "Toponomastica",
      "Tempi ed orari della città",
    ],
    email: "m.setaro@comune.pistoia.it",
    iniziali: "MS",
    colore: "amber",
    ordine: 6,
    aggiornamentoScheda: "2026-06-15",
    riga: {
      affermazione:
        "Scheda personale: «Assessora a Cultura, Università e Tradizioni», con sei deleghe enumerate e il recapito m.setaro@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Marica Setaro",
      urlFonte: `${SCHEDA}setaro-marica`,
      dataConsultazione: CONSULTATE,
    },
  },
  {
    id: "elena-sinimberghi",
    nome: "Elena Sinimberghi",
    carica:
      "Assessora a Servizi educativi, Politiche del personale, Politiche giovanili e Pari opportunità",
    ruolo: "assessore",
    insediamento: "Nominata dal sindaco",
    deleghe: [
      "Diritto all’istruzione",
      "Formazione",
      "Politiche giovanili",
      "Pari opportunità",
      "Organizzazione della struttura comunale",
      "Servizi demografici",
      "Statistica",
    ],
    email: "e.sinimberghi@comune.pistoia.it",
    iniziali: "ES",
    colore: "viola",
    ordine: 7,
    aggiornamentoScheda: "2026-06-19",
    riga: {
      affermazione:
        "Scheda personale: «Assessora a Servizi educativi, Politiche del personale, Politiche giovanili e Pari opportunità», con sette deleghe enumerate e il recapito e.sinimberghi@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Elena Sinimberghi",
      urlFonte: `${SCHEDA}sinimberghi-elena`,
      dataConsultazione: CONSULTATE,
    },
  },
  {
    id: "riccardo-trallori",
    nome: "Riccardo Trallori",
    carica: "Assessore a Urbanistica, Rigenerazione urbana, Verde pubblico",
    ruolo: "assessore",
    insediamento: "Nominato dal sindaco",
    deleghe: [
      "Governo del territorio",
      "Piano Strutturale e Piani Operativi Comunali",
      "Rigenerazione urbana",
      "Manutenzione e gestione del verde pubblico",
      "Progetti di riforestazione urbana",
      "Edilizia privata",
      "Innovazione digitale",
      "Diritti degli animali",
    ],
    email: "r.trallori@comune.pistoia.it",
    iniziali: "RT",
    colore: "green",
    ordine: 8,
    aggiornamentoScheda: "2026-06-15",
    riga: {
      affermazione:
        "Scheda personale: «Assessore a Urbanistica, Rigenerazione urbana, Verde pubblico», con otto deleghe enumerate e il recapito r.trallori@comune.pistoia.it.",
      fonte: "Comune di Pistoia — Riccardo Trallori",
      urlFonte: `${SCHEDA}trallori-riccardo`,
      dataConsultazione: CONSULTATE,
    },
  },
];

/**
 * La fonte che dichiara la giunta come **insieme**, distinta dalle nove schede.
 *
 * Serve a dire quante persone la compongono: da una scheda alla volta non si
 * ricava che siano nove e non dieci, e un elenco troncato che si presenta come
 * completo è un dato inventato per omissione.
 */
export const RIGA_GIUNTA: Riga = {
  affermazione:
    "La giunta comunale di Pistoia è composta dal sindaco Giovanni Capecchi e da otto assessori: Stefania Nesi (vicesindaca), Olimpia Banci, Sandro Giannessi, Matteo Giusti, Mattia Nesti, Marica Setaro, Elena Sinimberghi, Riccardo Trallori.",
  fonte: "Comune di Pistoia — Giunta comunale",
  urlFonte: "https://www.comune.pistoia.it/it/unita_organizzative/giunta-comunale",
  dataConsultazione: CONSULTATE,
};

/**
 * L'atto che spiega perché quattro assessori non hanno un numero di preferenze
 * e gli altri quattro non possono esibire quello che avevano.
 */
export const RIGA_INCOMPATIBILITA: Riga = {
  affermazione:
    "«La carica di assessore è incompatibile con la carica di consigliere comunale e provinciale»; chi la assume «cessa dalla carica di consigliere all'atto dell'accettazione della nomina». La deroga del comma 3 vale fino a 15.000 abitanti, quindi non per Pistoia.",
  fonte: "D.Lgs. 267/2000 (TUEL), art. 64 — Normattiva, testo vigente",
  urlFonte:
    "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2000-08-18;267~art64",
  dataConsultazione: CONSULTATE,
};

// ---------------------------------------------------------------------------
// Il rifiuto delle righe senza fonte
// ---------------------------------------------------------------------------

/** Chi può andare a schermo: solo chi porta una fonte consultabile. */
export function componentiPubblicabili(giunta: Componente[] = GIUNTA): Componente[] {
  return giunta
    .filter((c) => rigaPubblicabile(c.riga))
    .sort((a, b) => a.ordine - b.ordine);
}

export function sindaco(giunta: Componente[] = GIUNTA): Componente | null {
  return componentiPubblicabili(giunta).find((c) => c.ruolo === "sindaco") ?? null;
}

/** La giunta senza il sindaco: vicesindaca e assessori, nell'ordine dichiarato. */
export function assessori(giunta: Componente[] = GIUNTA): Componente[] {
  return componentiPubblicabili(giunta).filter((c) => c.ruolo !== "sindaco");
}

export type VoceDelega = { delega: string; componente: Componente };

/**
 * Tutte le deleghe di tutti, in ordine alfabetico — l'indice della pagina.
 *
 * Risponde alla domanda con cui si arriva sull'organigramma: «di *questo* chi
 * si occupa?». Un indice per persona obbligherebbe ad aprire otto schede per
 * sapere chi tiene «Toponomastica».
 *
 * Il sindaco resta fuori: le sue non sono deleghe di materia ma i poteri che il
 * TUEL gli attribuisce, e mescolarli farebbe cercare «Ordinanze» accanto a
 * «Trasporto pubblico locale».
 */
export function delegheIndicizzate(giunta: Componente[] = GIUNTA): VoceDelega[] {
  return assessori(giunta)
    .flatMap((componente) => componente.deleghe.map((delega) => ({ delega, componente })))
    .sort((a, b) => a.delega.localeCompare(b.delega, "it"));
}
