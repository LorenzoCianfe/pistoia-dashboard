import { describe, it, expect } from "vitest";
import {
  decisionOutcome,
  decisionKind,
  commitmentStatus,
  COMMITMENT_STATUS,
  COMMITMENT_STATUS_ORDER,
  noticeKind,
  noticeSeverity,
  faqCategory,
  parseStringArray,
} from "@/lib/transparency";
import { GLOSSARY, glossaryTerm } from "@/lib/glossary";
import { weeklyBuckets } from "@/lib/citystats";

describe("tassonomie O3 (decisioni, promesse, avvisi, FAQ)", () => {
  it("ogni esito di decisione ha label e colore", () => {
    expect(decisionOutcome("approvata").label).toBe("Approvata");
    expect(decisionOutcome("respinta").color).toBe("red");
  });

  it("valori sconosciuti degradano con grazia", () => {
    expect(decisionOutcome("boh")).toEqual({ label: "boh", color: "teal" });
    expect(decisionKind("boh")).toBe("boh");
    expect(commitmentStatus("boh")).toEqual({ label: "boh", color: "teal" });
    expect(noticeKind("boh")).toEqual({ label: "boh", emoji: "📌" });
    expect(noticeSeverity("boh")).toEqual({ label: "boh", color: "teal" });
    expect(faqCategory("boh")).toBe("boh");
  });

  it("faqCategory: null/undefined → gruppo generico", () => {
    expect(faqCategory(null)).toBe("Altre domande");
    expect(faqCategory(undefined)).toBe("Altre domande");
  });

  it("l'ordine del tracker copre tutti gli stati definiti", () => {
    expect([...COMMITMENT_STATUS_ORDER].sort()).toEqual(
      Object.keys(COMMITMENT_STATUS).sort(),
    );
  });
});

describe("parseStringArray (impactNotes, whatChanges, rejectionReasons)", () => {
  it("parsea un array JSON valido", () => {
    expect(parseStringArray('["a","b"]')).toEqual(["a", "b"]);
  });

  it("scarta gli elementi non-stringa", () => {
    expect(parseStringArray('["a",1,null,{"x":2},"b"]')).toEqual(["a", "b"]);
  });

  it("null, vuoto, JSON rotto o non-array → []", () => {
    expect(parseStringArray(null)).toEqual([]);
    expect(parseStringArray(undefined)).toEqual([]);
    expect(parseStringArray("")).toEqual([]);
    expect(parseStringArray("{not json")).toEqual([]);
    expect(parseStringArray('{"a":1}')).toEqual([]);
  });
});

describe("glossario (A2 §27)", () => {
  it("gli slug sono unici", () => {
    const slugs = GLOSSARY.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("ogni voce ha termine e definizione non vuoti", () => {
    for (const t of GLOSSARY) {
      expect(t.term.trim().length).toBeGreaterThan(0);
      expect(t.definition.trim().length).toBeGreaterThan(20);
    }
  });

  it("lookup per slug, null per termini ignoti", () => {
    expect(glossaryTerm("avanzo")?.term).toBe("Avanzo di bilancio");
    expect(glossaryTerm("non-esiste")).toBeNull();
  });
});

describe("weeklyBuckets (hero Stato della città)", () => {
  const now = new Date("2026-06-12T12:00:00Z");
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  it("ordina i bucket dal più vecchio al più recente", () => {
    const buckets = weeklyBuckets([daysAgo(1), daysAgo(2), daysAgo(10)], now, 4);
    // 1-2 giorni fa → ultima settimana; 10 giorni fa → penultima.
    expect(buckets).toEqual([0, 0, 1, 2]);
  });

  it("ignora date fuori finestra o future", () => {
    const buckets = weeklyBuckets([daysAgo(100), daysAgo(-3)], now, 4);
    expect(buckets).toEqual([0, 0, 0, 0]);
  });

  it("una data esattamente al bordo cade nella settimana più vecchia inclusa", () => {
    const buckets = weeklyBuckets([daysAgo(27.9)], now, 4);
    expect(buckets[0]).toBe(1);
  });
});
