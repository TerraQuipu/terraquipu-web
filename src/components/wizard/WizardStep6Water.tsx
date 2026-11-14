'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface WizardStep6WaterProps {
  waterSource: 'secano' | 'auxilio' | 'permanente' | '';
  onSelect: (source: 'secano' | 'auxilio' | 'permanente') => void;
}

export default function WizardStep6Water({
  waterSource,
  onSelect,
}: WizardStep6WaterProps) {
  const options = [
    {
      id: 'secano' as const,
      label: 'Solo lluvia (Secano)',
      desc: 'Depende 100% del ciclo natural de lluvias. Requiere cultivos rústicos.',
      emoji: '🌧️',
    },
    {
      id: 'auxilio' as const,
      label: 'Lluvia + Riego de auxilio',
      desc: 'Cuenta con canal rústico, sequía o reservorio para salvar sequías cortas.',
      emoji: '💧',
    },
    {
      id: 'permanente' as const,
      label: 'Riego permanente tecnificado',
      desc: 'Aspersión o goteo constante. Permite cultivos de alta exigencia.',
      emoji: '🚰',
    },
  ];

  return (
    <div className="space-y-3 animate-in fade-in flex-1">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
            🌧️ NASA GPM / IMERG
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
          4. ¿De dónde saca agua para esta chacra?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Cruza telemetría de lluvia para calibrar la demanda hídrica:
        </p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = waterSource === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`w-full p-4 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-sky-600 border-b-sky-700 bg-sky-50 text-sky-950 font-bold ring-2 ring-sky-500/20 active:border-b-2 active:translate-y-0.5'
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
              {isSelected && <CheckCircle2 className="w-5 h-5 text-sky-700 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
