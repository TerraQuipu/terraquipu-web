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
  HelpCircle,
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
} from '@/lib/agroenvironmentalEngine';

interface AgroenvironmentalAssistantProps {
  activeParcel: ActiveParcel;
  onShowToast: (msg: string) => void;
}

export default function AgroenvironmentalAssistant({
  activeParcel,
  onShowToast,
}: AgroenvironmentalAssistantProps) {
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
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Predicción institucional V2 (SENAMHI / ENFEN)
  const [prediccionV2, setPrediccionV2] = useState<PrediccionZonaV2>({
    escenario: 'deficit_lluvias',
    T0: '2026-12-15',
    fuente_institucional: 'SENAMHI / ENFEN Alerta ENOS',
    confianza: 'alta',
  });

  // Estado climático local observado V3 (NASA POWER + SMAP)
  const estadoClimaticoV3: EstadoClimaticoV3 = useMemo(
    () => ({
      precipitacion_reciente_mm: 1.8,
      humedad_suelo_pct: Math.round(activeParcel.smapMoisturePct || 14),
      temp_min_c: 3.2,
      alerta_helada: false,
      fuente: 'NASA SMAP L4 + SENAMHI Cusco',
    }),
    [activeParcel.smapMoisturePct]
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
  const resultado = useMemo(() => {
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

  const handleSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      setIsSpeaking(true);

      const textoLectura = `${resultado.estadoChacra}. ${resultado.estadoClima}. Para la rotación, el algoritmo recomienda sembrar ${resultado.recomendacionA13.cultivo_sugerido}. ${resultado.condicionalFinal}`;
      const utterance = new SpeechSynthesisUtterance(textoLectura);
      utterance.lang = 'es-PE';
      utterance.rate = 0.92;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      onShowToast('Síntesis de voz no disponible en este navegador');
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Banner Principal del Asistente Agroambiental */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-4 rounded-2xl shadow-sm space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                🌱
              </span>
              <h3 className="font-black text-sm tracking-tight text-white">
                Asistente Agroambiental TerraQuipu
              </h3>
            </div>
            <p className="text-[11px] text-zinc-300 mt-1 leading-snug">
              Microcuenca Piuray-Qorimarca (Cusco) • Calendario preventivo y reducción de vulnerabilidad frente a El Niño.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSpeech}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              isSpeaking
                ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="Escuchar recomendación en voz alta"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isSpeaking ? 'Pausar' : 'Escuchar'}</span>
          </button>
        </div>

        {/* 3 Fuentes Integradas Chips */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-mono">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-zinc-400 block text-[9px]">1. Visor Espacial</span>
            <span className="font-bold text-emerald-300 truncate block">
              {activeParcel.id} ({activeParcel.areaHa.toFixed(1)} ha, {activeParcel.slopePct}%)
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-zinc-400 block text-[9px]">2. Cuestionario</span>
            <span className="font-bold text-sky-300 truncate block">
              {cobertura} • {agua}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-center">
            <span className="text-zinc-400 block text-[9px]">3. NASA / SENAMHI</span>
            <span className="font-bold text-amber-300 truncate block">
              SMAP {activeParcel.smapMoisturePct?.toFixed(0)}% • T0 {prediccionV2.T0}
            </span>
          </div>
        </div>
      </div>

      {/* Botón para Desplegar / Editar el Cuestionario del Agricultor */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowQuestionnaire(!showQuestionnaire)}
          className="w-full p-3.5 flex items-center justify-between text-left hover:bg-zinc-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
              ?
            </span>
            <div>
              <span className="font-bold text-xs text-zinc-900 block">
                Cuestionario de la Chacra (Parámetros Directos)
              </span>
              <span className="text-[11px] text-zinc-500">
                La voz del agricultor tiene prioridad absoluta sobre las lecturas satelitales
              </span>
            </div>
          </div>
          {showQuestionnaire ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {showQuestionnaire && (
          <div className="p-4 border-t border-zinc-100 space-y-4 bg-zinc-50/50 text-xs animate-in fade-in duration-150">
            {/* A. Parámetros Esenciales */}
            <div className="space-y-2">
              <span className="font-extrabold text-xs text-zinc-950 uppercase tracking-wider block">
                A. Parámetros Esenciales
              </span>

              <div>
                <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                  Cobertura actual del suelo:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['cultivo', 'rastrojo', 'pasto', 'suelo_desnudo'] as CoberturaSuelo[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCobertura(c)}
                      className={`p-2 rounded-xl border text-center font-bold text-xs transition capitalize cursor-pointer ${
                        cobertura === c
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                          : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300'
                      }`}
                    >
                      {c === 'suelo_desnudo' ? '⚠️ Suelo Desnudo' : c}
                    </button>
                  ))}
                </div>
              </div>

              {cobertura === 'cultivo' ? (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                    Cultivo que actualmente está creciendo:
                  </label>
                  <select
                    value={cultivoActual}
                    onChange={(e) => setCultivoActual(e.target.value)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="papa">Papa Nativa</option>
                    <option value="maiz">Maíz Blanco Urubamba</option>
                    <option value="haba">Haba Verde</option>
                    <option value="tarwi">Tarwi / Chocho</option>
                    <option value="quinua">Quinua Real</option>
                    <option value="cebada">Cebada / Avena</option>
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                      Ventana estimada de siembra:
                    </label>
                    <input
                      type="text"
                      value={siembraEstimada}
                      onChange={(e) => setSiembraEstimada(e.target.value)}
                      placeholder="Ej. En 3 semanas"
                      className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                      Próximo cultivo deseado (intención):
                    </label>
                    <select
                      value={cultivoProximo}
                      onChange={(e) => setCultivoProximo(e.target.value)}
                      className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                    >
                      <option value="quinua">Quinua</option>
                      <option value="papa">Papa</option>
                      <option value="olluco">Olluco</option>
                      <option value="oca">Oca</option>
                      <option value="haba">Haba</option>
                      <option value="tarwi">Tarwi</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* B. Parámetros Complementarios */}
            <div className="space-y-2 pt-2 border-t border-zinc-200">
              <span className="font-extrabold text-xs text-zinc-950 uppercase tracking-wider block">
                B. Parámetros Complementarios
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Agua:</label>
                  <select
                    value={agua}
                    onChange={(e) => setAgua(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="secano">Secano (Solo lluvias)</option>
                    <option value="riego_auxilio">Riego de auxilio</option>
                    <option value="riego_permanente">Riego permanente</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Obras de conservación:</label>
                  <select
                    value={obras}
                    onChange={(e) => setObras(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="buen_estado">Buen estado</option>
                    <option value="mal_estado">Mal estado (requiere reparo)</option>
                    <option value="ninguna">Ninguna obra</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Profundidad y piedras:</label>
                  <select
                    value={profundidad}
                    onChange={(e) => setProfundidad(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="profundo">Profundo y suelto</option>
                    <option value="algo_piedras">Algo de piedras</option>
                    <option value="muy_pedregoso">Muy pedregoso (bloquea zanjas)</option>
                  </select>
                </div>
              </div>

              {/* Textura y Origen */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Textura del suelo:</label>
                  <select
                    value={texturaClase}
                    onChange={(e) => setTexturaClase(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="arenosa">Arenosa (suelta)</option>
                    <option value="franca">Franca (equilibrada)</option>
                    <option value="arcillosa">Arcillosa (pesada)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Origen de la textura:</label>
                  <select
                    value={texturaOrigen}
                    onChange={(e) => setTexturaOrigen(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="declarado">Declarado por el agricultor</option>
                    <option value="prueba_del_punado">Estimado por prueba del puñado</option>
                  </select>
                </div>
              </div>

              {/* Historial agrícola */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                    Campaña anterior (vez anterior):
                  </label>
                  <select
                    value={cultivoAnterior}
                    onChange={(e) => setCultivoAnterior(e.target.value)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="papa">Papa</option>
                    <option value="quinua">Quinua</option>
                    <option value="olluco">Olluco</option>
                    <option value="oca">Oca</option>
                    <option value="haba">Haba</option>
                    <option value="tarwi">Tarwi</option>
                    <option value="descanso">Descanso / Barbecho</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">
                    Campaña previa a esa (hace 2 campañas):
                  </label>
                  <select
                    value={cultivoAntepenultimo}
                    onChange={(e) => setCultivoAntepenultimo(e.target.value)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="quinua">Quinua</option>
                    <option value="papa">Papa</option>
                    <option value="olluco">Olluco</option>
                    <option value="oca">Oca</option>
                    <option value="haba">Haba</option>
                    <option value="tarwi">Tarwi</option>
                    <option value="descanso">Descanso / Barbecho</option>
                  </select>
                </div>
              </div>
            </div>

            {/* C. Factores Adicionales */}
            <div className="space-y-2 pt-2 border-t border-zinc-200">
              <span className="font-extrabold text-xs text-zinc-950 uppercase tracking-wider block">
                C. Disponibilidad de Trabajo (Ajusta volumen y esfuerzo)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Personas disponibles:</label>
                  <select
                    value={personas}
                    onChange={(e) => setPersonas(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="solo_yo">Solo yo (1 persona)</option>
                    <option value="dos_o_tres">2 o 3 personas</option>
                    <option value="cuatro_o_mas">4 o más personas</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-zinc-700 block mb-1">Tiempo semanal:</label>
                  <select
                    value={tiempoSemanal}
                    onChange={(e) => setTiempoSemanal(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-zinc-300 bg-white text-xs font-semibold"
                  >
                    <option value="poco">Poco tiempo</option>
                    <option value="algo">Tiempo moderado</option>
                    <option value="bastante">Bastante tiempo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* FORMATO OBLIGATORIO DE RESPUESTA DEL ASISTENTE                        */}
      {/* ===================================================================== */}

      {/* LÍNEA 1: Estado de la Chacra */}
      <div className="p-3.5 rounded-2xl bg-zinc-900 text-white shadow-xs space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
          Estado de la Chacra
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
            Vulnerabilidad {resultado.nivelVulnerabilidad}.
          </strong>{' '}
          {resultado.motivoVulnerabilidad}
        </p>
      </div>

      {/* LÍNEA 2: Estado del Clima */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
            Estado del Clima
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
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                  Acción A13 • Rotación Óptima
                </span>
                <h4 className="font-black text-sm text-emerald-950">
                  Cultivo Sugerido: {resultado.recomendacionA13.cultivo_sugerido}
                </h4>
              </div>
            </div>

            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                resultado.recomendacionA13.confianza === 'alta'
                  ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                  : resultado.recomendacionA13.confianza === 'media'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-zinc-200 text-zinc-800 border-zinc-300'
              }`}
            >
              Confianza {resultado.recomendacionA13.confianza}
            </span>
          </div>

          <p className="text-xs text-zinc-800 leading-relaxed font-sans">
            {resultado.recomendacionA13.motivo}
          </p>

          {resultado.recomendacionA13.diferenciaConIntencion && (
            <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-[11px] text-zinc-700">
              <Info className="w-3.5 h-3.5 text-emerald-700 inline-block mr-1 align-text-bottom" />
              <span>{resultado.recomendacionA13.diferenciaConIntencion}</span>
            </div>
          )}
        </div>
      )}

      {/* TABLA DEL CALENDARIO PREVENTIVO EN 4 BLOQUES */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden space-y-2 p-3">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <h4 className="font-black text-xs text-zinc-950">
              Calendario Preventivo de Actividades (4 Bloques)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            T0: {prediccionV2.T0}
          </span>
        </div>

        {/* Tabla Responsiva Estandarizada */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-50">
                <th className="py-2 px-2.5">Fecha o bloque</th>
                <th className="py-2 px-2.5">Acción</th>
                <th className="py-2 px-2.5">Motivo</th>
                <th className="py-2 px-2 text-center">Confianza</th>
                <th className="py-2 px-2.5">Fuente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {resultado.calendario.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/70 transition">
                  <td className="py-2.5 px-2.5 align-top whitespace-nowrap">
                    <span className="font-extrabold text-zinc-900 block text-[11px]">
                      {item.bloque}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {item.fechaTexto}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 align-top">
                    <span className="font-black text-emerald-900 block text-xs">
                      {item.accionCodigo}. {item.accionNombre}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 align-top text-zinc-700 leading-snug text-[11px] max-w-xs">
                    {item.motivo}
                  </td>
                  <td className="py-2.5 px-2 align-top text-center whitespace-nowrap">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                        item.confianza === 'alta'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : item.confianza === 'media'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                      }`}
                    >
                      {item.confianza}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 align-top text-zinc-500 text-[10px] font-mono whitespace-nowrap">
                    {item.fuente}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LÍNEA FINAL OBLIGATORIA */}
      <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300/80 text-emerald-950 text-xs italic font-sans leading-relaxed shadow-xs flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <span>{resultado.condicionalFinal}</span>
      </div>
    </div>
  );
}
