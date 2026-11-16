'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Sprout,
  Calendar,
  CloudRain,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Sparkles,
  Users,
  Clock,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  ActiveParcel,
  CuestionarioAgricultor,
  PrediccionZonaV2,
  EstadoClimaticoV3,
  DatosVisorParcela,
  ejecutarAsistenteAgroambiental,
  CoberturaSuelo,
  DisponibilidadAgua,
  EstadoObras,
  ProfundidadSuelo,
  ClaseTextura,
  OrigenTextura,
  DisponibilidadPersonas,
  TiempoSemanal,
  ResultadoAsistenteAgroambiental,
} from '@/lib/agroenvironmentalEngine';
import { ClimaNasa } from '@/lib/types';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import KipuFullScreenWizard from '@/components/KipuFullScreenWizard';

interface AgroenvironmentalAssistantProps {
  activeParcel: ActiveParcel;
  climaNasa?: ClimaNasa | null;
  onShowToast: (msg: string) => void;
}

export default function AgroenvironmentalAssistant({
  activeParcel,
  climaNasa,
  onShowToast,
}: AgroenvironmentalAssistantProps) {
  // Wizard Modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Cuestionario inicial con valores por defecto basados en Piuray-Qorimarca
  const [cobertura, setCobertura] = useState<CoberturaSuelo>('rastrojo');
  const [cultivoActual, setCultivoActual] = useState<string>('papa');
  const [siembraEstimada, setSiembraEstimada] = useState<string>('En 3 semanas');
  const [cultivoProximo, setCultivoProximo] = useState<string>('quinua');

  const [agua, setAgua] = useState<DisponibilidadAgua>('secano');
  const [obras, setObras] = useState<EstadoObras>('mal_estado');
  const [profundidad, setProfundidad] = useState<ProfundidadSuelo>('algo_piedras');
  const [texturaClase, setTexturaClase] = useState<ClaseTextura>('franca');
  const [texturaOrigen, setTexturaOrigen] = useState<OrigenTextura>('declarado');

  const [cultivoAnterior, setCultivoAnterior] = useState<string>('papa');
  const [cultivoAntepenultimo, setCultivoAntepenultimo] = useState<string>('quinua');

  const [personas, setPersonas] = useState<DisponibilidadPersonas>('dos_o_tres');
  const [tiempoSemanal, setTiempoSemanal] = useState<TiempoSemanal>('algo');

  // Estado de secciones desplegables
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Predicción institucional V2 (SENAMHI / ENFEN)
  const [prediccionV2, setPrediccionV2] = useState<PrediccionZonaV2>({
    escenario: 'deficit_lluvias',
    T0: '2026-12-15',
    fuente_institucional: 'SENAMHI / ENFEN Alerta ENOS',
    confianza: 'alta',
  });

  // Estado climático local observado V3 (NASA POWER + SMAP + Open-Meteo)
  const estadoClimaticoV3: EstadoClimaticoV3 = useMemo(
    () => ({
      precipitacion_reciente_mm: activeParcel.precipitationTodayMm !== undefined
        ? activeParcel.precipitationTodayMm
        : climaNasa?.precipitacion_mm ?? 0.0,
      humedad_suelo_pct: Math.round(
        activeParcel.smapMoisturePct ||
        (climaNasa?.humedad_suelo_smap_m3m3 ? climaNasa.humedad_suelo_smap_m3m3 * 100 : 35)
      ),
      temp_min_c: climaNasa?.temp_min_c ?? (activeParcel.soilTempC !== undefined ? Math.round(activeParcel.soilTempC) : 4.0),
      alerta_helada: climaNasa?.alerta_helada ?? ((activeParcel.soilTempC !== undefined && activeParcel.soilTempC <= 2) || false),
      fuente: 'NASA SMAP L4 + Open-Meteo & Supabase Clima Diario',
    }),
    [activeParcel.smapMoisturePct, activeParcel.precipitationTodayMm, activeParcel.soilTempC, climaNasa]
  );

  // Datos espaciales de la parcela activa desde el Visor (Fuente 1)
  const datosVisor: DatosVisorParcela = useMemo(
    () => ({
      parcel_id: activeParcel.id,
      nombre: activeParcel.name,
      coordenadas: activeParcel.center,
      areaHa: activeParcel.areaHa,
      pendientePct: activeParcel.slopePct,
      altitudMsnm: activeParcel.elevationMsnm,
      smapMoisturePct: activeParcel.smapMoisturePct,
      ndvi: activeParcel.ndvi,
      microcuenca: 'Piuray - Qorimarca (Chinchero)',
    }),
    [activeParcel]
  );

  // Ejecución dinámica reactiva del Asistente
  const resultado: ResultadoAsistenteAgroambiental = useMemo(() => {
    const cuestionario: CuestionarioAgricultor = {
      esenciales: {
        cobertura,
        cultivo_actual: cobertura === 'cultivo' ? cultivoActual : null,
        siembra: cobertura !== 'cultivo' ? siembraEstimada : null,
        cultivo_proximo: cultivoProximo,
      },
      complementarias: {
        agua,
        obras,
        profundidad,
        bloquea_obras_profundas: profundidad === 'muy_pedregoso',
        textura: {
          clase: texturaClase,
          origen: texturaOrigen,
        },
        historial: {
          vez_anterior: cultivoAnterior,
          antes_de_esa: cultivoAntepenultimo,
        },
      },
      adicionales: {
        personas,
        tiempo_semanal: tiempoSemanal,
      },
    };

    return ejecutarAsistenteAgroambiental(cuestionario, prediccionV2, estadoClimaticoV3, datosVisor);
  }, [
    cobertura,
    cultivoActual,
    siembraEstimada,
    cultivoProximo,
    agua,
    obras,
    profundidad,
    texturaClase,
    texturaOrigen,
    cultivoAnterior,
    cultivoAntepenultimo,
    personas,
    tiempoSemanal,
    prediccionV2,
    estadoClimaticoV3,
    datosVisor,
  ]);

  // Manejo de síntesis de voz (English / Quechua)
  const handleToggleVoice = () => {
    playBubblePop();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onShowToast('Your browser does not support audio speech synthesis.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textoVoz = `Allillanchu farmer. ${resultado.estadoChacra}. ${resultado.estadoClima}. For biological rotation we recommend ${resultado.recomendacionA13.cultivo_sugerido || 'Quinoa'}. ${resultado.recomendacionA13.motivo}. ${resultado.condicionalFinal}`;

    const utter = new SpeechSynthesisUtterance(textoVoz);
    utter.lang = 'en-US';
    utter.rate = 0.95;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
    onShowToast('🔊 Playing Kipu diagnostic audio...');
  };

  const handleShare = () => {
    playBubblePop();
    if (navigator.share) {
      navigator.share({
        title: 'TerraQuipu Preventative Agroclimatic Calendar',
        text: `${resultado.estadoChacra}. Action A13 crop rotation: ${resultado.recomendacionA13.cultivo_sugerido}.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `TerraQuipu: ${resultado.estadoChacra}\n${resultado.estadoClima}\nSuggested crop: ${resultado.recomendacionA13.cultivo_sugerido}\n${resultado.condicionalFinal}`
      );
      onShowToast('✓ Diagnostic report copied to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* Modal Duolingo Interactivo para El Niño                  */}
      {/* ======================================================== */}
      {isWizardOpen && (
        <KipuFullScreenWizard
          mode="elnino"
          microcuencas={[]}
          cultivos={[]}
          initialProfile={{
            parcelName: activeParcel.name,
            areaHa: activeParcel.areaHa,
            distrito: 'Chinchero',
            altitude: activeParcel.elevationMsnm,
          }}
          activeParcel={activeParcel}
          onComplete={(profile, customAgroResult) => {
            setIsWizardOpen(false);
            if (profile.cropCoverNdvi) {
              setCobertura(
                profile.cropCoverNdvi === 'sembrado'
                  ? 'cultivo'
                  : profile.cropCoverNdvi === 'pasto'
                  ? 'pasto'
                  : profile.cropCoverNdvi === 'suelo_desnudo'
                  ? 'suelo_desnudo'
                  : 'rastrojo'
              );
            }
            if (profile.waterSource) {
              setAgua(
                profile.waterSource === 'secano'
                  ? 'secano'
                  : profile.waterSource === 'permanente'
                  ? 'riego_permanente'
                  : 'riego_auxilio'
              );
            }
            if (profile.soilStoniness) {
              setProfundidad(
                profile.soilStoniness === 'pedregoso' ? 'muy_pedregoso' : 'profundo'
              );
            }
            onShowToast('✓ Questionnaire completed and preventative schedule generated');
          }}
          onCancel={() => setIsWizardOpen(false)}
        />
      )}

      {/* Encabezado y Contexto Espacial de la Chacra */}
      <div className="p-4 rounded-3xl bg-zinc-900 text-white space-y-3 shadow-md border border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 text-lg">
              🌾
            </span>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>TerraQuipu Agroenvironmental Assistant</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  ENSO / El Niño
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                {datosVisor.microcuenca} • Parcel: {datosVisor.nombre} ({datosVisor.areaHa} ha)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-2xl border transition cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500 text-zinc-950 border-amber-400 animate-pulse'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
            title="Listen in English / Audio"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetría Integrada (Fuente 1 + Fuente 3) */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] pt-1 border-t border-zinc-800">
          <div className="bg-zinc-800/80 p-2 rounded-xl">
            <span className="text-zinc-400 block">Slope</span>
            <span className="text-white font-mono font-bold">{datosVisor.pendientePct}%</span>
          </div>
          <div className="bg-zinc-800/80 p-2 rounded-xl">
            <span className="text-zinc-400 block">Elevation</span>
            <span className="text-white font-mono font-bold">{datosVisor.altitudMsnm}m</span>
          </div>
          <div className="bg-zinc-800/80 p-2 rounded-xl">
            <span className="text-zinc-400 block">NASA SMAP</span>
            <span className="text-sky-300 font-mono font-bold">{estadoClimaticoV3.humedad_suelo_pct}%</span>
          </div>
          <div className="bg-zinc-800/80 p-2 rounded-xl">
            <span className="text-zinc-400 block">NDVI Veg.</span>
            <span className="text-emerald-400 font-mono font-bold">{datosVisor.ndvi}</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTÓN HERO DUOLINGO: Cuestionario Interactivo            */}
      {/* ======================================================== */}
      <button
        type="button"
        onClick={() => {
          playBubblePop();
          setIsWizardOpen(true);
        }}
        className="w-full p-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 border-2 border-emerald-500 border-b-4 border-b-emerald-950 text-white flex items-center justify-between shadow-md active:border-b-2 active:translate-y-0.5 transition cursor-pointer group"
      >
        <div className="flex items-center gap-3.5 text-left">
          <span className="p-2.5 rounded-2xl bg-white/20 text-2xl backdrop-blur-xs flex-shrink-0 shadow-xs">
            🌾
          </span>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <span>In-Situ Parcel Questionnaire with Kipu</span>
              <span className="text-[10px] bg-emerald-300/30 text-emerald-100 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300/40">
                Interactive Stepper
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5 leading-snug">
              Canopy cover, water source, soil conservation works, A13 crop history, and labor availability
            </p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition">
          <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>

      {/* ===================================================================== */}
      {/* FORMATO OBLIGATORIO DE RESPUESTA DEL ASISTENTE                        */}
      {/* ===================================================================== */}

      {/* LÍNEA 1: Estado de la Chacra */}
      <div className="p-3.5 rounded-2xl bg-zinc-900 text-white shadow-xs space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
          Field Parcel Status
        </span>
        <p className="text-xs font-medium leading-relaxed font-sans text-zinc-200">
          <strong
            className={`font-black ${
              resultado.nivelVulnerabilidad === 'Alta'
                ? 'text-red-400'
                : resultado.nivelVulnerabilidad === 'Media'
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            Vulnerability Level: {resultado.nivelVulnerabilidad}.
          </strong>{' '}
          {resultado.motivoVulnerabilidad}
        </p>
      </div>

      {/* LÍNEA 2: Estado del Clima */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
            Climate Regime Status
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
            {resultado.coincidenciaClima}
          </span>
        </div>
        <p className="text-xs font-medium text-amber-950 leading-relaxed font-sans">
          {resultado.estadoClima.replace('Estado del clima: ', '')}
        </p>
      </div>

      {/* RECOMENDACIÓN A13 ROTACIÓN DE CULTIVOS */}
      {resultado.recomendacionA13.cultivo_sugerido && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-600/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {resultado.recomendacionA13.cultivo_sugerido === 'Papa'
                  ? '🥔'
                  : resultado.recomendacionA13.cultivo_sugerido === 'Quinua'
                  ? '🌾'
                  : resultado.recomendacionA13.cultivo_sugerido === 'Olluco'
                  ? '🫘'
                  : '🍠'}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
                  Action A13: Biological Crop Rotation
                </span>
                <span className="text-sm font-black text-emerald-950">
                  Plant {resultado.recomendacionA13.cultivo_sugerido}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
              Confidence: {resultado.recomendacionA13.confianza}
            </span>
          </div>

          <p className="text-xs text-emerald-950 font-medium leading-relaxed">
            {resultado.recomendacionA13.motivo}
          </p>

          {resultado.recomendacionA13.diferenciaConIntencion && (
            <div className="pt-1 text-[11px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
              <span className="font-bold">Discrepancy Note: </span>
              {resultado.recomendacionA13.diferenciaConIntencion}
            </div>
          )}
        </div>
      )}

      {/* CALENDARIO PREVENTIVO EN 4 BLOQUES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-black text-zinc-950 uppercase tracking-wide">
              Preventative Schedule (4 Seasonal Blocks)
            </h3>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {resultado.calendario.length} scheduled actions
          </span>
        </div>

        <div className="space-y-2.5">
          {resultado.calendario.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1.5 hover:border-emerald-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
                  {item.bloque}
                </span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold">
                  {item.fechaTexto}
                </span>
              </div>

              <div className="flex items-start gap-2 pt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-zinc-900 leading-snug">
                    {item.accionNombre}
                  </h4>
                  <p className="text-[11px] text-zinc-600 leading-relaxed mt-0.5">
                    {item.motivo}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100">
                <span>Source: {item.fuente}</span>
                <span className="font-mono text-zinc-500 font-bold">Code: {item.accionCodigo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LÍNEA 5: Condicional de Cierre */}
      <div className="p-3.5 rounded-2xl bg-zinc-100 border border-zinc-300 text-zinc-800 text-xs shadow-2xs flex items-start gap-2.5">
        <Info className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-black text-zinc-900 mb-0.5">Validity Condition:</strong>
          <p className="text-zinc-700 leading-relaxed font-sans">{resultado.condicionalFinal}</p>
        </div>
      </div>

      {/* Acciones de Exportar y Compartir */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleShare}
          className="py-3 px-3 rounded-2xl bg-white border border-zinc-300 text-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-50 active:scale-98 transition cursor-pointer shadow-2xs"
        >
          <Share2 className="w-3.5 h-3.5 text-zinc-600" />
          <span>Share Card</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playBubblePop();
            window.print();
          }}
          className="py-3 px-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5 text-emerald-200" />
          <span>Export PDF Report</span>
        </button>
      </div>

      {/* Acordeón Opcional: Ajustes Manuales Rápidos */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowAdvancedSettings(!showAdvancedSettings);
          }}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs">⚙️</span>
            <div>
              <span className="font-bold text-xs text-zinc-900 block">
                {showAdvancedSettings ? 'Hide Calibrated Direct Parameters' : 'View Calibrated Direct Parameters'}
              </span>
              <span className="text-[10px] text-zinc-500">
                Manually tune ground cover, water access, or conservation works
              </span>
            </div>
          </div>
          {showAdvancedSettings ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {showAdvancedSettings && (
          <div className="p-4 border-t border-zinc-100 space-y-3 bg-zinc-50/50 text-xs animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-zinc-700 block mb-1">Ground Cover:</label>
                <select
                  value={cobertura}
                  onChange={(e) => setCobertura(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                >
                  <option value="cultivo">Growing Crop</option>
                  <option value="rastrojo">Protective Stubble Mulch</option>
                  <option value="pasto">Natural Grassland</option>
                  <option value="suelo_desnudo">Bare Soil</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-700 block mb-1">Water Access:</label>
                <select
                  value={agua}
                  onChange={(e) => setAgua(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                >
                  <option value="secano">Rainfed Only (Secano)</option>
                  <option value="riego_auxilio">Supplementary Irrigation</option>
                  <option value="riego_permanente">Permanent Irrigation</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-700 block mb-1">Conservation Works:</label>
                <select
                  value={obras}
                  onChange={(e) => setObras(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                >
                  <option value="buen_estado">Good Condition</option>
                  <option value="mal_estado">Degraded / Needs Maintenance</option>
                  <option value="ninguna">No Conservation Works</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-700 block mb-1">Labor Availability:</label>
                <select
                  value={personas}
                  onChange={(e) => setPersonas(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                >
                  <option value="solo_yo">Solo farmer (1 person)</option>
                  <option value="dos_o_tres">2 or 3 persons</option>
                  <option value="cuatro_o_mas">4 or more persons</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
