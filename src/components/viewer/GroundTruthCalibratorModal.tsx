'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  Satellite,
  ShieldAlert,
  Sprout,
  Droplets,
  Calendar,
  AlertTriangle,
  Send,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { ActiveParcel } from '@/lib/geoUtils';
import { submitFarmerReport } from '@/lib/supabase';
import { ReporteAgricultor } from '@/types';

interface GroundTruthCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeParcel: ActiveParcel;
  onCalibrationComplete: (calibratedParcel: ActiveParcel, newReport?: ReporteAgricultor) => void;
  onShowToast: (msg: string) => void;
  previousCrop?: string;
}

export default function GroundTruthCalibratorModal({
  isOpen,
  onClose,
  activeParcel,
  onCalibrationComplete,
  onShowToast,
  previousCrop = 'papa',
}: GroundTruthCalibratorModalProps) {
  // 5 Closed Questions State
  const [soilTexture, setSoilTexture] = useState<'arena' | 'franca' | 'arcilla'>('franca');
  const [soilStoniness, setSoilStoniness] = useState<'pedregoso' | 'profundo'>('profundo');
  const [cropCoverNdvi, setCropCoverNdvi] = useState<'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo'>('barbecho');
  const [waterSource, setWaterSource] = useState<'secano' | 'auxilio' | 'permanente'>('auxilio');
  const [sowingWindow, setSowingWindow] = useState<'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana'>('2_4_semanas');
  
  // Phytosanitary toggles
  const [hasWeevil, setHasWeevil] = useState<boolean>(false);
  const [hasFrostAlert, setHasFrostAlert] = useState<boolean>(false);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate live Soil Health and Resilience Index (0 - 100)
  const calculateHealthIndex = () => {
    let score = 50;
    if (soilTexture === 'franca') score += 15;
    else if (soilTexture === 'arcilla') score += 8;
    else score -= 10;

    if (soilStoniness === 'profundo') score += 15;
    else score -= 10;

    if (cropCoverNdvi === 'sembrado') score += 15;
    else if (cropCoverNdvi === 'barbecho') score += 12;
    else if (cropCoverNdvi === 'pasto') score += 8;
    else score -= 15;

    if (waterSource === 'permanente') score += 15;
    else if (waterSource === 'auxilio') score += 10;
    else score += 0;

    if (hasWeevil) score -= 15;
    else score += 5;

    if (hasFrostAlert) score -= 8;
    else score += 3;

    return Math.max(10, Math.min(100, score));
  };

  const healthScore = calculateHealthIndex();

  const getScoreBadge = (score: number) => {
    if (score >= 75) {
      return {
        label: 'Resiliencia Alta • Suelo Óptimo',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        textColor: 'text-emerald-700',
      };
    }
    if (score >= 50) {
      return {
        label: 'Resiliencia Moderada • Requiere Mulch',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        textColor: 'text-amber-700',
      };
    }
    return {
      label: 'Vulnerabilidad Severa • Alerta de Erosión',
      color: 'bg-rose-100 text-rose-800 border-rose-300',
      textColor: 'text-rose-700',
    };
  };

  const badge = getScoreBadge(healthScore);

  // Map to Supabase enum
  const mapSoilMoistureEnum = (
    texture: 'arena' | 'franca' | 'arcilla',
    water: 'secano' | 'auxilio' | 'permanente'
  ): 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO' | 'CHARCO' => {
    if (texture === 'arcilla' && water === 'permanente') return 'SATURADO';
    if (texture === 'arena' && water === 'secano') return 'SECO';
    if (texture === 'franca') return 'HUMEDAD_MEDIA';
    return 'HUMEDAD_MEDIA';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const estimatedMoisture = mapSoilMoistureEnum(soilTexture, waterSource);
    const deviceId = `TQ-VISOR-${activeParcel.id || 'WEB'}`;

    try {
      const res = await submitFarmerReport({
        dispositivo_id: deviceId,
        latitud: activeParcel.center[0],
        longitud: activeParcel.center[1],
        humedad_suelo_estimada: estimatedMoisture,
        presencia_gorgojo: hasWeevil,
        alerta_helada_observada: hasFrostAlert,
        cultivo_actual_id: previousCrop,
        sincronizado_desde_outbox: false,
      });

      // Calculate adjusted SMAP moisture based on texture and cover
      let adjustedMoisture = activeParcel.smapMoisturePct;
      if (soilTexture === 'arena') adjustedMoisture = Math.max(12, adjustedMoisture * 0.78);
      else if (soilTexture === 'arcilla') adjustedMoisture = Math.min(65, adjustedMoisture * 1.15);

      if (cropCoverNdvi === 'barbecho' || cropCoverNdvi === 'sembrado') {
        adjustedMoisture = Math.min(60, adjustedMoisture * 1.05); // mulch preserves moisture
      } else if (cropCoverNdvi === 'suelo_desnudo') {
        adjustedMoisture = Math.max(10, adjustedMoisture * 0.85); // bare soil loses water to evaporation
      }

      const updatedParcel: ActiveParcel = {
        ...activeParcel,
        smapMoisturePct: Number(adjustedMoisture.toFixed(1)),
        groundTruthCalibrated: true,
        groundTruthData: {
          soilTexture,
          soilStoniness,
          cropCoverNdvi,
          waterSource,
          sowingWindow,
          hasWeevil,
          hasFrostAlert,
          soilHealthIndex: healthScore,
          calibratedAt: new Date().toISOString(),
        },
      };

      onCalibrationComplete(updatedParcel, res.data);
      onShowToast(`✓ Parcela ${activeParcel.name} calibrada con Verdad Terrestre (Supabase sync)`);
      onClose();
    } catch (err: any) {
      onShowToast(`Error al guardar en Supabase: ${err.message || 'Error de red'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden">
        {/* Header with Astro & Kipu Copilots */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-zinc-950 p-4 text-white flex-shrink-0 flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center backdrop-blur-xs">
                <img src="/images/kipu_llama.png" alt="Kipu" className="w-full h-full object-contain" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-300/40 p-1 flex items-center justify-center backdrop-blur-xs">
                <img src="/images/astro_satelin.png" alt="Astro" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Estación de Calibración en Campo
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40 font-semibold">
                  NASA Ground-Truth 5+1
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Validar {activeParcel.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Soil Health Gauge Bar */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-700">Índice de Salud Edáfica y Resiliencia:</span>
            <span className="text-base font-mono font-bold text-zinc-950">{healthScore}/100</span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border font-mono ${badge.color}`}>
            {badge.label}
          </span>
        </div>

        {/* Scrollable Questions Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Question 1: Soil Texture (Prueba del Puño) */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                ¿Cómo se siente la tierra al apretarla húmeda? (Prueba del Puño)
              </label>
              <span className="text-[10px] font-mono text-zinc-500">Calibra SMAP y SoilGrids</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                {
                  id: 'arena' as const,
                  title: 'Se suelta / Arena',
                  desc: 'Infiltración rápida, drena rápido, poca retención de abono',
                  emoji: '🥪',
                },
                {
                  id: 'franca' as const,
                  title: 'Forma bola suave (Franca)',
                  desc: 'Estructura ideal, esponjosa, equilibra retención y aire',
                  emoji: '🌱',
                },
                {
                  id: 'arcilla' as const,
                  title: 'Muy pegajosa (Arcilla)',
                  desc: 'Alta retención hídrica, riesgo de barro y compactación',
                  emoji: '🧱',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSoilTexture(opt.id)}
                  className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                    soilTexture === opt.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="font-bold text-xs leading-tight">{opt.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Stoniness & Effective Depth */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                ¿La parcela tiene muchas piedras o tierra poco profunda?
              </label>
              <span className="text-[10px] font-mono text-zinc-500">Profundidad Efectiva</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                {
                  id: 'pedregoso' as const,
                  title: 'Sí • Suelo delgado o pedregoso',
                  desc: 'Capa superficial <30 cm, presencia de piedras. Requiere camellones y mulch.',
                  emoji: '🪨',
                },
                {
                  id: 'profundo' as const,
                  title: 'No • Tierra profunda y fértil',
                  desc: 'Capa arable >40 cm. Permite aporque profundo y raíces extensas.',
                  emoji: '🌾',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSoilStoniness(opt.id)}
                  className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                    soilStoniness === opt.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="font-bold text-xs leading-tight">{opt.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Real Vegetation Cover (Sentinel-2 NDVI) */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold flex items-center justify-center">
                  3
                </span>
                ¿Cómo está la cobertura del suelo hoy?
              </label>
              <span className="text-[10px] font-mono text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                🛰️ Sentinel-2 NDVI
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'sembrado' as const, title: 'Con Cultivo', desc: 'Follaje verde vigoroso', emoji: '🌱' },
                { id: 'barbecho' as const, title: 'Barbecho / Mulch', desc: 'Rastrojo protector', emoji: '🍂' },
                { id: 'pasto' as const, title: 'Pasto Natural', desc: 'Pradera andina forrajera', emoji: '🌾' },
                { id: 'suelo_desnudo' as const, title: 'Suelo Pelado', desc: 'Expuesto a erosión', emoji: '🏜️' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setCropCoverNdvi(opt.id)}
                  className={`p-2 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                    cropCoverNdvi === opt.id
                      ? 'border-sky-600 bg-sky-50 text-sky-950 font-semibold shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div className="text-lg mb-1">{opt.emoji}</div>
                  <span className="font-bold text-xs leading-tight block">{opt.title}</span>
                  <span className="text-[10px] text-zinc-500 leading-tight mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Water Source & Irrigation (NASA GPM Calibrator) */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center justify-center">
                  4
                </span>
                ¿De dónde proviene el agua de esta chacra?
              </label>
              <span className="text-[10px] font-mono text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                🌧️ NASA GPM Rain
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {[
                {
                  id: 'secano' as const,
                  title: 'Solo Lluvia (Secano)',
                  desc: 'Depende 100% de la lluvia. Muy vulnerable a sequías.',
                  emoji: '🌧️',
                },
                {
                  id: 'auxilio' as const,
                  title: 'Riego de Auxilio',
                  desc: 'Canal comunal o acequia para salvar sequías cortas.',
                  emoji: '💧',
                },
                {
                  id: 'permanente' as const,
                  title: 'Riego Tecnificado',
                  desc: 'Aspersión o goteo constante. Permite cultivos exigentes.',
                  emoji: '🚰',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setWaterSource(opt.id)}
                  className={`p-2.5 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                    waterSource === opt.id
                      ? 'border-blue-600 bg-blue-50 text-blue-950 font-semibold shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{opt.emoji}</span>
                    <span className="font-bold text-xs leading-tight">{opt.title}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 5: Sowing Window / El Niño Strategy */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center">
                  5
                </span>
                ¿Cuándo tienes previsto sembrar? (Estrategia El Niño)
              </label>
              <span className="text-[10px] font-mono text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ⚠️ ENOS ENFEN
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'esta_semana' as const, title: 'Esta Semana', desc: 'Siembra urgente', emoji: '⚡' },
                { id: '2_4_semanas' as const, title: 'En 2-4 Semanas', desc: 'Siembra normal', emoji: '📅' },
                { id: '1_2_meses' as const, title: 'En 1-2 Meses', desc: 'Siembra tardía', emoji: '⏳' },
                { id: 'proxima_campana' as const, title: 'Próximo Año', desc: 'Suelo en descanso', emoji: '⏸️' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSowingWindow(opt.id)}
                  className={`p-2 rounded-xl border-2 text-left transition flex flex-col justify-between ${
                    sowingWindow === opt.id
                      ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold shadow-xs'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700'
                  }`}
                >
                  <div className="text-lg mb-1">{opt.emoji}</div>
                  <span className="font-bold text-xs leading-tight block">{opt.title}</span>
                  <span className="text-[10px] text-zinc-500 leading-tight mt-0.5">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Field Pest and Frost Quick Check (+1 Ground Truth Verification) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Gorgojo de los Andes Switch */}
            <div className={`p-3 rounded-xl border transition flex items-center justify-between ${
              hasWeevil ? 'bg-rose-50 border-rose-300' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div>
                <span className="text-xs font-bold text-zinc-900 block">¿Hay presencia de Gorgojo?</span>
                <span className="text-[10px] text-zinc-500">Premnotrypes spp. en tubérculos</span>
              </div>
              <button
                type="button"
                onClick={() => setHasWeevil(!hasWeevil)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  hasWeevil ? 'bg-rose-600 text-white shadow-xs' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                {hasWeevil ? '⚠️ SÍ DETECTADO' : 'NO OBSERVADO'}
              </button>
            </div>

            {/* Helada Observada Switch */}
            <div className={`p-3 rounded-xl border transition flex items-center justify-between ${
              hasFrostAlert ? 'bg-amber-50 border-amber-300' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div>
                <span className="text-xs font-bold text-zinc-900 block">¿Se observó escarcha o helada?</span>
                <span className="text-[10px] text-zinc-500">En las últimas 48 horas en campo</span>
              </div>
              <button
                type="button"
                onClick={() => setHasFrostAlert(!hasFrostAlert)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  hasFrostAlert ? 'bg-amber-600 text-white shadow-xs' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                {hasFrostAlert ? '❄️ SÍ OBSERVADA' : 'SIN HELADA'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-zinc-50 border-t border-zinc-200 p-4 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-semibold transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 max-w-sm px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                <span>Sincronizando con Supabase PostGIS...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-emerald-300" />
                <span>Guardar Ground-Truth & Calibrar Parcela</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
