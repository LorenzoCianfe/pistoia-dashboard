// Tassonomie dell'Ondata 3 "Trasparenza che chiude il cerchio".
// Pure data + helper di lookup: importabile ovunque (server e client),
// stessa filosofia di community.ts / labels.ts.

import type { AccentColor } from "@/lib/colors";

type Meta = { label: string; color: AccentColor };

// --- Archivio decisioni (A1 §12) -------------------------------------------

export const DECISION_OUTCOME: Record<string, Meta> = {
  approvata: { label: "Approvata", color: "green" },
  approvata_parzialmente: { label: "Approvata in parte", color: "teal" },
  respinta: { label: "Non approvata", color: "red" },
  rinviata: { label: "Rinviata", color: "amber" },
};

export function decisionOutcome(s: string): Meta {
  return DECISION_OUTCOME[s] ?? { label: s, color: "teal" };
}

export const DECISION_KIND: Record<string, string> = {
  proposta: "Proposta cittadina",
  consultazione: "Consultazione",
  segnalazione: "Segnalazione",
  ordinanza: "Ordinanza",
  delibera: "Delibera",
};

export function decisionKind(s: string): string {
  return DECISION_KIND[s] ?? s;
}

// --- Promesse e risultati (A1 §30) ------------------------------------------

export const COMMITMENT_STATUS: Record<string, Meta> = {
  promesso: { label: "Promesso", color: "viola" },
  in_corso: { label: "In corso", color: "teal" },
  completato: { label: "Completato", color: "green" },
  rimandato: { label: "Rimandato", color: "amber" },
  non_fattibile: { label: "Non fattibile", color: "red" },
};

/** Ordine di presentazione del tracker: prima ciò che si muove. */
export const COMMITMENT_STATUS_ORDER = [
  "in_corso",
  "promesso",
  "completato",
  "rimandato",
  "non_fattibile",
] as const;

export function commitmentStatus(s: string): Meta {
  return COMMITMENT_STATUS[s] ?? { label: s, color: "teal" };
}

// --- Bacheca avvisi urgenti (A1 §21) ----------------------------------------

export const NOTICE_KIND: Record<string, { label: string; emoji: string }> = {
  meteo: { label: "Allerta meteo", emoji: "🌧️" },
  scuole: { label: "Scuole", emoji: "🏫" },
  traffico: { label: "Traffico e viabilità", emoji: "🚧" },
  emergenza: { label: "Emergenza", emoji: "🚨" },
  interruzione: { label: "Interruzione servizi", emoji: "💧" },
  sciopero: { label: "Sciopero", emoji: "📢" },
  ordinanza: { label: "Ordinanza", emoji: "📜" },
};

export function noticeKind(s: string) {
  return NOTICE_KIND[s] ?? { label: s, emoji: "📌" };
}

export const NOTICE_SEVERITY: Record<string, Meta> = {
  info: { label: "Informazione", color: "teal" },
  attenzione: { label: "Attenzione", color: "amber" },
  critico: { label: "Critico", color: "red" },
};

export function noticeSeverity(s: string): Meta {
  return NOTICE_SEVERITY[s] ?? { label: s, color: "teal" };
}

// --- FAQ della città (A1 §11) -----------------------------------------------

export const FAQ_CATEGORY: Record<string, string> = {
  mobilita: "Mobilità e ZTL",
  rifiuti: "Rifiuti e ambiente",
  tributi: "Tributi e pagamenti",
  scuole: "Scuola e famiglie",
  servizi: "Servizi comunali",
  casa: "Casa e territorio",
};

export function faqCategory(s: string | null | undefined): string {
  if (!s) return "Altre domande";
  return FAQ_CATEGORY[s] ?? s;
}

// --- Motivi ricorrenti per "Perché non si può fare?" (A1 §13) ----------------
// Catalogo redazionale: i motivi sono salvati come stringhe libere nel JSON
// della proposta, ma il seed attinge da qui per coerenza di linguaggio.

export const REJECTION_REASON_EXAMPLES = [
  "L'area interessata è privata: il Comune non può intervenire direttamente.",
  "Il costo supera il budget disponibile per quest'anno.",
  "È già previsto un intervento alternativo nella stessa zona.",
  "Non è una competenza del Comune: la gestione è di un altro ente.",
  "Vincoli urbanistici o paesaggistici non lo permettono.",
] as const;

/** Parse sicuro di un campo JSON-array-di-stringhe (impactNotes, whatChanges…). */
export function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}
