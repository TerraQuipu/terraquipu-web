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
import { ActiveParcel, getAltitudinalFloor, estimateTerrainMetrics } from '@/lib/geoUtils';

interface FarmerReportDetailModalProps {
  report: ReporteAgricultor | null;
  onClose: () => void;
  onLoadAsActiveParcel?: (parcel: ActiveParcel) => void;
  onShowToast: (msg: string) => void;
}

const CROP_IMAGES: Record<string, { label: string; img: string }> = {
  papa_nativa: { label: 'Papa Nativa Andina', img: '/images/papa_nativa.jpg' },
  papa: { label: 'Papa Nativa Andina', img: '/images/papa_nativa.jpg' },
  quinua: { label: 'Quinua Real / Pasankalla', img: '/images/quinua_real.jpg' },
  tarwi: { label: 'Tarwi / Chocho', img: '/images/tarwi_chocho.jpg' },
  haba: { label: 'Haba Verde Criollo', img: '/images/haba_verde.jpg' },
  maiz: { label: 'Maíz Blanco Gigante Cusco', img: '/images/maiz_blanco.jpg' },
};

export default function FarmerReportDetailModal({
  report,
  onClose,
  onLoadAsActiveParcel,
  onShowToast,
}: FarmerReportDetailModalProps) {
  if (!report) return null;

  const dateFormatted = new Date(report.created_at).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  });

  const cropKey = (report.cultivo_actual_id || 'papa_nativa').toLowerCase();
  const cropData = CROP_IMAGES[cropKey] || {
    label: report.cultivo_actual_id ? report.cultivo_actual_id.replace('_', ' ').toUpperCase() : 'PAPA NATIVA',
    img: '/images/papa_nativa.jpg',
  };

  // Accurate elevation & terrain calculation for report coordinate
  const terrain = estimateTerrainMetrics([report.latitud, report.longitud], 1.25);
  const floor = getAltitudinalFloor(terrain.elevationMsnm);

  const moistureDescriptions: Record<string, { label: string; desc: string; badge: string; icon: string }> = {
    SECO: {
      label: 'Seco / Infiltración Rápida',
      desc: 'Poca retención hídrica en perfil radicular. Alerta de estrés hídrico.',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: '🏜️',
    },
    HUMEDAD_MEDIA: {
      label: 'Húmedo y Mullido (Óptimo)',
      desc: 'Forma bola suave con prueba del puño. Estructura esponjosa ideal.',
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🌱',
    },
    SATURADO: {
      label: 'Muy Húmedo / Barro',
      desc: 'Alta retención en arcilla. Precaución con drenaje y aporque.',
      badge: 'bg-blue-100 text-blue-900 border-blue-300',
      icon: '🧱',
    },
    CHARCO: {
      label: 'Encharcado / Saturado',
      desc: 'Agua estancada en superficie. Drenaje deficiente o canal desbordado.',
      badge: 'bg-cyan-100 text-cyan-900 border-cyan-300',
      icon: '🌊',
    },
  };

  const moistureInfo = moistureDescriptions[report.humedad_suelo_estimada] || moistureDescriptions['HUMEDAD_MEDIA'];

  // Calculate estimated soil health score from report attributes
  let estimatedHealth = 70;
  if (report.humedad_suelo_estimada === 'HUMEDAD_MEDIA') estimatedHealth += 15;
  if (!report.presencia_gorgojo) estimatedHealth += 10;
  else estimatedHealth -= 20;
  if (report.alerta_helada_observada) estimatedHealth -= 10;
  if (terrain.elevationMsnm <= 0) estimatedHealth = 20;
  estimatedHealth = Math.max(10, Math.min(100, estimatedHealth));

  const handleLoadInPlanner = () => {
    if (!onLoadAsActiveParcel) return;

    const lat = report.latitud;
    const lng = report.longitud;
    const delta = 0.0016;

    const newParcel: ActiveParcel = {
      id: `PARCEL-${report.dispositivo_id}`,
      name: `Chacra Validada • ${report.dispositivo_id}`,
      areaHa: 1.25,
      slopePct: terrain.slopePct,
      elevationMsnm: terrain.elevationMsnm,
      smapMoisturePct: report.humedad_suelo_estimada === 'SECO' ? 18.4 : 42.1,
      ndvi: terrain.ndvi,
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
    onShowToast(`🎯 Parcela ${report.dispositivo_id} cargada en el Planificador Territorial`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Photographic Banner Header (Identical style to Visor Side Lateral) */}
        <div className="relative h-32 sm:h-36 overflow-hidden flex-shrink-0 group">
          <img
            src={cropData.img}
            alt={cropData.label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ✓ Ground-Truth Comunal • Supabase PostGIS
              </span>
              <span className="text-[10px] font-mono text-zinc-300 bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                {dateFormatted}
              </span>
            </div>

            <h3 className="text-white font-bold text-base sm:text-lg leading-tight mt-1 drop-shadow-sm">
              Parcela Validada • {report.dispositivo_id}
            </h3>

            <p className="text-[11px] text-zinc-300 font-mono mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>{report.latitud.toFixed(4)}° S, {report.longitud.toFixed(4)}° W</span>
              <span>•</span>
              <span className="text-emerald-300 font-bold">{terrain.elevationMsnm} m s.n.m.</span>
              <span>•</span>
              <span className="truncate max-w-[150px]">{floor.shortName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition backdrop-blur-xs shadow-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ocean Warning if in Pacific */}
        {terrain.elevationMsnm <= 0 && (
          <div className="p-3 bg-sky-50 border-b border-sky-200 text-xs text-sky-950 flex items-center gap-2">
            <span className="text-xl">🌊</span>
            <span className="text-[11px]">
              <strong>Zona Marina:</strong> Coordenadas ubicadas en aguas del Pacífico (0 m s.n.m.).
            </span>
          </div>
        )}

        {/* Unified Inspection Content (No redundant nested cards) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          {/* 1. Spatial & Agronomic 4-Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              <span className="text-[10px] text-zinc-500 font-medium block">Superficie Lote</span>
              <span className="font-mono font-bold text-zinc-950 text-sm block">1.25 ha</span>
              <span className="text-[10px] text-zinc-500 font-mono">≈ 3.8 topos</span>
            </div>

            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              <span className="text-[10px] text-zinc-500 font-medium block">Pendiente</span>
              <span className="font-mono font-bold text-zinc-950 text-sm block">{terrain.slopePct}%</span>
              <span className="text-[10px] text-zinc-500">
                {terrain.slopePct > 15 ? 'Ladera Media' : 'Ladera Suave'}
              </span>
            </div>

            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              <span className="text-[10px] text-zinc-500 font-medium block">Humedad SMAP</span>
              <span className="font-mono font-bold text-blue-700 text-sm block">{terrain.smapMoisturePct}%</span>
              <span className="text-[10px] text-zinc-500">Radar Orbital</span>
            </div>

            <div className="bg-zinc-50 p-2.5 rounded-xl border border-zinc-200">
              <span className="text-[10px] text-zinc-500 font-medium block">Salud Edáfica</span>
              <span className="font-mono font-bold text-emerald-800 text-sm block">{estimatedHealth} / 100</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Resiliencia</span>
            </div>
          </div>

          {/* 2. Crop & Texture Profile Row with Thumbnail */}
          <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80">
              <div className="flex items-center gap-2.5">
                <img
                  src={cropData.img}
                  alt={cropData.label}
                  className="w-10 h-10 rounded-lg object-cover border border-zinc-300 shadow-2xs"
                />
                <div>
                  <span className="text-[10px] text-zinc-500 font-medium block">Cultivo en Parcela</span>
                  <span className="font-bold text-zinc-950 text-xs block">{cropData.label}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold">
                Campaña Validada
              </span>
            </div>

            {/* Ground Soil Moisture Diagnostic */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{moistureInfo.icon}</span>
                <div>
                  <span className="font-bold text-zinc-900 block leading-tight">
                    {moistureInfo.label}
                  </span>
                  <span className="text-[10px] text-zinc-500">{moistureInfo.desc}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${moistureInfo.badge}`}>
                Prueba Puño
              </span>
            </div>
          </div>

          {/* 3. Phytosanitary & Microclimate Direct Chips */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              report.presencia_gorgojo
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            }`}>
              <span className="text-lg">{report.presencia_gorgojo ? '⚠️' : '✓'}</span>
              <div>
                <span className="font-bold block text-xs leading-tight">
                  {report.presencia_gorgojo ? 'Gorgojo Detectado' : 'Sin Gorgojo'}
                </span>
                <span className="text-[10px] opacity-75">
                  {report.presencia_gorgojo ? 'Corte de ciclo biológico' : 'Sanidad óptima'}
                </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
              report.alerta_helada_observada
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-zinc-50 border-zinc-200 text-zinc-900'
            }`}>
              <span className="text-lg">{report.alerta_helada_observada ? '❄️' : '☀️'}</span>
              <div>
                <span className="font-bold block text-xs leading-tight">
                  {report.alerta_helada_observada ? 'Helada Observada' : 'Sin Helada'}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {report.alerta_helada_observada ? 'Escarcha en campo' : 'Térmicamente estable'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Supabase Realtime Provenance */}
          <div className="p-2.5 bg-sky-50/80 border border-sky-200 rounded-xl flex items-center justify-between text-[11px] text-sky-950">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-sky-700 flex-shrink-0" />
              <span>Sincronizado desde app móvil PWA vía Supabase Realtime</span>
            </div>
            <span className="font-mono text-[10px] text-sky-800 bg-sky-100 px-2 py-0.5 rounded border border-sky-300 font-semibold">
              UUID: {report.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-zinc-50 border-t border-zinc-200 p-3.5 sm:p-4 flex items-center justify-between gap-2.5 flex-shrink-0">
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
