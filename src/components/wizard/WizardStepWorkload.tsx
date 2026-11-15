'use client';

import React from 'react';
import { Users, Clock } from 'lucide-react';
import { DisponibilidadPersonas, TiempoSemanal } from '@/lib/agroenvironmentalEngine';

interface WizardStepWorkloadProps {
  personas: DisponibilidadPersonas;
  tiempoSemanal: TiempoSemanal;
  onUpdate: (personas: DisponibilidadPersonas, tiempo: TiempoSemanal) => void;
}

export default function WizardStepWorkload({
  personas,
  tiempoSemanal,
  onUpdate,
}: WizardStepWorkloadProps) {
  const personasOptions = [
    { id: 'solo_yo' as const, label: 'Solo Yo', desc: '1 persona; máximo 2 tareas livianas por bloque', emoji: '🧑‍🌾' },
    { id: 'dos_o_tres' as const, label: '2 o 3 Personas', desc: 'Ayuda familiar; tareas de mediano esfuerzo', emoji: '👨‍👩‍👦' },
    { id: 'cuatro_o_mas' as const, label: '4 o más Personas', desc: 'Faena comunal o ayni; obras estructurales', emoji: '👥' },
  ];

  const tiempoOptions = [
    { id: 'poco' as const, label: 'Poco Tiempo', desc: 'Unas pocas horas a la semana', emoji: '⏳' },
    { id: 'algo' as const, label: 'Tiempo Moderado', desc: '2 a 3 días por semana', emoji: '⏱️' },
    { id: 'bastante' as const, label: 'Tiempo Completo', desc: 'Dedicación diaria en la chacra', emoji: '☀️' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in flex-1">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
          Disponibilidad de Mano de Obra y Tiempo
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Esta información no castiga la vulnerabilidad; solo adapta la cantidad y dificultad de las acciones del calendario:
        </p>
      </div>

      {/* Personas */}
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-700" />
          <span>¿Cuántas personas trabajan la parcela?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {personasOptions.map((opt) => {
            const isSelected = personas === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdate(opt.id, tiempoSemanal)}
                className={`p-3 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tiempo */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-sky-700" />
          <span>¿Cuánto tiempo disponible tienes a la semana?</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {tiempoOptions.map((opt) => {
            const isSelected = tiempoSemanal === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdate(personas, opt.id)}
                className={`p-3 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-sky-600 border-b-sky-700 bg-sky-50 text-sky-950 font-bold ring-2 ring-sky-500/20 active:border-b-2 active:translate-y-0.5'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                }`}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
