'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DisasterEvent } from '@/app/api/disasters/route';
import { Shield, AlertTriangle, ExternalLink } from 'lucide-react';

interface DisasterMapLeafletProps {
  events: DisasterEvent[];
  selectedEvent: DisasterEvent | null;
  onSelectEvent: (event: DisasterEvent) => void;
}

// Controller to smoothly pan/zoom when an event is selected
function MapController({ selectedEvent }: { selectedEvent: DisasterEvent | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedEvent) {
      map.flyTo([selectedEvent.latitude, selectedEvent.longitude], 7, {
        duration: 1.5,
      });
    }
  }, [selectedEvent, map]);
  return null;
}

// Category styling dictionary
const CATEGORY_STYLES: Record<string, { color: string; border: string; glow: string; label: string }> = {
  flood: { color: '#00E5FF', border: '#00B0FF', glow: 'rgba(0, 229, 255, 0.4)', label: 'FLOOD' },
  cyclone: { color: '#C6FF00', border: '#00E676', glow: 'rgba(198, 255, 0, 0.5)', label: 'CYCLONE' },
  earthquake: { color: '#FF5252', border: '#D50000', glow: 'rgba(255, 82, 82, 0.5)', label: 'SEISMIC' },
  wildfire: { color: '#FF9100', border: '#FF6D00', glow: 'rgba(255, 145, 0, 0.5)', label: 'WILDFIRE' },
  storm: { color: '#C6FF00', border: '#00E676', glow: 'rgba(198, 255, 0, 0.4)', label: 'STORM' },
  volcano: { color: '#E040FB', border: '#AA00FF', glow: 'rgba(224, 64, 251, 0.5)', label: 'VOLCANO' },
};

function createHazardIcon(category: string, severity: string) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.storm;
  const isCritical = severity === 'critical';

  return L.divIcon({
    className: 'custom-hazard-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <span style="
          position: absolute;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          background-color: ${style.color};
          opacity: 0.3;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></span>
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: #0b0b0b;
          border: 2px solid ${style.color};
          box-shadow: 0 0 14px ${style.glow};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background-color: ${isCritical ? '#FF5252' : style.color};
          "></div>
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export default function DisasterMapLeaflet({
  events,
  selectedEvent,
  onSelectEvent,
}: DisasterMapLeafletProps) {
  // Center roughly on South Asia / Global overview
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
      <MapContainer
        center={defaultCenter}
        zoom={4}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
        style={{ background: '#050505' }}
      >
        {/* Standard OpenStreetMap Tile Layer (Free, no API key required) */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapController selectedEvent={selectedEvent} />

        {/* Hazard Events */}
        {events.map((event) => {
          const style = CATEGORY_STYLES[event.category] || CATEGORY_STYLES.storm;
          const radiusMeters = (event.radiusKm || 20) * 1000;

          return (
            <React.Fragment key={event.id}>
              {/* Buffer Zone Perimeter Circle */}
              <Circle
                center={[event.latitude, event.longitude]}
                radius={radiusMeters}
                pathOptions={{
                  color: style.color,
                  fillColor: style.color,
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: '4, 6',
                }}
              />

              {/* Glowing Hazard Marker */}
              <Marker
                position={[event.latitude, event.longitude]}
                icon={createHazardIcon(event.category, event.severity)}
                eventHandlers={{
                  click: () => onSelectEvent(event),
                }}
              >
                <Popup className="supernatural-leaflet-popup">
                  <div className="p-3 min-w-[220px] bg-[#0b0b0b] text-white rounded-xl border border-white/10 font-sans">
                    <div className="flex items-center justify-between mb-2">
                      <span 
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase"
                        style={{ backgroundColor: `${style.color}22`, color: style.color }}
                      >
                        {event.category} • {event.severity}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {event.source}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white leading-tight mb-1">
                      {event.title}
                    </h4>

                    {event.magnitude && (
                      <p className="text-xs text-amber-400 font-mono mb-1">
                        Magnitude: M {event.magnitude}
                      </p>
                    )}

                    {event.description && (
                      <p className="text-xs text-zinc-400 mb-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/10 flex justify-between">
                      <span>Perimeter: {event.radiusKm || 20}km</span>
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Map telemetry overlay watermark */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none bg-black/70 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[11px] font-mono text-zinc-400">
        <span className="text-[#C6FF00] font-semibold">{events.length}</span> SATELLITE HAZARD NODES
      </div>
    </div>
  );
}
