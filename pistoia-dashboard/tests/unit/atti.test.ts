import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  type Barattolo,
  chiaveAtto,
  dataItaliana,
  ETICHETTA_TIPO,
  GIORNI_MASSIMI_SENZA_ATTI,
  idPubblicazione,
  intestazioneCookie,
  isTipoAtto,
  paginaDiBlocco,
  parseCsv,
  raccogliCookie,
  righeConIntestazione,
  rigaAdAtto,
  sembraCsvDegliAtti,
  statoArchivio,
  temaCivicoDaUfficio,
  TIPI_ATTO,
  vinceSu,
} from "@/lib/atti";
import { CIVIC_TOPICS } from "@/lib/civic-topics";

/*
  Ogni test qui difende una trappola PAGATA leggendo il portale il 2026-08-09,
  non un caso immaginato. Le misure stanno in docs/fonti-atti.md.
*/

describe("il barattolo dei cookie · la sessione del portlet senza browser", () => {
  it("raccoglie nome e valore, e l'ultimo vince", () => {
    const b: Barattolo = new Map();
    raccogliCookie(b, ["JSESSIONID=ABC; Path=/; HttpOnly", "COOKIE_SUPPORT=true; Path=/"]);
    raccogliCookie(b, ["JSESSIONID=XYZ; Path=/"]);
    expect(b.get("JSESSIONID")).toBe("XYZ");
    expect(b.get("COOKIE_SUPPORT")).toBe("true");
    expect(intestazioneCookie(b)).toBe("JSESSIONID=XYZ; COOKIE_SUPPORT=true");
  });

  it("🔴 una data in `Expires` contiene una virgola, e non deve spezzare il cookie", () => {
    // È la ragione per cui `raccogliCookie` prende un ARRAY (da
    // `Headers.getSetCookie()`) e non l'intestazione unita: chi spezzasse
    // sulle virgole si porterebbe a casa un cookie che si chiama « 09 Sep 2026
    // 10:00:00 GMT» e perderebbe quello vero.
    const b: Barattolo = new Map();
    raccogliCookie(b, ["cookiesession1=678B2train; Expires=Wed, 09 Sep 2026 10:00:00 GMT; Path=/"]);
    expect([...b.keys()]).toEqual(["cookiesession1"]);
    expect(b.get("cookiesession1")).toBe("678B2train");
  });

  it("un barattolo vuoto non produce intestazione", () => {
    expect(intestazioneCookie(new Map())).toBe("");
  });

  it("regge le righe malformate senza perdere le buone", () => {
    const b: Barattolo = new Map();
    raccogliCookie(b, ["", "senza-uguale", "=valore-senza-nome", "buono=1"]);
    expect([...b.keys()]).toEqual(["buono"]);
  });

  it("il valore può contenere `=` (i token in base64 finiscono con `==`)", () => {
    const b: Barattolo = new Map();
    raccogliCookie(b, ["t=YWJjZA==; Path=/"]);
    expect(b.get("t")).toBe("YWJjZA==");
  });
});

