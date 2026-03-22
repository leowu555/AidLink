import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        reports: {
          orderBy: { timestamp: "desc" },
          take: 8,
        },
      },
    });
    if (!incident) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ incident });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to load incident" },
      { status: 500 }
    );
  }
}
