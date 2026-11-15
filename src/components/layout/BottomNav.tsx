'use client';

import React from 'react';
import { Home, CloudSun, Tractor, Sprout, Settings } from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';

interface BottomNavProps {
  activeTab: 'inicio' | 'elnino' | 'chacra' | 'tierra' | 'saberes' | 'ajustes';
  onSelectTab: (tab: 'inicio' | 'elnino' | 'chacra' | 'tierra' | 'saberes' | 'ajustes') => void;
}

export default function BottomNav({ activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-3 left-3 right-3 max-w-md mx-auto z-40 glass-pill rounded-3xl px-2 py-1.5 shadow-2xl border border-emerald-500/25">
      <div className="grid grid-cols-5 gap-1 items-center">
        {/* Tab 1: Inicio */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('inicio');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'inicio'
              ? 'text-emerald-300 bg-emerald-950/60 font-black shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Inicio</span>
          {activeTab === 'inicio' && (
            <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 glow-emerald" />
          )}
        </button>

        {/* Tab 2: Clima */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('elnino');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'elnino'
              ? 'text-amber-300 bg-amber-950/50 font-black shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <CloudSun className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Clima</span>
          {activeTab === 'elnino' && (
            <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* Tab 3: MI CHACRA (CENTRAL ELEVADO CON TRACTOR) */}
        <div className="flex flex-col items-center justify-center -translate-y-3.5">
          <button
            type="button"
            onClick={() => {
              playSuccessFanfare();
              onSelectTab('chacra');
            }}
            className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 cursor-pointer ${
              activeTab === 'chacra'
                ? 'bg-gradient-to-tr from-emerald-500 to-lime-400 text-zinc-950 ring-4 ring-emerald-400/30 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.55)]'
                : 'bg-emerald-700/90 hover:bg-emerald-600 text-white border border-emerald-400/40 shadow-lg'
            }`}
            title="Mi Chacra y Parcela"
          >
            <Tractor className="w-6 h-6 filter drop-shadow-xs" />
          </button>
          <span
            className={`text-[10px] mt-0.5 font-extrabold ${
              activeTab === 'chacra' ? 'text-emerald-300 font-black' : 'text-zinc-400'
            }`}
          >
            Mi Chacra
          </span>
        </div>

        {/* Tab 4: Suelo */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('tierra');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'tierra'
              ? 'text-emerald-300 bg-emerald-950/60 font-black shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sprout className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Suelo</span>
          {activeTab === 'tierra' && (
            <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5 glow-emerald" />
          )}
        </button>

        {/* Tab 5: Ajustes */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('ajustes');
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'ajustes'
              ? 'text-zinc-100 bg-zinc-800/80 font-black shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Ajustes</span>
          {activeTab === 'ajustes' && (
            <span className="w-1 h-1 rounded-full bg-zinc-300 mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
}
