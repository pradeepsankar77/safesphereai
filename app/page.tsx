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
import RiskForecastSection from '@/components/risk/RiskForecastSection';
import MLRiskAssessmentPanel from '@/components/risk/MLRiskAssessmentPanel';
import SafeRoutesAndShelters from '@/components/shelters/SafeRoutesAndShelters';
import VoiceAlertsSection from '@/components/voice/VoiceAlertsSection';
import OfflineStatusCard from '@/components/offline/OfflineStatusCard';
import EmergencySOSSection from '@/components/sos/EmergencySOSSection';
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

        {/* Section 4: Risk Forecast */}
        <RiskForecastSection />

        {/* Section 4B: Machine Learning Risk Assessment */}
        <MLRiskAssessmentPanel />

        {/* Section 5: Safe Routes & Shelters Anchor */}
        {/* Section 5: Safe Routes & Shelters */}
        <section id="routes-shelters" className="py-20 border-t border-white/5 scroll-mt-12">
          <div className="mb-8">
            <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
              //: safe routes and shelters
            </span>
            <h2 className="text-3xl sm:text-4xl font-light text-white">
              evacuation & <span className="text-[#C6FF00] font-semibold">life safety</span>
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Automated pathfinding avoiding active disaster buffer perimeters, live Overpass shelter camps, and trauma centers.
            </p>
          </div>

          <SafeRoutesAndShelters />
        </section>

        {/* Section 6: Multilingual Voice Alerts */}
        <VoiceAlertsSection />

        {/* Section 7: Offline Emergency Mode */}
        <OfflineStatusCard />

        {/* Section 8: Emergency SOS */}
        <EmergencySOSSection />
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
