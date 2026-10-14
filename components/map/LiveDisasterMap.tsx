'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MapFilterBar from './MapFilterBar';
import AlertTicker from './AlertTicker';
import { DisasterEvent } from '@/app/api/disasters/route';
import { Radio, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

// Dynamic import with SSR disabled to prevent Leaflet window reference errors
const DisasterMapLeaflet = dynamic(() => import('./DisasterMapLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[540px] rounded-2xl bg-[#0b0b0b] border border-white/10 flex flex-col items-center justify-center text-zinc-500 font-mono gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#C6FF00] border-t-transparent animate-spin" />
      <span className="text-xs tracking-wider">//: INITIALIZING SATELLITE RADAR TILES...</span>
    </div>
  ),
});

export default function LiveDisasterMap() {
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<DisasterEvent[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<DisasterEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/disasters');
      const data = await res.json();
      if (data && Array.isArray(data.events)) {
        setEvents(data.events);
        setFilteredEvents(data.events);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to fetch disasters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  // Filter events by category
  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((e) => e.category === activeCategory));
    }
  }, [activeCategory, events]);

  const handleSelectEvent = (ev: DisasterEvent) => {
    setSelectedEvent(ev);
    // If filtered out, reset filter to 'all' or that event's category
    if (activeCategory !== 'all' && ev.category !== activeCategory) {
      setActiveCategory(ev.category);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Real-time Alert Ticker */}
      <AlertTicker 
        initialEvents={events} 
        onSelectEvent={handleSelectEvent} 
      />

      {/* Control Bar: Glass Filters + Refresh Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <MapFilterBar
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          events={events}
        />

        <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 self-end sm:self-auto">
          {lastUpdated && (
            <span className="text-[11px] text-zinc-500">
              UPDATED: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchDisasters}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh satellite telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C6FF00]' : ''}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* Leaflet Dynamic Map Component */}
      <DisasterMapLeaflet
        events={filteredEvents}
        selectedEvent={selectedEvent}
        onSelectEvent={handleSelectEvent}
      />

      {/* Selected Event Detail Tray */}
      {selectedEvent && (
        <div className="supernatural-card p-4 sm:p-5 border border-[#C6FF00]/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0b0b0b]/95 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-[#C6FF00]">
                  //: SELECTED HAZARD
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-zinc-300">
                  {selectedEvent.category.toUpperCase()} • {selectedEvent.severity.toUpperCase()}
                </span>
              </div>
              <h4 className="text-base font-semibold text-white mt-1">
                {selectedEvent.title}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                Coordinates: {selectedEvent.latitude.toFixed(4)}°N, {selectedEvent.longitude.toFixed(4)}°E • Source: {selectedEvent.source}
                {selectedEvent.description ? ` • ${selectedEvent.description}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white"
            >
              Dismiss
            </button>
            <a
              href="#routes-shelters"
              className="btn-primary-gradient px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            >
              <span>Route Around Hazard</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
