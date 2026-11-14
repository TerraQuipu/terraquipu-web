'use client';

import React from 'react';
import { Cultivo, FarmerProfile } from '@/lib/types';
import { RotateCcw } from 'lucide-react';
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
}: ChacraTabProps) {
  const currentArea = profile.areaHa !== undefined ? profile.areaHa : 1.0;
  const topos = (currentArea * 3.3).toFixed(1);

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
          onClick={() => {
            playBubblePop();
            onRecalibrate();
          }}
          className="text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl border border-emerald-300 transition cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3 text-emerald-700" />
          <span>Recalibrar</span>
        </button>
      </div>

      {/* 1. Tarjeta Ficha Técnica con los Datos del Formulario */}
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
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            {currentArea} ha • ≈ {topos} topos
          </span>
        </div>

        {/* Grid de Respuestas del Formulario */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-bold">Ubicación y Relieve:</span>
            <span className="font-extrabold text-slate-900 block mt-0.5">
              {profile.distrito}, {profile.provincia}
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              {profile.altitude} msnm • {profile.slope}% pend.
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-bold">Última Cosecha:</span>
            <span className="font-extrabold text-slate-900 block mt-0.5">
              {profile.previousCropName}
            </span>
            <span className="text-[10px] text-amber-700 font-bold">
              {profile.previousCropId.includes('papa') ? '-70 kg N extraído' : '+75 kg N fijado'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-bold">Prioridad Familiar:</span>
            <span className="font-extrabold text-emerald-950 block mt-0.5">
              {profile.priorityName}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-bold">Prueba del Puño:</span>
            <span className="font-extrabold text-slate-900 block mt-0.5">
              {profile.soilTexture === 'franca' ? 'Franca (Mullida)' : profile.soilTexture === 'arena' ? 'Arenosa' : 'Arcillosa'}
            </span>
            <span className="text-[10px] text-slate-600">
              {profile.soilStoniness === 'profundo' ? 'Suelo profundo' : 'Pedregoso'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-bold">Fuente de Agua:</span>
            <span className="font-extrabold text-slate-900 block mt-0.5">
              {profile.waterSource === 'secano' ? 'Solo Lluvia (Secano)' : profile.waterSource === 'auxilio' ? 'Canal de Auxilio' : 'Riego Permanente'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-bold">Cobertura Lote:</span>
            <span className="font-extrabold text-slate-900 block mt-0.5">
              {profile.cropCoverNdvi === 'sembrado' ? 'Cultivo en pie' : profile.cropCoverNdvi === 'barbecho' ? 'Rastrojo de descanso' : 'Pasto / Cobertura'}
            </span>
          </div>
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
