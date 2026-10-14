'use client';

import React from 'react';
import BackgroundCanvas from '@/components/layout/BackgroundCanvas';
import FixedVerticalNav from '@/components/navigation/FixedVerticalNav';
import MobileNav from '@/components/navigation/MobileNav';
import ScrollToTop from '@/components/navigation/ScrollToTop';
import HeroSection from '@/components/hero/HeroSection';
import WhySafeSphereGrid from '@/components/features/WhySafeSphereGrid';
import Footer from '@/components/layout/Footer';
import LiveDisasterMap from '@/components/map/LiveDisasterMap';
import { 
  Map, 
  Activity, 
  Navigation, 
  Building2, 
  WifiOff, 
  Volume2, 
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="relative min-h-screen text-white bg-black selection:bg-[#C6FF00] selection:text-black pb-20 xl:pb-0">
      {/* Visual Canvas: Glowing blobs, dotted grids, corner swirls */}
      <BackgroundCanvas />

      {/* Navigation Systems */}
      <FixedVerticalNav />
      <MobileNav />
      <ScrollToTop />

      {/* Main Flow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1: Hero */}
        <HeroSection activeEventsCount={14} />

        {/* Section 2: Why SafeSphere Grid */}
        <WhySafeSphereGrid />

        {/* Section 3: Live Disaster Map */}
        <section id="disaster-map" className="py-20 border-t border-white/5 scroll-mt-12">
          <div className="mb-8">
            <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
              //: live disaster map
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white">
              planetary hazard <span className="text-[#C6FF00] font-semibold">radar</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              NASA EONET telemetry and USGS real-time seismic feeds with instant buffer perimeter detection.
            </p>
          </div>

          <LiveDisasterMap />
        </section>

        {/* Section 4: Risk Forecast Anchor */}
        <section id="risk-forecast" className="py-20 border-t border-white/5 scroll-mt-12">
          <div className="mb-8">
            <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
              //: risk forecast
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white">
              predictive <span className="text-[#00E676] font-semibold">severity index</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Open-Meteo 24–72h atmospheric forecasting fused with Claude AI plain-language reasoning.
            </p>
          </div>

          <div className="supernatural-card p-8 border border-white/10 rounded-2xl min-h-[300px] flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center mb-4">
              <Activity className="w-7 h-7 text-[#00E676]" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">AI Risk Prediction Module (Step 6)</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Formula: w1×rainfall + w2×wind + w3×proximity + w4×seismic magnitude
            </p>
          </div>
        </section>

        {/* Section 5: Safe Routes & Shelters Anchor */}
        <section id="routes-shelters" className="py-20 border-t border-white/5 scroll-mt-12">
          <div className="mb-8">
            <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
              //: safe routes and shelters
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white">
              evacuation & <span className="text-[#C6FF00] font-semibold">life safety</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Automated pathfinding avoiding active disaster buffer perimeters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="supernatural-card p-6 border border-white/10">
              <span className="text-2xl font-light text-[#C6FF00] font-mono">01</span>
              <h4 className="text-base font-semibold text-white mt-2">Safe Route</h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono">OSRM path avoiding 5km hazard perimeters</p>
            </div>
            <div id="shelters" className="supernatural-card p-6 border border-white/10">
              <span className="text-2xl font-light text-[#00E676] font-mono">02</span>
              <h4 className="text-base font-semibold text-white mt-2">Shelters</h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono">OpenStreetMap Overpass emergency assembly camps</p>
            </div>
            <div className="supernatural-card p-6 border border-white/10">
              <span className="text-2xl font-light text-white font-mono">03</span>
              <h4 className="text-base font-semibold text-white mt-2">Hospitals</h4>
              <p className="text-xs text-zinc-400 mt-1 font-mono">Live trauma centers sorted by straight-line distance</p>
            </div>
          </div>
        </section>

        {/* Section 6: Voice Alerts Anchor */}
        <section id="voice-alerts" className="py-20 border-t border-white/5 scroll-mt-12">
          <div className="mb-8">
            <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
              //: speak your language
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white">
              multilingual <span className="text-[#00E676] font-semibold">voice broadcast</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Synthesized voice delivery in English, Tamil, and Hindi.
            </p>
          </div>

          <div className="supernatural-card p-8 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Volume2 className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Multilingual Voice Alerts (Step 8)</h3>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-300">English</span>
              <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-300">தமிழ் (Tamil)</span>
              <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs text-zinc-300">हिन्दी (Hindi)</span>
            </div>
          </div>
        </section>

        {/* Section 7: Offline Mode Anchor */}
        <section id="offline-mode" className="py-20 border-t border-white/5 scroll-mt-12">
          <div className="mb-8">
            <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
              //: offline mode
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white">
              zero-grid <span className="text-[#C6FF00] font-semibold">resilience</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              PWA service worker, cached tiles, saved alerts, and SMS fallback.
            </p>
          </div>

          <div className="supernatural-card p-8 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-800/60 border border-white/10 flex items-center justify-center mb-4">
              <WifiOff className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Offline Emergency PWA (Step 9)</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Full offline capability with local cache & SMS transmission
            </p>
          </div>
        </section>

        {/* Section 8: Emergency SOS Anchor */}
        <section id="sos-section" className="py-24 border-t border-white/5 scroll-mt-12 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <span className="text-xs font-mono text-red-500 tracking-widest uppercase block">
              //: emergency distress signal
            </span>
            <h2 className="text-4xl sm:text-5xl font-light text-white">
              one-tap <span className="text-red-500 font-semibold">rescue beacon</span>
            </h2>
            <p className="text-sm text-zinc-400">
              Immediate dispatch of GPS coordinates via Supabase, WhatsApp and SMS protocols.
            </p>

            <div className="pt-4 flex justify-center">
              <button 
                className="w-40 h-40 rounded-full bg-gradient-to-br from-red-600 via-[#C6FF00] to-[#00E676] text-black font-black text-lg uppercase tracking-wider flex flex-col items-center justify-center gap-2 shadow-[0_0_50px_rgba(239,68,68,0.4)] sos-pulse-ring cursor-pointer hover:scale-105 transition-transform"
                aria-label="One-tap Emergency SOS"
              >
                <AlertTriangle className="w-8 h-8 text-black fill-black" />
                <span>SOS NOW</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
