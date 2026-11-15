'use client';

import React, { useState } from 'react';
import { Cultivo, FarmerProfile } from '@/lib/types';
import {
  HelpCircle,
  Droplets,
  Leaf,
  Layers,
  AlertTriangle,
  ChevronRight,
  MapPin,
  PenTool,
  Sliders,
  Sun,
} from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import ParcelMap from '@/components/ParcelMap';

interface ChacraTabProps {
  profile: FarmerProfile;
  cultivos?: Cultivo[];
  isElNino?: boolean;
  hardwareId?: string;
  onToast: (msg: string) => void;
  onRecalibrate?: () => void;
  onNavigateToInicio?: () => void;
  onUpdateCrop?: (cropId: string, cropName: string) => void;
  onUpdatePriority?: (priority: 'tierra' | 'comida' | 'mercado', priorityName: string) => void;
  onUpdateArea?: (areaHa: number) => void;
  onOpenWizard?: () => void;
}

export default function ChacraTab({
  profile,
  cultivos = [],
  isElNino = false,
  hardwareId,
  onToast,
  onRecalibrate,
  onNavigateToInicio,
  onUpdateCrop,
  onUpdatePriority,
  onUpdateArea,
  onOpenWizard,
}: ChacraTabProps) {
  // Layer toggles matching video frame 003/004
  const [layerSmap, setLayerSmap] = useState(true);
  const [layerNdvi, setLayerNdvi] = useState(false);
  const [layerDrought, setLayerDrought] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showQgisTools, setShowQgisTools] = useState(false);

  const currentArea = profile.areaHa !== undefined ? profile.areaHa : 3.5;
  const topos = (currentArea * 3.3).toFixed(1);

  const handleToggleSmap = () => {
    playBubblePop();
    const next = !layerSmap;
    setLayerSmap(next);
    onToast(next ? 'Capa SMAP humedad activada' : 'Capa SMAP desactivada');
  };

  const handleToggleNdvi = () => {
    playBubblePop();
    const next = !layerNdvi;
    setLayerNdvi(next);
    onToast(next ? 'Capa NDVI vegetación activada' : 'Capa NDVI desactivada');
  };

  const handleToggleDrought = () => {
    playBubblePop();
    const next = !layerDrought;
    setLayerDrought(next);
    onToast(next ? 'Capa Calor y sequía activada' : 'Capa Sequía desactivada');
  };

  const handleAreaChange = (newArea: number) => {
    if (onUpdateArea) {
      onUpdateArea(newArea);
    }
    onToast(`Parcela calibrada a ${newArea} ha (≈ ${(newArea * 3.3).toFixed(1)} topos)`);
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-16">
      {/* 1. Header Section */}
      <div className="flex items-start justify-between px-1 pt-1">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
            MICROCUENCA VILCANOTA · CUSCO
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#132A1C] leading-tight">
            Tu campo,{' '}
            <span className="font-serif italic text-emerald-800 font-normal">
              desde arriba.
            </span>
          </h1>
        </div>

        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowInfoModal(!showInfoModal);
          }}
          className="w-9 h-9 rounded-full bg-white border border-[#E5ECE2] text-zinc-600 hover:text-emerald-800 flex items-center justify-center shadow-xs transition cursor-pointer"
          title="Información de capas y sensores"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Info Popover if clicked */}
      {showInfoModal && (
        <div className="bg-white rounded-2xl p-3.5 border border-[#E5ECE2] shadow-sm text-xs text-zinc-700 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-semibold text-emerald-900 text-[11px] uppercase">
            <span>Guía de Telemetría Satelital</span>
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="text-zinc-400 hover:text-zinc-600 font-bold text-xs"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">
            Las capas combinan radiometría radar L-band (NASA SMAP) a 9 km interpolada con topografía SRTM 30m y reflectancia espectral Sentinel-2 para el Valle de Urubamba.
          </p>
        </div>
      )}

      {/* 2. SATELLITE MAP CONTAINER (CONCENTRIC RADAR RINGS & OVERLAYS - Frame 003) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#132A1C] border border-[#E5ECE2] shadow-sm min-h-[300px] h-[300px]">
        {/* Leaflet Satellite Map Layer */}
        <div className="h-full w-full relative z-0">
          <ParcelMap
            lat={profile.lat}
            lon={profile.lon}
            parcelName={`${profile.parcelName} (${currentArea} ha)`}
            altitude={profile.altitude}
            slope={profile.slope}
            areaHa={currentArea}
            cropName={profile.previousCropName || 'Papa Huayro'}
            onUpdateArea={handleAreaChange}
            isEditorialView={true}
          />
        </div>

        {/* Concentric Radar Overlay Rings (Visual fidelity with video frame 003) */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-white/20 border-dashed animate-pulse" />
          <div className="w-64 h-64 rounded-full border border-white/15 border-dashed absolute" />
          <div className="w-80 h-80 rounded-full border border-white/10 border-dashed absolute" />
        </div>

        {/* Top Floating Badges on Map: VILCANOTA · 3,400 MSNM · • EN VIVO */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-[#132A1C]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3 text-[#A3E635]" />
            <span>VILCANOTA · {profile.altitude || 3400} MSNM</span>
          </div>

          <div className="bg-[#132A1C]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-bold text-[#A3E635] flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
            <span>EN VIVO</span>
          </div>
        </div>

        {/* Central Parcel Badge Tag */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-[#7BB63E] text-[#132A1C] font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-white/40 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#132A1C]" />
            <span>{profile.previousCropName || 'Papa Huayro'}</span>
          </div>
        </div>

        {/* Neighboring Andenes Visual Indicators */}
        <div className="absolute top-[38%] left-[22%] z-15 pointer-events-none opacity-80">
          <div className="bg-[#132A1C]/80 backdrop-blur-xs text-white/90 text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Andén 02</span>
          </div>
        </div>

        <div className="absolute top-[62%] right-[18%] z-15 pointer-events-none opacity-80">
          <div className="bg-[#132A1C]/80 backdrop-blur-xs text-white/90 text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/15 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            <span>Andén 04</span>
          </div>
        </div>

        {/* Bottom Layer Tags on Map */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
          {layerSmap && (
            <span className="text-[9.5px] font-bold bg-[#132A1C]/85 backdrop-blur-md text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              • Humedad
            </span>
          )}
          {layerNdvi && (
            <span className="text-[9.5px] font-bold bg-[#132A1C]/85 backdrop-blur-md text-lime-300 px-2.5 py-0.5 rounded-full border border-lime-500/30">
              • NDVI
            </span>
          )}
          {layerDrought && (
            <span className="text-[9.5px] font-bold bg-[#132A1C]/85 backdrop-blur-md text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              • Sequía
            </span>
          )}
        </div>

        {/* QGIS Drawing Tool toggle button bottom-right */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowQgisTools(!showQgisTools);
          }}
          className="absolute bottom-3 right-3 z-20 bg-white/90 hover:bg-white text-[#132A1C] text-[10px] font-semibold px-2.5 py-1 rounded-xl shadow-md border border-zinc-200 flex items-center gap-1 cursor-pointer transition active:scale-95"
          title="Herramienta de polígono libre QGIS"
        >
          <PenTool className="w-3 h-3 text-emerald-800" />
          <span>QGIS</span>
        </button>
      </div>

      {/* Quick QGIS Area Resizer (if expanded) */}
      {showQgisTools && (
        <div className="bg-white rounded-2xl p-3.5 border border-[#E5ECE2] shadow-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-[#132A1C]">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-700" />
              Dimensionar Parcela Georreferenciada
            </span>
            <span className="font-mono text-emerald-800">{currentArea} ha ({topos} topos)</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10.0"
            step="0.5"
            value={currentArea}
            onChange={(e) => handleAreaChange(parseFloat(e.target.value))}
            className="w-full accent-[#7BB63E] bg-zinc-200 rounded-lg h-2 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0.5 ha</span>
            <span>3.5 ha (Estándar)</span>
            <span>10.0 ha</span>
          </div>
        </div>
      )}

      {/* 3. LAYER TOGGLE SWITCHES UNDER MAP (Exact styling from Frame 003) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Toggle 1: SMAP humedad */}
          <button
            type="button"
            onClick={handleToggleSmap}
            className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-full border text-xs font-bold transition cursor-pointer shadow-2xs ${
              layerSmap
                ? 'bg-emerald-50/70 border-emerald-300 text-[#132A1C]'
                : 'bg-white border-[#E5ECE2] text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Droplets className={`w-3.5 h-3.5 shrink-0 ${layerSmap ? 'text-emerald-700' : 'text-zinc-400'}`} />
              <span className="truncate">SMAP humedad</span>
            </div>
            {/* iOS/Android style toggle slider */}
            <div
              className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                layerSmap ? 'bg-[#7BB63E]' : 'bg-zinc-200'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                  layerSmap ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Toggle 2: NDVI vegetación */}
          <button
            type="button"
            onClick={handleToggleNdvi}
            className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-full border text-xs font-bold transition cursor-pointer shadow-2xs ${
              layerNdvi
                ? 'bg-emerald-50/70 border-emerald-300 text-[#132A1C]'
                : 'bg-white border-[#E5ECE2] text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Leaf className={`w-3.5 h-3.5 shrink-0 ${layerNdvi ? 'text-emerald-700' : 'text-zinc-400'}`} />
              <span className="truncate">NDVI vegetación</span>
            </div>
            <div
              className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                layerNdvi ? 'bg-[#7BB63E]' : 'bg-zinc-200'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                  layerNdvi ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Toggle 3: Calor y sequía */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleToggleDrought}
            className={`w-1/2 flex items-center justify-between px-3.5 py-2 rounded-full border text-xs font-bold transition cursor-pointer shadow-2xs ${
              layerDrought
                ? 'bg-amber-50/70 border-amber-300 text-[#132A1C]'
                : 'bg-white border-[#E5ECE2] text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sun className={`w-3.5 h-3.5 shrink-0 ${layerDrought ? 'text-amber-600' : 'text-zinc-400'}`} />
              <span className="truncate">Calor y sequía</span>
            </div>
            <div
              className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                layerDrought ? 'bg-amber-400' : 'bg-zinc-200'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                  layerDrought ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 4. SELECTED PARCEL CARD (PARCELA SELECCIONADA · Andén 03 - Frame 004) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] space-y-4">
        {/* Header row: PARCELA SELECCIONADA + Name + Chevron button */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
              PARCELA SELECCIONADA · Andén 03
            </span>
            <h2 className="text-xl font-semibold text-[#132A1C] mt-0.5">
              {profile.previousCropName || 'Papa Huayro'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              playBubblePop();
              if (onOpenWizard) onOpenWizard();
            }}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition cursor-pointer"
            title="Ver diagnóstico completo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Summary Stats with vertical divider lines */}
        <div className="grid grid-cols-3 divide-x divide-[#E5ECE2] border-t border-b border-[#E5ECE2] py-3 text-center">
          <div className="px-1">
            <span className="text-[10px] font-semibold text-zinc-500 block">Área total</span>
            <span className="text-sm font-semibold text-[#132A1C] mt-0.5 block">
              {currentArea} ha
            </span>
          </div>
          <div className="px-1">
            <span className="text-[10px] font-semibold text-zinc-500 block">Edad cultivo</span>
            <span className="text-sm font-semibold text-[#132A1C] mt-0.5 block">
              45 días
            </span>
          </div>
          <div className="px-1">
            <span className="text-[10px] font-semibold text-zinc-500 block">Rendimiento est.</span>
            <span className="text-sm font-semibold text-[#132A1C] mt-0.5 block">
              {Math.max(4, Math.round(currentArea * 3.4))} t
            </span>
          </div>
        </div>

        {/* 2x2 Grid of 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Metric 1: Humedad suelo */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Droplets className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block">Humedad suelo</span>
            <span className="text-xl font-semibold text-[#132A1C] block leading-none">
              35%
            </span>
            <span className="text-[9.5px] text-zinc-400 block font-mono">SMAP</span>
          </div>

          {/* Metric 2: Salud planta */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block">Salud planta</span>
            <span className="text-xl font-semibold text-[#132A1C] block leading-none">
              78%
            </span>
            <span className="text-[9.5px] text-zinc-400 block font-mono">NDVI</span>
          </div>

          {/* Metric 3: Calidad suelo */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Layers className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block">Calidad suelo</span>
            <span className="text-xl font-semibold text-[#132A1C] block leading-none">
              75%
            </span>
            <span className="text-[9.5px] text-zinc-400 block font-mono">Muestreo local</span>
          </div>

          {/* Metric 4: Riesgo erosión */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <AlertTriangle className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block">Riesgo erosión</span>
            <span className="text-xl font-semibold text-[#132A1C] block leading-none">
              15%
            </span>
            <span className="text-[9.5px] text-zinc-400 block font-mono">Bajo</span>
          </div>
        </div>

        {/* Card Footer: Location + "Evaluar suelo ->" */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center gap-1 text-zinc-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Comunidad {profile.distrito || 'Urubamba'}</span>
          </div>

          {onOpenWizard && (
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onOpenWizard();
              }}
              className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition"
            >
              <span>Evaluar suelo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footnote */}
      <div className="text-[10px] text-zinc-500 font-medium leading-relaxed px-1">
        Capas indicativas combinando SMAP, NDVI y observación de campo. Última pasada satelital: hoy 06:20.
      </div>
    </div>
  );
}
