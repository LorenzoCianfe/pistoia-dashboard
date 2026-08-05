import {
  CONSERVAZIONE_IP_GIORNI,
  FINESTRA_CONDIZIONE_GIORNI,
  RICHIESTA_SILENZIO_GIORNI,
  SERVIZI,
  STELLE_MAX,
  STELLE_MIN,
  serviziDi,
} from "@/lib/valutazioni";
import { SILENZIO_POPUP_CHIUSO_GIORNI } from "@/lib/sollecitazioni";
import { CAMPIONE_MINIMO_PER_GIUDIZIO } from "@/lib/citystats";
import {
  MATERIE_PAGELLA,
  SCADENZA_ART14,
  VOTO_MAX,
  VOTO_MIN,
  controlliDi,
  dataItaliana,
  materieDi,
} from "@/lib/pagella";

/**
 * La metodologia dell'osservatorio — il documento, non la resa.
 *
 * È il **documento versionato nel repository** che `ROADMAP.md` §6
 * (prerequisito 3) chiede: `/metodologia` lo rende, le altre pagine lo
 * timbrano. Modulo **neutro** come `lib/valutazioni.ts`: lo importano le
 * pagine, i test e la pagella.
 *
 * Dalla v1.1 il documento ha **due capitoli** con una versione sola: le
 * «Valutazioni dei servizi» ({@link REGOLE}, regole 1–12) e «La pagella
 * della giunta» ({@link REGOLE_PAGELLA}, regole 13–20). Una versione per
 * capitolo permetterebbe a metà documento di cambiare in silenzio mentre
 * l'altra metà fa da alibi.
 *
 * ## Il cancello (R-6, piano §7)
 *
 * **Cambiare una regola in un posto solo cambia pagina E documento.** Ogni
 * numero nei testi arriva per interpolazione dalle costanti di dominio
 * (`lib/valutazioni.ts`, `lib/sollecitazioni.ts`, `lib/citystats.ts`): non
 * esiste una cifra ricopiata a mano che possa divergere da ciò che il codice
 * applica. `tests/unit/metodologia.test.ts` lo prova costante per costante.
 *
 * ## Il registro è append-only
 *
 * Una voce del registro non si riscrive e non si cancella: si aggiunge la
 * successiva. Una metodologia che cambia in silenzio è il modo in cui una
 * media scomoda viene soppressa — è la ragione per cui questo file esiste.
 */

// ---------------------------------------------------------------------------
// La versione e il registro
// ---------------------------------------------------------------------------

export const VERSIONE_METODOLOGIA = "1.1";

/** Il timbro che le pagine stampano in calce: «metodologia v1.0». */
export const TIMBRO_METODOLOGIA = `metodologia v${VERSIONE_METODOLOGIA}`;

export type VoceRegistro = {
  versione: string;
  /** `AAAA-MM-GG`. */
  data: string;
  cosa: string;
};

/** Dal più recente al più vecchio, come lo legge la pagina. */
export const REGISTRO_MODIFICHE: VoceRegistro[] = [
  {
    versione: "1.1",
    data: "2026-08-05",
    cosa:
      "Arriva il capitolo della pagella della giunta (regole 13–20): voto " +
      "1–10 ricontabile solo dove il traguardo è fissato da una norma " +
      "(1 + 9 × la quota dei controlli superati), sei materie a due regimi, " +
      "cadenza trimestrale, replica sempre dichiarata, valutazioni dei " +
      "cittadini accostate e mai sommate. Nessun voto è ancora calcolato: " +
      "la prima edizione non prima del termine dell'art. 14 (27 agosto 2026).",
  },
  {
    versione: "1.0",
    data: "2026-08-05",
    cosa:
      "Prima pubblicazione. La soglia provvisoria di 20 voti che il codice " +
      "portava dal 3 agosto — mai dichiarata come definitiva in nessuna " +
      "pagina — è sciolta in «nessuna soglia»: la media compare dal primo " +
      "voto, col campione sempre dichiarato accanto.",
  },
];

// ---------------------------------------------------------------------------
// Le regole
// ---------------------------------------------------------------------------

