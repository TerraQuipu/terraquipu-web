'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft } from 'lucide-react';

interface TopHeaderProps {
  onSync: () => void;
  isSyncing: boolean;
  dbStatus: 'connected' | 'syncing' | 'offline';
}

export default function TopHeader({ onSync, isSyncing, dbStatus }: TopHeaderProps) {
  return (
    <header className="h-14 bg-zinc-950 text-white px-4 sm:px-6 flex items-center justify-between border-b border-zinc-800 flex-shrink-0 z-40 shadow-xs">
      {/* Brand & Location (clickable back to landing page) */}
      <Link
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
            Chinchero, Urubamba • 3,754 m s. n. m.
          </p>
        </div>
      </Link>

      {/* Right Controls: Telemetry, Sync Supabase & Return to Landing */}
      <div className="flex items-center gap-2.5">
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

        {/* Sync Supabase Button */}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs border border-zinc-700 shadow-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
          <span className="hidden sm:inline">Sync Supabase</span>
        </button>

        {/* Link back to Main Web */}
        <Link
          href="/"
          className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs border border-zinc-700 shadow-xs flex items-center gap-1.5 transition"
          title="Regresar a la Web Principal (terraquipu.com)"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Web Principal</span>
        </Link>
      </div>
    </header>
  );
}
