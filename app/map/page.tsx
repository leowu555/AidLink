"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SiteHeader } from "@/components/SiteHeader";
import { MapIncidentDrawer } from "@/components/MapIncidentDrawer";
import { RegionZonePanel } from "@/components/RegionZonePanel";
import { OpenIncidentsPanel } from "@/components/OpenIncidentsPanel";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { pointInBounds } from "@/lib/gaza-zones";
import { jsonToMapIncident, prismaToMapIncident } from "@/lib/incident-adapters";
import { REGIONS } from "@/lib/regions";
import { useLanguageStore } from "@/lib/language-store";
import type { RegionId, LangCode } from "@/lib/region-types";
import { t } from "@/lib/translations";
import type { Incident } from "@prisma/client";
import type { MapIncident, IncidentJson } from "@/types/incident-json";

const RegionCrisisMap = dynamic(
  () =>
    import("@/components/RegionCrisisMap").then((m) => ({
      default: m.RegionCrisisMap,
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

function inRegion(
  inc: { lat: number; lng: number },
  regionId: RegionId
): boolean {
  const region = REGIONS[regionId];
  return pointInBounds(inc.lat, inc.lng, region.flyBounds);
}

function PublicMapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang: storeLang, region: storeRegion, setLang, setRegion } = useLanguageStore();
  const regionParam = searchParams.get("region") as RegionId | null;
  const langParam = searchParams.get("lang") as LangCode | null;

  const region: RegionId =
    regionParam && REGIONS[regionParam] ? regionParam : storeRegion;
  const regionConfig = REGIONS[region];
  const lang: LangCode =
    langParam && regionConfig.languages.includes(langParam) ? langParam : storeLang;

  // Sync URL params to store when valid
  useEffect(() => {
    if (regionParam && REGIONS[regionParam as RegionId]) {
      setRegion(regionParam as RegionId);
    }
    if (langParam && regionConfig.languages.includes(langParam as LangCode)) {
      setLang(langParam as LangCode);
    }
  }, [regionParam, langParam, regionConfig.languages, setRegion, setLang]);

  const [mapIncidents, setMapIncidents] = useState<MapIncident[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const selected = useMemo(
    () => mapIncidents.find((i) => i.id === selectedId) ?? null,
    [mapIncidents, selectedId]
  );

  useEffect(() => {
    if (!regionParam || !REGIONS[regionParam as RegionId]) {
      router.replace(`/map?region=${storeRegion}&lang=${storeLang}`);
      return;
    }
    if (!langParam || !regionConfig.languages.includes(langParam as LangCode)) {
      router.replace(`/map?region=${region}&lang=${storeLang}`);
    }
  }, [regionParam, langParam, region, regionConfig.languages, storeRegion, storeLang, router]);

  const fetchIncidents = useCallback(() => {
    setIsRefreshing(true);
    fetch(`/api/incidents-supabase?region=${region}`)
      .then((r) => r.json())
      .then((data: { incidents?: MapIncident[] }) => {
        const incidents = data.incidents ?? [];
        if (Array.isArray(incidents) && incidents.length > 0) {
          setMapIncidents(incidents.filter((i) => inRegion(i, region)));
          return;
        }
        // Fallback to legacy sources if Supabase returns empty
        return fetch("/api/incidents-json")
          .then((r) => r.json())
          .then((jsonData: { incidents?: IncidentJson[] }) => {
            const json = jsonData.incidents ?? [];
            if (Array.isArray(json) && json.length > 0) {
              setMapIncidents(
                json.map(jsonToMapIncident).filter((i) => inRegion(i, region))
              );
              return;
            }
            return fetch("/api/incidents")
              .then((r) => r.json())
              .then((fallback: { incidents?: Incident[] }) => {
                const list = (fallback.incidents ?? []) as Incident[];
                setMapIncidents(
                  list
                    .filter(
                      (i) =>
                        !["FALSE_REPORT", "DUPLICATE"].includes(
                          i.verificationStatus ?? ""
                        )
                    )
                    .map(prismaToMapIncident)
                    .filter((i) => inRegion(i, region))
                );
              });
          });
      })
      .catch(() => setMapIncidents([]))
      .finally(() => setIsRefreshing(false));
  }, [region]);

  useEffect(() => {
    fetchIncidents();
    const id = setInterval(fetchIncidents, 15000);
    return () => clearInterval(id);
  }, [fetchIncidents]);

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader
        navItems={[
          { href: "/", label: t(lang, "home") },
        ]}
      />

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="relative z-[1100] flex shrink-0 flex-wrap items-center gap-3 border-b bg-muted/30 px-4 py-3 text-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isRefreshing}
            onClick={() => fetchIncidents()}
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {t(lang, "refresh")}
          </Button>
          <span className="text-muted-foreground">
            {t(lang, "hoverHint")} • {t(lang, "clickHint")}
          </span>
        </div>

        <div className="relative min-h-0 flex-1">
          <RegionCrisisMap
            region={regionConfig}
            lang={lang}
            incidents={mapIncidents}
            selectedIncidentId={selectedId}
            onSelectIncident={setSelectedId}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            className="h-full min-h-0 rounded-none border-0"
          />
        </div>

        {selected && (
          <MapIncidentDrawer
            incident={selected}
            onClose={() => setSelectedId(null)}
          />
        )}

        {selectedZoneId && !selected && (
          <RegionZonePanel
            region={regionConfig}
            lang={lang}
            zoneId={selectedZoneId}
            incidents={mapIncidents}
            onClose={() => setSelectedZoneId(null)}
            onSelectIncident={setSelectedId}
          />
        )}
      </div>

      {!selected && !selectedZoneId && (
        <OpenIncidentsPanel
          mapIncidents={mapIncidents}
          onSelectIncident={(id) => setSelectedId(id)}
          lang={lang}
        />
      )}
    </div>
  );
}

export default function PublicMapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="text-muted-foreground">Loading map…</div>
        </div>
      }
    >
      <PublicMapContent />
    </Suspense>
  );
}
