import { describe, it, expect } from "vitest";
import {
  CANALI_SOLLECITAZIONE,
  SILENZIO_POPUP_CHIUSO_GIORNI,
  condizionePerCategoria,
  inPubblicoCampagna,
  periodoPrecedente,
  promemoriaDovuto,
  puoMostrarePopup,
  puoSollecitare,
} from "@/lib/sollecitazioni";
import { RICHIESTA_SILENZIO_GIORNI, SERVIZI } from "@/lib/valutazioni";
import { REPORT_CATEGORY } from "@/lib/community";

/*
  Il cancello di R-5: il contatore unico provato a DATE FISSE, come
  statoPubblicazione(). Nessun `new Date()` senza argomento in questo file —
  ogni asserzione dichiara il proprio oggi.
*/

const OGGI = new Date("2026-08-04T12:00:00Z");
const giorniFa = (n: number) => new Date(OGGI.getTime() - n * 86_400_000);

describe("il contatore unico (RICHIESTA_SILENZIO_GIORNI)", () => {
  it("con nessuna storia, si può chiedere", () => {
    expect(
      puoSollecitare(OGGI, { ultimaSollecitazione: null, ultimoVoto: null }),
    ).toBe(true);
  });

  it("una sollecitazione recente chiude la finestra, da qualunque canale", () => {
    expect(
      puoSollecitare(OGGI, {
        ultimaSollecitazione: giorniFa(RICHIESTA_SILENZIO_GIORNI - 1),
        ultimoVoto: null,
      }),
    ).toBe(false);
  });

  it("la finestra riapre esattamente al trentesimo giorno, non prima", () => {
    const stato = (g: number) => ({
      ultimaSollecitazione: giorniFa(g),
      ultimoVoto: null,
    });
    expect(puoSollecitare(OGGI, stato(RICHIESTA_SILENZIO_GIORNI))).toBe(true);
    expect(puoSollecitare(OGGI, stato(RICHIESTA_SILENZIO_GIORNI - 1))).toBe(false);
  });

  it("un voto recente chiude la finestra: la domanda ha già avuto risposta", () => {
    expect(
      puoSollecitare(OGGI, {
        ultimaSollecitazione: null,
        ultimoVoto: giorniFa(3),
      }),
    ).toBe(false);
    expect(
      puoSollecitare(OGGI, {
        ultimaSollecitazione: null,
        ultimoVoto: giorniFa(RICHIESTA_SILENZIO_GIORNI),
      }),
    ).toBe(true);
  });

  it("i canali che sollecitano sono tre: gli altri ingressi non contano", () => {
    expect(CANALI_SOLLECITAZIONE).toEqual(["segnalazione", "campagna", "popup"]);
  });
});

describe("il silenzio lungo del pop-up", () => {
  const libera = { ultimaSollecitazione: null, ultimoVoto: null };

  it("la X tace il pop-up per 180 giorni anche a finestra libera", () => {
    expect(
      puoMostrarePopup(OGGI, {
        ...libera,
        popupChiusoIl: giorniFa(SILENZIO_POPUP_CHIUSO_GIORNI - 1),
      }),
    ).toBe(false);
    expect(
      puoMostrarePopup(OGGI, {
        ...libera,
        popupChiusoIl: giorniFa(SILENZIO_POPUP_CHIUSO_GIORNI),
      }),
    ).toBe(true);
  });

  it("senza chiusure vale la finestra ordinaria", () => {
    expect(puoMostrarePopup(OGGI, { ...libera, popupChiusoIl: null })).toBe(true);
    expect(
      puoMostrarePopup(OGGI, {
        ultimaSollecitazione: giorniFa(2),
        ultimoVoto: null,
        popupChiusoIl: null,
      }),
    ).toBe(false);
  });
});

describe("l'invito contestuale (categoria → condizione)", () => {
  it("le categorie della colonna dura portano alla loro casella", () => {
    expect(condizionePerCategoria("rifiuti")?.id).toBe("pulizia");
    expect(condizionePerCategoria("decoro")?.id).toBe("pulizia");
    expect(condizionePerCategoria("illuminazione")?.id).toBe("illuminazione");
    expect(condizionePerCategoria("verde")?.id).toBe("verde");
    expect(condizionePerCategoria("parchi")?.id).toBe("verde");
    expect(condizionePerCategoria("trasporto")?.id).toBe("trasporti");
    expect(condizionePerCategoria("sicurezza")?.id).toBe("sicurezza");
  });

  it("per le categorie senza casella l'invito non esiste, e non è un buco", () => {
    for (const categoria of ["buche", "rumore", "barriere", "scuole", "animali"]) {
      expect(condizionePerCategoria(categoria)).toBeNull();
    }
  });

  it("ogni categoria vera o ha una casella o è dichiarata senza", () => {
    // Il totale quadra col catalogo: 7 categorie mappate, 5 no. Se una
    // categoria nuova compare in REPORT_CATEGORY, questo test costringe a
    // decidere da che parte sta.
    const mappate = Object.keys(REPORT_CATEGORY).filter(
      (c) => condizionePerCategoria(c) != null,
    );
    expect(mappate).toHaveLength(7);
    expect(Object.keys(REPORT_CATEGORY)).toHaveLength(12);
  });

  it("nessuno sportello risponde a una categoria: l'invito è solo per le condizioni", () => {
    for (const s of SERVIZI.filter((x) => x.famiglia === "sportello")) {
      expect(s.categorieReport).toHaveLength(0);
    }
  });
});

describe("il pubblico della campagna mensile", () => {
  it("chi ha votato il mese scorso e non questo è nel pubblico", () => {
    expect(inPubblicoCampagna(OGGI, ["2026-07"])).toBe(true);
  });

  it("chi ha già rinnovato non lo è, anche se votò il mese scorso", () => {
    expect(inPubblicoCampagna(OGGI, ["2026-07", "2026-08"])).toBe(false);
  });

  it("chi non ha mai votato non è pubblico di un rinnovo", () => {
    expect(inPubblicoCampagna(OGGI, [])).toBe(false);
  });

  it("un voto più vecchio di un mese non basta", () => {
    expect(inPubblicoCampagna(OGGI, ["2026-06"])).toBe(false);
  });

  it("il periodo precedente attraversa l'anno", () => {
    expect(periodoPrecedente("2026-08")).toBe("2026-07");
    expect(periodoPrecedente("2026-01")).toBe("2025-12");
  });
});

describe("il promemoria per email", () => {
  it("è dovuto quando la mail del mese non è mai partita", () => {
    expect(promemoriaDovuto(OGGI, null)).toBe(true);
    expect(promemoriaDovuto(OGGI, "2026-07")).toBe(true);
  });

  it("non è dovuto due volte nello stesso mese", () => {
    expect(promemoriaDovuto(OGGI, "2026-08")).toBe(false);
  });
});
