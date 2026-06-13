// Tassonomie dell'Ondata 4 "Territorio & partecipazione".
// Pure data + helper di lookup: importabile ovunque (server e client),
// stessa filosofia di community.ts / transparency.ts.

import type { AccentColor } from "@/lib/colors";

type Meta = { label: string; color: AccentColor };

// --- Question time digitale (A2 §22) ----------------------------------------

export const QT_STATUS: Record<string, Meta> = {
  aperto: { label: "Domande aperte", color: "teal" },
  in_risposta: { label: "In risposta", color: "amber" },
  concluso: { label: "Concluso", color: "viola" },
};

export function qtStatus(s: string): Meta {
  return QT_STATUS[s] ?? { label: s, color: "teal" };
}

// --- "Vota la priorità" (A2 §9) ----------------------------------------------

export const PRIORITY_STATUS: Record<string, Meta> = {
  aperta: { label: "Voto aperto", color: "teal" },
  chiusa: { label: "Conclusa", color: "viola" },
};

export function priorityStatus(s: string): Meta {
  return PRIORITY_STATUS[s] ?? { label: s, color: "teal" };
}

// --- Volontariato e iniziative (A2 §14) --------------------------------------

export const INITIATIVE_CATEGORY: Record<string, { label: string; emoji: string; color: AccentColor }> = {
  pulizia: { label: "Pulizia", emoji: "🧹", color: "teal" },
  piantumazione: { label: "Piantumazione", emoji: "🌳", color: "green" },
  raccolta: { label: "Raccolta solidale", emoji: "🧺", color: "amber" },
  sociale: { label: "Sociale", emoji: "🤝", color: "viola" },
  formazione: { label: "Formazione", emoji: "🎓", color: "teal" },
  cultura: { label: "Cultura", emoji: "📚", color: "viola" },
};

export function initiativeCategory(s: string) {
  return INITIATIVE_CATEGORY[s] ?? { label: s, emoji: "✨", color: "teal" as AccentColor };
}

export const INITIATIVE_STATUS: Record<string, Meta> = {
  aperta: { label: "Adesioni aperte", color: "green" },
  completa: { label: "Posti esauriti", color: "amber" },
  conclusa: { label: "Conclusa", color: "viola" },
};

export function initiativeStatus(s: string): Meta {
  return INITIATIVE_STATUS[s] ?? { label: s, color: "teal" };
}

// --- "Adotta un luogo" (A2 §16) ----------------------------------------------

export const PLACE_KIND: Record<string, { label: string; emoji: string }> = {
  parco: { label: "Parco", emoji: "🌲" },
  aiuola: { label: "Aiuola", emoji: "🌷" },
  piazza: { label: "Piazza", emoji: "⛲" },
  fontana: { label: "Fontana", emoji: "💧" },
  giardino: { label: "Giardino", emoji: "🌿" },
  sentiero: { label: "Sentiero", emoji: "🥾" },
};

export function placeKind(s: string) {
  return PLACE_KIND[s] ?? { label: s, emoji: "📍" };
}

export const ADOPTER_TYPE: Record<string, string> = {
  cittadini: "Gruppo di cittadini",
  associazione: "Associazione",
  scuola: "Scuola",
  attivita: "Attività locale",
};

export function adopterType(s: string): string {
  return ADOPTER_TYPE[s] ?? s;
}

export const PLACE_STATUS: Record<string, Meta> = {
  proposta: { label: "Adozione proposta", color: "amber" },
  attiva: { label: "Adozione attiva", color: "green" },
  conclusa: { label: "Conclusa", color: "viola" },
};

export function placeStatus(s: string): Meta {
  return PLACE_STATUS[s] ?? { label: s, color: "teal" };
}

// --- Patti digitali di quartiere (A2 §31) ------------------------------------

export const PACT_STATUS: Record<string, Meta> = {
  proposto: { label: "Proposto", color: "amber" },
  attivo: { label: "Attivo", color: "teal" },
  completato: { label: "Completato", color: "green" },
};

export function pactStatus(s: string): Meta {
  return PACT_STATUS[s] ?? { label: s, color: "teal" };
}

// --- "Da segnalazione a progetto" (A2 §8) -------------------------------------

export const PROJECT_STATUS: Record<string, Meta> = {
  proposto: { label: "Proposto", color: "amber" },
  approvato: { label: "Approvato", color: "viola" },
  in_corso: { label: "In corso", color: "teal" },
  completato: { label: "Completato", color: "green" },
};

export function projectStatus(s: string): Meta {
  return PROJECT_STATUS[s] ?? { label: s, color: "teal" };
}

// --- Problemi ricorrenti (A2 §7) ----------------------------------------------
// Pura aggregazione, testabile senza Prisma: un pattern emerge quando nella
// stessa zona si accumulano segnalazioni aperte della stessa categoria.

export type RecurringInput = {
  category: string;
  neighborhoodName: string | null;
};

export type RecurringPattern = {
  category: string;
  neighborhoodName: string;
  count: number;
};

export const RECURRING_THRESHOLD = 3;

export function groupRecurring(
  reports: RecurringInput[],
  threshold = RECURRING_THRESHOLD,
): RecurringPattern[] {
  const counts = new Map<string, RecurringPattern>();
  for (const r of reports) {
    if (!r.neighborhoodName) continue;
    const key = `${r.category}::${r.neighborhoodName}`;
    const prev = counts.get(key);
    if (prev) prev.count += 1;
    else counts.set(key, { category: r.category, neighborhoodName: r.neighborhoodName, count: 1 });
  }
  return [...counts.values()]
    .filter((p) => p.count >= threshold)
    .sort((a, b) => b.count - a.count);
}

// --- Heatmap civica (A2 §6) -----------------------------------------------------
// Bucketing dei punti su una griglia: ogni cella diventa un cerchio sulla mappa
// con raggio/intensità proporzionali alla densità di segnalazioni.

export type HeatPoint = { latitude: number; longitude: number };

export type HeatCell = {
  latitude: number; // centro cella
  longitude: number;
  count: number;
};

/** ~0.004° ≈ 350–450 m alle latitudini di Pistoia: grana di quartiere. */
export const HEAT_CELL_SIZE = 0.004;

export function bucketHeat(points: HeatPoint[], cellSize = HEAT_CELL_SIZE): HeatCell[] {
  const cells = new Map<string, HeatCell>();
  for (const p of points) {
    const latIdx = Math.floor(p.latitude / cellSize);
    const lngIdx = Math.floor(p.longitude / cellSize);
    const key = `${latIdx}:${lngIdx}`;
    const prev = cells.get(key);
    if (prev) {
      prev.count += 1;
    } else {
      cells.set(key, {
        latitude: (latIdx + 0.5) * cellSize,
        longitude: (lngIdx + 0.5) * cellSize,
        count: 1,
      });
    }
  }
  return [...cells.values()].sort((a, b) => b.count - a.count);
}
