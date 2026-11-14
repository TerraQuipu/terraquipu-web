'use client';

import React from 'react';
import InteractiveParcelSelectorMap from '../InteractiveParcelSelectorMap';

interface WizardStep2MapProps {
  initialLat: number;
  initialLon: number;
  areaHa: number;
  onChange: (data: { areaHa: number; lat: number; lon: number; locationName?: string }) => void;
}

export default function WizardStep2Map({
  initialLat,
  initialLon,
  areaHa,
  onChange,
}: WizardStep2MapProps) {
  return (
    <div className="space-y-3 animate-in fade-in flex-1">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
          ¿Dónde y de qué tamaño es tu parcela?
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Busca tu zona en el mapa satelital HD y ajusta el área de tu lote:
        </p>
      </div>

      <InteractiveParcelSelectorMap
        initialLat={initialLat}
        initialLon={initialLon}
        initialAreaHa={areaHa}
        onChange={onChange}
      />
    </div>
  );
}
