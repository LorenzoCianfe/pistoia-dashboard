// Community taxonomies & helpers shared by server and client.
// Pure data only (no React / lucide imports) so it is safe to import anywhere.

// ---------------------------------------------------------------------------
// Roles & account types
// ---------------------------------------------------------------------------

export type Role = "CITIZEN" | "MODERATOR" | "MUNICIPAL_STAFF" | "ADMIN";
export type AccountType = "CITIZEN" | "ASSOCIATION" | "BUSINESS" | "MUNICIPAL";

export const ACCOUNT_TYPE: Record<string, { label: string; color: string }> = {
  CITIZEN: { label: "Cittadino", color: "teal" },
  ASSOCIATION: { label: "Associazione", color: "viola" },
  BUSINESS: { label: "Attività locale", color: "amber" },
  MUNICIPAL: { label: "Comune", color: "red" },
};

/** Comune-side roles that can review verifications, answer and triage. */
export function isStaff(role: string) {
  return role === "ADMIN" || role === "MUNICIPAL_STAFF";
}
/** Roles that can moderate community content. */
export function canModerate(role: string) {
  return role === "ADMIN" || role === "MODERATOR";
}

// ---------------------------------------------------------------------------
// Verification — the trust layer. In this mock phase verification is granted by
// an admin review queue (no SPID/CIE yet → shown as "verifica simulata").
// ---------------------------------------------------------------------------

export type VerificationType =
  | "IDENTITY"
  | "RESIDENCY"
  | "MUNICIPAL_STAFF"
  | "ASSOCIATION"
  | "BUSINESS";

export const VERIFICATION: Record<
  string,
  { label: string; short: string; emoji: string; color: string }
> = {
  IDENTITY: { label: "Identità verificata", short: "Cittadino verificato", emoji: "✅", color: "teal" },
  RESIDENCY: { label: "Residente verificato", short: "Residente verificato", emoji: "🏠", color: "green" },
  MUNICIPAL_STAFF: { label: "Account ufficiale Comune", short: "Comune di Pistoia", emoji: "🏛️", color: "red" },
  ASSOCIATION: { label: "Associazione verificata", short: "Associazione verificata", emoji: "🤝", color: "viola" },
  BUSINESS: { label: "Attività locale verificata", short: "Attività verificata", emoji: "🛍️", color: "amber" },
};

/** Verification types a citizen can request from the UI. */
export const REQUESTABLE_VERIFICATIONS: VerificationType[] = [
  "IDENTITY",
  "RESIDENCY",
  "ASSOCIATION",
  "BUSINESS",
];

export const VERIFICATION_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "In attesa", color: "amber" },
  APPROVED: { label: "Approvata", color: "green" },
  REJECTED: { label: "Respinta", color: "red" },
  EXPIRED: { label: "Scaduta", color: "amber" },
};

export function verification(type: string | null | undefined) {
  if (!type) return null;
  return VERIFICATION[type] ?? null;
}

// ---------------------------------------------------------------------------
// Civic reputation badges (soft gamification — no toxic leaderboards)
// ---------------------------------------------------------------------------

export const BADGE: Record<string, { label: string; emoji: string; color: string }> = {
  moderator: { label: "Moderatore civico", emoji: "🛡️", color: "teal" },
  first_contribution: { label: "Primo contributo", emoji: "🌱", color: "green" },
  reliable_reporter: { label: "Segnalatore affidabile", emoji: "📣", color: "viola" },
  active_citizen: { label: "Cittadino attivo", emoji: "⭐", color: "amber" },
  useful_proposals: { label: "Proposte utili", emoji: "💡", color: "amber" },
  neighborhood_active: { label: "Quartiere attivo", emoji: "📍", color: "teal" },
};

// ---------------------------------------------------------------------------
// Community feed post kinds
// ---------------------------------------------------------------------------

export const POST_KIND: Record<string, { label: string; color: string }> = {
  domanda: { label: "Domanda al Comune", color: "teal" },
  discussione: { label: "Discussione", color: "viola" },
  avviso: { label: "Avviso", color: "amber" },
  idea: { label: "Idea per la città", color: "green" },
  info: { label: "Richiesta info", color: "teal" },
};

export function postKind(k: string | null | undefined) {
  if (!k) return POST_KIND.discussione;
  return POST_KIND[k] ?? POST_KIND.discussione;
}

// ---------------------------------------------------------------------------
// Eventi (events calendar) — §17
// ---------------------------------------------------------------------------

export const EVENT_CATEGORY: Record<string, { label: string; color: string }> = {
  comune: { label: "Evento del Comune", color: "red" },
  associazione: { label: "Evento associazione", color: "viola" },
  mercato: { label: "Mercato", color: "amber" },
  mostra: { label: "Mostra", color: "viola" },
  teatro: { label: "Teatro", color: "viola" },
  sport: { label: "Sport", color: "teal" },
  incontro: { label: "Incontro pubblico", color: "teal" },
  consiglio: { label: "Consiglio comunale", color: "red" },
  assemblea: { label: "Assemblea di quartiere", color: "teal" },
  ecologica: { label: "Giornata ecologica", color: "green" },
  volontariato: { label: "Volontariato", color: "green" },
};

