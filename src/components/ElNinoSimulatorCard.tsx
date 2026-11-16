'use client';

import React from 'react';
import {
  AlertTriangle,
  Droplets,
  Sun,
  Bug,
  ShieldAlert,
  Sparkles,
  Thermometer,
  CloudRain,
  Sprout,
  TrendingDown,
  Gauge,
  Compass,
  Waves,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Flame,
  Zap,
} from 'lucide-react';
import { playBubblePop, playQuestionChime } from '@/lib/soundEffects';

interface ElNinoSimulatorCardProps {
  isElNino: boolean;
  onToggleElNino: (val: boolean) => void;
  onToast: (msg: string) => void;
}

export default function ElNinoSimulatorCard({
  isElNino,
  onToggleElNino,
  onToast,
}: ElNinoSimulatorCardProps) {
  const handleToggle = () => {
    playBubblePop();
    const nextVal = !isElNino;
    onToggleElNino(nextVal);
    setTimeout(() => {
      playQuestionChime();
    }, 120);
    onToast(nextVal ? '⚠️ ENSO Drought Mode active' : '☀️ Baseline Season Mode active');
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Tarjeta Simulador El Niño */}
      <div className="bg-white rounded-3xl border-2 border-amber-400 border-b-4 border-b-amber-500 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </span>
              <div>
                <h3 className="font-extrabold text-base text-slate-950">
                  ENSO Drought &amp; Highland Anomaly Simulator
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  ENSO Modeling + NASA SMAP L4 Radiometer Telemetry
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Evaluate root-zone hydric stress and parcel vulnerability under severe precipitation deficit.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs transition border-2 border-b-4 active:border-b-2 active:translate-y-0.5 flex items-center gap-1.5 cursor-pointer ${
              isElNino
                ? 'bg-amber-600 hover:bg-amber-700 border-amber-700 border-b-amber-800 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 border-slate-300 border-b-slate-400 text-slate-800 shadow-xs'
            }`}
          >
            {isElNino ? (
              <>
                <Flame className="w-4 h-4 text-amber-200" />
                <span className="contrast-bold-white">Drought Active</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="font-bold">Simulate Drought</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Indicadores Clave con Iconos */}
        <div className="grid grid-cols-2 gap-2 text-left">
          {/* Precipitación */}
          <div
            className={`p-3 rounded-xl border-2 transition ${
              isElNino
                ? 'border-red-500 bg-red-50/70'
                : 'border-emerald-600 bg-emerald-50/70'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                <span>Precipitation</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {isElNino ? '-24%' : 'Normal'}
              </span>
            </div>
            <div className={`text-xl font-bold mt-1 ${isElNino ? 'text-red-700' : 'text-emerald-800'}`}>
              {isElNino ? '510 mm' : '680 mm'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isElNino ? 'Critical deficit -170 mm' : 'Optimal seasonal rainfall'}
            </div>
          </div>

          {/* Temperatura */}
          <div
            className={`p-3 rounded-xl border-2 transition ${
              isElNino
                ? 'border-amber-500 bg-amber-50/70'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-red-600" />
                <span>Thermal Anomaly</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-800">
                {isElNino ? '+1.8°C' : '±0.0°C'}
              </span>
            </div>
            <div className={`text-xl font-bold mt-1 ${isElNino ? 'text-amber-800' : 'text-slate-800'}`}>
              {isElNino ? '14.4 °C' : '12.6 °C'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isElNino ? 'Accelerated heat accumulation' : 'Valley thermal baseline'}
            </div>
          </div>

          {/* Humedad SMAP */}
          <div
            className={`p-3 rounded-xl border-2 transition ${
              isElNino
                ? 'border-red-400 bg-red-50/50'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-600" />
                <span>SMAP Moisture</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-700">NASA L4</span>
            </div>
            <div className={`text-xl font-bold mt-1 ${isElNino ? 'text-red-600' : 'text-blue-700'}`}>
              {isElNino ? '11.8%' : '35.4%'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isElNino ? 'Desiccated root zone during bulking' : 'Stable edaphic moisture profile'}
            </div>
          </div>

          {/* Radiación UV */}
          <div className="p-3 rounded-xl border-2 border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Solar Radiation</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">MJ/m²</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {isElNino ? '24.8' : '19.2'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isElNino ? 'High evapotranspirative loss' : 'Moderate solar irradiance'}
            </div>
          </div>
        </div>

        {/* Recomendación de Emergencia con Iconos */}
        {isElNino ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>INIA Agronomic Contingency Strategy:</span>
            </div>
            <p className="text-slate-800 leading-relaxed text-[11px]">
              Severe drought reduces Native Potato tuber yield by up to <strong>60%</strong> in rainfed systems lacking micro-sprinklers.
              The immediate deterministic strategy is planting <strong>Tarwi (Lupinus mutabilis)</strong> or <strong>Pasankalla Quinoa</strong>, whose deep taproots extract subsoil moisture down to 1.8 m with only 320 mm seasonal rain.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <div className="p-2 bg-white rounded-lg border border-amber-200 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900">Tarwi Altiplano</strong>
                  <span className="text-slate-500">Fixes +95 kg N₂ / 350 mm</span>
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-amber-200 flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900">Black Quinoa</strong>
                  <span className="text-slate-500">High salinity &amp; drought resilience</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex items-center gap-2 text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Optimal baseline conditions: Balanced crop rotation of Native Potato with symbiotic Andean legumes.</span>
          </div>
        )}
      </div>

      {/* Semáforo de Plagas Andinas con Iconos Enriquecidos */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-slate-950">
              Andean Phytosanitary Pest Hazard Index
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
            INIA Cusco Agroecology Models
          </span>
        </div>

        {/* Gorgojo */}
        <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-red-950">
              <span className="p-1 bg-red-100 rounded text-red-700">🪲</span>
              <div>
                <span className="text-sm font-bold block leading-tight">Andean Potato Weevil</span>
                <span className="text-[10px] italic text-red-700 font-normal">(Premnotrypes vorax / suturicallus)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-700 text-white">
              {isElNino ? 'CRITICAL HAZARD' : 'HIGH HAZARD'}
            </span>
          </div>
          <p className="text-red-950 text-[11px] leading-relaxed">
            {isElNino
              ? 'In warm desiccated soils (>15°C), weevil larvae hatch 20 days earlier. Monoculture potato planting precipitates up to 75% tuber loss.'
              : 'The weevil overwinters in crop residue from previous seasons. Rotating with non-host legumes is mandatory to break the reproductive cycle.'}
          </p>
          <div className="p-2 bg-white/90 rounded-lg border border-red-200 flex items-center gap-2 text-[11px] text-emerald-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Prescription: Rotate with Tarwi (cuts adult population by 84%) + perimeter trap furrows with wood ash and muña.</span>
          </div>
        </div>

        {/* Rancha */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <span className="p-1 bg-amber-100 rounded text-amber-800">🍂</span>
              <div>
                <span className="text-sm font-bold block leading-tight">Late Blight / Rancha</span>
                <span className="text-[10px] italic text-amber-800 font-normal">(Phytophthora infestans)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
              {isElNino ? 'MODERATE HAZARD' : 'ELEVATED HAZARD'}
            </span>
          </div>
          <p className="text-amber-950 text-[11px] leading-relaxed">
            Aggressive oomycete triggered by RH &gt;85% and prolonged dew. In ENSO events, brief convective showers with daytime heat spark localized microclimatic outbreaks in ravines.
          </p>
          <div className="p-2 bg-white/90 rounded-lg border border-amber-200 flex items-center gap-2 text-[11px] text-slate-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Management: High contour hilling + resilient native cultivars (Amarilis, Huayro, Peruanita).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
