import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const incidents = await prisma.incident.findMany({
      include: {
        assignments: { include: { volunteer: true } },
      },
      orderBy: { reportedAt: "desc" },
    });

    const counts: Record<string, { i: number; c: number; ch: number }> = {};
    for (const inc of incidents) {
      counts[inc.id] = {
        i: inc.assignments.filter((a) => a.status === "INTERESTED").length,
        c: inc.assignments.filter((a) =>
          ["ASSIGNED", "CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(a.status)
        ).length,
        ch: inc.assignments.filter((a) =>
          ["CHECKED_IN", "COMPLETED"].includes(a.status)
        ).length,
      };
    }

    return NextResponse.json({ incidents, counts });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      locationName,
      lat,
      lng,
      severityScore,
      volunteersNeeded,
      safetyNote,
      verificationStatus,
      reportedAt,
    } = body;

    if (!title || lat == null || lng == null || !locationName) {
      return NextResponse.json(
        { error: "title, lat, lng, locationName required" },
        { status: 400 }
      );
    }

    const incident = await prisma.incident.create({
      data: {
        title: String(title).slice(0, 500),
        description: description ? String(description) : null,
        locationName: String(locationName),
        lat: Number(lat),
        lng: Number(lng),
        severityScore: Number(severityScore ?? 5),
        volunteersNeeded: Number(volunteersNeeded ?? 5),
        safetyNote: safetyNote ? String(safetyNote) : null,
        verificationStatus:
          verificationStatus === "VERIFIED"
            ? "VERIFIED"
            : verificationStatus === "PARTIALLY_VERIFIED"
              ? "PARTIALLY_VERIFIED"
              : "UNVERIFIED",
        reportedAt: reportedAt ? new Date(reportedAt) : new Date(),
        incidentType: "rescue",
        helpTypesNeeded: JSON.stringify(["medical", "search", "transport"]),
        injuriesReported: 0,
      },
    });

    return NextResponse.json({ incident, id: incident.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      incidentId,
      verificationStatus,
      operationalStatus,
      title,
      description,
      locationName,
      lat,
      lng,
      severityScore,
      volunteersNeeded,
      safetyNote,
      injuriesReported,
      reportedAt,
      urgencyLevel,
    } = body;

    if (!incidentId) {
      return NextResponse.json(
        { error: "incidentId required" },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = {};
    if (verificationStatus != null) update.verificationStatus = verificationStatus;
    if (operationalStatus != null) update.operationalStatus = operationalStatus;
    if (title != null) update.title = title;
    if (description != null) update.description = description;
    if (locationName != null) update.locationName = locationName;
    if (lat != null) update.lat = Number(lat);
    if (lng != null) update.lng = Number(lng);
    if (severityScore != null) update.severityScore = Number(severityScore);
    if (volunteersNeeded != null) update.volunteersNeeded = Number(volunteersNeeded);
    if (safetyNote != null) update.safetyNote = safetyNote;
    if (injuriesReported != null) update.injuriesReported = Number(injuriesReported);
    if (reportedAt != null) update.reportedAt = new Date(reportedAt);
    if (urgencyLevel != null && ["CRITICAL", "HIGH", "LOW", "MODERATE", "CLEAN_UP"].includes(String(urgencyLevel))) {
      update.urgencyLevel = String(urgencyLevel);
    }

    await prisma.incident.update({
      where: { id: incidentId },
      data: update,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    );
  }
}
