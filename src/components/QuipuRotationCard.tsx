'use client';

import React, { useState } from 'react';
import { Cultivo, RotationRecommendation } from '@/lib/types';
import { calculateDynamicRotation } from '@/lib/agronomicEngine';
import {
  Volume2,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { playBubblePop, playQuestionChime } from '@/lib/soundEffects';
import QuickCropSelector from './campaigns/QuickCropSelector';
import CampaignSpotlightCard from './campaigns/CampaignSpotlightCard';

interface QuipuRotationCardProps {
  cultivos: Cultivo[];
  isElNino: boolean;
  onToast: (msg: string) => void;
  areaHa?: number;
  initialCropId?: string;
  initialPriority?: 'tierra' | 'mercado' | 'comida';
  onCropChange?: (cropId: string) => void;
  onPriorityChange?: (priority: 'tierra' | 'mercado' | 'comida') => void;
}

export default function QuipuRotationCard({
  cultivos,
  isElNino,
  onToast,
  areaHa = 1.0,
  initialCropId = 'papa_nativa',
  initialPriority = 'tierra',
  onCropChange,
  onPriorityChange,
}: QuipuRotationCardProps) {
  const [previousCropId, setPreviousCropId] = useState<string>(initialCropId);
  const [priority, setPriority] = useState<'tierra' | 'mercado' | 'comida'>(initialPriority);
  const [activeKnot, setActiveKnot] = useState<1 | 2 | 3>(1);
  const [showOverviewTable, setShowOverviewTable] = useState<boolean>(false);

  // Dynamic recalibration alert state
  const [recalibrationNotice, setRecalibrationNotice] = useState<{
    id: number;
    title: string;
    detail: string;
  } | null>(null);

  // Cálculo de rotación dinámica mediante motor agronómico
  const recommendation: RotationRecommendation | null = calculateDynamicRotation(
    previousCropId,
    priority,
    isElNino,
    cultivos
  );

  const handleSelectCrop = (cropId: string) => {
    setPreviousCropId(cropId);
    if (onCropChange) onCropChange(cropId);

    const crop = cultivos.find((c) => c.crop_id === cropId);
    const cropName = crop?.nombre_comun || cropId;

    setTimeout(() => {
      playQuestionChime();
    }, 120);

    setRecalibrationNotice({
      id: Date.now(),
      title: `✨ ¡Ruta Recalibrada para ${areaHa} ha!`,
      detail: `Cosechaste ${cropName}. Kipu ajustó el ciclo de nutrientes y rompió el ciclo de plagas.`,
    });

    onToast(`✓ Recalibrado para ${areaHa} ha: Cosecha previa ${cropName}`);
  };

  const handleSelectPriority = (prio: 'tierra' | 'mercado' | 'comida') => {
    setPriority(prio);
    if (onPriorityChange) onPriorityChange(prio);

    const labels = {
      tierra: 'Abonar Suelo',
      comida: 'Sustento Casa',
      mercado: 'Venta en Feria',
    };

    setTimeout(() => {
      playQuestionChime();
    }, 120);

    setRecalibrationNotice({
      id: Date.now(),
      title: `✨ ¡Meta: ${labels[prio]}!`,
      detail: `TerraQuipu optimizó la rotación según tu prioridad para ${areaHa} ha.`,
    });

    onToast(`✓ Prioridad agronómica: ${labels[prio]}`);
  };

  const playQuechuaVoice = () => {
    playBubblePop();
    if (typeof window === 'undefined' || !recommendation) return;
    const msg = new SpeechSynthesisUtterance();
    const totalSavings = Math.round(420 * areaHa);
    msg.text = `Hermano agricultor: para tu parcela de ${areaHa} hectáreas, ${recommendation.advice}. Con esta rotación ahorras aproximadamente ${totalSavings} soles en fertilizante químico.`;
    msg.lang = 'es-PE';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
    onToast('🔊 Reproduciendo consejo agronómico en audio...');
  };

  if (!recommendation) {
    return (
      <div className="p-4 rounded-2xl bg-white border-2 border-slate-200 text-center text-xs text-slate-500">
        Cargando matriz agronómica...
      </div>
    );
  }

  const bestCrop = recommendation.crop;
  const sequence = recommendation.sequence || [bestCrop, cultivos[1] || bestCrop, cultivos[2] || bestCrop];

  const knotData = [
    {
      knot: 1 as const,
      crop: sequence[0],
      year: '2024-25',
      season: 'Siembra Grande Lluvias',
      label: 'Campaña 1',
      sub: 'Inmediata',
      color: 'emerald',
      advice: recommendation.advice,
    },
    {
      knot: 2 as const,
      crop: sequence[1],
      year: '2025-26',
      season: 'Siembra Intermedia',
      label: 'Campaña 2',
      sub: 'Recuperación',
      color: 'amber',
      advice: `Aprovecha el nitrógeno biológico inyectado en la Campaña 1 por ${sequence[0]?.nombre_comun}. Suelo desinfectado de gorgojo para obtener cosecha de máxima cotización sin pesticidas.`,
    },
    {
      knot: 3 as const,
      crop: sequence[2],
      year: '2026-27',
      season: 'Cierre Rotacional',
      label: 'Campaña 3',
      sub: 'Cierre Dorado',
      color: 'sky',
      advice: `Cierra el ciclo de 3 años. Este cultivo andino resiste estrés hídrico y sus rastrojos cubren el suelo contra heladas y erosión, dejándolo preparado para un nuevo ciclo agroecológico.`,
    },
  ];

  const currentKnotData = knotData[activeKnot - 1];

  return (
    <div className="space-y-3.5 animate-in fade-in">
      {/* 1. Selector Rápido Táctil (Sin dropdowns ni acordeones) */}
      <QuickCropSelector
        cultivos={cultivos}
        selectedCropId={previousCropId}
        selectedPriority={priority}
        onSelectCrop={handleSelectCrop}
        onSelectPriority={handleSelectPriority}
      />

      {/* 2. Banner Dinámico de Recalibración (Si el agricultor cambió una opción) */}
      {recalibrationNotice && (
        <div
          key={recalibrationNotice.id}
          className="p-3.5 rounded-2xl bg-emerald-600 border-2 border-emerald-700 border-b-4 border-b-emerald-800 text-white shadow-xs animate-in fade-in slide-in-from-top-2 duration-300 flex items-start gap-3"
        >
          <span className="text-xl flex-shrink-0">✨</span>
          <div className="flex-1">
            <div className="font-black text-xs tracking-tight flex items-center justify-between">
              <span>{recalibrationNotice.title}</span>
              <span className="text-[10px] font-mono bg-emerald-800 px-2 py-0.5 rounded-md border border-emerald-500">
                {areaHa} ha
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-0.5 leading-snug">
              {recalibrationNotice.detail}
            </p>
          </div>
        </div>
      )}

      {/* 3. Feedback Kipu & Botón de Audio */}
      <div className="p-3.5 rounded-3xl bg-amber-50/80 border-2 border-amber-300 border-b-4 border-b-amber-400 flex items-start gap-3 shadow-2xs">
        <span className="text-2xl flex-shrink-0 mt-0.5">💡</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-xs text-amber-950 uppercase tracking-wide">
              Consejo Agrónomo • {areaHa} ha
            </span>
            <button
              type="button"
              onClick={playQuechuaVoice}
              className="text-[11px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1 border border-amber-300 active:scale-95 transition cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-800" />
              <span>Escuchar</span>
            </button>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
            {recommendation.advice}
          </p>
        </div>
      </div>

      {/* 4. Stepper Interactivo de Seguimiento (Campaña 1 ➔ Campaña 2 ➔ Campaña 3) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">
              Ruta Quipu: Seguimiento de 3 Campañas
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setShowOverviewTable(!showOverviewTable);
            }}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <Layers className="w-3 h-3 text-emerald-600" />
            <span>{showOverviewTable ? 'Ver Tarjeta' : 'Ver Comparativa'}</span>
          </button>
        </div>

        {/* Barra de progreso / Stepper de 3 Nudos */}
        <div className="grid grid-cols-3 gap-1.5">
          {knotData.map((k) => {
            const isActive = activeKnot === k.knot;
            return (
              <button
                key={k.knot}
                type="button"
                onClick={() => {
                  playBubblePop();
                  setActiveKnot(k.knot);
                  onToast(`🪢 Explorando ${k.label}: ${k.crop?.nombre_comun}`);
                }}
                className={`p-2.5 rounded-2xl border-2 border-b-4 text-left transition-all active:border-b-2 active:translate-y-0.5 cursor-pointer relative ${
                  isActive
                    ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{k.crop?.icono_emoji || '🌱'}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {k.year}
                  </span>
                </div>
                <div className="text-xs font-black mt-1 leading-tight truncate">
                  {k.label}
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  {k.crop?.nombre_comun || 'Cultivo'}
                </div>
              </button>
            );
          })}
        </div>

        {/* 5. Spotlight de la Campaña Seleccionada */}
        {!showOverviewTable ? (
          <CampaignSpotlightCard
            key={currentKnotData.knot}
            knotIndex={currentKnotData.knot}
            crop={currentKnotData.crop}
            areaHa={areaHa}
            yearLabel={currentKnotData.year}
            seasonLabel={currentKnotData.season}
            advice={currentKnotData.advice}
            onPrev={activeKnot > 1 ? () => setActiveKnot((prev) => (prev - 1) as any) : undefined}
            onNext={activeKnot < 3 ? () => setActiveKnot((prev) => (prev + 1) as any) : undefined}
            onToast={onToast}
          />
        ) : (
          /* Vista Comparativa Compacta de los 3 Nudos Quipu */
          <div className="bg-white rounded-3xl border-2 border-slate-200 border-b-4 border-b-slate-300 p-4 space-y-2.5 shadow-2xs animate-in fade-in">
            <span className="text-xs font-black text-slate-900 block pb-1 border-b border-slate-100">
              📊 Comparativa de los 3 Ciclos ({areaHa} ha):
            </span>

            {knotData.map((k) => (
              <div
                key={k.knot}
                onClick={() => {
                  playBubblePop();
                  setActiveKnot(k.knot);
                  setShowOverviewTable(false);
                }}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 flex items-center justify-between cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{k.crop?.icono_emoji || '🌱'}</span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-800">
                      {k.label} ({k.year})
                    </span>
                    <div className="text-xs font-extrabold text-slate-900">
                      {k.crop?.nombre_comun}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 block">
                    {k.crop?.balance_nitrogeno_kg_ha > 0 ? `+${k.crop.balance_nitrogeno_kg_ha}` : k.crop.balance_nitrogeno_kg_ha} kg N/ha
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {k.crop?.rompe_plaga_gorgojo ? 'Corta gorgojo' : 'Sanidad moderada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
