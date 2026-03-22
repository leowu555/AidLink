import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerificationBadge } from "@/components/VerificationBadge";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Badge } from "@/components/ui/badge";
import type { DisplayIncident } from "@/lib/incident-feed-utils";
import { MapPin, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const OP_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  ACTIVE: "Active",
  ASSIGNED: "Assigned",
  RESOLVED: "Resolved",
};

interface IncidentCardProps {
  incident: DisplayIncident;
  interestedCount?: number;
  confirmedCount?: number;
  checkedInCount?: number;
  onClick?: () => void;
  selected?: boolean;
  actions?: React.ReactNode;
  variant?: "default" | "dark";
  /** Use organizer labels for verification (Initial, Confident, Verified) */
  organizerLabels?: boolean;
}

export function IncidentCard({
  incident,
  interestedCount = 0,
  confirmedCount = 0,
  checkedInCount = 0,
  onClick,
  selected,
  actions,
  variant = "default",
  organizerLabels = false,
}: IncidentCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        variant === "dark" && "bg-slate-900/50 border-slate-700",
        selected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold line-clamp-2">{incident.title}</h3>
          <div className="flex flex-wrap gap-1 shrink-0">
            <VerificationBadge status={incident.verificationStatus} organizerLabels={organizerLabels} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{incident.locationName}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <SeverityBadge score={incident.severityScore} />
          <Badge variant="outline">{OP_STATUS_LABELS[incident.operationalStatus]}</Badge>
          <Badge variant="secondary">{incident.incidentType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {confirmedCount}/{incident.volunteersNeeded} confirmed
          </span>
          <span className="text-muted-foreground">
            {incident.volunteersNeeded} needed
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          I:{interestedCount} • C:{confirmedCount} • ✓:{checkedInCount}
        </div>
        {actions && <div className="mt-3">{actions}</div>}
      </CardContent>
    </Card>
  );
}
