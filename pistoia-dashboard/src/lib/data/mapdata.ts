import "server-only";
import { prisma } from "@/lib/db";
import { CIVIC_POIS } from "@/lib/poi";
import { reportCategory } from "@/lib/community";
import { noticeKind } from "@/lib/transparency";
import { operaStatus } from "@/lib/labels";
import { bucketHeat, type HeatCell } from "@/lib/territorio";
import { formatDateShort } from "@/lib/format";
import type { MapPoint } from "@/lib/map";

/** All geolocated activity for the interactive map (§10): opere, segnalazioni, eventi + static POIs. */
export async function getMapPoints(): Promise<MapPoint[]> {
  const [opere, reports, events, notices] = await Promise.all([
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
    // Avvisi urgenti geolocalizzati (A1 §21, O3): solo quelli attivi.
    prisma.notice.findMany({
      where: { active: true, latitude: { not: null }, longitude: { not: null } },
      select: { id: true, title: true, latitude: true, longitude: true, kind: true },
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

  for (const n of notices) {
    points.push({
      id: `nt-${n.id}`,
      layer: "avvisi",
      lat: n.latitude!,
      lng: n.longitude!,
      title: n.title,
      subtitle: noticeKind(n.kind).label,
      color: "red",
      href: "/avvisi",
    });
  }

  points.push(...CIVIC_POIS);
  return points;
}

/**
 * Heatmap civica / mappa del disagio (A2 §6, O4): densità delle segnalazioni
 * aperte, bucketizzata su una griglia. Il calcolo è puro (bucketHeat); qui
 * leggiamo solo i punti geolocalizzati delle segnalazioni ancora aperte.
 */
export async function getCivicHeat(): Promise<HeatCell[]> {
  const reports = await prisma.report.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
      status: { notIn: ["risolta", "chiusa", "duplicata", "non_di_competenza"] },
    },
    select: { latitude: true, longitude: true },
  });
  return bucketHeat(
    reports.map((r) => ({ latitude: r.latitude!, longitude: r.longitude! })),
  );
}
