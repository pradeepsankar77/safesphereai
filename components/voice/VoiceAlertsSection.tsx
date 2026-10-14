'use client';

import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Languages, 
  Play, 
  Pause, 
  AlertTriangle, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';

interface AlertTemplate {
  id: string;
  category: string;
  title: string;
  text: string;
}

const SAMPLE_ALERTS: AlertTemplate[] = [
  {
    id: 'cyclone',
    category: 'CYCLONE',
    title: 'Severe Coastal Cyclone Storm Surge Alert',
    text: 'Severe Cyclone Alert: Evacuate coastal lowlands immediately. Seek shelter in designated concrete assembly centers. Carry battery radios and emergency kits.',
  },
  {
    id: 'flood',
    category: 'FLOOD',
    title: 'Flash Flood & River Inundation Warning',
    text: 'Flash Flood Warning: River water levels have breached danger thresholds. Move immediately to high ground. Do not walk or drive through flowing water.',
  },
  {
    id: 'earthquake',
    category: 'SEISMIC',
    title: 'High-Magnitude Seismic Aftershock Advisory',
    text: 'Seismic Aftershock Advisory: Strong tremors recorded. Drop, cover, and hold on. Stay clear of power lines, glass windows, and unreinforced buildings.',
  },
];

type SupportedLang = 'en' | 'ta' | 'hi';

