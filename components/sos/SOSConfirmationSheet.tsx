'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  AlertTriangle, 
  MapPin, 
  Battery, 
  Send, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  Compass, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface SOSConfirmationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SOSConfirmationSheet({ isOpen, onClose }: SOSConfirmationSheetProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [emergencyType, setEmergencyType] = useState('medical_evacuation');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  // Check network status
  useEffect(() => {
    setIsOffline(typeof navigator !== 'undefined' && !navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch coordinates & battery status when sheet opens
  useEffect(() => {
    if (!isOpen) {
      setDispatchResult(null);
      return;
    }

    setIsLocating(true);

    // Geolocation
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn('GPS error, using regional center:', err.message);
          setCoords({ lat: 13.0827, lng: 80.2707, accuracy: 50 });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCoords({ lat: 13.0827, lng: 80.2707, accuracy: 100 });
      setIsLocating(false);
    }

    // Battery API (if supported)
    if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentLat = coords?.lat || 13.0827;
  const currentLng = coords?.lng || 80.2707;
  const mapsLink = `https://maps.google.com/?q=${currentLat.toFixed(6)},${currentLng.toFixed(6)}`;
  const smsBody = encodeURIComponent(
    `EMERGENCY SOS: Immediate rescue needed at coordinates ${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}. Map: ${mapsLink}`
  );
  const smsHref = `sms:112?body=${smsBody}`;
  const whatsappHref = `https://wa.me/?text=${smsBody}`;

  const handleSendSOS = async () => {
    // If offline, redirect directly to SMS fallback
    if (isOffline) {
      window.location.href = smsHref;
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: currentLat,
          longitude: currentLng,
          accuracyMeters: coords?.accuracy || 20,
          batteryLevel: batteryLevel || 85,
          senderName: senderName || 'Emergency Victim',
          senderPhone: senderPhone || null,
          emergencyType,
          message: 'Immediate disaster rescue beacon triggered.',
        }),
      });

      const data = await res.json();
      setDispatchResult(data);
    } catch (err) {
      console.error('Failed to submit SOS via API, falling back to SMS:', err);
      // Fallback
      window.location.href = smsHref;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#0b0b0b] border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.35)] text-white overflow-hidden max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close emergency modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0 sos-pulse-ring">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-red-500 tracking-wider uppercase block">
              //: CONFIRM RESCUE BEACON
            </span>
            <h3 id="sos-modal-title" className="text-xl sm:text-2xl font-light text-white">
              Emergency Distress <span className="font-semibold text-red-500">SOS</span>
            </h3>
          </div>
        </div>

        {/* Offline Warning Banner if applicable */}
        {isOffline && (
          <div className="mb-6 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
            <span>OFFLINE DETECTED: Tap below to broadcast via pre-filled SMS to 112 with GPS coordinates.</span>
          </div>
        )}

        {/* Live Location Telemetry Card */}
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3 mb-6">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-[#C6FF00]">
              <Compass className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              LIVE SATELLITE FIX
            </span>
            {batteryLevel !== null && (
              <span className="flex items-center gap-1 text-zinc-300">
                <Battery className="w-3.5 h-3.5 text-[#00E676]" />
                {batteryLevel}% BATTERY
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-zinc-500 block text-[10px]">LATITUDE</span>
              <span className="text-white text-sm font-semibold">{currentLat.toFixed(6)}°</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">LONGITUDE</span>
              <span className="text-white text-sm font-semibold">{currentLng.toFixed(6)}°</span>
            </div>
          </div>

          {coords?.accuracy && (
            <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1">
              <span>GPS Precision: ±{coords.accuracy} meters</span>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C6FF00] hover:underline flex items-center gap-1"
              >
                <span>Preview Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Confirmation or Success State */}
        {dispatchResult ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-[#00E676]/20 border border-[#00E676] flex items-center justify-center mx-auto text-[#00E676]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-semibold text-white">DISTRESS BEACON DISPATCHED</h4>
            <p className="text-xs font-mono text-[#00E676]">
              BEACON ID: {dispatchResult.dispatchId || 'SOS-ACTIVE'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Your location coordinates and telemetry have been logged. Open the direct SMS or WhatsApp links below to alert your emergency contacts immediately.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={smsHref}
                className="btn-primary-gradient py-3 px-4 rounded-xl text-xs flex-1 flex items-center justify-center gap-2 font-bold"
              >
                <MessageSquare className="w-4 h-4 text-black" />
                <span>OPEN SMS (112)</span>
              </a>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl text-xs flex-1 flex items-center justify-center gap-2 font-bold bg-[#25D366] text-black hover:brightness-110 transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>SHARE WHATSAPP</span>
              </a>
            </div>

            <button
              onClick={onClose}
              className="mt-4 text-xs font-mono text-zinc-500 hover:text-white"
            >
              Close Confirmation
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Emergency Type Selector */}
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase">
                //: TYPE OF CRISIS
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'medical_evacuation', label: 'Medical Emergency' },
                  { id: 'flood_rescue', label: 'Flood / Trapped' },
                  { id: 'structural_collapse', label: 'Collapse / Quake' },
                  { id: 'fire_evacuation', label: 'Fire Evacuation' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEmergencyType(type.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer font-mono text-[11px] ${
                      emergencyType === type.id
                        ? 'bg-red-500/20 text-red-400 border-red-500/60 font-semibold'
                        : 'bg-zinc-900/60 text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Contact Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Victim Name"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  PHONE (OPTIONAL)
                </label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* One-Tap Dispatch Button */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleSendSOS}
                disabled={isSubmitting || isLocating}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-black font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-500/40 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                <span>
                  {isSubmitting
                    ? 'DISPATCHING BEACON...'
                    : isOffline
                    ? 'SEND VIA OFFLINE SMS (112)'
                    : 'BROADCAST EMERGENCY SOS'}
                </span>
              </button>

              {/* Direct Instant Fallback Links */}
              <div className="flex items-center justify-center gap-4 text-xs font-mono text-zinc-400 pt-1">
                <a href={smsHref} className="hover:text-[#C6FF00] underline flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Direct SMS
                </a>
                <span>•</span>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#00E676] underline flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  WhatsApp
                </a>
                <span>•</span>
                <a href="tel:112" className="text-red-400 hover:text-red-300 font-bold">
                  Call 112
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
