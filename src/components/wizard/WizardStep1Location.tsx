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
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
          ¿Dónde se ubica tu parcela?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Astro conectará los radares satelitales a tus coordenadas:
        </p>
      </div>

      <button
        onClick={onGPSDetect}
        type="button"
        disabled={gpsLoading}
        className="w-full py-3.5 px-4 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
      >
        <Navigation className={`w-4 h-4 transform rotate-45 ${gpsLoading ? 'animate-spin' : ''}`} />
        <span>
          {gpsLoading ? 'Detectando satélites GPS...' : 'Detectar con mi GPS actual'}
        </span>
      </button>

      {gpsStatus && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-mono flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
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
                  ? 'border-2 border-[#0284C7] bg-sky-50/50 text-slate-900 shadow-sm ring-1 ring-sky-300/40'
                  : 'border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700 shadow-2xs'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-slate-900">{c.nombre}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {c.elevacion_media_msnm} msnm • Distrito {c.distrito}, {c.provincia}
                </div>
              </div>
              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-[#0284C7] flex-shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
