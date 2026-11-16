'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, User, MapPin, AlertCircle, Check } from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';

export interface RegionalCommunity {
  id: string;
  name: string;
  distrito: string;
  cuencaName: string;
  lat: number;
  lon: number;
  altitude: number;
}

export const REGIONAL_COMMUNITIES: RegionalCommunity[] = [
  {
    id: 'maras',
    name: 'Maras · Valle Sagrado',
    distrito: 'Maras',
    cuencaName: 'Microcuenca Vilcanota - Maras',
    lat: -13.332,
    lon: -72.158,
    altitude: 3380,
  },
  {
    id: 'chinchero',
    name: 'Chinchero · Cusco',
    distrito: 'Chinchero',
    cuencaName: 'Microcuenca Chinchero - Piuray',
    lat: -13.393,
    lon: -72.049,
    altitude: 3760,
  },
  {
    id: 'urubamba',
    name: 'Valle de Urubamba',
    distrito: 'Urubamba',
    cuencaName: 'Microcuenca Vilcanota - Urubamba',
    lat: -13.305,
    lon: -72.115,
    altitude: 2870,
  },
  {
    id: 'anta',
    name: 'Pampa de Anta',
    distrito: 'Anta',
    cuencaName: 'Microcuenca Anta - Cusco',
    lat: -13.415,
    lon: -72.235,
    altitude: 3450,
  },
  {
    id: 'ayaviri',
    name: 'Melgar · Ayaviri',
    distrito: 'Ayaviri',
    cuencaName: 'Microcuenca Ayaviri - Puno',
    lat: -14.882,
    lon: -70.589,
    altitude: 3910,
  },
  {
    id: 'majes',
    name: 'Irrigación Majes',
    distrito: 'Majes',
    cuencaName: 'Microcuenca Majes - Arequipa',
    lat: -16.325,
    lon: -72.208,
    altitude: 1400,
  },
  {
    id: 'puno',
    name: 'Puno · Titicaca',
    distrito: 'Puno',
    cuencaName: 'Microcuenca Lago Titicaca',
    lat: -15.84,
    lon: -70.021,
    altitude: 3812,
  },
];

interface KipuFarmerWelcomeViewProps {
  onBack: () => void;
  onContinue: (
    farmerName: string,
    community: string,
    regionData?: { lat: number; lon: number; altitude: number; cuencaName: string }
  ) => void;
  initialName?: string;
  initialCommunity?: string;
}

