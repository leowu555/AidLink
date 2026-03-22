import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { pointInBounds } from "@/lib/gaza-zones";
import { pointInUkraineBounds } from "@/lib/ukraine-zones";
import { REGIONS } from "@/lib/regions";

const VALID_REGIONS = ["gaza", "ukraine"] as const;

export interface RegionReportRow {
  region: string;
  overall_state: string;
  priority_incidents: string;
  resource_allocation: string;
  manpower_summary: string;
  additional_support: string;
  confidence_in_data?: string;
  generated_at?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");

  if (!region || !VALID_REGIONS.includes(region as (typeof VALID_REGIONS)[number])) {
    return NextResponse.json(
      { error: "Invalid region. Use ?region=gaza or ?region=ukraine" },
      { status: 400 }
    );
  }

  if (!supabase) {
    const fallback = await buildFallbackReport(region);
    return NextResponse.json({ report: fallback });
  }

  try {
    const { data, error } = await supabase
      .from("region_reports")
      .select("region, overall_state, priority_incidents, resource_allocation, manpower_summary, additional_support, confidence_in_data, generated_at")
      .eq("region", region)
      .maybeSingle();

    if (error) {
      console.error("Region reports fetch error:", error);
      const fallback = await buildFallbackReport(region);
      return NextResponse.json({ report: fallback });
    }

    const row = data as RegionReportRow | null;
    if (!row) {
      const fallback = await buildFallbackReport(region);
      return NextResponse.json({ report: fallback });
    }

    let priorityIncidents: string[] = [];
    try {
      const parsed = typeof row.priority_incidents === "string"
        ? JSON.parse(row.priority_incidents)
        : row.priority_incidents;
      priorityIncidents = Array.isArray(parsed)
        ? parsed.filter((x): x is string => typeof x === "string")
        : [];
    } catch {
      // keep empty if parse fails
    }

    return NextResponse.json({
      report: {
        region: row.region,
        overall_state: row.overall_state ?? "",
        priority_incidents: priorityIncidents,
        resource_allocation: row.resource_allocation ?? "",
        manpower_summary: row.manpower_summary ?? "",
        additional_support: row.additional_support ?? "",
        confidence_in_data: row.confidence_in_data ?? null,
        generated_at: row.generated_at ?? null,
      },
    });
  } catch (e) {
    console.error("Region reports error:", e);
    const fallback = await buildFallbackReport(region);
    return NextResponse.json({ report: fallback });
  }
}

function inRegion(lat: number, lng: number, regionId: string): boolean {
  const config = REGIONS[regionId as keyof typeof REGIONS];
  if (!config) return false;
  if (regionId === "gaza") return pointInBounds(lat, lng, config.flyBounds);
  if (regionId === "ukraine") return pointInUkraineBounds(lat, lng, config.flyBounds);
  return false;
}

async function buildFallbackReport(region: string): Promise<{
  region: string;
  overall_state: string;
  priority_incidents: string[];
  resource_allocation: string;
  manpower_summary: string;
  additional_support: string;
  confidence_in_data: string | null;
  generated_at: string | null;
} | null> {
  try {
    const incidents = await prisma.incident.findMany({
      where: { operationalStatus: { not: "RESOLVED" } },
      orderBy: { reportedAt: "desc" },
      take: 100,
    });
    const inRegionList = incidents.filter((i) => inRegion(i.lat, i.lng, region));
    const critical = inRegionList.filter((i) => (i.severityScore ?? 0) >= 8);
    const totalNeeded = inRegionList.reduce((s, i) => s + (i.volunteersNeeded ?? 0), 0);
    const totalReported = inRegionList.length;
    const overall = totalReported > 0
      ? `${totalReported} open incident(s) in region. ${critical.length} critical. ${totalNeeded} volunteers needed across all incidents.`
      : "No open incidents in database for this region.";
    const priority = critical.slice(0, 10).map((i) => i.title || i.id);
    return {
      region,
      overall_state: overall,
      priority_incidents: priority,
      resource_allocation: totalNeeded > 0 ? `Estimated ${totalNeeded} volunteers needed across incidents.` : "—",
      manpower_summary: totalReported > 0 ? `${inRegionList.length} incidents require coordination.` : "—",
      additional_support: "Data from local database. Configure Supabase for richer reports.",
      confidence_in_data: "moderate",
      generated_at: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
