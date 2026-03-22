import type { CriticalityTier } from "@/types/incident-json";

/** Map display metadata for criticality (JSON format: critical, needs support, cleanup). */
export const CRITICALITY_META: Record<
  CriticalityTier,
  { label: string; fill: string; stroke: string; marker: string }
> = {
  critical: {
    label: "Critical",
    fill: "#dc2626",
    stroke: "#991b1b",
    marker: "#ef4444",
  },
  "needs support": {
    label: "Moderate",
    fill: "#eab308",
    stroke: "#ca8a04",
    marker: "#facc15",
  },
  cleanup: {
    label: "Clean Up",
    fill: "#22c55e",
    stroke: "#15803d",
    marker: "#4ade80",
  },
};