export const EVENT_CATEGORIES = Object.keys(EVENT_CATEGORY);

export function eventCategory(c: string) {
  return EVENT_CATEGORY[c] ?? { label: c, color: "teal" };
}

export const EVENT_STATUS: Record<string, { label: string; color: string }> = {
  proposed: { label: "In attesa di approvazione", color: "amber" },
  published: { label: "Pubblicato", color: "green" },
  rejected: { label: "Non approvato", color: "red" },
};

export function eventStatus(s: string) {
  return EVENT_STATUS[s] ?? { label: s, color: "teal" };
}

// ---------------------------------------------------------------------------
// Segnalazioni (reports)
// ---------------------------------------------------------------------------

export const REPORT_CATEGORY: Record<string, { label: string; color: string }> = {
  buche: { label: "Buche e strade", color: "amber" },
  illuminazione: { label: "Illuminazione pubblica", color: "amber" },
  rifiuti: { label: "Rifiuti", color: "green" },
  verde: { label: "Verde pubblico", color: "green" },
  sicurezza: { label: "Sicurezza urbana", color: "red" },
  rumore: { label: "Rumore", color: "viola" },
  trasporto: { label: "Trasporto pubblico", color: "teal" },
  barriere: { label: "Barriere architettoniche", color: "viola" },
  scuole: { label: "Manutenzione scuole", color: "teal" },
  parchi: { label: "Manutenzione parchi", color: "green" },
  animali: { label: "Animali", color: "amber" },
  decoro: { label: "Decoro urbano", color: "viola" },
};

export const REPORT_CATEGORIES = Object.keys(REPORT_CATEGORY);

export function reportCategory(c: string) {
  return REPORT_CATEGORY[c] ?? { label: c, color: "teal" };
}

// Lifecycle: Nuova → Validata → Assegnata → In lavorazione → Risolta → Chiusa
export const REPORT_STATUS: Record<
  string,
  { label: string; color: string; step: number }
> = {
  ricevuta: { label: "Ricevuta", color: "amber", step: 1 },
  validata: { label: "Validata", color: "viola", step: 2 },
  presa_in_carico: { label: "Presa in carico", color: "teal", step: 3 },
  in_lavorazione: { label: "In lavorazione", color: "teal", step: 4 },
  risolta: { label: "Risolta", color: "green", step: 5 },
  chiusa: { label: "Chiusa", color: "green", step: 6 },
  duplicata: { label: "Duplicata", color: "viola", step: 0 },
  non_di_competenza: { label: "Non di competenza", color: "red", step: 0 },
};

/** Ordered statuses that form the main progress track (excludes side states). */
export const REPORT_FLOW = [
  "ricevuta",
  "validata",
  "presa_in_carico",
  "in_lavorazione",
  "risolta",
  "chiusa",
] as const;

export function reportStatus(s: string) {
  return REPORT_STATUS[s] ?? { label: s, color: "teal", step: 0 };
}

export const DEPARTMENTS = [
  "Ufficio Strade e Manutenzioni",
  "Ufficio Mobilità",
  "Ufficio Ambiente e Verde",
  "Ufficio Igiene Urbana",
  "Ufficio Lavori Pubblici",
  "Polizia Municipale",
  "Ufficio Scuola",
  "URP — Ufficio Relazioni con il Pubblico",
];

// ---------------------------------------------------------------------------
// Proposte cittadine (proposals)
// ---------------------------------------------------------------------------

export const PROPOSAL_STATUS: Record<string, { label: string; color: string }> = {
  bozza: { label: "Bozza", color: "viola" },
  pubblicata: { label: "Pubblicata", color: "teal" },
  in_valutazione: { label: "In valutazione dal Comune", color: "amber" },
  risposta: { label: "Risposta del Comune", color: "viola" },
  approvata: { label: "Approvata", color: "green" },
  respinta: { label: "Non accolta", color: "red" },
};

export function proposalStatus(s: string) {
  return PROPOSAL_STATUS[s] ?? { label: s, color: "teal" };
}

// Configurable support thresholds (§12.3 of the proposal).
export const PROPOSAL_THRESHOLDS = {
  highlight: 50, // visible in evidenza
  official: 200, // triggers a requested official reply
  consultation: 500, // can become a public consultation
} as const;

export function proposalThreshold(supports: number) {
  const t = PROPOSAL_THRESHOLDS;
  if (supports >= t.consultation) return { next: null as number | null, reached: "consultation" as const };
  if (supports >= t.official) return { next: t.consultation, reached: "official" as const };
  if (supports >= t.highlight) return { next: t.official, reached: "highlight" as const };
  return { next: t.highlight, reached: null };
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Privacy-friendly public name: "Lorenzo Cianferoni" → "Lorenzo C.". */
export function abbreviateName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Anonimo";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** The name shown publicly: an explicit publicName, else an abbreviated form. */
export function publicNameOf(name: string, publicName?: string | null): string {
  return publicName?.trim() || abbreviateName(name);
}
