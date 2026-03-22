"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Incident } from "@prisma/client";
import {
  GAZA_STRIP_POLYGON,
  GAZA_FLY_BOUNDS,
  GAZA_SUB_ZONES,
  boundsToRoundedPolygon,
  incidentsInZone,
  pointInBounds,
  zoneDisplayUrgency,
} from "@/lib/gaza-zones";
import {
  getTimeUrgencyTier,
  TIME_URGENCY_META,
} from "@/lib/time-urgency";

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

function ViewController({ gazaMode }: { gazaMode: boolean }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(GAZA_FLY_BOUNDS[0], GAZA_FLY_BOUNDS[1]);
    if (gazaMode) {
      map.flyToBounds(bounds, { padding: [40, 40], maxZoom: 12, duration: 1.1 });
    } else {
      map.flyTo([28, 38], 5, { duration: 1 });
    }
  }, [gazaMode, map]);
  return null;
}

interface GazaCrisisMapProps {
  incidents: Incident[];
  gazaMode: boolean;
  onEnterGaza: () => void;
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  selectedZoneId: string | null;
  onSelectZone: (id: string | null) => void;
  className?: string;
}

export function GazaCrisisMap({
  incidents,
  gazaMode,
  onEnterGaza,
  selectedIncidentId,
  onSelectIncident,
  selectedZoneId,
  onSelectZone,
  className = "",
}: GazaCrisisMapProps) {
  const worldCenter: [number, number] = [28, 38];
  const worldZoom = 5;

  return (
    <div
      className={`h-full min-h-[400px] overflow-hidden rounded-lg border ${className}`}
    >
      <MapContainer
        center={worldCenter}
        zoom={worldZoom}
        className="h-full w-full"
        scrollWheelZoom
        minZoom={3}
        maxBounds={[
          [-85, -200],
          [85, 200],
        ]}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ViewController gazaMode={gazaMode} />

        <Polygon
          positions={GAZA_STRIP_POLYGON}
          pathOptions={{
            color: "#0f172a",
            weight: 2,
            fillColor: "#1e293b",
            fillOpacity: gazaMode ? 0.12 : 0.5,
            interactive: true,
          }}
          eventHandlers={{
            click: () => {
              onEnterGaza();
            },
          }}
        >
          <Popup>
            <div className="text-sm font-medium">Gaza focus area</div>
            <p className="mt-1 max-w-[200px] text-xs text-muted-foreground">
              Demo map region. Click the shaded area to zoom in and view zones by
              response urgency (time since report).
            </p>
            {!gazaMode && (
              <button
                type="button"
                className="mt-2 text-xs font-medium text-primary underline"
                onClick={onEnterGaza}
              >
                Zoom to Gaza
              </button>
            )}
          </Popup>
        </Polygon>

        {gazaMode &&
          GAZA_SUB_ZONES.map((zone) => {
            const inZone = incidentsInZone(incidents, zone.bounds);
            const urgency = zoneDisplayUrgency(inZone);
            const meta = urgency ? TIME_URGENCY_META[urgency] : null;
            const fill = meta?.fill ?? "#64748b";
            const stroke = meta?.stroke ?? "#475569";
            const selected = selectedZoneId === zone.id;
            const roundedPositions = boundsToRoundedPolygon(zone.bounds, 0.18);

            const openDetails = () => {
              onSelectZone(zone.id);
              onSelectIncident(null);
            };

            return (
              <Polygon
                key={zone.id}
                positions={roundedPositions}
                pathOptions={{
                  color: selected ? "#0f172a" : stroke,
                  weight: selected ? 3 : 2,
                  fillColor: fill,
                  fillOpacity: selected ? 0.5 : 0.32,
                  interactive: true,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e as unknown as Event);
                    openDetails();
                  },
                }}
              >
                <Tooltip direction="top" sticky opacity={0.95} className="zone-tooltip">
                  <div className="min-w-[180px] py-1">
                    <p className="font-semibold text-sm">{zone.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {inZone.length} incident{inZone.length === 1 ? "" : "s"} •{" "}
                      {urgency
                        ? `${TIME_URGENCY_META[urgency].label} (by report age)`
                        : "No active incidents"}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openDetails();
                      }}
                      className="mt-2 w-full rounded bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
                    >
                      Open details
                    </button>
                  </div>
                </Tooltip>
              </Polygon>
            );
          })}

        {gazaMode &&
          incidents.map((inc) => {
            const tier = getTimeUrgencyTier(inc.reportedAt);
            const color = TIME_URGENCY_META[tier].marker;
            const selected = selectedIncidentId === inc.id;
            return (
              <Marker
                key={inc.id}
                position={[inc.lat, inc.lng]}
                icon={createIcon(color)}
                zIndexOffset={selected ? 800 : 400}
                eventHandlers={{
                  click: () => {
                    onSelectIncident(inc.id);
                    const z = GAZA_SUB_ZONES.find((zone) =>
                      pointInBounds(inc.lat, inc.lng, zone.bounds)
                    );
                    onSelectZone(z?.id ?? null);
                  },
                }}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <p className="font-semibold text-sm">{inc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {TIME_URGENCY_META[tier].label}
                    </p>
                    <button
                      type="button"
                      className="mt-2 text-xs text-primary underline"
                      onClick={() => onSelectIncident(inc.id)}
                    >
                      Open details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
