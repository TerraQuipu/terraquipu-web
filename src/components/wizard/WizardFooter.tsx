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
    <div className="pt-4 pb-2 border-t border-slate-100 flex items-center justify-between gap-3 sticky bottom-0 bg-white">
      {step > 1 ? (
        <button
          type="button"
          onClick={onPrev}
          className="py-3 px-4 rounded-2xl bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 active:border-b-2 active:translate-y-0.5 transition cursor-pointer"
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
          className={`flex-1 max-w-[240px] py-4 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition ml-auto ${
            canProceed
              ? speaker === 'astro'
                ? 'bg-sky-600 hover:bg-sky-700 border-b-4 border-b-sky-800 text-white shadow-md active:border-b-2 active:translate-y-0.5 cursor-pointer animate-in fade-in'
                : 'bg-emerald-700 hover:bg-emerald-800 border-b-4 border-b-emerald-900 text-white shadow-md active:border-b-2 active:translate-y-0.5 cursor-pointer animate-in fade-in'
              : 'bg-slate-100 border-2 border-slate-200 border-b-4 border-b-slate-300 text-slate-400 cursor-not-allowed opacity-70'
          }`}
        >
          <span className={canProceed ? 'contrast-bold-white' : ''}>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          disabled={!canProceed}
          onClick={onFinish}
          className={`flex-1 py-4 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition ${
            canProceed
              ? 'bg-emerald-700 hover:bg-emerald-800 border-b-4 border-b-emerald-900 text-white shadow-lg active:border-b-2 active:translate-y-0.5 cursor-pointer animate-in fade-in'
              : 'bg-slate-100 border-2 border-slate-200 border-b-4 border-b-slate-300 text-slate-400 cursor-not-allowed opacity-70'
          }`}
        >
          <Check className="w-5 h-5 text-emerald-200" />
          <span className={canProceed ? 'contrast-bold-white' : ''}>
            Guardar &amp; Entrar a mi Chacra ({areaHa} ha)
          </span>
        </button>
      )}
    </div>
  );
}
