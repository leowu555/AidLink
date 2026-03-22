import type { MapIncident, CriticalityTier } from "@/types/incident-json";

/** Supabase incidents table row shape (gaza / ukraine) */
export interface SupabaseIncidentRow {
  incident_id: string;
  summary: string;
  time_of_incident: string;
  time_since_incident: string | null;
  location_lat: number;
  location_lon: number;
  location_radius_km: number | null;
  casualties_estimate: number;
  casualties: "few" | "some" | "many";
  manpower_needed_estimate: number;
  manpower_needed: "small" | "moderate" | "large";
  criticality: "critical" | "needs_support" | "cleanup";
  verification: "initial_reports" | "confident" | "verified";
  posts: string[] | null;
  media: { type: string; url: string }[] | null;
  last_updated: string;
}

const CRITICALITY_MAP: Record<string, CriticalityTier> = {
  critical: "critical",
  needs_support: "needs support",
  cleanup: "cleanup",
};

function manpowerFromCategory(cat: string | null | undefined): number {
  const c = String(cat ?? "").toLowerCase();
  if (c === "large") return 25;
  if (c === "moderate") return 10;
  if (c === "small") return 5;
  return 10;
}

function parsePosts(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.filter((x): x is string => typeof x === "string");
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.filter((x: unknown): x is string => typeof x === "string") : [];
    } catch {
      return val.trim() ? [val] : [];
    }
  }
  return [];
}

function parseMedia(val: unknown): { type: "image" | "video"; url: string }[] {
  if (Array.isArray(val)) {
    return val
      .filter((m): m is Record<string, unknown> => m != null && typeof m === "object")
      .map((m) => ({
        type: (m.type === "video" ? "video" : "image") as "image" | "video",
        url: typeof m.url === "string" ? m.url : String(m.url ?? ""),
      }))
      .filter((m) => m.url);
  }
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parseMedia(parsed) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function supabaseToMapIncident(row: SupabaseIncidentRow): MapIncident {
  const criticality =
    CRITICALITY_MAP[row.criticality] ?? "cleanup";
  const posts = parsePosts(row.posts);
  const media = parseMedia(row.media);

  return {
    id: row.incident_id,
    lat: row.location_lat,
    lng: row.location_lon,
    radiusKm: row.location_radius_km ?? undefined,
    title: row.summary.slice(0, 80) + (row.summary.length > 80 ? "…" : ""),
    summary: row.summary,
    reportedAt: row.time_of_incident,
    timeSince: row.time_since_incident ?? undefined,
    criticality,
    casualtiesEstimate: row.casualties_estimate ?? 0,
    casualtiesCategory: row.casualties ?? "few",
    manpowerEstimate:
      (typeof row.manpower_needed_estimate === "number" && row.manpower_needed_estimate > 0)
        ? row.manpower_needed_estimate
        : manpowerFromCategory(row.manpower_needed),
    manpowerCategory: row.manpower_needed ?? "small",
    verification: row.verification ?? "initial_reports",
    posts,
    media,
    source: "json",
  };
}
