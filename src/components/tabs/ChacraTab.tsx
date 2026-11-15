'use client';

import React from 'react';
import { Cultivo, FarmerProfile } from '@/lib/types';
import { RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
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
  onNavigateToSuelo?: () => void;
}

export default function ChacraTab({
  profile,
  cultivos,
  isElNino,
  hardwareId,
  onToast,
  onRecalibrate,
  onUpdateCrop,
  onUpdatePriority,
  onNavigateToSuelo,
}: ChacraTabProps) {
  const currentArea = profile.areaHa !== undefined ? profile.areaHa : 1.0;
  const topos = (currentArea * 3.3).toFixed(1);

  const handleOpenWizard = () => {
    playBubblePop();
    onRecalibrate();
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Encabezado */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <h1 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            <span>🚜 Mi Chacra &amp; Parcela</span>
          </h1>
          <p className="text-xs text-slate-500">
            Datos de tu terreno, cartografía satelital y rotación científica
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenWizard}
          className="text-xs font-black text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
          title="Actualizar datos de la parcela"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
          <span>Actualizar Parcela</span>
        </button>
      </div>

      {/* Botón Principal Destacado: Actualizar mi Parcela (Cuestionario Paso a Paso tipo Bienvenida) */}
      <button
        type="button"
        onClick={handleOpenWizard}
        className="w-full p-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 border-2 border-emerald-500 border-b-4 border-b-emerald-950 text-white flex items-center justify-between shadow-md active:border-b-2 active:translate-y-0.5 transition cursor-pointer group"
      >
        <div className="flex items-center gap-3.5 text-left">
          <span className="p-2.5 rounded-2xl bg-white/20 text-2xl backdrop-blur-xs flex-shrink-0 shadow-xs">
            🚜
          </span>
          <div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <span>Actualizar mi Parcela</span>
              <span className="text-[10px] bg-emerald-300/30 text-emerald-100 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300/40">
                Paso a Paso
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-0.5 leading-snug">
              Cuestionario interactivo con Kipu para actualizar cultivo, suelo y agua sin scrollear
            </p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition">
          <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </button>

      {/* 1. Tarjeta Ficha Técnica con los Datos Dinámicos del Perfil */}
      <div className="bg-white rounded-3xl border-2 border-emerald-600 border-b-4 border-b-emerald-700 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b pb-2.5 border-emerald-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
              📋
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-slate-950">
                Ficha de Parcela Calibrada
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Hardware: {hardwareId}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenWizard}
            className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1 transition cursor-pointer"
          >
            <span>{currentArea} ha • ≈ {topos} topos</span>
            <span className="text-emerald-700 font-bold">✏️</span>
          </button>
        </div>

        {/* Grid de Datos Catastrales y de Campaña de la Parcela */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div
            onClick={handleOpenWizard}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 border border-slate-200 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold">Ubicación y Relieve:</span>
              <span className="text-[9px] text-slate-400 group-hover:text-emerald-700 font-bold">✏️</span>
            </div>
            <span className="font-extrabold text-slate-900 block mt-0.5">
              {profile.distrito}, {profile.provincia}
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              {profile.altitude} msnm • {profile.slope}% pend.
            </span>
          </div>

          <div
            onClick={handleOpenWizard}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 border border-slate-200 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold">Dimensión de Parcela:</span>
              <span className="text-[9px] text-slate-400 group-hover:text-emerald-700 font-bold">✏️</span>
            </div>
            <span className="font-extrabold text-slate-900 block mt-0.5">
              {currentArea} ha (≈ {topos} topos)
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              GPS: {profile.lat.toFixed(4)}°, {profile.lon.toFixed(4)}°
            </span>
          </div>

          <div
            onClick={handleOpenWizard}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 border border-slate-200 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold">Última Cosecha:</span>
              <span className="text-[9px] text-slate-400 group-hover:text-emerald-700 font-bold">✏️</span>
            </div>
            <span className="font-extrabold text-slate-900 block mt-0.5">
              {profile.previousCropName}
            </span>
            <span className="text-[10px] text-amber-700 font-bold">
              {profile.previousCropId.includes('papa')
                ? '-70 kg N extraído'
                : profile.previousCropId.includes('haba') || profile.previousCropId.includes('tarwi')
                ? '+75 kg N fijado'
                : 'Consumo moderado N'}
            </span>
          </div>

          <div
            onClick={handleOpenWizard}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 border border-slate-200 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold">Objetivo de Campaña:</span>
              <span className="text-[9px] text-slate-400 group-hover:text-emerald-700 font-bold">✏️</span>
            </div>
            <span className="font-extrabold text-emerald-950 block mt-0.5">
              {profile.priorityName}
            </span>
            <span className="text-[10px] text-slate-500">
              {profile.priority === 'tierra'
                ? 'Regenerar fertilidad'
                : profile.priority === 'comida'
                ? 'Autoconsumo'
                : 'Venta en feria'}
            </span>
          </div>
        </div>

        {/* Acceso Rápido al Laboratorio de Suelo (Sin duplicación de preguntas en Mi Chacra) */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 text-lg">
              🌱
            </span>
            <div>
              <span className="text-[11px] font-black text-emerald-950 block">
                Laboratorio Edáfico &amp; Telemetría NASA
              </span>
              <p className="text-[10px] text-slate-600 mt-0.5">
                Prueba del puño, sanidad vegetal y satélite SMAP en la pestaña Suelo
              </p>
            </div>
          </div>
          {onNavigateToSuelo && (
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onNavigateToSuelo();
              }}
              className="text-xs font-black text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95 shrink-0"
            >
              <span>Ir a Suelo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleOpenWizard}
            className="text-[11px] font-black text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 cursor-pointer underline underline-offset-2"
          >
            <span>Toca cualquier dato para abrir el Cuestionario Kipu paso a paso</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Mapa Satelital de la Parcela (ESRI/QGIS HD) */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 border-b-4 border-b-slate-300 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-950">
              {profile.parcelName} ({currentArea} ha)
            </h3>
            <p className="text-xs text-slate-500">
              {profile.distrito} • {profile.lat.toFixed(4)}°, {profile.lon.toFixed(4)}°
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            Satélite QGIS/ESRI
          </span>
        </div>

        <ParcelMap
          lat={profile.lat}
          lon={profile.lon}
          parcelName={`${profile.parcelName} (${currentArea} ha)`}
          altitude={profile.altitude}
          slope={profile.slope}
          areaHa={currentArea}
        />
      </div>

      {/* 3. Ruta Quipu de Rotación Científica */}
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
