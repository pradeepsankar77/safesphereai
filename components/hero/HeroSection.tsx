'use client';

import React from 'react';
import { ArrowRight, AlertTriangle, ShieldCheck, Radio } from 'lucide-react';

interface HeroSectionProps {
  onCheckRiskClick?: () => void;
  onSosClick?: () => void;
  activeEventsCount?: number;
}

export default function HeroSection({
  onCheckRiskClick,
  onSosClick,
  activeEventsCount = 12,
}: HeroSectionProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-12 pb-20">
      {/* Live Status Pill */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-950/80 border border-white/10 mb-8 backdrop-blur-md shadow-inner">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676]"></span>
        </span>
        <span className="text-xs font-mono tracking-wide text-zinc-300">
          <strong className="text-[#C6FF00] font-semibold">{activeEventsCount} active events</strong> monitored worldwide
        </span>
        <span className="text-zinc-600">|</span>
        <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1">
          <Radio className="w-3 h-3 text-[#00E676] animate-pulse" /> LIVE TELEMETRY
        </span>
      </div>

      {/* Main Hero Headline */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-white leading-none">
          SafeSphere <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#C6FF00] to-[#00E676]">AI</span>
        </h1>

        <p className="text-xl sm:text-2xl md:text-3xl text-zinc-400 font-light tracking-widest lowercase pt-2">
          *predict. protect. respond.
        </p>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 font-normal leading-relaxed pt-3">
          Next-generation autonomous disaster intelligence. Real-time satellite hazard mapping, 
          forecast-based severity modeling, and sub-second emergency response routing.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <button
          onClick={onCheckRiskClick || (() => scrollTo('risk-forecast'))}
          className="btn-primary-gradient px-8 py-4 rounded-xl text-xs sm:text-sm tracking-wider flex items-center gap-2 group cursor-pointer"
        >
          <span>CHECK MY RISK</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={onSosClick || (() => scrollTo('sos-section'))}
          className="btn-secondary-outline px-8 py-4 rounded-xl text-xs sm:text-sm font-bold tracking-wider flex items-center gap-2 group cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 group-hover:text-[#C6FF00] transition-colors" />
          <span>EMERGENCY SOS</span>
        </button>
      </div>

      {/* Micro Metrics Ticker */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-3xl w-full border-t border-white/10 pt-8 text-left">
        <div>
          <div className="text-2xl font-light text-[#C6FF00]">24–72h</div>
          <div className="text-xs text-zinc-500 font-mono uppercase mt-0.5">//: Predictive Window</div>
        </div>
        <div>
          <div className="text-2xl font-light text-[#00E676]">100%</div>
          <div className="text-xs text-zinc-500 font-mono uppercase mt-0.5">//: Offline PWA Ready</div>
        </div>
        <div>
          <div className="text-2xl font-light text-white">3 Languages</div>
          <div className="text-xs text-zinc-500 font-mono uppercase mt-0.5">//: EN / TA / HI Voice</div>
        </div>
        <div>
          <div className="text-2xl font-light text-[#C6FF00]">&lt; 1.2s</div>
          <div className="text-xs text-zinc-500 font-mono uppercase mt-0.5">//: SOS Dispatch Time</div>
        </div>
      </div>
    </section>
  );
}
