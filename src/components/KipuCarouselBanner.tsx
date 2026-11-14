'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FarmerProfile, ClimaNasa } from '@/lib/types';
import {
  RotateCcw,
  Droplets,
  Thermometer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Layers,
  CloudSun,
} from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import TypewriterText from './TypewriterText';

interface KipuCarouselBannerProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  smapPercent: number;
  hardwareId: string;
  isElNino: boolean;
  onOpenWizard: () => void;
  onNavigateToClima?: () => void;
}

export default function KipuCarouselBanner({
  profile,
  climaNasa,
  smapPercent,
  hardwareId,
  isElNino,
  onOpenWizard,
  onNavigateToClima,
}: KipuCarouselBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = 3;

  // Auto-advance every 7 seconds unless user is interacting
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 7000);
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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const areaHa = profile.areaHa || 2.4;
  const topos = (areaHa * 3.3).toFixed(1);
  const scaledSavings = Math.round(420 * areaHa);

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ================= SLIDE 0: KIPU Y LA BURBUJA (LIBRE, SIN ENJAULAR) ================= */}
      {currentSlide === 0 && (
        <div className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[160px]">
          {/* Llama Avatar Libre */}
          <div className="w-28 sm:w-32 h-36 sm:h-40 flex-shrink-0 relative flex items-center justify-center">
            <img
              src="/images/kipu_llama.png"
              alt="Kipu"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          {/* Globo de Diálogo Libre con cola cómica apuntando a Kipu */}
          <div className="flex-1 relative bg-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-3xl p-3.5 shadow-xs">
            <div className="absolute top-7 -left-2.5 w-4 h-4 bg-white border-b-2 border-l-2 border-emerald-600 transform rotate-45"></div>

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                KIPU COPILOTO
              </span>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  onOpenWizard();
                }}
                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-lg flex items-center gap-1 active:scale-95 transition cursor-pointer"
                title="Recalibrar datos con el asistente"
              >
                <RotateCcw className="w-2.5 h-2.5 text-emerald-700" />
                <span>Recalibrar</span>
              </button>
            </div>

            <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
              <TypewriterText
                key={`${profile.parcelName}-${smapPercent}`}
                text={`¡Allillanchu! Parcela de ${areaHa} ha (${topos} topos) en ${profile.distrito} (${profile.altitude} msnm). Humedad satelital ${smapPercent}% (${profile.moistureLabel}).`}
                speed={16}
              />
            </p>

            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                <span>🌾 {areaHa} ha</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-900 border border-sky-300 flex items-center gap-1">
                <Droplets className="w-2.5 h-2.5 text-sky-600" />
                <span>SMAP {smapPercent}%</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1">
                <Thermometer className="w-2.5 h-2.5 text-amber-600" />
                <span>{climaNasa?.temp_media_c || 14.2}°C</span>
              </span>
              <span className="text-[10px] font-mono text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {hardwareId}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SLIDE 1: BANNER SUGERENCIA DE ROTACIÓN QUIPU ================= */}
      {currentSlide === 1 && (
        <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-600 border-b-4 border-b-emerald-800 shadow-md animate-in fade-in duration-300 min-h-[160px] flex flex-col justify-end p-4 text-white">
          {/* Fondo Fotográfico de Campo / Cultivos */}
          <img
            src="/images/crops_banner.jpg"
            alt="Rotación de Cultivos"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.45]"
          />
          {/* Gradiente Protector de Legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-transparent" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Ruta Quipu • Recomendación</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-200">
                {areaHa} ha ({topos} topos)
              </span>
            </div>

            <h3 className="font-black text-base sm:text-lg text-white tracking-tight leading-tight contrast-bold-white drop-shadow-sm">
              Rotación Óptima de 3 Campañas
            </h3>

            <p className="text-xs text-emerald-100 font-sans leading-snug drop-shadow-xs line-clamp-2">
              Tras cosechar <strong>{profile.previousCropName}</strong>, el INIA recomienda sembrar leguminosas para inyectar nitrógeno natural al suelo y ahorrar hasta <strong>S/. {scaledSavings}</strong> en urea química.
            </p>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                <span>🌿 Ahorro: S/. {scaledSavings}</span>
                <span>•</span>
                <span>Corta gorgojo (-84%)</span>
              </span>
              <span className="text-[10px] font-extrabold text-emerald-200 flex items-center gap-0.5">
                <span>Ver Nudos Abajo ↓</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SLIDE 2: BANNER SUGERENCIA AGROCLIMÁTICA NASA ================= */}
      {currentSlide === 2 && (
        <div className="relative rounded-3xl overflow-hidden border-2 border-sky-600 border-b-4 border-b-sky-800 shadow-md animate-in fade-in duration-300 min-h-[160px] flex flex-col justify-end p-4 text-white">
          {/* Fondo Fotográfico Satélite NASA */}
          <img
            src="/images/nasa_satellite.jpg"
            alt="Satélite NASA"
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4]"
          />
          {/* Gradiente Protector */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-600 text-white tracking-wider flex items-center gap-1 shadow-xs">
                <span>🛰️ Telemetría Satelital en Vivo</span>
              </span>
              <span className="text-[11px] font-bold text-sky-200">
                {climaNasa?.temp_media_c || 14.2}°C
              </span>
            </div>

            <h3 className="font-black text-base sm:text-lg text-white tracking-tight leading-tight contrast-bold-white drop-shadow-sm">
              Humedad Óptima en {profile.distrito} ({smapPercent}%)
            </h3>

            <p className="text-xs text-sky-100 font-sans leading-snug drop-shadow-xs line-clamp-2">
              Radar NASA SMAP L4 confirma suelo <strong>{profile.moistureLabel.toLowerCase()}</strong>. {isElNino ? '⚠️ Alerta de déficit hídrico por El Niño activa.' : 'Condiciones estables para labores de siembra y aporque.'}
            </p>

            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold text-sky-200">
                Lluvia: {climaNasa?.precipitacion_mm || 0} mm • NASA POWER
              </span>
              {onNavigateToClima && (
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    onNavigateToClima();
                  }}
                  className="text-[10px] font-extrabold text-sky-200 hover:text-white bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                >
                  <span>Abrir Clima</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= CONTROLES DE NAVEGACIÓN Y PAGINACIÓN ================= */}
      <div className="flex items-center justify-between pt-1.5 px-2">
        {/* Botón Anterior */}
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-90 cursor-pointer"
          title="Banner anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Indicadores de Puntos Paginados (Duolingo Dots) */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  isActive
                    ? 'w-5 h-1.5 bg-emerald-600'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Ir al banner ${idx + 1}`}
              />
            );
          })}
        </div>

        {/* Botón Siguiente */}
        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-90 cursor-pointer"
          title="Siguiente banner"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