export type RegolaMetodologia = {
  /** Ancora stabile della voce: `/metodologia#nessuna-soglia`. */
  id: string;
  titolo: string;
  /** Ciò che vincola, in una o due frasi. */
  regola: string;
  /** Il perché onesto, compreso ciò che la regola costa. */
  perche: string;
  /** Dove chi legge la vede applicata, senza fidarsi sulla parola. */
  verifica: string;
  /** Il cancello reso leggibile: la definizione unica, per nome e file. */
  nelCodice: string;
};

/**
 * Le dodici regole. **Questo modulo le pubblica, non le inventa**: ognuna
 * esiste già nel codice, e la colonna `nelCodice` dice dove. L'ordine è di
 * lettura — prima cosa si vota, poi come si calcola, poi come ci si comporta.
 */
export const REGOLE: RegolaMetodologia[] = [
  {
    id: "cosa-si-vota",
    titolo: "Che cosa si vota",
    regola:
      `Si votano ${SERVIZI.length} caselle: ${serviziDi("sportello").length} ` +
      `servizi allo sportello e ${serviziDi("condizione").length} condizioni ` +
      `della città. I due tabelloni non si fondono mai in una classifica unica, ` +
      `e un «voto della città» non esiste.`,
    perche:
      "Uno sportello si giudica a episodi — una pratica, una data, un ufficio; " +
      "una condizione è un umore su uno stato continuo: metterli in fila unica " +
      "affermerebbe che sono confrontabili, e non lo sono. Le caselle sono " +
      "poche di proposito, perché pochi votanti divisi su troppi bersagli " +
      "produrrebbero solo schede che dicono «pochi dati».",
    verifica:
      "La panoramica apre su due tabelloni separati; la didascalia in fondo " +
      "dichiara che non si sommano.",
    nelCodice: "SERVIZI · src/lib/valutazioni.ts",
  },
  {
    id: "le-stelle",
    titolo: "La scala",
    regola:
      `Le stelle vanno da ${STELLE_MIN} a ${STELLE_MAX}, intere: ` +
      `${STELLE_MIN} è pessimo, ${STELLE_MAX} è ottimo. Un voto fuori scala ` +
      `viene scartato, mai corretto.`,
    perche:
      "È un intervallo fissato davvero, e da chi vota — a differenza della " +
      "scala a tacche tolta da /promesse, dove lo 0→totale non era il " +
      "traguardo di nessuno.",
    verifica:
      "Il modulo del voto offre esattamente cinque stelle; la media ignora " +
      "tutto il resto.",
    nelCodice: "STELLE_MIN · STELLE_MAX · stelleValide() · src/lib/valutazioni.ts",
  },
  {
    id: "nessuna-soglia",
    titolo: "Nessuna soglia minima",
    regola:
      "Una media si pubblica dal primo voto, sempre accompagnata dal numero " +
      "di valutazioni che la compone. Non esiste un numero minimo sotto il " +
      "quale il dato viene taciuto: l'unica assenza è l'assenza vera, zero voti.",
    perche:
      "Chi lascia una recensione tende a farlo quando è molto scontento o " +
      "molto contento: su pochi voti quella tendenza è gran parte del " +
      "risultato. Una soglia però tace il dato proprio dove i votanti sono " +
      "pochi — in una città media, quasi ovunque e quasi sempre. Si sceglie " +
      "la strada opposta: tutto si vede, e accanto a ogni media c'è quanto " +
      "pesa. Sta a chi legge pesarla, e la pagina gli dà il numero per farlo.",
    verifica:
      "Ogni scheda mostra il campione nella riga della composizione; " +
      "l'andamento dichiara i voti di ciascun mese nella tabella accessibile.",
    nelCodice:
      "media() · src/lib/valutazioni.ts — non esiste una costante di soglia: " +
      "il ramo che la applicava è stato rimosso con la v1.0",
  },
  {
    id: "la-media",
    titolo: "La media",
    regola:
      "Aritmetica semplice, arrotondata a una cifra decimale. Nessun peso, " +
      "nessuna correzione, nessuna esclusione oltre ai voti fuori scala e " +
      "alle valutazioni rimosse.",
    perche:
      "Ogni ponderazione sarebbe una scelta editoriale nascosta dentro un " +
      "numero. Se un giorno servisse, passerebbe da questo documento con una " +
      "versione nuova — mai dal codice in silenzio.",
    verifica:
      "La cifra in testata alla scheda; il registro delle rimozioni dice che " +
      "cosa è uscito dal calcolo, quando e perché.",
    nelCodice: "media() · src/lib/valutazioni.ts",
  },
  {
    id: "le-due-cadenze",
    titolo: "Le due cadenze",
    regola:
      `Gli sportelli mediano tutto lo storico. Le condizioni mediano una ` +
      `finestra mobile di ${FINESTRA_CONDIZIONE_GIORNI} giorni, e l'andamento ` +
      `mostra un punto al mese: un mese senza voti resta un buco dichiarato, ` +
      `mai uno zero.`,
    perche:
      "Una recensione di una pratica del 2024 resta vera come verbale di " +
      "quella visita; un voto sulla pulizia del 2024 è scaduto, perché la " +
      "strada è stata spazzata da allora. E uno zero al posto di un buco " +
      "direbbe «valutato pessimo», che è il contrario di «nessuno ha risposto».",
    verifica:
      "La testata delle condizioni dice «negli ultimi tre mesi»; la linea " +
      "dell'andamento si interrompe sui mesi senza voti invece di scendere.",
    nelCodice: "FINESTRA_CONDIZIONE_GIORNI · inizioFinestra() · src/lib/valutazioni.ts",
  },
  {
    id: "il-rinnovo-mensile",
    titolo: "Il rinnovo mensile",
    regola:
      "Su una condizione ogni persona vota una volta al mese: il voto vale un " +
      "mese e poi si rinnova. Sugli sportelli si vota a episodio, senza tetto. " +
      "La chiave d'identità è l'email, con o senza account.",
    perche:
      "È l'unica cadenza che rende l'andamento una misura: confronta le " +
      "stesse persone nel tempo invece di seguire chi si è iscritto di " +
      "recente. Un tetto sugli sportelli punirebbe chi ci va spesso, che è " +
      "esattamente chi ha più da dire.",
    verifica:
      "Il modulo rifiuta un secondo voto sulla stessa condizione nello " +
      "stesso mese, e lo dice.",
    nelCodice: "puoVotare() · periodoDi() · src/lib/valutazioni.ts",
  },
  {
    id: "la-composizione",
    titolo: "Da che cosa è fatta la media",
    regola:
      "Contano sia le valutazioni con email confermata sia quelle non " +
      "confermate. Quante sono le une e le altre, e quante arrivano dai QR " +
      "nei luoghi, è scritto accanto alla media — sempre.",
    perche:
      "È il modello Trustpilot, scelto a occhi aperti: nessun filtro su chi " +
      "vota, e la credibilità viene dalla trasparenza invece che dal " +
      "cancello. Il voto entra subito e la mail lo rende revocabile; la " +
      "conferma fa un lavoro visibile in pagina, invece di restare nel database.",
    verifica:
      "La riga della composizione sotto ogni media; i cartellini «email " +
      "confermata» e «da QR» sulle singole recensioni.",
    nelCodice: "composizione() · src/lib/valutazioni.ts",
  },
  {
    id: "il-quartiere",
    titolo: "Il quartiere",
    regola:
      "Le condizioni si votano sulla città intera e indicare il quartiere è " +
      "facoltativo. Un quartiere avrà la propria media dal primo voto suo; " +
      "oggi nessuna pagina la mostra ancora, e i voti col quartiere contano " +
      "comunque nel dato cittadino.",
    perche:
      "Cinque condizioni per dodici quartieri farebbero sessanta caselle che " +
      "dicono «pochi dati». La mappa arriverà quando ci sarà qualcosa da " +
      "mostrare; la regola è scritta ora perché non nasca a caso quel giorno.",
    verifica:
      "La tendina del quartiere nel modulo del voto è facoltativa, e la " +
      "scheda non mostra medie locali.",
    nelCodice: "quartiereSbloccato() · src/lib/valutazioni.ts",
  },
  {
    id: "la-colonna-dura",
    titolo: "Ciò che la piattaforma sa da sé",
    regola:
      `Accanto alle stelle ogni condizione porta le proprie segnalazioni: il ` +
      `conteggio si mostra sempre, la mediana dei giorni di chiusura solo da ` +
      `${CAMPIONE_MINIMO_PER_GIUDIZIO} casi chiusi in su. Sulla sicurezza ` +
      `urbana il volume delle segnalazioni non compare mai accanto alle stelle.`,
    perche:
      "Il conteggio è un fatto, la sintesi è un giudizio: un «caso tipico» " +
      "calcolato su due casi non è un caso tipico, e la colonna dura si " +
      "presenta come il lato solido della pagina — per questo tiene un " +
      "campione minimo anche ora che le medie a stelle non ne hanno. Sulla " +
      "sicurezza, più segnalazioni può voler dire più fiducia nel canale, non " +
      "più pericolo: accostarle a due stelle suggerirebbe un nesso che il " +
      "dato non contiene.",
    verifica:
      "Il riquadro «Cosa dicono le segnalazioni» sulla scheda; su Sicurezza " +
      "urbana la frase parla solo dei tempi di chiusura.",
    nelCodice:
      "colonnaDuraDa() · volumeAccostabile() · src/lib/valutazioni.ts — " +
      "CAMPIONE_MINIMO_PER_GIUDIZIO · src/lib/citystats.ts",
  },
  {
    id: "le-sollecitazioni",
    titolo: "Quando la piattaforma chiede",
    regola:
      `La piattaforma può chiedere una valutazione da più ingressi, ma con un ` +
      `contatore unico: dopo ogni richiesta tace con quella persona per ` +
      `${RICHIESTA_SILENZIO_GIORNI} giorni, su tutti i canali insieme — e ` +
      `anche un voto spontaneo chiude la finestra per ` +
      `${RICHIESTA_SILENZIO_GIORNI} giorni. Chiudere il pop-up con la X lo ` +
      `tace per ${SILENZIO_POPUP_CHIUSO_GIORNI} giorni. Il menu, i QR nei ` +
      `luoghi e il report del mese non contano come richieste.`,
    perche:
      "Sei ingressi che chiedono ciascuno per sé farebbero della piattaforma " +
      "una questua. Il contatore è ancorato all'account, e ne discende uno " +
      "scaglionamento voluto: il rinnovo arriva sempre ad almeno trenta " +
      "giorni dall'ultimo voto, non il primo del mese per tutti.",
    verifica:
      "Ogni richiesta è una riga in un registro che non si cancella mai; il " +
      "pop-up chiuso non ricompare al prossimo accesso.",
    nelCodice:
      "RICHIESTA_SILENZIO_GIORNI · src/lib/valutazioni.ts — " +
      "SILENZIO_POPUP_CHIUSO_GIORNI · puoSollecitare() · src/lib/sollecitazioni.ts",
  },
  {
    id: "le-conservazioni",
    titolo: "Quanto vivono i dati",
    regola:
      `L'indirizzo IP di un voto si cancella dopo ${CONSERVAZIONE_IP_GIORNI} ` +
      `giorni. L'email vive quanto la valutazione a cui appartiene e sparisce ` +
      `con lei. Il telefono non si raccoglie. Il promemoria mensile esiste ` +
      `solo su richiesta esplicita, dal voto appena lasciato; la revoca ` +
      `cancella la riga per intero.`,
    perche:
      "Due dati con due scopi hanno due vite: l'IP serve a riconoscere un " +
      "abuso, che si manifesta in giorni o settimane; l'email regge la regola " +
      "mensile e la revoca. Su una piattaforma dove si valuta anche la " +
      "sicurezza urbana, «chi ha criticato la polizia locale, e da quale " +
      "indirizzo» è la riga di rischio più alta del modello: si conserva il " +
      "minimo che lo scopo richiede.",
    verifica:
      "La dichiarazione su /privacy; il link di revoca in ogni mail di " +
      "conferma e in ogni promemoria.",
    nelCodice:
      "CONSERVAZIONE_IP_GIORNI · limiteConservazioneIp() · src/lib/valutazioni.ts",
  },
  {
    id: "chi-modera",
    titolo: "Chi modera, e chi non può",
    regola:
      "Rimuove solo la Redazione, che firma sempre come entità collettiva: " +
      "nessun nome proprio. Il Comune può rispondere e segnalare, mai " +
      "rimuovere. Ogni rimozione azzera il testo davvero e lascia una riga " +
      "nel registro pubblico, con data e motivo.",
    perche:
      "Chi è giudicato non può togliere il giudizio: è la separazione che " +
      "rende il diritto di replica una funzione invece che una concessione. " +
      "E il registro rende contestabile anche la moderazione stessa.",
    verifica:
      "Il registro delle rimozioni in fondo a ogni scheda; le risposte del " +
      "Comune firmate con la carica, sotto la recensione a cui rispondono.",
    nelCodice: "FIRMA_REDAZIONE · puoRimuovere() · src/lib/redazione.ts",
  },
];

