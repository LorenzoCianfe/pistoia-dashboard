import { describe, it, expect } from "vitest";
import {
  SOMMARIO_MAX,
  TITOLO_MAX,
  attoCurato,
  fattoDelGiorno,
  righeMonumento,
  totaleAnnuoDalleRighe,
  validaCura,
  type CandidatoApertura,
} from "@/lib/prima-pagina";
import {
  costoAnnuoGiunta,
  vociPubblicabili,
  type Voce,
} from "@/lib/costo-amministrazione";

/*
  I test della prima pagina. La regola che coprono per prima è quella che
  Lorenzo ha deciso il 2026-08-12 e che è facile smontare senza accorgersene:
  **senza cura non c'è apertura**. È una regola editoriale prima che tecnica —
  una home che finge un'apertura è peggio di una che non ne ha — quindi vale la
  pena che sia un test e non solo un commento.
*/

const OGGETTO =
  'CUP C54D24001030006. "INTERVENTO DI EFFICIENTAMENTO DELL\'INVOLUCRO EDILIZIO AI FINI DEL MIGLIORAMENTO ENERGETICO DELL\'ISTITUTO COMPRENSIVO STATALE "RAFFAELLO" VIA PIETRO CALAMANDREI"';

function atto(
  chiave: string,
  titolo: string | null,
  curatoIl: Date | null = null,
): CandidatoApertura {
  return { chiave, titoloRedazionale: titolo, curatoIl };
}

describe("chi apre la prima pagina", () => {
  it("nessuno, quando nessun atto è curato", () => {
    const giorno = [
      atto("ORDINANZA|2026/978", null),
      atto("DETERMINAZIONE|2026/1692", null),
    ];
    expect(fattoDelGiorno(giorno)).toBeNull();
  });

  it("nessuno, anche quando il giorno è vuoto", () => {
    expect(fattoDelGiorno([])).toBeNull();
  });

  it("l'unico curato, quando ce n'è uno solo", () => {
    const scelto = atto(
      "DETERMINAZIONE|2026/1692",
      "La scuola «Raffaello» avrà un involucro nuovo",
      new Date("2026-08-11T18:00:00Z"),
    );
    const giorno = [atto("ORDINANZA|2026/978", null), scelto];
    expect(fattoDelGiorno(giorno)?.chiave).toBe(scelto.chiave);
  });

  it("l'ULTIMO curato, quando ce ne sono due", () => {
    // Un ripensamento deve poter vincere senza dover prima disfare il primo:
    // è la ragione per cui `curatoIl` si riscrive a ogni salvataggio.
    const primo = atto("A|1", "Il primo titolo", new Date("2026-08-11T09:00:00Z"));
    const secondo = atto("B|2", "Il secondo titolo", new Date("2026-08-11T17:30:00Z"));
    expect(fattoDelGiorno([primo, secondo])?.chiave).toBe("B|2");
    // L'ordine in ingresso non conta: a decidere è il timbro, non la query.
    expect(fattoDelGiorno([secondo, primo])?.chiave).toBe("B|2");
  });

  it("un titolo di soli spazi NON è una cura", () => {
    // Il caso arriva davvero: un campo svuotato a mano lascia "" o "   ".
    // Se passasse, la home aprirebbe con una card dal titolo vuoto — cioè
    // esattamente l'apertura finta che la decisione vieta.
    expect(attoCurato({ titoloRedazionale: "   " })).toBe(false);
    expect(attoCurato({ titoloRedazionale: null })).toBe(false);
    expect(attoCurato({ titoloRedazionale: "Un titolo" })).toBe(true);
    expect(fattoDelGiorno([atto("A|1", "  \n ")])).toBeNull();
  });

  it("sceglie in modo DETERMINISTICO anche a parità di timbro", () => {
    // Senza un ordinamento totale la prima pagina cambierebbe da un
    // caricamento all'altro, e il difetto non somiglierebbe alla sua causa.
    const stesso = new Date("2026-08-11T12:00:00Z");
    const a = atto("A|1", "Titolo A", stesso);
    const b = atto("B|2", "Titolo B", stesso);
    expect(fattoDelGiorno([a, b])?.chiave).toBe(fattoDelGiorno([b, a])?.chiave);
  });

  it("un curato SENZA timbro perde contro uno che ce l'ha", () => {
    const senzaTimbro = atto("A|1", "Scritto a mano nel database", null);
    const conTimbro = atto("B|2", "Curato dalla redazione", new Date("2026-08-11T08:00:00Z"));
    expect(fattoDelGiorno([senzaTimbro, conTimbro])?.chiave).toBe("B|2");
    // Ma da solo apre lo stesso: l'invariante è il titolo, non il timbro.
    expect(fattoDelGiorno([senzaTimbro])?.chiave).toBe("A|1");
  });
});

