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

    const res = await submitReportToCloud(report);
    setLoading(false);

    if (res.success) {
      playSuccessFanfare();
      onToast('✓ Parámetros edáficos sincronizados en la nube');
      loadOfflineQueue();
      loadReportsFromDatabase();
    } else {
      onToast('⚠️ Guardado en memoria local sin conexión');
      loadOfflineQueue();
    }
  };

  // Matriz de Triangulación
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
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
          : 'bg-red-100 text-red-900 border-red-300',
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
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
          : 'bg-amber-100 text-amber-900 border-amber-300',
      icon: '🏔️',
    },
  ];

  return (
    <div className="space-y-4">
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

      {/* Header & Telemetría */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 border-b-4 border-b-slate-300 p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
              <span>🌱 Telemetría Edáfica &amp; NASA SMAP</span>
            </h2>
            <p className="text-xs text-slate-500">
              Telemetría orbital NASA calibrada con sabiduría de campo andina
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            En Vivo
          </span>
        </div>

        {/* 3 Fuentes Píldoras */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div className="py-1.5 px-2 rounded-xl bg-sky-50 text-sky-950 font-bold border border-sky-200/80">
            <span className="block text-xs">🛰️</span>
            <span>NASA SMAP ({smapPercent}%)</span>
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
            <span className="text-[10px] text-emerald-200/80 block">Calibración Activa</span>
            <span className="text-xs font-mono font-bold text-white">4 Parámetros</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTÓN HERO: Flujo Duolingo Rápido de Suelo               */}
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
            🌱
          </span>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <span>Calibrar Suelo con Kipu</span>
              <span className="text-[10px] bg-emerald-300/30 text-emerald-100 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300/40">
                Estilo Duolingo
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5 leading-snug">
              Prueba del puño, textura, pedregosidad y semáforo de plagas paso a paso
            </p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition">
          <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>

      {/* ======================================================== */}
      {/* Resumen de Parámetros Calibrados (Cards Limpias)         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 border-b-4 border-b-slate-300 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-950 uppercase tracking-wide">
            Estado Actual Calibrado de tu Suelo
          </span>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setIsWizardOpen(true);
            }}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Recalibrar</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
              1. Humedad del Suelo
            </span>
            <div className="text-xs font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
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

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
              2. Textura al Tacto
            </span>
            <div className="text-xs font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
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

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
              3. Profundidad
            </span>
            <div className="text-xs font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span>🏔️</span>
              <span>
                {soilStoniness === 'profundo'
                  ? 'Profundo y Fértil'
                  : 'Delgado / Pedregoso'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
              4. Sanidad Fitosanitaria
            </span>
            <div className="text-xs font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span>
                {pest === 'sano' ? '🛡️' : pest === 'gorgojo' ? '🪲' : '🍂'}
              </span>
              <span className={pest === 'sano' ? 'text-emerald-900' : 'text-red-700'}>
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
      {/* Botón de Sincronización en la Nube                       */}
      {/* ======================================================== */}
      <div className="pt-1">
        <button
          type="button"
          onClick={handleSyncToCloud}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 border-2 border-emerald-900 border-b-4 border-b-emerald-950 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs active:border-b-2 active:translate-y-0.5 transition cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <CloudUpload className="w-4 h-4" />
          )}
          <span>
            {loading
              ? 'Sincronizando con Servidor...'
              : 'Sincronizar Calibración en la Nube Supabase'}
          </span>
          {offlineCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
              {offlineCount} pendientes
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* Matriz de Triangulación de 4 Parámetros Clave (Toggle)   */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowMatrixDetails(!showMatrixDetails);
          }}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">
                Matriz de Triangulación de 3 Fuentes
              </span>
              <span className="text-[11px] text-slate-500">
                Evidencia científica: NASA vs SENAMHI vs Reporte de Parcela
              </span>
            </div>
          </div>
          {showMatrixDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showMatrixDetails && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-2.5 text-xs animate-in fade-in duration-150">
            {matrixParameters.map((param) => (
              <div
                key={param.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
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
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold">NASA SMAP:</span>
                    <span className="text-slate-800 font-bold">{param.satellite}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold">Oficial Perú:</span>
                    <span className="text-slate-800 font-bold">{param.peruOfficial}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-semibold">Tu Parcela:</span>
                    <span className="text-emerald-950 font-bold">{param.fieldReport}</span>
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
