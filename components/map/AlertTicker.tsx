'use client';

import React, { useEffect, useState } from 'react';
import { Radio, AlertCircle, ChevronRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { DisasterEvent } from '@/app/api/disasters/route';

interface AlertTickerProps {
  initialEvents: DisasterEvent[];
  onSelectEvent?: (event: DisasterEvent) => void;
}

export default function AlertTicker({ initialEvents, onSelectEvent }: AlertTickerProps) {
  const [tickerItems, setTickerItems] = useState<DisasterEvent[]>(initialEvents);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setTickerItems(initialEvents);
    }
  }, [initialEvents]);

  // Subscribe to Supabase Realtime on 'alerts' table
  useEffect(() => {
    try {
      const supabase = createClient();
      const channel = supabase
        .channel('public:alerts')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'alerts' },
          (payload) => {
            const newAlert = payload.new as any;
            if (newAlert && newAlert.title) {
              const mapped: DisasterEvent = {
                id: newAlert.id,
                title: newAlert.title,
                category: newAlert.category || 'storm',
                severity: newAlert.severity || 'high',
                latitude: newAlert.latitude,
                longitude: newAlert.longitude,
                date: newAlert.created_at || new Date().toISOString(),
                source: newAlert.source || 'NASA_EONET',
                description: newAlert.description,
              };
              setTickerItems((prev) => [mapped, ...prev]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('Supabase Realtime subscription fallback mode:', e);
    }
  }, []);

  // Rotate through alerts every 6 seconds
  useEffect(() => {
    if (tickerItems.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerItems.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [tickerItems]);

  const current = tickerItems[currentIndex];
  if (!current) return null;

  const severityBadgeClass = 
    current.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
    current.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
    'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40';

  return (
    <div className="w-full bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 overflow-hidden shadow-lg">
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <span className="text-xs font-mono font-bold tracking-wider text-red-400 flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          REALTIME DISASTER FEED:
        </span>
      </div>

      {/* Active News Item */}
      <div 
        onClick={() => onSelectEvent && onSelectEvent(current)}
        className="flex-1 truncate text-xs cursor-pointer group flex items-center gap-2"
        title="Click to locate on map"
      >
        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border shrink-0 ${severityBadgeClass}`}>
          {current.severity}
        </span>
        <span className="text-zinc-200 group-hover:text-[#C6FF00] transition-colors truncate font-medium">
          {current.title}
        </span>
        <span className="text-[11px] font-mono text-zinc-500 shrink-0 hidden md:inline">
          ({current.latitude.toFixed(2)}°, {current.longitude.toFixed(2)}°) • {current.source}
        </span>
      </div>

      {/* Index indicator */}
      <div className="shrink-0 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
        <span>{currentIndex + 1} / {tickerItems.length}</span>
        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % tickerItems.length)}
          className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
          aria-label="Next alert"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
