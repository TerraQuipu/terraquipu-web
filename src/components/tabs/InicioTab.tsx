'use client';

import React from 'react';
import { ClimaNasa, FarmerProfile } from '@/lib/types';
import { Tractor } from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import KipuCarouselBanner from '@/components/KipuCarouselBanner';

interface InicioTabProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  smapPercent: number;
  hardwareId: string;
  isElNino: boolean;
  onOpenWizard: () => void;
  onNavigateToClima: () => void;
  onNavigateToChacra: () => void;
  onOpenNews: () => void;
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
  onOpenNews,
}: InicioTabProps) {
  const currentArea = profile.areaHa !== undefined ? profile.areaHa : 1.0;

  return (
    <div className="space-y-4 animate-in fade-in pb-12">
      {/* Encabezado Principal */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <h1 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            <span>🌿 TerraQuipu Móvil</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Copiloto andino satelital para la conservación de suelos frente a El Niño
          </p>
        </div>
        <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
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
            TU CHACRA CALIBRADA
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
          className="px-3.5 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs shadow-sm flex items-center gap-1.5 active:scale-95 transition cursor-pointer shrink-0"
        >
          <Tractor className="w-4 h-4 text-emerald-700" />
          <span>Entrar a Mi Chacra</span>
        </button>
      </div>

      {/* 3. Chip Banner: 3 Boletines ENOS & INIA disponibles */}
      <div className="flex justify-center pt-1 pb-1">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onOpenNews();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-amber-300 text-xs font-bold text-slate-700 active:scale-95 transition cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>3 Boletines ENOS &amp; INIA disponibles</span>
          <span className="text-slate-400 font-normal">↗</span>
        </button>
      </div>
    </div>
  );
}