describe("chiaveAtto · l'identità è l'atto, non la pubblicazione", () => {
  const base = { tipo: "ORDINANZA", annoRegistrazione: 2026, numeroRegistrazione: 3000, idPubblicazione: "9" };

  it("usa tipo/anno/numero quando ci sono", () => {
    expect(chiaveAtto({ ...base, anno: 2026, numero: 954 })).toBe("ORDINANZA|2026/954");
  });

  it("lo STESSO atto su albo e storico ha UNA chiave, benché due id di portale", () => {
    // Misurato: DETERMINAZIONE 2026/1681 sta sull'albo (id 4758861) e nello
    // storico (id 4758862). Con l'id come chiave sarebbero due atti.
    const albo = chiaveAtto({
      tipo: "DETERMINAZIONE DEL DIRIGENTE",
      anno: 2026,
      numero: 1681,
      annoRegistrazione: 2026,
      numeroRegistrazione: 1,
      idPubblicazione: "4758861",
    });
    const storico = chiaveAtto({
      tipo: "DETERMINAZIONE DEL DIRIGENTE",
      anno: 2026,
      numero: 1681,
      annoRegistrazione: 2026,
      numeroRegistrazione: 2,
      idPubblicazione: "4758862",
    });
    expect(albo).toBe(storico);
  });

  it("ripiega sulla registrazione quando anno o numero sono a zero", () => {
    expect(chiaveAtto({ ...base, tipo: "DECRETO", anno: 0, numero: 21 })).toBe("DECRETO|reg:2026/3000");
  });

  it("🔴 due delibere DIVERSE senza numero né registrazione non collassano", () => {
    // Il caso vero: «Pistoia Blues Festival 2024» e «Festa europea della
    // musica 2024», entrambe DELIBERA DI GIUNTA con Numero e Numero
    // registrazione a zero. Senza il terzo ripiego una delle due sparisce, e
    // un archivio che perde una delibera è peggio di uno che ne mostra due.
    const blues = chiaveAtto({
      tipo: "DELIBERA DI GIUNTA",
      anno: 0,
      numero: 0,
      annoRegistrazione: 2024,
      numeroRegistrazione: 0,
      idPubblicazione: "3942751",
    });
    const musica = chiaveAtto({
      tipo: "DELIBERA DI GIUNTA",
      anno: 0,
      numero: 0,
      annoRegistrazione: 2024,
      numeroRegistrazione: 0,
      idPubblicazione: "3942581",
    });
    expect(blues).not.toBe(musica);
  });

  it("estrae l'id della pubblicazione dall'Url atto", () => {
    expect(
      idPubblicazione(
        "https://pistoia.trasparenza-valutazione-merito.it/web/trasparenzaj/papca-p/-/papca/display/4746596",
      ),
    ).toBe("4746596");
  });
});

describe("vinceSu · quale pubblicazione si tiene", () => {
  it("lo storico batte l'albo, perché l'URL dell'albo scade", () => {
    expect(vinceSu({ griglia: "storico", numeroRegistrazione: 1 }, { griglia: "albo", numeroRegistrazione: 999 })).toBe(true);
    expect(vinceSu({ griglia: "albo", numeroRegistrazione: 999 }, { griglia: "storico", numeroRegistrazione: 1 })).toBe(false);
  });

  it("a parità di griglia vince la registrazione più recente", () => {
    // La 2022/1788 esiste due volte nello storico, e una delle due dice di sé
    // «PUBBLICAZIONE ERRATA». La corretta è la più recente.
    expect(vinceSu({ griglia: "storico", numeroRegistrazione: 3806 }, { griglia: "storico", numeroRegistrazione: 3801 })).toBe(true);
  });
});

