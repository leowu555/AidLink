/** Bounds as [[south, west], [north, east]]. */
export type ZoneBounds = [[number, number], [number, number]];

export type SubZone = {
  id: string;
  name: { en: string; ar?: string; uk?: string };
  polygon: [number, number][];
  bounds: ZoneBounds;
};

export type RegionId = "gaza" | "ukraine";
export type LangCode = "en" | "ar" | "uk";

export type RegionConfig = {
  id: RegionId;
  name: { en: string; ar?: string; uk?: string };
  polygon: [number, number][];
  flyBounds: ZoneBounds;
  center: [number, number];
  zoom: number;
  subZones: SubZone[];
  languages: LangCode[];
  /** Optional contact info for "Offer to help" in zone panel */
  contact?: { label: string; href: string; display: string };
};
