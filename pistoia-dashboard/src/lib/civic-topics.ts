// Ondata 2 taxonomies: temi civici personali (A2 §3), gruppi di cittadini
// impattati (A2 §26) e scale della valutazione sintetica delle proposte
// (A1 §15 + A2 §10). Pure data only (no React imports), like community.ts.

import { REPORT_CATEGORY, EVENT_CATEGORY } from "@/lib/community";

// ---------------------------------------------------------------------------
// Temi civici — scelti dall'utente, pilotano il feed "Per te" e le notifiche
// ---------------------------------------------------------------------------

export type CivicTopicKey =
  | "mobilita"
  | "ambiente"
  | "scuole"
  | "eventi"
  | "lavori"
  | "sicurezza"
  | "giovani"
  | "cultura"
  | "sport"
  | "accessibilita"
  | "turismo"
  | "commercio";

export type CivicTopic = {
  label: string;
  emoji: string;
  color: string;
  /** REPORT_CATEGORY keys that belong to this topic. */
  reportCats: string[];
  /** Proposal "Ambito" labels that belong to this topic. */
  proposalCats: string[];
  /** EVENT_CATEGORY keys that belong to this topic. */
  eventCats: string[];
  /** Opera categories that belong to this topic. */
  operaCats: string[];
};

export const CIVIC_TOPICS: Record<CivicTopicKey, CivicTopic> = {
  mobilita: {
    label: "Mobilità",
    emoji: "🚲",
    color: "teal",
    reportCats: ["buche", "trasporto"],
    proposalCats: ["Mobilità"],
    eventCats: [],
    operaCats: ["mobilita"],
  },
  ambiente: {
    label: "Ambiente e verde",
    emoji: "🌿",
    color: "green",
    reportCats: ["rifiuti", "verde", "parchi"],
    proposalCats: ["Verde", "Ambiente"],
    eventCats: ["ecologica"],
    operaCats: ["verde"],
  },
  scuole: {
    label: "Scuole",
    emoji: "🎒",
    color: "teal",
    reportCats: ["scuole"],
    proposalCats: [],
    eventCats: [],
    operaCats: ["scuola"],
  },
  eventi: {
    label: "Eventi",
    emoji: "🎪",
    color: "viola",
    reportCats: [],
    proposalCats: [],
    eventCats: ["comune", "associazione", "mercato", "mostra", "teatro", "incontro"],
    operaCats: [],
  },
  lavori: {
    label: "Lavori pubblici",
    emoji: "🏗️",
    color: "amber",
    reportCats: ["buche", "illuminazione", "decoro"],
    proposalCats: ["Decoro"],
    eventCats: [],
    operaCats: ["piazza", "restauro"],
  },
  sicurezza: {
    label: "Sicurezza urbana",
    emoji: "🛡️",
    color: "red",
    reportCats: ["sicurezza", "illuminazione"],
    proposalCats: ["Sicurezza"],
    eventCats: [],
    operaCats: [],
  },
  giovani: {
    label: "Giovani",
    emoji: "🧑‍🎓",
    color: "viola",
    reportCats: [],
    proposalCats: ["Sport", "Sociale"],
    eventCats: ["sport", "volontariato"],
    operaCats: ["sociale"],
  },
  cultura: {
    label: "Cultura",
    emoji: "🎭",
    color: "viola",
    reportCats: [],
    proposalCats: ["Cultura"],
    eventCats: ["mostra", "teatro"],
    operaCats: ["restauro"],
  },
  sport: {
    label: "Sport",
    emoji: "⚽",
    color: "green",
    reportCats: ["parchi"],
    proposalCats: ["Sport"],
    eventCats: ["sport"],
    operaCats: [],
  },
  accessibilita: {
    label: "Accessibilità",
    emoji: "♿",
    color: "teal",
    reportCats: ["barriere"],
    proposalCats: ["Sociale"],
    eventCats: [],
    operaCats: ["sociale"],
  },
  turismo: {
    label: "Turismo",
    emoji: "🧭",
    color: "amber",
    reportCats: [],
    proposalCats: ["Cultura"],
    eventCats: ["mostra", "mercato", "teatro"],
    operaCats: ["restauro", "piazza"],
  },
  commercio: {
    label: "Commercio locale",
    emoji: "🛍️",
    color: "amber",
    reportCats: ["decoro"],
    proposalCats: [],
    eventCats: ["mercato"],
    operaCats: ["piazza"],
  },
};

export const CIVIC_TOPIC_KEYS = Object.keys(CIVIC_TOPICS) as CivicTopicKey[];

export function civicTopic(key: string): CivicTopic | null {
  return (CIVIC_TOPICS as Record<string, CivicTopic>)[key] ?? null;
}

/**
 * Parses `User.civicInterests` (JSON array) into valid topic keys.
 * Tolerant by design: bad JSON or unknown keys never break a page.
 */
export function parseCivicInterests(raw: string | null | undefined): CivicTopicKey[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const seen = new Set<CivicTopicKey>();
    for (const item of arr) {
      if (typeof item === "string" && item in CIVIC_TOPICS) {
        seen.add(item as CivicTopicKey);
      }
    }
    return [...seen];
  } catch {
    return [];
  }
}

