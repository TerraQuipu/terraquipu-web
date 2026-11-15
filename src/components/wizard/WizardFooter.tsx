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
    <div className="pt-4 pb-4 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 bg-white/95 backdrop-blur-md px-2 z-20">
      {step > 1 ? (
        <button
          type="button"
          onClick={onPrev}
          className="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
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
          className={`flex-1 max-w-[240px] py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition ml-auto ${
            canProceed
              ? speaker === 'astro'
                ? 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md active:scale-95 cursor-pointer animate-in fade-in'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 cursor-pointer animate-in fade-in'
              : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
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
          className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition ${
            canProceed
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95 cursor-pointer animate-in fade-in'
              : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Check className="w-5 h-5 text-white" />
          <span>Completar y Calibrar Parcela</span>
        </button>
      )}
    </div>
  );
}
