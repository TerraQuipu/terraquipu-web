'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface Pilar {
  id: number;
  badge: string;
  title: string;
  description: string;
  image: string;
  highlight: string;
}

const PILARES: Pilar[] = [
  {
    id: 1,
    badge: 'PILAR 1 • CALIBRACIÓN EN CAMPO',
    title: 'La Prueba del Puño: Humedad y Textura',
    description:
      'Apretar un puñado de tierra a 15 cm. Si forma una bola suave y esponjosa, el suelo tiene capacidad de campo óptima y calibra con tus manos los radares del satélite NASA SMAP.',
    image: '/images/parcel_header.jpg',
    highlight: '🖐️ Calibra NASA SMAP en Terreno',
  },
  {
    id: 2,
    badge: 'PILAR 2 • AYNI CON LA TIERRA',
    title: 'Rotación con Tarwi: Nitrógeno Natural',
    description:
      'Tras cosechar papa, el INIA recomienda sembrar Tarwi. Sus raíces pivotantes de 1.8 m resisten la sequía, fijan +95 kg de N₂ natural por hectárea y cortan el ciclo del gorgojo en un 84%.',
    image: '/images/tarwi_chocho.jpg',
    highlight: '🌱 +95 kg N₂/ha • Corta Gorgojo (-84%)',
  },
  {
    id: 3,
    badge: 'PILAR 3 • RETENCIÓN HÍDRICA',
    title: 'Mulch Orgánico: Poncho contra el Sol',
    description:
      'No quemar el rastrojo de la cosecha anterior. Dejar una cobertura orgánica sobre la era actúa como un poncho térmico que reduce la evaporación solar diurna hasta en un 40% durante El Niño.',
    image: '/images/cosecha_poster.jpg',
    highlight: '🌾 -40% Evaporación Solar Diurna',
  },
  {
    id: 4,
    badge: 'PILAR 4 • CIENCIA DE LA TIERRA',
    title: 'Alianza Kipu & Astro: Del Espacio al Surco',
    description:
      'Astro escanea la microcuenca a 685 km de altura con radares de microondas; Kipu traduce las alertas y valida con la sabiduría de la comunidad en el surco andino.',
    image: '/images/nasa_orbit_poster.jpg',
    highlight: '🛰️ Órbita NASA + Validación en el Surco',
  },
];

export default function CuatroPilaresBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goToSlide = (index: number) => {
    playBubblePop();
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    playBubblePop();
    setCurrentIndex((prev) => (prev + 1) % PILARES.length);
  };

  const prevSlide = () => {
    playBubblePop();
    setCurrentIndex((prev) => (prev - 1 + PILARES.length) % PILARES.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      // Swiped left -> next
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentPilar = PILARES[currentIndex];

  return (
    <div className="space-y-2">
      {/* Título de la Sección */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Los Cuatro Pilares para Vencer a la Sequía</span>
        </h3>
        <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
          {currentIndex + 1} de {PILARES.length}
        </span>
      </div>

      {/* Tarjeta Deslizable con el estilo exacto de Tu Chacra Calibrada */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md border-2 border-emerald-700/50 transition-all duration-300 select-none cursor-grab active:cursor-grabbing"
      >
        {/* Encabezado del Slide */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
            {currentPilar.badge}
          </span>
          <span className="text-[10px] font-mono text-emerald-200/80">
            Desliza para ver más &rarr;
          </span>
        </div>

        {/* Título y Descripción */}
        <h4 className="font-extrabold text-base text-white tracking-tight leading-snug">
          {currentPilar.title}
        </h4>
        <p className="text-xs text-emerald-100/90 leading-relaxed font-sans mt-1">
          {currentPilar.description}
        </p>

        {/* Imagen del Pilar Abajo */}
        <div className="mt-3.5 w-full h-36 sm:h-44 rounded-2xl overflow-hidden relative border border-emerald-600/40 shadow-inner bg-slate-900">
          <img
            src={currentPilar.image}
            alt={currentPilar.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-700/90 text-white shadow-xs backdrop-blur-xs">
              {currentPilar.highlight}
            </span>
            <span className="text-[10px] font-mono text-emerald-200">
              {currentPilar.id}/4
            </span>
          </div>
        </div>
      </div>

      {/* Controles de Navegación del Banner: Flechas y Puntos Indicadores */}
      <div className="flex items-center justify-between px-2 pt-0.5">
        <button
          type="button"
          onClick={prevSlide}
          className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition active:scale-90 cursor-pointer"
          title="Pilar anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Puntos Indicadores */}
        <div className="flex items-center gap-1.5">
          {PILARES.map((pilar, idx) => (
            <button
              key={pilar.id}
              type="button"
              onClick={() => goToSlide(idx)}
              className={`transition-all rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 h-1.5 bg-emerald-700'
                  : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Ir al pilar ${pilar.id}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          className="p-1 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition active:scale-90 cursor-pointer"
          title="Pilar siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