export default function VoiceAlertsSection() {
  const [selectedAlert, setSelectedAlert] = useState<AlertTemplate>(SAMPLE_ALERTS[0]);
  const [selectedLang, setSelectedLang] = useState<SupportedLang>('en');
  const [isPlaying, setIsPlaying] = useState(false);
  const [translations, setTranslations] = useState<Record<SupportedLang, string>>({
    en: SAMPLE_ALERTS[0].text,
    ta: 'தீவிர புயல் எச்சரிக்கை: கடலோர தாழ்வான பகுதிகளை உடனடியாக காலி செய்யவும். நியமிக்கப்பட்ட கான்கிரீட் நிவாரண முகாம்களுக்கு செல்லவும். அவசர மருந்துகள் மற்றும் வானொலியை உடன் எடுத்துச் செல்லவும்.',
    hi: 'गंभीर चक्रवात चेतावनी: तटीय निचले इलाकों को तुरंत खाली करें। नामित कंक्रीट राहत आश्रयों में शरण लें। बैटरी रेडियो और आपातकालीन किट साथ रखें।',
  });
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  // Fetch translation whenever selected alert changes
  const loadTranslation = async (alert: AlertTemplate) => {
    setIsLoadingTranslation(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: alert.text, type: alert.id }),
      });
      const data = await res.json();
      if (data && data.success && data.translations) {
        setTranslations(data.translations);
      }
    } catch (e) {
      console.warn('Translation fetch fallback:', e);
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  useEffect(() => {
    loadTranslation(selectedAlert);
  }, [selectedAlert]);

  // Clean up any active speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceAvailable(false);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = translations[selectedLang] || selectedAlert.text;
    window.speechSynthesis.cancel(); // Stop prior audio

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Language mapping
    const langLocaleMap: Record<SupportedLang, string> = {
      en: 'en-IN',
      ta: 'ta-IN',
      hi: 'hi-IN',
    };
    utterance.lang = langLocaleMap[selectedLang];
    utterance.rate = 0.95; // Slightly slower for crisp emergency comprehension

    // Pick best matching native voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(selectedLang) ||
      (selectedLang === 'ta' && v.name.toLowerCase().includes('tamil')) ||
      (selectedLang === 'hi' && v.name.toLowerCase().includes('hindi'))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      setVoiceAvailable(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const languages = [
    { code: 'en' as const, label: 'English', sub: 'en-IN' },
    { code: 'ta' as const, label: 'தமிழ்', sub: 'Tamil (ta-IN)' },
    { code: 'hi' as const, label: 'हिन्दी', sub: 'Hindi (hi-IN)' },
  ];

  return (
    <section id="voice-alerts" className="py-20 border-t border-white/5 scroll-mt-12">
      {/* Section Header */}
      <div className="mb-10">
        <span className="text-xs font-mono text-[#C6FF00] tracking-widest uppercase block mb-1">
          //: speak your language
        </span>
        <h2 className="text-3xl sm:text-4xl font-light text-white">
          multilingual <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#C6FF00] to-[#00E676]">voice alerts</span>
        </h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-xl font-normal">
          Instant speech synthesis delivering localized emergency life-safety instructions across English, Tamil, and Hindi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Language Chips & Alert Templates (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Language Switcher Chips */}
          <div className="supernatural-card p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#00E676]">
              <Languages className="w-4 h-4" />
              <span>//: SELECT BROADCAST LANGUAGE</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (isPlaying) {
                        window.speechSynthesis.cancel();
                        setIsPlaying(false);
                      }
                      setSelectedLang(lang.code);
                    }}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C6FF00] text-black font-bold border-[#C6FF00] shadow-[0_0_20px_rgba(198,255,0,0.3)]'
                        : 'bg-zinc-900/60 text-zinc-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-base">{lang.label}</span>
                    <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-black/75' : 'text-zinc-500'}`}>
                      {lang.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert Template Presets */}
          <div className="supernatural-card p-6 border border-white/10 space-y-3">
            <span className="text-[11px] font-mono text-zinc-400 uppercase block">
              //: CHOOSE EMERGENCY ADVISORY
            </span>

            <div className="space-y-2">
              {SAMPLE_ALERTS.map((alert) => {
                const isSelected = selectedAlert.id === alert.id;
                return (
                  <button
                    key={alert.id}
                    onClick={() => {
                      if (isPlaying) {
                        window.speechSynthesis.cancel();
                        setIsPlaying(false);
                      }
                      setSelectedAlert(alert);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#00E676]/10 text-white border-[#00E676]/40'
                        : 'bg-black/40 text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono text-[#00E676] block">
                        {alert.category}
                      </span>
                      <span className="text-xs font-semibold">{alert.title}</span>
                    </div>

                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_8px_#00E676] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Audio Broadcast Player & High-Contrast Transcript (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="supernatural-card p-6 sm:p-8 border border-[#C6FF00]/30 rounded-2xl space-y-6 relative overflow-hidden">
            {/* Player Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? 'bg-[#C6FF00]' : 'bg-zinc-600'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isPlaying ? 'bg-[#C6FF00]' : 'bg-zinc-600'}`}></span>
                </span>
                <span className="text-xs font-mono font-bold uppercase text-white">
                  VOICE BROADCAST TERMINAL
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-[#00E676]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CLAUDE TRANSLATION ENGINE</span>
              </div>
            </div>

            {/* Simulated Neon Soundwave Audio Visualizer */}
            <div className="h-16 flex items-center justify-center gap-1.5 px-4 bg-black/60 rounded-xl border border-white/5">
              {[40, 65, 25, 90, 50, 100, 70, 30, 85, 45, 95, 60, 35, 75, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-200 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-[#00E676] to-[#C6FF00]'
                      : 'bg-zinc-800'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, Math.sin(i + Date.now()) * 100 * (h / 100))}%` : '20%',
                    boxShadow: isPlaying ? '0 0 8px rgba(198, 255, 0, 0.5)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* Play / Pause Primary Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={handleTogglePlay}
                className="w-full sm:w-auto btn-primary-gradient px-8 py-4 rounded-xl text-xs sm:text-sm font-black tracking-wider flex items-center justify-center gap-2.5 cursor-pointer shadow-lg shadow-[#C6FF00]/25"
                aria-label={isPlaying ? 'Pause Voice Broadcast' : 'Play Voice Broadcast'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 text-black fill-black" />
                    <span>PAUSE BROADCAST</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 text-black fill-black" />
                    <span>PLAY VOICE ALERT ({languages.find((l) => l.code === selectedLang)?.label.toUpperCase()})</span>
                  </>
                )}
              </button>

              <div className="text-xs font-mono text-zinc-500 text-center sm:text-right">
                STATUS: {isPlaying ? <span className="text-[#C6FF00] font-bold">TRANSMITTING...</span> : 'STANDBY'}
              </div>
            </div>

            {/* High-Contrast Accessible Transcript Box */}
            <div className="p-5 rounded-xl bg-black/80 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="text-[#C6FF00] font-semibold">//: OFFICIAL EMERGENCY TRANSCRIPT</span>
                <span>LOCALE: {languages.find((l) => l.code === selectedLang)?.sub}</span>
              </div>

              <p className="text-base sm:text-lg text-white font-medium leading-relaxed tracking-wide font-sans">
                {isLoadingTranslation ? (
                  <span className="text-zinc-500 font-mono text-sm animate-pulse">
                    Translating emergency dispatch via Claude API...
                  </span>
                ) : (
                  translations[selectedLang] || selectedAlert.text
                )}
              </p>
            </div>

            {!voiceAvailable && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-400">
                <Info className="w-4 h-4 shrink-0" />
                <span>Device synthetic voice unavailable in current browser. High-contrast text transcript is displayed above.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