describe("il CSV del portale", () => {
  it("tiene insieme i campi virgolettati con virgole e a capo dentro", () => {
    const csv = '"a","b"\n"uno, due","riga\nspezzata"\n';
    expect(parseCsv(csv)).toEqual([
      ["a", "b"],
      ["uno, due", "riga\nspezzata"],
    ]);
  });

  it("le virgolette raddoppiate sono una virgoletta sola", () => {
    expect(parseCsv('"x"\n"il ""bello"""\n')[1]).toEqual(['il "bello"']);
  });

  it("🔴 mappa per NOME, così una colonna in più non sfalsa le altre", () => {
    // «Provvedimenti» ha 24 colonne, le altre tre 25: in mezzo c'è «Spesa
    // prevista». Per posizione, tutto ciò che segue Data atto slitta.
    const senza = righeConIntestazione('"Data atto","Titolo sottocategoria"\n"13/07/2026","ORDINANZA"\n');
    const con = righeConIntestazione('"Data atto","Spesa prevista","Titolo sottocategoria"\n"13/07/2026","0,00","ORDINANZA"\n');
    expect(senza[0]["Titolo sottocategoria"]).toBe("ORDINANZA");
    expect(con[0]["Titolo sottocategoria"]).toBe("ORDINANZA");
  });

  it("riconosce la pagina di blocco del WAF, che risponde 500 come un guasto", () => {
    expect(paginaDiBlocco("<html><body>Web Page Blocked! Pagina web bloccata - MDAWAF001</body></html>")).toBe(true);
    expect(paginaDiBlocco('"Proponente","Oggetto"')).toBe(false);
  });

  it("🔴 la riconosce anche nella FORMA VERA, con le spie oltre i 19KB di CSS", () => {
    /*
      Questo test è nato da un rosso vero (2026-08-11): rompendo la lettura di
      proposito — user-agent di un Chrome headless — la pagina bloccata veniva
      archiviata come «errore» invece che «bloccata», e le due cose si riparano
      in modo diverso.

      La causa: `paginaDiBlocco` guardava i primi 4.000 caratteri, mentre la
      pagina vera è lunga 39.133 e comincia con ~19KB di CSS inline. Le
      posizioni qui sotto sono MISURATE su quella risposta, non stimate: il
      titolo con la frase a 19.205, «Web Page Blocked» a 38.709, `MDAWAF` a
      38.749.

      Il test che c'era prima usava una pagina inventata e CORTA, dove le spie
      stavano all'inizio: passava, e non poteva vedere il difetto. È la regola
      generale che vale oltre questo caso — un test scritto sulla forma
      immaginata di una risposta certifica il parser contro sé stesso.
    */
    const cssLungo = "/* " + "a".repeat(19_000) + " */";
    const paginaVera =
      `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"><html> <head> ` +
      `<meta name="viewport" content="width=device-width"> <style type="text/css"> ${cssLungo} </style> ` +
      `<title>The URL you requested has been blocked</title></head><body>` +
      "x".repeat(19_000) +
      `<h1>Web Page Blocked</h1><p>MDAWAF001</p><p>Attack ID: 20000005</p></body></html>`;

    expect(paginaVera.length).toBeGreaterThan(38_000);
    expect(paginaVera.indexOf("Web Page Blocked")).toBeGreaterThan(4_000);
    expect(paginaDiBlocco(paginaVera)).toBe(true);
  });

  it("non scandisce tutto un export da 13MB: la spia, se c'è, è in testa", () => {
    // Il contrappeso del test qui sopra: alzando la finestra si paga in
    // scansione, quindi resta limitata. Un CSV enorme che contenesse la frase
    // in fondo non è un caso reale — la pagina di blocco SOSTITUISCE la
    // risposta, non la segue.
    const csvEnorme = '"Proponente","Oggetto"\n' + "x".repeat(200_000) + "Web Page Blocked";
    expect(paginaDiBlocco(csvEnorme)).toBe(false);
  });

  it("riconosce il CSV dal CORPO, perché l'export grande dichiara text/html", () => {
    expect(sembraCsvDegliAtti('"Proponente","Proponente descrizione","Oggetto"')).toBe(true);
    expect(sembraCsvDegliAtti("<!DOCTYPE html><html>")).toBe(false);
  });

  it("legge le date italiane e rifiuta ciò che non lo è", () => {
    expect(dataItaliana("31/12/2031")?.toISOString().slice(0, 10)).toBe("2031-12-31");
    expect(dataItaliana("")).toBeNull();
    expect(dataItaliana("2031-12-31")).toBeNull();
  });
});

