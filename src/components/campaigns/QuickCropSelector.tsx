'use client';

import React from 'react';
import { Cultivo } from '@/lib/types';
import { playBubblePop } from '@/lib/soundEffects';

interface QuickCropSelectorProps {
  cultivos: Cultivo[];
  selectedCropId: string;
  selectedPriority: 'tierra' | 'mercado' | 'comida';
  onSelectCrop: (cropId: string) => void;
  onSelectPriority: (priority: 'tierra' | 'mercado' | 'comida') => void;
}

export default function QuickCropSelector({
  cultivos,
  selectedCropId,
  selectedPriority,
  onSelectCrop,
  onSelectPriority,
}: QuickCropSelectorProps) {
  const priorities: { id: 'tierra' | 'comida' | 'mercado'; icon: string; label: string; desc: string }[] = [
    { id: 'tierra', icon: '🌿', label: 'Abonar Suelo', desc: 'Fijar N & cortar gorgojo' },
    { id: 'comida', icon: '🍲', label: 'Sustento Casa', desc: 'Comida para el hogar' },
    { id: 'mercado', icon: '💰', label: 'Venta Feria', desc: 'Mayor precio y ganancia' },
  ];

  const currentCrop = cultivos.find((c) => c.crop_id === selectedCropId);

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 border-b-4 border-b-slate-300 p-4 space-y-3.5 shadow-2xs">
      {/* 1. Selector Horizontal Rápido de Cultivo Anterior (Sin acordeones ni dropdowns) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center">
              1
            </span>
            <span>¿Qué cosechaste la última campaña?</span>
          </span>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            {currentCrop?.nombre_comun || 'Cultivo'}
          </span>
        </div>

        <p className="text-[11px] text-slate-500">
          Toca tu cultivo cosechado para recalcular la extracción de nutrientes:
        </p>

        {/* Fila horizontal táctil de chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
          {cultivos.map((c) => {
            const isSelected = selectedCropId === c.crop_id;
            return (
              <button
                key={c.crop_id}
                type="button"
                onClick={() => {
                  playBubblePop();
                  onSelectCrop(c.crop_id);
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-2xl border-2 border-b-4 flex items-center gap-2.5 transition-all active:border-b-2 active:translate-y-0.5 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold hover:border-slate-300'
                }`}
              >
                <span className="text-xl flex-shrink-0">{c.icono_emoji || '🌱'}</span>
                <div className="text-left">
                  <div className="text-xs leading-none whitespace-nowrap">{c.nombre_comun}</div>
                  <div
                    className={`text-[10px] font-mono mt-1 ${
                      c.balance_nitrogeno_kg_ha > 0 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-medium'
                    }`}
                  >
                    {c.balance_nitrogeno_kg_ha > 0 ? `+${c.balance_nitrogeno_kg_ha}` : c.balance_nitrogeno_kg_ha} kg N
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selector Segmentado de Prioridad (1 Toque) */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-lg bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center">
              2
            </span>
            <span>¿Cuál es tu prioridad este año?</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {priorities.map((p) => {
            const isSelected = selectedPriority === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  playBubblePop();
                  onSelectPriority(p.id);
                }}
                className={`py-2 px-1 rounded-xl text-xs flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-emerald-950 shadow-sm border border-emerald-500 font-black ring-1 ring-emerald-500/30'
                    : 'text-slate-600 hover:text-slate-900 font-bold hover:bg-white/50'
                }`}
              >
                <span className="text-base">{p.icon}</span>
                <span className="text-[11px] leading-tight mt-0.5 truncate max-w-full font-bold">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
