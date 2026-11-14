'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface WizardStep5CoverProps {
  cropCoverNdvi: 'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo' | '';
  onSelect: (cover: 'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo') => void;
}

export default function WizardStep5Cover({
  cropCoverNdvi,
  onSelect,
}: WizardStep5CoverProps) {
  const options = [
    {
      id: 'sembrado' as const,
      label: 'Con cultivo sembrado',
      desc: 'Plantas creciendo vigorosas, follaje verde activo cubriendo el suelo.',
      emoji: '🌱',
    },
    {
      id: 'barbecho' as const,
      label: 'En descanso / barbecho',
      desc: 'Suelo descansando con rastrojos y materia orgánica de la cosecha previa.',
      emoji: '🍂',
    },
    {
      id: 'pasto' as const,
      label: 'Con pasto natural',
      desc: 'Cobertura forrajera o pradera andina que protege el terreno.',
      emoji: '🌾',
    },
    {
      id: 'suelo_desnudo' as const,
      label: 'Tierra pelada (Sin rastrojo)',
      desc: 'Suelo expuesto al sol y al viento, alto riesgo de erosión y arrastre.',
      emoji: '🏜️',
    },
  ];

  return (
    <div className="space-y-3 animate-in fade-in flex-1">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
            🛰️ Sentinel-2 NDVI
          </span>
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
          3. El satélite escanea tu chacra hoy: ¿Cómo está realmente?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Valida el índice NDVI y mide el riesgo de erosión hídrica:
        </p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = cropCoverNdvi === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
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
