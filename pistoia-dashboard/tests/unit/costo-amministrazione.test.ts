import { describe, it, expect } from "vitest";
import {
  BASE_MENSILE,
  INDENNITA_ASSESSORE,
  INDENNITA_PRESIDENTE_CONSIGLIO,
  INDENNITA_SINDACO,
  INDENNITA_VICESINDACO,
  MENSILITA,
  POPOLAZIONE,
  RIGHE_CATENA,
  RIGHE_PERSONE,
  TETTO_CONSIGLIERE,
  VOCI,
  costoAnnuoGiunta,
  costoMensileGiunta,
  rigaPubblicabile,
  righePubblicabili,
  statoPubblicazione,
  vociPubblicabili,
  type Riga,
  type Voce,
} from "@/lib/costo-amministrazione";

const RIGA_BUONA: Riga = {
  affermazione: "Un'affermazione.",
  fonte: "Un atto.",
  urlFonte: "https://example.gov.it/atto.pdf",
  dataConsultazione: "2026-07-31",
};

describe("la catena di calcolo", () => {
  it("parte dai 13.800 € su dodici mensilità", () => {
    expect(BASE_MENSILE).toBe(13_800);
    expect(MENSILITA).toBe(12);
  });

  it("produce gli importi delle cariche", () => {
    expect(INDENNITA_SINDACO).toBe(9_660);
    expect(INDENNITA_VICESINDACO).toBe(7_245);
    expect(INDENNITA_ASSESSORE).toBe(5_796);
    expect(INDENNITA_PRESIDENTE_CONSIGLIO).toBe(INDENNITA_ASSESSORE);
  });

  it("il vicesindaco sta al 75%, non al 55%", () => {
    // La fascia «50.001–100.000» nell'art. 4 del D.M. 119/2000 NON esiste:
    // esiste nell'art. 3, che riguarda il sindaco. Portarla sull'art. 4 fa
    // atterrare sul comma 4 (55%, fascia 10.001–50.000) invece che sul comma 5.
    // Pistoia sta sopra i 50.000 abitanti. Questo test esiste perché l'errore
    // è già stato commesso una volta e non lascia tracce: 5.313 è un numero
    // plausibile quanto 7.245.
    expect(INDENNITA_VICESINDACO).not.toBe(5_313);
    expect(INDENNITA_VICESINDACO / INDENNITA_SINDACO).toBeCloseTo(0.75, 10);
  });

  it("il tetto del consigliere è un quarto dell'indennità del sindaco", () => {
    expect(TETTO_CONSIGLIERE).toBe(2_415);
    expect(TETTO_CONSIGLIERE * 4).toBe(INDENNITA_SINDACO);
  });

  it("colloca Pistoia fra le due soglie che decidono le percentuali", () => {
    // Sopra 50.000 (art. 4 c. 5, vicesindaco al 75%) e sotto 100.000
    // (comma 583 lett. c, sindaco al 70%). La fascia regge con qualunque
    // rilevazione disponibile, ed è questo che la rende robusta.
    expect(POPOLAZIONE).toBeGreaterThan(50_000);
    expect(POPOLAZIONE).toBeLessThan(100_000);
  });
});

describe("la composizione della giunta", () => {
  it("conta nove persone: sindaco, vicesindaca e sette assessori", () => {
    const giunta = VOCI.filter((v) => v.inGiunta);
    expect(giunta).toHaveLength(9);
    expect(giunta.filter((v) => v.ruolo === "assessore")).toHaveLength(7);
  });

  it("non cumula: la vicesindaca è anche assessora ma conta una volta sola", () => {
    // TUEL art. 82 c. 5. Contarla due volte gonfierebbe il totale di 5.796 €
    // al mese senza che nessuna riga a schermo lo mostri.
    const nesi = VOCI.filter((v) => v.persona === "Stefania Nesi");
    expect(nesi).toHaveLength(1);
    expect(nesi[0].importoMensile).toBe(INDENNITA_VICESINDACO);
  });

  it("tiene il presidente del consiglio fuori dal totale della giunta", () => {
    const pres = VOCI.find((v) => v.ruolo === "presidente-consiglio");
    expect(pres?.inGiunta).toBe(false);
  });

  it("somma 57.477 € al mese e 689.724 € all'anno", () => {
    expect(costoMensileGiunta()).toBe(57_477);
    expect(costoAnnuoGiunta()).toBe(689_724);
  });
});

describe("il rifiuto delle righe senza fonte", () => {
  it("accetta una riga completa", () => {
    expect(rigaPubblicabile(RIGA_BUONA)).toBe(true);
  });

  it("rifiuta URL assenti, vuoti o finti", () => {
    for (const urlFonte of ["", "   ", "#", "da verificare", "example.gov.it"]) {
      expect(rigaPubblicabile({ ...RIGA_BUONA, urlFonte })).toBe(false);
    }
  });

  it("rifiuta una data di consultazione malformata o mancante", () => {
    for (const dataConsultazione of ["", "31/07/2026", "2026-7-31"]) {
      expect(rigaPubblicabile({ ...RIGA_BUONA, dataConsultazione })).toBe(false);
    }
  });

  it("rifiuta affermazione o fonte vuote", () => {
    expect(rigaPubblicabile({ ...RIGA_BUONA, affermazione: "  " })).toBe(false);
    expect(rigaPubblicabile({ ...RIGA_BUONA, fonte: "" })).toBe(false);
  });

  it("rifiuta null e undefined", () => {
    expect(rigaPubblicabile(null)).toBe(false);
    expect(rigaPubblicabile(undefined)).toBe(false);
  });

  it("tutte le righe pubblicate oggi passano il controllo", () => {
    expect(righePubblicabili(RIGHE_CATENA)).toHaveLength(RIGHE_CATENA.length);
    expect(righePubblicabili(RIGHE_PERSONE)).toHaveLength(RIGHE_PERSONE.length);
    expect(vociPubblicabili()).toHaveLength(VOCI.length);
  });

  it("una voce senza fonte sparisce dall'elenco E dal totale", () => {
    // È la metà che si dimentica: togliere la riga dalla lista ma lasciarla
    // nella somma la fa sopravvivere dentro la cifra display, dove nessuno la
    // vede e nessuno la può contestare.
    const rotta: Voce = {
      ...VOCI[0],
      id: "senza-fonte",
      riga: { ...RIGA_BUONA, urlFonte: "" },
    };
    const voci = [rotta, ...VOCI];
    expect(vociPubblicabili(voci)).toHaveLength(VOCI.length);
    expect(costoMensileGiunta(voci)).toBe(costoMensileGiunta());
  });
});

describe("la scadenza dell'art. 14", () => {
  it("prima del 27 agosto 2026 la pubblicazione è ancora nei termini", () => {
    const s = statoPubblicazione(new Date("2026-07-31T00:00:00Z"));
    expect(s.stato).toBe("attesa");
    expect(s.giorniAllaScadenza).toBe(27);
  });

  it("dopo la scadenza cambia stato", () => {
    expect(statoPubblicazione(new Date("2026-09-01T00:00:00Z")).stato).toBe("scaduta");
    expect(statoPubblicazione(new Date("2026-09-01T00:00:00Z")).giorniAllaScadenza).toBe(0);
  });

  it("il giorno stesso della scadenza non è ancora un ritardo", () => {
    expect(statoPubblicazione(new Date("2026-08-26T12:00:00Z")).stato).toBe("attesa");
  });
});
