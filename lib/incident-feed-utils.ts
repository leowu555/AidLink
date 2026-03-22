import type { Incident } from "@prisma/client";
import type { IncidentJson, MapIncident } from "@/types/incident-json";

/** Display shape for IncidentCard (works with both Prisma and JSON sources). */
export interface DisplayIncident {
  id: string;
  title: string;
  locationName: string;
  verificationStatus: string;
  severityScore: number;
  operationalStatus: string;
  incidentType: string;
  volunteersNeeded: number;
}

const VERIFICATION_MAP: Record<string, string> = {
  initial_reports: "UNVERIFIED",
  confident: "PARTIALLY_VERIFIED",
  verified: "VERIFIED",
};

const CRITICALITY_TO_SEVERITY: Record<string, number> = {
  critical: 9,
  "needs support": 6,
  cleanup: 3,
};

export function prismaToDisplay(inc: Incident): DisplayIncident {
  return {
    id: inc.id,
    title: inc.title,
    locationName: inc.locationName,
    verificationStatus: inc.verificationStatus ?? "UNVERIFIED",
    severityScore: inc.severityScore ?? 5,
    operationalStatus: inc.operationalStatus ?? "NEW",
    incidentType: inc.incidentType ?? "rescue",
    volunteersNeeded: inc.volunteersNeeded ?? 1,
  };
}

function manpowerFromCategory(cat: string | null | undefined): number {
  const c = String(cat ?? "").toLowerCase();
  if (c === "large") return 25;
  if (c === "moderate") return 10;
  if (c === "small") return 5;
  return 10;
}

export function jsonToDisplay(raw: IncidentJson): DisplayIncident {
  const loc = raw.location_centre;
  const est = raw.manpower_needed_estimate;
  const volunteersNeeded =
    typeof est === "number" && est > 0 ? est : manpowerFromCategory(raw.manpower_needed);
  return {
    id: raw.incident_id,
    title: raw.summary.slice(0, 120) + (raw.summary.length > 120 ? "…" : ""),
    locationName: `${loc.lat.toFixed(4)}, ${loc.lon.toFixed(4)}`,
    verificationStatus: VERIFICATION_MAP[raw.verification] ?? "UNVERIFIED",
    severityScore: CRITICALITY_TO_SEVERITY[raw.criticality] ?? 5,
    operationalStatus: "ACTIVE",
    incidentType: "rescue",
    volunteersNeeded,
  };
}

export function mapToDisplay(inc: MapIncident): DisplayIncident {
  const est = inc.manpowerEstimate;
  const volunteersNeeded =
    typeof est === "number" && est > 0 ? est : manpowerFromCategory(inc.manpowerCategory);
  return {
    id: inc.id,
    title: (inc.title?.slice(0, 120) ?? "") + (inc.title && inc.title.length > 120 ? "…" : ""),
    locationName: `${inc.lat.toFixed(4)}, ${inc.lng.toFixed(4)}`,
    verificationStatus: inc.verification === "verified" ? "VERIFIED" : inc.verification === "confident" ? "PARTIALLY_VERIFIED" : "UNVERIFIED",
    severityScore: CRITICALITY_TO_SEVERITY[inc.criticality] ?? 5,
    operationalStatus: "ACTIVE",
    incidentType: "rescue",
    volunteersNeeded,
  };
}
