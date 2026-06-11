import "server-only";
import { env } from "@/lib/env";

// Schema di provenienza dei dati (Fase 1).
// Ogni sezione alimentata da fonti esterne dichiara da dove arriva il dato e
// quando è stato sincronizzato. Finché DATA_MODE_* = "mock" la piattaforma
// dice onestamente "dati dimostrativi" — mai numeri veri-finti senza etichetta.

export type DataSection = "bilancio" | "opere";
export type DataMode = "mock" | "real";

export function dataMode(section: DataSection): DataMode {
  return section === "bilancio"
    ? env.DATA_MODE_BILANCIO
    : env.DATA_MODE_OPERE;
}

/** Provenienza così come la mostra la UI (vedi <SourceBadge/>). */
export type SourceInfo = {
  mode: DataMode;
  /** Nome della fonte, es. "OpenBDAP (RGS-MEF)" — o "Dati dimostrativi". */
  name: string;
  url: string | null;
  lastSyncedAt: Date | null;
};

type ProvenanceRow = {
  sourceName?: string | null;
  sourceUrl?: string | null;
  lastSyncedAt?: Date | null;
};

/**
 * Provenienza effettiva di un record: i campi `source*` scritti dall'ETL
 * vincono; senza di essi (o in modalità mock) il dato è dichiarato demo.
 */
export function sourceInfo(
  section: DataSection,
  row?: ProvenanceRow | null,
): SourceInfo {
  const mode = dataMode(section);
  if (mode === "real" && row?.sourceName) {
    return {
      mode,
      name: row.sourceName,
      url: row.sourceUrl ?? null,
      lastSyncedAt: row.lastSyncedAt ?? null,
    };
  }
  return {
    mode: "mock",
    name: "Dati dimostrativi",
    url: null,
    lastSyncedAt: null,
  };
}

// ---------------------------------------------------------------------------
// Contratti per l'ETL di Fase 2. I provider reali (BDAP, SIOPE+, OpenCUP,
// ReGiS, ANAC) implementano queste interfacce; il job di sync gira FUORI dal
// request path e fa upsert idempotenti usando externalId.
// ---------------------------------------------------------------------------

export interface BudgetSource {
  /** Identità mostrata in UI e salvata in BudgetYear.sourceName. */
  readonly name: string;
  readonly url: string;
  /** Sincronizza un esercizio nel DB locale. Idempotente. */
  syncYear(year: number): Promise<{ updated: boolean; lastSyncedAt: Date }>;
}

export interface OpereSource {
  /** Identità mostrata in UI e salvata in Opera.sourceName. */
  readonly name: string;
  readonly url: string;
  /** Sincronizza le opere di Pistoia (filtro ISTAT 047014). Idempotente. */
  syncAll(): Promise<{ upserted: number; lastSyncedAt: Date }>;
}
