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

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ================= SLIDE 0: KIPU COPILOTO (MISMO FORMATO DE IMAGEN A LA IZQUIERDA, SIN REDUNDANCIAS) ================= */}
      {currentSlide === 0 && (
        <div className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[155px] px-1">
          {/* Imagen de Kipu a la izquierda en el mismo formato de card */}
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-white flex items-center justify-center">
            <img
              src="/images/kipu_llama.png"
              alt="Kipu Copiloto"
              className="w-full h-full object-contain p-1.5 filter drop-shadow-xs"
            />
          </div>

          {/* Información a la derecha: Título, Descripción en texto negro y Botón */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-black text-base text-slate-950 tracking-tight leading-snug">
              Kipu Copiloto Andino
            </h3>
            <p className="text-xs text-black font-medium font-sans leading-relaxed">
              Guardián edáfico que fusiona saberes ancestrales con radares NASA SMAP para optimizar tu siembra y proteger la vida del suelo andino.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  onOpenWizard();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-emerald-200" />
                <span>Recalibrar Parcela</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SLIDE 1: MONITOREO METEOROLÓGICO (FEEDBACK ACTUAL + RECOMENDACIÓN EN TEXTO NEGRO) ================= */}
      {currentSlide === 1 && (
        <div className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[155px] px-1">
          {/* Imagen de Satélite NASA a la izquierda */}
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-slate-900">
            <img
              src="/images/nasa_satellite.jpg"
              alt="Satélite NASA"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Información a la derecha: Título, Feedback + Recomendación en negro, y Botón de clima */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-black text-base text-slate-950 tracking-tight leading-snug">
              Reporte Agroclimático
            </h3>
            <p className="text-xs text-black font-medium font-sans leading-relaxed">
              {smapPercent < 20 || isElNino ? (
                <>
                  <span className="font-black text-black">Feedback actual:</span> Suelo en déficit hídrico por veranillo.{' '}
                  <span className="font-black text-black">Recomendación:</span> Aplica cobertura de mulch para conservar la humedad en raíz.
                </>
              ) : (
                <>
                  <span className="font-black text-black">Feedback actual:</span> Humedad edáfica óptima para labores en campo.{' '}
                  <span className="font-black text-black">Recomendación:</span> Aprovecha la ventana de sol para deshierbe y aporque.
                </>
              )}
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

      {/* ================= SLIDE 2: ROTACIÓN DE CULTIVOS (DESCRIPCIÓN EN TEXTO NEGRO CON FEEDBACK Y RECOMENDACIÓN) ================= */}
      {currentSlide === 2 && (
        <div className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[155px] px-1">
          {/* Imagen de Cultivos a la izquierda */}
          <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-slate-900">
            <img
              src="/images/crops_banner.jpg"
              alt="Rotación de Cultivos"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Información a la derecha: Título, Texto en negro y Botón */}
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-black text-base text-slate-950 tracking-tight leading-snug">
              Rotación Óptima de 3 Campañas
            </h3>
            <p className="text-xs text-black font-medium font-sans leading-relaxed">
              <span className="font-black text-black">Feedback actual:</span> Parcela lista para rotación tras cosechar {profile.previousCropName || 'Tarwi'}.{' '}
              <span className="font-black text-black">Recomendación:</span> Alterna con leguminosas para inyectar nitrógeno orgánico y cortar plagas.
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
