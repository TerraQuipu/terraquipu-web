'use client';

import React from 'react';
import { FarmerProfile, ClimaNasa } from '@/lib/types';
import { RotateCcw } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import TypewriterText from './TypewriterText';

interface KipuCarouselBannerProps {
  profile: FarmerProfile;
  climaNasa?: ClimaNasa | null;
  smapPercent: number;
  hardwareId?: string;
  isElNino?: boolean;
  onOpenWizard: () => void;
  onNavigateToClima?: () => void;
  onNavigateToChacra?: () => void;
}

export default function KipuCarouselBanner({
  profile,
  smapPercent,
  onOpenWizard,
}: KipuCarouselBannerProps) {
  const areaHa = profile.areaHa || 1.0;
  const topos = (areaHa * 3.3).toFixed(1);

  return (
    <div className="relative select-none animate-in fade-in duration-300">
      {/* KIPU Y SU GLOBO DE TEXTO (SOLO KIPU EN SU SECCIÓN) */}
      <div className="flex items-center gap-3.5 pt-1 pb-1 min-h-[155px]">
        {/* Llama Avatar Libre con sombra ambiental */}
        <div className="w-28 sm:w-32 h-36 sm:h-40 shrink-0 relative flex items-center justify-center">
          <img
            src="/images/kipu_llama.png"
            alt="Kipu Copiloto"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Globo de Diálogo Dark Forest Glassmorphism apuntando a Kipu */}
        <div className="flex-1 relative bg-[#132A1C]/80 border border-emerald-500/40 rounded-3xl p-3.5 shadow-xl backdrop-blur-md text-slate-100">
          <div className="absolute top-7 -left-2.5 w-4 h-4 bg-[#132A1C] border-b border-l border-emerald-500/40 transform rotate-45"></div>

          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-black text-xs text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <span>KIPU COPILOTO</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onOpenWizard();
              }}
              className="text-[10px] font-bold text-emerald-300 hover:text-emerald-100 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1 active:scale-95 transition cursor-pointer"
              title="Recalibrar datos con el asistente"
            >
              <RotateCcw className="w-2.5 h-2.5 text-emerald-400" />
              <span>Recalibrar</span>
            </button>
          </div>

          <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
            <TypewriterText
              key={`${profile.parcelName}-${smapPercent}`}
              text={`¡Allillanchu! Parcela de ${areaHa} ha (${topos} topos) en ${profile.distrito} (${profile.altitude} msnm). Suelo ${profile.moistureLabel.toLowerCase()} con calibración satelital activa.`}
              speed={16}
            />
          </p>
        </div>
      </div>
    </div>
  );
}
