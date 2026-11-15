'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Sparkles, Sprout, User } from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';

export interface SelectedCommunity {
  id: string;
  name: string;
  fullName: string;
  lat: number;
  lon: number;
  altitude: number;
}

export const ONBOARDING_COMMUNITIES: SelectedCommunity[] = [
  { id: 'maras', name: 'Maras', fullName: 'Maras · Valle Sagrado', lat: -13.332, lon: -72.158, altitude: 3380 },
  { id: 'chinchero', name: 'Chinchero', fullName: 'Chinchero · Cusco', lat: -13.393, lon: -72.049, altitude: 3760 },
  { id: 'urubamba', name: 'Urubamba', fullName: 'Valle de Urubamba', lat: -13.305, lon: -72.115, altitude: 2870 },
  { id: 'anta', name: 'Anta', fullName: 'Pampa de Anta', lat: -13.415, lon: -72.235, altitude: 3450 },
  { id: 'ayaviri', name: 'Ayaviri', fullName: 'Melgar · Ayaviri', lat: -14.882, lon: -70.589, altitude: 3910 },
  { id: 'majes', name: 'Majes', fullName: 'Irrigación Majes', lat: -16.325, lon: -72.208, altitude: 1400 },
  { id: 'puno', name: 'Puno', fullName: 'Puno · Titicaca', lat: -15.84, lon: -70.021, altitude: 3812 },
];

interface KipuFarmerWelcomeViewProps {
  onBack: () => void;
  onContinue: (farmerName: string, community: SelectedCommunity) => void;
  onSkip: () => void;
  initialName?: string;
  initialCommunityId?: string;
}

export default function KipuFarmerWelcomeView({
  onBack,
  onContinue,
  onSkip,
  initialName = '',
  initialCommunityId = 'maras',
}: KipuFarmerWelcomeViewProps) {
  const [name, setName] = useState(initialName);
  const [selectedCommunityId, setSelectedCommunityId] = useState(initialCommunityId);

  const selectedCommunity =
    ONBOARDING_COMMUNITIES.find((c) => c.id === selectedCommunityId) || ONBOARDING_COMMUNITIES[0];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    playSuccessFanfare();
    const finalName = name.trim() || 'Miguel';
    onContinue(finalName, selectedCommunity);
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

      {/* Top Header */}
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
          Paso 1 de 2 · Perfil
        </span>

        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSkip();
          }}
          className="text-xs font-medium text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-full bg-white/5 border border-white/10 cursor-pointer"
        >
          Omitir
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 px-5 py-6 max-w-md mx-auto w-full space-y-5 my-auto">
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
              ¡Allillanchu! Soy Kipu, tu copiloto andino. ¿Cuál es tu nombre, hermano agricultor?
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Tu nombre o apodo familiar
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Miguel Quispe"
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#132A1C] border border-white/15 text-white placeholder-zinc-500 text-sm shadow-md focus:outline-hidden focus:border-[#A3E635] transition"
                autoFocus
              />
              <User className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-zinc-400">
              Así te saludará Kipu y personalizará los avisos satelitales en tu chacra.
            </p>
          </div>

          {/* Valley / Community Selector */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">
                ¿En qué valle o comunidad cultivas?
              </label>
              <span className="text-[10px] text-[#A3E635] font-mono">
                {selectedCommunity.altitude} msnm
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {ONBOARDING_COMMUNITIES.map((com) => {
                const isSelected = selectedCommunityId === com.id;
                return (
                  <button
                    key={com.id}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setSelectedCommunityId(com.id);
                    }}
                    className={`p-2.5 rounded-2xl text-left transition cursor-pointer flex items-center justify-between border ${
                      isSelected
                        ? 'bg-[#7BB63E] text-[#132A1C] border-[#A3E635] shadow-md font-semibold'
                        : 'bg-[#132A1C]/80 text-zinc-300 border-white/10 hover:bg-[#132A1C]'
                    }`}
                  >
                    <div className="min-w-0 pr-1">
                      <div className="text-xs truncate font-medium">{com.name}</div>
                      <div
                        className={`text-[9.5px] truncate ${
                          isSelected ? 'text-[#132A1C]/80' : 'text-zinc-400'
                        }`}
                      >
                        {com.altitude} msnm
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#132A1C] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      {/* Bottom Action Footer */}
      <div className="relative z-10 px-5 pb-8 pt-3 max-w-md mx-auto w-full space-y-2">
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="w-full py-3.5 px-5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-semibold text-sm shadow-xl shadow-lime-600/30 transition active:scale-95 cursor-pointer flex items-center justify-between"
        >
          <span>Continuar a Delimitar Mi Chacra</span>
          <ArrowRight className="w-4 h-4 text-[#132A1C]" />
        </button>

        <p className="text-center text-[10.5px] text-zinc-400 font-normal">
          Luego podrás marcar libremente el contorno de tu parcela en el mapa satelital.
        </p>
      </div>
    </div>
  );
}
