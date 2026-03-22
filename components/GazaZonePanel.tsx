"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Incident } from "@prisma/client";
import { GAZA_SUB_ZONES, incidentsInZone } from "@/lib/gaza-zones";
import {
  getTimeUrgencyTier,
  TIME_URGENCY_META,
} from "@/lib/time-urgency";
import { cn } from "@/lib/utils";

type Counts = { i: number; c: number; ch: number };

interface GazaZonePanelProps {
  zoneId: string;
  incidents: Incident[];
  counts: Record<string, Counts>;
  onClose: () => void;
  onSelectIncident: (id: string) => void;
}

export function GazaZonePanel({
  zoneId,
  incidents,
  counts,
  onClose,
  onSelectIncident,
}: GazaZonePanelProps) {
  const zone = GAZA_SUB_ZONES.find((z) => z.id === zoneId);
  if (!zone) return null;

  const inZone = incidentsInZone(incidents, zone.bounds);
  const sorted = [...inZone].sort(
    (a, b) =>
      new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );
  const primary = sorted[0];

  const volunteerTotal = inZone.reduce(
    (acc, inc) => {
      const n = counts[inc.id] ?? { i: 0, c: 0, ch: 0 };
      return {
        interested: acc.interested + n.i,
        confirmed: acc.confirmed + n.c,
        checkedIn: acc.checkedIn + n.ch,
      };
    },
    { interested: 0, confirmed: 0, checkedIn: 0 }
  );

  const injuriesTotal = inZone.reduce(
    (acc, inc) => acc + (inc.injuriesReported ?? 0),
    0
  );

  const latestReportTime =
    sorted.length > 0
      ? new Date(sorted[0].reportedAt).toLocaleString()
      : "—";

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col overflow-y-auto border-l bg-gradient-to-b from-background to-muted/20 shadow-2xl",
        "animate-in slide-in-from-right duration-200"
      )}
    >
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div>
          <h2 className="text-lg font-semibold">{zone.name}</h2>
          <p className="text-xs text-muted-foreground">Zone summary</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0" aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="rounded-xl border bg-card/50 p-4 text-sm shadow-sm">
          <p className="font-medium text-muted-foreground">Location</p>
          <p className="font-medium">{zone.name} (Gaza Strip)</p>
        </div>

        <div className="rounded-xl border bg-card/50 p-4 text-sm shadow-sm">
          <p className="font-medium text-muted-foreground">
            Most recent report time (in zone)
          </p>
          <p className="font-medium">{latestReportTime}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
            <p className="text-muted-foreground">Missing People</p>
            <p className="text-lg font-semibold">{volunteerTotal.interested}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
            <p className="text-muted-foreground">Confirmed Volunteers</p>
            <p className="text-lg font-semibold">{volunteerTotal.confirmed}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
            <p className="text-muted-foreground">Injuries (reported est.)</p>
            <p className="text-lg font-semibold">{injuriesTotal}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
            <p className="text-muted-foreground">Volunteers Needed</p>
            <p className="text-lg font-semibold">
              {inZone.reduce((s, inc) => s + inc.volunteersNeeded, 0)}
            </p>
          </div>
        </div>

        {primary && (
          <Button className="w-full shadow-sm" variant="secondary" asChild>
            <Link href={`/map/incident/${primary.id}`}>
              More info — latest incident report
            </Link>
          </Button>
        )}

        {sorted.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Incidents in this zone
            </p>
            <ul className="space-y-2">
              {sorted.map((inc) => {
                const tier = getTimeUrgencyTier(inc.reportedAt);
                const m = TIME_URGENCY_META[tier];
                return (
                  <li key={inc.id}>
                    <button
                      type="button"
                      onClick={() => onSelectIncident(inc.id)}
                      className="flex w-full flex-col rounded-xl border bg-card px-4 py-3 text-left text-sm shadow-sm transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow"
                    >
                      <span className="font-medium">{inc.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {inc.locationName} ·{" "}
                        <span style={{ color: m.fill }}>{m.label}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No incidents mapped in this zone for the current dataset.
          </p>
        )}
      </div>
    </div>
  );
}
