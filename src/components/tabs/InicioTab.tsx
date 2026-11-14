'use client';

import React from 'react';
import { ClimaNasa, FarmerProfile } from '@/lib/types';
import { Droplets, Thermometer, Tractor } from 'lucide-react';
import { playSuccessFanfare } from '@/lib/soundEffects';
import KipuCarouselBanner from '@/components/KipuCarouselBanner';
import AgroClimaNewsFeed from '@/components/AgroClimaNewsFeed';

interface InicioTabProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  smapPercent: number;
  hardwareId: string;
  isElNino: boolean;
  onOpenWizard: () => void;
  onNavigateToClima: () => void;
  onNavigateToChacra: () => void;
}

export default function InicioTab({
  profile,
  climaNasa,
  smapPercent,
  hardwareId,
  isElNino,
  onOpenWizard,
  onNavigateToClima,
  onNavigateToChacra,
}: InicioTabProps) {
  const currentArea = profile.areaHa !== undefined ? profile.areaHa : 1.0;

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Encabezado Principal */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <h1 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            <span>🌿 TerraQuipu Móvil</span>
          </h1>
          <p className="text-xs text-slate-500">
            Copiloto andino satelital para la conservación de suelos frente a El Niño
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
          {profile.distrito}
        </span>
      </div>

      {/* 1. Kipu Carousel Banner (Kipu y la burbuja interactivos con slides de rotación y clima) */}
      <KipuCarouselBanner
        profile={profile}
        climaNasa={climaNasa}
        smapPercent={smapPercent}
        hardwareId={hardwareId}
        isElNino={isElNino}
        onOpenWizard={onOpenWizard}
        onNavigateToClima={onNavigateToClima}
      />

      {/* 2. Tarjeta Destacada de Entrada a Mi Chacra */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 block">
            Tu Chacra Calibrada
          </span>
          <div className="font-extrabold text-sm text-white mt-0.5">
            {profile.parcelName} ({currentArea} ha)
          </div>
          <p className="text-[11px] text-emerald-200/90 mt-0.5">
            Cosecha: {profile.previousCropName} • Prioridad: {profile.priorityName}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playSuccessFanfare();
            onNavigateToChacra();
          }}
          className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
        >
          <Tractor className="w-4 h-4 text-emerald-700" />
          <span>Entrar a Mi Chacra</span>
        </button>
      </div>

      {/* 3. Telemetría Rápida de Sensores NASA */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900">
            <Droplets className="w-4 h-4 text-sky-600" />
            <span>Humedad SMAP</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {smapPercent}% <span className="text-xs font-normal text-slate-500">vol</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
            {smapPercent < 20 ? '⚠️ Déficit Hídrico' : '✓ Humedad Adecuada'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Thermometer className="w-4 h-4 text-amber-600" />
            <span>Temperatura</span>
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {climaNasa?.temp_media_c ? `${climaNasa.temp_media_c} °C` : '12.6 °C'}
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-0.5">
            NASA POWER • Cusco
          </div>
        </div>
      </div>

      {/* 4. Noticias y Alertas Agroclimáticas Oficiales */}
      <div className="pt-1">
        <AgroClimaNewsFeed />
      </div>
    </div>
  );
}
