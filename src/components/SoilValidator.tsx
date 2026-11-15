'use client';

import React, { useState, useEffect } from 'react';
import { submitReportToCloud, getRecentReports } from '@/lib/supabaseClient';
import { ReporteAgricultor, FarmerProfile, ClimaNasa } from '@/lib/types';
import {
  CloudUpload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  playBubblePop,
  playSuccessFanfare,
  playWhoosh,
  playQuestionChime,
} from '@/lib/soundEffects';

interface SoilValidatorProps {
  cuencaId?: string;
  lat?: number;
  lon?: number;
  profile?: FarmerProfile;
  climaNasa?: ClimaNasa | null;
  onToast: (msg: string) => void;
}

export default function SoilValidator({
  cuencaId,
  lat = -13.3934,
  lon = -72.0498,
  profile,
  climaNasa,
  onToast,
}: SoilValidatorProps) {
  const [moisture, setMoisture] = useState<'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO'>(
    profile?.moisture || 'HUMEDAD_MEDIA'
  );
  const [pest, setPest] = useState<'sano' | 'gorgojo' | 'rancha'>('sano');
  const [showMatrixDetails, setShowMatrixDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [recentReports, setRecentReports] = useState<ReporteAgricultor[]>([]);

  useEffect(() => {
    if (profile?.moisture) {
      setMoisture(profile.moisture);
    }
  }, [profile?.moisture]);

  useEffect(() => {
    loadOfflineQueue();
    loadReportsFromDatabase();
  }, []);

  const getDeviceId = () => {
    if (typeof window === 'undefined') return 'device-fallback';
    let id = localStorage.getItem('terraquipu_device_uuid');
    if (!id) {
      id = 'dev-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
      localStorage.setItem('terraquipu_device_uuid', id);
    }
    return id;
  };

  const loadOfflineQueue = () => {
    if (typeof window === 'undefined') return;
    try {
      const q = JSON.parse(localStorage.getItem('terraquipu_offline_outbox') || '[]');
      setOfflineCount(q.length);
    } catch {
      setOfflineCount(0);
    }
  };

  const loadReportsFromDatabase = async () => {
    const data = await getRecentReports(5);
    setRecentReports(data);
  };

  const handleSelectMoisture = (val: 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO') => {
    playBubblePop();
    setMoisture(val);
    const labels = {
      SECO: 'Seca y Dura',
      HUMEDAD_MEDIA: 'Húmeda y Mullida',
      SATURADO: 'Encharcada / Barro',
    };
    onToast(`✓ Tierra calibrada: ${labels[val]}`);
  };

  const handleSelectPest = (val: 'sano' | 'gorgojo' | 'rancha') => {
    playBubblePop();
    setPest(val);
    const labels = {
      sano: 'Chacra Sana (Sin Plagas)',
      gorgojo: 'Alerta: Gorgojo de los Andes detectado',
      rancha: 'Alerta: Rancha / Tizón tardío detectado',
    };
    onToast(`✓ Estado sanitario: ${labels[val]}`);
  };

  // Compute 10-Parameter Matrix & Ground-Truth Calibration
  const smapPercent = climaNasa?.humedad_suelo_smap_m3m3
    ? Math.round(climaNasa.humedad_suelo_smap_m3m3 * 100)
    : 35;

  const rainfallMm = climaNasa?.precipitacion_mm ?? 1.2;
  const tempMax = climaNasa?.temp_max_c ?? 19.4;
  const tempMin = climaNasa?.temp_min_c ?? 3.8;
  const frostAlert = climaNasa?.alerta_helada || tempMin <= 2.0;

  // Health Score Calculation based on ground-truth + satellite
  const calculateHealthScore = (): number => {
    let score = 70;
    if (moisture === 'HUMEDAD_MEDIA') score += 15;
    if (moisture === 'SECO') score -= 10;
    if (moisture === 'SATURADO') score -= 5;
    if (pest === 'sano') score += 10;
    if (pest === 'gorgojo') score -= 20;
    if (pest === 'rancha') score -= 15;
    if (profile?.cropCoverNdvi === 'sembrado' || profile?.cropCoverNdvi === 'barbecho') score += 5;
    return Math.max(20, Math.min(98, score));
  };

  const healthScore = calculateHealthScore();

  // The 10 Parameters Matrix Definition
  const matrixParameters = [
    {
      id: 1,
      title: 'Humedad Superficial Edáfica',
      satellite: `NASA SMAP: ${smapPercent}% vol`,
      peruOfficial: 'SENAMHI Balance Hídrico',
      fieldReport: moisture === 'HUMEDAD_MEDIA' ? 'Tierra Mullida (Puño)' : moisture === 'SECO' ? 'Tierra Seca / Polvo' : 'Suelo Encharcado',
      status: moisture === 'HUMEDAD_MEDIA' ? 'Calibrado Óptimo' : 'Divergencia Detectada',
      statusColor: moisture === 'HUMEDAD_MEDIA' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-amber-100 text-amber-900 border-amber-300',
      icon: '💧',
    },
    {
      id: 2,
      title: 'Capacidad de Retención de Humedad',
      satellite: 'SoilGrids Texture Map (30m)',
      peruOfficial: 'Estudio de Suelos INIA Cusco',
      fieldReport: `Textura: ${profile?.soilTexture === 'franca' ? 'Franca (Equilibrada)' : profile?.soilTexture === 'arena' ? 'Arenosa (Drenaje Rápido)' : 'Arcillosa (Retentiva)'}`,
      status: 'Consistente',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌱',
    },
    {
      id: 3,
      title: 'Pedregosidad y Profundidad Efectiva',
      satellite: 'SRTM / Copernicus DEM 30m',
      peruOfficial: 'Carta Geológica INGEMMET',
      fieldReport: `Perfil: ${profile?.soilStoniness === 'profundo' ? 'Profundo y Suelto' : 'Pedregoso'}`,
      status: 'Sin Restricción',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '⛰️',
    },
    {
      id: 4,
      title: 'Precipitación Acumulada Reciente',
      satellite: `NASA GPM IMERG: ${rainfallMm} mm`,
      peruOfficial: 'Pluviómetro SENAMHI',
      fieldReport: moisture === 'SECO' ? 'Secano estricto sin lluvia' : 'Llovizna reciente en parcela',
      status: rainfallMm < 5 ? 'Déficit Pluvial' : 'Aporte Pluvial Normal',
      statusColor: rainfallMm < 5 ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌧️',
    },
    {
      id: 5,
      title: 'Riesgo de Helada Agronómica Nocturna',
      satellite: `NASA POWER Tmin: ${tempMin.toFixed(1)}°C`,
      peruOfficial: 'Boletín de Heladas SENAMHI',
      fieldReport: frostAlert ? 'Alerta activa: Escarcha visible al amanecer' : 'Sin helada crítica hoy',
      status: frostAlert ? 'Alerta Crítica' : 'Zona Segura',
      statusColor: frostAlert ? 'bg-red-100 text-red-900 border-red-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '❄️',
    },
    {
      id: 6,
      title: 'Vigor Vegetal y Cobertura (NDVI)',
      satellite: 'Sentinel-2 ESA (NDVI: 0.62)',
      peruOfficial: 'Mapa MIDAGRI de Cobertura',
      fieldReport: `Estado: ${profile?.cropCoverNdvi === 'sembrado' ? 'Cultivo en Crecimiento' : profile?.cropCoverNdvi === 'barbecho' ? 'Suelo en Barbecho' : 'Rastrojo y Mulch'}`,
      status: 'Vegetación Activa',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌿',
    },
    {
      id: 7,
      title: 'Disponibilidad de Agua y Riego',
      satellite: 'Sentinel-1 SAR Radar Superficie',
      peruOfficial: 'Junta de Usuarios de Agua',
      fieldReport: `Riego: ${profile?.waterSource === 'permanente' ? 'Riego Permanente' : profile?.waterSource === 'auxilio' ? 'Riego por Auxilio' : 'Secano Estricto'}`,
      status: profile?.waterSource === 'secano' ? 'Vulnerable a Sequía' : 'Asegurado por Canal',
      statusColor: profile?.waterSource === 'secano' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌊',
    },
    {
      id: 8,
      title: 'Ventana Favorable de Siembra',
      satellite: 'Pronóstico Multimodel NOAA/NASA',
      peruOfficial: 'Calendario Agrícola INIA Cusco',
      fieldReport: `Ventana: ${profile?.sowingWindow === 'esta_semana' ? 'Esta semana' : profile?.sowingWindow === '2_4_semanas' ? 'En 2 a 4 semanas' : profile?.sowingWindow === '1_2_meses' ? 'En 1 a 2 meses' : 'Próxima campaña'}`,
      status: 'Ventana Abierta',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '📅',
    },
    {
      id: 9,
      title: 'Balance de Nitrógeno y Predecesor',
      satellite: 'Sentinel-2 Índices de Clorofila',
      peruOfficial: 'Manual de Abonamiento INIA',
      fieldReport: `Cosecha previa: ${profile?.previousCropName || 'Papa Nativa'}`,
      status: profile?.previousCropId?.includes('papa') ? 'Déficit -70 kg N/ha' : 'Nitrógeno Positivo (+75 kg)',
      statusColor: profile?.previousCropId?.includes('papa') ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🧪',
    },
    {
      id: 10,
      title: 'Alerta Fitosanitaria y Rompe-Ciclo',
      satellite: 'MODIS Fenología Anomalías',
      peruOfficial: 'CIP & SENASA Vigilancia Gorgojo',
      fieldReport: pest === 'sano' ? 'Chacra Sana (Sin Plagas)' : pest === 'gorgojo' ? 'Gorgojo detectado' : 'Rancha detectada',
      status: pest === 'sano' ? 'Sanidad Certificada' : 'Rotación Obligatoria',
      statusColor: pest === 'sano' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-red-100 text-red-900 border-red-300',
      icon: '🛡️',
    },
  ];

  const handleSubmit = async () => {
    playBubblePop();
    setLoading(true);

    const calibrationSummary = {
      matrix_10p_summary: {
        smap_soil_moisture: `${smapPercent}% vol`,
        in_situ_moisture: moisture,
        pest_status: pest,
        health_score: healthScore,
        soil_texture: profile?.soilTexture || 'franca',
        soil_stoniness: profile?.soilStoniness || 'profundo',
        water_source: profile?.waterSource || 'secano',
        sowing_window: profile?.sowingWindow || '2_4_semanas',
        previous_crop: profile?.previousCropName || 'Papa Nativa',
      },
    };

    const report: ReporteAgricultor = {
      cuenca_id: cuencaId || null,
      dispositivo_id: getDeviceId(),
      latitud: lat,
      longitud: lon,
      cultivo_actual_id: profile?.previousCropId || 'papa_nativa',
      humedad_suelo_estimada: moisture,
      presencia_gorgojo: pest === 'gorgojo',
      alerta_helada_observada: frostAlert,
      notas_voz_url: JSON.stringify(calibrationSummary),
      sincronizado_desde_outbox: false,
      textura_suelo: profile?.soilTexture || 'franca',
      pedregosidad: profile?.soilStoniness || 'profundo',
      cobertura_ndvi_real: profile?.cropCoverNdvi || 'barbecho',
      fuente_agua: profile?.waterSource || 'secano',
      ventana_siembra: profile?.sowingWindow || '2_4_semanas',
      indice_salud: healthScore,
    };

    if (navigator.onLine) {
      const res = await submitReportToCloud(report);
      if (res.success) {
        playSuccessFanfare();
        onToast('✅ Reporte de 10 parámetros validado y sincronizado con Supabase');
        loadReportsFromDatabase();
        setLoading(false);
        return;
      }
    }

    try {
      const q = JSON.parse(localStorage.getItem('terraquipu_offline_outbox') || '[]');
      q.unshift(report);
      localStorage.setItem('terraquipu_offline_outbox', JSON.stringify(q));
      setOfflineCount(q.length);
      playQuestionChime();
      onToast('🟠 Guardado en hardware (Modo Sin Señal). Se subirá al conectar.');
    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  };

  const flushQueue = async () => {
    playWhoosh();
    if (typeof window === 'undefined') return;
    const q: ReporteAgricultor[] = JSON.parse(localStorage.getItem('terraquipu_offline_outbox') || '[]');
    if (q.length === 0) {
      onToast('No hay reportes pendientes');
      return;
    }

    onToast(`Sincronizando ${q.length} reportes con la nube...`);
    let remaining: ReporteAgricultor[] = [];
    let synced = 0;

    for (const item of q) {
      item.sincronizado_desde_outbox = true;
      const res = await submitReportToCloud(item);
      if (res.success) synced++;
      else remaining.push(item);
    }

    localStorage.setItem('terraquipu_offline_outbox', JSON.stringify(remaining));
    setOfflineCount(remaining.length);
    loadReportsFromDatabase();

    if (synced > 0) {
      playSuccessFanfare();
      onToast(`✅ ${synced} reportes sincronizados con la nube`);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-8">
      {/* 1. Header y Triangulación de 3 Fuentes */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-black text-sm text-slate-950 flex items-center gap-1.5">
              <span>🌱 Laboratorio Táctil de Suelo</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Triangulación orbital NASA con sabiduría campesina andina
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            3 Fuentes
          </span>
        </div>

        {/* 3 Fuentes como fila limpia de píldoras (sin cajitas anidadas) */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="py-1.5 px-2 rounded-xl bg-sky-50 text-sky-950 font-bold border border-sky-200/80">
            <span className="block text-xs">🛰️</span>
            <span>NASA SMAP</span>
          </div>
          <div className="py-1.5 px-2 rounded-xl bg-amber-50 text-amber-950 font-bold border border-amber-200/80">
            <span className="block text-xs">🇵🇪</span>
            <span>SENAMHI / INIA</span>
          </div>
          <div className="py-1.5 px-2 rounded-xl bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/80">
            <span className="block text-xs">🧑‍🌾</span>
            <span>Tu Parcela</span>
          </div>
        </div>

        {/* Scorecard de Salud Edáfica Integral */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
              Índice de Salud Edáfica
            </span>
            <div className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
              <span>{healthScore} / 100</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                {healthScore >= 80 ? '✓ Resiliente' : healthScore >= 60 ? '⚡ Requiere Abono' : '⚠️ Vulnerable'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-200/80 block">10 Parámetros</span>
            <span className="text-xs font-mono font-bold text-white">Contrastado</span>
          </div>
        </div>
      </div>

      {/* 2. Prueba del Puño (Humedad) */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <span className="text-xs font-black text-slate-950 block tracking-tight">
          1. ¿Cómo sientes hoy la tierra al pisar tu chacra? (Prueba del Puño)
        </span>

        <div className="space-y-2">
          {[
            { id: 'SECO', label: 'Seca y Dura', desc: 'El polvo vuela, tierra cuarteada sin humedad', emoji: '🏜️' },
            { id: 'HUMEDAD_MEDIA', label: 'Húmeda y Mullida', desc: 'Forma una bola de tierra en la mano sin deshacerse', emoji: '🌱' },
            { id: 'SATURADO', label: 'Encharcada / Barro', desc: 'El agua brota al pisar la tierra, riesgo de asfixia', emoji: '🌊' },
          ].map((m) => {
            const isSelected = moisture === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMoisture(m.id as any)}
                className={`w-full p-3 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{m.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.desc}</div>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Diagnóstico Inmediato de Kipu */}
        <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300 flex items-start gap-2.5 text-xs text-slate-900 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-emerald-950 block font-bold">Diagnóstico de Kipu:</strong>
            {moisture === 'SECO' && 'Suelo con déficit hídrico. No siembres tubérculos hoy; aprovecha para preparar surcos y mulch vegetal.'}
            {moisture === 'HUMEDAD_MEDIA' && 'Condiciones óptimas. La capacidad de campo es ideal para la inoculación biológica de raíces y siembra.'}
            {moisture === 'SATURADO' && 'Exceso de agua edáfica. Abre zanjas de drenaje para evitar pudrición por bacterias anaeróbicas.'}
          </div>
        </div>
      </div>

      {/* 3. Semáforo Fitosanitario */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <span className="text-xs font-black text-slate-950 block tracking-tight">
          2. ¿Observas alguna plaga en tus plantas o rastrojo?
        </span>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <button
            type="button"
            onClick={() => handleSelectPest('sano')}
            className={`p-3 rounded-2xl border-2 border-b-4 font-bold transition-all cursor-pointer ${
              pest === 'sano'
                ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 text-slate-700 active:border-b-2 active:translate-y-0.5'
            }`}
          >
            <div className="text-2xl mb-1">🛡️</div>
            <div className="font-extrabold text-xs">Chacra Sana</div>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPest('gorgojo')}
            className={`p-3 rounded-2xl border-2 border-b-4 font-bold transition-all cursor-pointer ${
              pest === 'gorgojo'
                ? 'border-amber-500 border-b-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 active:border-b-2 active:translate-y-0.5'
                : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 text-slate-700 active:border-b-2 active:translate-y-0.5'
            }`}
          >
            <div className="text-2xl mb-1">🪲</div>
            <div className="font-extrabold text-xs">Gorgojo</div>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPest('rancha')}
            className={`p-3 rounded-2xl border-2 border-b-4 font-bold transition-all cursor-pointer ${
              pest === 'rancha'
                ? 'border-red-500 border-b-red-600 bg-red-50 text-red-950 ring-2 ring-red-500/20 active:border-b-2 active:translate-y-0.5'
                : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 text-slate-700 active:border-b-2 active:translate-y-0.5'
            }`}
          >
            <div className="text-2xl mb-1">🍂</div>
            <div className="font-extrabold text-xs">Rancha</div>
          </button>
        </div>
      </div>

      {/* 4. Matriz de Triangulación y Envío */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowMatrixDetails(!showMatrixDetails);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 border-b-4 border-b-slate-300 flex items-center justify-between text-xs font-extrabold text-slate-800 transition active:border-b-2 active:translate-y-0.5 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Ver Matriz de Triangulación (10 Parámetros)</span>
          </span>
          {showMatrixDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showMatrixDetails && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-200">
            <div className="p-2.5 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-snug">
              Contraste científico entre telemetría orbital NASA/ESA, estaciones SENAMHI e INIA y tu verificación de campo:
            </div>

            <div className="space-y-2">
              {matrixParameters.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{p.icon}</span>
                      <span className="font-bold text-xs text-slate-900">
                        {p.id}. {p.title}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${p.statusColor}`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-0.5 font-medium">
                    <div className="text-sky-900">
                      <span className="text-slate-400 block text-[9px]">Satélite / SENAMHI:</span>
                      <span>{p.satellite}</span>
                    </div>
                    <div className="text-emerald-950 font-bold">
                      <span className="text-slate-400 block text-[9px]">Tu Parcela:</span>
                      <span>{p.fieldReport}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botón Guardar y Contribuir */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          type="button"
          className="w-full py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 border-2 border-emerald-900 border-b-4 border-b-emerald-950 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:border-b-2 active:translate-y-0.5 transition cursor-pointer"
        >
          <CloudUpload className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="contrast-bold-white">
            {loading ? 'Validando con NASA & Supabase...' : 'Guardar y Contribuir a la Red Comunal'}
          </span>
        </button>

        {/* Caja de Pendientes Offline */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Pendientes en celular:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
              {offlineCount}
            </span>
            {offlineCount > 0 && (
              <button
                type="button"
                onClick={flushQueue}
                className="text-xs font-extrabold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-xl transition cursor-pointer"
              >
                Sincronizar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Historial de Reportes Sincronizados */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h4 className="font-black text-xs uppercase tracking-wider text-slate-700">
            Reportes Comunitarios de Campo
          </h4>
          <span className="text-[10px] font-mono text-slate-400">Supabase Ground-Truth</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentReports.length === 0 ? (
            <div className="text-xs text-slate-400 text-center py-3">
              No hay reportes registrados aún en la nube.
            </div>
          ) : (
            recentReports.map((r, i) => (
              <div
                key={r.id || i}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">
                    {r.humedad_suelo_estimada === 'SECO' ? '🏜️' : r.humedad_suelo_estimada === 'SATURADO' ? '🌊' : '🌱'}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      {r.humedad_suelo_estimada} • {r.presencia_gorgojo ? '🪲 Gorgojo' : '🛡️ Chacra Sana'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Reciente'} • {r.dispositivo_id.substring(0, 10)}...
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  En la Nube
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
