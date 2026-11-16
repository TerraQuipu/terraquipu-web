'use client';

import React, { useEffect, useState } from 'react';
import { Globe, MapPin, Plus, RotateCw, Sprout } from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import { getStoredLanguage } from '@/lib/deviceProfile';
import { getTranslation, SupportedLanguage } from '@/lib/translations';

export type MainTab = 'inicio' | 'parcelas' | 'diagnostico' | 'rotacion' | 'copiloto';

interface BottomNavProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onOpenDiagnostic: () => void;
  onOpenQgisDrawer?: () => void;
  lang?: SupportedLanguage;
}

export default function BottomNav({
  activeTab,
  onSelectTab,
  onOpenDiagnostic,
  onOpenQgisDrawer,
  lang: propLang,
}: BottomNavProps) {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(propLang || 'en');

  useEffect(() => {
    if (propLang) {
      setCurrentLang(propLang);
      return;
    }
    const updateLang = () => {
      setCurrentLang(getStoredLanguage() as SupportedLanguage);
    };
    updateLang();
    window.addEventListener('languageChange', updateLang);
    return () => window.removeEventListener('languageChange', updateLang);
  }, [propLang]);

  const t = getTranslation(currentLang).app;

  return (
    <nav className="fixed bottom-3 left-3 right-3 max-w-md mx-auto z-40 bg-[#132A1C] rounded-full px-3 py-1.5 shadow-2xl border border-emerald-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Tab 1: Dashboard */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('inicio');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'inicio'
              ? 'text-[#A3E635] font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 font-normal'
          }`}
          aria-label={t.dashboard}
        >
          <Globe className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{t.dashboard}</span>
          {activeTab === 'inicio' && (
            <span className="w-1 h-1 rounded-full bg-[#A3E635] mt-0.5 shadow-sm shadow-[#A3E635]" />
          )}
        </button>

        {/* Tab 2: Parcels */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('parcelas');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'parcelas'
              ? 'text-[#A3E635] font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 font-normal'
          }`}
          aria-label={t.parcels}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{t.parcels}</span>
          {activeTab === 'parcelas' && (
            <span className="w-1 h-1 rounded-full bg-[#A3E635] mt-0.5 shadow-sm shadow-[#A3E635]" />
          )}
        </button>

        {/* Tab 3: Central FAB Button (+) -> Full-Screen QGIS Satellite Viewer */}
        <div className="flex flex-col items-center justify-center -translate-y-1.5 px-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              playSuccessFanfare();
              if (onOpenQgisDrawer) {
                onOpenQgisDrawer();
              } else {
                onOpenDiagnostic();
              }
            }}
            className={`w-11 h-11 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] flex items-center justify-center shadow-lg shadow-lime-600/40 transition transform active:scale-90 cursor-pointer ${
              activeTab === 'diagnostico'
                ? 'ring-4 ring-[#A3E635]/60 scale-105'
                : 'ring-2 ring-emerald-900/60'
            }`}
            title={t.addParcel}
            aria-label={t.addParcel}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: Crop Schedule & Savings */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('rotacion');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'rotacion'
              ? 'text-[#A3E635] font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 font-normal'
          }`}
          aria-label={t.rotation}
        >
          <RotateCw className="w-5 h-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight text-center leading-tight">{t.rotation}</span>
          {activeTab === 'rotacion' && (
            <span className="w-1 h-1 rounded-full bg-[#A3E635] mt-0.5 shadow-sm shadow-[#A3E635]" />
          )}
        </button>

        {/* Tab 5: Copilot */}
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onSelectTab('copiloto');
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
            activeTab === 'copiloto'
              ? 'text-[#A3E635] font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 font-normal'
          }`}
          aria-label={t.copilot}
        >
          <Sprout className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{t.copilot}</span>
          {activeTab === 'copiloto' && (
            <span className="w-1 h-1 rounded-full bg-[#A3E635] mt-0.5 shadow-sm shadow-[#A3E635]" />
          )}
        </button>
      </div>
    </nav>
  );
}
