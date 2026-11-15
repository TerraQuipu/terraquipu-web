'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { EstadoObras } from '@/lib/agroenvironmentalEngine';

interface WizardStepConservationProps {
  obras: EstadoObras;
  onSelect: (obras: EstadoObras) => void;
}

export default function WizardStepConservation({ obras, onSelect }: WizardStepConservationProps) {
  const options = [
    {
      id: 'buen_estado' as const,
      label: 'Obras en Buen Estado',
      desc: 'Terrazas, andenes o zanjas bien mantenidas, sin derrumbes ni fisuras',
      emoji: '🧱',
    },
    {
      id: 'mal_estado' as const,
      label: 'Obras en Mal Estado / Deterioradas',
      desc: 'Muros caídos, zanjas colmatadas de tierra; requiere reparación urgente',
      emoji: '⚠️',
    },
    {
      id: 'ninguna' as const,
      label: 'Ninguna Obra de Conservación',
      desc: 'Terreno al natural en ladera; alta susceptibilidad a escorrentía',
      emoji: '🏞️',
    },
  ];

  return (
    <div className="space-y-3 animate-in fade-in flex-1">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
          ¿Tu chacra cuenta con obras de conservación de suelos?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Andenes, terrazas, zanjas o muros de contención en la ladera:
        </p>
      </div>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = obras === opt.id;
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
