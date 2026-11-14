'use client';

import React from 'react';
import { Cultivo } from '@/lib/types';
import { CheckCircle2, Cpu, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface WizardStep8CropPriorityProps {
  cultivos: Cultivo[];
  selectedCropId: string;
  onSelectCrop: (cropId: string) => void;
  selectedPriority: 'tierra' | 'comida' | 'mercado' | '';
  onSelectPriority: (priority: 'tierra' | 'comida' | 'mercado') => void;
  areaHa: number;
  hardwareId: string;
}

const FALLBACK_CULTIVOS: Cultivo[] = [
  {
    crop_id: 'papa_nativa',
    nombre_comun: 'Papa Nativa Andina',
    familia: 'Solanácea',
    balance_nitrogeno_kg_ha: -30,
    icono_emoji: '🥔',
    demanda_hidrica: 'Media',
    tolerancia_heladas: 'Media',
  } as any,
  {
    crop_id: 'maiz',
    nombre_comun: 'Maíz Blanco Gigante Cusco',
    familia: 'Gramínea',
    balance_nitrogeno_kg_ha: -40,
    icono_emoji: '🌽',
    demanda_hidrica: 'Alta',
    tolerancia_heladas: 'Baja',
  } as any,
  {
    crop_id: 'quinua',
    nombre_comun: 'Quinua Real / Pasankalla',
    familia: 'Amarantácea',
    balance_nitrogeno_kg_ha: -15,
    icono_emoji: '🌾',
    demanda_hidrica: 'Baja',
    tolerancia_heladas: 'Alta',
  } as any,
  {
    crop_id: 'tarwi',
    nombre_comun: 'Tarwi / Chocho',
    familia: 'Leguminosa',
    balance_nitrogeno_kg_ha: 80,
    icono_emoji: '🌱',
    demanda_hidrica: 'Baja',
    tolerancia_heladas: 'Alta',
  } as any,
  {
    crop_id: 'haba',
    nombre_comun: 'Haba Verde / Grano',
    familia: 'Leguminosa',
    balance_nitrogeno_kg_ha: 50,
    icono_emoji: '🌿',
    demanda_hidrica: 'Media',
    tolerancia_heladas: 'Media',
  } as any,
  {
    crop_id: 'cebada',
    nombre_comun: 'Cebada Grano',
    familia: 'Gramínea',
    balance_nitrogeno_kg_ha: -20,
    icono_emoji: '🌾',
    demanda_hidrica: 'Baja',
    tolerancia_heladas: 'Alta',
  } as any,
];

export default function WizardStep8CropPriority({
  cultivos,
  selectedCropId,
  onSelectCrop,
  selectedPriority,
  onSelectPriority,
  areaHa,
  hardwareId,
}: WizardStep8CropPriorityProps) {
  const activeCultivos = cultivos && cultivos.length > 0 ? cultivos : FALLBACK_CULTIVOS;
  const currentCrop = activeCultivos.find((c) => c.crop_id === selectedCropId);

  return (
    <div className="space-y-3 animate-in fade-in">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
          6. Cosecha Previa y Prioridad del Año
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          TerraQuipu calculará la rotación óptima de 3 campañas para tus {areaHa} ha:
        </p>
      </div>

      {/* 1. Cultivo previo: cuadrícula limpia completa sin scroll ni recortes */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-800 block">
          ¿Qué cosechaste en tu última campaña?
        </span>
        <div className="grid grid-cols-2 gap-2">
          {activeCultivos.map((c) => {
            const isSelected = selectedCropId === c.crop_id;
            return (
              <button
                key={c.crop_id}
                type="button"
                onClick={() => {
                  playBubblePop();
                  onSelectCrop(c.crop_id);
                }}
                className={`p-2.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl flex-shrink-0">{c.icono_emoji || '🌱'}</span>
                  <div>
                    <div className="text-xs font-bold leading-tight">{c.nombre_comun}</div>
                    <div className={`text-[10px] font-mono mt-0.5 ${c.balance_nitrogeno_kg_ha > 0 ? 'text-emerald-700 font-bold' : 'text-amber-700'}`}>
                      {c.balance_nitrogeno_kg_ha > 0 ? `+${c.balance_nitrogeno_kg_ha}` : c.balance_nitrogeno_kg_ha} kg N
                    </div>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Prioridad familiar */}
      <div className="space-y-1.5 pt-1">
        <span className="text-xs font-bold text-slate-800 block">
          ¿Cuál es tu prioridad familiar este año?
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'tierra' as const, title: 'Abonar Suelo', icon: '🌿' },
            { id: 'comida' as const, title: 'Sustento Casa', icon: '🍲' },
            { id: 'mercado' as const, title: 'Venta en Feria', icon: '💰' },
          ].map((p) => {
            const isSelected = selectedPriority === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  playBubblePop();
                  onSelectPriority(p.id);
                }}
                className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer active:scale-98 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xl mb-0.5">{p.icon}</div>
                <div className="text-[11px] font-bold leading-tight">{p.title}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Tarjeta de Diagnóstico Rápido: Llena el espacio anterior con información agronómica útil */}
      {currentCrop && (
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300 text-xs text-emerald-950 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentCrop.icono_emoji || '🌱'}</span>
            <div>
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                Balance del Cultivo Anterior:
              </span>
              <span className="font-extrabold text-slate-900 text-xs">
                {currentCrop.nombre_comun}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border inline-block ${
              currentCrop.balance_nitrogeno_kg_ha > 0
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}>
              {currentCrop.balance_nitrogeno_kg_ha > 0 ? `+${currentCrop.balance_nitrogeno_kg_ha}` : currentCrop.balance_nitrogeno_kg_ha} kg N/ha
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {currentCrop.rompe_plaga_gorgojo ? 'Corta gorgojo' : 'Exige rotación'}
            </span>
          </div>
        </div>
      )}

      {/* 4. Hardware footprint chip */}
      <div className="pt-1 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hardware: {hardwareId}</span>
        </span>
        <span className="text-[10px] text-emerald-800 font-bold">
          ✓ Sincronizado a Supabase
        </span>
      </div>
    </div>
  );
}
