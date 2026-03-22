"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/VerificationBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { SafetyNotice } from "@/components/SafetyNotice";
import { X } from "lucide-react";
import type { Incident } from "@prisma/client";
import { cn } from "@/lib/utils";

interface IncidentDrawerProps {
  incident: Incident | null;
  interestedCount: number;
  confirmedCount: number;
  checkedInCount: number;
  onClose: () => void;
  onOfferHelp?: () => void;
  isPublic?: boolean;
}

export function IncidentDrawer({
  incident,
  interestedCount,
  confirmedCount,
  checkedInCount,
  onClose,
  onOfferHelp,
  isPublic = true,
}: IncidentDrawerProps) {
  if (!incident) return null;

  const helpTypes = JSON.parse(incident.helpTypesNeeded || "[]") as string[];

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-full max-w-md bg-background border-l shadow-xl z-40 overflow-y-auto",
        "animate-in slide-in-from-right duration-200"
      )}
    >
      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg truncate pr-2">{incident.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <VerificationBadge status={incident.verificationStatus} />
          <SeverityBadge score={incident.severityScore} />
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Location</p>
          <p>{incident.locationName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Reported</p>
          <p className="text-sm">
            {new Date(incident.reportedAt).toLocaleString()}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Type</p>
          <p className="capitalize">{incident.incidentType}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">Help Needed</p>
          <p className="text-sm capitalize">
            {helpTypes.length ? helpTypes.join(", ") : "General support"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Injuries (reported est.)</p>
            <p className="font-semibold">{incident.injuriesReported ?? 0}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Volunteers Needed</p>
            <p className="font-semibold">{incident.volunteersNeeded}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Confirmed</p>
            <p className="font-semibold">{confirmedCount}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-muted-foreground">Checked In</p>
            <p className="font-semibold">{checkedInCount}</p>
          </div>
          <div className="rounded-lg border p-3 col-span-2">
            <p className="text-muted-foreground">Interested</p>
            <p className="font-semibold">{interestedCount}</p>
          </div>
        </div>

        {incident.description && (
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-sm">{incident.description}</p>
          </div>
        )}

        {incident.safetyNote && (
          <SafetyNotice text={incident.safetyNote} />
        )}

        {isPublic && (
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/map/incident/${incident.id}`}>More info — full report</Link>
          </Button>
        )}

        {isPublic && onOfferHelp && (
          <>
            <SafetyNotice />
            <Button className="w-full" size="lg" onClick={onOfferHelp}>
              Offer to Help
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Interested does not mean assigned. An organizer may review and confirm you.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
