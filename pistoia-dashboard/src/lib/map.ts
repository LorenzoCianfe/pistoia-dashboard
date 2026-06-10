// Shared map types & constants (§10). Pure data — safe to import on client & server.

export type MapLayerKey =
  | "opere"
  | "segnalazioni"
  | "eventi"
  | "uffici"
  | "scuole"
  | "verde"
  | "servizi";

export type MapPoint = {
  id: string;
  layer: MapLayerKey;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string | null;
  color: string; // accent token name
  href?: string | null;
};

export const MAP_LAYERS: { key: MapLayerKey; label: string; color: string }[] = [
  { key: "opere", label: "Opere e cantieri", color: "teal" },
  { key: "segnalazioni", label: "Segnalazioni", color: "amber" },
  { key: "eventi", label: "Eventi", color: "viola" },
  { key: "uffici", label: "Uffici comunali", color: "red" },
  { key: "scuole", label: "Scuole", color: "teal" },
  { key: "verde", label: "Aree verdi", color: "green" },
  { key: "servizi", label: "Servizi", color: "viola" },
];

/** Approximate geographic centre of Pistoia. */
export const PISTOIA_CENTER: [number, number] = [43.9333, 10.9167];

/** Accent token → hex (Leaflet draws SVG, where CSS custom properties don't resolve). */
export const ACCENT_HEX: Record<string, string> = {
  teal: "#0F9E8E",
  viola: "#7C6BD9",
  amber: "#E0A100",
  red: "#C9352C",
  green: "#2FA66B",
};
