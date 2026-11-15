'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FarmerProfile, ClimaNasa } from '@/lib/types';
import {
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

  const slides = [
    // Slide 0: Clima & Telemetría Satelital (sin redundancia de grados ni lluvia)
    {
      id: 0,
      title: `Monitoreo Climático y Humedad`,
      text: `Vigilancia en tiempo real de sequía y humedad edáfica para tu parcela en ${profile.distrito}. ${
        isElNino ? 'Alerta de déficit hídrico por El Niño activa.' : 'Condiciones estables para labores agrícolas.'
      }`,
      actionLabel: 'Abrir Clima',
      onAction: () => {
        playBubblePop();
        if (onNavigateToClima) onNavigateToClima();
      },
      image: '/images/nasa_satellite.jpg',
      isIllustration: false,
    },
    // Slide 1: Rotación Óptima de Cultivos (sin redundancia de hectáreas ni cápsulas)
    {
      id: 1,
      title: 'Rotación Óptima de 3 Campañas',
      text: `Tras cosechar ${profile.previousCropName || 'Tarwi'}, el INIA recomienda alternar con leguminosas para inyectar nitrógeno orgánico y cortar plagas.`,
      actionLabel: 'Ver Mi Chacra',
      onAction: () => {
        playBubblePop();
        if (onNavigateToChacra) onNavigateToChacra();
      },
      image: '/images/crops_banner.jpg',
      isIllustration: false,
    },
    // Slide 2: Kipu Copiloto Andino (sin cápsulas ni hardware ID)
    {
      id: 2,
      title: 'Kipu Copiloto Andino',
      text: `Guardián edáfico con saberes ancestrales y calibración satelital en campo para proteger el suelo andino.`,
      actionLabel: 'Recalibrar Parcela',
      onAction: () => {
        playBubblePop();
        onOpenWizard();
      },
      image: '/images/kipu_llama.png',
      isIllustration: true,
    },
  ];

  const current = slides[currentSlide];

  return (
    <div
      className="relative select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Tarjeta Limpia y Modular: Texto e Info a la izquierda, Imagen a la derecha */}
      <div className="bg-white/95 rounded-3xl border border-slate-200/90 shadow-xs p-4 flex items-center justify-between gap-3.5 min-h-[140px] animate-in fade-in duration-300">
        {/* Izquierda: Título, Texto y Botón de acción */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-snug">
            {current.title}
          </h3>
          <p className="text-xs text-slate-600 font-sans leading-relaxed line-clamp-3">
            {current.text}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={current.onAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3 h-3 text-emerald-200" />
            </button>
          </div>
        </div>

        {/* Derecha: Pequeña imagen limpia */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs bg-slate-50 flex items-center justify-center">
          <img
            src={current.image}
            alt={current.title}
            className={`w-full h-full ${current.isIllustration ? 'object-contain p-1' : 'object-cover'}`}
          />
        </div>
      </div>

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
          {slides.map((s, idx) => {
            const isActive = currentSlide === idx;
            return (
              <button
                key={s.id}
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
