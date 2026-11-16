'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Check,
  ChevronRight,
  Sprout,
  Sun,
  X,
  HelpCircle,
  MapPin,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare, playWhoosh } from '@/lib/soundEffects';
import { ParcelItem } from '@/lib/types';
import { getActiveParcel, updateParcel } from '@/lib/deviceProfile';

interface SoilDiagnosticWizardModalProps {
  isOpen?: boolean;
  isInline?: boolean;
  onClose: () => void;
  onCompleteToRotation: () => void;
  onSaveProfileData?: (data: {
    soilMoisture: string;
    soilDepth: string;
    cropCover: string;
    waterSource: string;
    pestStatus: string;
    healthScore?: number;
    parcelId?: string;
  }) => void;
  activeParcel?: ParcelItem | null;
  parcels?: ParcelItem[];
  onSelectParcel?: (parcelId: string) => void;
}

export default function SoilDiagnosticWizardModal({
  isOpen = true,
  isInline = false,
  onClose,
  onCompleteToRotation,
  onSaveProfileData,
  activeParcel,
  parcels,
  onSelectParcel,
}: SoilDiagnosticWizardModalProps) {
  const [step, setStep] = useState(1);
  const [step1Val, setStep1Val] = useState<'Seca y polvo' | 'Húmeda y mullida' | 'Barro'>('Húmeda y mullida');
  const [step2Val, setStep2Val] = useState<'Profundo (más de 40 cm)' | 'Algo de piedras (20 a 40 cm)' | 'Muy pedregoso o superficial'>('Profundo (más de 40 cm)');
  const [step3Val, setStep3Val] = useState<'Cultivo verde o rastrojo abundante' | 'Rastrojo disperso o restos secos' | 'Tierra desnuda expuesta al sol'>('Cultivo verde o rastrojo abundante');
  const [step4Val, setStep4Val] = useState<'Secano (solo lluvia del cielo)' | 'Riego de auxilio (turno ocasional)' | 'Riego permanente o reservorio'>('Riego de auxilio (turno ocasional)');
  const [step5Val, setStep5Val] = useState<'Chacra sana y limpia' | 'Presencia de gorgojo de los andes' | 'Rancha o tizón tardío'>('Chacra sana y limpia');

  const [selectedParcelId, setSelectedParcelId] = useState<string>(activeParcel?.id || '');

  React.useEffect(() => {
    if (activeParcel?.id) {
      setSelectedParcelId(activeParcel.id);
    }
  }, [activeParcel?.id]);

  const targetParcel =
    (parcels && parcels.find((p) => p.id === selectedParcelId)) ||
    activeParcel ||
    (typeof window !== 'undefined' ? getActiveParcel() : null);
  const parcelName = targetParcel?.name || 'Chacra principal';
  const parcelDetails = targetParcel ? `${targetParcel.cropCategory || targetParcel.cropName} • ${targetParcel.areaHa} ha` : null;

  if (!isOpen) return null;

  const handleNext = () => {
    playBubblePop();
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Completed, go to conclusion screen (step 6)
      playSuccessFanfare();
      setStep(6);
      if (targetParcel) {
        updateParcel(targetParcel.id, {
          healthScore: calculatedHealthScore,
        });
      }
      if (onSaveProfileData) {
        onSaveProfileData({
          soilMoisture: step1Val,
          soilDepth: step2Val,
          cropCover: step3Val,
          waterSource: step4Val,
          pestStatus: step5Val,
          healthScore: calculatedHealthScore,
          parcelId: targetParcel?.id,
        });
      }
    }
  };

  const handleBack = () => {
    playBubblePop();
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
    }
  };

  const handleReset = () => {
    playWhoosh();
    setStep(1);
    setStep1Val('Húmeda y mullida');
    setStep2Val('Profundo (más de 40 cm)');
    setStep3Val('Cultivo verde o rastrojo abundante');
    setStep4Val('Riego de auxilio (turno ocasional)');
    setStep5Val('Chacra sana y limpia');
  };

  const progressPct = step <= 5 ? step * 20 : 100;

  // Dynamic edaphic health score based on genuine farmer answers
  const calculatedHealthScore = React.useMemo(() => {
    let score = 55;
    if (step1Val.includes('Húmeda')) score += 15;
    else if (step1Val.includes('Seca')) score += 5;
    else score += 8;

    if (step2Val.includes('Profundo')) score += 15;
    else if (step2Val.includes('Algo')) score += 8;
    else score -= 5;

    if (step3Val.includes('abundante')) score += 12;
    else if (step3Val.includes('disperso')) score += 6;
    else score -= 8;

    if (step4Val.includes('permanente')) score += 10;
    else if (step4Val.includes('auxilio')) score += 6;
    else score += 2;

    if (step5Val.includes('sana')) score += 12;
    else if (step5Val.includes('gorgojo')) score -= 14;
    else score -= 10;

    return Math.max(25, Math.min(98, score));
  }, [step1Val, step2Val, step3Val, step4Val, step5Val]);

  const dynamicActions = React.useMemo(() => {
    const list: string[] = [];
    if (step3Val.includes('expuesta') || step1Val.includes('Seca')) {
      list.push('Cubre la tierra descubierta con rastrojo o paja; evita quemarlo para retener humedad.');
    } else {
      list.push('Mantén la cobertura vegetal de rastrojo para nutrir la microbiología del suelo.');
    }

    if (step5Val.includes('gorgojo')) {
      list.push('Rotación obligatoria con Tarwi o Habas para romper el ciclo biológico del gorgojo.');
    } else if (step5Val.includes('Rancha')) {
      list.push('Abre zanjas de sangría para ventilar raíces y evitar encharcamientos fungosos.');
    } else {
      list.push('Aplica compost maduro o guano de corral descompuesto al fondo del surco.');
    }

    if (step2Val.includes('superficial')) {
      list.push('Traza surcos en contorno poco profundos sin remover capas rocosas.');
    } else if (step4Val.includes('permanente') || step4Val.includes('auxilio')) {
      list.push('Aprovecha los turnos de riego con riegos ligeros al amanecer para minimizar evaporación.');
    } else {
      list.push('Aprovecha las primeras lluvias estacionales para siembra oportuna en ladera.');
    }
    return list;
  }, [step1Val, step2Val, step3Val, step4Val, step5Val]);

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calculatedHealthScore / 100) * circumference;

  const content = (
    <div className="space-y-4 animate-in fade-in pb-16">
      {/* 0. Top Header Navigation (Matching Frame 006) */}
      <div className="flex items-center justify-between pb-1 pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-white border border-[#E5ECE2] flex items-center justify-center text-zinc-600 hover:text-zinc-900 cursor-pointer shadow-2xs transition"
          title="Atrás"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/80">
          DIAGNÓSTICO DE SUELO
        </span>

        <button
          type="button"
          onClick={handleReset}
          className="w-9 h-9 rounded-full bg-white border border-[#E5ECE2] flex items-center justify-center text-zinc-600 hover:text-zinc-900 cursor-pointer shadow-2xs transition"
          title="Reiniciar cuestionario"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Parcel Evaluation Header */}
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-950 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-emerald-200/80 flex items-center justify-center text-emerald-900 shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-800 block">
              Evaluando Parcela:
            </span>
            <span className="text-xs font-bold text-zinc-900 truncate block">
              {parcelName}
            </span>
          </div>
        </div>
        {parcelDetails && (
          <span className="text-[10px] font-semibold bg-white/90 border border-emerald-300/60 px-2 py-0.5 rounded-full text-emerald-900 shrink-0">
            {parcelDetails}
          </span>
        )}
      </div>

      {/* Quick parcel switcher chips if multiple parcels exist */}
      {parcels && parcels.length > 1 && step <= 5 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {parcels.map((p) => {
            const isSel = targetParcel?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  playBubblePop();
                  setSelectedParcelId(p.id);
                  if (onSelectParcel) onSelectParcel(p.id);
                }}
                className={`px-3 py-1 rounded-full text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-[#132A1C] text-white font-semibold shadow-xs'
                    : 'bg-white text-zinc-700 border border-[#E5ECE2] hover:bg-zinc-50'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isSel ? 'text-[#A3E635]' : 'text-zinc-400'}`} />
                <span>{p.name.split('•')[0].trim()}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* HERO TITLE (Matching Frame 006) */}
      {step <= 5 && (
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#EAF3E3] items-center justify-center text-emerald-800 shadow-2xs">
            <Sprout className="w-6 h-6 text-emerald-700" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60 block">
              UNA MIRADA A TU CHACRA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#132A1C] leading-tight">
              Suelo fuerte,{' '}
              <span className="font-serif italic text-emerald-800 font-normal">
                cosecha segura.
              </span>
            </h1>
            <p className="text-xs text-zinc-600">
              Responde cinco preguntas. Te tomará menos de un minuto.
            </p>
          </div>
        </div>
      )}

      {/* STEP 1 TO 5 CARD */}
      {step <= 5 && (
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] space-y-4">
          {/* Progress Bar & Step Label */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black text-emerald-900">
              <span>PASO {step} / 5</span>
              <span className="font-mono text-zinc-500">{progressPct}%</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#7BB63E] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* STEP 1: Textura y humedad */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60 block">
                  PRUEBA DEL PUÑO
                </span>
                <h3 className="text-base font-black text-[#132A1C]">Textura y humedad</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ¿Cómo se siente la tierra al apretarla con la mano?
                </p>
              </div>

              <div className="space-y-2">
                {(['Seca y polvo', 'Húmeda y mullida', 'Barro'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setStep1Val(opt);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                      step1Val === opt
                        ? 'bg-[#F2F8ED] border-[#7BB63E] ring-1 ring-[#7BB63E] text-[#132A1C] font-black'
                        : 'bg-white border-[#E5ECE2] text-zinc-700 hover:bg-zinc-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          step1Val === opt
                            ? 'border-[#7BB63E] bg-[#7BB63E]'
                            : 'border-zinc-300'
                        }`}
                      >
                        {step1Val === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="text-xs">{opt}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Profundidad y pedregosidad */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60 block">
                  PROFUNDIDAD Y PEDREGOSIDAD
                </span>
                <h3 className="text-base font-black text-[#132A1C]">Profundidad del terreno</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ¿Hasta dónde entra la lampa o barretón antes de topar roca?
                </p>
              </div>

              <div className="space-y-2">
                {(['Profundo (más de 40 cm)', 'Algo de piedras (20 a 40 cm)', 'Muy pedregoso o superficial'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setStep2Val(opt);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                      step2Val === opt
                        ? 'bg-[#F2F8ED] border-[#7BB63E] ring-1 ring-[#7BB63E] text-[#132A1C] font-black'
                        : 'bg-white border-[#E5ECE2] text-zinc-700 hover:bg-zinc-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          step2Val === opt
                            ? 'border-[#7BB63E] bg-[#7BB63E]'
                            : 'border-zinc-300'
                        }`}
                      >
                        {step2Val === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="text-xs">{opt}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Cobertura del suelo */}
          {step === 3 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60 block">
                  COBERTURA DEL SUELO
                </span>
                <h3 className="text-base font-black text-[#132A1C]">Cobertura del terreno</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ¿Cómo está la superficie de tu parcela hoy?
                </p>
              </div>

              <div className="space-y-2">
                {(['Cultivo verde o rastrojo abundante', 'Rastrojo disperso o restos secos', 'Tierra desnuda expuesta al sol'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setStep3Val(opt);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                      step3Val === opt
                        ? 'bg-[#F2F8ED] border-[#7BB63E] ring-1 ring-[#7BB63E] text-[#132A1C] font-black'
                        : 'bg-white border-[#E5ECE2] text-zinc-700 hover:bg-zinc-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          step3Val === opt
                            ? 'border-[#7BB63E] bg-[#7BB63E]'
                            : 'border-zinc-300'
                        }`}
                      >
                        {step3Val === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="text-xs">{opt}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Acceso al agua */}
          {step === 4 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60 block">
                  DISPONIBILIDAD DE AGUA
                </span>
                <h3 className="text-base font-black text-[#132A1C]">Acceso al agua</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ¿Con qué fuente de riego cuenta tu chacra?
                </p>
              </div>

              <div className="space-y-2">
                {(['Secano (solo lluvia del cielo)', 'Riego de auxilio (turno ocasional)', 'Riego permanente o reservorio'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setStep4Val(opt);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                      step4Val === opt
                        ? 'bg-[#F2F8ED] border-[#7BB63E] ring-1 ring-[#7BB63E] text-[#132A1C] font-black'
                        : 'bg-white border-[#E5ECE2] text-zinc-700 hover:bg-zinc-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          step4Val === opt
                            ? 'border-[#7BB63E] bg-[#7BB63E]'
                            : 'border-zinc-300'
                        }`}
                      >
                        {step4Val === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="text-xs">{opt}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Sanidad y plagas */}
          {step === 5 && (
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60 block">
                  SANIDAD Y PLAGAS
                </span>
                <h3 className="text-base font-black text-[#132A1C]">Sanidad de la chacra</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ¿Has detectado señales de plagas o enfermedades en la última campaña?
                </p>
              </div>

              <div className="space-y-2">
                {(['Chacra sana y limpia', 'Presencia de gorgojo de los andes', 'Rancha o tizón tardío'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setStep5Val(opt);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-2 transition cursor-pointer ${
                      step5Val === opt
                        ? 'bg-[#F2F8ED] border-[#7BB63E] ring-1 ring-[#7BB63E] text-[#132A1C] font-black'
                        : 'bg-white border-[#E5ECE2] text-zinc-700 hover:bg-zinc-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          step5Val === opt
                            ? 'border-[#7BB63E] bg-[#7BB63E]'
                            : 'border-zinc-300'
                        }`}
                      >
                        {step5Val === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <span className="text-xs">{opt}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nav Buttons (Frame 006 layout: < Atrás on left, Continuar -> on right) */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleBack}
              className="text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer px-3 py-2"
            >
              ‹ Atrás
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-black text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{step === 5 ? 'Ver resultados' : 'Continuar'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center pt-0.5">
            <span className="text-[10px] text-zinc-400 font-medium flex items-center justify-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Elige lo que más se parece a tu parcela hoy.
            </span>
          </div>

          {/* Avatar Guiding Pill with real 3D avatars */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3 border border-[#E5ECE2] flex items-center gap-3 text-xs text-zinc-600">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 overflow-hidden border border-emerald-300">
              <img
                src={step <= 2 || step === 5 ? '/images/kipu_llama_happy.png' : '/images/astro_satelin.png'}
                alt={step <= 2 || step === 5 ? 'Kipu' : 'Astro'}
                className="w-7 h-7 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <p className="text-[11px] leading-tight font-medium">
              {step === 1 && 'Kipu: Aprieta la tierra a la altura de las raíces; si conserva la forma sin agrietarse, el suelo tiene buena estructura.'}
              {step === 2 && 'Kipu: La profundidad efectiva del suelo determina cuánta agua y nutrientes pueden retener tus raíces.'}
              {step === 3 && 'Astro: Sentinel-2 detecta reflectancia; el rastrojo reduce la evaporación solar directa hasta en un 40%.'}
              {step === 4 && 'Astro: SMAP calcula la capacidad de campo para programar riegos oportunos y evitar saturación.'}
              {step === 5 && 'Kipu: Romper el ciclo biológico del gorgojo mediante rotación con Tarwi elimina hasta el 84% de larvas.'}
            </p>
          </div>
        </div>
      )}

      {/* STEP 6: CONCLUSION SCREEN (Matching end_007.jpg) */}
      {step === 6 && (
        <div className="space-y-4 animate-in fade-in">
          {/* Top Circular Gauge 88/100 */}
          <div className="flex flex-col items-center justify-center text-center space-y-2 pt-2">
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 90 90">
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke="#E5ECE2"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="45"
                  cy="45"
                  r={radius}
                  stroke="#7BB63E"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-[#132A1C] leading-none">
                  {calculatedHealthScore}<span className="text-xs text-zinc-500 font-normal">/100</span>
                </span>
              </div>
            </div>

            {/* Badge: Resiliencia Dinámica */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
              calculatedHealthScore >= 75
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300/60'
                : calculatedHealthScore >= 50
                ? 'bg-amber-100 text-amber-900 border border-amber-300/60'
                : 'bg-red-100 text-red-900 border border-red-300/60'
            }`}>
              <Check className="w-3.5 h-3.5 text-emerald-800 stroke-[3]" />
              <span>
                {calculatedHealthScore >= 75
                  ? 'Resiliencia favorable'
                  : calculatedHealthScore >= 50
                  ? 'Resiliencia moderada'
                  : 'Atención requerida'}
              </span>
            </div>

            {/* Confirmation of Parcel Diagnosed */}
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/80">
                <MapPin className="w-3 h-3 text-emerald-700" />
                <span>Diagnóstico guardado en: <strong>{parcelName}</strong></span>
              </span>
            </div>
          </div>

          {/* Editorial Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-[#132A1C] leading-tight">
              Tu suelo tiene{' '}
              <span className="font-serif italic text-emerald-800 font-normal">
                {calculatedHealthScore >= 75
                  ? 'un buen punto de partida.'
                  : calculatedHealthScore >= 50
                  ? 'capacidad de recuperación.'
                  : 'necesidad de cuidados especiales.'}
              </span>
            </h2>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              Con estas prácticas puedes aumentar su resiliencia antes de la siguiente campaña.
            </p>
          </div>

          {/* TRES ACCIONES PARA TU CHACRA (DINÁMICAS SEGÚN RESPUESTAS) */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60 block">
              TRES ACCIONES PARA TU CHACRA
            </span>

            {/* Action 01 */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5ECE2]">
              <div className="flex items-start gap-3">
                <span className="text-xs font-black text-emerald-800 font-mono shrink-0 pt-0.5">
                  01
                </span>
                <p className="text-xs font-medium text-zinc-800 leading-snug">
                  {dynamicActions[0]}
                </p>
              </div>
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            </div>

            {/* Action 02 */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E5ECE2]">
              <div className="flex items-start gap-3">
                <span className="text-xs font-black text-emerald-800 font-mono shrink-0 pt-0.5">
                  02
                </span>
                <p className="text-xs font-medium text-zinc-800 leading-snug">
                  {dynamicActions[1]}
                </p>
              </div>
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            </div>

            {/* Action 03 */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="text-xs font-black text-emerald-800 font-mono shrink-0 pt-0.5">
                  03
                </span>
                <p className="text-xs font-medium text-zinc-800 leading-snug">
                  {dynamicActions[2]}
                </p>
              </div>
              <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            </div>
          </div>

          {/* Ver Plan de Rotación Button */}
          <button
            type="button"
            onClick={() => {
              playSuccessFanfare();
              if (onSaveProfileData) {
                onSaveProfileData({
                  soilMoisture: step1Val,
                  soilDepth: step2Val,
                  cropCover: step3Val,
                  waterSource: step4Val,
                  pestStatus: step5Val,
                  healthScore: calculatedHealthScore,
                  parcelId: targetParcel?.id,
                });
              }
              onCompleteToRotation();
            }}
            className="w-full py-3.5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
          >
            <span>Ver plan de rotación</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  if (isInline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#F7F9F6] w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-5 shadow-2xl border border-[#E5ECE2] text-zinc-900 relative">
        {content}
      </div>
    </div>
  );
}
