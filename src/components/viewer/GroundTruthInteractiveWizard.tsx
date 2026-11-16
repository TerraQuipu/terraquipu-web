'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { ActiveParcel } from '@/lib/geoUtils';
import { submitFarmerReport } from '@/lib/supabase';
import { ReporteAgricultor } from '@/types';
import {
  playBubblePop,
  playWhoosh,
  playQuestionChime,
  playSuccessFanfare,
} from '@/lib/soundEffects';

interface GroundTruthInteractiveWizardProps {
  isOpen: boolean;
  onClose: () => void;
  activeParcel: ActiveParcel;
  onCalibrationComplete: (calibratedParcel: ActiveParcel, newReport?: ReporteAgricultor) => void;
  onShowToast: (msg: string) => void;
  previousCrop?: string;
}

interface DialogConfig {
  step: number;
  speaker: 'kipu' | 'astro';
  name: string;
  tag: string;
  avatar: string;
  tagColor: string;
  speech: string;
  reactionSpeech?: string;
}

export default function GroundTruthInteractiveWizard({
  isOpen,
  onClose,
  activeParcel,
  onCalibrationComplete,
  onShowToast,
  previousCrop = 'papa',
}: GroundTruthInteractiveWizardProps) {
  const [step, setStep] = useState(1);
  const [isHappy, setIsHappy] = useState(false);

  // 5 + 1 Closed Form State
  const [soilTexture, setSoilTexture] = useState<'arena' | 'franca' | 'arcilla' | ''>('franca');
  const [soilStoniness, setSoilStoniness] = useState<'pedregoso' | 'profundo' | ''>('profundo');
  const [cropCoverNdvi, setCropCoverNdvi] = useState<'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo' | ''>('barbecho');
  const [waterSource, setWaterSource] = useState<'secano' | 'auxilio' | 'permanente' | ''>('auxilio');
  const [sowingWindow, setSowingWindow] = useState<'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana' | ''>('2_4_semanas');
  
  // Phytosanitary toggles
  const [hasWeevil, setHasWeevil] = useState<boolean>(false);
  const [hasFrostAlert, setHasFrostAlert] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsHappy(false);
  }, [step]);

  if (!isOpen) return null;

  // Live Soil Health and Resilience Calculation (0 - 100)
  const calculateHealthIndex = () => {
    let score = 50;
    if (soilTexture === 'franca') score += 15;
    else if (soilTexture === 'arcilla') score += 8;
    else if (soilTexture === 'arena') score -= 10;

    if (soilStoniness === 'profundo') score += 15;
    else if (soilStoniness === 'pedregoso') score -= 10;

    if (cropCoverNdvi === 'sembrado') score += 15;
    else if (cropCoverNdvi === 'barbecho') score += 12;
    else if (cropCoverNdvi === 'pasto') score += 8;
    else if (cropCoverNdvi === 'suelo_desnudo') score -= 15;

    if (waterSource === 'permanente') score += 15;
    else if (waterSource === 'auxilio') score += 10;

    if (hasWeevil) score -= 15;
    else score += 5;

    if (hasFrostAlert) score -= 8;
    else score += 3;

    return Math.max(10, Math.min(100, score));
  };

  const healthScore = calculateHealthIndex();

  // Dialog configuration for Kipu & Astro copilots
  const DIALOGS: DialogConfig[] = [
    {
      step: 1,
      speaker: 'kipu',
      name: 'KIPU • ANDEAN AGROECOLOGY COPILOT',
      tag: '🌱 Hand Squeeze Test',
      avatar: isHappy ? '/images/kipu_llama_happy.png' : '/images/kipu_llama.png',
      tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      speech:
        'Allillanchu! Touch the moist soil of your parcel: when squeezed firmly in your hand, how does the texture feel? Your fingers calibrate NASA orbital radar.',
      reactionSpeech:
        soilTexture === 'franca'
          ? 'Excellent choice! Loam soil has an optimal porous structure that balances water retention and aeration.'
          : soilTexture === 'arena'
          ? 'Recorded! In sandy soil water drains rapidly; we will recommend native residue mulching for moisture retention.'
          : 'Noted! Clay soil retains significant water; we will optimize drainage to avoid waterlogging and compaction.',
    },
    {
      step: 2,
      speaker: 'kipu',
      name: 'KIPU • ANDEAN AGROECOLOGY COPILOT',
      tag: '🪨 Effective Rooting Depth',
      avatar: isHappy ? '/images/kipu_llama_happy.png' : '/images/kipu_llama.png',
      tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      speech:
        'Does your parcel feature high surface stoniness or shallow topsoil? This determines whether infiltration trenches and contour ditches are feasible.',
      reactionSpeech:
        soilStoniness === 'profundo'
          ? 'Splendid! Deep soil (>40 cm) enables substantial hilling and vigorous development of tuberous roots.'
          : 'Crucial observation! Stony or shallow soils require elevated ridge-beds and vegetative barriers to conserve topsoil.',
    },
    {
      step: 3,
      speaker: 'astro',
      name: 'ASTRO • NASA EARTH ORBITAL',
      tag: '🛰️ Sentinel-2 NDVI',
      avatar: '/images/astro_satelin.png',
      tagColor: 'bg-sky-100 text-sky-950 border-sky-300',
      speech:
        'Orbital multispectral sensors are scanning the NDVI vegetation index over your parcel. What is the current ground cover status in the field?',
      reactionSpeech:
        cropCoverNdvi === 'sembrado'
          ? 'Telemetry confirmed! Active green photosynthetic canopy validated at your coordinates.'
          : cropCoverNdvi === 'barbecho'
          ? 'Excellent management! Protective crop residue mulch suppresses solar evaporation and nourishes soil microbiota.'
          : cropCoverNdvi === 'pasto'
          ? 'Detected! Natural Andean grassland provides durable vegetative soil cover against runoff erosion.'
          : 'Erosion warning! Bare topsoil exposed to rain impact and wind; urgent cover crop or mulch recommended.',
    },
    {
      step: 4,
      speaker: 'astro',
      name: 'ASTRO • NASA EARTH ORBITAL',
      tag: '🌧️ NASA GPM Precipitation',
      avatar: '/images/astro_satelin.png',
      tagColor: 'bg-sky-100 text-sky-950 border-sky-300',
      speech:
        'Cross-referencing NASA GPM precipitation telemetry with surface moisture: What is the primary water regime for this parcel?',
      reactionSpeech:
        waterSource === 'secano'
          ? 'Monitoring cloud dynamics! We will tune crop rotation with highly drought-tolerant crops such as Tarwi or Quinoa.'
          : waterSource === 'auxilio'
          ? 'Strategic! Communal canal networks or micro-reservoirs mitigate mid-season dry spells (veranillos).'
          : 'Optimal! Pressurized technical irrigation guarantees stable yields through extreme agroclimatic fluctuations.',
    },
    {
      step: 5,
      speaker: 'astro',
      name: 'ASTRO • NASA EARTH ORBITAL',
      tag: '⚠️ ENSO Climate Advisory',
      avatar: '/images/astro_satelin.png',
      tagColor: 'bg-amber-100 text-amber-950 border-amber-300',
      speech:
        'Climate models forecast hydrological anomalies associated with El Niño (ENSO). When is planting or seedbed preparation scheduled?',
      reactionSpeech:
        sowingWindow === 'esta_semana'
          ? 'Immediate sowing registered! Mulch coverage will be prioritized to preserve initial seedbed moisture.'
          : sowingWindow === '2_4_semanas'
          ? 'Standard seasonal window! Adequate lead time to condition soil with organic compost amendments.'
          : sowingWindow === '1_2_meses'
          ? 'Late sowing strategy! Waiting for seasonal rainfall consolidation.'
          : 'Conservative stewardship! Resting the parcel in fallow with nitrogen-fixing Andean legumes.',
    },
    {
      step: 6,
      speaker: 'kipu',
      name: 'KIPU & ASTRO • CO-RESEARCH TEAM',
      tag: '✨ Final In-Situ Calibration',
      avatar: '/images/kipu_llama_happy.png',
      tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      speech:
        'Final step! Verify if Andean potato weevil or recent ground frost events occurred in the field. Your answers complete orbital triangulation and sync to Supabase.',
    },
  ];

  const currentDialog = DIALOGS[step - 1] || DIALOGS[0];

  const handleNext = () => {
    playWhoosh();
    if (step < 6) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    playWhoosh();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelectOption = (callback: () => void) => {
    playBubblePop();
    callback();
    setIsHappy(true);
    playQuestionChime();
  };

  const mapSoilMoistureEnum = (
    texture: 'arena' | 'franca' | 'arcilla' | '',
    water: 'secano' | 'auxilio' | 'permanente' | ''
  ): 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO' | 'CHARCO' => {
    if (texture === 'arcilla' && water === 'permanente') return 'SATURADO';
    if (texture === 'arena' && water === 'secano') return 'SECO';
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

      // Adjust SMAP moisture
      let adjustedMoisture = activeParcel.smapMoisturePct;
      if (soilTexture === 'arena') adjustedMoisture = Math.max(12, adjustedMoisture * 0.78);
      else if (soilTexture === 'arcilla') adjustedMoisture = Math.min(65, adjustedMoisture * 1.15);

      if (cropCoverNdvi === 'barbecho' || cropCoverNdvi === 'sembrado') {
        adjustedMoisture = Math.min(60, adjustedMoisture * 1.05);
      } else if (cropCoverNdvi === 'suelo_desnudo') {
        adjustedMoisture = Math.max(10, adjustedMoisture * 0.85);
      }

      const updatedParcel: ActiveParcel = {
        ...activeParcel,
        smapMoisturePct: Number(adjustedMoisture.toFixed(1)),
        groundTruthCalibrated: true,
        groundTruthData: {
          soilTexture: (soilTexture as any) || 'franca',
          soilStoniness: (soilStoniness as any) || 'profundo',
          cropCoverNdvi: (cropCoverNdvi as any) || 'barbecho',
          waterSource: (waterSource as any) || 'auxilio',
          sowingWindow: (sowingWindow as any) || '2_4_semanas',
          hasWeevil,
          hasFrostAlert,
          soilHealthIndex: healthScore,
          calibratedAt: new Date().toISOString(),
        },
      };

      playSuccessFanfare();
      onCalibrationComplete(updatedParcel, res.data);
      onShowToast(`✓ Parcel ${activeParcel.name} successfully calibrated (Supabase Ground-Truth)`);
      onClose();
    } catch (err: any) {
      onShowToast(`Error synchronizing with Supabase: ${err.message || 'Network error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Top Stepper Bar */}
        <div className="bg-white border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-300">
              Step {step} of 6
            </span>
            <span className="text-xs text-zinc-500 font-semibold truncate max-w-[190px]">
              {activeParcel.name}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Bar (Duolingo Style) */}
        <div className="w-full bg-zinc-200 h-1.5 flex-shrink-0">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Character Dialogue Header (Hero Mascot & Comic Bubble) */}
        <div className="px-4 py-3 bg-white border-b border-zinc-200 flex items-center gap-3.5 flex-shrink-0 shadow-xs">
          <div className="w-20 sm:w-24 h-24 sm:h-28 flex-shrink-0 relative flex items-center justify-center">
            <img
              src={currentDialog.avatar}
              alt={currentDialog.name}
              className={`w-full h-full object-contain filter drop-shadow-md transition-all duration-300 ${
                isHappy ? 'scale-105' : 'scale-100'
              }`}
            />
          </div>

          <div
            className={`flex-1 relative bg-white border-2 border-b-4 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-xs transition-colors duration-300 ${
              currentDialog.speaker === 'astro'
                ? 'border-sky-500 border-b-sky-700'
                : 'border-emerald-600 border-b-emerald-700'
            }`}
          >
            <div
              className={`absolute top-5 -left-2.5 w-3.5 h-3.5 bg-white border-b-2 border-l-2 transform rotate-45 ${
                currentDialog.speaker === 'astro' ? 'border-sky-500' : 'border-emerald-600'
              }`}
            />

            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-extrabold text-[11px] text-zinc-950 uppercase tracking-wide">
                {currentDialog.name}
              </span>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${currentDialog.tagColor}`}>
                {currentDialog.tag}
              </span>
            </div>
            <p className="text-xs text-zinc-800 leading-snug font-medium">
              {isHappy && currentDialog.reactionSpeech
                ? currentDialog.reactionSpeech
                : currentDialog.speech}
            </p>
          </div>
        </div>

        {/* Step Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {/* STEP 1: Soil Texture */}
          {step === 1 && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-zinc-950">
                  1. How does your soil feel when squeezed moist?
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Hand squeeze test to calibrate moisture retention and infiltration:
                </p>
              </div>

              {[
                {
                  id: 'arena' as const,
                  label: 'Loose / Sandy',
                  desc: 'Rapid infiltration, fast percolation, low fertilizer retention',
                  emoji: '🥪',
                },
                {
                  id: 'franca' as const,
                  label: 'Forms pliable ball (Loam)',
                  desc: 'Optimal porous structure, balanced moisture retention and aeration',
                  emoji: '🌱',
                },
                {
                  id: 'arcilla' as const,
                  label: 'Very sticky / Plastic Clay',
                  desc: 'High water retention, compaction risk, and drainage puddling',
                  emoji: '🧱',
                },
              ].map((opt) => {
                const isSelected = soilTexture === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(() => setSoilTexture(opt.id))}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 border-b-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">{opt.label}</div>
                        <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: Stoniness & Depth */}
          {step === 2 && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-zinc-950">
                  2. Does your field have high stoniness or shallow topsoil depth?
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Determines feasibility of infiltration trenches and deep hilling:
                </p>
              </div>

              {[
                {
                  id: 'pedregoso' as const,
                  label: 'Yes (Shallow or Stony Soil)',
                  desc: 'High rock fraction, arable depth <30 cm. Requires raised ridges and mulch.',
                  emoji: '🪨',
                },
                {
                  id: 'profundo' as const,
                  label: 'No (Deep and Fertile Soil)',
                  desc: 'Arable depth >40 cm. Enables deep hilling, contour ditches, and vigorous roots.',
                  emoji: '🌾',
                },
              ].map((opt) => {
                const isSelected = soilStoniness === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(() => setSoilStoniness(opt.id))}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                        : 'border-zinc-200 border-b-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">{opt.label}</div>
                        <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 3: Real Vegetation Cover */}
          {step === 3 && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-zinc-950">
                  3. What is the current ground cover status in your parcel?
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Validates Sentinel-2 NDVI index and assesses rainfall erosion vulnerability:
                </p>
              </div>

              {[
                {
                  id: 'sembrado' as const,
                  label: 'Active Cultivated Crop',
                  desc: 'Vigorously growing crop, active green photosynthetic canopy covering topsoil.',
                  emoji: '🌱',
                },
                {
                  id: 'barbecho' as const,
                  label: 'Resting / Fallow with Mulch',
                  desc: 'Soil resting under protective crop stubble residue and organic matter.',
                  emoji: '🍂',
                },
                {
                  id: 'pasto' as const,
                  label: 'Natural Andean Grassland',
                  desc: 'Highland forage grassland cover protecting soil against erosion.',
                  emoji: '🌾',
                },
                {
                  id: 'suelo_desnudo' as const,
                  label: 'Bare Exposed Soil (No Mulch)',
                  desc: 'Direct exposure to solar radiation and wind, high erosion and compaction hazard.',
                  emoji: '🏜️',
                },
              ].map((opt) => {
                const isSelected = cropCoverNdvi === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(() => setCropCoverNdvi(opt.id))}
                    className={`w-full p-3 rounded-2xl border-2 border-b-4 text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-sky-600 border-b-sky-700 bg-sky-50 text-sky-950 font-bold ring-2 ring-sky-500/20'
                        : 'border-zinc-200 border-b-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">{opt.label}</div>
                        <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-sky-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 4: Water Source */}
          {step === 4 && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-zinc-950">
                  4. What is the primary water regime for this parcel?
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Cross-referenced with NASA GPM rainfall telemetry to calibrate water stress:
                </p>
              </div>

              {[
                {
                  id: 'secano' as const,
                  label: 'Rainfed Only (Secano)',
                  desc: '100% dependent on natural rainfall cycles. Requires drought-hardy crops.',
                  emoji: '🌧️',
                },
                {
                  id: 'auxilio' as const,
                  label: 'Rainfed + Supplementary Irrigation',
                  desc: 'Access to communal ditch or reservoir to mitigate short dry spells.',
                  emoji: '💧',
                },
                {
                  id: 'permanente' as const,
                  label: 'Permanent Technical Irrigation',
                  desc: 'Pressurized sprinkler or drip irrigation. Supports intensive high-demand crops.',
                  emoji: '🚰',
                },
              ].map((opt) => {
                const isSelected = waterSource === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(() => setWaterSource(opt.id))}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 border-b-blue-700 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-500/20'
                        : 'border-zinc-200 border-b-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">{opt.label}</div>
                        <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 5: Sowing Window */}
          {step === 5 && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="mb-2">
                <h3 className="text-sm font-bold text-zinc-950">
                  5. Based on ENSO forecasts: When is sowing planned?
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Adjusts planting schedule to prevent losses from seasonal dry spells or delayed rainfall:
                </p>
              </div>

              {[
                {
                  id: 'esta_semana' as const,
                  label: 'Already Started / This Week',
                  desc: 'Immediate planting. Urgent soil mulch application activated.',
                  emoji: '⚡',
                },
                {
                  id: '2_4_semanas' as const,
                  label: 'In 2 to 4 Weeks',
                  desc: 'Field preparation with sufficient lead time to incorporate residue.',
                  emoji: '📅',
                },
                {
                  id: '1_2_meses' as const,
                  label: 'In 1 to 2 Months',
                  desc: 'Awaiting full consolidation of summer rains for late sowing.',
                  emoji: '⏳',
                },
                {
                  id: 'proxima_campana' as const,
                  label: 'Postponed to Next Season',
                  desc: 'Conservative strategy: rest soil with nitrogen-fixing green manure legumes.',
                  emoji: '⏸️',
                },
              ].map((opt) => {
                const isSelected = sowingWindow === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(() => setSowingWindow(opt.id))}
                    className={`w-full p-3 rounded-2xl border-2 border-b-4 text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 border-b-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-500/20'
                        : 'border-zinc-200 border-b-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-zinc-900">{opt.label}</div>
                        <div className="text-[11px] text-zinc-500 leading-snug mt-0.5">{opt.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 6: Final Phytosanitary Verification & Unified Summary (Sin exceso de cartas) */}
          {step === 6 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-3.5 bg-white border-2 border-emerald-600/40 rounded-2xl shadow-xs space-y-3">
                {/* Score Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200">
                  <div>
                    <span className="text-xs font-bold text-zinc-950 block">
                      Soil Health & Resilience Score
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Triangulated: NASA SMAP + Sentinel-2 + In-Situ Field Test
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-mono font-black text-emerald-800">
                      {healthScore} / 100
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 block">
                      {healthScore >= 75 ? '✓ High Resilience' : '⚠️ Moderate Resilience'}
                    </span>
                  </div>
                </div>

                {/* 2 Tactile Interactive Toggle Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setHasWeevil(!hasWeevil);
                    }}
                    className={`p-2.5 rounded-xl border-2 text-left transition flex items-center justify-between cursor-pointer active:scale-98 ${
                      hasWeevil
                        ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-300/30'
                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block leading-tight">
                        {hasWeevil ? '⚠️ Weevil Detected' : '✓ No Weevils Detected'}
                      </span>
                      <span className="text-[10px] opacity-75">Premnotrypes spp.</span>
                    </div>
                    <span className="text-base">{hasWeevil ? '🦗' : '🛡️'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setHasFrostAlert(!hasFrostAlert);
                    }}
                    className={`p-2.5 rounded-xl border-2 text-left transition flex items-center justify-between cursor-pointer active:scale-98 ${
                      hasFrostAlert
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-300/30'
                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-800'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block leading-tight">
                        {hasFrostAlert ? '❄️ Frost Event Observed' : '☀️ No Frost Detected'}
                      </span>
                      <span className="text-[10px] opacity-75">Last 48 hours</span>
                    </div>
                    <span className="text-base">{hasFrostAlert ? '🥶' : '🌱'}</span>
                  </button>
                </div>

                {/* Direct 4-attribute chip row (No redundant nested cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-[11px]">
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/80">
                    <span className="text-[10px] text-zinc-400 block font-medium">Texture</span>
                    <span className="font-bold text-zinc-900 capitalize">{soilTexture}</span>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/80">
                    <span className="text-[10px] text-zinc-400 block font-medium">Depth</span>
                    <span className="font-bold text-zinc-900 capitalize">{soilStoniness}</span>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/80">
                    <span className="text-[10px] text-zinc-400 block font-medium">Cover</span>
                    <span className="font-bold text-zinc-900 capitalize">{cropCoverNdvi.replace('_', ' ')}</span>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200/80">
                    <span className="text-[10px] text-zinc-400 block font-medium">Irrigation</span>
                    <span className="font-bold text-zinc-900 capitalize">{waterSource}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-white border-t border-zinc-200 p-4 flex items-center justify-between gap-3 flex-shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-zinc-500 hover:text-zinc-800 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
          )}

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Continue to Step {step + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Synchronizing with Supabase...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-300" />
                  <span>Save Ground-Truth & Calibrate</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
