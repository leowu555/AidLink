import type { IncidentJson, MapIncident, CriticalityTier } from "@/types/incident-json";
import { getTimeUrgencyTier } from "./time-urgency";
import type { Incident } from "@prisma/client";

const CRITICALITY_TO_TIER: Record<string, CriticalityTier> = {
  critical: "critical",
  "needs support": "needs support",
  needs_support: "needs support",
  cleanup: "cleanup",
};

export function jsonToMapIncident(raw: IncidentJson): MapIncident {
  const criticality =
    CRITICALITY_TO_TIER[raw.criticality.toLowerCase()] ?? "cleanup";
  return {
    id: raw.incident_id,
    lat: raw.location_centre.lat,
    lng: raw.location_centre.lon,
    radiusKm: raw.location_radius_km,
    title: raw.summary.slice(0, 80) + (raw.summary.length > 80 ? "…" : ""),
    summary: raw.summary,
    reportedAt: raw.time_of_incident,
    timeSince: raw.time_since_incident,
    criticality,
    casualtiesEstimate: raw.casualties_estimate,
    casualtiesCategory: raw.casualties,
    manpowerEstimate: raw.manpower_needed_estimate,
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
  const urgencyOverride = inc.urgencyLevel && URGENCY_TO_CRITICALITY[inc.urgencyLevel];
  const tier = getTimeUrgencyTier(reportedAt);
  const criticality = urgencyOverride ?? TIME_URGENCY_TO_CRITICALITY[tier] ?? "cleanup";
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
