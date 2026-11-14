'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface WizardStep7ElNinoProps {
  sowingWindow: 'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana' | '';
  onSelect: (window: 'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana') => void;
}

export default function WizardStep7ElNino({
  sowingWindow,
  onSelect,
}: WizardStep7ElNinoProps) {
  const options = [
    {
      id: 'esta_semana' as const,
      label: 'Ya empecé / Esta semana',
      desc: 'Labores de siembra inmediata. Se activan medidas urgentes de mulch.',
      emoji: '⚡',
    },
    {
      id: '2_4_semanas' as const,
      label: 'En 2 a 4 semanas',
      desc: 'Preparación de terreno con tiempo para incorporar rastrojos y ceniza.',
      emoji: '🗓️',
    },
    {
      id: '1_2_meses' as const,
      label: 'En 1 a 2 meses',
      desc: 'Esperando consolidación de lluvias de verano para siembra tardía.',
      emoji: '⏳',
    },
    {
      id: 'proxima_campana' as const,
      label: 'Esperaré a la próxima campaña',
      desc: 'Estrategia conservadora: dejar el suelo en descanso con leguminosas.',
      emoji: '⏸️',
    },
  ];

  return (
    <div className="space-y-3 animate-in fade-in flex-1">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            ⚠️ Alerta ENOS ENFEN
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
          5. Según la alerta El Niño: ¿Cuándo piensas sembrar?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ajusta las fechas de preparación para evitar pérdidas por sequía:
        </p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = sowingWindow === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-amber-500 border-b-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-500/20 active:border-b-2 active:translate-y-0.5'
                  : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                </div>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
