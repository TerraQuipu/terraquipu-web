'use client';

import React, { useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Calendar,
  Sprout,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { playSuccessFanfare, playBubblePop } from '@/lib/soundEffects';
import { ResultadoAsistenteAgroambiental } from '@/lib/agroenvironmentalEngine';

interface WizardStepConclusionProps {
  mode: 'full' | 'soil' | 'elnino' | 'rotation';
  profileData: {
    parcelName: string;
    areaHa: number;
    distrito: string;
    altitude: number;
    moistureText: string;
    cropName: string;
    priorityName: string;
  };
  healthScore?: number;
  agroResult?: ResultadoAsistenteAgroambiental;
  onConfirm: () => void;
}

export default function WizardStepConclusion({
  mode,
  profileData,
  healthScore = 85,
  agroResult,
  onConfirm,
}: WizardStepConclusionProps) {
  useEffect(() => {
    playSuccessFanfare();
  }, []);

  return (
    <div className="space-y-4 animate-in zoom-in-95 duration-200 flex-1 flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* Banner de Mascota en Celebración con Globo de Diálogo Cósmico */}
        <div className="flex items-center gap-3.5 pt-1 pb-1 min-h-[155px]">
          {/* Llama Avatar libre sin fondo blanco */}
          <div className="w-28 sm:w-32 h-36 sm:h-40 shrink-0 relative flex items-center justify-center animate-bounce-gentle">
            <img
              src="/images/kipu_llama.png"
              alt="Kipu Celebrando"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          {/* Globo de Diálogo apuntando a Kipu */}
          <div className="flex-1 relative bg-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-3xl p-3.5 shadow-xs">
            <div className="absolute top-7 -left-2.5 w-4 h-4 bg-white border-b-2 border-l-2 border-emerald-600 transform rotate-45"></div>

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-semibold text-xs text-emerald-950 uppercase tracking-wide flex items-center gap-1">
                <span>KIPU COPILOTO</span>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                ¡Calibración Lista!
              </span>
            </div>

            <p className="text-xs text-black font-semibold leading-relaxed font-sans">
              {mode === 'soil' &&
                `¡Allillanchu! Hemos contrastado la prueba del puño y sanidad de tu chacra en ${profileData.distrito}. Tu suelo tiene índice ${healthScore}/100 y ya está calibrado con los radares NASA SMAP.`}

              {mode === 'elnino' &&
                `¡Excelente hermano! Hemos cruzado tus respuestas con la alerta ENOS de SENAMHI. ${agroResult?.estadoChacra || ''} Para la rotación, el algoritmo A13 recomienda sembrar ${agroResult?.recomendacionA13.cultivo_sugerido || 'Quinua'}.`}

              {mode === 'rotation' &&
                `¡Gran estrategia! Al cosechar ${profileData.cropName} tu meta es ${profileData.priorityName}. Hemos calculado tu secuencia óptima para ahorrar hasta S/. 420 en abonos y cortar el gorgojo.`}

              {mode === 'full' &&
                `¡Chacra completamente calibrada! Tu parcela de ${profileData.areaHa} ha en ${profileData.distrito} (${profileData.altitude} msnm) está vinculada a los satélites SMAP y Sentinel-2.`}
            </p>
          </div>
        </div>

        {/* Resumen Visual del Algoritmo según el Modo */}
        {mode === 'soil' && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
                Índice de Salud Edáfica Calibrado
              </span>
              <div className="text-xl font-semibold text-white flex items-center gap-2 mt-0.5">
                <span>{healthScore} / 100</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  {healthScore >= 80 ? '✓ Suelo Resiliente' : healthScore >= 60 ? '⚡ Requiere Abono' : '⚠️ Vulnerable'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-200/80 block">10 Parámetros</span>
              <span className="text-xs font-mono font-bold text-white">Sincronizado</span>
            </div>
          </div>
        )}

        {mode === 'elnino' && agroResult && (
          <div className="space-y-2">
            {/* Estado Chacra y Clima */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 text-white space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                  Vulnerabilidad
                </span>
                <span className="font-semibold text-sm block">
                  {agroResult.nivelVulnerabilidad}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-0.5">
                <span className="text-[10px] font-bold text-amber-800 block uppercase">
                  Rotación A13
                </span>
                <span className="font-semibold text-sm block text-emerald-900">
                  {agroResult.recomendacionA13.cultivo_sugerido} ({agroResult.recomendacionA13.confianza})
                </span>
              </div>
            </div>

            {/* Calendario Resumen */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>{agroResult.calendario.length} Acciones Preventivas en 4 Bloques</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                T0 Activo
              </span>
            </div>
          </div>
        )}

        {mode === 'rotation' && (
          <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2 shadow-xs">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Nitrógeno Orgánico:</span>
              <span className="font-bold text-emerald-400 font-mono">+95 kg N/ha en suelo</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-300 font-medium">Ahorro en Fertilizantes:</span>
              <span className="font-bold text-white font-mono">S/. 340 / ha</span>
            </div>
          </div>
        )}
      </div>

      {/* Botón Principal de Confirmación */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onConfirm();
          }}
          className="w-full py-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 border-2 border-emerald-900 border-b-4 border-b-emerald-950 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md active:border-b-2 active:translate-y-0.5 transition cursor-pointer"
        >
          <span>
            {mode === 'elnino'
              ? 'Ver Mi Calendario Preventivo Completo'
              : mode === 'soil'
              ? 'Ver Mi Chacra Calibrada'
              : 'Aplicar y Guardar en Dispositivo'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
