import { describe, it, expect } from "vitest";
import {
  DOMANDA_FAMIGLIA,
  FINESTRA_CONDIZIONE_GIORNI,
  SERVIZI,
  SOGLIA_PUBBLICAZIONE_VOTO,
  STELLE_MAX,
  STELLE_MIN,
  colonnaDuraDa,
  composizione,
  mediana,
  inizioFinestra,
  limiteConservazioneIp,
  media,
  nomePubblico,
  nonRimossa,
  periodoDi,
  puoVotare,
  quartiereSbloccato,
  servizio,
  serviziDi,
  stelleValide,
  testoVisibile,
  ultimiPeriodi,
  volumeAccostabile,
  type ValutazioneContata,
} from "@/lib/valutazioni";
import { CAMPIONE_MINIMO_PER_GIUDIZIO } from "@/lib/citystats";
import { REPORT_CATEGORY } from "@/lib/community";

const voto = (v: Partial<ValutazioneContata> = {}): ValutazioneContata => ({
  stelle: 4,
  emailConfermata: true,
  canale: "web",
  rimossaIl: null,
  ...v,
});

describe("il catalogo delle undici caselle", () => {
  it("conta sei sportelli e cinque condizioni", () => {
    expect(SERVIZI).toHaveLength(11);
    expect(serviziDi("sportello")).toHaveLength(6);
    expect(serviziDi("condizione")).toHaveLength(5);
  });

  it("ha slug unici e usabili come URL", () => {
    const ids = SERVIZI.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it("mappa ogni condizione su categorie di segnalazione che esistono davvero", () => {
    // Una categoria scritta male non produce nessun errore: produce una colonna
    // dura vuota, cioè proprio la scheda vuota che questa funzione esiste per
    // evitare. Il difetto sarebbe invisibile fino al giorno uno in produzione.
    for (const s of serviziDi("condizione")) {
      expect(s.categorieReport.length).toBeGreaterThan(0);
      for (const c of s.categorieReport) {
        expect(Object.keys(REPORT_CATEGORY)).toContain(c);
      }
    }
  });

  it("non dà nessuna categoria agli sportelli, che un dato oggettivo non ce l'hanno", () => {
    for (const s of serviziDi("sportello")) expect(s.categorieReport).toEqual([]);
  });

  it("nessuna categoria di segnalazione è contesa fra due condizioni", () => {
    // Due caselle sulla stessa categoria conterebbero le stesse segnalazioni
    // due volte, e le due schede si contraddirebbero a un clic di distanza.
    const usate = serviziDi("condizione").flatMap((s) => s.categorieReport);
    expect(new Set(usate).size).toBe(usate.length);
  });

  it("pone due domande diverse, una per famiglia", () => {
    expect(DOMANDA_FAMIGLIA.sportello).not.toBe(DOMANDA_FAMIGLIA.condizione);
  });

  it("trova un servizio per slug e non ne inventa uno per slug ignoti", () => {
    expect(servizio("pulizia")?.nome).toBe("Pulizia");
    expect(servizio("inesistente")).toBeNull();
  });
});

describe("il volume delle segnalazioni non si accosta sempre alle stelle", () => {
  it("su sicurezza il volume è ambiguo, altrove no", () => {
    // Per la pulizia «tante segnalazioni» si legge come «va peggio». Per la
    // sicurezza più segnalazioni può voler dire più vigilanza, non più
    // pericolo: accostare un volume in crescita a due stelle suggerirebbe un
    // nesso che il dato non contiene.
    expect(volumeAccostabile(servizio("sicurezza")!)).toBe(false);
    expect(volumeAccostabile(servizio("pulizia")!)).toBe(true);
    expect(volumeAccostabile(servizio("illuminazione")!)).toBe(true);
  });
});

describe("la scala a stelle", () => {
  it("accetta solo gli interi da 1 a 5", () => {
    expect(STELLE_MIN).toBe(1);
    expect(STELLE_MAX).toBe(5);
    for (const n of [1, 2, 3, 4, 5]) expect(stelleValide(n)).toBe(true);
    for (const n of [0, 6, -1, 2.5, NaN, Infinity]) expect(stelleValide(n)).toBe(false);
  });
});

describe("la soglia di pubblicazione", () => {
  it("non mostra nessuna media sotto la soglia, ma dichiara il campione", () => {
    const m = media(Array(19).fill(5));
    expect(m.valore).toBeNull();
    expect(m.pubblicabile).toBe(false);
    expect(m.campione).toBe(19);
    expect(m.mancanti).toBe(1);
  });

  it("pubblica esattamente alla soglia", () => {
    const m = media(Array(SOGLIA_PUBBLICAZIONE_VOTO).fill(4));
    expect(m.pubblicabile).toBe(true);
    expect(m.valore).toBe(4);
    expect(m.mancanti).toBe(0);
  });

  it("arrotonda a una cifra decimale", () => {
    const stelle = [...Array(10).fill(5), ...Array(10).fill(2)];
    expect(media(stelle).valore).toBe(3.5);
  });

  it("scarta i voti fuori scala invece di lasciarli sporcare la media", () => {
    const m = media([...Array(20).fill(4), 0, 9, 2.5], 20);
    expect(m.campione).toBe(20);
    expect(m.valore).toBe(4);
  });

  it("è più alta di CAMPIONE_MINIMO_PER_GIUDIZIO, e di proposito", () => {
    // Le due soglie NON sono due definizioni dello stesso indicatore: quella
    // di citystats è la soglia di un tasso su casi che arrivano da soli, questa
    // è la soglia di una media su recensioni che si autoselezionano verso gli
    // estremi. Se qualcuno le unificasse per simmetria, questo test cadrebbe.
    expect(SOGLIA_PUBBLICAZIONE_VOTO).toBeGreaterThan(CAMPIONE_MINIMO_PER_GIUDIZIO);
  });
});

describe("la composizione del campione", () => {
  it("separa confermate e arrivate da QR, e conta entrambe nel totale", () => {
    const c = composizione([
      voto({ emailConfermata: true }),
      voto({ emailConfermata: false }),
      voto({ emailConfermata: true, canale: "qr" }),
    ]);
    expect(c).toEqual({ totale: 3, confermate: 2, daQr: 1 });
  });

  it("non conta mai una valutazione rimossa", () => {
    const c = composizione([voto(), voto({ rimossaIl: new Date("2026-08-01") })]);
    expect(c.totale).toBe(1);
  });

  it("regge il caso vero del giorno uno: zero valutazioni", () => {
    expect(composizione([])).toEqual({ totale: 0, confermate: 0, daQr: 0 });
    const m = media([]);
    expect(m.valore).toBeNull();
    expect(m.campione).toBe(0);
    expect(m.mancanti).toBe(SOGLIA_PUBBLICAZIONE_VOTO);
  });
});

describe("una valutazione rimossa sparisce da ogni calcolo", () => {
  it("non conta e non mostra il proprio testo", () => {
    const rimossa = { testo: "un insulto", rimossaIl: new Date("2026-08-01") };
    expect(testoVisibile(rimossa)).toBeNull();
    expect(nonRimossa(voto({ rimossaIl: new Date() }))).toBe(false);
  });

  it("mostra il testo di una viva, e null quando è vuoto", () => {
    expect(testoVisibile({ testo: "Ottimo servizio", rimossaIl: null })).toBe("Ottimo servizio");
    expect(testoVisibile({ testo: "   ", rimossaIl: null })).toBeNull();
    expect(testoVisibile({ testo: null, rimossaIl: null })).toBeNull();
  });
});

describe("il periodo e l'andamento", () => {
  it("scrive il periodo come AAAA-MM", () => {
    expect(periodoDi(new Date("2026-08-03T10:00:00Z"))).toBe("2026-08");
    expect(periodoDi(new Date("2026-12-31T23:59:59Z"))).toBe("2026-12");
    expect(periodoDi(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01");
  });

  it("elenca gli ultimi periodi dal più vecchio al più recente, scavalcando l'anno", () => {
    expect(ultimiPeriodi(new Date("2026-02-15T00:00:00Z"), 4)).toEqual([
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
    ]);
  });

  it("apre la finestra mobile a novanta giorni esatti", () => {
    const oggi = new Date("2026-08-03T00:00:00Z");
    const inizio = inizioFinestra(oggi);
    expect(FINESTRA_CONDIZIONE_GIORNI).toBe(90);
    expect(Math.round((oggi.getTime() - inizio.getTime()) / 86_400_000)).toBe(90);
  });
});

describe("chi può votare di nuovo, e quando", () => {
  const sportello = servizio("anagrafe")!;
  const condizione = servizio("pulizia")!;
  const precedenti = [
    { servizioId: "pulizia", periodo: "2026-08", email: "Marco@Esempio.it" },
    { servizioId: "anagrafe", periodo: "2026-08", email: "marco@esempio.it" },
  ];

  it("sullo sportello si vota a episodio, senza tetto", () => {
    // Un tetto temporale punirebbe chi allo sportello ci va spesso, che è
    // esattamente chi ha più da raccontare.
    expect(puoVotare(sportello, "marco@esempio.it", "2026-08", precedenti)).toBe(true);
  });

  it("sulla condizione si vota una volta al mese", () => {
    expect(puoVotare(condizione, "marco@esempio.it", "2026-08", precedenti)).toBe(false);
    expect(puoVotare(condizione, "marco@esempio.it", "2026-09", precedenti)).toBe(true);
  });

  it("non si aggira cambiando maiuscole o spazi nell'email", () => {
    expect(puoVotare(condizione, "  MARCO@ESEMPIO.IT ", "2026-08", precedenti)).toBe(false);
  });

  it("un'altra persona vota lo stesso mese senza problemi", () => {
    expect(puoVotare(condizione, "lucia@esempio.it", "2026-08", precedenti)).toBe(true);
  });
});

describe("la conservazione dell'IP, a date fisse", () => {
  it("il 3 agosto 2026 il limite cade sul 4 febbraio 2026 (180 giorni)", () => {
    const limite = limiteConservazioneIp(new Date("2026-08-03T00:00:00Z"));
    expect(limite.toISOString()).toBe("2026-02-04T00:00:00.000Z");
  });

  it("un IP scritto ieri sopravvive, uno di sei mesi fa no", () => {
    const oggi = new Date("2026-08-03T12:00:00Z");
    const limite = limiteConservazioneIp(oggi);
    const ieri = new Date("2026-08-02T12:00:00Z");
    const seiMesiFa = new Date("2026-02-01T12:00:00Z");
    expect(ieri.getTime() < limite.getTime()).toBe(false);
    expect(seiMesiFa.getTime() < limite.getTime()).toBe(true);
  });

  it("la finestra si può stringere senza toccare la costante", () => {
    const limite = limiteConservazioneIp(new Date("2026-08-03T00:00:00Z"), 30);
    expect(limite.toISOString()).toBe("2026-07-04T00:00:00.000Z");
  });
});

describe("lo sblocco del quartiere", () => {
  it("resta chiuso finché il quartiere non supera la soglia da solo", () => {
    expect(quartiereSbloccato(Array(19).fill(voto()))).toBe(false);
    expect(quartiereSbloccato(Array(20).fill(voto()))).toBe(true);
  });

  it("non conta le rimosse per raggiungere la soglia", () => {
    const voti = [
      ...Array(19).fill(voto()),
      voto({ rimossaIl: new Date("2026-08-01") }),
    ];
    expect(quartiereSbloccato(voti)).toBe(false);
  });
});

describe("la colonna dura distingue un fatto da un giudizio", () => {
  const pulizia = servizio("pulizia")!;
  const sicurezza = servizio("sicurezza")!;
  const MIN = CAMPIONE_MINIMO_PER_GIUDIZIO;

  it("mostra il conteggio anche su pochissime segnalazioni: è un fatto", () => {
    const c = colonnaDuraDa(pulizia, [], 2, MIN);
    expect(c.segnalazioni).toBe(2);
    expect(c.haQualcosaDaDire).toBe(true);
  });

  it("NON calcola la mediana sotto il campione minimo", () => {
    // Il difetto visto dal vivo il 2026-08-03: la pagina scriveva «2
    // segnalazioni quest'anno, chiuse in 7 giorni» come se fosse il dato
    // solido. Sette giorni mediani su due casi non è una misura.
    const c = colonnaDuraDa(pulizia, [7, 7], 2, MIN);
    expect(c.giorniMediani).toBeNull();
    expect(c.risolte).toBe(2);
  });

  it("la calcola esattamente al campione minimo", () => {
    const c = colonnaDuraDa(pulizia, [1, 2, 3, 4, 100], 20, MIN);
    expect(c.giorniMediani).toBe(3);
  });

  it("usa la mediana e non la media, che una pratica ferma stravolgerebbe", () => {
    // Media = 62,4; mediana = 3. Un solo caso fermo da un anno racconterebbe
    // un Comune che non chiude niente.
    const c = colonnaDuraDa(pulizia, [1, 2, 3, 4, 302], 20, MIN);
    expect(c.giorniMediani).toBe(3);
  });

  it("su un numero pari di casi media i due centrali", () => {
    expect(mediana([2, 4, 6, 9])).toBe(5);
    expect(mediana([])).toBeNull();
  });

  it("su sicurezza non dice niente se non ha una mediana", () => {
    // Il volume non si accosta alle stelle, quindi senza mediana non resta
    // nulla: meglio non aprire il riquadro che aprirlo su una frase monca —
    // «Intanto dalle segnalazioni: chiuse», che è ciò che la pagina scriveva.
    const senza = colonnaDuraDa(sicurezza, [3, 3], 40, MIN);
    expect(senza.haQualcosaDaDire).toBe(false);

    const con = colonnaDuraDa(sicurezza, [1, 2, 3, 4, 5], 40, MIN);
    expect(con.haQualcosaDaDire).toBe(true);
    expect(con.volumeAccostabile).toBe(false);
  });

  it("su pulizia il volume si accosta, su sicurezza no", () => {
    expect(colonnaDuraDa(pulizia, [], 9, MIN).volumeAccostabile).toBe(true);
    expect(colonnaDuraDa(sicurezza, [], 9, MIN).volumeAccostabile).toBe(false);
  });

  it("a zero segnalazioni non ha niente da dire", () => {
    expect(colonnaDuraDa(pulizia, [], 0, MIN).haQualcosaDaDire).toBe(false);
  });
});

describe("come compare chi scrive", () => {
  it("abbrevia il cognome per default", () => {
    expect(nomePubblico("Marco Bianchi", false)).toBe("Marco B.");
  });

  it("mostra il nome intero solo se la casella è spuntata", () => {
    expect(nomePubblico("Marco Bianchi", true)).toBe("Marco Bianchi");
  });

  it("abbrevia anche il default di chi ha un account verificato", () => {
    // Decisione di Lorenzo: «Marco B.» vale per tutti, account compresi. Il
    // nome intero è un atto deliberato, non una conseguenza dell'essersi
    // registrati — e protegge chi critica un servizio sociale dall'essere
    // indicizzato per nome e cognome.
    expect(nomePubblico("Stefania Nesi", false)).toBe("Stefania N.");
  });

  it("regge i cognomi composti", () => {
    expect(nomePubblico("Anna Maria Ida Celesti", false)).toBe("Anna M. I. C.");
  });

  it("è «Anonimo» quando il nome manca o è vuoto", () => {
    expect(nomePubblico(null, false)).toBe("Anonimo");
    expect(nomePubblico("   ", true)).toBe("Anonimo");
    expect(nomePubblico(undefined, false)).toBe("Anonimo");
  });

  it("non rompe su un nome singolo", () => {
    expect(nomePubblico("Marco", false)).toBe("Marco");
  });
});
