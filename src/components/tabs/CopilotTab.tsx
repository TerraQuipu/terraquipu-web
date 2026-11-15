'use client';

import React, { useState, useEffect } from 'react';
import { FarmerProfile, ClimaNasa } from '@/lib/types';
import {
  Globe,
  Sun,
  Sprout,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';

interface CopilotTabProps {
  profile: FarmerProfile;
  climaNasa?: ClimaNasa | null;
  smapPercent?: number;
  initialVoice?: 'astro' | 'kipu';
  onOpenDiagnostic: () => void;
  onToast?: (msg: string) => void;
}

export default function CopilotTab({
  profile,
  climaNasa,
  smapPercent = 16,
  initialVoice = 'astro',
  onOpenDiagnostic,
  onToast,
}: CopilotTabProps) {
  const [activeVoice, setActiveVoice] = useState<'astro' | 'kipu'>(initialVoice);

  useEffect(() => {
    if (initialVoice) {
      setActiveVoice(initialVoice);
    }
  }, [initialVoice]);

  return (
    <div className="space-y-4 animate-in fade-in pb-16">
      {/* 1. Header Section */}
      <div className="flex items-start justify-between px-1 pt-1">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60 block">
            DOS FORMAS DE LEER EL TERRITORIO
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#132A1C] leading-tight">
            Datos y memoria,{' '}
            <span className="font-serif italic text-emerald-800 font-normal">
              en conversación.
            </span>
          </h1>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-[#EAF3E3] text-emerald-900 flex items-center justify-center border border-[#D5E5CD] shadow-2xs">
          <Globe className="w-5 h-5 text-emerald-800" />
        </div>
      </div>

      {/* 2. Dual Character Selector Cards (Frame 013) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Astro Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            playBubblePop();
            setActiveVoice('astro');
          }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-xs ${
            activeVoice === 'astro'
              ? 'bg-white border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
              : 'bg-white border-[#E5ECE2] hover:bg-zinc-50 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 overflow-hidden border border-amber-200">
              <img
                src="/images/astro_satelin.png"
                alt="Astro"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <Sun className="w-4 h-4 hidden" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-[#132A1C] leading-none">Astro</h3>
              <span className="text-[10px] text-zinc-500 truncate block mt-0.5">
                Ojos en el cielo
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 shrink-0 ${activeVoice === 'astro' ? 'text-amber-700' : 'text-zinc-400'}`} />
        </div>

        {/* Kipu Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            playBubblePop();
            setActiveVoice('kipu');
          }}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-xs ${
            activeVoice === 'kipu'
              ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-[#E5ECE2] hover:bg-zinc-50 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800 overflow-hidden border border-emerald-200">
              <img
                src="/images/kipu_llama_happy.png"
                alt="Kipu"
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <Sprout className="w-4 h-4 hidden" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-[#132A1C] leading-none">Kipu</h3>
              <span className="text-[10px] text-zinc-500 truncate block mt-0.5">
                Saber de la tierra
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 shrink-0 ${activeVoice === 'kipu' ? 'text-emerald-800' : 'text-zinc-400'}`} />
        </div>
      </div>

      {/* 3. Reading Card (Dark Forest Green Block #1A3D24 - Frame 013) */}
      <div className="bg-[#1A3D24] rounded-3xl p-5 text-white shadow-md border border-emerald-900/60 space-y-4">
        {/* Card Header with Radar Widget */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
            {activeVoice === 'astro'
              ? 'LECTURA SATELITAL · SMAP • GPM'
              : 'SABER ANCESTRAL · OBSERVACIÓN ANDINA'}
          </span>

          {/* Radar animation widget around icon */}
          <div className="relative flex items-center justify-center w-8 h-8">
            <span className="absolute w-8 h-8 rounded-full border border-emerald-400/30 animate-ping" />
            <span className="absolute w-7 h-7 rounded-full border border-emerald-400/40" />
            <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-emerald-300 z-10">
              {activeVoice === 'astro' ? (
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              ) : (
                <Sprout className="w-3.5 h-3.5 text-[#A3E635]" />
              )}
            </div>
          </div>
        </div>

        {/* Title (Editorial Serif Italic) */}
        <h2 className="text-xl font-black text-white leading-tight">
          {activeVoice === 'astro' ? (
            <>
              La lluvia tarda.{' '}
              <span className="block font-serif italic text-emerald-200 font-normal">
                El suelo lo siente.
              </span>
            </>
          ) : (
            <>
              Las señas del cielo y de la tierra{' '}
              <span className="block font-serif italic text-[#A3E635] font-normal">
                coinciden.
              </span>
            </>
          )}
        </h2>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed">
          {activeVoice === 'astro'
            ? `SMAP registra ${smapPercent}% de humedad superficial, 8 puntos debajo del promedio local. Las próximas 72 horas seguirán secas en ${profile.distrito || 'Urubamba'}.`
            : `El viento helado de la tarde y la floración temprana del llihuallihua indican que el agua demorará unas semanas más en los andenes de ${profile.distrito || 'Maras'}.`}
        </p>

        {/* Inner Recommendation Card */}
        <div className="bg-[#132A1C]/90 rounded-2xl p-3.5 border border-emerald-800/40 space-y-1">
          <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-400 block">
            {activeVoice === 'astro' ? 'RECOMENDACIÓN' : 'CONSEJO DE CHACRA'}
          </span>
          <p className="text-xs font-semibold text-white leading-snug">
            {activeVoice === 'astro'
              ? 'Conserva el mulch y revisa tus surcos al amanecer.'
              : 'Aporca alto, cubre con paja de cebada y cuida la humedad de la papa sembrada.'}
          </p>
        </div>

        {/* Footnote */}
        <div className="text-[10px] text-zinc-400 font-medium">
          {activeVoice === 'astro'
            ? 'NASA SMAP · Actualizado hoy, 06:20'
            : 'Sabiduría comunal · Transmitida por generaciones'}
        </div>
      </div>

      {/* 4. Section: UNA ACCIÓN PARA HOY (Frame 013) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] space-y-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60 block">
          UNA ACCIÓN PARA HOY
        </span>

        <div>
          <h3 className="text-base font-black text-[#132A1C]">
            Contrasta el dato con tu chacra.
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
            Haz un diagnóstico breve y registra lo que observas en el suelo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            playSuccessFanfare();
            onOpenDiagnostic();
          }}
          className="w-full py-3.5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-black text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
        >
          <span>Evaluar suelo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5. Footnote Guarantee */}
      <div className="flex items-start gap-2 px-1 text-xs text-zinc-500 leading-relaxed font-medium">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="text-[11px]">
          Astro aporta mediciones orientativas. Kipu recoge conocimientos compartidos por productores locales.
        </p>
      </div>
    </div>
  );
}
