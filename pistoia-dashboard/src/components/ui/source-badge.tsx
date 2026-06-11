import { Database } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { SourceInfo } from "@/lib/sources";

/**
 * Etichetta di provenienza del dato (Fase 1): chi lo pubblica e quando è
 * stato sincronizzato. Per i dati demo lo dice senza giri di parole.
 */
export function SourceBadge({ source }: { source: SourceInfo }) {
  return (
    <p className="flex items-center gap-1.5 px-1 text-xs text-muted-2">
      <Database size={12} aria-hidden />
      {source.mode === "mock" ? (
        <span>
          Dati dimostrativi — non provengono (ancora) dalle fonti ufficiali del
          Comune.
        </span>
      ) : (
        <span>
          Fonte:{" "}
          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium underline decoration-dotted underline-offset-2 hover:text-foreground"
            >
              {source.name}
              <span className="sr-only"> (si apre in una nuova scheda)</span>
            </a>
          ) : (
            <span className="font-medium">{source.name}</span>
          )}
          {source.lastSyncedAt
            ? ` · aggiornato il ${formatDate(source.lastSyncedAt)}`
            : null}
        </span>
      )}
    </p>
  );
}
