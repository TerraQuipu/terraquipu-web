'use client';

import React from 'react';
import { Globe, MapPin, Plus, RotateCw, Sprout } from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';

export type MainTab = 'inicio' | 'parcelas' | 'diagnostico' | 'rotacion' | 'copiloto';

interface BottomNavProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenDiagnostic: () => void;
}

export default function BottomNav({
  activeTab,
  onSelectTab,
  onOpenDiagnostic,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-3 left-3 right-3 max-w-md mx-auto z-40 bg-[#132A1C] rounded-full px-3 py-1.5 shadow-2xl border border-emerald-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Tab 1: Inicio */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('inicio');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'inicio'
              ? 'text-[#A3E635] font-black'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
          aria-label="Pestaña Inicio"
        >
          <Globe className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Inicio</span>
          {activeTab === 'inicio' && (
            <span className="w-1 h-1 rounded-full bg-[#A3E635] mt-0.5 shadow-sm shadow-[#A3E635]" />
          )}
        </button>

        {/* Tab 2: Parcelas */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('parcelas');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'parcelas'
              ? 'text-[#A3E635] font-black'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
          aria-label="Pestaña Parcelas"
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Parcelas</span>
          {activeTab === 'parcelas' && (
            <span className="w-1 h-1 rounded-full bg-[#A3E635] mt-0.5 shadow-sm shadow-[#A3E635]" />
          )}
        </button>

        {/* Tab 3: Central FAB Button (+) -> Diagnóstico de Suelo */}
        <div className="flex flex-col items-center justify-center -translate-y-1.5 px-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSuccessFanfare();
              onOpenDiagnostic();
            }}
            className={`w-11 h-11 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] flex items-center justify-center shadow-lg shadow-lime-600/40 transition transform active:scale-90 cursor-pointer ${
              activeTab === 'diagnostico'
                ? 'ring-4 ring-[#A3E635]/60 scale-105'
                : 'ring-2 ring-emerald-900/60'
            }`}
            title="Diagnóstico rápido de suelo"
            aria-label="Abrir diagnóstico rápido de suelo"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Tab 4: Rotación */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('rotacion');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'rotacion'
              ? 'text-[#A3E635] font-black'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
          aria-label="Pestaña Rotación"
        >
          <RotateCw className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Rotación</span>
          {activeTab === 'rotacion' && (
            <span className="w-1 h-1 rounded-full bg-[#A3E635] mt-0.5 shadow-sm shadow-[#A3E635]" />
          )}
        </button>

        {/* Tab 5: Copiloto */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('copiloto');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'copiloto'
              ? 'text-[#A3E635] font-black'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
          aria-label="Pestaña Copiloto"
        >
          <Sprout className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Copiloto</span>
          {activeTab === 'copiloto' && (
            <span className="w-1 h-1 rounded-full bg-[#A3E635] mt-0.5 shadow-sm shadow-[#A3E635]" />
          )}
        </button>
      </div>
    </nav>
  );
}
