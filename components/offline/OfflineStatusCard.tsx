'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Layers, 
  ShieldCheck, 
  RefreshCw, 
  MessageSquare, 
  AlertTriangle,
  Building2,
  MapPin,
  Clock,
  Radio
} from 'lucide-react';
import { offlineCacheService, CachedDataSummary } from '@/services/offlineCacheService';

export default function OfflineStatusCard() {
  const [mounted, setMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [cacheStats, setCacheStats] = useState<CachedDataSummary>({
    alertsCount: 0,
    sheltersCount: 0,
    lastLocation: { lat: 13.0827, lng: 80.2707 },
    lastSynced: 'Synchronizing...',
  });
  const [cachedAlerts, setCachedAlerts] = useState<any[]>([]);
  const [cachedShelters, setCachedShelters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'status' | 'cached-alerts' | 'cached-shelters'>('status');

  useEffect(() => {
    setMounted(true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Populate seed cache if empty
      const summary = offlineCacheService.getCacheSummary();
      if (summary.alertsCount === 0) {
        offlineCacheService.saveAlerts([
          { id: 'off-1', title: 'Severe Coastal Storm Remal', category: 'cyclone', severity: 'critical', lat: 21.8, lng: 89.2 },
          { id: 'off-2', title: 'Brahmaputra Flood Basin Alert', category: 'flood', severity: 'high', lat: 26.2, lng: 92.9 },
          { id: 'off-3', title: 'M 5.8 Northern Seismic Cluster', category: 'earthquake', severity: 'high', lat: 36.4, lng: 70.8 },
        ]);
        offlineCacheService.saveShelters([
          { id: 'shel-1', name: 'District Emergency Operations Center & Shelter', distanceKm: 2.4, phone: '1077', capacity: 600 },
          { id: 'shel-2', name: 'Apex Multi-Specialty Trauma Hospital', distanceKm: 3.8, phone: '108', capacity: 350 },
          { id: 'shel-3', name: 'Red Cross Emergency Relief Staging Camp', distanceKm: 5.1, phone: '1070', capacity: 800 },
        ]);
        offlineCacheService.saveLocation({ lat: 13.0827, lng: 80.2707 });
      }
      setCacheStats(offlineCacheService.getCacheSummary());
      setCachedAlerts(offlineCacheService.getAlerts());
      setCachedShelters(offlineCacheService.getShelters());
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const effectiveOnline = isOnline && !simulateOffline;
  const lastLocation = cacheStats.lastLocation || { lat: 13.0827, lng: 80.2707 };

  const smsFallbackHref = `sms:112?body=${encodeURIComponent(
    `OFFLINE EMERGENCY SOS: I am offline and in danger. Last known coordinates: ${lastLocation.lat.toFixed(6)}, ${lastLocation.lng.toFixed(6)}. Immediate response required.`
  )}`;

  return (
    <section id="offline-mode" className="py-20 border-t border-white/5 scroll-mt-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
            //: offline mode
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-white">
            zero-grid <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#C6FF00] to-[#00E676]">resilience</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-2 font-normal max-w-xl">
            PWA service worker, precached map tile boundaries, stored disaster telemetry, and automatic SMS fallback for degraded cellular grids.
          </p>
        </div>

        {/* Demo Simulator Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-950 border border-white/10 text-xs font-mono">
          <span className="text-zinc-500 pl-2">SIMULATE AIRPLANE MODE:</span>
          <button
            onClick={() => setSimulateOffline(!simulateOffline)}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              simulateOffline
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {simulateOffline ? 'SIMULATING OFFLINE' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Network & Cache Health Card (5 cols) */}
        <div className="lg:col-span-5 supernatural-card p-6 sm:p-8 space-y-6">
          {/* Live Network State Badge */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="text-xs font-mono text-zinc-400 uppercase">//: NETWORK INTEGRITY</span>

            {effectiveOnline ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/40 text-[#00E676] text-xs font-mono font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]"></span>
                </span>
                <span>ONLINE (CONNECTED)</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>OFFLINE EMERGENCY MODE</span>
              </div>
            )}
          </div>

          {/* Cache Metrics Breakdown */}
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-400">
                <Radio className="w-4 h-4 text-[#C6FF00]" />
                Cached Disaster Alerts:
              </span>
              <span suppressHydrationWarning className="text-white font-bold">{mounted ? cacheStats.alertsCount : 3} events</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-400">
                <Building2 className="w-4 h-4 text-[#00E676]" />
                Cached Relief Shelters:
              </span>
              <span suppressHydrationWarning className="text-white font-bold">{mounted ? cacheStats.sheltersCount : 3} facilities</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-400">
                <Layers className="w-4 h-4 text-cyan-400" />
                Precached Map Tiles:
              </span>
              <span className="text-white font-bold">Local Radius (25km)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-400">
                <Clock className="w-4 h-4 text-zinc-400" />
                Last Cache Snapshot:
              </span>
              <span suppressHydrationWarning className="text-zinc-300">{mounted ? cacheStats.lastSynced : 'Local Cache Active'}</span>
            </div>
          </div>

          {/* Offline SMS Direct Fallback CTA */}
          <div className="pt-2">
            <a
              href={smsFallbackHref}
              className="w-full py-3.5 px-4 rounded-xl btn-primary-gradient text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 text-black cursor-pointer shadow-lg shadow-[#C6FF00]/20"
            >
              <MessageSquare className="w-4 h-4 text-black" />
              <span>SEND PRE-FILLED OFFLINE SMS (112)</span>
            </a>
            <p className="text-[11px] font-mono text-zinc-500 text-center mt-2">
              Works with zero mobile data. Dispatches encoded GPS coordinates via native SMS.
            </p>
          </div>
        </div>

        {/* Right Column: Cached Data Explorer (7 cols) */}
        <div className="lg:col-span-7 supernatural-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-white">
              <HardDrive className="w-4 h-4 text-[#C6FF00]" />
              <span className="font-bold">//: LOCALLY STORED OFFLINE REGISTRY</span>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1.5 text-xs font-mono">
              <button
                onClick={() => setActiveTab('status')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'status'
                    ? 'bg-[#C6FF00] text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Snapshot
              </button>
              <button
                onClick={() => setActiveTab('cached-alerts')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'cached-alerts'
                    ? 'bg-[#C6FF00] text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Alerts (<span suppressHydrationWarning>{mounted ? cachedAlerts.length : 0}</span>)
              </button>
              <button
                onClick={() => setActiveTab('cached-shelters')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'cached-shelters'
                    ? 'bg-[#C6FF00] text-black font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Shelters (<span suppressHydrationWarning>{mounted ? cachedShelters.length : 0}</span>)
              </button>
            </div>
          </div>

          {/* Tab 1: Snapshot overview */}
          {activeTab === 'status' && (
            <div className="space-y-4 py-2 font-mono text-xs">
              <p className="text-zinc-300 leading-relaxed font-sans text-sm">
                When network infrastructure is compromised during severe cyclones or floods, SafeSphere AI transitions to client-side offline execution:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1">
                  <span className="text-[#00E676] font-bold block">01. Service Worker Cache</span>
                  <span className="text-zinc-400 text-[11px] leading-snug block">
                    Full UI assets, Leaflet CSS and dark map tiles served from local CacheStorage.
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1">
                  <span className="text-[#C6FF00] font-bold block">02. Saved Shelter Registry</span>
                  <span className="text-zinc-400 text-[11px] leading-snug block">
                    Nearest relief assembly camps cached from the last active session with offline directions.
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1">
                  <span className="text-cyan-400 font-bold block">03. Last Known Telemetry</span>
                  <span className="text-zinc-400 text-[11px] leading-snug block">
                    Coordinates {lastLocation.lat.toFixed(4)}°N, {lastLocation.lng.toFixed(4)}°E stored in localStorage.
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-black/60 border border-white/5 space-y-1">
                  <span className="text-red-400 font-bold block">04. Cellular SMS Fallback</span>
                  <span className="text-zinc-400 text-[11px] leading-snug block">
                    Pre-formatted emergency SMS ready to transmit via GSM towers without data packets.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Cached alerts list */}
          {activeTab === 'cached-alerts' && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {cachedAlerts.map((a: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#C6FF00] uppercase block">{a.category}</span>
                    <span className="text-white font-medium">{a.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase px-2 py-0.5 rounded bg-zinc-900 border border-white/5">
                    {a.severity || 'HIGH'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Cached shelters list */}
          {activeTab === 'cached-shelters' && (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {cachedShelters.map((s: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#00E676] uppercase block">CAPACITY: {s.capacity || 500}</span>
                    <span className="text-white font-medium">{s.name}</span>
                  </div>
                  <span className="text-[#C6FF00] font-bold">
                    {s.distanceKm || 3.2} km
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
