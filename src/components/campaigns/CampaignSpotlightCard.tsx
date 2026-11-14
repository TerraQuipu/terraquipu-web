'use client';

import React, { useState } from 'react';
import { Cultivo } from '@/lib/types';
import {
  TrendingUp,
  DollarSign,
  Droplets,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare, playQuestionChime } from '@/lib/soundEffects';

interface CampaignSpotlightCardProps {
  knotIndex: 1 | 2 | 3;
  crop: Cultivo;
  areaHa: number;
  yearLabel: string;
  seasonLabel: string;
  advice: string;
  onPrev?: () => void;
  onNext?: () => void;
  onToast: (msg: string) => void;
}

export default function CampaignSpotlightCard({
  knotIndex,
  crop,
  areaHa,
  yearLabel,
  seasonLabel,
  advice,
  onPrev,
  onNext,
  onToast,
}: CampaignSpotlightCardProps) {
  // Estado interactivo de seguimiento para cada campaña
  const [status, setStatus] = useState<'planificado' | 'sembrado' | 'cosechado'>(
    knotIndex === 1 ? 'sembrado' : 'planificado'
  );

  // Mapeo de imagen real del cultivo
  const getCropImage = (cropId: string): string => {
    if (cropId.includes('papa')) return '/images/papa_nativa.jpg';
    if (cropId.includes('tarwi')) return '/images/tarwi_chocho.jpg';
    if (cropId.includes('haba')) return '/images/haba_verde.jpg';
    if (cropId.includes('maiz')) return '/images/maiz_blanco.jpg';
    if (cropId.includes('quinua')) return '/images/quinua_real.jpg';
    if (cropId.includes('cebada') || cropId.includes('trigo')) return '/images/trigo_viento_poster.jpg';
    return '/images/cultivos_poster.jpg';
  };

  // Estimación de semilla por hectárea
  const getSeedEstimation = (cropId: string, area: number): string => {
    let kgPerHa = 80;
    if (cropId.includes('papa')) kgPerHa = 1200;
    else if (cropId.includes('haba')) kgPerHa = 120;
    else if (cropId.includes('tarwi')) kgPerHa = 70;
    else if (cropId.includes('maiz')) kgPerHa = 35;
    else if (cropId.includes('quinua')) kgPerHa = 12;
    else if (cropId.includes('cebada')) kgPerHa = 90;

    const totalKg = Math.round(kgPerHa * area);
    const sacos = Math.max(1, Math.round(totalKg / 50));
    return `${totalKg} kg (~${sacos} sacos de 50 kg)`;
  };

  // Cálculos agronómicos escalados por el área
  const totalNitrogenKg = Math.round(crop.balance_nitrogeno_kg_ha * areaHa);
  const savingsSoles = Math.round(420 * areaHa);
  const sacksOfUrea = Math.max(1, Math.round(areaHa * 4.2));

  const handleStatusChange = (newStatus: 'planificado' | 'sembrado' | 'cosechado') => {
    playBubblePop();
    setStatus(newStatus);
    if (newStatus === 'sembrado') {
      playSuccessFanfare();
      onToast(`✓ Campaña ${knotIndex} marcada como SEMBRADA en ${areaHa} ha`);
    } else if (newStatus === 'cosechado') {
      playSuccessFanfare();
      onToast(`🎉 ¡Felicitaciones! Campaña ${knotIndex} marcada como COSECHADA`);
    } else {
      playQuestionChime();
      onToast(`Campaña ${knotIndex} en estado PLANIFICADA`);
    }
  };

  return (
    <div className="rounded-3xl bg-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-sm overflow-hidden animate-in fade-in space-y-0">
      {/* 1. Header con Imagen Real del Cultivo */}
      <div className="h-36 sm:h-40 w-full relative overflow-hidden bg-slate-100">
        <img
          src={getCropImage(crop.crop_id)}
          alt={crop.nombre_comun}
          className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-800 text-white tracking-wider backdrop-blur-xs shadow-xs border border-emerald-400">
            Nudo Quipu {knotIndex} • {yearLabel}
          </span>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-black/60 text-emerald-200 border border-white/20 backdrop-blur-xs">
            {seasonLabel}
          </span>
        </div>

        {/* Título sobre la imagen */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{crop.icono_emoji || '🌱'}</span>
              <h3 className="font-black text-xl text-white tracking-tight drop-shadow-md">
                {crop.nombre_comun}
              </h3>
            </div>
            <p className="text-xs text-emerald-200 font-medium drop-shadow-xs mt-0.5">
              Variedad recomendada: <strong>{crop.variedades_recomendadas?.[0] || 'Nativa Andina'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Cuerpo del Spotlight */}
      <div className="p-4 space-y-3.5">
        {/* Barra de Seguimiento Interactivo */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Seguimiento de tu Parcela ({areaHa} ha):</span>
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                status === 'sembrado'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : status === 'cosechado'
                  ? 'bg-sky-100 text-sky-900 border border-sky-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {status === 'sembrado' ? '🌿 En Campo' : status === 'cosechado' ? '🌾 Cosechado' : '⏳ Planificado'}
            </span>
          </div>

          {/* Botones de Cambio Rápido de Estado */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleStatusChange('planificado')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                status === 'planificado'
                  ? 'bg-amber-500 text-white font-black shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              1. Planificado
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('sembrado')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                status === 'sembrado'
                  ? 'bg-emerald-600 text-white font-black shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              2. Sembrado
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('cosechado')}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                status === 'cosechado'
                  ? 'bg-sky-600 text-white font-black shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              3. Cosechado
            </button>
          </div>
        </div>

        {/* Consejo Técnico Kipu */}
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
          <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Orientación Agronómica para esta Campaña:</span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
            {advice}
          </p>
        </div>

        {/* Requerimiento de Semilla Calculado para el Terreno Real */}
        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wide">
              Semilla requerida para {areaHa} ha:
            </span>
            <span className="font-extrabold text-emerald-950 text-sm">
              {getSeedEstimation(crop.crop_id, areaHa)}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
            Dosis Óptima
          </span>
        </div>

        {/* Métricas clave en 2 columnas */}
        <div className="grid grid-cols-2 gap-2">
          {/* Nitrógeno */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Balance de Nitrógeno:</span>
            </div>
            <div className={`font-black text-sm mt-0.5 ${totalNitrogenKg >= 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
              {totalNitrogenKg >= 0 ? `+${totalNitrogenKg}` : totalNitrogenKg} kg N total
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {crop.balance_nitrogeno_kg_ha > 0 ? `+${crop.balance_nitrogeno_kg_ha}` : crop.balance_nitrogeno_kg_ha} kg/ha
            </div>
          </div>

          {/* Ahorro en Fertilizante */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>Ahorro en Fertilizante:</span>
            </div>
            <div className="font-black text-sm text-amber-900 mt-0.5">
              S/. {savingsSoles}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              ~{sacksOfUrea} sacos de urea
            </div>
          </div>

          {/* Demanda de Agua */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
              <Droplets className="w-3.5 h-3.5 text-sky-600" />
              <span>Demanda Hídrica:</span>
            </div>
            <div className="font-black text-sm text-sky-900 mt-0.5">
              {crop.demanda_hidrica_optima_mm || 450} mm
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Sensor NASA SMAP
            </div>
          </div>

          {/* Sanidad / Plagas */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Control Biológico:</span>
            </div>
            <div className="font-black text-xs text-emerald-900 mt-0.5 leading-tight">
              {crop.rompe_plaga_gorgojo ? '-84% Gorgojo' : 'Sanidad Moderada'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Corte de ciclo
            </div>
          </div>
        </div>

        {/* Botones de Navegación del Stepper */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {onPrev ? (
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onPrev();
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition active:translate-y-0.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Campaña Anterior</span>
            </button>
          ) : (
            <div />
          )}

          {onNext ? (
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onNext();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition active:translate-y-0.5 shadow-xs"
            >
              <span>Siguiente Campaña</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              ✓ Ciclo de 3 Años Completo
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
