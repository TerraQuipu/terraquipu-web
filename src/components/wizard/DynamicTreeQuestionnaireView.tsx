'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  Layers,
  Droplets,
  Sprout,
  Info,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Check,
  RefreshCw,
  Compass,
  Mountain,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import { ParcelItem, DiagnosticoIncertidumbre, RotacionA13Resultado } from '@/lib/types';
import {
  Pregunta,
  Opcion,
  PREGUNTAS_RAIZ,
  construir_parametros,
  reconciliar_esenciales,
  obtenerPreguntasActivas,
  ParametrosConstruidos,
} from '@/lib/dynamicQuestionnaireEngine';
import {
  calcular_incertidumbre_recomendacion,
  ResultadoIncertidumbre,
} from '@/lib/uncertaintyEngine';
import {
  ejecutar_A13,
  clasificarVulnerabilidad,
  ClaseTextura,
  CuestionarioAgricultor,
} from '@/lib/agroenvironmentalEngine';
import { calibrateParcel } from '@/lib/deviceProfile';

interface DynamicTreeQuestionnaireViewProps {
  parcel: ParcelItem;
  onComplete: (updatedParcel: ParcelItem) => void;
  onCancel: () => void;
}

export default function DynamicTreeQuestionnaireView({
  parcel,
  onComplete,
  onCancel,
}: DynamicTreeQuestionnaireViewProps) {
  // Pre-load existing responses if this parcel was already calibrated
  const [respuestas, setRespuestas] = useState<Record<string, string>>(() => {
    return parcel.cuestionarioRespuestas ? { ...parcel.cuestionarioRespuestas } : {};
  });

  // Flow phase: 'context' (crop contextualizer) | 'questions' (tree questions) | 'summary' (Kipu diagnosis)
  const [phase, setPhase] = useState<'context' | 'questions' | 'summary'>(() => {
    // If it already has calibration, show summary immediately with option to modify
    return parcel.fechaCalibracion && parcel.diagnosticoIncertidumbre
      ? 'summary'
      : parcel.cuestionarioRespuestas && Object.keys(parcel.cuestionarioRespuestas).length > 3
      ? 'questions'
      : 'context';
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Identify matching crop key from parcel
  const matchedCropKey = useMemo(() => {
    const text = `${parcel.cropName} ${parcel.cropId} ${parcel.cropCategory}`.toLowerCase();
    if (text.includes('papa')) return 'papa';
    if (text.includes('olluco') || text.includes('oyuco')) return 'olluco';
    if (text.includes('quinua') || text.includes('quinoa')) return 'quinua';
    if (text.includes('oca')) return 'oca';
    if (text.includes('tarwi') || text.includes('chocho')) return 'tarwi';
    if (text.includes('haba')) return 'haba';
    if (text.includes('maiz') || text.includes('maíz') || text.includes('cebada')) return 'otro';
    return 'otro';
  }, [parcel]);

  // Compute active sequence of questions dynamically
  const activeQuestions = useMemo(() => {
    return obtenerPreguntasActivas(respuestas);
  }, [respuestas]);

  const currentPregunta = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Progress metrics
  const totalQuestionsEstimate = Math.max(activeQuestions.length, 8);
  const progressPct = Math.min(
    100,
    Math.round(((currentQuestionIndex + 1) / totalQuestionsEstimate) * 100)
  );

  // Compute live parameters and uncertainty calculation
  const calculatedData = useMemo(() => {
    if (Object.keys(respuestas).length < 2) return null;

    const parametros = construir_parametros(respuestas);

    // Discrepancy checks (farmer ground truth vs satellite baseline)
    // Both ground-truth cobertura and agua are reconciled against satellite SMAP/NDVI
    const delAgricultor = {
      ...parametros.esenciales,
      agua: parametros.complementarias.agua,
    };
    const externos = {
      cobertura: parcel.ndviScore > 0.5 ? 'cultivo' : 'rastrojo',
      agua: parcel.smapHumidity > 20 ? 'riego_permanente' : 'secano',
    };
    const { discrepancias } = reconciliar_esenciales(delAgricultor, externos);

    const areaM2 = (parcel.areaHa || 1.0) * 10000;
    const datosVisor = {
      area_m2: areaM2,
      areaHa: parcel.areaHa,
      pendiente_pct: 12,
    };
    const datosApi = {
      precipitation_mm: 1.2,
      ndvi_mean: parcel.ndviScore,
      smap_humidity: parcel.smapHumidity,
    };
    const alertaMacro = {
      escenario_activo: 'deficit_lluvias',
      probabilidad_porcentaje: 80,
    };

    const incertidumbre = calcular_incertidumbre_recomendacion(
      parametros,
      discrepancias,
      datosVisor,
      datosApi,
      alertaMacro
    );

    // Rotation A13
    const rotacionA13 = ejecutar_A13(parametros.esenciales as any, parametros.complementarias as any);

    // Vulnerability classification
    const cuestionarioCompleto: CuestionarioAgricultor = {
      esenciales: parametros.esenciales as any,
      complementarias: parametros.complementarias as any,
      adicionales: parametros.factores_extra as any,
    };
    const vulnerabilidad = clasificarVulnerabilidad(cuestionarioCompleto, {
      areaHa: parcel.areaHa,
      pendientePct: 12,
      smapMoisturePct: parcel.smapHumidity,
      ndvi: parcel.ndviScore,
    });

    return {
      parametros,
      incertidumbre,
      rotacionA13,
      vulnerabilidad,
    };
  }, [respuestas, parcel]);

  // Context Step Handlers
  const handleContextOption = (type: 'growing' | 'soon' | 'other') => {
    playBubblePop();
    const nextAnswers = { ...respuestas };

    if (type === 'growing') {
      nextAnswers['1'] = 'cultivo_creciendo';
      nextAnswers['1a'] = matchedCropKey;
      if (matchedCropKey === 'otro') {
        const text = `${parcel.cropName} ${parcel.cropCategory}`.toLowerCase();
        nextAnswers['1a_tipo'] =
          text.includes('maiz') || text.includes('cebada')
            ? 'cereal_grano'
            : text.includes('tarwi') || text.includes('haba')
            ? 'leguminosa'
            : 'tuberculo_raiz';
      }
      setRespuestas(nextAnswers);
      const active = obtenerPreguntasActivas(nextAnswers);
      const p3Idx = active.findIndex((q) => q.id === '3');
      setCurrentQuestionIndex(p3Idx >= 0 ? p3Idx : 1);
      setPhase('questions');
    } else if (type === 'soon') {
      nextAnswers['1'] = 'rastrojo';
      nextAnswers['2b'] = matchedCropKey;
      if (matchedCropKey === 'otro') {
        const text = `${parcel.cropName} ${parcel.cropCategory}`.toLowerCase();
        nextAnswers['2b_tipo'] =
          text.includes('maiz') || text.includes('cebada')
            ? 'cereal_grano'
            : text.includes('tarwi') || text.includes('haba')
            ? 'leguminosa'
            : 'tuberculo_raiz';
      }
      setRespuestas(nextAnswers);
      const active = obtenerPreguntasActivas(nextAnswers);
      const p2Idx = active.findIndex((q) => q.id === '2');
      setCurrentQuestionIndex(p2Idx >= 0 ? p2Idx : 0);
      setPhase('questions');
    } else {
      // Standard flow starting at P1
      setPhase('questions');
      setCurrentQuestionIndex(0);
    }
  };

  // Option selection in standard tree
  const handleSelectOption = (opcionClave: string) => {
    playBubblePop();
    if (!currentPregunta) return;

    const nextAnswers = {
      ...respuestas,
      [currentPregunta.id]: opcionClave,
    };

    // If changing P1 from or to cultivo_creciendo, clean obsolete branches
    if (currentPregunta.id === '1') {
      if (opcionClave === 'cultivo_creciendo') {
        delete nextAnswers['2'];
        delete nextAnswers['2b'];
        delete nextAnswers['2b_tipo'];
      } else {
        delete nextAnswers['1a'];
        delete nextAnswers['1a_tipo'];
      }
    }

    // If changing P2 to descansar, clean 2b
    if (currentPregunta.id === '2' && opcionClave === 'descansar') {
      delete nextAnswers['2b'];
      delete nextAnswers['2b_tipo'];
    }

    // If changing P6, clean subquestion answers
    if (currentPregunta.id === '6') {
      if (opcionClave === 'conoce') {
        delete nextAnswers['6b'];
      } else {
        delete nextAnswers['6a'];
      }
    }

    // If changing a crop question away from 'otro', clean lingering _tipo
    if (opcionClave !== 'otro' && nextAnswers[`${currentPregunta.id}_tipo`]) {
      delete nextAnswers[`${currentPregunta.id}_tipo`];
    }

    setRespuestas(nextAnswers);

    // Compute next active list with updated answers
    const nextActive = obtenerPreguntasActivas(nextAnswers);

    // If we just answered P2 and 2b is already auto-completed from contextualizer, advance straight to P3
    if (currentPregunta.id === '2' && opcionClave !== 'descansar' && nextAnswers['2b']) {
      const p3Index = nextActive.findIndex((q) => q.id === '3');
      if (p3Index >= 0) {
        setCurrentQuestionIndex(p3Index);
        return;
      }
    }

    // Find the current question's position in the newly generated list
    const currentIndexInNew = nextActive.findIndex((q) => q.id === currentPregunta.id);

    if (currentIndexInNew >= 0 && currentIndexInNew < nextActive.length - 1) {
      setCurrentQuestionIndex(currentIndexInNew + 1);
    } else if (currentQuestionIndex < nextActive.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished all available questions -> summary!
      playSuccessFanfare();
      setPhase('summary');
    }
  };

  const handlePrevQuestion = () => {
    playBubblePop();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      setPhase('context');
    }
  };

  const handleFinishAndSave = () => {
    playSuccessFanfare();
    if (!calculatedData) return;

    const diagIncertidumbre: DiagnosticoIncertidumbre = {
      total: calculatedData.incertidumbre.incertidumbre_total_porcentaje,
      fiabilidad: calculatedData.incertidumbre.fiabilidad_porcentaje,
      nivel: calculatedData.incertidumbre.nivel_confianza_ux,
      desglose: calculatedData.incertidumbre.desglose_penalizaciones,
      motivos: calculatedData.incertidumbre.motivos_principales,
    };

    const rotacion: RotacionA13Resultado = {
      cultivo_sugerido: calculatedData.rotacionA13.cultivo_sugerido,
      alternativa: calculatedData.rotacionA13.alternativa,
      confianza: calculatedData.rotacionA13.confianza,
      motivo: calculatedData.rotacionA13.motivo,
    };

    const updatedParcel = calibrateParcel(parcel.id, {
      cuestionarioRespuestas: respuestas,
      cuestionarioParametros: calculatedData.parametros,
      diagnosticoIncertidumbre: diagIncertidumbre,
      rotacionA13: rotacion,
      vulnerabilidad: calculatedData.vulnerabilidad.nivel,
    });

    if (updatedParcel) {
      onComplete(updatedParcel);
    } else {
      onComplete({
        ...parcel,
        cuestionarioRespuestas: respuestas,
        cuestionarioParametros: calculatedData.parametros,
        diagnosticoIncertidumbre: diagIncertidumbre,
        rotacionA13: rotacion,
        vulnerabilidad: calculatedData.vulnerabilidad.nivel,
        fechaCalibracion: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0F2417] text-white font-sans overflow-hidden">
      {/* =========================================================================
          TOP BAR: KIPU HEADER & PROGRESS
         ========================================================================= */}
      <div className="px-4 py-3 bg-[#132A1C]/90 border-b border-emerald-900/60 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition cursor-pointer"
            title="Cancelar calibración"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#A3E635] tracking-widest uppercase">
                CALIBRACIÓN AGROAMBIENTAL IN SITU
              </span>
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
              {parcel.name}
            </h2>
          </div>
        </div>

        {/* Current Crop Pill */}
        <div className="flex items-center gap-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/80 text-[11px] font-medium text-emerald-300">
          <Sprout className="w-3.5 h-3.5 text-[#A3E635]" />
          <span className="font-semibold text-white">{parcel.cropName}</span>
        </div>
      </div>

      {/* Progress Bar for Questions */}
      {phase === 'questions' && (
        <div className="w-full bg-emerald-950/60 h-1.5 shrink-0 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#A3E635] to-lime-300 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      {/* =========================================================================
          MAIN CONTENT AREA
         ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-lg mx-auto w-full flex flex-col justify-between">
        {/* ================= PHASE 1: CROP CONTEXTUALIZATION ================= */}
        {phase === 'context' && (
          <div className="space-y-4 my-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Kipu Andean Copilot Greeting Box */}
            <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-950/90 rounded-3xl p-4 border border-emerald-700/50 space-y-2.5 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#7BB63E] text-[#132A1C] flex items-center justify-center font-bold text-sm shadow-md shadow-lime-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Kipu Copiloto Andino</h3>
                  <p className="text-[10px] text-emerald-300">
                    Adaptación bioclimática para {parcel.microcuenca}
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-200 leading-relaxed">
                Detectamos que elegiste <strong className="text-[#A3E635]">{parcel.cropName}</strong> ({parcel.areaHa} ha). Para ajustar las recomendaciones de siembra, heladas y nutrición, dinos cuál es la situación en el terreno:
              </p>
            </div>

            {/* 3 Quick Action Context Cards */}
            <div className="space-y-2.5">
              {/* Option A: Already growing */}
              <button
                type="button"
                onClick={() => handleContextOption('growing')}
                className="w-full text-left p-3.5 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/50 hover:border-[#A3E635] transition flex items-start gap-3 group cursor-pointer shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-800/80 group-hover:bg-[#7BB63E] text-white group-hover:text-[#132A1C] flex items-center justify-center shrink-0 transition text-base">
                  🌱
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#A3E635] transition">
                      Ya está creciendo hoy en la chacra
                    </h4>
                    <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50 font-mono">
                      1 toque
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                    El cultivo ya germinó o se encuentra en desarrollo en los surcos.
                  </p>
                </div>
              </button>

              {/* Option B: Planting soon */}
              <button
                type="button"
                onClick={() => handleContextOption('soon')}
                className="w-full text-left p-3.5 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-700/50 hover:border-[#A3E635] transition flex items-start gap-3 group cursor-pointer shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-800/80 group-hover:bg-[#7BB63E] text-white group-hover:text-[#132A1C] flex items-center justify-center shrink-0 transition text-base">
                  ⏳
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#A3E635] transition">
                      Lo sembraré próximamente
                    </h4>
                    <span className="text-[9px] bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50 font-mono">
                      Planificación
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-0.5 leading-snug">
                    Tengo la semilla lista y estoy preparando la tierra o esperando la fecha propicia.
                  </p>
                </div>
              </button>

              {/* Option C: Other state */}
              <button
                type="button"
                onClick={() => handleContextOption('other')}
                className="w-full text-left p-3.5 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 hover:border-white/40 transition flex items-start gap-3 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 group-hover:text-white flex items-center justify-center shrink-0 transition text-base">
                  🌾
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-white transition">
                    El suelo tiene otro estado (Pasto / Descanso / Tierra desnuda)
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                    Responder el árbol completo paso a paso desde el estado del suelo.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ================= PHASE 2: DYNAMIC QUESTION TREE ================= */}
        {phase === 'questions' && currentPregunta && (
          <div className="space-y-4 my-auto animate-in fade-in slide-in-from-right-3 duration-250">
            {/* Question Header & Andean Block Badge */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9.5px] uppercase font-bold text-[#A3E635] tracking-wider bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800/60 font-mono">
                  BLOQUE {currentPregunta.bloque.toUpperCase()} · PREGUNTA {currentPregunta.id}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {currentQuestionIndex + 1} de {activeQuestions.length}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentPregunta.texto}
              </h3>
              {currentPregunta.subtexto && (
                <p className="text-xs text-zinc-300 mt-1 leading-normal font-light">
                  {currentPregunta.subtexto}
                </p>
              )}
            </div>

            {/* Special Visual Render for P6b (Prueba del Puñado Ilustrada) */}
            {currentPregunta.id === '6b' ? (
              <div className="space-y-2.5 pt-1">
                <div className="bg-emerald-950/90 rounded-2xl p-3 border border-emerald-700/60 flex items-center gap-2.5 text-xs text-emerald-200">
                  <div className="w-8 h-8 rounded-xl bg-[#7BB63E] text-[#132A1C] flex items-center justify-center font-bold text-base shrink-0">
                    ✋
                  </div>
                  <p className="text-[11px] leading-snug">
                    Toma un puñado de tierra húmeda de los primeros 15 cm, apriétalo con fuerza y observa qué sucede al abrir la palma:
                  </p>
                </div>

                {currentPregunta.opciones.map((opcion) => {
                  const isSelected = respuestas[currentPregunta.id] === opcion.clave;
                  return (
                    <div
                      key={opcion.clave}
                      onClick={() => handleSelectOption(opcion.clave)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-md ${
                        isSelected
                          ? 'bg-emerald-900 border-[#A3E635] ring-2 ring-[#A3E635]/50'
                          : 'bg-emerald-950/70 border-emerald-800/80 hover:bg-emerald-900/60 hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-xl shrink-0">
                          {opcion.icono || '🌱'}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {opcion.texto}
                          </h4>
                          {opcion.subtexto && (
                            <p className="text-[10.5px] text-zinc-300 mt-0.5 leading-tight">
                              {opcion.subtexto}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#7BB63E] border-[#A3E635] text-[#132A1C]'
                            : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Regular Question Options Grid */
              <div className="space-y-2 pt-1 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
                {currentPregunta.opciones.map((opcion) => {
                  const isSelected = respuestas[currentPregunta.id] === opcion.clave;

                  return (
                    <div
                      key={opcion.clave}
                      onClick={() => handleSelectOption(opcion.clave)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-900 border-[#A3E635] ring-2 ring-[#A3E635]/40 shadow-md'
                          : 'bg-emerald-950/60 border-emerald-800/60 hover:bg-emerald-900/60 hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {opcion.icono && (
                          <div className="w-8 h-8 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center text-base shrink-0">
                            {opcion.icono}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {opcion.texto}
                          </h4>
                          {opcion.subtexto && (
                            <p className="text-[10px] sm:text-[11px] text-zinc-300 line-clamp-1 leading-snug">
                              {opcion.subtexto}
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-[#7BB63E] border-[#A3E635] text-[#132A1C]'
                            : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={handlePrevQuestion}
                className="flex-1 py-2.5 rounded-full border border-white/20 text-zinc-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {respuestas[currentPregunta.id] && (
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    if (currentQuestionIndex < activeQuestions.length - 1) {
                      setCurrentQuestionIndex((prev) => prev + 1);
                    } else {
                      playSuccessFanfare();
                      setPhase('summary');
                    }
                  }}
                  className="flex-1 py-2.5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-semibold text-xs flex items-center justify-center gap-1 shadow-md shadow-lime-600/30 transition cursor-pointer"
                >
                  <span>
                    {currentQuestionIndex < activeQuestions.length - 1 ? 'Siguiente' : 'Ver Diagnóstico'}
                  </span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= PHASE 3: CONCLUSION & COMPREHENSIVE KIPU DIAGNOSIS ================= */}
        {phase === 'summary' && calculatedData && (
          <div className="space-y-4 my-auto animate-in fade-in zoom-in-95 duration-300">
            {/* Header: Diagnóstico Listo */}
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A3E635] bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800/80 font-mono">
                DIAGNÓSTICO INTEGRAL CALIBRADO
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Ficha Agroambiental In Situ
              </h3>
              <p className="text-xs text-zinc-300">
                Calibración individual para <strong>{parcel.name}</strong> ({parcel.areaHa} ha)
              </p>
            </div>

            {/* CARD 1: Semáforo de Incertidumbre y Fiabilidad */}
            <div className="bg-emerald-950/80 rounded-3xl p-4 border border-emerald-800/80 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                    FIABILIDAD DEL MODELO
                  </span>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <ShieldCheck className="w-4 h-4 text-[#A3E635]" />
                    <span>Confianza {calculatedData.incertidumbre.nivel_confianza_ux}</span>
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#A3E635] font-mono leading-none block">
                    {calculatedData.incertidumbre.fiabilidad_porcentaje}%
                  </span>
                  <span className="text-[9.5px] text-zinc-400">
                    Incertidumbre: {calculatedData.incertidumbre.incertidumbre_total_porcentaje}%
                  </span>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    calculatedData.incertidumbre.incertidumbre_total_porcentaje <= 20
                      ? 'bg-[#A3E635]'
                      : calculatedData.incertidumbre.incertidumbre_total_porcentaje <= 45
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${calculatedData.incertidumbre.fiabilidad_porcentaje}%` }}
                />
              </div>

              {/* Collapsible Penalties Breakdown */}
              <div className="border-t border-emerald-900/80 pt-2.5">
                <button
                  type="button"
                  onClick={() => setShowBreakdown((prev) => !prev)}
                  className="w-full flex items-center justify-between text-[11px] text-emerald-300 font-semibold hover:text-white transition"
                >
                  <span>Ver desglose técnico de 6 penalizaciones</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${showBreakdown ? 'rotate-90' : ''}`}
                  />
                </button>

                {showBreakdown && (
                  <div className="mt-2.5 space-y-1.5 text-[10.5px] bg-black/30 rounded-2xl p-2.5 border border-white/10">
                    <div className="flex justify-between text-zinc-300">
                      <span>1. Clima Base (ENFEN/SENAMHI):</span>
                      <span className="font-mono font-bold text-white">
                        +{calculatedData.incertidumbre.desglose_penalizaciones.clima_base}%
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>2. Geometría Espacial ({parcel.areaHa} ha):</span>
                      <span className="font-mono font-bold text-white">
                        +{calculatedData.incertidumbre.desglose_penalizaciones.geometria_espacial}%
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>3. Choque Macro-Microclima:</span>
                      <span className="font-mono font-bold text-white">
                        +{calculatedData.incertidumbre.desglose_penalizaciones.choque_macro_micro}%
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>4. Satélite "Ciego" (NDVI vs campo):</span>
                      <span className="font-mono font-bold text-white">
                        +{calculatedData.incertidumbre.desglose_penalizaciones.satelite_ciego}%
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>5. Resolución Edáfica (Prueba Puñado):</span>
                      <span className="font-mono font-bold text-white">
                        +{calculatedData.incertidumbre.desglose_penalizaciones.resolucion_edafica}%
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-300">
                      <span>6. Historial de Rotación / Nutrientes:</span>
                      <span className="font-mono font-bold text-white">
                        +{calculatedData.incertidumbre.desglose_penalizaciones.historial_desconocido}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CARD 2: Vulnerabilidad y Suelo */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-emerald-950/70 rounded-2xl p-3 border border-emerald-800/60 space-y-1">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase block">
                  Vulnerabilidad Chacra
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      calculatedData.vulnerabilidad.nivel === 'Baja'
                        ? 'bg-emerald-400'
                        : calculatedData.vulnerabilidad.nivel === 'Media'
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                    }`}
                  />
                  <h4 className="text-sm font-bold text-white">
                    {calculatedData.vulnerabilidad.nivel}
                  </h4>
                </div>
                <p className="text-[10px] text-zinc-300 line-clamp-2 leading-tight">
                  {calculatedData.vulnerabilidad.motivo}
                </p>
              </div>

              <div className="bg-emerald-950/70 rounded-2xl p-3 border border-emerald-800/60 space-y-1">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase block">
                  Textura Registrada
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🌰</span>
                  <h4 className="text-sm font-bold text-white capitalize">
                    {calculatedData.parametros.complementarias.textura.clase}
                  </h4>
                </div>
                <p className="text-[10px] text-emerald-300 capitalize">
                  Vía {calculatedData.parametros.complementarias.textura.origen.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* CARD 3: Recomendación de Rotación de Cultivos A13 */}
            <div className="bg-gradient-to-br from-[#132A1C] to-emerald-950 rounded-3xl p-4 border border-[#7BB63E]/40 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#A3E635] uppercase tracking-wider block">
                  ROTACIÓN BIOLÓGICA (ACCIÓN A13)
                </span>
                <span className="text-[9.5px] bg-[#7BB63E]/20 text-[#A3E635] px-2 py-0.5 rounded-full border border-[#7BB63E]/40 font-mono">
                  Confianza {calculatedData.rotacionA13.confianza}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#7BB63E] text-[#132A1C] flex items-center justify-center font-bold text-lg shrink-0">
                  🌾
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Sugerido: {calculatedData.rotacionA13.cultivo_sugerido || 'Quinua'}
                  </h4>
                  {calculatedData.rotacionA13.alternativa && (
                    <p className="text-[11px] text-emerald-300 font-medium">
                      Alternativa: {calculatedData.rotacionA13.alternativa}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-zinc-200 leading-snug">
                {calculatedData.rotacionA13.motivo}
              </p>
            </div>

            {/* Bottom Actions: Save & Apply */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleFinishAndSave}
                className="w-full py-3.5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-lime-600/30 transition cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>Aplicar Calibración y Ver Chacra</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setPhase('questions');
                }}
                className="w-full py-2.5 rounded-full border border-white/20 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Modificar respuestas del árbol</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
