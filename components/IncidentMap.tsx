"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Incident } from "@prisma/client";

// Fix Leaflet default marker icons in Next.js
const createIcon = (color: string) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const PIN_COLORS: Record<string, string> = {
  UNVERIFIED: "#ef4444",
  PARTIALLY_VERIFIED: "#eab308",
  VERIFIED: "#22c55e",
  FALSE_REPORT: "#94a3b8",
  DUPLICATE: "#64748b",
};

interface IncidentMapProps {
  incidents: Incident[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export function IncidentMap({
  incidents,
  selectedId,
  onSelect,
  center = [31.4, 34.45],
  zoom = 11,
  className = "",
}: IncidentMapProps) {
  return (
    <div className={`h-full min-h-[400px] rounded-lg overflow-hidden border ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        {incidents.map((inc) => (
          <Marker
            key={inc.id}
            position={[inc.lat, inc.lng]}
            icon={createIcon(
              PIN_COLORS[inc.verificationStatus] ?? PIN_COLORS.UNVERIFIED
            )}
            eventHandlers={{
              click: () => onSelect?.(inc.id),
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold">{inc.title}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {inc.locationName}
                </p>
                <p className="text-xs mt-1">
                  Severity: {inc.severityScore}/10 • {inc.incidentType}
                </p>
                {onSelect && (
                  <button
                    onClick={() => onSelect(inc.id)}
                    className="mt-2 text-xs text-blue-600 hover:underline"
                  >
                    View details →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
