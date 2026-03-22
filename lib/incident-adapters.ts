import type { IncidentJson, MapIncident, CriticalityTier } from "@/types/incident-json";
import { getTimeUrgencyTier } from "./time-urgency";
import type { Incident } from "@prisma/client";

const CRITICALITY_TO_TIER: Record<string, CriticalityTier> = {
  critical: "critical",
  "needs support": "needs support",
  needs_support: "needs support",
  cleanup: "cleanup",
};

/** Default volunteer count when manpower_needed_estimate is 0 or missing. */
function manpowerFromCategory(cat: string | null | undefined): number {
  const c = String(cat ?? "").toLowerCase();
  if (c === "large") return 25;
  if (c === "moderate") return 10;
  if (c === "small") return 5;
  return 10;
}

export function jsonToMapIncident(raw: IncidentJson): MapIncident {
  const criticality =
    CRITICALITY_TO_TIER[(raw.criticality ?? "").toString().toLowerCase()] ?? "cleanup";
  const centre = raw.location_centre ?? { lat: 0, lon: 0 };
  const est = raw.manpower_needed_estimate;
  const manpowerEstimate =
    typeof est === "number" && est > 0 ? est : manpowerFromCategory(raw.manpower_needed);
  return {
    id: raw.incident_id,
    lat: centre.lat,
    lng: centre.lon,
    radiusKm: raw.location_radius_km ?? undefined,
    title: raw.summary.slice(0, 80) + (raw.summary.length > 80 ? "…" : ""),
    summary: raw.summary,
    reportedAt: raw.time_of_incident,
    timeSince: raw.time_since_incident ?? undefined,
    criticality,
    casualtiesEstimate: raw.casualties_estimate,
    casualtiesCategory: raw.casualties,
    manpowerEstimate,
    manpowerCategory: raw.manpower_needed,
    verification: raw.verification,
    posts: raw.posts ?? [],
    media: raw.media ?? [],
    source: "json",
  };
}

const TIME_URGENCY_TO_CRITICALITY: Record<string, CriticalityTier> = {
  CRITICAL: "critical",
  MODERATE: "needs support",
  CLEAN_UP: "cleanup",
};

/** urgencyLevel override: CRITICAL|HIGH|LOW set by organizer */
const URGENCY_TO_CRITICALITY: Record<string, CriticalityTier> = {
  CRITICAL: "critical",
  HIGH: "needs support",
  MODERATE: "needs support",
  LOW: "cleanup",
  CLEAN_UP: "cleanup",
};

export function prismaToMapIncident(inc: Incident): MapIncident {
  const reportedAt = inc.reportedAt instanceof Date
    ? inc.reportedAt.toISOString()
    : String(inc.reportedAt ?? new Date().toISOString());
  const urgencyOverride =
    inc.urgencyLevel && URGENCY_TO_CRITICALITY[inc.urgencyLevel]
      ? URGENCY_TO_CRITICALITY[inc.urgencyLevel]
      : undefined;
  const tier = getTimeUrgencyTier(reportedAt);
  const criticality: CriticalityTier =
    urgencyOverride ?? TIME_URGENCY_TO_CRITICALITY[tier] ?? "cleanup";
  return {
    id: inc.id,
    lat: inc.lat,
    lng: inc.lng,
    title: inc.title,
    summary: inc.description ?? undefined,
    reportedAt,
    criticality,
    casualtiesEstimate: inc.injuriesReported ?? 0,
    casualtiesCategory: inc.injuriesReported
      ? inc.injuriesReported <= 5
        ? "few"
        : inc.injuriesReported <= 20
          ? "some"
          : "many"
      : "few",
    manpowerEstimate: inc.volunteersNeeded,
    manpowerCategory:
      inc.volunteersNeeded <= 5
        ? "small"
        : inc.volunteersNeeded <= 20
          ? "moderate"
          : "large",
    verification:
      inc.verificationStatus === "VERIFIED"
        ? "verified"
        : inc.verificationStatus === "PARTIALLY_VERIFIED"
          ? "confident"
          : "initial_reports",
    posts: [],
    media: [],
    source: "prisma",
  };
}
