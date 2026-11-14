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
    onToast(nextVal ? '⚠️ Modo Sequía El Niño activado' : '☀️ Modo Año Normal activado');
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
                  Simulador El Niño / Sequía Andina
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">
                  Modelado ENOS + Sensores NASA SMAP L4
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Evalúa el estrés hídrico y la respuesta de tus parcelas ante un déficit severo de lluvias.
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
                <span className="contrast-bold-white">Sequía Activa</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="font-bold">Simular Sequía</span>
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
                <span>Precipitación</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {isElNino ? '-24%' : 'Normal'}
              </span>
            </div>
            <div className={`text-xl font-bold mt-1 ${isElNino ? 'text-red-700' : 'text-emerald-800'}`}>
              {isElNino ? '510 mm' : '680 mm'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isElNino ? 'Déficit crítico -170 mm' : 'Lluvia estacional óptima'}
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
                <span>Anomalía Térmica</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-800">
                {isElNino ? '+1.8°C' : '±0.0°C'}
              </span>
            </div>
            <div className={`text-xl font-bold mt-1 ${isElNino ? 'text-amber-800' : 'text-slate-800'}`}>
              {isElNino ? '14.4 °C' : '12.6 °C'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isElNino ? 'Bochorno diurno acelerado' : 'Promedio térmico valle'}
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
                <span>Humedad SMAP</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-blue-700">NASA L4</span>
            </div>
            <div className={`text-xl font-bold mt-1 ${isElNino ? 'text-red-600' : 'text-blue-700'}`}>
              {isElNino ? '11.8%' : '35.4%'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isElNino ? 'Suelo seco en tuberización' : 'Humedad edáfica estable'}
            </div>
          </div>

          {/* Radiación UV */}
          <div className="p-3 rounded-xl border-2 border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Radiación Solar</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">MJ/m²</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {isElNino ? '24.8' : '19.2'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {isElNino ? 'Alta evapotranspiración' : 'Índice solar moderado'}
            </div>
          </div>
        </div>

        {/* Recomendación de Emergencia con Iconos */}
        {isElNino ? (
          <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Estrategia de Salvación Agronómica INIA:</span>
            </div>
            <p className="text-slate-800 leading-relaxed text-[11px]">
              La sequía reduce el rendimiento de la papa nativa hasta en <strong>60%</strong> si no cuenta con riego por aspersión.
              La recomendación determinista inmediata es sembrar <strong>Tarwi (Lupinus mutabilis)</strong> o <strong>Quinua Pasankalla</strong>, cuyas raíces pivotantes extraen humedad hasta 1.8 metros de profundidad con tan solo 320 mm de lluvia.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[10px]">
              <div className="p-2 bg-white rounded-lg border border-amber-200 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900">Tarwi Altiplano</strong>
                  <span className="text-slate-500">Fija +95 kg N₂ / 350 mm</span>
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-amber-200 flex items-center gap-2">
                <Waves className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <div>
                  <strong className="block text-slate-900">Quinua Negra</strong>
                  <span className="text-slate-500">Resistente a salinidad</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex items-center gap-2 text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Condiciones normales: Rotación balanceada de Papa Nativa con leguminosas andinas.</span>
          </div>
        )}
      </div>

      {/* Semáforo de Plagas Andinas con Iconos Enriquecidos */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-slate-950">
              Semáforo de Plagas Andinas
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
            Modelado INIA Cusco
          </span>
        </div>

        {/* Gorgojo */}
        <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-red-950">
              <span className="p-1 bg-red-100 rounded text-red-700">🪲</span>
              <div>
                <span className="text-sm font-bold block leading-tight">Gorgojo de los Andes</span>
                <span className="text-[10px] italic text-red-700 font-normal">(Premnotrypes vorax / suturicallus)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-700 text-white">
              {isElNino ? 'RIESGO CRÍTICO' : 'RIESGO ALTO'}
            </span>
          </div>
          <p className="text-red-950 text-[11px] leading-relaxed">
            {isElNino
              ? 'Con suelo seco y temperaturas mayores a 15°C, las larvas eclosionan 20 días antes. Sembrar papa continua causará pérdidas de hasta 75% en tubérculos.'
              : 'El gorgojo sobrevive en rastrojos de campañas pasadas. Es mandatorio cortar el ciclo sembrando leguminosas.'}
          </p>
          <div className="p-2 bg-white/90 rounded-lg border border-red-200 flex items-center gap-2 text-[11px] text-emerald-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Solución: Rotar con Tarwi (reduce 84% de adultos) + zanjas trampa con ceniza y muña.</span>
          </div>
        </div>

        {/* Rancha */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <span className="p-1 bg-amber-100 rounded text-amber-800">🍂</span>
              <div>
                <span className="text-sm font-bold block leading-tight">Rancha / Tizón Tardío</span>
                <span className="text-[10px] italic text-amber-800 font-normal">(Phytophthora infestans)</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
              {isElNino ? 'RIESGO MODERADO' : 'RIESGO ELEVADO'}
            </span>
          </div>
          <p className="text-amber-950 text-[11px] leading-relaxed">
            Hongo agresivo detonado por humedad &gt;85% y rocío prolongado. En El Niño, las lloviznas cortas con bochorno provocan focos repentinos en quebradas.
          </p>
          <div className="p-2 bg-white/90 rounded-lg border border-amber-200 flex items-center gap-2 text-[11px] text-slate-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>Manejo: Aporque alto + variedades nativas tolerantes (Amarilis, Huayro, Peruanita).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
