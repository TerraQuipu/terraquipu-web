'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface WizardFooterProps {
  step: number;
  totalSteps?: number;
  canProceed: boolean;
  speaker: 'astro' | 'kipu';
  areaHa: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function WizardFooter({
  step,
  totalSteps = 8,
  canProceed,
  speaker,
  areaHa,
  onPrev,
  onNext,
  onFinish,
}: WizardFooterProps) {
  return (
    <div className="pt-4 pb-4 border-t border-emerald-500/20 flex items-center justify-between gap-3 sticky bottom-0 bg-[#0A1A0F]/90 backdrop-blur-xl px-2">
      {step > 1 ? (
        <button
          type="button"
          onClick={onPrev}
          className="py-3 px-4 rounded-2xl bg-[#132A1C]/80 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>
      ) : (
        <div />
      )}

      {step < totalSteps ? (
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className={`flex-1 max-w-[240px] py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition ml-auto ${
            canProceed
              ? 'bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 shadow-lg shadow-lime-500/20 active:scale-95 cursor-pointer animate-in fade-in'
              : 'bg-[#132A1C]/50 border border-emerald-500/20 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          disabled={!canProceed}
          onClick={onFinish}
          className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition ${
            canProceed
              ? 'bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 shadow-xl shadow-lime-500/30 active:scale-95 cursor-pointer animate-in fade-in'
              : 'bg-[#132A1C]/50 border border-emerald-500/20 text-slate-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Check className="w-5 h-5 text-emerald-950" />
          <span>Completar y Calibrar Parcela</span>
        </button>
      )}
    </div>
  );
}
