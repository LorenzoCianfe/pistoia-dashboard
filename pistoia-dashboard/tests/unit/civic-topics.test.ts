import { describe, expect, it } from "vitest";
import {
  CIVIC_TOPICS,
  CIVIC_TOPIC_KEYS,
  parseCivicInterests,
  serializeCivicInterests,
  AFFECTED_GROUPS,
  parseAffectedGroups,
  serializeAffectedGroups,
  matchTopic,
  topicCategories,
  hasAssessment,
  IMPACT_SCALE,
  COST_SCALE,
  TIME_SCALE,
  FEASIBILITY_SCALE,
} from "@/lib/civic-topics";
import { REPORT_CATEGORY, EVENT_CATEGORY } from "@/lib/community";

describe("CIVIC_TOPICS — integrità della taxonomy", () => {
  it("ogni categoria segnalazioni referenziata esiste nel catalogo canonico", () => {
    for (const key of CIVIC_TOPIC_KEYS) {
      for (const c of CIVIC_TOPICS[key].reportCats) {
        expect(REPORT_CATEGORY, `${key} → report "${c}"`).toHaveProperty(c);
      }
    }
  });

  it("ogni categoria eventi referenziata esiste nel catalogo canonico", () => {
    for (const key of CIVIC_TOPIC_KEYS) {
      for (const c of CIVIC_TOPICS[key].eventCats) {
        expect(EVENT_CATEGORY, `${key} → event "${c}"`).toHaveProperty(c);
      }
    }
  });

  it("ogni tema ha label ed emoji", () => {
    for (const key of CIVIC_TOPIC_KEYS) {
      expect(CIVIC_TOPICS[key].label.length).toBeGreaterThan(0);
      expect(CIVIC_TOPICS[key].emoji.length).toBeGreaterThan(0);
    }
  });
});

describe("parseCivicInterests", () => {
  it("è tollerante: null, JSON rotto e tipi sbagliati danno lista vuota", () => {
    expect(parseCivicInterests(null)).toEqual([]);
    expect(parseCivicInterests(undefined)).toEqual([]);
    expect(parseCivicInterests("")).toEqual([]);
    expect(parseCivicInterests("non-json")).toEqual([]);
    expect(parseCivicInterests('{"a":1}')).toEqual([]);
    expect(parseCivicInterests("42")).toEqual([]);
  });

  it("filtra le chiavi sconosciute e deduplica", () => {
    const raw = JSON.stringify(["mobilita", "inesistente", "mobilita", "ambiente", 7]);
    expect(parseCivicInterests(raw)).toEqual(["mobilita", "ambiente"]);
  });

  it("round-trip con serializeCivicInterests", () => {
    const roundTrip = parseCivicInterests(serializeCivicInterests(["sport", "cultura"]));
    expect(roundTrip).toEqual(["sport", "cultura"]);
  });
});

describe("serializeCivicInterests", () => {
  it("restituisce null quando non resta nulla di valido", () => {
    expect(serializeCivicInterests([])).toBeNull();
    expect(serializeCivicInterests(["x", "y"])).toBeNull();
  });
});

describe("affected groups", () => {
  it("parse filtra chiavi sconosciute e tollera JSON rotto", () => {
    expect(parseAffectedGroups(null)).toEqual([]);
    expect(parseAffectedGroups("oops")).toEqual([]);
    expect(
      parseAffectedGroups(JSON.stringify(["famiglie", "alieni", "anziani"])),
    ).toEqual(["famiglie", "anziani"]);
  });

  it("serialize valida sul catalogo", () => {
    expect(serializeAffectedGroups(["alieni"])).toBeNull();
    const out = serializeAffectedGroups(["residenti", "residenti", "turisti"]);
    expect(out && JSON.parse(out)).toEqual(["residenti", "turisti"]);
    for (const k of Object.keys(AFFECTED_GROUPS)) {
      expect(AFFECTED_GROUPS[k].label.length).toBeGreaterThan(0);
    }
  });
});

describe("matchTopic", () => {
  it("trova il tema che copre la categoria del contenuto", () => {
    expect(matchTopic(["mobilita"], "report", "buche")).toBe("mobilita");
    expect(matchTopic(["ambiente"], "event", "ecologica")).toBe("ambiente");
    expect(matchTopic(["scuole"], "opera", "scuola")).toBe("scuole");
    expect(matchTopic(["cultura"], "proposal", "Cultura")).toBe("cultura");
  });

  it("rispetta l'ordine dei temi dell'utente (il primo che combacia vince)", () => {
    // "illuminazione" è coperta sia da sicurezza sia da lavori.
    expect(matchTopic(["sicurezza", "lavori"], "report", "illuminazione")).toBe("sicurezza");
    expect(matchTopic(["lavori", "sicurezza"], "report", "illuminazione")).toBe("lavori");
  });

  it("restituisce null senza categoria o senza copertura", () => {
    expect(matchTopic(["mobilita"], "report", null)).toBeNull();
    expect(matchTopic(["mobilita"], "report", "rifiuti")).toBeNull();
    expect(matchTopic([], "report", "buche")).toBeNull();
  });

  it("topicCategories copre i quattro tipi di contenuto", () => {
    expect(topicCategories("mobilita", "report")).toContain("buche");
    expect(topicCategories("mobilita", "opera")).toContain("mobilita");
    expect(topicCategories("eventi", "event").length).toBeGreaterThan(0);
    expect(topicCategories("ambiente", "proposal")).toContain("Verde");
  });
});

describe("valutazione sintetica", () => {
  const empty = {
    estimatedImpact: null,
    estimatedCost: null,
    estimatedTime: null,
    feasibility: null,
    assessedAt: null,
  };

  it("hasAssessment è falso solo quando tutti i campi sono vuoti", () => {
    expect(hasAssessment(empty)).toBe(false);
    expect(hasAssessment({ ...empty, estimatedCost: "medio" })).toBe(true);
    expect(hasAssessment({ ...empty, feasibility: "fattibile" })).toBe(true);
  });

  it("le scale hanno label e colore per ogni valore", () => {
    for (const scale of [IMPACT_SCALE, TIME_SCALE, FEASIBILITY_SCALE]) {
      for (const v of Object.values(scale)) {
        expect(v.label.length).toBeGreaterThan(0);
        expect(v.color.length).toBeGreaterThan(0);
      }
    }
    expect(COST_SCALE.basso.symbol).toBe("€");
    expect(COST_SCALE.medio.symbol).toBe("€€");
    expect(COST_SCALE.alto.symbol).toBe("€€€");
  });
});
