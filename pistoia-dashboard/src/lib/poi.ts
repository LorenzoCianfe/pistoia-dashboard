import type { MapPoint } from "@/lib/map";

// Static civic points of interest for the city map (§10). Illustrative locations
// at approximate coordinates — first-party reference data, not an external feed.
export const CIVIC_POIS: MapPoint[] = [
  { id: "poi-comune", layer: "uffici", lat: 43.9330, lng: 10.9183, title: "Palazzo Comunale", subtitle: "Piazza del Duomo", color: "red" },
  { id: "poi-urp", layer: "uffici", lat: 43.9345, lng: 10.9168, title: "URP — Relazioni con il Pubblico", color: "red" },
  { id: "poi-anagrafe", layer: "uffici", lat: 43.9356, lng: 10.9201, title: "Anagrafe e Stato Civile", color: "red" },
  { id: "poi-biblioteca", layer: "servizi", lat: 43.9292, lng: 10.9061, title: "Biblioteca San Giorgio", subtitle: "Cultura", color: "viola" },
  { id: "poi-ospedale", layer: "servizi", lat: 43.9512, lng: 10.9389, title: "Ospedale San Jacopo", subtitle: "Sanità", color: "viola" },
  { id: "poi-stazione", layer: "servizi", lat: 43.9286, lng: 10.9094, title: "Stazione di Pistoia", subtitle: "Mobilità", color: "viola" },
  { id: "poi-park-cellini", layer: "servizi", lat: 43.9301, lng: 10.9156, title: "Parcheggio Cellini", subtitle: "Parcheggio", color: "viola" },
  { id: "poi-liceo-forteguerri", layer: "scuole", lat: 43.9338, lng: 10.9215, title: "Liceo Forteguerri", color: "teal" },
  { id: "poi-itc-pacini", layer: "scuole", lat: 43.9262, lng: 10.9148, title: "Istituto Pacini", color: "teal" },
  { id: "poi-scuola-marconi", layer: "scuole", lat: 43.9410, lng: 10.9112, title: "Scuola Marconi", color: "teal" },
  { id: "poi-parco-monteoliveto", layer: "verde", lat: 43.9258, lng: 10.9223, title: "Parco di Monteoliveto", color: "green" },
  { id: "poi-giardino-zoologico", layer: "verde", lat: 43.9092, lng: 10.8838, title: "Giardino Zoologico", color: "green" },
  { id: "poi-villone-puccini", layer: "verde", lat: 43.9525, lng: 10.9020, title: "Parco di Villa Puccini", color: "green" },
  { id: "poi-fontana-vergine", layer: "servizi", lat: 43.9377, lng: 10.9244, title: "Fontanella — Vergine", subtitle: "Acqua pubblica", color: "viola" },
];
