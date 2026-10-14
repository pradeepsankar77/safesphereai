'use client';

import React, { useState } from 'react';
import { AlertTriangle, Radio, ShieldAlert, PhoneCall, MessageSquare } from 'lucide-react';
import SOSConfirmationSheet from './SOSConfirmationSheet';

interface EmergencySOSSectionProps {
  externalTrigger?: boolean;
}

export default function EmergencySOSSection({ externalTrigger }: EmergencySOSSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section id="sos-section" className="py-24 border-t border-white/5 scroll-mt-12 text-center relative overflow-hidden">
        {/* Background Red Atmospheric Flare */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none -z-10"
          aria-hidden="true" 
        />

        <div className="max-w-2xl mx-auto space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span>//: EMERGENCY DISTRESS PROTOCOL</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-light text-white tracking-tight">
            one-tap <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-[#C6FF00]">rescue beacon</span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Sends your exact GPS location, battery telemetry, and timestamp to responders via Supabase and pre-filled emergency SMS & WhatsApp.
          </p>

          {/* Large Glowing Circular SOS Button */}
          <div className="pt-6 pb-4 flex justify-center items-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-red-600 via-[#C6FF00] to-[#00E676] text-black font-black text-xl sm:text-2xl uppercase tracking-widest flex flex-col items-center justify-center gap-3 shadow-[0_0_60px_rgba(239,68,68,0.5)] sos-pulse-ring cursor-pointer hover:scale-105 active:scale-95 transition-all group"
              aria-label="Activate Emergency SOS Rescue Beacon"
            >
              <div className="w-12 h-12 rounded-full bg-black/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-7 h-7 text-black fill-black" />
              </div>
              <span className="font-mono">SOS NOW</span>
              <span className="text-[10px] font-mono tracking-normal text-black/75 uppercase">
                Tap to Transmit
              </span>
            </button>
          </div>

          {/* Quick Hotline Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400">
            <a 
              href="tel:112" 
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-red-500 text-zinc-300 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-500" />
              <span>POLICE / ALL EMERGENCY: <strong>112</strong></span>
            </a>
            <a 
              href="tel:108" 
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#00E676] text-zinc-300 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#00E676]" />
              <span>DISASTER AMBULANCE: <strong>108</strong></span>
            </a>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      <SOSConfirmationSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
