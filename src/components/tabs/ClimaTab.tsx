'use client';

import React, { useState } from 'react';
import { ClimaNasa, FarmerProfile } from '@/lib/types';
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, Thermometer, CloudRain, Bug } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import AgroClimaNewsFeed from '@/components/AgroClimaNewsFeed';
import WeatherForecastCard from '@/components/WeatherForecastCard';
import ElNinoSimulatorCard from '@/components/ElNinoSimulatorCard';
import ClimaCarouselBanner from '@/components/ClimaCarouselBanner';
import SanidadVegetalModal from '@/components/SanidadVegetalModal';
import AgroenvironmentalAssistantModal from '@/components/AgroenvironmentalAssistantModal';

interface ClimaTabProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  isElNino: boolean;
  onToast: (msg: string) => void;
  onToggleElNino?: (val: boolean) => void;
}

export default function ClimaTab({
  profile,
  climaNasa,
  isElNino,
  onToast,
  onToggleElNino,
}: ClimaTabProps) {
  const [climaView, setClimaView] = useState<'index' | 'forecast' | 'elnino'>('index');
  const [isSanidadOpen, setIsSanidadOpen] = useState<boolean>(false);
  const [isNewsOpen, setIsNewsOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  const temp = climaNasa?.temp_media_c || 14.2;
  const rain = climaNasa?.precipitacion_mm || 0;

  return (
    <div className="space-y-4 animate-in fade-in pt-1">
      {/* Sub-navigation via Index */}
      {climaView === 'index' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Dynamic Carousel Banner */}
          <ClimaCarouselBanner
            profile={profile}
            climaNasa={climaNasa}
            isElNino={isElNino}
            onOpenForecast={() => setClimaView('forecast')}
            onOpenSanidadModal={() => setIsSanidadOpen(true)}
          />

          {/* Official Scientific Bulletins & ENSO Alerts */}
          <div className="flex justify-center pt-0.5 pb-0.5">
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setIsNewsOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-amber-300 text-xs font-bold text-slate-700 active:scale-95 transition cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>3 ENSO &amp; INIA Agroclimatic Bulletins Available</span>
              <span className="text-slate-400 font-normal">↗</span>
            </button>
          </div>

          <AgroClimaNewsFeed isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />

          {/* Dark Forest Glassmorphism Modules */}
          <div className="space-y-3 pt-1">
            {/* Card 1: 5-Day Forecast & Frost Telemetry */}
            <div
              onClick={() => {
                playBubblePop();
                setClimaView('forecast');
              }}
              className="p-3.5 rounded-3xl bg-[#132A1C]/75 hover:bg-[#183925]/85 border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl backdrop-blur-md transition-all duration-300 flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-emerald-500/30 bg-slate-950">
                <img
                  src="/images/andes_poster.jpg"
                  alt="Andean Mountain Range Forecast"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-sm sm:text-base text-white group-hover:text-emerald-300 transition leading-snug">
                  5-Day Forecast &amp; Frost Telemetry
                </h3>
                <p className="text-xs text-slate-300 font-medium font-sans leading-relaxed line-clamp-2">
                  Min/max temperatures, solar UV flux, and nocturnal radiative frost warnings for {profile.distrito}.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-bold shadow-sm group-hover:bg-cyan-900 transition">
                    <span>View forecast</span>
                    <ArrowRight className="w-3 h-3 text-cyan-300" />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: ENSO Drought Simulator & Pest Control */}
            <div
              onClick={() => {
                playBubblePop();
                setClimaView('elnino');
              }}
              className="p-3.5 rounded-3xl bg-[#132A1C]/75 hover:bg-[#183925]/85 border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl backdrop-blur-md transition-all duration-300 flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-emerald-500/30 bg-slate-950">
                <img
                  src="/images/cultivos_poster.jpg"
                  alt="ENSO Drought Simulator"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition leading-snug">
                  ENSO Drought Simulator &amp; Pest Disruption
                </h3>
                <p className="text-xs text-slate-300 font-medium font-sans leading-relaxed line-clamp-2">
                  Simulate Andean drought scenarios, contingency crops (Tarwi / Andean Lupin), and Andean potato weevil disruption.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs font-bold shadow-sm group-hover:bg-amber-900 transition">
                    <span>Open simulator</span>
                    <ArrowRight className="w-3 h-3 text-amber-300" />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Plant Health & Andean Biocontrol */}
            <div
              onClick={() => {
                playBubblePop();
                setIsSanidadOpen(true);
              }}
              className="p-3.5 rounded-3xl bg-[#132A1C]/75 hover:bg-[#183925]/85 border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl backdrop-blur-md transition-all duration-300 flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-emerald-500/30 bg-slate-950">
                <img
                  src="/images/tarwi_chocho.jpg"
                  alt="Plant Health Tarwi Biocontrol"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-sm sm:text-base text-white group-hover:text-emerald-300 transition leading-snug">
                  Plant Health &amp; Andean Biocontrol
                </h3>
                <p className="text-xs text-slate-300 font-medium font-sans leading-relaxed line-clamp-2">
                  Perimeter barrier of Tarwi with repellent quinolizidine alkaloids (-84% weevil damage) and pitfall trap trenches.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold shadow-sm group-hover:bg-emerald-900 transition">
                    <span>View plant health</span>
                    <ArrowRight className="w-3 h-3 text-emerald-300" />
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Agroclimatic Assistant & Preventative Calendar */}
            <div
              onClick={() => {
                playBubblePop();
                setIsAssistantOpen(true);
              }}
              className="p-3.5 rounded-3xl bg-[#132A1C]/75 hover:bg-[#183925]/85 border border-emerald-500/30 hover:border-emerald-400/60 shadow-xl backdrop-blur-md transition-all duration-300 flex items-center gap-3.5 group cursor-pointer"
            >
              <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-emerald-500/30 bg-slate-950">
                <img
                  src="/images/quipu_plan.jpg"
                  alt="Agroclimatic Assistant ENSO"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-sm sm:text-base text-white group-hover:text-lime-300 transition leading-snug">
                  Agroclimatic Assistant &amp; Seasonal Calendar
                </h3>
                <p className="text-xs text-slate-300 font-medium font-sans leading-relaxed line-clamp-2">
                  4-phase preventative calendar and A13 rotational succession to safeguard soil moisture during ENSO anomalies.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 text-xs font-black shadow-md group-hover:from-lime-300 group-hover:to-emerald-300 transition">
                    <span>Consult Assistant</span>
                    <ArrowRight className="w-3 h-3 text-slate-950" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal del Asistente Agroambiental */}
          <AgroenvironmentalAssistantModal
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            profile={profile}
            climaNasa={climaNasa}
            onToast={onToast}
          />
        </div>
      )}

      {/* View 1: Detailed Forecast */}
      {climaView === 'forecast' && (
        <div className="space-y-3 animate-in fade-in">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setClimaView('index');
            }}
            className="px-4 py-2 rounded-2xl bg-[#132A1C]/80 border border-emerald-500/40 text-emerald-200 hover:text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Climate Index</span>
          </button>

          <WeatherForecastCard
            clima={climaNasa}
            cuencaName={profile.distrito}
            isElNino={isElNino}
            lat={profile.lat}
            lon={profile.lon}
          />
        </div>
      )}

      {/* View 2: ENSO Simulator */}
      {climaView === 'elnino' && (
        <div className="space-y-3 animate-in fade-in">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setClimaView('index');
            }}
            className="px-4 py-2 rounded-2xl bg-[#132A1C]/80 border border-emerald-500/40 text-emerald-200 hover:text-white font-bold text-xs flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-lg backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Climate Index</span>
          </button>

          <ElNinoSimulatorCard
            isElNino={isElNino}
            onToggleElNino={(val) => {
              if (onToggleElNino) onToggleElNino(val);
            }}
            onToast={onToast}
          />
        </div>
      )}

      {/* Plant Health Modal */}
      <SanidadVegetalModal
        isOpen={isSanidadOpen}
        onClose={() => setIsSanidadOpen(false)}
        distrito={profile.distrito}
      />
    </div>
  );
}
