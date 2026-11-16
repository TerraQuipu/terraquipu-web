'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft, Globe } from 'lucide-react';
import { getStoredLanguage, saveStoredLanguage } from '@/lib/deviceProfile';
import { getTranslation, SupportedLanguage } from '@/lib/translations';

interface TopHeaderProps {
  onSync: () => void;
  isSyncing: boolean;
  dbStatus: 'connected' | 'syncing' | 'offline';
  onStartTour?: () => void;
}

export default function TopHeader({ onSync, isSyncing, dbStatus, onStartTour }: TopHeaderProps) {
  const [lang, setLang] = useState<SupportedLanguage>('es');

  useEffect(() => {
    setLang(getStoredLanguage() as SupportedLanguage);
    const handle = () => setLang(getStoredLanguage() as SupportedLanguage);
    window.addEventListener('languageChange', handle);
    return () => window.removeEventListener('languageChange', handle);
  }, []);

  const toggleLanguage = () => {
    const nextLang: SupportedLanguage = lang === 'es' ? 'qu' : 'es';
    saveStoredLanguage(nextLang);
    setLang(nextLang);
  };

  const t = getTranslation(lang).visor;

  return (
    <header className="h-14 bg-zinc-950 text-white px-4 sm:px-6 flex items-center justify-between border-b border-zinc-800 flex-shrink-0 z-40 shadow-xs">
      {/* Brand & Location (clickable back to landing page) */}
      <Link
        id="tour-brand"
        href="/"
        className="flex items-center gap-3 hover:opacity-90 transition group"
        title="Volver a la página principal de Terraquipu"
      >
        <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs brand-logo group-hover:border-zinc-500 transition">
          TQ
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white uppercase group-hover:text-emerald-400 transition">
              Terraquipu
            </span>
            <span className="text-[10px] font-semibold tracking-wide uppercase bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
              NASA Space Apps
            </span>
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded hidden sm:inline-block">
              /visor
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            {t.subtitle}
          </p>
        </div>
      </Link>

      {/* Right Controls: Telemetry, Language, Sync Supabase & Return to Landing */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Telemetry Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              dbStatus === 'connected'
                ? 'bg-emerald-500 animate-pulse'
                : dbStatus === 'syncing'
                ? 'bg-amber-400 animate-spin'
                : 'bg-red-400'
            }`}
          />
          <span className="font-mono text-[11px] text-zinc-300">PostGIS + NASA SMAP L4</span>
        </div>

        {/* Language Switcher Pill */}
        <button
          onClick={toggleLanguage}
          className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs border border-zinc-700 shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          title={lang === 'qu' ? 'Castellano simiman tikray' : 'Cambiar a Runasimi (Quechua)'}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-[11px]">{lang === 'qu' ? 'Runasimi (QU)' : 'Castellano (ES)'}</span>
        </button>

        {/* Farmer Tour Guide Button */}
        <button
          id="tour-start-btn"
          onClick={onStartTour}
          className="px-2.5 py-1.5 rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white font-semibold text-xs border border-emerald-700/80 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          title={lang === 'qu' ? 'Visor yanapaq puriyta qallariy' : 'Iniciar paseo explicativo de las herramientas del visor'}
        >
          <span className="text-sm">🌾</span>
          <span className="hidden sm:inline">{t.guidedTour}</span>
        </button>

        {/* Sync Supabase Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs border border-zinc-700 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden sm:inline">{lang === 'qu' ? 'Sincronizay' : 'Sincronizar'}</span>
        </button>

        {/* Link back to Main Web */}
        <Link
          href="/"
          className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs border border-zinc-700 shadow-xs flex items-center gap-1.5 transition"
          title="Return to Main Web (terraquipu.com)"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">{lang === 'qu' ? 'Web Qallariy' : 'Web Principal'}</span>
        </Link>
      </div>
    </header>
  );
}
