'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FarmerProfile, ClimaNasa } from '@/lib/types';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Droplets,
  Thermometer,
  CloudRain,
  AlertTriangle,
  RotateCcw,
  Moon,
  ShieldAlert,
} from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import TypewriterText from './TypewriterText';

interface ClimaCarouselBannerProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  isElNino: boolean;
  onOpenSanidadModal?: () => void;
  onOpenForecast?: () => void;
}

export default function ClimaCarouselBanner({
  profile,
  climaNasa,
  isElNino,
  onOpenSanidadModal,
  onOpenForecast,
}: ClimaCarouselBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = 4;

  // Auto-advance every 6 seconds unless paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6500);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const handleNext = () => {
    playBubblePop();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handlePrev = () => {
    playBubblePop();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (idx: number) => {
    playBubblePop();
    setCurrentSlide(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const temp = climaNasa?.temp_media_c || 14.2;
  const rain = climaNasa?.precipitacion_mm || 0;

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ================= SLIDE 0: KIPU METEORÓLOGO ================= */}
      {currentSlide === 0 && (
        <div className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[160px]">
          <div className="w-28 sm:w-32 h-36 sm:h-40 flex-shrink-0 relative flex items-center justify-center">
            <img
              src="/images/kipu_llama.png"
              alt="Kipu Clima"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          <div className="flex-1 relative bg-white border-2 border-amber-500 border-b-4 border-b-amber-600 rounded-3xl p-3.5 shadow-xs">
            <div className="absolute top-7 -left-2.5 w-4 h-4 bg-white border-b-2 border-l-2 border-amber-500 transform rotate-45"></div>

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-extrabold text-xs text-amber-950 uppercase tracking-wide">
                KIPU METEORÓLOGO
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                🛰️ NASA POWER
              </span>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
              <TypewriterText
                key={`clima-${profile.distrito}-${temp}`}
                text={`¡Kamisaraki! Monitoreo satelital activo en ${profile.distrito} (${profile.altitude} msnm). Temperatura media de ${temp}°C y lluvia prevista de ${rain} mm.`}
                speed={16}
              />
            </p>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Thermometer className="w-2.5 h-2.5 text-amber-600" />
                <span>{temp}°C</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-300 flex items-center gap-1">
                <CloudRain className="w-2.5 h-2.5 text-sky-600" />
                <span>{rain} mm</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300">
                {isElNino ? '⚠️ Sequía Activa' : '☀️ Año Normal'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SLIDE 1: ALERTA DE HELADA ANDINA ================= */}
      {currentSlide === 1 && (
        <div className="relative rounded-3xl overflow-hidden border-2 border-sky-600 border-b-4 border-b-sky-800 shadow-md animate-in fade-in duration-300 min-h-[160px] flex flex-col justify-end p-4 text-white">
          <img
            src="/images/andes_poster.jpg"
            alt="Helada en los Andes"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-600 text-white tracking-wider flex items-center gap-1 shadow-xs">
                <span>❄️ Alerta de Helada Agronómica</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-sky-200">
                03:00 - 06:00 AM
              </span>
            </div>

            <h3 className="font-black text-base sm:text-lg text-white tracking-tight leading-tight contrast-bold-white drop-shadow-sm">
              Descenso Térmico Nocturno en {profile.distrito}
            </h3>

            <p className="text-xs text-sky-100 font-sans leading-snug drop-shadow-xs line-clamp-2">
              Cielo despejado favorece helada por irradiación. Aplica riego por aspersión nocturno o quemas controladas de rastrojo húmedo en cabeceras de andén.
            </p>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-amber-300">
                🛡️ Defensa: Riego de auxilio + ceniza
              </span>
              {onOpenForecast && (
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    onOpenForecast();
                  }}
                  className="text-[10px] font-extrabold text-sky-200 hover:text-white bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Ver Pronóstico →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SLIDE 2: VIGILANCIA ENOS EL NIÑO ================= */}
      {currentSlide === 2 && (
        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-600 border-b-4 border-b-amber-800 shadow-md animate-in fade-in duration-300 min-h-[160px] flex flex-col justify-end p-4 text-white">
          <img
            src="/images/nasa_satellite.jpg"
            alt="Vigilancia El Niño"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.38]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/70 to-transparent" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-600 text-white tracking-wider flex items-center gap-1 shadow-xs">
                <span>⚠️ Vigilancia ENOS • ENFEN &amp; NOAA</span>
              </span>
              <span className="text-[11px] font-bold text-amber-200">
                Sierra Sur
              </span>
            </div>

            <h3 className="font-black text-base sm:text-lg text-white tracking-tight leading-tight contrast-bold-white drop-shadow-sm">
              Alerta de Compresión de Lluvias
            </h3>

            <p className="text-xs text-amber-100 font-sans leading-snug drop-shadow-xs line-clamp-2">
              Modelos oceanográficos prevén veranillos prolongados. Conserva la humedad aplicando mulch orgánico y prepara zanjas de infiltración en ladera.
            </p>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-amber-300">
                🌱 Cultivos rústicos: Tarwi, Quinua, Cebada
              </span>
              <span className="text-[10px] font-bold text-emerald-200">
                Resistencia Hídrica
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SLIDE 3: CALENDARIO LUNAR ANDINO (KILLA) ================= */}
      {currentSlide === 3 && (
        <div className="relative rounded-3xl overflow-hidden border-2 border-purple-600 border-b-4 border-b-purple-800 shadow-md animate-in fade-in duration-300 min-h-[160px] flex flex-col justify-end p-4 text-white">
          <img
            src="/images/cultivos_poster.jpg"
            alt="Calendario Lunar Andino"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-950/70 to-transparent" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-600 text-white tracking-wider flex items-center gap-1 shadow-xs">
                <Moon className="w-3 h-3 text-amber-200" />
                <span>Killa • Sabiduría Lunar</span>
              </span>
              <span className="text-[11px] font-bold text-purple-200">
                Cuarto Creciente
              </span>
            </div>

            <h3 className="font-black text-base sm:text-lg text-white tracking-tight leading-tight contrast-bold-white drop-shadow-sm">
              Fase Óptima para Tubérculos &amp; Biol Foliar
            </h3>

            <p className="text-xs text-purple-100 font-sans leading-snug drop-shadow-xs line-clamp-2">
              En cuarto creciente la savia asciende con fuerza. Es el momento propicio para fertilización foliar biológica y aporque de papas nativas.
            </p>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-purple-200">
                🧪 Biol enriquecido + ceniza de fogón
              </span>
              <span className="text-[10px] font-bold text-amber-300">
                Cero Químicos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Carrusel Controls: Dots & Navigation Arrows */}
      <div className="flex items-center justify-between pt-2 px-1">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition active:scale-95 cursor-pointer"
          title="Banner anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Indicators Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-5 bg-amber-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 transition active:scale-95 cursor-pointer"
          title="Siguiente banner"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
