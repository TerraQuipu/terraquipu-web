'use client';

import React from 'react';
import { X, Satellite, Sprout } from 'lucide-react';
import TypewriterText from '../TypewriterText';

export interface DialogSpeakerConfig {
  step: number;
  speaker: 'astro' | 'kipu';
  name: string;
  tag: string;
  avatar: string;
  bubbleBorder: string;
  tagColor: string;
  speech: string;
}

interface WizardDialogHeaderProps {
  step: number;
  totalSteps?: number;
  currentDialog: DialogSpeakerConfig;
  isHappy: boolean;
  onCancel?: () => void;
}

export default function WizardDialogHeader({
  step,
  totalSteps = 8,
  currentDialog,
  isHappy,
  onCancel,
}: WizardDialogHeaderProps) {
  return (
    <>
      {/* Top Header: Progress Bar - Clean Light Duolingo Style */}
      <div className="bg-white/95 backdrop-blur-md px-5 pt-4 pb-2 sticky top-0 z-10 border-b border-slate-200">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl transition cursor-pointer"
              title="Cerrar asistente"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Duolingo-style Progress Bar */}
          <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                currentDialog.speaker === 'astro'
                  ? 'bg-[#0284C7]'
                  : 'bg-[#16A34A]'
              }`}
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <span className="text-xs font-mono font-bold text-slate-600">
            {step}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Hero Mascot & Speech Bubble */}
      {step < totalSteps && (
        <div className="flex items-center gap-3.5 pt-2 pb-3">
          {/* Mascot Avatar (Astro or Kipu with happy reaction) */}
          <div className="w-28 sm:w-32 h-36 sm:h-40 flex-shrink-0 relative flex items-center justify-center">
            <img
              src={
                currentDialog.speaker === 'astro'
                  ? '/images/astro_satelin.png'
                  : isHappy
                  ? '/images/kipu_llama_happy.png'
                  : '/images/kipu_llama.png'
              }
              alt={currentDialog.name}
              className={`w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-all duration-300 ${
                isHappy ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>

          {/* Comic Speech Bubble with Directional Tail - Light Duolingo Theme */}
          <div
            className={`flex-1 relative bg-white rounded-3xl p-4 shadow-sm transition-colors duration-300 text-slate-800 ${
              currentDialog.speaker === 'astro'
                ? 'border-2 border-[#0284C7]'
                : 'border-2 border-emerald-600'
            }`}
          >
            <div
              className={`absolute top-7 -left-2.5 w-4 h-4 bg-white transform rotate-45 ${
                currentDialog.speaker === 'astro'
                  ? 'border-b-2 border-l-2 border-[#0284C7]'
                  : 'border-b-2 border-l-2 border-emerald-600'
              }`}
            />

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <span>{currentDialog.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  currentDialog.speaker === 'astro' ? 'bg-[#0284C7]' : 'bg-emerald-600'
                }`} />
              </span>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                currentDialog.speaker === 'astro'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {currentDialog.speaker === 'astro' ? (
                  <Satellite className="w-2.5 h-2.5 text-sky-600" />
                ) : (
                  <Sprout className="w-2.5 h-2.5 text-emerald-600" />
                )}
                <span>{currentDialog.tag}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-medium">
              <TypewriterText
                key={`${step}-${isHappy ? 'happy' : 'normal'}`}
                text={isHappy ? '¡Excelente elección! Opción registrada con éxito.' : currentDialog.speech}
                speed={15}
              />
            </p>
          </div>
        </div>
      )}
    </>
  );
}
