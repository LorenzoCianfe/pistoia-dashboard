"use client";

import { useMemo, useState } from "react";
import { MapCanvas } from "./map-canvas";
import { MAP_LAYERS, ACCENT_HEX, type MapPoint, type MapLayerKey } from "@/lib/map";
import { cn } from "@/lib/utils";

export function MapExplorer({
  points,
  initialLayer,
}: {
  points: MapPoint[];
  initialLayer?: MapLayerKey | null;
}) {
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of points) c[p.layer] = (c[p.layer] ?? 0) + 1;
    return c;
  }, [points]);

  const [active, setActive] = useState<Set<MapLayerKey>>(() =>
    initialLayer ? new Set([initialLayer]) : new Set(MAP_LAYERS.map((l) => l.key)),
  );

  const filtered = useMemo(
    () => points.filter((p) => active.has(p.layer)),
    [points, active],
  );

  function toggle(k: MapLayerKey) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MAP_LAYERS.map((l) => {
          const on = active.has(l.key);
          const hex = ACCENT_HEX[l.color];
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => toggle(l.key)}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors",
                on ? "border-transparent text-white" : "border-border text-muted hover:text-foreground",
              )}
              style={on ? { backgroundColor: hex } : undefined}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: on ? "#ffffff" : hex }}
              />
              {l.label}
              <span className="tabular-nums opacity-80">{counts[l.key] ?? 0}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-[var(--radius)] border border-border shadow-sm">
        <MapCanvas points={filtered} className="h-[65vh] min-h-[420px] w-full" />
      </div>

      <p className="text-xs text-muted-2">
        Tocca un punto per i dettagli. Dati dimostrativi · tile mappa © OpenStreetMap.
      </p>
    </div>
  );
}
