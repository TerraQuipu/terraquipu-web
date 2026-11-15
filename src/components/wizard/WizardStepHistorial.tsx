'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface WizardStepHistorialProps {
  vezAnterior: string;
  antesDeEsa: string;
  onUpdate: (vezAnterior: string, antesDeEsa: string) => void;
}

export default function WizardStepHistorial({
  vezAnterior,
  antesDeEsa,
  onUpdate,
}: WizardStepHistorialProps) {
  const cropChoices = [
    { id: 'papa', label: 'Papa Nativa', emoji: '🥔' },
    { id: 'quinua', label: 'Quinua Real', emoji: '🌾' },
    { id: 'olluco', label: 'Olluco Andino', emoji: '🫘' },
    { id: 'oca', label: 'Oca Dulce', emoji: '🍠' },
    { id: 'tarwi', label: 'Tarwi / Chocho', emoji: '🌱' },
    { id: 'haba', label: 'Haba Verde', emoji: '🌿' },
    { id: 'descanso', label: 'Descanso / Barbecho', emoji: '💤' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in flex-1">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-emerald-700" />
          <span>Historial Agrícola de las Últimas 2 Campañas</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          El algoritmo A13 requiere conocer los 2 cultivos precedentes para alternar familias botánicas y romper plagas:
        </p>
      </div>

      {/* 1. Campaña Anterior (Último cultivo) */}
      <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <label className="text-xs font-black text-slate-900 block">
          1. ¿Qué cosechaste en la campaña anterior más reciente?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cropChoices.map((c) => {
            const isSelected = vezAnterior === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onUpdate(c.id, antesDeEsa)}
                className={`p-2.5 rounded-xl border-2 border-b-4 text-left transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-700'
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="text-xs font-bold truncate">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Hace 2 Campañas (Penúltimo cultivo) */}
      <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
        <label className="text-xs font-black text-slate-900 block">
          2. ¿Qué hubo antes de esa campaña (hace 2 campañas)?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cropChoices.map((c) => {
            const isSelected = antesDeEsa === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onUpdate(vezAnterior, c.id)}
                className={`p-2.5 rounded-xl border-2 border-b-4 text-left transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-sky-600 border-b-sky-700 bg-sky-50 text-sky-950 font-bold ring-2 ring-sky-500/20 active:border-b-2 active:translate-y-0.5'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-700'
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="text-xs font-bold truncate">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
