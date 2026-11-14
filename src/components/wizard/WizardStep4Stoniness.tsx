'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface WizardStep4StoninessProps {
  soilStoniness: 'pedregoso' | 'profundo' | '';
  onSelect: (stoniness: 'pedregoso' | 'profundo') => void;
}

export default function WizardStep4Stoniness({
  soilStoniness,
  onSelect,
}: WizardStep4StoninessProps) {
  const options = [
    {
      id: 'pedregoso' as const,
      label: 'Sí (Suelo delgado o pedregoso)',
      desc: 'Mucha piedra superficial, roca madre cercana. Requiere camellones elevados y mulch.',
      emoji: '🪨',
    },
    {
      id: 'profundo' as const,
      label: 'No (Tierra profunda y fértil)',
      desc: 'Capa arable de más de 40 cm. Permite aporque profundo, zanjas y raíces extensas.',
      emoji: '🌾',
    },
  ];

  return (
    <div className="space-y-3 animate-in fade-in flex-1">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
          2. ¿Tu chacra tiene muchas piedras o tierra poco profunda?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Determina si es viable cavar zanjas de infiltración o zanjas trampa:
        </p>
      </div>

      <div className="space-y-2.5">
        {options.map((opt) => {
          const isSelected = soilStoniness === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`w-full p-4 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                  : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opt.desc}</div>
                </div>
              </div>
              {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
