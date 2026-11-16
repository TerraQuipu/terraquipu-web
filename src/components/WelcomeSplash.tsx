'use client';

import React from 'react';
import { ArrowRight, ChevronRight, Droplets, Leaf, Sprout } from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';

interface WelcomeSplashProps {
  onStartWizard: () => void;
}

export default function WelcomeSplash({
  onStartWizard,
}: WelcomeSplashProps) {
  const handleStart = () => {
    playSuccessFanfare();
    onStartWizard();
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between bg-[#0A1A0F] text-white overflow-hidden font-sans">
      {/* 1. Fondo Agrícola Andino Dorado con Gradientes Suaves */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('/images/trigo_viento_poster.jpg')`,
            filter: 'brightness(0.72) saturate(1.15)',
          }}
        />
        {/* Degradado superior para contraste de barra */}
        <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#0A1A0F]/90 via-[#0A1A0F]/45 to-transparent" />
        {/* Degradado inferior profundo para textos y botones */}
        <div className="absolute bottom-0 inset-x-0 h-[65%] bg-gradient-to-t from-[#0A1A0F] via-[#0A1A0F]/95 to-transparent" />
        <div className="absolute inset-0 bg-[#0A1A0F]/30 backdrop-blur-[0.5px]" />
      </div>

      {/* 2. Barra Superior */}
      <div className="relative z-10 px-5 pt-7 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#132A1C]/85 border border-emerald-500/30 backdrop-blur-md shadow-md">
          <Sprout className="w-4 h-4 text-[#A3E635]" />
          <span className="text-xs font-semibold tracking-wide text-white lowercase">
            terraquipu
          </span>
        </div>
      </div>

      {/* 3. Píldoras Flotantes de Telemetría Real (Adaptadas de Imagen 4) */}
      <div className="relative z-10 px-5 my-auto flex flex-col items-center gap-3 w-full max-w-sm mx-auto">
        <div className="self-start flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#132A1C]/90 border border-emerald-500/30 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-left duration-700">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-[#A3E635]">
            <Leaf className="w-3.5 h-3.5 text-[#A3E635]" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-300 font-medium">Vigor vegetal Sentinel-2</div>
            <div className="text-xs font-bold text-[#A3E635]">82% Buen Estado</div>
          </div>
        </div>

        <div className="self-end flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#132A1C]/90 border border-cyan-500/30 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-right duration-700 delay-150">
          <div className="w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
            <Droplets className="w-3.5 h-3.5 text-cyan-300" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-300 font-medium">Humedad de suelo NASA SMAP</div>
            <div className="text-xs font-bold text-cyan-300">18% en Rango Óptimo</div>
          </div>
        </div>
      </div>

      {/* 4. Bloque Inferior con Titular y Botón de Inicio */}
      <div className="relative z-10 px-6 pb-10 space-y-5 max-w-md mx-auto w-full">
        <div className="space-y-2 text-left">
          <span className="text-[11px] font-semibold tracking-wider text-[#A3E635] uppercase block">
            Plataforma Agroclimática Andina
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white leading-tight font-sans">
            LA NUEVA ERA DE LA
            <br />
            <span className="text-[#A3E635]">AGRICULTURA ANDINA</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed font-sans">
            Inteligencia satelital NASA y saberes ancestrales para tu chacra. Monitorea humedad, heladas y rotación de cultivos en tiempo real.
          </p>
        </div>

        {/* Botón Principal: Empezar Ahora */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 px-5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-semibold text-sm shadow-2xl shadow-lime-600/40 transition active:scale-95 cursor-pointer flex items-center justify-between group"
          >
            <span className="text-sm font-bold text-[#132A1C]">
              Empezar Ahora
            </span>
            <div className="w-8 h-8 rounded-full bg-[#132A1C] text-white flex items-center justify-center shadow-md group-hover:translate-x-0.5 transition">
              <ArrowRight className="w-4 h-4 text-[#A3E635]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
