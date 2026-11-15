'use client';

import React from 'react';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';

interface WelcomeSplashProps {
  onStartWizard: () => void;
  onEnterDirect: () => void;
}

export default function WelcomeSplash({
  onStartWizard,
  onEnterDirect,
}: WelcomeSplashProps) {
  const handleStart = () => {
    playSuccessFanfare();
    onStartWizard();
  };

  const handleDirect = () => {
    playBubblePop();
    onEnterDirect();
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between bg-[#0A1A0F] text-white overflow-hidden font-sans">
      {/* 1. Fondo Cenital de Andenes con Capas de Gradiente Dark Forest */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('/images/andes_bright.jpg')`,
            filter: 'brightness(0.78) saturate(1.15)',
          }}
        />
        {/* Degradé superior para dar contraste */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#0A1A0F]/90 via-[#0A1A0F]/40 to-transparent" />
        {/* Degradé inferior profundo Dark Forest idéntico a Screen 1 de referencia */}
        <div className="absolute bottom-0 inset-x-0 h-[68%] bg-gradient-to-t from-[#0A1A0F] via-[#0A1A0F]/95 to-transparent" />
        <div className="absolute inset-0 bg-[#0A1A0F]/30 backdrop-blur-[1.5px]" />
      </div>

      {/* 2. Barra Superior Sutil */}
      <div className="relative z-10 px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#132A1C]/80 border border-emerald-500/30 backdrop-blur-md">
          <span className="text-sm">🌱</span>
          <span className="text-xs font-black tracking-wide text-emerald-300 uppercase">
            TerraQuipu
          </span>
        </div>
        <button
          type="button"
          onClick={handleDirect}
          className="text-xs font-bold text-slate-300 hover:text-white transition px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 cursor-pointer"
        >
          Saltar al Panel
        </button>
      </div>

      {/* 3. Mascota Kipu Flotante Compacta */}
      <div className="relative z-10 px-6 flex justify-center my-auto">
        <div className="relative group">
          <div className="w-40 h-40 rounded-full bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center p-3 backdrop-blur-sm shadow-2xl shadow-emerald-950/80">
            <img
              src="/images/kipu_llama.png"
              alt="Kipu Mascota"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#132A1C] border border-emerald-400/40 text-[11px] font-black text-emerald-300 flex items-center gap-1 shadow-lg whitespace-nowrap">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Copiloto Satelital & Andino
          </div>
        </div>
      </div>

      {/* 4. Bloque Inferior con Tipografía Display y Botón Píldora de Pantalla 1 */}
      <div className="relative z-10 px-6 pb-10 space-y-5 max-w-md mx-auto w-full">
        <div className="space-y-2 text-left">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight font-sans">
            TU CHACRA,
            <br />
            <span className="text-emerald-400">MÁS INTELIGENTE.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed font-sans">
            Monitorea la salud del suelo, optimiza recursos y aumenta tu cosecha con datos satelitales NASA y saberes ancestrales.
          </p>
        </div>

        {/* Botón Píldora Inspirado en Screen 1: Ícono Circular + Píldora Verde Lima + Flechas */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-2.5 px-3 rounded-full bg-[#34D399] hover:bg-[#10B981] text-[#0A1A0F] font-black text-sm shadow-2xl shadow-emerald-500/40 transition active:scale-95 cursor-pointer flex items-center justify-between group"
          >
            {/* Círculo oscuro con flecha a la izquierda */}
            <div className="w-10 h-10 rounded-full bg-[#0A1A0F] text-white flex items-center justify-center shadow-md shrink-0 group-hover:translate-x-0.5 transition">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>

            {/* Texto central */}
            <span className="text-sm uppercase tracking-wide font-black text-[#0A1A0F]">
              Comenzar Calibración
            </span>

            {/* Indicador de flechas triples a la derecha */}
            <div className="flex items-center text-xs font-black tracking-tighter text-[#0A1A0F]/70 pr-2">
              <ChevronRight className="w-4 h-4 -mr-2" />
              <ChevronRight className="w-4 h-4 -mr-2" />
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Enlace secundario directo */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleDirect}
              className="text-xs font-bold text-emerald-300/80 hover:text-emerald-200 underline underline-offset-4 transition cursor-pointer"
            >
              Ya calibré mi parcela, entrar directo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
