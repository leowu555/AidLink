import type { SubZone } from "./region-types";
import { pointInBounds, pointInPolygon } from "./gaza-zones";

/** Bounds as [[south, west], [north, east]] (Leaflet / OSM convention). */
export type ZoneBounds = [[number, number], [number, number]];

/**
 * Simplified Ukraine outline (demo geometry, not a legal boundary).
 * Traces approximate border: Belarus/Russia north, Russia east, Black Sea south, Moldova/Romania/Hungary/Slovakia/Poland west.
 */
export const UKRAINE_POLYGON: [number, number][] = [
  [52.38, 31.2],
  [52.2, 33.5],
  [51.8, 35.2],
  [50.8, 37.5],
  [49.6, 40.2],
  [48.5, 39.8],
  [47.8, 38.5],
  [46.6, 36.8],
  [45.6, 35.2],
  [44.6, 33.6],
  [44.4, 31.2],
  [44.5, 29.6],
  [45.2, 28.2],
  [45.8, 29.8],
  [46.8, 30.2],
  [48.0, 26.8],
  [48.5, 24.2],
  [49.0, 23.2],
  [50.4, 23.5],
  [51.2, 24.0],
  [51.8, 25.5],
  [52.2, 27.0],
  [52.38, 31.2],
];

export const UKRAINE_FLY_BOUNDS: ZoneBounds = [
  [44.4, 22.1],
  [52.5, 40.2],
];

export function pointInUkraineBounds(
  lat: number,
  lng: number,
  bounds: ZoneBounds = UKRAINE_FLY_BOUNDS
): boolean {
  const [[south, west], [north, east]] = bounds;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}

/**
 * Ukraine oblast/region polygons — simplified. Uses same criticality colors as Gaza.
 */
export const UKRAINE_SUB_ZONES: SubZone[] = [
  {
    id: "kyiv",
    name: { en: "Kyiv", uk: "Київ" },
    bounds: [[50.2, 29.4], [51.0, 31.0]],
    polygon: [
      [50.2, 29.6],
      [50.25, 30.2],
      [50.4, 30.6],
      [50.6, 30.8],
      [50.9, 30.6],
      [51.0, 30.2],
      [50.9, 29.8],
      [50.6, 29.4],
      [50.35, 29.5],
      [50.2, 29.6],
    ],
  },
  {
    id: "kharkiv",
    name: { en: "Kharkiv", uk: "Харків" },
    bounds: [[49.2, 35.5], [50.2, 37.0]],
    polygon: [
      [49.2, 35.6],
      [49.4, 36.2],
      [49.8, 36.6],
      [50.1, 36.8],
      [50.2, 36.4],
      [50.0, 35.8],
      [49.6, 35.5],
      [49.3, 35.6],
      [49.2, 35.6],
    ],
  },
  {
    id: "donetsk",
    name: { en: "Donetsk", uk: "Донецьк" },
    bounds: [[47.2, 37.0], [48.8, 39.0]],
    polygon: [
      [47.2, 37.2],
      [47.5, 37.8],
      [48.0, 38.2],
      [48.5, 38.6],
      [48.8, 38.2],
      [48.6, 37.6],
      [48.2, 37.2],
      [47.6, 37.0],
      [47.2, 37.2],
    ],
  },
  {
    id: "luhansk",
    name: { en: "Luhansk", uk: "Луганськ" },
    bounds: [[47.8, 38.2], [49.2, 40.2]],
    polygon: [
      [47.8, 38.4],
      [48.2, 38.8],
      [48.8, 39.2],
      [49.1, 39.6],
      [49.2, 39.2],
      [48.8, 38.6],
      [48.2, 38.2],
      [47.8, 38.4],
    ],
  },
  {
    id: "odesa",
    name: { en: "Odesa", uk: "Одеса" },
    bounds: [[45.8, 29.2], [47.2, 31.2]],
    polygon: [
      [45.8, 29.4],
      [46.0, 29.8],
      [46.4, 30.2],
      [46.8, 30.6],
      [47.1, 30.4],
      [47.2, 29.8],
      [46.8, 29.4],
      [46.2, 29.2],
      [45.8, 29.4],
    ],
  },
  {
    id: "lviv",
    name: { en: "Lviv", uk: "Львів" },
    bounds: [[49.2, 22.8], [50.2, 25.2]],
    polygon: [
      [49.2, 23.0],
      [49.4, 23.6],
      [49.8, 24.2],
      [50.0, 24.8],
      [50.2, 24.4],
      [50.0, 23.6],
      [49.6, 23.0],
      [49.4, 22.8],
      [49.2, 23.0],
    ],
  },
  {
    id: "dnipro",
    name: { en: "Dnipro", uk: "Дніпро" },
    bounds: [[47.8, 34.2], [49.2, 36.2]],
    polygon: [
      [47.8, 34.4],
      [48.0, 34.8],
      [48.5, 35.4],
      [49.0, 35.8],
      [49.2, 35.4],
      [49.0, 34.8],
      [48.4, 34.2],
      [48.0, 34.2],
      [47.8, 34.4],
    ],
  },
];

export function getZoneForPoint(lat: number, lng: number): SubZone | null {
  for (const z of UKRAINE_SUB_ZONES) {
    if (pointInBounds(lat, lng, z.bounds) && pointInPolygon(lat, lng, z.polygon)) {
      return z;
    }
  }
  return null;
}

export function incidentsInZone<T extends { lat: number; lng: number }>(
  incidents: T[],
  zone: SubZone
): T[] {
  return incidents.filter((inc) => pointInPolygon(inc.lat, inc.lng, zone.polygon));
}
