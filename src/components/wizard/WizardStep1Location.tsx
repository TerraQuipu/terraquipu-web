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
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
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
        className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 border-2 border-sky-600 border-b-4 border-b-sky-700 active:border-b-2 active:translate-y-0.5 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
      >
        <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
        <span className="contrast-bold-white">
          {gpsLoading ? 'Detectando satélites GPS...' : 'Detectar con mi GPS actual'}
        </span>
      </button>

      {gpsStatus && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 font-medium flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
          <span>{gpsStatus}</span>
        </div>
      )}

      {gpsError && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
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
              className={`w-full p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-sky-600 border-b-sky-700 bg-sky-50/80 text-sky-950 ring-2 ring-sky-500/20 active:border-b-2 active:translate-y-0.5'
                  : 'border-slate-200 border-b-slate-300 bg-white hover:border-slate-300 hover:bg-slate-50/60 active:border-b-2 active:translate-y-0.5 text-slate-800'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-slate-950">{c.nombre}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {c.elevacion_media_msnm} msnm • Distrito {c.distrito}, {c.provincia}
                </div>
              </div>
              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-sky-700 flex-shrink-0" />
              ) : (
                <MapPin className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
