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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 px-3 py-1.5 shadow-lg">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto items-end">
        {/* Tab 1: Inicio */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('inicio');
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition cursor-pointer ${
            activeTab === 'inicio'
              ? 'text-emerald-950 bg-emerald-100 border-2 border-emerald-500 border-b-4 border-b-emerald-600 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">Inicio</span>
        </button>

        {/* Tab 2: Clima */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('elnino');
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition cursor-pointer ${
            activeTab === 'elnino'
              ? 'text-amber-950 bg-amber-100 border-2 border-amber-500 border-b-4 border-b-amber-600 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CloudSun className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">Clima</span>
        </button>

        {/* Tab 3: MI CHACRA (CENTRAL RESALTADO CON EL TRACTOR) */}
        <div className="flex flex-col items-center justify-center -translate-y-3">
          <button
            type="button"
            onClick={() => {
              playSuccessFanfare();
              onSelectTab('chacra');
            }}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all transform active:scale-95 cursor-pointer ${
              activeTab === 'chacra'
                ? 'bg-emerald-700 text-white ring-4 ring-emerald-500/30 scale-105'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="Mi Chacra y Parcela"
          >
            <Tractor className="w-7 h-7 filter drop-shadow-xs" />
          </button>
          <span
            className={`text-[11px] mt-0.5 font-extrabold ${
              activeTab === 'chacra' ? 'text-emerald-800 font-black' : 'text-slate-600'
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
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition cursor-pointer ${
            activeTab === 'tierra'
              ? 'text-emerald-950 bg-emerald-100 border-2 border-emerald-500 border-b-4 border-b-emerald-600 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sprout className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">Suelo</span>
        </button>

        {/* Tab 5: Ajustes */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('ajustes');
          }}
          className={`flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition cursor-pointer ${
            activeTab === 'ajustes'
              ? 'text-slate-950 bg-slate-200 border-2 border-slate-400 border-b-4 border-b-slate-500 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-bold">Ajustes</span>
        </button>
      </div>
    </nav>
  );
}
