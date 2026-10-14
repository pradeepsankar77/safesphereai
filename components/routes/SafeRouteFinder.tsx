'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Navigation, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Compass, 
  AlertTriangle, 
  ChevronRight,
  RefreshCw,
  Building2,
  ExternalLink
} from 'lucide-react';

const SafeRouteMapLeaflet = dynamic(() => import('./SafeRouteMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-[#0b0b0b] border border-white/10 flex flex-col items-center justify-center text-zinc-500 font-mono gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#C6FF00] border-t-transparent animate-spin" />
      <span className="text-xs tracking-wider">//: COMPUTING SAFE EVACUATION VECTORS...</span>
    </div>
  ),
});

export default function SafeRouteFinder() {
  const [startCoords, setStartCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 });
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHazard, setSelectedHazard] = useState({
    name: 'Coastal Storm Surge & Inundation',
    lat: 13.1050,
    lng: 80.2550,
    radiusKm: 5,
  });

  const calculateRoute = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startLat: lat,
          startLng: lng,
          hazardLat: selectedHazard.lat,
          hazardLng: selectedHazard.lng,
          hazardRadiusKm: selectedHazard.radiusKm,
          hazardName: selectedHazard.name,
          destName: 'District Emergency Operations Center & Shelter',
        }),
      });

      const data = await res.json();
      if (data && data.success) {
        setRouteData(data);
      }
    } catch (err) {
      console.error('Failed to calculate evacuation route:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseGPS = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setStartCoords(newCoords);
          calculateRoute(newCoords.lat, newCoords.lng);
        },
        () => {
          calculateRoute(startCoords.lat, startCoords.lng);
        }
      );
    } else {
      calculateRoute(startCoords.lat, startCoords.lng);
    }
  };

  useEffect(() => {
    calculateRoute(startCoords.lat, startCoords.lng);
  }, [selectedHazard]);

  return (
    <div className="w-full space-y-6">
      {/* Route Parameters Bar */}
      <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <button
            onClick={handleUseGPS}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C6FF00] text-black font-semibold hover:brightness-110 transition-all cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>ACQUIRE GPS START</span>
          </button>

          <span className="text-zinc-500 hidden sm:inline">|</span>

          <span className="text-zinc-400">
            ORIGIN: <strong className="text-white">{startCoords.lat.toFixed(3)}°N, {startCoords.lng.toFixed(3)}°E</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500">AVOID:</span>
          <select
            value={selectedHazard.name}
            onChange={(e) => {
              if (e.target.value.includes('Coastal')) {
                setSelectedHazard({ name: 'Coastal Storm Surge & Inundation', lat: 13.1050, lng: 80.2550, radiusKm: 5 });
              } else if (e.target.value.includes('Tremor')) {
                setSelectedHazard({ name: 'Structural Fault Hazard Zone', lat: 13.0900, lng: 80.2600, radiusKm: 4 });
              } else {
                setSelectedHazard({ name: 'River Basin Flash Inundation', lat: 13.1150, lng: 80.2450, radiusKm: 6 });
              }
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-[#C6FF00]"
          >
            <option value="Coastal Storm Surge & Inundation">Coastal Storm Surge (5km Buffer)</option>
            <option value="Structural Fault Hazard Zone">Structural Fault Zone (4km Buffer)</option>
            <option value="River Basin Flash Inundation">River Basin Flash Flood (6km Buffer)</option>
          </select>
        </div>
      </div>

      {/* Metrics Header */}
      {routeData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/10">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">//: TOTAL DISTANCE</div>
            <div className="text-2xl font-light font-mono text-white mt-1">
              {routeData.summary.distanceKm} <span className="text-xs text-zinc-500">km</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/10">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">//: ESTIMATED TRANSIT</div>
            <div className="text-2xl font-light font-mono text-[#00E676] mt-1">
              ~{routeData.summary.durationMinutes} <span className="text-xs text-zinc-500">mins</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/10">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">//: SAFETY CLEARANCE</div>
            <div className="text-2xl font-light font-mono text-[#C6FF00] mt-1">
              {routeData.summary.safetyClearanceKm} <span className="text-xs text-zinc-500">km</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/60 border border-white/10">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">//: HAZARD STATUS</div>
            <div className="text-sm font-bold font-mono text-[#00E676] mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00E676]" />
              <span>BYPASS CONFIRMED</span>
            </div>
          </div>
        </div>
      )}

      {/* Route Map */}
      {routeData && (
        <SafeRouteMapLeaflet
          startLat={routeData.startLocation.latitude}
          startLng={routeData.startLocation.longitude}
          destLat={routeData.destination.latitude}
          destLng={routeData.destination.longitude}
          destName={routeData.destination.name}
          hazardLat={routeData.hazardZone.latitude}
          hazardLng={routeData.hazardZone.longitude}
          hazardRadiusKm={routeData.hazardZone.radiusKm}
          hazardName={routeData.hazardZone.name}
          routeCoordinates={routeData.coordinates}
        />
      )}

      {/* Turn-by-Turn Navigation Steps */}
      {routeData && routeData.steps && (
        <div className="supernatural-card p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 text-xs font-mono text-zinc-400">
            <span className="text-[#C6FF00] font-bold">//: TURN-BY-TURN EVACUATION VECTORS</span>
            <span>OSRM DYNAMIC ENGINE</span>
          </div>

          <div className="space-y-2">
            {routeData.steps.map((step: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-xs text-zinc-300 font-mono">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] text-[#C6FF00] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
