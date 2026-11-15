'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="space-y-2.5">
      {/* Título de la Sección sin emoji ni contador 1 de 4 */}
      <div className="px-1">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Los Cuatro Pilares para Vencer a la Sequía
        </h3>
      </div>

      {/* Slide Deslizable sin marco ni fondo verde */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="transition-all duration-300 select-none cursor-grab active:cursor-grabbing px-1 space-y-2"
      >
        {/* Solo Título y Descripción con alto contraste sobre fondo claro */}
        <div>
          <h4 className="font-black text-base sm:text-lg text-slate-950 tracking-tight leading-snug">
            {currentPilar.title}
          </h4>
          <p className="text-xs sm:text-sm text-black font-medium leading-relaxed font-sans mt-1">
            {currentPilar.description}
          </p>
        </div>

        {/* Imagen limpia del Pilar Abajo */}
        <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden relative shadow-md border border-slate-200/90 bg-slate-100">
          <img
            src={currentPilar.image}
            alt={currentPilar.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
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
