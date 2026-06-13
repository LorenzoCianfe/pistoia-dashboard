import { describe, it, expect } from "vitest";
import {
  qtStatus,
  priorityStatus,
  initiativeCategory,
  initiativeStatus,
  placeKind,
  adopterType,
  placeStatus,
  pactStatus,
  projectStatus,
  groupRecurring,
  bucketHeat,
  RECURRING_THRESHOLD,
  HEAT_CELL_SIZE,
} from "@/lib/territorio";

describe("tassonomie O4 (territorio & partecipazione)", () => {
  it("ogni stato/categoria nota ha label e colore coerenti", () => {
    expect(qtStatus("aperto").label).toBe("Domande aperte");
    expect(priorityStatus("aperta").color).toBe("teal");
    expect(initiativeCategory("pulizia").emoji).toBe("🧹");
    expect(initiativeStatus("completa").label).toBe("Posti esauriti");
    expect(placeKind("fontana").emoji).toBe("💧");
    expect(adopterType("scuola")).toBe("Scuola");
    expect(placeStatus("attiva").color).toBe("green");
    expect(pactStatus("completato").color).toBe("green");
    expect(projectStatus("in_corso").label).toBe("In corso");
  });

  it("valori sconosciuti degradano con grazia (label = chiave, colore neutro)", () => {
    expect(qtStatus("boh")).toEqual({ label: "boh", color: "teal" });
    expect(priorityStatus("boh")).toEqual({ label: "boh", color: "teal" });
    expect(initiativeStatus("boh")).toEqual({ label: "boh", color: "teal" });
    expect(placeStatus("boh")).toEqual({ label: "boh", color: "teal" });
    expect(pactStatus("boh")).toEqual({ label: "boh", color: "teal" });
    expect(projectStatus("boh")).toEqual({ label: "boh", color: "teal" });
    expect(initiativeCategory("boh").label).toBe("boh");
    expect(placeKind("boh").label).toBe("boh");
    expect(adopterType("boh")).toBe("boh");
  });
});

describe("groupRecurring — problemi ricorrenti (A2 §7)", () => {
  const make = (category: string, neighborhoodName: string | null) => ({
    category,
    neighborhoodName,
  });

  it("aggrega per (categoria, quartiere) e tiene solo i pattern sopra soglia", () => {
    const reports = [
      ...Array.from({ length: 3 }, () => make("illuminazione", "Sant'Agostino")),
      ...Array.from({ length: 5 }, () => make("buche", "Le Fornaci")),
      make("verde", "Centro"), // sotto soglia
      make("verde", "Centro"),
    ];
    const patterns = groupRecurring(reports);
    expect(patterns).toHaveLength(2);
    // Ordinati per conteggio decrescente: buche (5) prima di illuminazione (3).
    expect(patterns[0]).toEqual({
      category: "buche",
      neighborhoodName: "Le Fornaci",
      count: 5,
    });
    expect(patterns[1].category).toBe("illuminazione");
  });

  it("ignora le segnalazioni senza quartiere", () => {
    const reports = [
      make("buche", null),
      make("buche", null),
      make("buche", null),
    ];
    expect(groupRecurring(reports)).toHaveLength(0);
  });

  it("rispetta una soglia personalizzata", () => {
    const reports = [make("rifiuti", "Bottegone"), make("rifiuti", "Bottegone")];
    expect(groupRecurring(reports, 2)).toHaveLength(1);
    expect(groupRecurring(reports, RECURRING_THRESHOLD)).toHaveLength(0);
  });
});

describe("bucketHeat — heatmap civica (A2 §6)", () => {
  it("raggruppa punti vicini nella stessa cella e li conta", () => {
    const cells = bucketHeat([
      { latitude: 43.9331, longitude: 10.9166 },
      { latitude: 43.9332, longitude: 10.9167 }, // stessa cella
      { latitude: 43.95, longitude: 10.95 }, // cella distante
    ]);
    expect(cells).toHaveLength(2);
    // Ordinate per densità decrescente: la cella con 2 punti viene prima.
    expect(cells[0].count).toBe(2);
    expect(cells[1].count).toBe(1);
  });

  it("colloca il centro della cella sulla griglia di HEAT_CELL_SIZE", () => {
    const [cell] = bucketHeat([{ latitude: 0, longitude: 0 }]);
    expect(cell.latitude).toBeCloseTo(HEAT_CELL_SIZE / 2, 10);
    expect(cell.longitude).toBeCloseTo(HEAT_CELL_SIZE / 2, 10);
  });

  it("nessun punto → nessuna cella", () => {
    expect(bucketHeat([])).toEqual([]);
  });
});
