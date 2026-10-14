'use client';

import React from 'react';
import { 
  Map, 
  Activity, 
  Navigation, 
  Building2, 
  WifiOff, 
  Volume2, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

interface FeatureItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const features: FeatureItem[] = [
  {
    id: 'disaster-map',
    tag: '//: 01. real-time sensing',
    title: 'Live Disaster Map',
    description: 'Direct ingestion of NASA EONET and USGS earthquake telemetry. Sub-second geospatial filtering across floods, cyclones, tremors, and wildfires.',
    icon: Map,
    accentColor: '#C6FF00',
  },
  {
    id: 'risk-forecast',
    tag: '//: 02. predictive scoring',
    title: 'AI Risk Prediction',
    description: '24-72h forecast-based severity index fusing Open-Meteo precipitation, wind gusts, seismic magnitude, and Claude AI natural-language diagnostics.',
    icon: Activity,
    accentColor: '#00E676',
  },
  {
    id: 'routes-shelters',
    tag: '//: 03. hazard avoidance',
    title: 'Safe Route Finder',
    description: 'Dynamic evacuation routing powered by OSRM that strictly routes around active 5km disaster hazard perimeter buffer polygons.',
    icon: Navigation,
    accentColor: '#C6FF00',
  },
  {
    id: 'shelters',
    tag: '//: 04. emergency infrastructure',
    title: 'Nearest Shelter & Hospital Finder',
    description: 'Live OpenStreetMap Overpass discovery of operational relief camps, emergency assembly points, and trauma centers with real-time distance sorting.',
    icon: Building2,
    accentColor: '#00E676',
  },
  {
    id: 'offline-mode',
    tag: '//: 05. zero-connectivity resilience',
    title: 'Offline Emergency Mode',
    description: 'Progressive Web App service worker caching map tiles, last known alerts, and offline shelter registries with automatic native SMS fallback.',
    icon: WifiOff,
    accentColor: '#C6FF00',
  },
  {
    id: 'voice-alerts',
    tag: '//: 06. localized broadcast',
    title: 'Multilingual Voice Alerts',
    description: 'Instant translation and synthetic voice delivery in English, Tamil, and Hindi via Web Speech API with readable high-contrast transcript fallbacks.',
    icon: Volume2,
    accentColor: '#00E676',
  },
  {
    id: 'sos-section',
    tag: '//: 07. distress beacon',
    title: 'Emergency SOS Signal',
    description: 'One-tap satellite/cellular distress beacon dispatching precise GPS coordinates, battery status, and instant WhatsApp & SMS rescue coordinates.',
    icon: AlertTriangle,
    accentColor: '#FF5252',
  },
];

export default function WhySafeSphereGrid() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="why-safesphere" className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="mb-14">
        <div className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase mb-2">
          //: core capabilities
        </div>
        <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight">
          why <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#C6FF00] to-[#00E676]">safesphere</span>?
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-3 font-normal">
          Designed from the ground up for high-stakes crisis response where every millisecond and every percent of battery counts.
        </p>
      </div>

      {/* 3x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              onClick={() => scrollTo(feature.id)}
              className="supernatural-card p-6 sm:p-7 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Top Row: Glowing Icon + Action Link */}
                <div className="flex items-center justify-between mb-6">
                  <div 
                    className="w-12 h-12 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"
                    style={{
                      boxShadow: `0 0 20px -5px ${feature.accentColor}33`,
                    }}
                  >
                    <Icon className="w-5 h-5 text-white group-hover:text-[#C6FF00] transition-colors" />
                  </div>

                  <span className="text-zinc-500 group-hover:text-[#C6FF00] transition-colors">
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>

                {/* Subtitle tag */}
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">
                  {feature.tag}
                </span>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white group-hover:text-[#C6FF00] transition-colors mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Decorative Indicator */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>STATUS: OPERATIONAL</span>
                <span className="text-[#00E676] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                  ACTIVE
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
