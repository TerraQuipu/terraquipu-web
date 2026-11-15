'use client';

import React, { useState } from 'react';
import { Cultivo, FarmerProfile } from '@/lib/types';
import {
  RotateCcw,
  ArrowRight,
  Sliders,
  PenTool,
  Droplets,
  Sprout,
  ShieldAlert,
  Sparkles,
  MapPin,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import ParcelMap from '@/components/ParcelMap';
import QuipuRotationCard from '@/components/QuipuRotationCard';

interface ChacraTabProps {
  profile: FarmerProfile;
  cultivos: Cultivo[];
  isElNino: boolean;
  hardwareId: string;
  onToast: (msg: string) => void;
  onRecalibrate: () => void;
  onUpdateCrop: (cropId: string, cropName: string) => void;
  onUpdatePriority: (priority: 'tierra' | 'comida' | 'mercado', priorityName: string) => void;
  onUpdateArea?: (areaHa: number) => void;
  onNavigateToSuelo?: () => void;
}

const PRESET_SIZES = [
  { label: '0.5 ha', ha: 0.5, topos: '1.7 topos' },
  { label: '1.0 ha', ha: 1.0, topos: '3.3 topos' },
  { label: '2.3 ha', ha: 2.3, topos: '7.6 topos' },
  { label: '5.0 ha', ha: 5.0, topos: '16.5 topos' },
  { label: '10.0 ha', ha: 10.0, topos: '33.0 topos' },
];

export default function ChacraTab({
  profile,
  cultivos,
  isElNino,
  hardwareId,
  onToast,
  onRecalibrate,
  onUpdateCrop,
  onUpdatePriority,
  onUpdateArea,
  onNavigateToSuelo,
}: ChacraTabProps) {
  const currentArea = profile.areaHa !== undefined ? profile.areaHa : 1.0;
  const topos = (currentArea * 3.3).toFixed(1);

  const [activeArea, setActiveArea] = useState<number>(currentArea);

  const handleOpenWizard = () => {
    playBubblePop();
    onRecalibrate();
  };

  const handleAreaChange = (newArea: number) => {
    setActiveArea(newArea);
    if (onUpdateArea) {
      onUpdateArea(newArea);
    }
    onToast(`📐 Parcela redimensionada a ${newArea} ha (≈ ${(newArea * 3.3).toFixed(1)} topos)`);
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-16 pt-1">
      {/* 1. TOP FLOATING GLASS CARD (SCREEN 3 STYLE) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#132A1C]/90 via-[#0F2418]/85 to-[#0A1A0F]/90 border border-emerald-500/30 p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
              FICHA DE MI CHACRA • TERRITORIO ANDINO
            </span>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 mt-0.5">
              <span>{profile.parcelName}</span>
              <span className="text-xs text-emerald-300 font-normal">({profile.distrito})</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={handleOpenWizard}
            className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>Recalibrar</span>
          </button>
        </div>

        {/* 4 Summary Stats: Area, Plant Age, Previous Crop, Priority */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 font-bold block">Área Total:</span>
            <span className="font-extrabold text-white text-sm">
              {currentArea} ha
            </span>
            <span className="text-[10px] text-emerald-300/80 font-mono block">
              ≈ {topos} topos andinos
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 font-bold block">Etapa de Campaña:</span>
            <span className="font-extrabold text-white text-sm">
              45 Días
            </span>
            <span className="text-[10px] text-emerald-300/80 font-mono block">
              Fase Desarrollo Vegetativo
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 font-bold block">Cosecha Previa:</span>
            <span className="font-extrabold text-white text-xs truncate block mt-0.5">
              {profile.previousCropName}
            </span>
            <span className="text-[9px] text-slate-400 block">Suelo en Descanso / Ayni</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 font-bold block">Prioridad Campaña:</span>
            <span className="font-extrabold text-white text-xs truncate block mt-0.5">
              {profile.priorityName}
            </span>
            <span className="text-[9px] text-emerald-400/80 block">Abono &amp; Nutrientes</span>
          </div>
        </div>
      </div>

      {/* 2. DUAL PARCEL SELECTOR (POR TAMAÑOS / HECTÁREAS O TRAZADO LIBRE QGIS) */}
      <div className="glass-panel p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-lime-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300">
              Seleccionar Tamaño o Trazar con QGIS
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            {currentArea} ha • {topos} topos
          </span>
        </div>

        {/* Chips de Tamaños Rápidos */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {PRESET_SIZES.map((preset) => {
            const isSelected = Math.abs(currentArea - preset.ha) < 0.05;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  playBubblePop();
                  handleAreaChange(preset.ha);
                }}
                className={`px-3 py-1.5 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/30 scale-102'
                    : 'bg-[#132A1C]/80 border border-emerald-500/30 text-emerald-200/80 hover:bg-[#183925] hover:text-white'
                }`}
              >
                <span>{preset.label}</span>
                <span className="text-[9px] opacity-75 ml-1">({preset.topos})</span>
              </button>
            );
          })}
        </div>

        {/* Slider continuo de hectáreas */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.1 ha (Mínimo)</span>
            <span className="text-lime-300 font-bold">{currentArea} Hectáreas ({topos} Topos)</span>
            <span>15.0 ha (Chacra Grande)</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="15.0"
            step="0.1"
            value={currentArea}
            onChange={(e) => handleAreaChange(parseFloat(e.target.value))}
            className="w-full accent-lime-400 bg-emerald-950/80 rounded-lg h-2 cursor-pointer border border-emerald-500/30"
          />
        </div>
      </div>

      {/* 3. MAPA SATELITAL DE LA PARCELA CON TRAZADO LIBRE QGIS */}
      <ParcelMap
        lat={profile.lat}
        lon={profile.lon}
        parcelName={`${profile.parcelName} (${currentArea} ha)`}
        altitude={profile.altitude}
        slope={profile.slope}
        areaHa={currentArea}
        onUpdateArea={handleAreaChange}
      />

      {/* 4. FLOATING 4-QUADRANT METRICS GRID (SCREEN 3 STYLE) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Metric 1: Water Depth / Humedad SMAP */}
        <div className="glass-panel p-3 space-y-1">
          <div className="flex items-center justify-between text-cyan-300">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>Humedad SMAP</span>
            </span>
            <span className="text-[9px] text-cyan-400/80 font-mono">0-5 cm</span>
          </div>
          <div className="text-xl font-black text-white">
            12% <span className="text-xs font-normal text-slate-400">vol</span>
          </div>
          <div className="text-[9px] font-bold text-amber-400">
            ⚠️ Déficit Hídrico Activo
          </div>
        </div>

        {/* Metric 2: Plant Health / NDVI */}
        <div className="glass-panel p-3 space-y-1">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sprout className="w-3 h-3 text-emerald-400" />
              <span>Salud Vegetal</span>
            </span>
            <span className="text-[9px] text-emerald-400/80 font-mono">NDVI</span>
          </div>
          <div className="text-xl font-black text-white">
            0.68 <span className="text-xs font-normal text-slate-400">/ 1.0</span>
          </div>
          <div className="text-[9px] font-bold text-emerald-400">
            ✓ Vigor Andino Fuerte
          </div>
        </div>

        {/* Metric 3: Soil Quality / Calidad Suelo */}
        <div className="glass-panel p-3 space-y-1">
          <div className="flex items-center justify-between text-lime-300">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-lime-400" />
              <span>Calidad Suelo</span>
            </span>
            <span className="text-[9px] text-lime-400/80 font-mono">Índice A13</span>
          </div>
          <div className="text-xl font-black text-white">
            75 <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <div className="text-[9px] font-bold text-lime-300">
            ✓ Mullido y Fértil
          </div>
        </div>

        {/* Metric 4: Pest Risk / Riesgo Gorgojo */}
        <div className="glass-panel p-3 space-y-1">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Riesgo Gorgojo</span>
            </span>
            <span className="text-[9px] text-amber-400/80 font-mono">INIA</span>
          </div>
          <div className="text-xl font-black text-white">
            10% <span className="text-xs font-normal text-slate-400">Bajo</span>
          </div>
          <div className="text-[9px] font-bold text-emerald-400">
            ✓ Control Biológico
          </div>
        </div>
      </div>

      {/* 5. RUTA QUIPU DE ROTACIÓN CIENTÍFICA (3 CAMPAÑAS) */}
      <QuipuRotationCard
        cultivos={cultivos}
        isElNino={isElNino}
        areaHa={currentArea}
        onToast={onToast}
        initialCropId={profile.previousCropId}
        initialPriority={profile.priority}
        onCropChange={(cropId) => {
          const crop = cultivos.find((c) => c.crop_id === cropId);
          if (crop) {
            onUpdateCrop(cropId, crop.nombre_comun);
          }
        }}
        onPriorityChange={(prio) => {
          const priorityLabels = {
            tierra: 'Curar y Abonar Suelo',
            comida: 'Comida para la Casa',
            mercado: 'Venta en Feria o Mercado',
          };
          onUpdatePriority(prio, priorityLabels[prio]);
        }}
      />
    </div>
  );
}