describe("rigaAdAtto", () => {
  const riga: Record<string, string> = {
    "Titolo sottocategoria": "DELIBERA DI GIUNTA",
    Oggetto: "APPROVAZIONE DEL PIANO",
    Anno: "2026",
    Numero: "57",
    "Anno registrazione": "2026",
    "Numero registrazione": "3300",
    "Proponente descrizione": "U.O. Cultura e Biblioteche",
    "Dirigente descrizione": "",
    "Data atto": "13/07/2026",
    "Data esecutività": "30/07/2026",
    "Numero allegati": "6",
    "Data inizio pubblicazione": "27/07/2026",
    "Data fine pubblicazione": "31/12/2031",
    "Url atto":
      "https://pistoia.trasparenza-valutazione-merito.it/web/trasparenzaj/papca-p/-/papca/display/4746596",
  };

  it("traduce una riga buona", () => {
    const a = rigaAdAtto(riga)!;
    expect(a.chiave).toBe("DELIBERA DI GIUNTA|2026/57");
    expect(a.temaCivico).toBe("cultura");
    expect(a.numeroAllegati).toBe(6);
    expect(a.dirigente).toBeNull();
  });

  it("scarta ciò che non è un atto del Comune", () => {
    // Avvisi pubblicati per conto di altri enti, e avvisi che contengono dati
    // personali di cittadini («cambio cognome per il sig. …»).
    expect(rigaAdAtto({ ...riga, "Titolo sottocategoria": "ATTI DI ALTRI ENTI" })).toBeNull();
    expect(rigaAdAtto({ ...riga, "Titolo sottocategoria": "ALTRI ATTI DELL' ENTE" })).toBeNull();
  });

  it("scarta una riga senza fonte: senza fonte un atto non si mostra", () => {
    expect(rigaAdAtto({ ...riga, "Url atto": "" })).toBeNull();
  });

  it("scarta una riga senza oggetto o senza data di pubblicazione", () => {
    expect(rigaAdAtto({ ...riga, Oggetto: "" })).toBeNull();
    expect(rigaAdAtto({ ...riga, "Data inizio pubblicazione": "" })).toBeNull();
  });

  it("TIENE un atto a cui manca solo la data dell'atto", () => {
    // Il caso vero: un decreto del Sindaco del 2024, unica riga su 26.588
    // senza `Data atto`. Ha oggetto, fonte e data di pubblicazione: buttarlo
    // via per un campo secondario perderebbe un atto reale.
    const a = rigaAdAtto({ ...riga, "Data atto": "" });
    expect(a).not.toBeNull();
    expect(a!.dataAtto).toBeNull();
    expect(a!.inizioPubblicazione).not.toBeNull();
  });

  it("non lancia su una riga vuota: una riga rotta non ferma 26.588 letture", () => {
    expect(() => rigaAdAtto({})).not.toThrow();
    expect(rigaAdAtto({})).toBeNull();
  });
});

describe("i tipi di atto", () => {
  it("ogni tipo ha un'etichetta leggibile", () => {
    for (const t of TIPI_ATTO) expect(ETICHETTA_TIPO[t]).toBeTruthy();
  });

  it("riconosce solo i cinque tipi del Comune", () => {
    expect(isTipoAtto("ORDINANZA")).toBe(true);
    expect(isTipoAtto("ALTRI ATTI")).toBe(false);
  });
});

describe("temaCivicoDaUfficio · le regole che sarebbero sbagliate", () => {
  it("🔴 il mestiere primario è quello che APRE il nome", () => {
    // Senza la regola del segmento di testa, 395 atti di lavori pubblici
    // finivano in Sport e 66 di ambiente in Sicurezza.
    expect(temaCivicoDaUfficio("Servizio Lavori Pubblici, Patrimonio, Verde e Promozione Sportiva")).toBe("lavori");
    expect(temaCivicoDaUfficio("Servizio Ambiente, Cimiteri e Protezione Civile")).toBe("ambiente");
    expect(temaCivicoDaUfficio("U.O. Promozione Sportiva")).toBe("sport");
  });

  it("🔴 un ufficio tributi che si chiama «Tassa Sui Rifiuti» non è ambiente", () => {
    expect(temaCivicoDaUfficio("U.O. Tassa Sui Rifiuti, Entrate Patrimoniali E Notifica Atti")).toBeNull();
  });

  it("la sicurezza sul lavoro non è la sicurezza urbana", () => {
    expect(temaCivicoDaUfficio("U.O. Servizio di Prevenzione e Protezione")).toBeNull();
    expect(temaCivicoDaUfficio("U.O. Servizio di Prevenzione, Protezione e Supporto Giuridico Amministrativo")).toBeNull();
  });

  it("urbanistica ed edilizia privata non sono opere pubbliche", () => {
    expect(temaCivicoDaUfficio("Servizio Urbanistica e Assetto del Territorio")).toBeNull();
    expect(temaCivicoDaUfficio("U.O.C. Edilizia Privata")).toBeNull();
  });

  it("regge le varianti da riorganizzazione senza un elenco esaustivo", () => {
    expect(temaCivicoDaUfficio("U.O. Mobilita'")).toBe("mobilita");
    expect(temaCivicoDaUfficio("U.O. Mobilità, Traffico e Segnaletica")).toBe("mobilita");
    expect(temaCivicoDaUfficio("U.O. Mobilita', Traffico e Segnaletica")).toBe("mobilita");
  });

  it("nel dubbio non decide: un tema sbagliato è un'affermazione falsa", () => {
    expect(temaCivicoDaUfficio("")).toBeNull();
    expect(temaCivicoDaUfficio("Ufficio Che Non Esiste")).toBeNull();
  });
});

