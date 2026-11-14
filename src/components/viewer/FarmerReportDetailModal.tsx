'use client';

import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  Satellite,
  ShieldCheck,
  AlertTriangle,
  Sprout,
  CheckCircle2,
  ExternalLink,
  Target,
  Download,
  Database,
  CloudRain,
  Thermometer,
} from 'lucide-react';
import { ReporteAgricultor } from '@/types';
import { ActiveParcel } from '@/lib/geoUtils';

interface FarmerReportDetailModalProps {
  report: ReporteAgricultor | null;
  onClose: () => void;
  onLoadAsActiveParcel?: (parcel: ActiveParcel) => void;
  onShowToast: (msg: string) => void;
}

export default function FarmerReportDetailModal({
  report,
  onClose,
  onLoadAsActiveParcel,
  onShowToast,
}: FarmerReportDetailModalProps) {
  if (!report) return null;

  const dateFormatted = new Date(report.created_at).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  });

  const cropName = report.cultivo_actual_id
    ? report.cultivo_actual_id.replace('_', ' ').toUpperCase()
    : 'PAPA NATIVA ANDINA';

  const moistureDescriptions: Record<string, { label: string; desc: string; badge: string }> = {
    SECO: {
      label: 'Seco / Infiltración Rápida',
      desc: 'Poca retención hídrica en perfil radicular (0-20 cm). Alerta de déficit.',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    HUMEDAD_MEDIA: {
      label: 'Húmedo y Mullido (Óptimo)',
      desc: 'Forma bola suave con prueba del puño. Estructura esponjosa ideal.',
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    SATURADO: {
      label: 'Muy Húmedo / Barro',
      desc: 'Alta retención en arcilla. Riesgo de encharcamiento si llueve.',
      badge: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    CHARCO: {
      label: 'Encharcado / Saturado',
      desc: 'Agua estancada en superficie. Drenaje deficiente o canal desbordado.',
      badge: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    },
  };

  const moistureInfo = moistureDescriptions[report.humedad_suelo_estimada] || moistureDescriptions['HUMEDAD_MEDIA'];

  // Calculate estimated soil health score from report attributes
  let estimatedHealth = 70;
  if (report.humedad_suelo_estimada === 'HUMEDAD_MEDIA') estimatedHealth += 15;
  if (!report.presencia_gorgojo) estimatedHealth += 10;
  else estimatedHealth -= 20;
  if (report.alerta_helada_observada) estimatedHealth -= 10;
  estimatedHealth = Math.max(25, Math.min(100, estimatedHealth));

  const handleLoadInPlanner = () => {
    if (!onLoadAsActiveParcel) return;

    // Build parcel geometry around report centroid (~1.2 ha)
    const lat = report.latitud;
    const lng = report.longitud;
    const delta = 0.0016;

    const newParcel: ActiveParcel = {
      id: `PARCEL-${report.dispositivo_id}`,
      name: `Chacra Validada • ${report.dispositivo_id}`,
      areaHa: 1.25,
      slopePct: 12.5,
      elevationMsnm: 3740,
      smapMoisturePct: report.humedad_suelo_estimada === 'SECO' ? 18.4 : 42.1,
      ndvi: 0.64,
      center: [lat, lng],
      bounds: [
        [lat - delta, lng - delta],
        [lat - delta, lng + delta],
        [lat + delta, lng + delta],
        [lat + delta, lng - delta],
      ],
      isCustom: true,
      groundTruthCalibrated: true,
      groundTruthData: {
        soilTexture: report.humedad_suelo_estimada === 'SECO' ? 'arena' : 'franca',
        soilStoniness: 'profundo',
        cropCoverNdvi: 'sembrado',
        waterSource: 'auxilio',
        sowingWindow: '2_4_semanas',
        hasWeevil: report.presencia_gorgojo,
        hasFrostAlert: report.alerta_helada_observada,
        soilHealthIndex: estimatedHealth,
        calibratedAt: report.created_at,
      },
    };

    onLoadAsActiveParcel(newParcel);
    onShowToast(`🎯 Parcela ${report.dispositivo_id} cargada en el Planificador`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-zinc-900 to-slate-900 p-4 text-white flex items-center justify-between border-b border-emerald-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-lg shadow-xs">
              🌱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  Ground-Truth Comunal
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.2 rounded-full font-semibold border border-emerald-400/40">
                  Supabase PostGIS
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                Parcela Validada • {report.dispositivo_id}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Spatial Coords Banner */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-zinc-900 block">Coordenadas en Terreno</span>
                <span className="font-mono text-zinc-600 text-[11px]">
                  {report.latitud.toFixed(5)}° S, {report.longitud.toFixed(5)}° W
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 font-medium block">Fecha de Registro</span>
              <span className="font-mono text-zinc-700 text-[11px]">{dateFormatted}</span>
            </div>
          </div>

          {/* Triangulation Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Crop Card */}
            <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-semibold uppercase">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cultivo Cosechado</span>
              </div>
              <span className="font-bold text-zinc-950 text-sm block">
                {cropName}
              </span>
              <span className="text-[10px] text-zinc-500">Campaña agrícola reportada</span>
            </div>

            {/* Health Score */}
            <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-semibold uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salud Edáfica Calculada</span>
              </div>
              <span className="font-mono font-bold text-emerald-800 text-sm block">
                {estimatedHealth} / 100
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {estimatedHealth >= 75 ? 'Resiliencia Alta' : 'Resiliencia Moderada'}
              </span>
            </div>
          </div>

          {/* Soil Moisture Detail */}
          <div className="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-1.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                Humedad de Campo (Prueba del Puño)
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${moistureInfo.badge}`}>
                {moistureInfo.label}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-snug">
              {moistureInfo.desc}
            </p>
          </div>

          {/* Phytosanitary and Weather Alerts */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              report.presencia_gorgojo
                ? 'bg-rose-50 border-rose-300 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="text-xl">
                {report.presencia_gorgojo ? '⚠️' : '✓'}
              </div>
              <div>
                <span className="font-bold block text-xs">
                  {report.presencia_gorgojo ? 'Gorgojo Detectado' : 'Sin Gorgojo'}
                </span>
                <span className="text-[10px] opacity-75">
                  {report.presencia_gorgojo ? 'Requiere rotación con leguminosa' : 'Suelo sano para rotación'}
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${
              report.alerta_helada_observada
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-zinc-50 border-zinc-200 text-zinc-900'
            }`}>
              <div className="text-xl">
                {report.alerta_helada_observada ? '❄️' : '☀️'}
              </div>
              <div>
                <span className="font-bold block text-xs">
                  {report.alerta_helada_observada ? 'Helada Observada' : 'Sin Helada'}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {report.alerta_helada_observada ? 'Escarcha en campo reportada' : 'Condición térmica estable'}
                </span>
              </div>
            </div>
          </div>

          {/* Cloud Sync Information */}
          <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center justify-between text-[11px] text-sky-900">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-700" />
              <span>Sincronizado desde app móvil vía Supabase Realtime</span>
            </div>
            <span className="font-mono text-[10px] text-sky-700 bg-sky-100 px-2 py-0.5 rounded border border-sky-300 font-semibold">
              UUID: {report.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="bg-zinc-50 border-t border-zinc-200 p-4 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-semibold transition"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleLoadInPlanner}
            className="flex-1 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
          >
            <Target className="w-4 h-4 text-emerald-300" />
            <span>Cargar en Planificador Territorial</span>
          </button>
        </div>
      </div>
    </div>
  );
}