// ---------------------------------------------------------------------------
// Capitolo 2 — La pagella della giunta (v1.1, regole 13–20)
// ---------------------------------------------------------------------------

/**
 * Le otto regole della pagella. Come il capitolo 1, **questo modulo le
 * pubblica, non le inventa**: vivono in `lib/pagella.ts` e la riga
 * `nelCodice` dice dove. La numerazione prosegue quella delle valutazioni
 * perché «regola 14» resti un riferimento unico in tutto il documento.
 */
export const REGOLE_PAGELLA: RegolaMetodologia[] = [
  {
    id: "chi-si-giudica",
    titolo: "Chi si giudica",
    regola:
      `La pagella giudica la giunta come organo collettivo: un voto su una ` +
      `singola persona non esiste e non esisterà. Le materie sono ` +
      `${MATERIE_PAGELLA.length}: ${materieDi("voto").length} a voto, ` +
      `${materieDi("fatti").length} a fatti, ` +
      `${materieDi("senza-fonte").length} in attesa di una fonte reale.`,
    perche:
      "Su una persona un voto sintetico comprime un record incompleto in un " +
      "numero che sembra completo. Al livello della giunta la responsabilità " +
      "è davvero collettiva — ed è l'unico livello a cui contare gli " +
      "adempimenti ha senso, perché gli obblighi sono dell'organo.",
    verifica:
      "Nessuna pagina della piattaforma mostra un numero accanto a un nome " +
      "proprio; la pagella non nomina persone.",
    nelCodice: "MATERIE_PAGELLA · materieDi() · src/lib/pagella.ts",
  },
  {
    id: "il-voto-ricontabile",
    titolo: "Il voto si riconta",
    regola:
      `Il voto va da ${VOTO_MIN} a ${VOTO_MAX}: ${VOTO_MIN} più ` +
      `${VOTO_MAX - VOTO_MIN} volte la quota dei controlli superati, ` +
      `arrotondata. Ogni controllo ha un traguardo fissato da una norma, mai ` +
      `dalla Redazione: ${controlliDi("trasparenza").length} controlli sulla ` +
      `Trasparenza, ${controlliDi("spesa").length} sulla Spesa. Il ` +
      `${VOTO_MAX} significa «tutto ciò che era dovuto», non «bravissimi».`,
    perche:
      "Una scala ha senso solo se il traguardo l'ha fissato qualcuno: è la " +
      "ragione per cui la scala a tacche è stata tolta da /promesse. Qui il " +
      "traguardo lo fissa la legge, e il voto resta un conteggio che " +
      "chiunque può rifare a mano dalle righe in pagina.",
    verifica:
      "Ogni card a voto elenca i propri controlli: contare i superati e " +
      "applicare la formula riproduce il voto stampato.",
    nelCodice: "votoPagella() · CONTROLLI · controlliDi() · src/lib/pagella.ts",
  },
  {
    id: "ogni-punto-una-riga",
    titolo: "Ogni punto è una riga con fonte",
    regola:
      "Ogni controllo di una edizione porta una riga con l'affermazione, la " +
      "fonte con URL e la data di consultazione. Se anche una sola riga di " +
      "una materia manca o resta senza URL, il voto dell'intera materia non " +
      "si pubblica — e la pagina dice quale riga manca.",
    perche:
      "Togliere dal denominatore i controlli senza prova gonfierebbe il voto " +
      "in silenzio; un voto che non può mostrare tutte le sue righe non si " +
      "riconta, e un voto che non si riconta è un'opinione.",
    verifica:
      "Ogni riga in pagina è un collegamento all'atto, con la data accanto; " +
      "una materia senza voto dichiara il perché.",
    nelCodice:
      "esitiPubblicabili() · votoMateria() · src/lib/pagella.ts — il modello " +
      "è Riga · src/lib/costo-amministrazione.ts",
  },
  {
    id: "dove-il-voto-non-ce",
    titolo: "Dove il voto non c'è",
    regola:
      "Dove nessuna norma fissa un traguardo, il voto non esiste: le " +
      "Promesse si censiscono a fatti, ognuno con la propria fonte, e le " +
      "materie senza una fonte reale dichiarano che cosa le accenderebbe. " +
      "Un trattino muto non è ammesso.",
    perche:
      "Il conteggio è un fatto, la sintesi è un giudizio: inventare un " +
      "traguardo pur di votare sarebbe una scelta editoriale nascosta dentro " +
      "un'aritmetica. E un voto calcolato su dati dimostrativi " +
      "riguarderebbe persone vere.",
    verifica:
      "Le card senza voto spiegano il perché in pagina, con le stesse parole " +
      "di questo documento.",
    nelCodice: "RegimeMateria · MATERIE_PAGELLA · src/lib/pagella.ts",
  },
  {
    id: "nessun-voto-dinsieme",
    titolo: "Nessun voto d'insieme",
    regola:
      "Le materie non si sommano: una media della giunta non esiste, così " +
      "come non esiste un «voto della città» per le valutazioni (regola 1).",
    perche:
      "Sarebbe la prima cifra citata fuori contesto — l'argomento che ha " +
      "rinominato il «Pistoia Index». Conteggi su traguardi diversi non sono " +
      "commensurabili, e una media li dichiarerebbe tali.",
    verifica: "Nessuna pagina mostra un numero unico della giunta.",
    nelCodice:
      "in src/lib/pagella.ts non esiste una funzione di somma fra materie: " +
      "l'assenza è il cancello",
  },
  {
    id: "la-cadenza-trimestrale",
    titolo: "La cadenza e il timbro",
    regola:
      `Un'edizione a trimestre, con la data di consultazione di ogni fonte e ` +
      `il timbro della versione che l'ha calcolata, scattato alla scrittura ` +
      `e mai ricalcolato. La prima edizione non prima del ` +
      `${dataItaliana(SCADENZA_ART14)}, il termine dell'art. 14 per la ` +
      `giunta in carica.`,
    perche:
      "Le fonti vere si muovono al più per trimestre — l'indicatore dei " +
      "pagamenti è trimestrale per legge — e un'edizione mensile " +
      "racconterebbe undici volte «nessun atto nuovo». Prima del termine, " +
      "un'assenza sul portale è ancora dentro la legge: giudicarla sarebbe " +
      "un'accusa tratta da un dato mancante. E senza timbro una pagella " +
      "vecchia diventa incontestabile, perché nessuno sa più con quali " +
      "regole fu prodotta.",
    verifica:
      "L'archivio delle edizioni, datate e timbrate; il colophon in calce " +
      "alla pagina.",
    nelCodice:
      "EDIZIONI · EdizionePagella.versioneMetodologia · SCADENZA_ART14 · " +
      "src/lib/pagella.ts",
  },
  {
    id: "la-replica",
    titolo: "La replica, in ogni stato",
    regola:
      "Ogni edizione ospita la replica della giunta allo stesso corpo del " +
      "giudizio, mai dietro un «vedi di più». Finché una replica non è " +
      "stata richiesta, la pagina lo dichiara; quando è richiesta, restano " +
      "scritte la data della richiesta e l'eventuale silenzio.",
    perche:
      "È la differenza fra un osservatorio e un tribunale senza difesa. Un " +
      "silenzio dichiarato è un'informazione; un silenzio nascosto sembra " +
      "assenso.",
    verifica:
      "Il blocco della replica esiste in ogni stato, anche quando dice solo " +
      "che nessuna replica è stata ancora richiesta.",
    nelCodice:
      "EdizionePagella.replicaRichiestaIl · replicaRicevutaIl · " +
      "src/lib/pagella.ts",
  },
  {
    id: "le-valutazioni-accostate",
    titolo: "Le stelle dei cittadini, accostate",
    regola:
      "Le valutazioni dei cittadini compaiono sulla pagella solo come " +
      "contesto accostato, col loro campione dichiarato: non entrano in " +
      "nessun voto, con nessun peso.",
    perche:
      "Le stelle sono un umore sui servizi, la pagella conta adempimenti " +
      "della giunta: sommarli affermerebbe che sono commensurabili, e " +
      "conterebbe due volte chi ha già giudicato. Si guardano insieme — " +
      "l'accostamento è il prodotto — ma non si sommano.",
    verifica:
      "Il riquadro «La voce dei cittadini» porta medie e campioni e nessun " +
      "numero delle materie; i voti delle materie non cambiano al cambiare " +
      "delle stelle.",
    nelCodice:
      "votoMateria() non legge le valutazioni · src/lib/pagella.ts — il " +
      "riquadro legge getPanoramica() · src/lib/data/valutazioni.ts",
  },
];