describe("statoArchivio · le soglie del cancello, sul cruscotto", () => {
  const adesso = new Date("2026-08-09T12:00:00Z");
  const ieri = new Date("2026-08-08T12:00:00Z");

  it("un archivio senza atti non è vuoto: non è mai stato letto", () => {
    expect(statoArchivio({ totaleAtti: 0, ultimaPubblicazione: null, ultimaLetturaRiuscita: null, adesso })).toBe("mai-letto");
  });

  it("aggiornato: letto di recente e con atti freschi", () => {
    expect(
      statoArchivio({ totaleAtti: 100, ultimaPubblicazione: ieri, ultimaLetturaRiuscita: ieri, adesso }),
    ).toBe("aggiornato");
  });

  it("fermo se la LETTURA non gira, anche con atti recenti in pancia", () => {
    const treGiorniFa = new Date("2026-08-06T12:00:00Z");
    expect(
      statoArchivio({ totaleAtti: 100, ultimaPubblicazione: ieri, ultimaLetturaRiuscita: treGiorniFa, adesso }),
    ).toBe("fermo");
  });

  it("fermo se il portale non pubblica da troppo, anche con la lettura viva", () => {
    const dodiciGiorniFa = new Date("2026-07-28T12:00:00Z");
    expect(
      statoArchivio({ totaleAtti: 100, ultimaPubblicazione: dodiciGiorniFa, ultimaLetturaRiuscita: ieri, adesso }),
    ).toBe("fermo");
  });

  it("la soglia regge il buco più lungo mai misurato (5 giorni, Ferragosto)", () => {
    // Con una soglia sotto i 5 giorni il cancello sarebbe rosso a torto ogni
    // agosto. Il fermo difende la taratura, non il numero in sé.
    expect(GIORNI_MASSIMI_SENZA_ATTI).toBeGreaterThan(5);
    const cinqueGiorniFa = new Date("2026-08-04T12:00:00Z");
    expect(
      statoArchivio({ totaleAtti: 100, ultimaPubblicazione: cinqueGiorniFa, ultimaLetturaRiuscita: ieri, adesso }),
    ).toBe("aggiornato");
  });

  it("il cancello IMPORTA le soglie da lib/atti, non le riscrive", () => {
    // Come il test di CAMPIONE_MINIMO_PER_GIUDIZIO: due definizioni dello
    // stesso indicatore sono peggio di nessun indicatore.
    const sorgente = readFileSync("scripts/atti-freschezza.ts", "utf8").replace(/\r?\n/g, " ");
    expect(sorgente).toMatch(/import\s*\{[^}]*GIORNI_MASSIMI_SENZA_ATTI[^}]*\}\s*from\s*"\.\.\/src\/lib\/atti"/);
    expect(sorgente).not.toMatch(/GIORNI_MASSIMI_SENZA_ATTI\s*=\s*\d/);
  });
});

