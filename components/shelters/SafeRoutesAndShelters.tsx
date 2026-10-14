'use client';

import React, { useState } from 'react';
import { Navigation, Building2, Hospital, ArrowRight, ShieldCheck, ChevronDown } from 'lucide-react';
import ShelterFinder from './ShelterFinder';
import SafeRouteFinder from '../routes/SafeRouteFinder';

export default function SafeRoutesAndShelters() {
  const [activePanel, setActivePanel] = useState<'01' | '02' | '03'>('02');

  return (
    <div className="w-full space-y-8">
      {/* Numbered Horizontal Selector Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 01: Safe Route */}
        <div
          onClick={() => setActivePanel('01')}
          className={`supernatural-card p-6 border transition-all cursor-pointer flex flex-col justify-between ${
            activePanel === '01'
              ? 'border-[#C6FF00] bg-zinc-950/90 shadow-[0_0_25px_rgba(198,255,0,0.15)] ring-1 ring-[#C6FF00]/40'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-light font-mono text-[#C6FF00]">01</span>
              <div className="w-8 h-8 rounded-lg bg-[#C6FF00]/10 flex items-center justify-center text-[#C6FF00]">
                <Navigation className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Safe Route</h3>
            <p className="text-xs text-zinc-400 font-mono">
              OSRM path calculation avoiding active hazard perimeter buffers.
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#C6FF00]">
            <span className="flex items-center gap-1">
              learn more <ArrowRight className="w-3.5 h-3.5" />
            </span>
            {activePanel === '01' && <span className="w-2 h-2 rounded-full bg-[#C6FF00]" />}
          </div>
        </div>

        {/* Panel 02: Shelters */}
        <div
          onClick={() => setActivePanel('02')}
          className={`supernatural-card p-6 border transition-all cursor-pointer flex flex-col justify-between ${
            activePanel === '02'
              ? 'border-[#00E676] bg-zinc-950/90 shadow-[0_0_25px_rgba(0,230,118,0.15)] ring-1 ring-[#00E676]/40'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-light font-mono text-[#00E676]">02</span>
              <div className="w-8 h-8 rounded-lg bg-[#00E676]/10 flex items-center justify-center text-[#00E676]">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Shelters</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Overpass API emergency assembly points & relief hubs.
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#00E676]">
            <span className="flex items-center gap-1">
              learn more <ArrowRight className="w-3.5 h-3.5" />
            </span>
            {activePanel === '02' && <span className="w-2 h-2 rounded-full bg-[#00E676]" />}
          </div>
        </div>

        {/* Panel 03: Hospitals */}
        <div
          onClick={() => setActivePanel('03')}
          className={`supernatural-card p-6 border transition-all cursor-pointer flex flex-col justify-between ${
            activePanel === '03'
              ? 'border-cyan-400 bg-zinc-950/90 shadow-[0_0_25px_rgba(0,229,255,0.15)] ring-1 ring-cyan-400/40'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-light font-mono text-cyan-400">03</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                <Hospital className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Hospitals</h3>
            <p className="text-xs text-zinc-400 font-mono">
              Trauma centers & medical emergency units with real-time distance.
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-cyan-400">
            <span className="flex items-center gap-1">
              learn more <ArrowRight className="w-3.5 h-3.5" />
            </span>
            {activePanel === '03' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
          </div>
        </div>
      </div>

      {/* Expanded Interactive Viewer Tray */}
      <div className="w-full pt-2">
        {activePanel === '01' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-sm font-mono text-[#C6FF00] uppercase">
                //: HAZARD-AVOIDANCE EVACUATION ROUTE (OSRM)
              </h4>
            </div>
            <SafeRouteFinder />
          </div>
        )}

        {activePanel === '02' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-sm font-mono text-[#00E676] uppercase">
                //: OPERATIONAL EMERGENCY ASSEMBLY SHELTERS
              </h4>
            </div>
            <ShelterFinder initialType="shelter" />
          </div>
        )}

        {activePanel === '03' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-sm font-mono text-cyan-400 uppercase">
                //: EMERGENCY HOSPITALS & TRAUMA WARDS
              </h4>
            </div>
            <ShelterFinder initialType="hospital" />
          </div>
        )}
      </div>
    </div>
  );
}
