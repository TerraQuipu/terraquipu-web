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
      {/* Top Header: Progress Bar (8 Pasos) - Dark Forest Glass */}
      <div className="bg-[#0A1A0F]/90 backdrop-blur-md px-5 pt-4 pb-2 sticky top-0 z-10 border-b border-emerald-500/20">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl transition cursor-pointer"
              title="Cerrar asistente"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Duolingo-style Progress Bar */}
          <div className="flex-1 bg-slate-950/80 h-3 rounded-full overflow-hidden border border-emerald-500/30">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                currentDialog.speaker === 'astro'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-400'
                  : 'bg-gradient-to-r from-emerald-500 to-lime-400'
              }`}
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400">
            {step}/{totalSteps}
          </span>
        </div>
      </div>

      {/* Hero Mascot & Speech Bubble (Solo en pasos interactivos; en el paso final de conclusión WizardStepConclusion muestra la celebración) */}
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
              className={`w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-all duration-300 ${
                isHappy ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>

          {/* Comic Speech Bubble with Directional Tail - Dark Forest Glass */}
          <div
            className="flex-1 relative bg-[#132A1C]/90 border border-emerald-500/40 rounded-3xl p-4 shadow-2xl backdrop-blur-md transition-colors duration-300 text-slate-100"
          >
            <div
              className="absolute top-7 -left-2.5 w-4 h-4 bg-[#132A1C] border-b border-l border-emerald-500/40 transform rotate-45"
            />

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-extrabold text-[11px] text-white uppercase tracking-wide flex items-center gap-1.5">
                <span>{currentDialog.name}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </span>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${currentDialog.tagColor}`}>
                {currentDialog.tag}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
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
