'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Sprout,
  ShieldCheck,
  Droplets,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Sun,
  Flame,
} from 'lucide-react';
import { playBubblePop, playQuestionChime } from '@/lib/soundEffects';

const KIPU_WISDOM_QUOTES = [
  {
    title: 'Ayni con la Pachamama',
    quote:
      '«Tierra que descansa con leguminosa (Tarwi o Haba), nunca se cansa de dar buena papa. Alimenta las bacterias del suelo y el suelo alimentará a tu familia.»',
    tag: 'Rotación Regenerativa',
    icon: '🌱',
  },
  {
    title: 'La Sabiduría de la Prueba del Puño',
    quote:
      '«Toma un puñado de tierra a 15 centímetros de profundidad y apriétalo con fuerza. Si al abrir la mano se desmorona de golpe, pide riego o zanja; si forma una bola suave y esponjosa, tus raíces están en gloria.»',
    tag: 'Humedad en Campo',
    icon: '🖐️',
  },
  {
    title: 'El Mulch es el Poncho del Suelo',
    quote:
      '«Nunca quemes el rastrojo de la cosecha anterior. El rastrojo sobre la era actúa como un poncho andino que detiene el viento helado y evita que el sol evapore el rocío matinal.»',
    tag: 'Cobertura Protectora',
    icon: '🌾',
  },
  {
    title: 'Romper el Ciclo del Gorgojo',
    quote:
      '«El gorgojo de los Andes nace buscando tubérculo. Si siembras leguminosas y espolvoreas ceniza de fogón con muña en las esquinas, las larvas mueren de hambre y sanean tu terreno.»',
    tag: 'Bio-Control Andino',
    icon: '🪲',
  },
];

export default function KipuDetailedInfoCard() {
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNextQuote = () => {
    playBubblePop();
    setIsAnimating(true);
    setTimeout(() => {
      setActiveQuoteIndex((prev) => (prev + 1) % KIPU_WISDOM_QUOTES.length);
      setIsAnimating(false);
      playQuestionChime();
    }, 150);
  };

  const activeTip = KIPU_WISDOM_QUOTES[activeQuoteIndex];

  return (
    <div className="rounded-3xl bg-white border-2 border-emerald-600/30 border-b-4 border-b-emerald-700/40 p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in">
      {/* Header de la Sección Kipu */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-base shadow-2xs">
            🦙
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-sm text-slate-950 tracking-tight">
                Conoce a Kipu
              </h3>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Copiloto Andino
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Guardián edáfico, saberes ancestrales y traductor satelital
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleNextQuote}
          className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1 transition active:scale-95 cursor-pointer shrink-0"
          title="Ver otro consejo de Kipu"
        >
          <RotateCcw className="w-3 h-3 text-emerald-600" />
          <span>Otro Saber</span>
        </button>
      </div>

      {/* Mascota Kipu con Burbuja Dinámica de Diálogo */}
      <div className="flex items-center gap-3 pt-1">
        {/* Kipu Llama Mascot Portrait */}
        <div
          onClick={handleNextQuote}
          className="w-24 sm:w-28 h-32 sm:h-36 shrink-0 relative flex items-center justify-center cursor-pointer group"
          title="¡Toca a Kipu para escuchar otro saber!"
        >
          <img
            src="/images/kipu_llama.png"
            alt="Kipu Llama Agrónoma"
            className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-200"
          />
          <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white animate-bounce">
            💬
          </span>
        </div>

        {/* Interactive Speech Bubble */}
        <div
          onClick={handleNextQuote}
          className="flex-1 relative bg-gradient-to-br from-emerald-50/90 to-teal-50/50 border-2 border-emerald-500 border-b-4 border-b-emerald-600 rounded-3xl p-3 shadow-xs cursor-pointer hover:border-emerald-600 transition"
        >
          <div className="absolute top-6 -left-2 w-3.5 h-3.5 bg-emerald-50 border-b-2 border-l-2 border-emerald-500 transform rotate-45" />

          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1">
              <span>{activeTip.icon}</span>
              <span>{activeTip.title}</span>
            </span>
            <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/60 text-emerald-900 border border-emerald-300">
              {activeTip.tag}
            </span>
          </div>

          <p
            className={`text-[11px] text-slate-800 leading-snug font-sans font-medium transition-opacity duration-150 ${
              isAnimating ? 'opacity-20' : 'opacity-100'
            }`}
          >
            {activeTip.quote}
          </p>

          <div className="mt-1.5 flex items-center justify-between text-[9px] text-emerald-800 font-bold border-t border-emerald-200/60 pt-1">
            <span>Toca para aprender más saberes</span>
            <span className="flex items-center gap-0.5">
              <span>{activeQuoteIndex + 1}/4</span>
              <ChevronRight className="w-3 h-3 text-emerald-700" />
            </span>
          </div>
        </div>
      </div>

      {/* Los 4 Pilares de Sabiduría Agronómica de Kipu */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block px-1">
          Los 4 Pilares de Kipu para Vencer la Sequía:
        </span>

        <div className="grid grid-cols-2 gap-2 text-left">
          {/* Pilar 1 */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-emerald-300 transition">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-900">
              <span>🖐️</span>
              <span>Prueba del Puño</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
              Apretar tierra a 15 cm calibra con tus manos los radares orbitales SMAP.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-emerald-300 transition">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-900">
              <span>🔄</span>
              <span>Rotación Tarwi</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
              Fija +95 kg de N₂ por hectárea y corta el ciclo biológico del gorgojo (-84%).
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-emerald-300 transition">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-900">
              <span>🌾</span>
              <span>Mulch Protector</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
              No quemes rastrojo: reduce la evaporación solar diurna hasta en 40%.
            </p>
          </div>

          {/* Pilar 4 */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:border-emerald-300 transition">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-900">
              <span>🛰️</span>
              <span>Alianza con Astro</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-1 leading-snug">
              NASA escanea desde 685 km; Kipu valida en el surco con la comunidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
