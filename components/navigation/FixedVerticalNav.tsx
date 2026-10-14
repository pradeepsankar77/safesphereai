'use client';

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Map, 
  Activity, 
  Cpu,
  Navigation, 
  Building2, 
  WifiOff, 
  Volume2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'hero', label: 'Home', icon: Home },
  { id: 'disaster-map', label: 'Live Map', icon: Map },
  { id: 'risk-forecast', label: 'Risk Prediction', icon: Activity },
  { id: 'ml-risk', label: 'ML Classifier', icon: Cpu },
  { id: 'routes-shelters', label: 'Safe Routes', icon: Navigation },
  { id: 'shelters', label: 'Shelters', icon: Building2 },
  { id: 'offline-mode', label: 'Offline Mode', icon: WifiOff },
  { id: 'voice-alerts', label: 'Voice Alerts', icon: Volume2 },
  { id: 'sos-section', label: 'SOS', icon: AlertTriangle },
];

export default function FixedVerticalNav() {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      aria-label="Section Navigation"
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 p-3 bg-[#0b0b0b]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl"
    >
      {/* Top Action: Gradient SOS NOW Button */}
      <button
        onClick={() => scrollTo('sos-section')}
        className="w-full px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-[#C6FF00] to-[#00E676] hover:brightness-110 shadow-lg shadow-[#C6FF00]/20 transition-all flex items-center justify-center gap-1.5 sos-pulse-ring"
        aria-label="Trigger Emergency SOS"
      >
        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
        SOS NOW
      </button>

      <div className="w-full h-px bg-white/10 my-1" />

      {/* Navigation Icons & Links */}
      <div className="flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive 
                  ? 'bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/40' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
              title={item.label}
              aria-label={`Navigate to ${item.label}`}
              aria-current={isActive ? 'true' : undefined}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#C6FF00]' : ''}`} />
              <span className="truncate max-w-[110px] text-left">{item.label}</span>

              {/* Active Dot */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] ml-auto shadow-[0_0_8px_#00E676]" />
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full h-px bg-white/10 my-1" />

      {/* Bottom Action: Outlined CHECK MY RISK Button */}
      <button
        onClick={() => scrollTo('risk-forecast')}
        className="w-full px-3 py-2 rounded-xl text-[11px] font-semibold text-zinc-300 hover:text-[#C6FF00] border border-white/20 hover:border-[#C6FF00] transition-all flex items-center justify-center gap-1 group bg-black/40"
      >
        <span>CHECK RISK</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-[#C6FF00]" />
      </button>
    </nav>
  );
}
