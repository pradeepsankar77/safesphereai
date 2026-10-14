import React from 'react';
import { Shield, Radio, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black/90 py-12 px-4 sm:px-6 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Shield className="w-5 h-5 text-[#C6FF00]" />
            <span className="text-lg font-light text-white tracking-wide">
              SafeSphere <span className="font-semibold text-[#C6FF00]">AI</span>
            </span>
          </div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Predict. Protect. Respond.
          </p>
        </div>

        {/* Emergency Hotlines Micro Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-zinc-400 bg-zinc-950/80 border border-white/5 px-4 py-2 rounded-xl">
          <span className="text-[#C6FF00] flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#00E676] animate-pulse" /> NATIONAL HOTLINES:
          </span>
          <span>DISASTER: <strong className="text-white">108</strong></span>
          <span className="text-zinc-600">|</span>
          <span>NDRF: <strong className="text-white">1078</strong></span>
          <span className="text-zinc-600">|</span>
          <span>POLICE: <strong className="text-white">112</strong></span>
        </div>

        {/* Copyright & Security Status */}
        <div className="text-xs text-zinc-500 text-center md:text-right font-mono">
          <div>Next-Gen Disaster Management System</div>
          <div className="text-[11px] text-zinc-600 mt-0.5">
            Designed for sub-second emergency response
          </div>
        </div>
      </div>
    </footer>
  );
}
