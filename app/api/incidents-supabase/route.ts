import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseToMapIncident } from "@/lib/supabase-incident-adapter";
import type { SupabaseIncidentRow } from "@/lib/supabase-incident-adapter";

const TABLE_BY_REGION: Record<string, string> = {
  gaza: "incidents_gaza",
  ukraine: "incidents_ukraine",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");

  if (!region || !TABLE_BY_REGION[region]) {
    return NextResponse.json(
      { error: "Invalid region. Use ?region=gaza or ?region=ukraine" },
      { status: 400 }
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured", incidents: [] },
      { status: 503 }
    );
  }

  try {
    const table = TABLE_BY_REGION[region];
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("time_of_incident", { ascending: false });

    if (error) {
      console.error(`Supabase error (${table}):`, error);
      return NextResponse.json(
        { error: error.message, incidents: [] },
        { status: 500 }
      );
    }

    const rows = (data ?? []) as SupabaseIncidentRow[];
    const incidents = rows.map(supabaseToMapIncident);

    return NextResponse.json({ incidents });
  } catch (e) {
    console.error("Incidents Supabase fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch incidents", incidents: [] },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { incidentId, region, summary } = body;

  if (!incidentId || !region || typeof summary !== "string") {
    return NextResponse.json(
      { error: "incidentId, region, and summary required" },
      { status: 400 }
    );
  }

  const table = TABLE_BY_REGION[region];
  if (!table) {
    return NextResponse.json(
      { error: "Invalid region. Use gaza or ukraine" },
      { status: 400 }
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  try {
    const { error } = await supabase
      .from(table)
      .update({ summary: summary.trim(), last_updated: new Date().toISOString() })
      .eq("incident_id", incidentId);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Supabase PATCH error:", e);
    return NextResponse.json(
      { error: "Failed to update incident" },
      { status: 500 }
    );
  }
}