export function regolaMetodologia(id: string): RegolaMetodologia | null {
  return (
    REGOLE.find((r) => r.id === id) ??
    REGOLE_PAGELLA.find((r) => r.id === id) ??
    null
  );
}

// ---------------------------------------------------------------------------
// In breve
// ---------------------------------------------------------------------------

/**
 * Il sommario in testa alla pagina (forma A4): sei righe per chi non leggerà
 * le dodici regole. Anche qui i numeri sono interpolati, mai ricopiati.
 */
export const IN_BREVE: string[] = [
  `Le stelle vanno da ${STELLE_MIN} a ${STELLE_MAX} e le mettono i cittadini; la media è aritmetica, a una cifra decimale.`,
  "Nessuna soglia: la media compare dal primo voto, col numero di voti sempre accanto.",
  `Gli sportelli si giudicano a episodi, le condizioni sugli ultimi ${FINESTRA_CONDIZIONE_GIORNI} giorni, con rinnovo mensile.`,
  "Contano anche i voti non confermati: quanti e da dove, è dichiarato invece che filtrato.",
  `La piattaforma chiede con misura: mai più di una richiesta ogni ${RICHIESTA_SILENZIO_GIORNI} giorni, su tutti i canali insieme.`,
  "Rimuove solo la Redazione, con firma collettiva e registro pubblico; il Comune risponde, non cancella.",
];

/** Il sommario del capitolo 2, stessa forma: interpolato, mai ricopiato. */
export const IN_BREVE_PAGELLA: string[] = [
  "La pagella giudica la giunta come organo collettivo, mai una persona; le materie non si sommano in un voto unico.",
  `Il voto va da ${VOTO_MIN} a ${VOTO_MAX} ed è un conteggio ricontabile: ${VOTO_MIN} più ${VOTO_MAX - VOTO_MIN} volte la quota dei controlli superati, ognuno con un traguardo fissato da una norma.`,
  "Ogni punto è una riga con fonte e data di consultazione; se una riga manca, il voto dell'intera materia non esce.",
  `Un'edizione a trimestre, timbrata con la versione che l'ha calcolata; la prima non prima del ${dataItaliana(SCADENZA_ART14)}. Le stelle dei cittadini restano accostate, mai sommate.`,
];
