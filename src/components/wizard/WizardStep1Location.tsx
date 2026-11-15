'use client';

import React from 'react';
import { Microcuenca } from '@/lib/types';
import { Navigation, CheckCircle2, MapPin, AlertCircle } from 'lucide-react';

interface WizardStep1LocationProps {
  microcuencas: Microcuenca[];
  selectedCuencaId: string;
  onSelectCuenca: (id: string) => void;
  onGPSDetect: () => void;
  gpsLoading: boolean;
  gpsStatus: string | null;
  gpsError: string | null;
}

export default function WizardStep1Location({
  microcuencas,
  selectedCuencaId,
  onSelectCuenca,
  onGPSDetect,
  gpsLoading,
  gpsStatus,
  gpsError,
}: WizardStep1LocationProps) {
  return (
    <div className="space-y-3 animate-in fade-in flex-1">
      <div>
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
          ¿Dónde se ubica tu parcela?
        </h2>
        <p className="text-xs text-emerald-400/80 mt-0.5">
          Astro conectará los radares satelitales a tus coordenadas:
        </p>
      </div>

      <button
        onClick={onGPSDetect}
        type="button"
        disabled={gpsLoading}
        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer border border-cyan-400/40"
      >
        <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
        <span>
          {gpsLoading ? 'Detectando satélites GPS...' : 'Detectar con mi GPS actual'}
        </span>
      </button>

      {gpsStatus && (
        <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-200 font-mono flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      )}

      <div className="space-y-2 pt-1">
        {microcuencas.map((c) => {
          const isSelected = selectedCuencaId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectCuenca(c.id)}
              className={`w-full p-3.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-2 border-cyan-400 bg-cyan-950/90 text-white shadow-xl shadow-cyan-950/50 ring-2 ring-cyan-500/30'
                  : 'border border-emerald-500/25 bg-[#132A1C]/70 hover:bg-[#183925]/90 hover:border-emerald-500/50 text-slate-200'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-white">{c.nombre}</div>
                <div className="text-xs text-emerald-300/80 mt-0.5">
                  {c.elevacion_media_msnm} msnm • Distrito {c.distrito}, {c.provincia}
                </div>
              </div>
              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-emerald-500/40 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