/** Serializes a list of topic keys for storage; null when nothing valid is selected. */
export function serializeCivicInterests(keys: readonly string[]): string | null {
  const valid = [...new Set(keys.filter((k) => k in CIVIC_TOPICS))];
  return valid.length > 0 ? JSON.stringify(valid) : null;
}

export type CivicContentKind = "report" | "proposal" | "event" | "opera";

/** Le categorie di contenuto coperte da un tema, per tipo di contenuto. */
export function topicCategories(key: CivicTopicKey, kind: CivicContentKind): string[] {
  const t = CIVIC_TOPICS[key];
  switch (kind) {
    case "report":
      return t.reportCats;
    case "proposal":
      return t.proposalCats;
    case "event":
      return t.eventCats;
    case "opera":
      return t.operaCats;
  }
}

/**
 * Primo tema dell'utente che copre la categoria del contenuto: è l'etichetta
 * "perché lo vedi" del feed Per te. Null = nessun tema combacia.
 */
export function matchTopic(
  interests: readonly CivicTopicKey[],
  kind: CivicContentKind,
  category: string | null | undefined,
): CivicTopicKey | null {
  if (!category) return null;
  for (const key of interests) {
    if (topicCategories(key, kind).includes(category)) return key;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Gruppi di cittadini impattati (A2 §26) — descrivono l'intervento, mai le persone
// ---------------------------------------------------------------------------

export const AFFECTED_GROUPS: Record<string, { label: string; emoji: string }> = {
  residenti: { label: "Residenti", emoji: "🏠" },
  famiglie: { label: "Famiglie", emoji: "👨‍👩‍👧" },
  studenti: { label: "Studenti", emoji: "🎓" },
  giovani: { label: "Giovani", emoji: "🧑" },
  anziani: { label: "Anziani", emoji: "👵" },
  commercianti: { label: "Commercianti", emoji: "🛍️" },
  pendolari: { label: "Pendolari", emoji: "🚌" },
  disabilita: { label: "Persone con disabilità", emoji: "♿" },
  turisti: { label: "Turisti", emoji: "🧳" },
};

export const AFFECTED_GROUP_KEYS = Object.keys(AFFECTED_GROUPS);

/** Parses `Proposal.affectedGroups` (JSON array) into valid group keys. */
export function parseAffectedGroups(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return [...new Set(arr.filter((g) => typeof g === "string" && g in AFFECTED_GROUPS))];
  } catch {
    return [];
  }
}

/** Serializes affected-group keys for storage; null when nothing valid is selected. */
export function serializeAffectedGroups(keys: readonly string[]): string | null {
  const valid = [...new Set(keys.filter((k) => k in AFFECTED_GROUPS))];
  return valid.length > 0 ? JSON.stringify(valid) : null;
}

// ---------------------------------------------------------------------------
// Valutazione sintetica delle proposte (A1 §15 + A2 §10)
// Compilata dal Comune, dichiaratamente indicativa: integra, non sostituisce,
// la valutazione tecnica.
// ---------------------------------------------------------------------------

export const IMPACT_SCALE: Record<string, { label: string; color: string }> = {
  basso: { label: "Basso", color: "viola" },
  medio: { label: "Medio", color: "amber" },
  alto: { label: "Alto", color: "green" },
};

export const COST_SCALE: Record<string, { label: string; symbol: string; color: string }> = {
  basso: { label: "Contenuto", symbol: "€", color: "green" },
  medio: { label: "Medio", symbol: "€€", color: "amber" },
  alto: { label: "Importante", symbol: "€€€", color: "red" },
};

export const TIME_SCALE: Record<string, { label: string; color: string }> = {
  breve: { label: "Breve", color: "green" },
  medio: { label: "Medio", color: "amber" },
  lungo: { label: "Lungo", color: "viola" },
};

export const FEASIBILITY_SCALE: Record<string, { label: string; color: string }> = {
  da_valutare: { label: "Da valutare", color: "amber" },
  fattibile: { label: "Fattibile", color: "green" },
  complessa: { label: "Complessa", color: "viola" },
};

export type ProposalAssessment = {
  estimatedImpact: string | null;
  estimatedCost: string | null;
  estimatedTime: string | null;
  feasibility: string | null;
  assessedAt: Date | null;
};

/** True when the Comune compiled at least one field of the assessment. */
export function hasAssessment(a: ProposalAssessment): boolean {
  return !!(a.estimatedImpact || a.estimatedCost || a.estimatedTime || a.feasibility);
}

// Self-check in dev: every category referenced by a topic must exist in the
// canonical taxonomies (typos here would silently empty the "Per te" feed).
if (process.env.NODE_ENV !== "production") {
  for (const [key, t] of Object.entries(CIVIC_TOPICS)) {
    for (const c of t.reportCats) {
      if (!(c in REPORT_CATEGORY)) throw new Error(`CIVIC_TOPICS.${key}: report cat "${c}" sconosciuta`);
    }
    for (const c of t.eventCats) {
      if (!(c in EVENT_CATEGORY)) throw new Error(`CIVIC_TOPICS.${key}: event cat "${c}" sconosciuta`);
    }
  }
}
