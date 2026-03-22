import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { IncidentJson } from "@/types/incident-json";

export const dynamic = "force-dynamic";

const REGION_FILES: Record<string, string> = {
  gaza: "incidents.json",
  ukraine: "incidents-ukraine.json",
};

/**
 * Serves incident JSON from data folder. Supports ?region=gaza|ukraine.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "gaza";
    const filename = REGION_FILES[region] || REGION_FILES.gaza;
    const filePath = path.join(process.cwd(), "data", filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ incidents: [] });
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const incidents: IncidentJson[] = JSON.parse(raw);
    return NextResponse.json({ incidents });
  } catch (e) {
    console.error("Failed to load incidents JSON:", e);
    return NextResponse.json(
      { error: "Failed to load incidents", incidents: [] },
      { status: 500 }
    );
  }
}
