"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { MapIncident } from "@/types/incident-json";
import type { RegionConfig, LangCode } from "@/lib/region-types";
import { incidentsInZone } from "@/lib/ukraine-zones";
import { CRITICALITY_META } from "@/lib/criticality-meta";
import { cn } from "@/lib/utils";
import { t, getCriticalityLabel } from "@/lib/translations";

interface RegionZonePanelProps {
  region: RegionConfig;
  lang: LangCode;
  zoneId: string;
  incidents: MapIncident[];
  onClose: () => void;
  onSelectIncident: (id: string) => void;
}

export function RegionZonePanel({
  region,
  lang,
  zoneId,
  incidents,
  onClose,
  onSelectIncident,
}: RegionZonePanelProps) {
  const zone = region.subZones.find((z) => z.id === zoneId);
  if (!zone) return null;

  const zoneName = zone.name[lang] ?? zone.name.en;
  const regionName = region.name[lang] ?? region.name.en;

  const inZone = incidentsInZone(incidents, zone);
  const sorted = [...inZone].sort(
    (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
  );

  const casualtiesTotal = inZone.reduce((s, i) => s + i.casualtiesEstimate, 0);
  const manpowerTotal = inZone.reduce((s, i) => s + i.manpowerEstimate, 0);
  const latestReportTime =
    sorted.length > 0 ? new Date(sorted[0].reportedAt).toLocaleString() : "—";

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col overflow-y-auto border-l bg-gradient-to-b from-background to-muted/20 shadow-2xl",
        "animate-in slide-in-from-right duration-200"
      )}
    >
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div>
          <h2 className="text-lg font-semibold">{zoneName}</h2>
          <p className="text-xs text-muted-foreground">{t(lang, "zoneSummary")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0" aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div className="rounded-xl border bg-card/50 p-4 text-sm shadow-sm">
          <p className="font-medium text-muted-foreground">{t(lang, "location")}</p>
          <p className="font-medium">{zoneName} ({regionName})</p>
        </div>

        <div className="rounded-xl border bg-card/50 p-4 text-sm shadow-sm">
          <p className="font-medium text-muted-foreground">{t(lang, "mostRecentReport")}</p>
          <p className="font-medium">{latestReportTime}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
            <p className="text-muted-foreground">{t(lang, "casualtiesEst")}</p>
            <p className="text-lg font-semibold">{casualtiesTotal}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 shadow-sm">
            <p className="text-muted-foreground">{t(lang, "manpowerNeeded")}</p>
            <p className="text-lg font-semibold">{manpowerTotal}</p>
          </div>
        </div>

        {region.contact && (
          <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
            <span className="text-muted-foreground">{t(lang, "offerToHelp")}: </span>
            <a
              href={region.contact.href}
              className="font-medium text-primary hover:underline"
              target={region.contact.href.startsWith("http") ? "_blank" : undefined}
              rel={region.contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {region.contact.label}: {region.contact.display}
            </a>
          </div>
        )}

        {sorted.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              {t(lang, "incidentsInZone")}
            </p>
            <ul className="space-y-2">
              {sorted.map((inc) => {
                const m = CRITICALITY_META[inc.criticality];
                return (
                  <li key={inc.id}>
                    <button
                      type="button"
                      onClick={() => onSelectIncident(inc.id)}
                      className="flex w-full flex-col rounded-xl border bg-card px-4 py-3 text-left text-sm shadow-sm transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow"
                    >
                      <span className="font-medium">{inc.title}</span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        {inc.casualtiesEstimate} {t(lang, "casualtiesEst")} ·{" "}
                        <span style={{ color: m.fill }}>{getCriticalityLabel(lang, inc.criticality)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">{t(lang, "noIncidents")}</p>
        )}
      </div>
    </div>
  );
}
