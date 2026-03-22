/** Urgency from age of report (wall-clock since `reportedAt`). */
export type TimeUrgencyTier = "CRITICAL" | "MODERATE" | "CLEAN_UP";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export function getHoursSinceReported(reportedAt: Date | string): number {
  const t = typeof reportedAt === "string" ? new Date(reportedAt) : reportedAt;
  return (Date.now() - t.getTime()) / HOUR_MS;
}

/**
 * Critical: within 24h of report.
 * Moderate: 24h–72h (3 days).
 * Clean up: 3+ days.
 */
export function getTimeUrgencyTier(reportedAt: Date | string): TimeUrgencyTier {
  const hours = getHoursSinceReported(reportedAt);
  if (hours < 24) return "CRITICAL";
  if (hours < 72) return "MODERATE";
  return "CLEAN_UP";
}

export const TIME_URGENCY_META: Record<
  TimeUrgencyTier,
  { label: string; fill: string; stroke: string; marker: string }
> = {
  CRITICAL: {
    label: "Critical",
    fill: "#dc2626",
    stroke: "#991b1b",
    marker: "#ef4444",
  },
  MODERATE: {
    label: "Moderate",
    fill: "#eab308",
    stroke: "#ca8a04",
    marker: "#facc15",
  },
  CLEAN_UP: {
    label: "Clean Up",
    fill: "#22c55e",
    stroke: "#15803d",
    marker: "#4ade80",
  },
};

/** Lower number = more urgent (for picking worst tier in a zone). */
const TIER_RANK: Record<TimeUrgencyTier, number> = {
  CRITICAL: 0,
  MODERATE: 1,
  CLEAN_UP: 2,
};

export function mostUrgentTier(tiers: TimeUrgencyTier[]): TimeUrgencyTier | null {
  if (!tiers.length) return null;
  return tiers.reduce((best, t) =>
    TIER_RANK[t] < TIER_RANK[best] ? t : best
  );
}
