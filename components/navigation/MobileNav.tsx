'use client';

import React, { useState } from 'react';
import { 
  Map, 
  Activity, 
  Cpu,
  Navigation, 
  AlertTriangle, 
  Menu, 
  X, 
  Home, 
  Building2, 
  WifiOff, 
  Volume2 
} from 'lucide-react';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 xl:hidden"
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div 
        className={`fixed bottom-16 right-0 left-0 bg-[#0b0b0b] border-t border-white/10 p-5 rounded-t-3xl z-50 xl:hidden transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
          <span className="text-xs font-mono text-[#C6FF00] tracking-wider">//: NAVIGATION</span>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 text-zinc-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button 
            onClick={() => scrollTo('hero')} 
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/5"
          >
            <Home className="w-4 h-4 text-[#C6FF00]" /> Home
          </button>
          <button 
            onClick={() => scrollTo('disaster-map')} 
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/5"
          >
            <Map className="w-4 h-4 text-[#00E676]" /> Live Map
          </button>
          <button 
            onClick={() => scrollTo('risk-forecast')} 
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/5"
          >
            <Activity className="w-4 h-4 text-amber-400" /> Risk Forecast
          </button>
          <button 
            onClick={() => scrollTo('ml-risk')} 
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/5"
          >
            <Cpu className="w-4 h-4 text-[#C6FF00]" /> ML Classifier
          </button>
          <button 
            onClick={() => scrollTo('routes-shelters')} 
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/5"
          >
            <Navigation className="w-4 h-4 text-[#C6FF00]" /> Safe Routes
          </button>
          <button 
            onClick={() => scrollTo('shelters')} 
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/5"
          >
            <Building2 className="w-4 h-4 text-emerald-400" /> Shelters & Hospitals
          </button>
          <button 
            onClick={() => scrollTo('offline-mode')} 
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/5"
          >
            <WifiOff className="w-4 h-4 text-zinc-400" /> Offline Mode
          </button>
          <button 
            onClick={() => scrollTo('voice-alerts')} 
            className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 hover:text-white border border-white/5 col-span-2"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" /> Voice Alerts (Tamil / Hindi / English)
          </button>
        </div>
      </div>

      {/* Bottom Sticky Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0b0b0b]/95 backdrop-blur-md border-t border-white/10 z-40 px-4 flex items-center justify-between xl:hidden">
        <button 
          onClick={() => scrollTo('hero')} 
          className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#C6FF00] text-[10px]"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button 
          onClick={() => scrollTo('disaster-map')} 
          className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#C6FF00] text-[10px]"
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span>Map</span>
        </button>

        {/* Center Floating SOS Action */}
        <button 
          onClick={() => scrollTo('sos-section')} 
          className="relative -top-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-[#C6FF00] to-[#00E676] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-500/30 sos-pulse-ring"
        >
          <AlertTriangle className="w-4 h-4 text-black fill-black" />
          <span>SOS</span>
        </button>

        <button 
          onClick={() => scrollTo('risk-forecast')} 
          className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#C6FF00] text-[10px]"
        >
          <Activity className="w-5 h-5 mb-0.5" />
          <span>Risk</span>
        </button>

        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex flex-col items-center justify-center text-zinc-400 hover:text-[#C6FF00] text-[10px]"
          aria-label="Toggle full navigation drawer"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </div>
    </>
  );
}
