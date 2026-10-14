'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Hospital, 
  MapPin, 
  Phone, 
  Navigation2, 
  Compass, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Users
} from 'lucide-react';
import { ShelterItem } from '@/app/api/shelters/route';

interface ShelterFinderProps {
  initialType?: 'all' | 'shelter' | 'hospital';
}

export default function ShelterFinder({ initialType = 'all' }: ShelterFinderProps) {
  const [type, setType] = useState<'all' | 'shelter' | 'hospital'>(initialType);
  const [shelters, setShelters] = useState<ShelterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Detect live GPS location
  const detectLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserCoords(coords);
          setLocationError(null);
          fetchShelters(coords.lat, coords.lng);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using regional default:', err.message);
          setLocationError('Using regional disaster telemetry center');
          // Default regional center
          const defaultCoords = { lat: 13.0827, lng: 80.2707 };
          setUserCoords(defaultCoords);
          fetchShelters(defaultCoords.lat, defaultCoords.lng);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      const defaultCoords = { lat: 13.0827, lng: 80.2707 };
      setUserCoords(defaultCoords);
      fetchShelters(defaultCoords.lat, defaultCoords.lng);
    }
  };

  const fetchShelters = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/shelters?lat=${lat}&lng=${lng}&type=${type}&radius=25000`);
      const data = await res.json();
      if (data && Array.isArray(data.shelters)) {
        setShelters(data.shelters);
      }
    } catch (err) {
      console.error('Error fetching shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    detectLocation();
  }, [type]);

  return (
    <div className="w-full space-y-6">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/70 border border-white/10">
        {/* Type Toggle Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              type === 'all'
                ? 'bg-[#C6FF00] text-black font-semibold'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            ALL SITES
          </button>
          <button
            onClick={() => setType('shelter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              type === 'shelter'
                ? 'bg-[#00E676] text-black font-semibold'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>SHELTERS</span>
          </button>
          <button
            onClick={() => setType('hospital')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              type === 'hospital'
                ? 'bg-cyan-400 text-black font-semibold'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>HOSPITALS</span>
          </button>
        </div>

        {/* GPS Status & Re-detect */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Compass className="w-3.5 h-3.5 text-[#00E676] animate-pulse" />
            <span>
              {userCoords
                ? `${userCoords.lat.toFixed(3)}°N, ${userCoords.lng.toFixed(3)}°E`
                : 'ACQUIRING GPS...'}
            </span>
          </div>

          <button
            onClick={detectLocation}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-white/10 text-zinc-300 hover:text-[#C6FF00] transition-colors cursor-pointer"
            title="Recalculate closest locations"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-[#C6FF00]' : ''}`} />
            <span>REFRESH GPS</span>
          </button>
        </div>
      </div>

      {locationError && (
        <div className="text-[11px] font-mono text-zinc-500 px-2">
          * {locationError}
        </div>
      )}

      {/* Shelter & Hospital Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="supernatural-card p-5 h-36 animate-pulse bg-zinc-950/40" />
          ))}
        </div>
      ) : shelters.length === 0 ? (
        <div className="supernatural-card p-10 text-center font-mono text-xs text-zinc-400">
          //: NO OPERATIONAL FACILITIES LOCATED WITHIN SEARCH PERIMETER
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shelters.slice(0, 9).map((site) => {
            const isHospital = site.type === 'hospital';
            const occupancyPct = Math.round((site.currentOccupancy / site.capacity) * 100);

            return (
              <div
                key={site.id}
                className="supernatural-card p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Facility Type Badge + Distance Metric */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
                        isHospital
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                      }`}
                    >
                      {isHospital ? <Hospital className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      {site.type.replace('_', ' ')}
                    </span>

                    <span className="text-sm font-mono font-bold text-[#C6FF00] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C6FF00]" />
                      {site.distanceKm} km
                    </span>
                  </div>

                  {/* Title & Address */}
                  <h4 className="text-base font-semibold text-white group-hover:text-[#C6FF00] transition-colors leading-snug mb-1">
                    {site.name}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mb-4 font-normal">
                    {site.address}
                  </p>

                  {/* Capacity Bar */}
                  <div className="space-y-1 mb-4 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-500" /> Capacity
                      </span>
                      <span>
                        {site.currentOccupancy} / {site.capacity} ({occupancyPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          occupancyPct > 80
                            ? 'bg-red-500'
                            : occupancyPct > 50
                            ? 'bg-amber-400'
                            : 'bg-[#00E676]'
                        }`}
                        style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: Call + Navigate */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs">
                  <a
                    href={`tel:${site.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-colors"
                    title={`Call hotline: ${site.phone}`}
                  >
                    <Phone className="w-3.5 h-3.5 text-[#00E676]" />
                    <span className="font-mono text-[11px]">{site.phone || '108'}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${site.latitude},${site.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary-gradient px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider flex items-center gap-1 group/btn"
                  >
                    <span>DIRECTIONS</span>
                    <Navigation2 className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