/*
  I 102 uffici che il portale dichiara al 2026-08-09, col tema che le regole
  danno oggi. Non è un test di correttezza — è un FERMO: se una regola cambia
  tema a un ufficio che esisteva già, questo diventa rosso e la modifica va
  guardata, invece che scoperta in pagina mesi dopo.
*/
const UFFICI_2026: ReadonlyArray<readonly [string, string | null]> = [
  ["U.O. Mobilita'", "mobilita"],
  ["U.O. Mobilita', Traffico e Segnaletica", "mobilita"],
  ["U.O. Organizzazione, Gestione e Formazione Del Personale", null],
  ["U.O. Amministrativa LLPP", "lavori"],
  ["Sindaco", null],
  ["U.O. Protezione Civile, Sicurezza del Territorio e Servizi Tecnici Sul Territorio", "sicurezza"],
  ["U.O. Lavori Pubblici e Patrimonio", "lavori"],
  ["U.O. Cultura e Biblioteche", "cultura"],
  ["Servizio Cultura e Tradizioni, Turismo e Informatica", "cultura"],
  ["U.O. Servizi per l'abitare", "sociale"],
  ["U.O. Progetti Speciali, Grandi Opere e Espropri", "lavori"],
  ["U.O. Edilizia Scolastica e Impiantistica Sportiva", "scuole"],
  ["U.O. Promozione Sportiva", "sport"],
  ["U.O. Affari Legali", null],
  ["U.O. Bilancio Corrente e Adempimenti Fiscali", null],
  ["U.O. Sistemi Informativi Ed Informatici", null],
  ["Servizio Infrastrutture, Progetti Speciali e Mobilita'", "lavori"],
  ["U.O. Viabilità, Progetti Speciali ed Espropri", "mobilita"],
  ["Servizio Lavori Pubblici, Patrimonio, Verde e Promozione Sportiva", "lavori"],
  ["Ufficio Del Consiglio Comunale", null],
  ["Servizio Educazione e Istruzione", "scuole"],
  ["U.O. Attivita' Culturali", "cultura"],
  ["U.O. Sua, Contratti E Provveditorato", null],
  ["Servizio Sviluppo Economico e Demografici", null],
  ["U.O. Servizi Educativi e Sistema Educativo e Scolastico Integrato", "scuole"],
  ["Servizio Urbanistica e Assetto del Territorio", null],
  ["U.O. Sistema Delle Biblioteche e degli Archivi Comunali", "cultura"],
  ["U.O. Verde Pubblico", "ambiente"],
  ["U.O. Tassa Sui Rifiuti, Entrate Patrimoniali E Notifica Atti", null],
  ["U.O. Verde Pubblico e Servizi Cimiteriali", "ambiente"],
  ["U.O.C. Viabilita' Pronto Intervento e Polizia Giudiziaria", "mobilita"],
  ["U.O. Musei e Beni Culturali", "cultura"],
  ["U.O. Ambiente e Tutela degli Animali", "ambiente"],
  ["U.O. Progettazione Sociale e Organizzazione Servizi di Inclusione Sociale", "sociale"],
  ["U.O. Imposte sugli Immobili (ICI, IMU, TASI) e di Soggiorno", null],
  ["U.O. Servizi Educativi e Amministrativi Strumentali", "scuole"],
  ["U.O. Promozione dell'integrazione e Pari Opportunita'", "sociale"],
  ["U.O. Gestioni Economali, Pianificazione e Controllo Strategico", null],
  ["Servizio Personale e Politiche di Inclusione Sociale", null],
  ["Servizio Finanziario e Controllo Aziende Partecipate", null],
  ["U.O. Turismo E Albi Terzo Settore", "turismo"],
  ["U.O. Gestioni Economali", null],
  ["U.O. Commercio e attivita' su area pubblica", "commercio"],
  ["Servizio Stazione Unica Appaltante e Entrate", null],
  ["U.O. Gestione Logistica e Tecnologica", null],
  ["U.O. Gestione Contabile e Contrattualistica", null],
  ["U.O. Suap, Privacy e Statistica", "commercio"],
  ["U.O. Annona e Polizia Amministrativa Locale", "commercio"],
  ["Servizio Stazione Unica Appaltante, Entrate e Demografici", null],
  ["U.O.C. Procedimenti Amministrativi e Nuclei Speciali", null],
  ["Servizio Sviluppo Economico E Promozione Territoriale", "commercio"],
  ["U.O. Servizio di Prevenzione e Protezione", null],
  ["U.O. Protezione Civile e Assetto Idrogeologico", "sicurezza"],
  ["U.O. Contenzioso Tributario e Imposta sulla Pubblicita'", null],
  ["U.O. Segreteria, Archivio e Protocollo", null],
  ["Servizio Polizia Municipale", "sicurezza"],
  ["U.O. Procedimenti Sanzionatori, Permessi e Front-Office", null],
  ["Staff Ufficio Del Sindaco", null],
  ["U.O. Comunicazione e Partecipazione", null],
  ["U.O. Contrattualistica", null],
  ["U.O. Investimenti e Controllo Aziende Partecipate", null],
  ["U.O. Energia e Impianti", "lavori"],
  ["Servizio Ambiente, Cimiteri e Protezione Civile", "ambiente"],
  ["U.O. Assetto Idrogeologico", "sicurezza"],
  ["Segretario Generale", null],
  ["Servizio Lavori Pubblici, Patrimonio e Promozione Sportiva", "lavori"],
  ["Staff Affari Legali", null],
  ["Rimborsi - Oggetti Smarriti", null],
  ["U.O. Servizio di Prevenzione, Protezione e Supporto Giuridico Amministrativo", null],
  ["Spese di lite", null],
  ["U.O. Gestione del Regolamento Urbanistico e dei Contributi", null],
  ["U.O. Contenzioso Tributario e Canone Unico per la componente dell'esposizione pubblicitaria (ex imp. pubbl. e dir. aff.)", null],
  ["U.O.C. Urbanistica", null],
  ["U.O. Servizi Cimiteriali", null],
  ["Rimborsi - Pagamenti", null],
  ["U.O. Anagrafe, Stato Civile, Leva ed Elettorale", null],
  ["U.O. Procedure Sanzionatorie", null],
  ["Servizio Infrastrutture, Mobilita' e Promozione Sportiva", "lavori"],
  ["U.O.C. Edilizia Privata", null],
  ["U.O. Paesaggistica e Citta' Storica", null],
  ["U.O. Pianificazione Intermedia", null],
  ["U.O. Gestione Amministrativa", null],
  ["Servizio Polizia Locale", "sicurezza"],
  ["U.O. Servizi Demografici - Elettorale", null],
  ["U.O. Energia", "lavori"],
  ["U.O. Servizi Amministrativi e di supporto ai servizi a domanda individuale", null],
  ["U.O. Pianificazione, Controllo di Gestione e Amministrazione degli Inventari", null],
  ["U.O. Programmazione Operativa E Controllo di Gestione", null],
  ["Servizio Ambiente, Verde e Protezione Civile", "ambiente"],
  ["Servizio Lavori Pubblici, Patrimonio, Verde e Protezione Civile", "lavori"],
  ["TOMASI ALESSANDRO", null],
  ["U.O. Edilizia Privata, Istruttorie Attivita' Produttive e Citta' Storica", null],
  ["U.O. Servizi Demografici", null],
  ["Servizio Ambiente e Cimiteri", "ambiente"],
  ["U.O. Suap, Privacy, SIT e Statistica", "commercio"],
  ["U.O. Organizzazione, Formazione e Addestramento", null],
  ["U.O. Servizi Ausiliari", null],
  ["U.O. Attivita' di Particolare Interesse Pubblico", null],
  ["U.O. Affari Generali", null],
  ["U.O. Segreteria, Comando e Servizi", null],
  ["U.O.C. Procedimento Sanzionatorio e Nuclei Speciali", null],
  ["Polizia Edilizia", "sicurezza"],
];

describe("il fermo dei 102 uffici del 2026-08-09", () => {
  it("nessun ufficio esistente cambia tema senza che qualcuno se ne accorga", () => {
    for (const [ufficio, atteso] of UFFICI_2026) {
      expect(temaCivicoDaUfficio(ufficio), ufficio).toBe(atteso);
    }
  });

  it("copre 45 uffici su 102: il resto è amministrazione interna", () => {
    // 42 dal 2026-08-09; 45 dal 2026-08-11, quando «Sociale e casa» ha preso
    // i tre uffici del welfare e dell'abitare (decisione di prodotto, non
    // tecnica — vedi docs/fonti-atti.md §4.3).
    expect(UFFICI_2026).toHaveLength(102);
    expect(UFFICI_2026.filter(([, t]) => t !== null)).toHaveLength(45);
  });

  it("ogni tema prodotto esiste nella tassonomia canonica", () => {
    for (const [, tema] of UFFICI_2026) {
      if (tema !== null) expect(tema in CIVIC_TOPICS).toBe(true);
    }
  });
});
