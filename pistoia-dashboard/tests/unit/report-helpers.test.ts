import { describe, it, expect } from "vitest";
import {
  quickReportTitle,
  reportUrgency,
  REPORT_URGENCY,
  REPORT_PHOTO_PHASE,
  REPORT_PHOTO_PHASES,
  RESOLUTION_FEEDBACK,
  REPORT_CATEGORY,
} from "@/lib/community";

describe("quickReportTitle (A2 §4)", () => {
  it("compone categoria e luogo", () => {
    expect(quickReportTitle("buche", "Via Roma")).toBe("Buche e strade — Via Roma");
  });

  it("senza luogo usa solo la categoria", () => {
    expect(quickReportTitle("illuminazione")).toBe("Illuminazione pubblica");
    expect(quickReportTitle("illuminazione", "   ")).toBe("Illuminazione pubblica");
  });

  it("categoria sconosciuta degrada con grazia", () => {
    expect(quickReportTitle("boh", "Via X")).toBe("Segnalazione — Via X");
  });

  it("rispetta il limite del titolo (120) per ogni categoria reale", () => {
    const longLoc = "Via ".padEnd(160, "x");
    for (const key of Object.keys(REPORT_CATEGORY)) {
      expect(quickReportTitle(key, longLoc).length).toBeLessThanOrEqual(120);
    }
  });
});

describe("reportUrgency (A1 §8)", () => {
  it("mappa i tre stati", () => {
    expect(reportUrgency("richiesta")?.label).toBe("Urgenza segnalata");
    expect(reportUrgency("confermata")?.label).toBe("Urgente");
    expect(reportUrgency("confermata")?.color).toBe("red");
    expect(reportUrgency("respinta")).not.toBeNull();
  });

  it("null/sconosciuto → null (nessun badge)", () => {
    expect(reportUrgency(null)).toBeNull();
    expect(reportUrgency(undefined)).toBeNull();
    expect(reportUrgency("x")).toBeNull();
  });

  it("le chiavi della tassonomia sono stabili", () => {
    expect(Object.keys(REPORT_URGENCY).sort()).toEqual([
      "confermata",
      "respinta",
      "richiesta",
    ]);
  });
});

describe("fasi foto e feedback risoluzione (A1 §4–5)", () => {
  it("le fasi sono ordinate prima → durante → dopo", () => {
    expect([...REPORT_PHOTO_PHASES]).toEqual(["prima", "durante", "dopo"]);
    for (const ph of REPORT_PHOTO_PHASES) {
      expect(REPORT_PHOTO_PHASE[ph]).toBeDefined();
    }
  });

  it("gli esiti della conferma cittadino esistono entrambi", () => {
    expect(Object.keys(RESOLUTION_FEEDBACK).sort()).toEqual([
      "confermata",
      "riaperta",
    ]);
  });
});
