"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LMap, LayerGroup } from "leaflet";
import { ACCENT_HEX, PISTOIA_CENTER, type MapPoint } from "@/lib/map";
import type { HeatCell } from "@/lib/territorio";

type LeafletStatic = typeof import("leaflet");

// Heatmap civica (A2 §6, O4): ogni cella è un cerchio rosso il cui raggio e
// opacità crescono con la densità di segnalazioni aperte. Disegnato sotto i
// marker, in un layer group dedicato.
function renderHeat(L: LeafletStatic, group: LayerGroup, cells: HeatCell[]) {
  group.clearLayers();
  const max = cells.reduce((m, c) => Math.max(m, c.count), 1);
  for (const cell of cells) {
    const intensity = cell.count / max; // 0..1
    L.circle([cell.latitude, cell.longitude], {
      radius: 120 + intensity * 380, // metri
      stroke: false,
      fillColor: ACCENT_HEX.red,
      fillOpacity: 0.12 + intensity * 0.33,
    })
      .bindPopup(
        `<strong>${cell.count} segnalazioni aperte</strong><br/><span style="color:#6b7280">in quest'area</span>`,
      )
      .addTo(group);
  }
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkers(L: LeafletStatic, map: LMap, group: LayerGroup, points: MapPoint[]) {
  group.clearLayers();
  const latlngs: [number, number][] = [];
  for (const p of points) {
    const hex = ACCENT_HEX[p.color] ?? ACCENT_HEX.teal;
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 7,
      color: hex,
      weight: 2,
      fillColor: hex,
      fillOpacity: 0.55,
    });
    const link = p.href
      ? `<br/><a href="${esc(p.href)}" style="color:${hex};font-weight:600">Apri →</a>`
      : "";
    const sub = p.subtitle ? `<br/><span style="color:#6b7280">${esc(p.subtitle)}</span>` : "";
    marker.bindPopup(`<strong>${esc(p.title)}</strong>${sub}${link}`);
    marker.addTo(group);
    latlngs.push([p.lat, p.lng]);
  }
  if (latlngs.length === 1) {
    map.setView(latlngs[0], 15);
  } else if (latlngs.length > 1) {
    try {
      map.fitBounds(latlngs, { padding: [32, 32], maxZoom: 15 });
    } catch {
      /* keep current view */
    }
  }
}

export function MapCanvas({
  points,
  heat,
  className,
  zoom = 13,
}: {
  points: MapPoint[];
  heat?: HeatCell[];
  className?: string;
  zoom?: number;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const groupRef = useRef<LayerGroup | null>(null);
  const heatGroupRef = useRef<LayerGroup | null>(null);
  const lRef = useRef<LeafletStatic | null>(null);
  const pointsRef = useRef(points);
  const heatRef = useRef(heat);

  // Keep the latest data available to the init effect without reading during render.
  useEffect(() => {
    pointsRef.current = points;
    heatRef.current = heat;
  });

  // Initialise the map once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !elRef.current || mapRef.current) return;
      lRef.current = L;
      const map = L.map(elRef.current, { scrollWheelZoom: false }).setView(PISTOIA_CENTER, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      // Heat sotto i marker: ordine d'aggiunta = ordine di disegno.
      const heatGroup = L.layerGroup().addTo(map);
      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      groupRef.current = group;
      heatGroupRef.current = heatGroup;
      if (heatRef.current?.length) renderHeat(L, heatGroup, heatRef.current);
      renderMarkers(L, map, group, pointsRef.current);
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [zoom]);

  // Re-render markers whenever the filtered points change.
  useEffect(() => {
    const L = lRef.current;
    const map = mapRef.current;
    const group = groupRef.current;
    if (L && map && group) renderMarkers(L, map, group, points);
  }, [points]);

  // Re-render the heat overlay whenever it changes (toggle or new data).
  useEffect(() => {
    const L = lRef.current;
    const group = heatGroupRef.current;
    if (L && group) renderHeat(L, group, heat ?? []);
  }, [heat]);

  return <div ref={elRef} className={className} aria-label="Mappa interattiva" role="img" />;
}