describe("che cosa la redazione può scrivere", () => {
  it("accetta un titolo con la sua didascalia, ripuliti dagli spazi", () => {
    const esito = validaCura(
      "  La scuola «Raffaello» avrà un involucro nuovo  ",
      "  Con questo atto parte la progettazione esecutiva.  ",
      OGGETTO,
    );
    expect(esito).toEqual({
      ok: true,
      titolo: "La scuola «Raffaello» avrà un involucro nuovo",
      sommario: "Con questo atto parte la progettazione esecutiva.",
    });
  });

  it("la didascalia è facoltativa e vuota diventa null", () => {
    const esito = validaCura("Un titolo che spiega", "   ", OGGETTO);
    expect(esito).toMatchObject({ ok: true, sommario: null });
    expect(validaCura("Un titolo che spiega", undefined, OGGETTO)).toMatchObject({
      ok: true,
      sommario: null,
    });
  });

  it("rifiuta un titolo vuoto", () => {
    expect(validaCura("", null, OGGETTO)).toMatchObject({ ok: false });
    expect(validaCura("   ", null, OGGETTO)).toMatchObject({ ok: false });
  });

  it("rifiuta ciò che non è nemmeno una stringa", () => {
    // Una Server Action è un endpoint HTTP pubblico: la firma TypeScript non
    // vale al confine di rete (AGENTS.md §3, 2026-08-08).
    expect(validaCura(undefined, null, OGGETTO)).toMatchObject({ ok: false });
    expect(validaCura(42, null, OGGETTO)).toMatchObject({ ok: false });
    expect(validaCura("Titolo buono", 42, OGGETTO)).toMatchObject({ ok: false });
  });

  it("rifiuta un titolo o una didascalia oltre misura", () => {
    expect(validaCura("x".repeat(TITOLO_MAX + 1), null, OGGETTO)).toMatchObject({ ok: false });
    expect(validaCura("x".repeat(TITOLO_MAX), null, OGGETTO)).toMatchObject({ ok: true });
    expect(validaCura("Titolo", "y".repeat(SOMMARIO_MAX + 1), OGGETTO)).toMatchObject({ ok: false });
  });

  it("🔴 rifiuta il titolo che è l'oggetto ufficiale RICOPIATO", () => {
    // È il controllo che giustifica l'esistenza del campo: se il titolo umano
    // è l'oggetto, la barriera che si voleva togliere dalla cima della prima
    // pagina è stata rimessa lì a mano. Il confronto ignora maiuscole e spazi,
    // perché un copia-incolla passa quasi sempre da un ritocco di battitura.
    const corto = "DETERMINA A CONTRARRE E AFFIDAMENTO DIRETTO";
    expect(validaCura(corto, null, corto)).toMatchObject({ ok: false });
    expect(validaCura(`  ${corto.toLowerCase()}  `, null, corto)).toMatchObject({ ok: false });
    expect(validaCura("Il Comune affida il servizio senza gara", null, corto)).toMatchObject({
      ok: true,
    });
  });
});

describe("il numero-monumento", () => {
  it("porta tre righe: sindaco, vicesindaca e gli assessori raggruppati", () => {
    const righe = righeMonumento();
    expect(righe.map((r) => r.chi)).toEqual([
      "Giovanni Capecchi",
      "Stefania Nesi",
      "7 assessori",
    ]);
    expect(righe.map((r) => r.quante)).toEqual([1, 1, 7]);
  });

  it("🔴 le righe spiegano ESATTAMENTE il totale che la pagina mostra", () => {
    // L'invariante che conta: la cifra display viene da `costoAnnuoGiunta()`,
    // le righe sotto da `righeMonumento()`. Se le due sorgenti divergessero, la
    // prima pagina mostrerebbe un totale che le sue stesse righe non spiegano —
    // ed è un difetto che nessuno noterebbe guardando, perché entrambi i numeri
    // resterebbero plausibili.
    expect(totaleAnnuoDalleRighe(righeMonumento())).toBe(costoAnnuoGiunta());
    expect(costoAnnuoGiunta()).toBe(689_724);
  });

  it("dice come si arriva alla carica, e MAI il partito", () => {
    // Quattro assessori su otto non compaiono in nessuna delle dodici liste
    // (docs/fonti-organigramma.md §2.2): dare il partito a chi ce l'ha e
    // lasciare vuoto agli altri si legge «questi non li ha votati nessuno»,
    // che è falso. «Come si arriva alla carica» è vero per tutte e nove.
    const righe = righeMonumento();
    expect(righe.map((r) => r.accesso)).toEqual([
      "eletto dai cittadini",
      "nominata dal sindaco",
      "nominati dal sindaco",
    ]);
    const testo = JSON.stringify(righe).toLowerCase();
    for (const parola of ["partito", "lista", "coalizione", "preferenze"]) {
      expect(testo).not.toContain(parola);
    }
  });

  it("una voce SENZA fonte esce dalle righe e dal totale insieme", () => {
    // La regola di `costo-amministrazione.ts`: un importo senza l'atto da cui
    // viene è un'affermazione su una persona. Se sparisse solo dalle righe, il
    // totale resterebbe l'unico posto in cui quel dato sopravvive, invisibile.
    const monche: Voce[] = vociPubblicabili().map((v) =>
      v.ruolo === "vicesindaca"
        ? { ...v, riga: { ...v.riga, urlFonte: "" } }
        : v,
    );
    const righe = righeMonumento(monche);
    expect(righe.map((r) => r.chi)).toEqual(["Giovanni Capecchi", "7 assessori"]);
    expect(totaleAnnuoDalleRighe(righe)).toBe(costoAnnuoGiunta(monche));
  });
});
