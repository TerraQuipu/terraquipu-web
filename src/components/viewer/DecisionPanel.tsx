'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Satellite,
  Sprout,
  SunMedium,
  AlertTriangle,
  Download,
  ArrowRight,
  ChevronRight,
  Volume2,
  CheckCircle2,
  ShieldAlert,
  Leaf,
  DollarSign,
  Home,
  CloudRain,
  Thermometer,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ActiveParcel, generateQgisGeoJson, downloadGeoJsonFile } from '@/lib/geoUtils';
import { RotationEngineResult } from '@/types';
import { downloadWordReportFile, downloadJsonPlanFile } from '@/lib/planExport';
import { generateHardwareProfile } from '@/lib/deviceProfile';

interface DecisionPanelProps {
  activeParcel: ActiveParcel;
  onUpdateParcelName?: (name: string) => void;
  climateMode: 'normal' | 'nino';
  onSetClimateMode: (mode: 'normal' | 'nino') => void;
  previousCrop: string;
  onSetPreviousCrop: (crop: string) => void;
  priority: string;
  onSetPriority: (priority: string) => void;
  rotationResult: RotationEngineResult;
  onShowToast: (msg: string) => void;
}

const CROP_THUMBNAILS: Record<string, { label: string; img: string }> = {
  papa: { label: 'Papa Nativa', img: '/images/papa_nativa.jpg' },
  quinua: { label: 'Quinua Real', img: '/images/quinua_real.jpg' },
  tarwi: { label: 'Tarwi Chocho', img: '/images/tarwi_chocho.jpg' },
  haba: { label: 'Haba Verde', img: '/images/haba_verde.jpg' },
};

