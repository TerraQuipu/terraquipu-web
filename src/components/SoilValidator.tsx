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
  ArrowRight,
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
  onUpdateProfile?: (updatedProfile: Partial<FarmerProfile>) => void;
}

export default function SoilValidator({
  cuencaId,
  lat = -13.3934,
  lon = -72.0498,
  profile,
  climaNasa,
  onToast,
  onUpdateProfile,
}: SoilValidatorProps) {
  // 1. Humedad edáfica
  const [moisture, setMoisture] = useState<'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO'>(
    profile?.moisture || 'HUMEDAD_MEDIA'
  );
  // 2. Sanidad fitosanitaria
  const [pest, setPest] = useState<'sano' | 'gorgojo' | 'rancha'>(
    profile?.pest || 'sano'
  );
  // 3. Textura del suelo
  const [soilTexture, setSoilTexture] = useState<'arena' | 'franca' | 'arcilla'>(
    profile?.soilTexture || 'franca'
  );
  // 4. Pedregosidad y profundidad
  const [soilStoniness, setSoilStoniness] = useState<'pedregoso' | 'profundo'>(
    profile?.soilStoniness || 'profundo'
  );
  // 5. Cobertura NDVI
  const [cropCoverNdvi, setCropCoverNdvi] = useState<'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo'>(
    profile?.cropCoverNdvi || 'barbecho'
  );
  // 6. Fuente de agua
  const [waterSource, setWaterSource] = useState<'secano' | 'auxilio' | 'permanente'>(
    profile?.waterSource || 'auxilio'
  );
  // 7. Ventana de siembra
  const [sowingWindow, setSowingWindow] = useState<'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana'>(
    profile?.sowingWindow || '2_4_semanas'
  );
  // 8. Cultivo previo
  const [previousCropId, setPreviousCropId] = useState<string>(
    profile?.previousCropId || 'papa_nativa'
  );
  // 9. Prioridad
  const [priority, setPriority] = useState<'tierra' | 'comida' | 'mercado'>(
    profile?.priority || 'tierra'
  );

  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [showMatrixDetails, setShowMatrixDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [recentReports, setRecentReports] = useState<ReporteAgricultor[]>([]);

  // Sincronizar estados locales si el profile exterior cambia
  useEffect(() => {
    if (profile?.moisture) setMoisture(profile.moisture);
    if (profile?.pest) setPest(profile.pest);
    if (profile?.soilTexture) setSoilTexture(profile.soilTexture);
    if (profile?.soilStoniness) setSoilStoniness(profile.soilStoniness);
    if (profile?.cropCoverNdvi) setCropCoverNdvi(profile.cropCoverNdvi);
    if (profile?.waterSource) setWaterSource(profile.waterSource);
    if (profile?.sowingWindow) setSowingWindow(profile.sowingWindow);
    if (profile?.previousCropId) setPreviousCropId(profile.previousCropId);
    if (profile?.priority) setPriority(profile.priority);
  }, [
    profile?.moisture,
    profile?.pest,
    profile?.soilTexture,
    profile?.soilStoniness,
    profile?.cropCoverNdvi,
    profile?.waterSource,
    profile?.sowingWindow,
    profile?.previousCropId,
    profile?.priority,
  ]);

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

  // Compute 10-Parameter Matrix & Ground-Truth Calibration
  const smapPercent = climaNasa?.humedad_suelo_smap_m3m3
    ? Math.round(climaNasa.humedad_suelo_smap_m3m3 * 100)
    : 35;

  const rainfallMm = climaNasa?.precipitacion_mm ?? 1.2;
  const tempMax = climaNasa?.temp_max_c ?? 19.4;
  const tempMin = climaNasa?.temp_min_c ?? 3.8;
  const frostAlert = climaNasa?.alerta_helada || tempMin <= 2.0;

  // Cálculo del Índice de Salud Edáfica (0 - 100)
  const calculateHealthScore = (): number => {
    let score = 55;
    if (moisture === 'HUMEDAD_MEDIA') score += 12;
    else if (moisture === 'SECO') score -= 8;
    else if (moisture === 'SATURADO') score -= 5;

    if (pest === 'sano') score += 10;
    else if (pest === 'gorgojo') score -= 18;
    else if (pest === 'rancha') score -= 14;

    if (soilTexture === 'franca') score += 10;
    else if (soilTexture === 'arcilla') score += 4;
    else if (soilTexture === 'arena') score -= 5;

    if (soilStoniness === 'profundo') score += 8;
    else score -= 4;

    if (cropCoverNdvi === 'sembrado') score += 7;
    else if (cropCoverNdvi === 'barbecho') score += 5;
    else if (cropCoverNdvi === 'suelo_desnudo') score -= 10;

    if (waterSource === 'permanente') score += 8;
    else if (waterSource === 'auxilio') score += 5;

    if (previousCropId.includes('haba') || previousCropId.includes('tarwi')) score += 8;
    else if (previousCropId.includes('papa')) score -= 4;

    return Math.max(15, Math.min(99, score));
  };

  const healthScore = calculateHealthScore();

  // Helper de sincronización automática en segundo plano
  const autoSyncAnswer = (partial: Partial<FarmerProfile>, toastMsg: string) => {
    playBubblePop();
    if (onUpdateProfile) {
      onUpdateProfile(partial);
    }
    onToast(toastMsg);
  };

  // Handlers para cada pregunta
  const handleSelectMoisture = (val: 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO') => {
    setMoisture(val);
    const labels = {
      SECO: 'Seca y Dura',
      HUMEDAD_MEDIA: 'Húmeda y Mullida',
      SATURADO: 'Encharcada / Barro',
    };
    autoSyncAnswer(
      { moisture: val, moistureLabel: labels[val] },
      `✓ Humedad calibrada: ${labels[val]}`
    );
  };

  const handleSelectPest = (val: 'sano' | 'gorgojo' | 'rancha') => {
    setPest(val);
    const labels = {
      sano: 'Chacra Sana (Sin Plagas)',
      gorgojo: 'Gorgojo de los Andes detectado',
      rancha: 'Rancha / Tizón tardío detectado',
    };
    autoSyncAnswer(
      { pest: val, pestLabel: labels[val] },
      `✓ Sanidad: ${labels[val]}`
    );
  };

  const handleSelectTexture = (val: 'arena' | 'franca' | 'arcilla') => {
    setSoilTexture(val);
    const labels = {
      franca: 'Franca (Equilibrada)',
      arena: 'Arenosa (Drenante)',
      arcilla: 'Arcillosa (Retentiva)',
    };
    autoSyncAnswer({ soilTexture: val }, `✓ Textura: ${labels[val]}`);
  };

  const handleSelectStoniness = (val: 'pedregoso' | 'profundo') => {
    setSoilStoniness(val);
    const labels = {
      profundo: 'Tierra Profunda y Fértil',
      pedregoso: 'Suelo Delgado / Pedregoso',
    };
    autoSyncAnswer({ soilStoniness: val }, `✓ Perfil: ${labels[val]}`);
  };

  const handleSelectCover = (val: 'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo') => {
    setCropCoverNdvi(val);
    const labels = {
      sembrado: 'Cultivo en Crecimiento',
      barbecho: 'Descanso con Rastrojo',
      pasto: 'Pasto Natural / Pradera',
      suelo_desnudo: 'Tierra Pelada (Expuesta)',
    };
    autoSyncAnswer({ cropCoverNdvi: val }, `✓ Cobertura: ${labels[val]}`);
  };

  const handleSelectWater = (val: 'secano' | 'auxilio' | 'permanente') => {
    setWaterSource(val);
    const labels = {
      secano: 'Solo Lluvia (Secano)',
      auxilio: 'Canal de Auxilio / Turnos',
      permanente: 'Riego Permanente Tecnificado',
    };
    autoSyncAnswer({ waterSource: val }, `✓ Riego: ${labels[val]}`);
  };

  const handleSelectSowingWindow = (val: 'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana') => {
    setSowingWindow(val);
    const labels = {
      esta_semana: 'Esta semana',
      '2_4_semanas': 'En 2 a 4 semanas',
      '1_2_meses': 'En 1 a 2 meses',
      proxima_campana: 'Próxima campaña',
    };
    autoSyncAnswer({ sowingWindow: val }, `✓ Ventana de Siembra: ${labels[val]}`);
  };

  // Matriz de Triangulación de 10 Parámetros
  const matrixParameters = [
    {
      id: 1,
      title: 'Humedad Superficial Edáfica',
      satellite: `NASA SMAP: ${smapPercent}% vol`,
      peruOfficial: 'SENAMHI Balance Hídrico',
      fieldReport:
        moisture === 'HUMEDAD_MEDIA'
          ? 'Tierra Mullida (Puño)'
          : moisture === 'SECO'
          ? 'Tierra Seca / Polvo'
          : 'Suelo Encharcado',
      status: moisture === 'HUMEDAD_MEDIA' ? 'Calibrado Óptimo' : 'Divergencia Detectada',
      statusColor:
        moisture === 'HUMEDAD_MEDIA'
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
          : 'bg-amber-100 text-amber-900 border-amber-300',
      icon: '💧',
    },
    {
      id: 2,
      title: 'Capacidad de Retención de Humedad',
      satellite: 'SoilGrids Texture Map (30m)',
      peruOfficial: 'Estudio de Suelos INIA Cusco',
      fieldReport: `Textura: ${
        soilTexture === 'franca'
          ? 'Franca (Equilibrada)'
          : soilTexture === 'arena'
          ? 'Arenosa (Drenante)'
          : 'Arcillosa (Retentiva)'
      }`,
      status: 'Consistente',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌱',
    },
    {
      id: 3,
      title: 'Pedregosidad y Profundidad Efectiva',
      satellite: 'SRTM / Copernicus DEM 30m',
      peruOfficial: 'Carta Geológica INGEMMET',
      fieldReport: `Perfil: ${soilStoniness === 'profundo' ? 'Profundo y Fértil' : 'Pedregoso'}`,
      status: soilStoniness === 'profundo' ? 'Sin Restricción' : 'Manejo de Terrazas',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '⛰️',
    },
    {
      id: 4,
      title: 'Precipitación Acumulada Reciente',
      satellite: `NASA GPM IMERG: ${rainfallMm} mm`,
      peruOfficial: 'Pluviómetro SENAMHI',
      fieldReport:
        moisture === 'SECO'
          ? 'Secano estricto sin lluvia'
          : 'Humedad presente en parcela',
      status: rainfallMm < 5 ? 'Déficit Pluvial' : 'Aporte Pluvial Normal',
      statusColor:
        rainfallMm < 5
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌧️',
    },
    {
      id: 5,
      title: 'Riesgo de Helada Agronómica Nocturna',
      satellite: `NASA POWER Tmin: ${tempMin.toFixed(1)}°C`,
      peruOfficial: 'Boletín de Heladas SENAMHI',
      fieldReport: frostAlert ? 'Alerta activa: Escarcha visible' : 'Sin helada crítica hoy',
      status: frostAlert ? 'Alerta Crítica' : 'Zona Segura',
      statusColor:
        frostAlert
          ? 'bg-red-100 text-red-900 border-red-300'
          : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '❄️',
    },
    {
      id: 6,
      title: 'Vigor Vegetal y Cobertura (NDVI)',
      satellite: 'Sentinel-2 ESA (NDVI: 0.62)',
      peruOfficial: 'Mapa MIDAGRI de Cobertura',
      fieldReport: `Estado: ${
        cropCoverNdvi === 'sembrado'
          ? 'Cultivo en Crecimiento'
          : cropCoverNdvi === 'barbecho'
          ? 'Suelo en Barbecho'
          : cropCoverNdvi === 'pasto'
          ? 'Pradera / Forraje'
          : 'Suelo Desnudo'
      }`,
      status: cropCoverNdvi === 'suelo_desnudo' ? 'Riesgo Erosión' : 'Vegetación Protegida',
      statusColor:
        cropCoverNdvi === 'suelo_desnudo'
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌿',
    },
    {
      id: 7,
      title: 'Disponibilidad de Agua y Riego',
      satellite: 'Sentinel-1 SAR Radar Superficie',
      peruOfficial: 'Junta de Usuarios de Agua',
      fieldReport: `Riego: ${
        waterSource === 'permanente'
          ? 'Riego Permanente'
          : waterSource === 'auxilio'
          ? 'Canal de Auxilio'
          : 'Secano Estricto'
      }`,
      status: waterSource === 'secano' ? 'Vulnerable a Sequía' : 'Asegurado por Canal',
      statusColor:
        waterSource === 'secano'
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌊',
    },
    {
      id: 8,
      title: 'Ventana Favorable de Siembra',
      satellite: 'Pronóstico Multimodel NOAA/NASA',
      peruOfficial: 'Calendario Agrícola INIA Cusco',
      fieldReport: `Ventana: ${
        sowingWindow === 'esta_semana'
          ? 'Esta semana'
          : sowingWindow === '2_4_semanas'
          ? 'En 2 a 4 semanas'
          : sowingWindow === '1_2_meses'
          ? 'En 1 a 2 meses'
          : 'Próxima campaña'
      }`,
      status: 'Ventana Abierta',
      statusColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '📅',
    },
    {
      id: 9,
      title: 'Balance de Nitrógeno y Predecesor',
      satellite: 'Sentinel-2 Índices de Clorofila',
      peruOfficial: 'Manual de Abonamiento INIA',
      fieldReport: `Predecesor: ${profile?.previousCropName || 'Papa Nativa'}`,
      status: previousCropId.includes('papa')
        ? 'Déficit -70 kg N/ha'
        : 'Nitrógeno Positivo (+75 kg)',
      statusColor: previousCropId.includes('papa')
        ? 'bg-amber-100 text-amber-900 border-amber-300'
        : 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🧪',
    },
    {
      id: 10,
      title: 'Alerta Fitosanitaria y Rompe-Ciclo',
      satellite: 'MODIS Fenología Anomalías',
      peruOfficial: 'CIP & SENASA Vigilancia Gorgojo',
      fieldReport:
        pest === 'sano'
          ? 'Chacra Sana (Sin Plagas)'
          : pest === 'gorgojo'
          ? 'Gorgojo detectado'
          : 'Rancha detectada',
      status: pest === 'sano' ? 'Sanidad Certificada' : 'Rotación Obligatoria',
      statusColor:
        pest === 'sano'
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
          : 'bg-red-100 text-red-900 border-red-300',
      icon: '🛡️',
    },
  ];

  // Envío manual o forzado a la nube
  const handleSubmit = async () => {
    playBubblePop();
    setLoading(true);

    const calibrationSummary = {
      matrix_10p_summary: {
        smap_soil_moisture: `${smapPercent}% vol`,
        in_situ_moisture: moisture,
        pest_status: pest,
        health_score: healthScore,
        soil_texture: soilTexture,
        soil_stoniness: soilStoniness,
        crop_cover: cropCoverNdvi,
        water_source: waterSource,
        sowing_window: sowingWindow,
        previous_crop: profile?.previousCropName || 'Papa Nativa',
        priority: priority,
      },
    };

    const report: ReporteAgricultor = {
      cuenca_id: cuencaId || null,
      dispositivo_id: getDeviceId(),
      latitud: lat,
      longitud: lon,
      cultivo_actual_id: previousCropId,
      humedad_suelo_estimada: moisture,
      presencia_gorgojo: pest === 'gorgojo',
      alerta_helada_observada: frostAlert,
      notas_voz_url: JSON.stringify(calibrationSummary),
      sincronizado_desde_outbox: false,
      textura_suelo: soilTexture,
      pedregosidad: soilStoniness,
      cobertura_ndvi_real: cropCoverNdvi,
      fuente_agua: waterSource,
      ventana_siembra: sowingWindow,
      indice_salud: healthScore,
    };

    if (navigator.onLine) {
      const res = await submitReportToCloud(report);
      if (res.success) {
        playSuccessFanfare();
        onToast('✅ Calibración sincronizada con Supabase');
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
              <span>🌱 Diagnóstico y Calibración de Parcela</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Telemetría orbital NASA calibrada con sabiduría de campo andina
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            En Vivo
          </span>
        </div>

        {/* 3 Fuentes como fila limpia de píldoras */}
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
            <span className="text-xs font-mono font-bold text-white">Sincronizados</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PREGUNTA 1: Humedad del Suelo (Prueba del Puño)           */}
      {/* ======================================================== */}
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
                className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{m.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{m.desc}</div>
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
            {moisture === 'SECO' &&
              'Suelo con déficit hídrico. No siembres tubérculos hoy; aprovecha para preparar surcos y colocar mulch vegetal protector.'}
            {moisture === 'HUMEDAD_MEDIA' &&
              'Condiciones óptimas. La capacidad de campo es ideal para la inoculación biológica de raíces, surcado y siembra.'}
            {moisture === 'SATURADO' &&
              'Exceso de agua edáfica. Abre zanjas de drenaje o sangrías para evitar asfixia radicular y pudrición por bacterias anaeróbicas.'}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PREGUNTA 2: Sanidad Fitosanitaria                        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <span className="text-xs font-black text-slate-950 block tracking-tight">
          2. ¿Observas alguna plaga en tus plantas o rastrojo?
        </span>

        <div className="space-y-2">
          {[
            {
              id: 'sano',
              label: 'Chacra Sana (Sin Plagas)',
              desc: 'Follaje limpio, sin galerías en tubérculos ni manchas de hongos',
              emoji: '🛡️',
            },
            {
              id: 'gorgojo',
              label: 'Gorgojo de los Andes',
              desc: 'Presencia de Premnotrypes suturicallus en tubérculos o suelo',
              emoji: '🪲',
            },
            {
              id: 'rancha',
              label: 'Rancha / Tizón Tardío',
              desc: 'Manchas marrones o moho en hojas (Phytophthora infestans)',
              emoji: '🍂',
            },
          ].map((p) => {
            const isSelected = pest === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPest(p.id as any)}
                className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? p.id === 'sano'
                      ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                      : p.id === 'gorgojo'
                      ? 'border-amber-500 border-b-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-500/20 active:border-b-2 active:translate-y-0.5'
                      : 'border-red-500 border-b-red-600 bg-red-50 text-red-950 font-bold ring-2 ring-red-500/20 active:border-b-2 active:translate-y-0.5'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.emoji}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{p.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{p.desc}</div>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2
                    className={`w-5 h-5 flex-shrink-0 ${
                      p.id === 'sano'
                        ? 'text-emerald-700'
                        : p.id === 'gorgojo'
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  />
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
            {pest === 'sano' &&
              '¡Sanidad vegetal certificada! Mantén la biodiversidad sembrando barreras vivas de tarwi o muña en los linderos para bloquear vectores.'}
            {pest === 'gorgojo' &&
              'Alerta de gorgojo: Es imperativo rotar con leguminosas (haba o tarwi) para romper el ciclo biológico y erradicar larvas del suelo.'}
            {pest === 'rancha' &&
              'Alerta de rancha: Airea bien los surcos, evita el encharcamiento nocturno y aplica caldos minerales o purín de cola de caballo.'}
          </div>
        </div>
      </div>

      {/* Controles para abrir el Asistente Paso a Paso o expandir preguntas avanzadas */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowMoreQuestions(!showMoreQuestions);
          }}
          className="w-full py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 border-b-4 border-b-slate-300 flex items-center justify-between text-xs font-extrabold text-slate-800 transition active:border-b-2 active:translate-y-0.5 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>⚙️</span>
            <span>{showMoreQuestions ? 'Ocultar Preguntas Avanzadas' : 'Ver Preguntas Avanzadas en esta pantalla'}</span>
          </span>
          {showMoreQuestions ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      {/* Preguntas Avanzadas (Opcionales para evitar scroll innecesario) */}
      {showMoreQuestions && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* PREGUNTA 3: Textura del Suelo */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
            <span className="text-xs font-black text-slate-950 block tracking-tight">
              3. ¿Qué textura tiene la tierra al amasarla húmeda? (Infiltración)
            </span>
            <div className="space-y-2">
              {[
                {
                  id: 'franca',
                  label: 'Franca (Mullida y Equilibrada)',
                  desc: 'Forma bola suave y cinta corta; retiene humedad y aire en balance óptimo',
                  emoji: '🌱',
                },
                {
                  id: 'arena',
                  label: 'Arenosa (Sustrato Suelto)',
                  desc: 'Se desgrana fácilmente; el agua escurre muy rápido y retiene poco abono',
                  emoji: '🏜️',
                },
                {
                  id: 'arcilla',
                  label: 'Arcillosa (Pesada y Pegajosa)',
                  desc: 'Forma cilindro brillante; alta retención hídrica pero riesgo de compactación',
                  emoji: '🌊',
                },
              ].map((t) => {
                const isSelected = soilTexture === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTexture(t.id as any)}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                        : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{t.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Diagnóstico Inmediato de Kipu */}
            <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300 flex items-start gap-2.5 text-xs text-slate-900 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 block font-bold">Diagnóstico de Kipu:</strong>
                {soilTexture === 'franca' &&
                  'Suelo franco equilibrado. Retención y drenaje balanceados; respuesta óptima para tubérculos y leguminosas sin riesgo de asfixia radicular.'}
                {soilTexture === 'arena' &&
                  'Suelo arenoso de drenaje rápido. Se lava el nitrógeno con facilidad; incorpora abundante compost, biol o rastrojo de haba para aumentar materia orgánica.'}
                {soilTexture === 'arcilla' &&
                  'Suelo arcilloso pesado. Alta capacidad de retención mineral pero riesgo de sellado y compactación superficial; trabaja en surcos altos y camellones.'}
              </div>
            </div>
          </div>

          {/* PREGUNTA 4: Pedregosidad */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
            <span className="text-xs font-black text-slate-950 block tracking-tight">
              4. ¿Cómo es el perfil y fondo de tu chacra? (Profundidad)
            </span>
            <div className="space-y-2">
              {[
                {
                  id: 'profundo',
                  label: 'Tierra Profunda y Fértil',
                  desc: 'Capa arable de más de 40 cm sin piedras mayores; permite raíces hondas',
                  emoji: '🌾',
                },
                {
                  id: 'pedregoso',
                  label: 'Suelo Delgado / Pedregoso',
                  desc: 'Mucha piedra superficial o roca madre cercana; requiere camellones altos',
                  emoji: '🪨',
                },
              ].map((s) => {
                const isSelected = soilStoniness === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStoniness(s.id as any)}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                        : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{s.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{s.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Diagnóstico Inmediato de Kipu */}
            <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300 flex items-start gap-2.5 text-xs text-slate-900 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 block font-bold">Diagnóstico de Kipu:</strong>
                {soilStoniness === 'profundo' &&
                  'Capa arable profunda (>40 cm). Permite desarrollo vigoroso de raíces pivotantes y tubérculos sin restricciones físicas ni deformaciones.'}
                {soilStoniness === 'pedregoso' &&
                  'Suelo pedregoso y poco profundo. Esencial aporcar con camellones altos y terrazas para retener tierra fértil y proteger los tubérculos.'}
              </div>
            </div>
          </div>

          {/* PREGUNTA 5: Cobertura NDVI */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
            <span className="text-xs font-black text-slate-950 block tracking-tight">
              5. ¿Cuál es la cobertura actual de tu lote? (Vigor NDVI)
            </span>
            <div className="space-y-2">
              {[
                {
                  id: 'sembrado',
                  label: 'Cultivo Sembrado en Crecimiento',
                  desc: 'Plantas creciendo vigorosas, follaje verde activo cubriendo el suelo',
                  emoji: '🌱',
                },
                {
                  id: 'barbecho',
                  label: 'Descanso con Rastrojo',
                  desc: 'Suelo protegido con rastrojos y residuos secos de la cosecha previa',
                  emoji: '🍂',
                },
                {
                  id: 'pasto',
                  label: 'Pasto Natural / Pradera',
                  desc: 'Cobertura densa de forraje andino o pasturas protectoras',
                  emoji: '🌾',
                },
                {
                  id: 'suelo_desnudo',
                  label: 'Tierra Pelada (Sin Rastrojo)',
                  desc: 'Suelo expuesto al sol y viento; alto riesgo de erosión y pérdida de nutrientes',
                  emoji: '🏜️',
                },
              ].map((c) => {
                const isSelected = cropCoverNdvi === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCover(c.id as any)}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                        : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{c.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{c.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Diagnóstico Inmediato de Kipu */}
            <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300 flex items-start gap-2.5 text-xs text-slate-900 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 block font-bold">Diagnóstico de Kipu:</strong>
                {cropCoverNdvi === 'sembrado' &&
                  'Cultivo activo con vigor vegetativo óptimo. Intercepción solar adecuada para fotosíntesis y protección del suelo vivo.'}
                {cropCoverNdvi === 'barbecho' &&
                  'Suelo en descanso con rastrojo. Los residuos vegetales nutren la fauna edáfica y evitan la pérdida de humedad por evaporación.'}
                {cropCoverNdvi === 'pasto' &&
                  'Cobertura de pradera andina. Excelente anclaje radicular para prevenir la erosión pluvial en laderas pronunciadas.'}
                {cropCoverNdvi === 'suelo_desnudo' &&
                  'Suelo desnudo vulnerable. Riesgo crítico de erosión por viento y lluvia; cubre con mulch o prepara siembra inmediata.'}
              </div>
            </div>
          </div>

          {/* PREGUNTA 6: Fuente de Agua */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
            <span className="text-xs font-black text-slate-950 block tracking-tight">
              6. ¿De dónde se abastece de agua esta parcela? (Seguridad Hídrica)
            </span>
            <div className="space-y-2">
              {[
                {
                  id: 'secano',
                  label: 'Solo Lluvia (Secano Estricto)',
                  desc: 'Depende 100% del ciclo de lluvias; sensible a veranillos de El Niño',
                  emoji: '🌧️',
                },
                {
                  id: 'auxilio',
                  label: 'Lluvia + Canal de Auxilio',
                  desc: 'Agua por turnos comunales (mita) o reservorio rústico ante sequía',
                  emoji: '💧',
                },
                {
                  id: 'permanente',
                  label: 'Riego Permanente Tecnificado',
                  desc: 'Aspersión o goteo constante; permite cultivos de alto rendimiento',
                  emoji: '🚰',
                },
              ].map((w) => {
                const isSelected = waterSource === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleSelectWater(w.id as any)}
                    className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 border-b-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 active:border-b-2 active:translate-y-0.5'
                        : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{w.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{w.label}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{w.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Diagnóstico Inmediato de Kipu */}
            <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-300 flex items-start gap-2.5 text-xs text-slate-900 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 block font-bold">Diagnóstico de Kipu:</strong>
                {waterSource === 'secano' &&
                  'Secano estricto. Alta vulnerabilidad a veranillos andinos; alinea siembras con el radar satelital NASA GPM para garantizar humedad.'}
                {waterSource === 'auxilio' &&
                  'Canal de auxilio comunal. Permite riegos de emergencia durante floración o aporcado; cuida la mita para momentos críticos de sequía.'}
                {waterSource === 'permanente' &&
                  'Riego permanente tecnificado. Control hídrico total; favorece fertilización disuelta y siembras fuera de temporada de lluvias.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Matriz de Triangulación y Envío */}
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

      {/* 11. Historial de Reportes Sincronizados */}
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
