import "server-only";
import { prisma } from "@/lib/db";
import { CIVIC_POIS } from "@/lib/poi";
import { reportCategory } from "@/lib/community";
import { operaStatus } from "@/lib/labels";
import { formatDateShort } from "@/lib/format";
import type { MapPoint } from "@/lib/map";

/** All geolocated activity for the interactive map (§10): opere, segnalazioni, eventi + static POIs. */
export async function getMapPoints(): Promise<MapPoint[]> {
  const [opere, reports, events] = await Promise.all([
    prisma.opera.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      select: { id: true, name: true, latitude: true, longitude: true, status: true },
    }),
    prisma.report.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        status: { notIn: ["chiusa", "duplicata"] },
      },
      select: { id: true, title: true, latitude: true, longitude: true, category: true },
    }),
    prisma.event.findMany({
      where: { status: "published", latitude: { not: null }, longitude: { not: null } },
      select: { id: true, title: true, latitude: true, longitude: true, startAt: true },
    }),
  ]);

  const points: MapPoint[] = [];

  for (const o of opere) {
    points.push({
      id: `op-${o.id}`,
      layer: "opere",
      lat: o.latitude!,
      lng: o.longitude!,
      title: o.name,
      subtitle: operaStatus(o.status).label,
      color: "teal",
      href: `/opere/${o.id}`,
    });
  }
  for (const r of reports) {
    points.push({
      id: `rp-${r.id}`,
      layer: "segnalazioni",
      lat: r.latitude!,
      lng: r.longitude!,
      title: r.title,
      subtitle: reportCategory(r.category).label,
      color: "amber",
      href: `/segnalazioni/${r.id}`,
    });
  }
  for (const e of events) {
    points.push({
      id: `ev-${e.id}`,
      layer: "eventi",
      lat: e.latitude!,
      lng: e.longitude!,
      title: e.title,
      subtitle: formatDateShort(e.startAt),
      color: "viola",
      href: "/eventi",
    });
  }

  points.push(...CIVIC_POIS);
  return points;
}
