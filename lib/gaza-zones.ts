import type { TimeUrgencyTier } from "./time-urgency";
import { getTimeUrgencyTier, mostUrgentTier } from "./time-urgency";

/** Bounds as [[south, west], [north, east]] (Leaflet / OSM convention). */
export type ZoneBounds = [[number, number], [number, number]];

export type GazaSubZone = {
  id: string;
  name: string;
  bounds: ZoneBounds;
};

/** Simplified Gaza Strip outline (demo geometry, not a legal boundary). */
export const GAZA_STRIP_POLYGON: [number, number][] = [
  [31.59, 34.22],
  [31.59, 34.56],
  [31.21, 34.54],
  [31.21, 34.22],
  [31.59, 34.22],
];

export const GAZA_FLY_BOUNDS: ZoneBounds = [
  [31.2, 34.2],
  [31.61, 34.58],
];

export const GAZA_SUB_ZONES: GazaSubZone[] = [
  {
    id: "north",
    name: "North Gaza",
    bounds: [
      [31.52, 34.48],
      [31.59, 34.56],
    ],
  },
  {
    id: "gaza_city",
    name: "Gaza City",
    bounds: [
      [31.45, 34.42],
      [31.52, 34.52],
    ],
  },
  {
    id: "central",
    name: "Central / Deir al-Balah",
    bounds: [
      [31.36, 34.32],
      [31.45, 34.48],
    ],
  },
  {
    id: "khan_yunis",
    name: "Khan Yunis",
    bounds: [
      [31.28, 34.28],
      [31.36, 34.42],
    ],
  },
  {
    id: "south",
    name: "Rafah / South",
    bounds: [
      [31.21, 34.22],
      [31.28, 34.36],
    ],
  },
];

export function pointInBounds(
  lat: number,
  lng: number,
  bounds: ZoneBounds
): boolean {
  const [[south, west], [north, east]] = bounds;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}

export function getZoneForPoint(lat: number, lng: number): GazaSubZone | null {
  for (const z of GAZA_SUB_ZONES) {
    if (pointInBounds(lat, lng, z.bounds)) return z;
  }
  return null;
}

export function incidentsInZone<T extends { lat: number; lng: number }>(
  incidents: T[],
  bounds: ZoneBounds
): T[] {
  return incidents.filter((inc) => pointInBounds(inc.lat, inc.lng, bounds));
}

export function zoneDisplayUrgency<T extends { reportedAt: Date | string }>(
  incidents: T[]
): TimeUrgencyTier | null {
  const tiers = incidents.map((i) => getTimeUrgencyTier(i.reportedAt));
  return mostUrgentTier(tiers);
}
