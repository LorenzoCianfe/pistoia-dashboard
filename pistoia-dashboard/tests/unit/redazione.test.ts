import { describe, expect, it } from "vitest";
import {
  FIRMA_REDAZIONE,
  etichettaPeriodo,
  isRedazione,
  notaPubblicabile,
  puoRimuovere,
  timbroCarica,
} from "@/lib/redazione";
import { GIUNTA } from "@/lib/giunta";

/*
  IL CANCELLO DI R-4 (docs/piano-rating-servizi.md §7): un account del Comune
  NON può rimuovere una valutazione. Nel modello dei ruoli `ADMIN` è il
  super-account del COMUNE (SECURITY.md §4), quindi il cancello vale anche —
  soprattutto — per lui. L'E2E prova la porta (/redazione respinge il Comune);
  qui si prova il predicato che ogni azione di rimozione usa.
*/
describe("il cancello: chi può rimuovere", () => {
  it("gli account del Comune NON possono rimuovere — ADMIN compreso", () => {
    expect(puoRimuovere("ADMIN")).toBe(false);
    expect(puoRimuovere("MUNICIPAL_STAFF")).toBe(false);
  });

  it("rimuove solo la Redazione (ruolo MODERATOR), e nessun altro", () => {
    expect(puoRimuovere("MODERATOR")).toBe(true);
    expect(puoRimuovere("CITIZEN")).toBe(false);
    expect(puoRimuovere("")).toBe(false);
  });

  it("isRedazione e puoRimuovere sono la stessa regola, per costruzione", () => {
    // Due definizioni della stessa regola sono peggio di nessuna regola.
    expect(puoRimuovere).toBe(isRedazione);
  });
});

describe("la firma collettiva", () => {
  it("è l'entità, mai una persona", () => {
    expect(FIRMA_REDAZIONE).toBe("Redazione della Dashboard di Pistoia");
  });
});

describe("timbroCarica — scattato alla scrittura, mai ricalcolato", () => {
  const sindaco = GIUNTA.find((c) => c.ruolo === "sindaco")!;

  it("aggancia la carica dall'email dell'account, come la scrive il Comune", () => {
    expect(timbroCarica(sindaco.email, new Date(2026, 7, 3))).toBe(
      `${sindaco.carica} nel 2026`,
    );
  });

  it("normalizza l'email (maiuscole, spazi), perché è una chiave e non un testo", () => {
    expect(timbroCarica(`  ${sindaco.email.toUpperCase()}  `, new Date(2026, 0, 1))).toBe(
      `${sindaco.carica} nel 2026`,
    );
  });

  it("l'anno è quello della scrittura: un timbro del 2031 dice 2031", () => {
    expect(timbroCarica(sindaco.email, new Date(2031, 5, 10))).toBe(
      `${sindaco.carica} nel 2031`,
    );
  });

  it("un'email fuori dalla giunta scrive SENZA timbro: meglio nessuna carica che una dedotta", () => {
    expect(timbroCarica("comune@pistoia.it", new Date(2026, 7, 3))).toBeNull();
  });
});

describe("notaPubblicabile — una nota senza fonte non va a schermo", () => {
  it("rifiuta la nota senza URL della fonte", () => {
    expect(
      notaPubblicabile({ tipo: "nota-redazione", urlFonte: "", dataConsultazione: "2026-08-03" }),
    ).toBe(false);
    expect(
      notaPubblicabile({ tipo: "nota-redazione", urlFonte: null, dataConsultazione: "2026-08-03" }),
    ).toBe(false);
  });

  it("rifiuta la nota senza data di consultazione", () => {
    expect(
      notaPubblicabile({ tipo: "nota-redazione", urlFonte: "https://esempio.it", dataConsultazione: "  " }),
    ).toBe(false);
  });

  it("accetta la nota completa", () => {
    expect(
      notaPubblicabile({
        tipo: "nota-redazione",
        urlFonte: "https://esempio.it/atto",
        dataConsultazione: "2026-08-03",
      }),
    ).toBe(true);
  });

  it("le risposte del Comune non c'entrano: sono parole, non dati ancorati", () => {
    expect(notaPubblicabile({ tipo: "quadro" })).toBe(true);
    expect(notaPubblicabile({ tipo: "singola" })).toBe(true);
  });
});

describe("etichettaPeriodo", () => {
  it("traduce il periodo in parole", () => {
    expect(etichettaPeriodo("2026-07")).toBe("luglio 2026");
    expect(etichettaPeriodo("2026-12")).toBe("dicembre 2026");
    expect(etichettaPeriodo("2027-01")).toBe("gennaio 2027");
  });

  it("un periodo malformato resta com'è, senza inventare un mese", () => {
    expect(etichettaPeriodo("garbage")).toBe("garbage");
    expect(etichettaPeriodo("2026-13")).toBe("2026-13");
  });
});