export default function KipuFarmerWelcomeView({
  onBack,
  onContinue,
  initialName = '',
  initialCommunity = '',
}: KipuFarmerWelcomeViewProps) {
  const [name, setName] = useState(initialName);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(() => {
    if (initialCommunity) {
      const match = REGIONAL_COMMUNITIES.find(
        (c) => c.distrito.toLowerCase() === initialCommunity.toLowerCase() || c.id === initialCommunity.toLowerCase()
      );
      if (match) return match.id;
      return 'custom';
    }
    return '';
  });
  const [customCommunity, setCustomCommunity] = useState(() => {
    if (initialCommunity) {
      const match = REGIONAL_COMMUNITIES.find(
        (c) => c.distrito.toLowerCase() === initialCommunity.toLowerCase() || c.id === initialCommunity.toLowerCase()
      );
      return match ? '' : initialCommunity;
    }
    return '';
  });
  const [touched, setTouched] = useState(false);

  const activeSelectedRegion = REGIONAL_COMMUNITIES.find((c) => c.id === selectedCommunityId);
  const effectiveCommunityName =
    selectedCommunityId === 'custom'
      ? customCommunity.trim()
      : activeSelectedRegion?.name || '';

  const isNameValid = name.trim().length >= 2;
  const isCommunityValid = effectiveCommunityName.length >= 2;
  const isFormValid = isNameValid && isCommunityValid;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTouched(true);

    if (!isFormValid) {
      playBubblePop();
      return;
    }

    playSuccessFanfare();
    const finalName = name.trim();
    const regionData = activeSelectedRegion
      ? {
          lat: activeSelectedRegion.lat,
          lon: activeSelectedRegion.lon,
          altitude: activeSelectedRegion.altitude,
          cuencaName: activeSelectedRegion.cuencaName,
        }
      : undefined;

    onContinue(finalName, effectiveCommunityName, regionData);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col justify-between bg-[#0A1A0F] text-white font-sans overflow-y-auto">
      {/* Background Graphic with Subtle Mountain Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url('/images/andes_bright.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1A0F] via-[#0A1A0F]/90 to-[#0A1A0F]" />
      </div>

      {/* Top Header - Sin botón omitir */}
      <div className="relative z-10 px-5 pt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onBack();
          }}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition active:scale-95 cursor-pointer backdrop-blur-md"
          title="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Paso 1 de 2 · Perfil del Agricultor
        </span>

        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full backdrop-blur-md">
          Obligatorio
        </span>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-5 py-6 max-w-md mx-auto w-full space-y-6 my-auto">
        {/* Kipu Llama Mascot Card (Duolingo Style Dialog) */}
        <div className="flex items-start gap-3.5 bg-[#132A1C]/90 rounded-3xl p-4 border border-emerald-500/30 shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 p-1 shrink-0 flex items-center justify-center shadow-md">
            <img
              src="/images/kipu_llama.png"
              alt="Kipu el Copiloto Andino"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#A3E635]">Kipu</span>
              <span className="text-[10px] text-zinc-400">· Copiloto Andino</span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed font-normal">
              ¡Allillanchu! Para calibrar con precisión los satélites en tu chacra, ingresa tu nombre y confirma tu comunidad.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Name Field (Obligatorio) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
              <span>Tu nombre o apodo familiar</span>
              <span className="text-[10.5px] text-emerald-400 font-mono">* Obligatorio</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre (ej. Juan Quispe)"
                className={`w-full h-12 pl-11 pr-4 rounded-2xl bg-[#132A1C] border text-white placeholder-zinc-500 text-sm shadow-md focus:outline-hidden transition ${
                  touched && !isNameValid
                    ? 'border-red-500/80 focus:border-red-400'
                    : 'border-white/15 focus:border-[#A3E635]'
                }`}
                autoFocus
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            {touched && !isNameValid && (
              <p className="text-[11px] text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Por favor ingresa tu nombre para continuar.</span>
              </p>
            )}
          </div>

          {/* 2. Community / Location Selection (Obligatorio) */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
              <span>Tu comunidad, valle o distrito</span>
              <span className="text-[10.5px] text-emerald-400 font-mono">* Obligatorio</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {REGIONAL_COMMUNITIES.map((com) => {
                const isSelected = selectedCommunityId === com.id;
                return (
                  <button
                    key={com.id}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setSelectedCommunityId(com.id);
                    }}
                    className={`p-2.5 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-950 border-[#A3E635] ring-2 ring-[#A3E635]/40 text-white shadow-md'
                        : 'bg-[#132A1C]/80 border-white/15 text-zinc-300 hover:bg-[#132A1C] hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{com.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{com.altitude} msnm</div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-[#7BB63E] text-[#132A1C] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setSelectedCommunityId('custom');
                }}
                className={`p-2.5 rounded-2xl text-left border transition cursor-pointer flex items-center justify-between col-span-2 ${
                  selectedCommunityId === 'custom'
                    ? 'bg-emerald-950 border-[#A3E635] ring-2 ring-[#A3E635]/40 text-white shadow-md'
                    : 'bg-[#132A1C]/80 border-white/15 text-zinc-300 hover:bg-[#132A1C] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#A3E635]" />
                  <span className="text-xs font-semibold">Otra comunidad o sector</span>
                </div>
                {selectedCommunityId === 'custom' && (
                  <div className="w-4 h-4 rounded-full bg-[#7BB63E] text-[#132A1C] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            </div>

            {selectedCommunityId === 'custom' && (
              <div className="pt-1.5 animate-in fade-in">
                <input
                  type="text"
                  value={customCommunity}
                  onChange={(e) => setCustomCommunity(e.target.value)}
                  placeholder="Escribe el nombre de tu comunidad o localidad..."
                  className="w-full h-11 px-3.5 rounded-xl bg-[#132A1C] border border-[#A3E635]/60 text-white placeholder-zinc-500 text-xs focus:outline-hidden focus:border-[#A3E635]"
                  autoFocus
                />
              </div>
            )}

            {touched && !isCommunityValid && (
              <p className="text-[11px] text-red-400 flex items-center gap-1 pt-0.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Por favor selecciona o ingresa tu comunidad para ubicar los satélites.</span>
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 px-5 pb-8 pt-3 max-w-md mx-auto w-full space-y-2">
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={touched && !isFormValid}
          className="w-full py-3.5 px-5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] disabled:opacity-50 text-[#132A1C] font-semibold text-sm shadow-xl shadow-lime-600/30 transition active:scale-95 cursor-pointer flex items-center justify-between"
        >
          <span>Continuar a Delimitar Mi Chacra</span>
          <ArrowRight className="w-4 h-4 text-[#132A1C]" />
        </button>

        <p className="text-center text-[10.5px] text-zinc-400 font-normal">
          El nombre y la comunidad son obligatorios para personalizar los pronósticos NASA in situ.
        </p>
      </div>
    </div>
  );
}
