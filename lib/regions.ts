export type { ZoneBounds, SubZone, RegionId, RegionConfig, LangCode } from "./region-types";
import type { RegionId, RegionConfig } from "./region-types";

// Gaza
import {
  GAZA_STRIP_POLYGON,
  GAZA_FLY_BOUNDS,
  GAZA_SUB_ZONES,
} from "./gaza-zones";

// Ukraine
import {
  UKRAINE_POLYGON,
  UKRAINE_FLY_BOUNDS,
  UKRAINE_SUB_ZONES,
} from "./ukraine-zones";

export const REGIONS: Record<RegionId, RegionConfig> = {
  gaza: {
    id: "gaza",
    name: { en: "Gaza Strip", ar: "قطاع غزة" },
    polygon: GAZA_STRIP_POLYGON,
    flyBounds: GAZA_FLY_BOUNDS,
    center: [31.5, 34.45],
    zoom: 10,
    subZones: GAZA_SUB_ZONES.map((z) => ({
      id: z.id,
      name: { en: z.name },
      polygon: z.polygon,
      bounds: z.bounds,
    })),
    languages: ["en", "ar"],
    contact: { label: "Tel", href: "tel:02-2929984", display: "02-2929984" },
  },
  ukraine: {
    id: "ukraine",
    name: { en: "Ukraine", uk: "Україна" },
    polygon: UKRAINE_POLYGON,
    flyBounds: UKRAINE_FLY_BOUNDS,
    center: [48.4, 31.2],
    zoom: 6,
    subZones: UKRAINE_SUB_ZONES,
    languages: ["en", "uk"],
    contact: {
      label: "Hotline",
      href: "https://www.gov.ua/ua",
      display: "Government of Ukraine",
    },
  },
};

export const REGION_IDS: RegionId[] = ["gaza", "ukraine"];
