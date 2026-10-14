'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface SafeRouteMapLeafletProps {
  startLat: number;
  startLng: number;
  destLat: number;
  destLng: number;
  destName: string;
  hazardLat: number;
  hazardLng: number;
  hazardRadiusKm: number;
  hazardName: string;
  routeCoordinates: [number, number][];
}

function MapBoundsController({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map((c) => [c[0], c[1]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  return null;
}

// Custom icons
function createPinIcon(color: string, label: string) {
  return L.divIcon({
    className: 'custom-route-pin',
    html: `
      <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 28px; height: 28px; border-radius: 9999px; background-color: ${color}; opacity: 0.3; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="width: 20px; height: 20px; border-radius: 9999px; background: #0b0b0b; border: 2px solid ${color}; box-shadow: 0 0 10px ${color}; display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; border-radius: 9999px; background-color: ${color};"></div>
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

export default function SafeRouteMapLeaflet({
  startLat,
  startLng,
  destLat,
  destLng,
  destName,
  hazardLat,
  hazardLng,
  hazardRadiusKm,
  hazardName,
  routeCoordinates,
}: SafeRouteMapLeafletProps) {
  const center: [number, number] = [(startLat + destLat) / 2, (startLng + destLng) / 2];

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
        style={{ background: '#050505' }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapBoundsController coordinates={routeCoordinates} />

        {/* Hazard Danger Zone Buffer */}
        <Circle
          center={[hazardLat, hazardLng]}
          radius={hazardRadiusKm * 1000}
          pathOptions={{
            color: '#FF5252',
            fillColor: '#FF5252',
            fillOpacity: 0.15,
            weight: 2,
            dashArray: '6, 6',
          }}
        >
          <Popup>
            <div className="p-2 text-xs font-mono bg-[#0b0b0b] text-white">
              <span className="text-red-400 font-bold block">DANGER PERIMETER</span>
              <span>{hazardName} ({hazardRadiusKm}km Buffer)</span>
            </div>
          </Popup>
        </Circle>

        {/* Start Position Marker */}
        <Marker position={[startLat, startLng]} icon={createPinIcon('#C6FF00', 'START')}>
          <Popup>
            <div className="p-2 text-xs font-mono bg-[#0b0b0b] text-white">
              <span className="text-[#C6FF00] font-bold block">ORIGIN</span>
              <span>Your Location</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination Shelter Marker */}
        <Marker position={[destLat, destLng]} icon={createPinIcon('#00E676', 'SHELTER')}>
          <Popup>
            <div className="p-2 text-xs font-mono bg-[#0b0b0b] text-white">
              <span className="text-[#00E676] font-bold block">DESTINATION</span>
              <span>{destName}</span>
            </div>
          </Popup>
        </Marker>

        {/* Safe Evacuation Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: '#C6FF00',
              weight: 4,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}
      </MapContainer>

      {/* Safety Clearance Badge */}
      <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md border border-[#00E676]/40 px-3 py-1.5 rounded-lg text-xs font-mono text-[#00E676] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
        <span>HAZARD AVOIDANCE ROUTE ACTIVE</span>
      </div>
    </div>
  );
}
