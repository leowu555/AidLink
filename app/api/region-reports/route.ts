import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    return NextResponse.json(
      { error: "Supabase not configured", report: null },
      { status: 503 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("region_reports")
      .select("region, overall_state, priority_incidents, resource_allocation, manpower_summary, additional_support, confidence_in_data, generated_at")
      .eq("region", region)
      .maybeSingle();

    if (error) {
      console.error("Region reports fetch error:", error);
      return NextResponse.json(
        { error: error.message, report: null },
        { status: 500 }
      );
    }

    const row = data as RegionReportRow | null;
    if (!row) {
      return NextResponse.json({ report: null });
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
    return NextResponse.json(
      { error: "Failed to fetch region report", report: null },
      { status: 500 }
    );
  }
}
