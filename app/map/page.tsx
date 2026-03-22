"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/SiteHeader";
import { IncidentDrawer } from "@/components/IncidentDrawer";
import { GazaZonePanel } from "@/components/GazaZonePanel";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { pointInBounds, GAZA_FLY_BOUNDS } from "@/lib/gaza-zones";
import { TIME_URGENCY_META } from "@/lib/time-urgency";
import type { Incident } from "@prisma/client";

const GazaCrisisMap = dynamic(
  () =>
    import("@/components/GazaCrisisMap").then((m) => ({
      default: m.GazaCrisisMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] items-center justify-center bg-muted animate-pulse">
        Loading map…
      </div>
    ),
  }
);

function incidentInGazaBounds(inc: Incident): boolean {
  return pointInBounds(inc.lat, inc.lng, GAZA_FLY_BOUNDS);
}

export default function PublicMapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [counts, setCounts] = useState<
    Record<string, { i: number; c: number; ch: number }>
  >({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [gazaMode, setGazaMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/incidents")
      .then((r) => r.json())
      .then((data) => {
        setIncidents(data.incidents ?? []);
        setCounts(data.counts ?? {});
      })
      .catch(() => setIncidents([]));
  }, []);

  const handleOfferHelp = () => {
    router.push(`/volunteer?incident=${selectedId}`);
  };

  const publicIncidents = useMemo(
    () =>
      incidents.filter(
        (i) => !["FALSE_REPORT", "DUPLICATE"].includes(i.verificationStatus)
      ),
    [incidents]
  );

  const mapIncidents = useMemo(
    () => publicIncidents.filter(incidentInGazaBounds),
    [publicIncidents]
  );

  const selected = incidents.find((i) => i.id === selectedId);
  const c = selectedId
    ? counts[selectedId] ?? { i: 0, c: 0, ch: 0 }
    : { i: 0, c: 0, ch: 0 };

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader
        navItems={[
          { href: "/", label: "Home" },
          { href: "/volunteer", label: "Volunteer" },
        ]}
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b bg-muted/30 px-4 py-2 text-sm">
          <Button
            type="button"
            variant={gazaMode ? "secondary" : "default"}
            size="sm"
            onClick={() => setGazaMode(true)}
          >
            Gaza view
          </Button>
          {gazaMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setGazaMode(false);
                setSelectedZoneId(null);
                setSelectedId(null);
              }}
            >
              World map
            </Button>
          )}
          <span className="text-muted-foreground">
            {gazaMode
              ? "Click a colored zone for details. Pins use report age for color."
              : "Click the shaded Gaza area to zoom in."}
          </span>
        </div>

        <div className="relative min-h-0 flex-1">
          <GazaCrisisMap
            incidents={mapIncidents}
            gazaMode={gazaMode}
            onEnterGaza={() => setGazaMode(true)}
            selectedIncidentId={selectedId}
            onSelectIncident={setSelectedId}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            className="h-full min-h-0 rounded-none border-0"
          />
        </div>

        {selected && (
          <IncidentDrawer
            incident={selected}
            interestedCount={c.i}
            confirmedCount={c.c}
            checkedInCount={c.ch}
            onClose={() => setSelectedId(null)}
            onOfferHelp={handleOfferHelp}
            isPublic
          />
        )}

        {selectedZoneId && !selected && gazaMode && (
          <GazaZonePanel
            zoneId={selectedZoneId}
            incidents={mapIncidents}
            counts={counts}
            onClose={() => setSelectedZoneId(null)}
            onSelectIncident={(id) => {
              setSelectedId(id);
            }}
          />
        )}
      </div>

      <div className="pointer-events-none absolute left-4 top-32 z-[1000] max-w-[calc(100vw-2rem)] rounded-lg border bg-background/95 p-3 text-sm shadow backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:top-36">
        <p className="pointer-events-auto font-medium">Urgency (by report age)</p>
        <div className="pointer-events-auto mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: TIME_URGENCY_META.CRITICAL.marker }}
            />
            Critical (0–24h)
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: TIME_URGENCY_META.MODERATE.marker }}
            />
            Moderate (24h–3d)
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: TIME_URGENCY_META.CLEAN_UP.marker }}
            />
            Clean Up (3d+)
          </span>
        </div>
      </div>
    </div>
  );
}
