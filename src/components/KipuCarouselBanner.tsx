'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FarmerProfile, ClimaNasa } from '@/lib/types';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
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
  onNavigateToChacra?: () => void;
}

export default function KipuCarouselBanner({
  profile,
  climaNasa,
  smapPercent,
  hardwareId,
  isElNino,
  onOpenWizard,
  onNavigateToClima,
  onNavigateToChacra,
}: KipuCarouselBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = 3;

  // Auto-advance every 8 seconds unless user is interacting
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 8000);
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

  const areaHa = profile.areaHa || 1.0;
  const topos = (areaHa * 3.3).toFixed(1);

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ================= SLIDE 0: KIPU Y LA BURBUJA (DISEÑO ANTERIOR SIN DATOS REDUNDANTES) ================= */}
      {currentSlide === 0 && (
        <div className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[155px]">
          {/* Llama Avatar Libre */}
          <div className="w-28 sm:w-32 h-36 sm:h-40 shrink-0 relative flex items-center justify-center">
            <img
              src="/images/kipu_llama.png"
              alt="Kipu"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          {/* Globo de Diálogo con cola cómica apuntando a Kipu */}
          <div className="flex-1 relative bg-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-3xl p-3.5 shadow-xs">
            <div className="absolute top-7 -left-2.5 w-4 h-4 bg-white border-b-2 border-l-2 border-emerald-600 transform rotate-45"></div>

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-black text-xs text-emerald-950 uppercase tracking-wide">
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
                text={`¡Allillanchu! Parcela de ${areaHa} ha (${topos} topos) en ${profile.distrito} (${profile.altitude} msnm). Suelo ${profile.moistureLabel.toLowerCase()} con calibración satelital activa.`}
                speed={16}
              />
            </p>
          </div>
        </div>
      )}

      {/* ================= SLIDE 1: MONITOREO CLIMÁTICO (IMAGEN IZQUIERDA MÁS GRANDE, SIN CARD DE FONDO) ================= */}
      {currentSlide === 1 && (
        <div className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[155px] px-1">
          {/* Imagen a la izquierda un poco más grande */}
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-slate-900">
            <img
              src="/images/nasa_satellite.jpg"
              alt="Satélite NASA"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Información a la derecha: Título, Texto y Botón de abrir clima */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-black text-base text-slate-950 tracking-tight leading-snug">
              Monitoreo Climático y Humedad
            </h3>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Vigilancia en tiempo real de sequía y humedad edáfica para tu parcela en {profile.distrito}. {
                isElNino ? 'Alerta de déficit hídrico por El Niño activa.' : 'Condiciones estables para labores agrícolas.'
              }
            </p>
            <div className="pt-1">
              {onNavigateToClima && (
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    onNavigateToClima();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <span>Abrir Clima</span>
                  <ArrowRight className="w-3 h-3 text-emerald-200" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= SLIDE 2: ROTACIÓN DE CULTIVOS (IMAGEN IZQUIERDA MÁS GRANDE, SIN CARD DE FONDO) ================= */}
      {currentSlide === 2 && (
        <div className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[155px] px-1">
          {/* Imagen a la izquierda un poco más grande */}
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-slate-900">
            <img
              src="/images/crops_banner.jpg"
              alt="Rotación de Cultivos"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Información a la derecha: Título, Texto y Botón */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-black text-base text-slate-950 tracking-tight leading-snug">
              Rotación Óptima de 3 Campañas
            </h3>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              Tras cosechar {profile.previousCropName || 'Tarwi'}, el INIA recomienda alternar con leguminosas para inyectar nitrógeno orgánico y cortar plagas.
            </p>
            <div className="pt-1">
              {onNavigateToChacra && (
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    onNavigateToChacra();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
                >
                  <span>Ver Mi Chacra</span>
                  <ArrowRight className="w-3 h-3 text-emerald-200" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controles de Navegación y Paginación */}
      <div className="flex items-center justify-between pt-1.5 px-2">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition active:scale-90 cursor-pointer"
          title="Banner anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

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
                    ? 'w-5 h-1.5 bg-emerald-700'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                title={`Ir al banner ${idx + 1}`}
              />
            );
          })}
        </div>

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
