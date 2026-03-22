"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { IncidentCard } from "@/components/IncidentCard";
import { ChevronRight, List, X } from "lucide-react";
import type { Incident } from "@prisma/client";
import type { IncidentJson, MapIncident } from "@/types/incident-json";
import {
  type DisplayIncident,
  prismaToDisplay,
  jsonToDisplay,
  mapToDisplay,
} from "@/lib/incident-feed-utils";
import { CRITICALITY_META } from "@/lib/criticality-meta";
import type { LangCode } from "@/lib/region-types";
import { t, getCriticalityLabel } from "@/lib/translations";

interface OpenIncidentsPanelProps {
  onSelectIncident?: (id: string) => void;
  /** Map incidents (preferred - ensures zoom works). Falls back to fetch when empty. */
  mapIncidents?: MapIncident[];
  lang?: LangCode;
}

export function OpenIncidentsPanel({
  onSelectIncident,
  mapIncidents = [],
  lang = "en",
}: OpenIncidentsPanelProps) {
  const [incidents, setIncidents] = useState<DisplayIncident[]>([]);
  const [counts, setCounts] = useState<
    Record<string, { i: number; c: number; ch: number }>
  >({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    if (mapIncidents.length > 0) {
      setIncidents(mapIncidents.map(mapToDisplay));
      return;
    }
    fetch("/api/incidents")
      .then((r) => r.json())
      .then(
        (data: {
          incidents?: Incident[];
          counts?: Record<string, { i: number; c: number; ch: number }>;
        }) => {
          const list = data.incidents ?? [];
          if (list.length > 0) {
            setIncidents(list.map(prismaToDisplay));
            setCounts(data.counts ?? {});
            return;
          }
          return fetch("/api/incidents-json")
            .then((r) => r.json())
            .then((jsonData: { incidents?: IncidentJson[] }) => {
              const jsonList = jsonData.incidents ?? [];
              setIncidents(jsonList.map(jsonToDisplay));
              setCounts({});
            });
        }
      )
      .catch(() =>
        fetch("/api/incidents-json")
          .then((r) => r.json())
          .then((jsonData: { incidents?: IncidentJson[] }) => {
            const jsonList = jsonData.incidents ?? [];
            setIncidents(jsonList.map(jsonToDisplay));
            setCounts({});
          })
          .catch(() => setIncidents([]))
      );
  }, [expanded, mapIncidents]);

  if (expanded) {
    return (
      <div className="absolute left-4 top-36 z-[1000] max-w-[280px] max-h-[50vh] flex flex-col rounded-xl border bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
          <h2 className="font-semibold text-sm">{t(lang, "openIncidents")}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setExpanded(false)}
            aria-label="Back to criticality"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="overflow-y-auto p-2 min-h-0" style={{ maxHeight: "calc(50vh - 44px)" }}>
          {incidents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t(lang, "noOpenIncidents")}
            </p>
          ) : (
            <div className="space-y-2">
              {incidents.map((inc) => (
                <IncidentCard
                  key={inc.id}
                  incident={inc}
                  interestedCount={counts[inc.id]?.i ?? 0}
                  confirmedCount={counts[inc.id]?.c ?? 0}
                  checkedInCount={counts[inc.id]?.ch ?? 0}
                  onClick={() => {
                    onSelectIncident?.(inc.id);
                    setExpanded(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-4 top-36 z-[1000] max-w-[280px] rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-shadow hover:shadow-xl">
      <p className="font-medium text-sm">{t(lang, "criticality")}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5 whitespace-nowrap text-sm">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: CRITICALITY_META.critical.marker }}
          />
          {getCriticalityLabel(lang, "critical")}
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap text-sm">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: CRITICALITY_META["needs support"].marker }}
          />
          {getCriticalityLabel(lang, "needs support")}
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap text-sm">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: CRITICALITY_META.cleanup.marker }}
          />
          {getCriticalityLabel(lang, "cleanup")}
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="mt-3 w-full gap-2 shadow-sm transition-colors hover:bg-muted"
        onClick={() => setExpanded(true)}
      >
        <List className="h-4 w-4" />
        {t(lang, "openIncidents")}
        <ChevronRight className="h-4 w-4 opacity-70" />
      </Button>
    </div>
  );
}
