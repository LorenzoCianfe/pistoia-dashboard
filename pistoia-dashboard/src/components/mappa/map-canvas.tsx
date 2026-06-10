"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LMap, LayerGroup } from "leaflet";
import { ACCENT_HEX, PISTOIA_CENTER, type MapPoint } from "@/lib/map";

type LeafletStatic = typeof import("leaflet");

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
  className,
  zoom = 13,
}: {
  points: MapPoint[];
  className?: string;
  zoom?: number;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LMap | null>(null);
  const groupRef = useRef<LayerGroup | null>(null);
  const lRef = useRef<LeafletStatic | null>(null);
  const pointsRef = useRef(points);

  // Keep the latest points available to the init effect without reading during render.
  useEffect(() => {
    pointsRef.current = points;
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
      const group = L.layerGroup().addTo(map);
      mapRef.current = map;
      groupRef.current = group;
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

  return <div ref={elRef} className={className} aria-label="Mappa interattiva" role="img" />;
}