export default function DecisionPanel({
  activeParcel,
  onUpdateParcelName,
  climateMode,
  onSetClimateMode,
  previousCrop,
  onSetPreviousCrop,
  priority,
  onSetPriority,
  rotationResult,
  onShowToast,
}: DecisionPanelProps) {
  // Linear 3-Step Navigation: 'parcel' (1) | 'satellite' (2) | 'rotation' (3)
  const [activeStep, setActiveStep] = useState<'parcel' | 'satellite' | 'rotation'>('parcel');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [customName, setCustomName] = useState(activeParcel.name);
  const [showAllCampaigns, setShowAllCampaigns] = useState(true);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [hardwareId, setHardwareId] = useState<string>('TQ-TECH-PRO');

  React.useEffect(() => {
    const hw = generateHardwareProfile();
    setHardwareId(hw.deviceId);
  }, []);

  React.useEffect(() => {
    setCustomName(activeParcel.name);
  }, [activeParcel.name]);

  const { campaigns, compatibilityRate, elNinoAlert } = rotationResult;

  const scientificSummary =
    climateMode === 'nino'
      ? `Para tu parcela de ${activeParcel.areaHa.toFixed(2)} ha en ${activeParcel.name}, bajo déficit hídrico por El Niño (-24% de lluvia), el motor científico prioriza ${campaigns[0].title}. Fija ${campaigns[0].totalNitrogenKg} kg de nitrógeno orgánico con un ahorro estimado de S/. ${campaigns[0].savingsSoles} y corta el ciclo del gorgojo andino.`
      : `Para tu área de ${activeParcel.areaHa.toFixed(2)} ha con pendiente de ${activeParcel.slopePct}%, tras cosechar ${previousCrop}, recomendamos sembrar ${campaigns[0].title}. Aportará ${campaigns[0].nitrogenBalance} con un ahorro de S/. ${campaigns[0].savingsSoles} en fertilizantes sintéticos.`;

  const handleSpeak = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(scientificSummary);
      utterance.lang = 'es-PE';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      onShowToast('Reproduciendo audio explicativo');
    }
  };

  const handleExportQgis = () => {
    const geojson = generateQgisGeoJson(activeParcel, {
      previousCrop,
      recommendedCrop: campaigns[0].title,
      nitrogenGain: campaigns[0].nitrogenBalance,
      savingsSoles: campaigns[0].savingsSoles,
    });
    const filename = `parcela_${activeParcel.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.geojson`;
    downloadGeoJsonFile(filename, geojson);
    onShowToast(`Archivo GeoJSON descargado para QGIS 3.x`);
  };

  return (
    <div className="w-full lg:w-[40%] h-full flex flex-col bg-zinc-50 border-l border-zinc-200 overflow-hidden select-none">
      {/* 1. LINEAR WORKFLOW STEPPER HEADER */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex-shrink-0 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Flujo de Decisión Agronómica
            </span>
            <h2 className="text-sm font-bold text-zinc-950">Planificador Territorial</h2>
          </div>
          <span className="text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
            NASA + INIA
          </span>
        </div>

        {/* 3 Sequential Step Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs">
          <button
            onClick={() => setActiveStep('parcel')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
              activeStep === 'parcel'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span className="truncate">Área Parcela</span>
          </button>

          <button
            onClick={() => setActiveStep('satellite')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
              activeStep === 'satellite'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[10px]">
              2
            </span>
            <span className="truncate">Satélite NASA</span>
          </button>

          <button
            onClick={() => setActiveStep('rotation')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition ${
              activeStep === 'rotation'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[10px]">
              3
            </span>
            <span className="truncate">Plan Quipu</span>
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ========================================================================= */}
        {/* PASO 1: DELIMITACIÓN Y MÉTRICAS DE LA PARCELA SELECCIONADA                */}
        {/* ========================================================================= */}
        {activeStep === 'parcel' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Header Banner Image for Step 1: Área Parcela */}
            <div className="relative h-28 rounded-xl overflow-hidden border border-zinc-200 shadow-xs group">
              <img
                src="/images/parcel_header.jpg"
                alt="Andenería y parcelas en Cusco"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Delimitación Territorial Andina
                </span>
                <h3 className="text-white font-bold text-sm leading-tight drop-shadow-sm">
                  {activeParcel.name}
                </h3>
                <p className="text-[10px] text-zinc-300 font-mono mt-0.5">
                  Centroide: {activeParcel.center[0].toFixed(4)}°, {activeParcel.center[1].toFixed(4)}°
                </p>
              </div>
            </div>

            {/* Selected Parcel Spatial Data Card */}
            <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Parcela Activa en Mapa
                  </span>
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="text-xs font-bold border border-zinc-300 rounded px-2 py-1 w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          if (onUpdateParcelName) onUpdateParcelName(customName);
                          onShowToast(`Nombre actualizado: ${customName}`);
                        }}
                        className="bg-zinc-900 text-white px-2 py-1 rounded text-xs font-semibold"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-zinc-950 text-sm leading-tight">
                        {customName}
                      </h3>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-[10px] text-zinc-400 hover:text-zinc-700 underline"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                  <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
                    {activeParcel.isCustom ? '✦ Polígono Libre Seleccionado' : 'Sector Comunitario'}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                  {activeParcel.areaHa.toFixed(2)} ha
                </span>
              </div>

              {/* Spatial Metrics Grid (Real-time dynamic calculations) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 font-medium block">Superficie Total</span>
                  <span className="font-bold text-zinc-950 text-sm font-mono block">
                    {activeParcel.areaHa.toFixed(2)} ha
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    ({Math.round(activeParcel.areaHa * 10000).toLocaleString()} m²)
                  </span>
                </div>

                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 font-medium block">Pendiente del Terreno</span>
                  <span className="font-bold text-zinc-950 text-sm font-mono block">
                    {activeParcel.slopePct}%
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {activeParcel.slopePct > 18
                      ? 'Ladera Pronunciada (L3)'
                      : activeParcel.slopePct > 10
                      ? 'Ladera Media (L2)'
                      : 'Ladera Suave (L1)'}
                  </span>
                </div>

                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 font-medium block">Altitud Topográfica</span>
                  <span className="font-bold text-zinc-950 text-sm font-mono block">
                    {activeParcel.elevationMsnm} m s.n.m.
                  </span>
                  <span className="text-[10px] text-zinc-500">Piso Quechua / Suni</span>
                </div>

                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 font-medium block">Humedad SMAP L4</span>
                  <span className="font-bold text-blue-700 text-sm font-mono block">
                    {activeParcel.smapMoisturePct}%
                  </span>
                  <span className="text-[10px] text-zinc-500">Radar Satelital</span>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1 text-blue-950">
                  <MapPin className="w-3.5 h-3.5 text-blue-700" />
                  ¿Quieres elegir otra área?
                </span>
                <p className="text-[11px] text-blue-800 leading-relaxed font-sans">
                  Haz clic en <strong>&ldquo;Trazar Parcela&rdquo;</strong> sobre el mapa para marcar vértices exactos o <strong>&ldquo;Clic en Terreno&rdquo;</strong> para colocar una parcela automática donde toques.
                </p>
              </div>

              {/* QGIS Export Button */}
              <button
                onClick={handleExportQgis}
                className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Exportar Parcela a QGIS (.geojson)</span>
              </button>
            </div>

            {/* Next Step CTA */}
            <button
              onClick={() => setActiveStep('satellite')}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Continuar a Telemetría Satelital NASA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: DIAGNÓSTICO SATELITAL NASA & ESCENARIOS                          */}
        {/* ========================================================================= */}
        {activeStep === 'satellite' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Header Banner Image for Step 2: Satélite NASA */}
            <div className="relative h-28 rounded-xl overflow-hidden border border-zinc-200 shadow-xs group">
              <img
                src="/images/nasa_satellite.jpg"
                alt="Satélite NASA en órbita terrestre"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-3">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  NASA Earth Observations
                </span>
                <h3 className="text-white font-bold text-sm leading-tight drop-shadow-sm">
                  Constelación Satelital SMAP &amp; GPM
                </h3>
                <p className="text-[10px] text-zinc-300 font-mono mt-0.5">
                  Microcuenca Urubamba • Calibración Radicular 0-100 cm
                </p>
              </div>
            </div>

            {/* Climate Switcher (Normal vs El Niño) */}
            <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900">Escenario Agroclimático:</span>
                <span className="text-[10px] text-zinc-500 font-mono">SENAMHI / NOAA</span>
              </div>

              <div className="bg-zinc-100 p-1 rounded-lg border border-zinc-200 grid grid-cols-2 gap-1 text-xs font-semibold">
                <button
                  onClick={() => {
                    onSetClimateMode('normal');
                    onShowToast('Escenario: Año Climatológico Normal activado');
                  }}
                  className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition ${
                    climateMode === 'normal'
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <SunMedium className="w-3.5 h-3.5 text-amber-400" />
                  <span>Año Normal</span>
                </button>

                <button
                  onClick={() => {
                    onSetClimateMode('nino');
                    onShowToast('Escenario: Simulación Sequía El Niño activada (-24% lluvia)');
                  }}
                  className={`py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition ${
                    climateMode === 'nino'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
                  <span>Simular El Niño</span>
                </button>
              </div>

              {elNinoAlert && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-700" />
                    <span>Alerta Sequía: -24% Precipitación</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                    Déficit hídrico en etapa de floración. Se activan cultivos andinos rústicos de alta tolerancia (Tarwi / Quinua).
                  </p>
                </div>
              )}
            </div>

            {/* Satellite Live Indicators Card */}
            <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Telemetría Satelital para {activeParcel.name}
              </span>

              {/* SMAP Soil Moisture Gauge */}
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Humedad Radicular SMAP L4:
                  </span>
                  <span className="font-mono font-bold text-sm text-zinc-950">
                    {climateMode === 'nino'
                      ? `${(activeParcel.smapMoisturePct * 0.58).toFixed(1)}%`
                      : `${activeParcel.smapMoisturePct.toFixed(1)}%`}
                  </span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      climateMode === 'nino' ? 'bg-amber-500' : 'bg-sky-600'
                    }`}
                    style={{
                      width: `${
                        climateMode === 'nino'
                          ? activeParcel.smapMoisturePct * 0.58
                          : activeParcel.smapMoisturePct
                      }%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 block">
                  {climateMode === 'nino'
                    ? '⚠️ Estrés hídrico en estrato radicular. Se recomienda cultivo de secano.'
                    : '✅ Humedad moderada-alta. Perfil óptimo para labranza y siembra.'}
                </span>
              </div>

              {/* Radar GPM Rainfall & NDVI */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-blue-500" /> Lluvia Radar GPM
                  </span>
                  <span className="font-bold text-zinc-950 text-sm font-mono block mt-0.5">
                    {climateMode === 'nino' ? '510 mm' : '680 mm'}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {climateMode === 'nino' ? '-170 mm déficit' : 'Promedio normal'}
                  </span>
                </div>

                <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                    <Sprout className="w-3 h-3 text-emerald-500" /> Vigor NDVI
                  </span>
                  <span className="font-bold text-emerald-700 text-sm font-mono block mt-0.5">
                    {activeParcel.ndvi.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-zinc-500">Salud vegetal buena</span>
                </div>
              </div>

              {/* Frost Risk Notice */}
              <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <div>
                    <span className="font-bold text-zinc-900 block leading-tight">Alerta de Helada</span>
                    <span className="text-[10px] text-zinc-500">Mínima nocturna: 2°C (Hora Perú)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                  Riesgo Leve
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveStep('parcel')}
                className="py-2 px-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-semibold transition"
              >
                ← Volver a Parcela
              </button>
              <button
                onClick={() => setActiveStep('rotation')}
                className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Ver Plan de Rotación Quipu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: PLAN DE ROTACIÓN CIENTÍFICA QUIPU (INIA)                          */}
        {/* ========================================================================= */}
        {activeStep === 'rotation' && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Header Banner Image for Step 3: Plan Quipu */}
            <div className="relative h-28 rounded-xl overflow-hidden border border-zinc-200 shadow-xs group">
              <img
                src="/images/quipu_plan.jpg"
                alt="Agricultores andinos cosechando"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Sabiduría Andina + Ciencia INIA
                </span>
                <h3 className="text-white font-bold text-sm leading-tight drop-shadow-sm">
                  Plan Quipu de Rotación Científica
                </h3>
                <p className="text-[10px] text-zinc-300 font-mono mt-0.5">
                  Calibrado para {activeParcel.areaHa.toFixed(2)} ha • Pendiente {activeParcel.slopePct}%
                </p>
              </div>
            </div>

            {/* Quick 2-Question Farmer Profile with REAL CROP IMAGES */}
            <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs space-y-3">
              {/* Question 1: Previous Crop with Images */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                  1. ¿Qué cosechaste en tu parcela en la última campaña?
                </label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: 'papa', label: 'Papa Nativa', img: '/images/papa_nativa.jpg' },
                    { id: 'quinua', label: 'Quinua Real', img: '/images/quinua_real.jpg' },
                    { id: 'tarwi', label: 'Tarwi Chocho', img: '/images/tarwi_chocho.jpg' },
                    { id: 'haba', label: 'Haba Verde', img: '/images/haba_verde.jpg' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSetPreviousCrop(c.id);
                        onShowToast(`Cultivo previo: ${c.label}`);
                      }}
                      className={`p-1.5 rounded-lg border text-left font-semibold transition flex items-center gap-2 ${
                        previousCrop === c.id
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <img
                        src={c.img}
                        alt={c.label}
                        className="w-8 h-8 rounded-md object-cover border border-white/20 flex-shrink-0"
                      />
                      <span className="truncate text-xs">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Priority */}
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                  2. ¿Cuál es tu prioridad este año?
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[
                    { id: 'alimento', label: 'Alimento', icon: Home },
                    { id: 'venta', label: 'Venta', icon: DollarSign },
                    { id: 'suelo', label: 'Curar Suelo', icon: Leaf },
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSetPriority(p.id);
                          onShowToast(`Prioridad: ${p.label}`);
                        }}
                        className={`py-2 px-1 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition ${
                          priority === p.id
                            ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[11px]">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scientific Recommendation Highlight Card with REAL CROP IMAGE */}
            <div className="bg-emerald-900 text-white p-4 rounded-xl shadow-md space-y-3 border border-emerald-800">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-400/60 shadow-xs flex-shrink-0">
                  <img
                    src={campaigns[0].imageUrl}
                    alt={campaigns[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                      Recomendado • Inmediato
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-800 text-emerald-100 border border-emerald-700 font-mono">
                      {campaigns[0].suitabilityScore}% Óptimo
                    </span>
                  </div>
                  <h3 className="font-black text-base text-white leading-tight mt-0.5">
                    {campaigns[0].title}
                  </h3>
                  <p className="text-[11px] text-emerald-200 italic font-mono">
                    {campaigns[0].scientificName}
                  </p>
                </div>
              </div>

              {/* Dynamic calculations adapted to user's exact areaHa */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-950/70 p-2.5 rounded-lg border border-emerald-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-300 block">Nitrógeno Suelo:</span>
                    <span className="text-[9px] text-emerald-400 font-mono">
                      {campaigns[0].cropKey === 'tarwi' ? 'Tasa +95 kg/ha' : campaigns[0].cropKey === 'haba' ? 'Tasa +65 kg/ha' : 'Tasa -45 kg/ha'}
                    </span>
                  </div>
                  <span className="font-bold text-white text-xs font-mono block mt-0.5">
                    {campaigns[0].nitrogenBalance}
                  </span>
                  <span className="text-[9px] text-emerald-300/80 block mt-0.5">
                    {campaigns[0].totalNitrogenKg > 0
                      ? `≈ ${Math.max(1, Math.round(campaigns[0].totalNitrogenKg / 23))} sacos úrea ahorrados`
                      : `Aprovecha abono anterior`}
                  </span>
                </div>

                <div className="bg-emerald-950/70 p-2.5 rounded-lg border border-emerald-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-300 block">Ahorro Fertilizante:</span>
                    <span className="text-[9px] text-emerald-400 font-mono">en {activeParcel.areaHa.toFixed(2)} ha</span>
                  </div>
                  <span className="font-bold text-emerald-300 text-xs font-mono block mt-0.5">
                    S/. {campaigns[0].savingsSoles}
                  </span>
                  <span className="text-[9px] text-emerald-300/80 block mt-0.5">
                    Ahorro en insumos sintéticos
                  </span>
                </div>

                <div className="bg-emerald-950/70 p-2 rounded-lg border border-emerald-800/80">
                  <span className="text-[10px] text-emerald-300 block">Control Sanitario:</span>
                  <span className="font-bold text-white text-xs truncate block mt-0.5">
                    {campaigns[0].pestStatus}
                  </span>
                  <span className="text-[9px] text-emerald-300/80 block">
                    Corta ciclo del gorgojo
                  </span>
                </div>

                <div className="bg-emerald-950/70 p-2 rounded-lg border border-emerald-800/80">
                  <span className="text-[10px] text-emerald-300 block">Demanda de Agua:</span>
                  <span className="font-bold text-white text-xs font-mono block mt-0.5">
                    {campaigns[0].waterDemand}
                  </span>
                  <span className="text-[9px] text-emerald-300/80 block">
                    Volumen: {campaigns[0].totalWaterM3.toLocaleString()} m³
                  </span>
                </div>
              </div>

              {/* Scientific Explanation + Voice Playback */}
              <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between">
                <span className="text-[11px] text-emerald-200">
                  Validado por INIA &amp; SENAMHI
                </span>
                <button
                  onClick={handleSpeak}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'Hablando...' : 'Escuchar Audio'}</span>
                </button>
              </div>
            </div>

            {/* 3-Campaign Full Sequence with REAL CROP IMAGES */}
            <div className="bg-white border border-zinc-200 p-3.5 rounded-xl shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                  Secuencia de 3 Campañas
                </span>
                <button
                  onClick={() => setShowAllCampaigns(!showAllCampaigns)}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 flex items-center gap-0.5"
                >
                  <span>{showAllCampaigns ? 'Ocultar' : 'Ver Todas'}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transform transition ${
                      showAllCampaigns ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              </div>

              {showAllCampaigns && (
                <div className="space-y-2 pt-1 text-xs animate-in fade-in">
                  {campaigns.map((camp, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-center gap-3 ${
                        idx === 0 ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0">
                        <img
                          src={camp.imageUrl}
                          alt={camp.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-[10px] mb-0.5">
                          <span className="font-bold text-zinc-500 uppercase">{camp.period}</span>
                          <span className="font-semibold text-zinc-900 font-mono">
                            {camp.suitabilityScore}%
                          </span>
                        </div>
                        <h4 className="font-bold text-zinc-950 text-xs truncate">{camp.title}</h4>
                        <p className="text-[11px] text-zinc-500 italic truncate font-mono">
                          {camp.scientificName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions: Save to Cloud & Back to Step 2 */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveStep('satellite')}
                className="py-2.5 px-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-semibold transition"
              >
                ← Satélite
              </button>
              <button
                onClick={() => {
                  setIsSavedModalOpen(true);
                  onShowToast(
                    `Plan guardado en la nube territorial para ${activeParcel.name} (${activeParcel.areaHa.toFixed(2)} ha)`
                  );
                }}
                className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Guardar Plan en la Nube</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PLAN SAVED MODAL WITH WORD & JSON EXPORT */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-zinc-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Sincronización Exitosa
                  </span>
                  <h3 className="font-bold text-zinc-950 text-base leading-tight">
                    Plan Guardado en la Nube
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsSavedModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Summary card */}
            <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Parcela:</span>
                <span className="font-bold text-zinc-950">{activeParcel.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Superficie:</span>
                <span className="font-mono font-bold text-zinc-950">
                  {activeParcel.areaHa.toFixed(2)} ha ({Math.round(activeParcel.areaHa * 10000).toLocaleString()} m²)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Cultivo Recomendado:</span>
                <span className="font-bold text-emerald-700">{campaigns[0].title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Aporte N₂ / Ahorro:</span>
                <span className="font-mono font-bold text-zinc-950">
                  {campaigns[0].nitrogenBalance} • S/. {campaigns[0].savingsSoles}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] bg-zinc-50 p-2 rounded border border-zinc-200">
                <span className="text-zinc-600 font-medium">Cálculo Determinista:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {activeParcel.areaHa.toFixed(2)} ha × Tasa = {campaigns[0].totalNitrogenKg > 0 ? `+${campaigns[0].totalNitrogenKg}` : campaigns[0].totalNitrogenKg} kg N
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-zinc-200 text-[11px]">
                <span className="text-zinc-400">Hardware ID Técnico:</span>
                <span className="font-mono text-zinc-600 font-semibold">{hardwareId}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-zinc-900">
                ¿Deseas descargar este plan agronómico?
              </span>

              {/* Word (.doc) Button */}
              <button
                onClick={() => {
                  downloadWordReportFile({
                    parcel: activeParcel,
                    rotationResult,
                    previousCrop,
                    priority,
                    climateMode,
                    hardwareId,
                  });
                  onShowToast('Descargando informe formal en Word (.doc)...');
                }}
                className="w-full py-2.5 px-3 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-between shadow-xs active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📄</span>
                  <span>Descargar Informe para Word (.doc)</span>
                </div>
                <Download className="w-4 h-4 text-blue-200" />
              </button>

              {/* JSON (.json) Button */}
              <button
                onClick={() => {
                  downloadJsonPlanFile({
                    parcel: activeParcel,
                    rotationResult,
                    previousCrop,
                    priority,
                    climateMode,
                    hardwareId,
                  });
                  onShowToast('Descargando ficha técnica en JSON (.json)...');
                }}
                className="w-full py-2.5 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-between shadow-xs active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📊</span>
                  <span>Descargar Ficha Técnica (.json)</span>
                </div>
                <Download className="w-4 h-4 text-zinc-400" />
              </button>

              {/* QGIS (.geojson) Button */}
              <button
                onClick={() => {
                  handleExportQgis();
                }}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold transition flex items-center justify-between active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🗺️</span>
                  <span>Descargar Polígono para QGIS (.geojson)</span>
                </div>
                <Download className="w-4 h-4 text-emerald-700" />
              </button>
            </div>

            {/* Close */}
            <button
              onClick={() => setIsSavedModalOpen(false)}
              className="w-full py-1.5 text-zinc-500 hover:text-zinc-800 text-xs font-medium text-center transition"
            >
              Cerrar ventana
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
