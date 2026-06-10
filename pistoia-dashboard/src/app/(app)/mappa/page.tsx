import type { Metadata } from "next";
import { Map as MapIcon } from "lucide-react";
import { getMapPoints } from "@/lib/data/mapdata";
import { MapExplorer } from "@/components/mappa/map-explorer";
import { SectionHeader } from "@/components/ui/section-header";
import { MAP_LAYERS, type MapLayerKey } from "@/lib/map";

export const metadata: Metadata = { title: "Mappa" };

export default async function MappaPage({
  searchParams,
}: {
  searchParams: Promise<{ layer?: string }>;
}) {
  const [{ layer }, points] = await Promise.all([searchParams, getMapPoints()]);
  const initialLayer =
    layer && MAP_LAYERS.some((l) => l.key === layer) ? (layer as MapLayerKey) : null;

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Territorio"
        title="Mappa della città"
        description="Cantieri, segnalazioni, eventi e servizi sul territorio. Attiva o disattiva i layer per vedere cosa succede vicino a te."
        icon={<MapIcon size={22} />}
      />
      <MapExplorer points={points} initialLayer={initialLayer} />
    </div>
  );
}
