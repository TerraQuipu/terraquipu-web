'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { submitReportToCloud, getRecentReports } from '@/lib/supabaseClient';
import { ReporteAgricultor, FarmerProfile, ClimaNasa, Microcuenca, Cultivo } from '@/lib/types';
import {
  CloudUpload,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Droplets,
  Sprout,
  Activity,
} from 'lucide-react';
import {
  playBubblePop,
  playSuccessFanfare,
  playWhoosh,
  playQuestionChime,
} from '@/lib/soundEffects';
import KipuFullScreenWizard from './KipuFullScreenWizard';

interface SoilValidatorProps {
  cuencaId?: string;
  lat?: number;
  lon?: number;
  profile?: FarmerProfile;
  climaNasa?: ClimaNasa | null;
  microcuencas?: Microcuenca[];
  cultivos?: Cultivo[];
  onToast: (msg: string) => void;
  onUpdateProfile?: (updatedProfile: Partial<FarmerProfile>) => void;
}

export default function SoilValidator({
  cuencaId,
  lat = -13.3934,
  lon = -72.0498,
  profile,
  climaNasa,
  microcuencas = [],
  cultivos = [],
  onToast,
  onUpdateProfile,
}: SoilValidatorProps) {
  // Wizard modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Profile data shortcuts
  const moisture = profile?.moisture || 'HUMEDAD_MEDIA';
  const pest = profile?.pest || 'sano';
  const soilTexture = profile?.soilTexture || 'franca';
  const soilStoniness = profile?.soilStoniness || 'profundo';

  const [showMatrixDetails, setShowMatrixDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [recentReports, setRecentReports] = useState<ReporteAgricultor[]>([]);

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

  // Telemetría orbital
  const smapPercent = climaNasa?.humedad_suelo_smap_m3m3
    ? Math.round(climaNasa.humedad_suelo_smap_m3m3 * 100)
    : 35;

  // Cálculo del Índice de Salud Edáfica (0 - 100)
  const healthScore = useMemo(() => {
    let score = 60;
    if (soilTexture === 'franca') score += 15;
    else if (soilTexture === 'arcilla') score += 8;
    else if (soilTexture === 'arena') score -= 5;

    if (soilStoniness === 'profundo') score += 12;
    else score -= 8;

    if (pest === 'sano') score += 13;
    else if (pest === 'gorgojo') score -= 18;
    else if (pest === 'rancha') score -= 14;

    return Math.max(20, Math.min(99, score));
  }, [soilTexture, soilStoniness, pest]);

  // Sincronizar reporte a la nube
  const handleSyncToCloud = async () => {
    playBubblePop();
    setLoading(true);

    const report: ReporteAgricultor = {
      cuenca_id: cuencaId || '29699448-afa8-4fb4-b502-24e3e577ef90',
      latitud: lat,
      longitud: lon,
      humedad_suelo_estimada: moisture,
      dispositivo_id: getDeviceId(),
      presencia_gorgojo: pest === 'gorgojo',
      sincronizado_desde_outbox: false,
      textura_suelo: soilTexture,
      pedregosidad: soilStoniness,
      indice_salud: healthScore,
    };

    try {
      const res = await submitReportToCloud(report);
      if ((res as any)?.offline) {
        loadOfflineQueue();
        onToast('📦 Reporte guardado localmente (Sin internet)');
      } else if (res.success) {
        playSuccessFanfare();
        onToast('✅ Calibración sincronizada en nube Supabase');
        loadReportsFromDatabase();
      } else {
        onToast('⚠️ Error al registrar reporte en la nube');
      }
    } catch {
      onToast('⚠️ Error al registrar reporte');
    } finally {
      setLoading(false);
    }
  };

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
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/40',
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
      statusColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: '🧱',
    },
    {
      id: 3,
      title: 'Sanidad Fitosanitaria y Bioseguridad',
      satellite: 'Sentinel-2 Vigor Biomasa (10m)',
      peruOfficial: 'SENASA Vigilancia Cusco',
      fieldReport:
        pest === 'sano'
          ? 'Chacra Sana (Sin Plagas)'
          : pest === 'gorgojo'
          ? 'Gorgojo de los Andes'
          : 'Rancha / Tizón',
      status: pest === 'sano' ? 'Chacra Sana' : 'Alerta de Control',
      statusColor:
        pest === 'sano'
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-red-500/20 text-red-300 border-red-500/40',
      icon: '🪲',
    },
    {
      id: 4,
      title: 'Profundidad Efectiva y Pedregosidad',
      satellite: 'SRTM NASA DEM 30m',
      peruOfficial: 'Zonificación Ecológica MINAM',
      fieldReport:
        soilStoniness === 'profundo'
          ? 'Tierra Profunda (>60cm)'
          : 'Pedregoso / Delgado',
      status: soilStoniness === 'profundo' ? 'Apto Zanjas' : 'Superficial',
      statusColor:
        soilStoniness === 'profundo'
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: '🏔️',
    },
  ];

  return (
    <div className="space-y-4 pb-16 pt-1">
      {/* Modal Duolingo Interactivo para Suelo */}
      {isWizardOpen && (
        <KipuFullScreenWizard
          mode="soil"
          microcuencas={microcuencas}
          cultivos={cultivos}
          initialProfile={profile}
          onComplete={(updatedProfile) => {
            setIsWizardOpen(false);
            if (onUpdateProfile) {
              onUpdateProfile(updatedProfile);
            }
            onToast('¡Suelo y sanidad calibrados con éxito con Kipu!');
          }}
          onCancel={() => setIsWizardOpen(false)}
        />
      )}

      {/* 1. Header & Telemetría Edáfica (Dark Forest Glass Panel) */}
      <div className="glass-panel p-4 sm:p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
              DIAGNÓSTICO EDÁFICO • SATÉLITE NASA SMAP
            </span>
            <h2 className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
              <span>🌱 Calibración de Suelo &amp; Sanidad</span>
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            En Vivo
          </span>
        </div>

        {/* 3 Fuentes Píldoras en Frosted Glass */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="py-2 px-2 rounded-2xl bg-[#0A1A0F]/60 text-cyan-300 font-bold border border-cyan-500/30">
            <span className="block text-xs mb-0.5">🛰️</span>
            <span>NASA SMAP ({smapPercent}%)</span>
          </div>
          <div className="py-2 px-2 rounded-2xl bg-[#0A1A0F]/60 text-amber-300 font-bold border border-amber-500/30">
            <span className="block text-xs mb-0.5">🇵🇪</span>
            <span>SENAMHI / INIA</span>
          </div>
          <div className="py-2 px-2 rounded-2xl bg-[#0A1A0F]/60 text-emerald-300 font-bold border border-emerald-500/30">
            <span className="block text-xs mb-0.5">🧑‍🌾</span>
            <span>Tu Parcela</span>
          </div>
        </div>

        {/* Scorecard de Salud Edáfica Integral */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-[#0F2418]/90 to-[#0A1A0F]/90 border border-emerald-500/30 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
              Índice de Salud Edáfica
            </span>
            <div className="text-2xl font-black text-white flex items-center gap-2 mt-0.5">
              <span className="text-glow-emerald">{healthScore}</span>
              <span className="text-sm font-normal text-slate-400">/ 100</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {healthScore >= 80 ? '✓ Resiliente' : healthScore >= 60 ? '⚡ Requiere Abono' : '⚠️ Vulnerable'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-300/80 block">Calibración Activa</span>
            <span className="text-xs font-mono font-bold text-white">4 Parámetros</span>
          </div>
        </div>
      </div>

      {/* 2. BOTÓN HERO: Flujo Duolingo Rápido de Suelo */}
      <button
        type="button"
        onClick={() => {
          playBubblePop();
          setIsWizardOpen(true);
        }}
        className="w-full p-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 border border-emerald-400/40 text-white flex items-center justify-between shadow-2xl active:scale-98 transition cursor-pointer group"
      >
        <div className="flex items-center gap-3.5 text-left">
          <span className="p-2.5 rounded-2xl bg-white/20 text-2xl backdrop-blur-md flex-shrink-0 shadow-sm">
            🌱
          </span>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <span>Calibrar Suelo con Kipu</span>
              <span className="text-[10px] bg-lime-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">
                Duolingo
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5 leading-snug">
              Prueba del puño, textura, pedregosidad y semáforo de plagas paso a paso
            </p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-lime-400 group-hover:text-slate-950 transition-colors">
          <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:text-slate-950 transition-colors" />
        </div>
      </button>

      {/* 3. Resumen de Parámetros Calibrados (Sin Cards Anidadas Innecesarias) */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
          <span className="text-xs font-black text-white uppercase tracking-wide">
            Estado Actual Calibrado de tu Suelo
          </span>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setIsWizardOpen(true);
            }}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-200 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Recalibrar</span>
          </button>
        </div>

        {/* 4 Parámetros en Fila/Columna Limpia */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">
              1. Humedad del Suelo
            </span>
            <div className="text-xs font-black text-white mt-1 flex items-center gap-1.5">
              <span>
                {moisture === 'HUMEDAD_MEDIA' ? '🌱' : moisture === 'SECO' ? '🏜️' : '🌊'}
              </span>
              <span>
                {moisture === 'HUMEDAD_MEDIA'
                  ? 'Húmeda y Mullida'
                  : moisture === 'SECO'
                  ? 'Seca y Dura'
                  : 'Saturada / Barro'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">
              2. Textura al Tacto
            </span>
            <div className="text-xs font-black text-white mt-1 flex items-center gap-1.5">
              <span>🧱</span>
              <span>
                {soilTexture === 'franca'
                  ? 'Franca (Mullida)'
                  : soilTexture === 'arena'
                  ? 'Arenosa'
                  : 'Arcillosa'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">
              3. Profundidad
            </span>
            <div className="text-xs font-black text-white mt-1 flex items-center gap-1.5">
              <span>🏔️</span>
              <span>
                {soilStoniness === 'profundo'
                  ? 'Profundo (>60cm)'
                  : 'Delgado / Pedregoso'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-400 uppercase block">
              4. Sanidad Fitosanitaria
            </span>
            <div className="text-xs font-black text-white mt-1 flex items-center gap-1.5">
              <span>
                {pest === 'sano' ? '🛡️' : pest === 'gorgojo' ? '🪲' : '🍂'}
              </span>
              <span className={pest === 'sano' ? 'text-emerald-400' : 'text-amber-400'}>
                {pest === 'sano'
                  ? 'Chacra Sana'
                  : pest === 'gorgojo'
                  ? 'Gorgojo Detectado'
                  : 'Rancha Detectada'}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnóstico Inmediato de Kipu */}
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-slate-200">
          <Sparkles className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-lime-300 block font-bold">Diagnóstico de Kipu:</strong>
            {moisture === 'SECO' &&
              'Suelo con déficit hídrico. No siembres tubérculos hoy; aprovecha para preparar surcos y colocar mulch vegetal protector.'}
            {moisture === 'HUMEDAD_MEDIA' &&
              'Condiciones óptimas. La capacidad de campo es ideal para la inoculación biológica de raíces, surcado y siembra.'}
            {moisture === 'SATURADO' &&
              'Exceso de agua edáfica. Abre zanjas de drenaje o sangrías para evitar asfixia radicular y pudrición por bacterias anaeróbicas.'}
          </div>
        </div>
      </div>

      {/* 4. Botón de Sincronización en la Nube */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleSyncToCloud}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <CloudUpload className="w-4 h-4 text-slate-950" />
          )}
          <span>
            {loading
              ? 'Sincronizando con Servidor...'
              : 'Sincronizar Calibración en la Nube Supabase'}
          </span>
          {offlineCount > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-950 text-white">
              {offlineCount} pendientes
            </span>
          )}
        </button>
      </div>

      {/* 5. Matriz de Triangulación de 4 Parámetros (Acordeón Glassmorphic Limpio) */}
      <div className="glass-panel overflow-hidden">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowMatrixDetails(!showMatrixDetails);
          }}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-emerald-950/40 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-extrabold text-xs text-white block">
                Matriz de Triangulación de 3 Fuentes
              </span>
              <span className="text-[11px] text-slate-400">
                Evidencia científica: NASA vs SENAMHI vs Reporte de Parcela
              </span>
            </div>
          </div>
          {showMatrixDetails ? (
            <ChevronUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-emerald-400" />
          )}
        </button>

        {showMatrixDetails && (
          <div className="p-4 pt-1 border-t border-emerald-500/20 space-y-2.5 text-xs animate-in fade-in duration-150">
            {matrixParameters.map((param) => (
              <div
                key={param.id}
                className="p-3 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>{param.icon}</span>
                    <span>{param.title}</span>
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${param.statusColor}`}
                  >
                    {param.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] pt-1">
                  <div>
                    <span className="text-slate-400 block font-semibold">NASA SMAP:</span>
                    <span className="text-slate-200 font-bold">{param.satellite}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Oficial Perú:</span>
                    <span className="text-slate-200 font-bold">{param.peruOfficial}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Tu Parcela:</span>
                    <span className="text-emerald-400 font-bold">{param.fieldReport}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
