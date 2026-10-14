'use client';

import React from 'react';
import { Waves, Wind, Activity, Flame, ShieldAlert, Layers } from 'lucide-react';
import { DisasterEvent } from '@/app/api/disasters/route';

interface MapFilterBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  events: DisasterEvent[];
}

export default function MapFilterBar({
  activeCategory,
  onSelectCategory,
  events,
}: MapFilterBarProps) {
  const getCount = (cat: string) => {
    if (cat === 'all') return events.length;
    return events.filter((e) => e.category === cat).length;
  };

  const categories = [
    { id: 'all', label: 'All Hazards', icon: Layers, color: '#FFFFFF' },
    { id: 'flood', label: 'Floods', icon: Waves, color: '#00E5FF' },
    { id: 'cyclone', label: 'Cyclones', icon: Wind, color: '#C6FF00' },
    { id: 'earthquake', label: 'Earthquakes', icon: Activity, color: '#FF5252' },
    { id: 'wildfire', label: 'Wildfires', icon: Flame, color: '#FF9100' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-[#0b0b0b]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
      <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-zinc-400 border-r border-white/10 mr-1">
        <ShieldAlert className="w-3.5 h-3.5 text-[#C6FF00]" />
        <span className="hidden sm:inline">//: SENSORS</span>
      </div>

      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        const count = getCount(cat.id);

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-[#C6FF00] text-black font-semibold shadow-md shadow-[#C6FF00]/20'
                : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            aria-pressed={isActive}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: isActive ? '#000000' : cat.color }} />
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-400'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
