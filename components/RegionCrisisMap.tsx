"use client";

import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapIncident } from "@/types/incident-json";
import type { RegionConfig, SubZone, LangCode } from "@/lib/region-types";
import { getZoneForPoint } from "@/lib/gaza-zones";
import { getZoneForPoint as getUkraineZoneForPoint, incidentsInZone } from "@/lib/ukraine-zones";
import { CRITICALITY_META } from "@/lib/criticality-meta";
import { zoneDisplayCriticality } from "@/lib/gaza-zones";
import { t, getCriticalityLabel } from "@/lib/translations";

const createIcon = (color: string) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

function ViewController({ config }: { config: RegionConfig }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(config.flyBounds[0], config.flyBounds[1]);
    map.flyToBounds(bounds, { padding: [40, 40], maxZoom: config.zoom, duration: 1.1 });
  }, [config, map]);
  return null;
}

function PopupCloser({ drawerOpen }: { drawerOpen: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (drawerOpen) map.closePopup();
  }, [drawerOpen, map]);
  return null;
}

function FlyToSelected({
  incidentId,
  incidents,
}: {
  incidentId: string | null;
  incidents: MapIncident[];
}) {
  const map = useMap();
  useEffect(() => {
    if (!incidentId) return;
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) return;
    const t = setTimeout(() => {
      map.flyTo([inc.lat, inc.lng], 14, { duration: 0.9, easeLinearity: 0.25 });
    }, 100);
    return () => clearTimeout(t);
  }, [incidentId, incidents, map]);
  return null;
}

function getZoneForRegion(
  regionId: string,
  lat: number,
  lng: number
): SubZone | null {
  if (regionId === "gaza") return getZoneForPoint(lat, lng) as SubZone | null;
  if (regionId === "ukraine") return getUkraineZoneForPoint(lat, lng);
  return null;
}

interface RegionCrisisMapProps {
  region: RegionConfig;
  lang: LangCode;
  incidents: MapIncident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  className?: string;
}

const POPUP_CLOSE_DELAY_MS = 400;

export function RegionCrisisMap({
  region,
  lang,
  incidents,
  selectedIncidentId,
  onSelectIncident,
  selectedZoneId,
  onSelectZone,
  className = "",
}: RegionCrisisMapProps) {
  const drawerOpen = !!selectedIncidentId;
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openMarkerRef = useRef<L.Marker | null>(null);

  return (
    <div
      className={`h-full min-h-[400px] overflow-hidden rounded-lg border ${className} ${drawerOpen ? "incident-drawer-open" : ""}`}
    >
      <MapContainer
        center={region.center}
        zoom={region.zoom}
        className="h-full w-full"
        scrollWheelZoom
        minZoom={3}
        maxBounds={[[-85, -200], [85, 200]]}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewController config={region} />
        <PopupCloser drawerOpen={drawerOpen} />
        <FlyToSelected incidentId={selectedIncidentId} incidents={incidents} />

        {/* Region outline */}
        <Polygon
          positions={region.polygon}
          pathOptions={{
            color: "#0f172a",
            weight: 2,
            fillColor: "#1e293b",
            fillOpacity: 0.12,
            fillRule: "nonzero",
            interactive: true,
          }}
        >
          <Popup>
            <div className="text-sm font-medium">
              {region.name[lang] ?? region.name.en}
            </div>
          </Popup>
        </Polygon>

        {/* Sub-zones with criticality colors */}
        {region.subZones.map((zone) => {
          const inZone = incidentsInZone(incidents, zone);
          const criticality = zoneDisplayCriticality(inZone);
          const meta = criticality ? CRITICALITY_META[criticality] : null;
          const fill = meta?.fill ?? "#64748b";
          const stroke = meta?.stroke ?? "#475569";
          const selected = selectedZoneId === zone.id;

          return (
            <Polygon
              key={zone.id}
              positions={zone.polygon}
              pathOptions={{
                color: selected ? "#0f172a" : stroke,
                weight: selected ? 3 : 2,
                fillColor: fill,
                fillOpacity: selected ? 0.5 : 0.32,
                interactive: true,
              }}
              eventHandlers={{
                click: () => {
                  onSelectZone(zone.id);
                  onSelectIncident(null);
                },
              }}
            />
          );
        })}

        {/* Incident markers */}
        {incidents.map((inc) => {
          const meta = CRITICALITY_META[inc.criticality];
          const color = meta.marker;
          const selected = selectedIncidentId === inc.id;
          const radiusM = inc.radiusKm ? inc.radiusKm * 1000 : 0;

          return (
            <React.Fragment key={inc.id}>
              {radiusM > 0 && (
                <Circle
                  center={[inc.lat, inc.lng]}
                  radius={radiusM}
                  pathOptions={{
                    color: meta.stroke,
                    fillColor: meta.fill,
                    fillOpacity: 0.2,
                    weight: 1,
                  }}
                />
              )}
              <Marker
                position={[inc.lat, inc.lng]}
                icon={createIcon(color)}
                zIndexOffset={selected ? 800 : 400}
                eventHandlers={{
                  mouseover: (e) => {
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                    openMarkerRef.current = e.target;
                    e.target.openPopup();
                  },
                  mouseout: (e) => {
                    closeTimeoutRef.current = setTimeout(() => {
                      e.target.closePopup();
                      if (openMarkerRef.current === e.target) {
                        openMarkerRef.current = null;
                      }
                      closeTimeoutRef.current = null;
                    }, POPUP_CLOSE_DELAY_MS);
                  },
                  click: () => {
                    onSelectIncident(inc.id);
                    const z = getZoneForRegion(region.id, inc.lat, inc.lng);
                    onSelectZone(z?.id ?? null);
                  },
                }}
              >
                <Popup
                  closeButton={false}
                  autoClose
                  className="incident-summary-popup"
                  offset={[0, -12]}
                >
                  <div
                    className="min-w-[180px] py-1"
                    onMouseEnter={() => {
                      if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                      }
                    }}
                    onMouseLeave={() => {
                      const marker = openMarkerRef.current;
                      if (marker) {
                        closeTimeoutRef.current = setTimeout(() => {
                          marker.closePopup();
                          openMarkerRef.current = null;
                          closeTimeoutRef.current = null;
                        }, POPUP_CLOSE_DELAY_MS);
                      }
                    }}
                  >
                    <p className="font-semibold text-sm">{inc.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getCriticalityLabel(lang, inc.criticality)} • {inc.casualtiesEstimate === 0 ? t(lang, "none") : `${inc.casualtiesEstimate} ${t(lang, "casualtiesEst")}`}
                    </p>
                    <button
                      type="button"
                      className="mt-2 w-full rounded bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncident(inc.id);
                        const z = getZoneForRegion(region.id, inc.lat, inc.lng);
                        onSelectZone(z?.id ?? null);
                      }}
                    >
                      {t(lang, "openDetails")}
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
