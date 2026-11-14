'use client';

import React from 'react';
import { X } from 'lucide-react';
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
      {/* Top Header: Progress Bar (8 Pasos) */}
      <div className="bg-white px-5 pt-4 pb-2 sticky top-0 z-10 border-b border-slate-100/80">
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
          <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                currentDialog.speaker === 'astro' ? 'bg-sky-600' : 'bg-emerald-600'
              }`}
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <span className="text-xs font-mono font-bold text-slate-500">
            {step}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Hero Mascot & Speech Bubble */}
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
            className={`w-full h-full object-contain filter drop-shadow-md transition-all duration-300 ${
              isHappy ? 'scale-105' : 'scale-100'
            }`}
          />
        </div>

        {/* Comic Speech Bubble with Directional Tail */}
        <div
          className={`flex-1 relative bg-white border-2 border-b-4 rounded-3xl p-4 shadow-xs transition-colors duration-300 ${currentDialog.bubbleBorder}`}
        >
          <div
            className={`absolute top-7 -left-2.5 w-4 h-4 bg-white border-b-2 border-l-2 transform rotate-45 ${
              currentDialog.speaker === 'astro' ? 'border-sky-500' : 'border-emerald-600'
            }`}
          />

          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wide">
              {currentDialog.name}
            </span>
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${currentDialog.tagColor}`}>
              {currentDialog.tag}
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
    </>
  );
}
