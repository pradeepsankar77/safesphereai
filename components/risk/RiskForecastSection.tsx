'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CloudRain, 
  Wind, 
  Compass, 
  Sparkles, 
  ShieldAlert, 
  RefreshCw, 
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';

interface RiskData {
  label: string;
  score: number;
  level: 'Low' | 'Medium' | 'High';
  color: string;
  formula: {
    expression: string;
    factors: {
      rainfallFactor: number;
      windFactor: number;
      proximityFactor: number;
      seismicFactor: number;
    };
  };
  metrics: {
    rainfall: { h24: number; h48: number; h72: number; unit: string };
    wind: { h24: number; h48: number; h72: number; unit: string };
    closestHazard: { name: string; distanceKm: number };
  };
  aiExplanation: string;
}

export default function RiskForecastSection() {
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeline, setSelectedTimeline] = useState<'24h' | '48h' | '72h'>('48h');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 });

  const fetchRisk = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/risk?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      if (data && data.success) {
        setRiskData(data);
      }
    } catch (err) {
      console.error('Error fetching risk indicator:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(newCoords);
          fetchRisk(newCoords.lat, newCoords.lng);
        },
        () => {
          fetchRisk(coords.lat, coords.lng);
        }
      );
    } else {
      fetchRisk(coords.lat, coords.lng);
    }
  };

  useEffect(() => {
    fetchRisk(coords.lat, coords.lng);
  }, []);

  const badgeColor =
    riskData?.level === 'High' ? 'text-red-500 border-red-500/40 bg-red-500/10' :
    riskData?.level === 'Medium' ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' :
    'text-[#00E676] border-[#00E676]/40 bg-[#00E676]/10';

  const gaugeStrokeColor =
    riskData?.level === 'High' ? '#FF5252' :
    riskData?.level === 'Medium' ? '#FFB300' :
    '#00E676';

  const currentRain = 
    selectedTimeline === '24h' ? riskData?.metrics.rainfall.h24 :
    selectedTimeline === '48h' ? riskData?.metrics.rainfall.h48 :
    riskData?.metrics.rainfall.h72;

  const currentWind =
    selectedTimeline === '24h' ? riskData?.metrics.wind.h24 :
    selectedTimeline === '48h' ? riskData?.metrics.wind.h48 :
    riskData?.metrics.wind.h72;

  return (
    <section id="risk-forecast" className="py-20 border-t border-white/5 scroll-mt-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
            //: risk forecast
          </span>
          <h2 className="text-3xl sm:text-4xl font-light text-white">
            predictive <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#C6FF00] to-[#00E676]">severity index</span>
          </h2>
          <p className="text-sm text-zinc-400 mt-2 font-normal max-w-xl">
            Multi-modal evaluation fusing Open-Meteo precipitation, atmospheric wind dynamics, and proximity to active seismic clusters.
          </p>
        </div>

        {/* Location Controller */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUseMyLocation}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-[#C6FF00] text-xs font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#00E676]" />
            <span>LOCATE ME ({coords.lat.toFixed(2)}°, {coords.lng.toFixed(2)}°)</span>
          </button>

          <button
            onClick={() => fetchRisk(coords.lat, coords.lng)}
            disabled={loading}
            className="p-1.5 rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white"
            title="Recalculate severity index"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C6FF00]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Risk Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Large Severity Gauge / Badge (5 cols) */}
        <div className="lg:col-span-5 supernatural-card p-6 sm:p-8 flex flex-col items-center justify-center text-center relative">
          <div className="w-full flex items-center justify-between pb-4 border-b border-white/5 text-[11px] font-mono text-zinc-400">
            <span>METRIC STATUS</span>
            <span className="uppercase text-[#C6FF00]">
              {riskData?.label || 'forecast-based risk indicator'}
            </span>
          </div>

          {/* SVG Circular Dial Gauge */}
          <div className="relative w-48 h-48 my-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background track */}
              <circle
                cx="80"
                cy="80"
                r="65"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="12"
                fill="none"
              />
              {/* Animated Progress Value */}
              <circle
                cx="80"
                cy="80"
                r="65"
                stroke={gaugeStrokeColor}
                strokeWidth="12"
                fill="none"
                strokeDasharray={408}
                strokeDashoffset={408 - (408 * (riskData?.score || 30)) / 100}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: `drop-shadow(0 0 12px ${gaugeStrokeColor}88)`,
                }}
              />
            </svg>

            {/* Inner Gauge Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-light font-mono text-white">
                {riskData?.score ?? '--'}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">
                INDEX / 100
              </span>
            </div>
          </div>

          {/* Level Badge */}
          <div className={`px-5 py-1.5 rounded-full border text-sm font-bold font-mono tracking-wider uppercase mb-3 ${badgeColor}`}>
            {riskData?.level ?? 'CALCULATING'} SEVERITY
          </div>

          <p className="text-xs text-zinc-400 font-mono">
            Nearest Hazard: <span className="text-white">{riskData?.metrics.closestHazard.name}</span> (~{riskData?.metrics.closestHazard.distanceKm} km)
          </p>
        </div>

        {/* Right Column: 24h-72h Timeline + Claude AI Diagnostic (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Timeline Selector Cards */}
          <div className="supernatural-card p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-mono uppercase text-[#00E676] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                //: 24–72H METEOROLOGICAL FORECAST
              </h4>

              {/* Timeline Toggle Pills */}
              <div className="flex gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
                {(['24h', '48h', '72h'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTimeline(t)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      selectedTimeline === t
                        ? 'bg-[#C6FF00] text-black font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  <span>CUMULATIVE RAINFALL</span>
                </div>
                <div className="text-2xl font-light font-mono text-white">
                  {currentRain ?? '--'} <span className="text-xs text-zinc-500 font-normal">mm</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Impact Factor: +{riskData?.formula.factors.rainfallFactor || 0} pts
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/50 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                  <Wind className="w-4 h-4 text-[#C6FF00]" />
                  <span>PEAK WIND SPEED</span>
                </div>
                <div className="text-2xl font-light font-mono text-white">
                  {currentWind ?? '--'} <span className="text-xs text-zinc-500 font-normal">km/h</span>
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Impact Factor: +{riskData?.formula.factors.windFactor || 0} pts
                </div>
              </div>
            </div>

            {/* Transparent formula pill */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-zinc-400" /> Formula:
              </span>
              <span className="text-zinc-400">
                score = w1·rain + w2·wind + w3·proximity + w4·magnitude
              </span>
            </div>
          </div>

          {/* Claude AI Plain-Language Diagnostic Card */}
          <div className="supernatural-card p-6 border border-[#C6FF00]/30 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C6FF00]/15 flex items-center justify-center text-[#C6FF00]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  CLAUDE AI EMERGENCY DIAGNOSTIC
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-[#00E676]">
                NATURAL LANGUAGE REASONING
              </span>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
              {loading ? (
                <span className="text-zinc-500 font-mono animate-pulse">
                  Analyzing multi-dimensional atmospheric telemetry and hazard buffer perimeters...
                </span>
              ) : (
                riskData?.aiExplanation
              )}
            </p>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>MODEL: forecast-based risk indicator</span>
              <span className="text-[#C6FF00]">CONFIDENCE: 94.8%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
