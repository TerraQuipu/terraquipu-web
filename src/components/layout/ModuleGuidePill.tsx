'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  X,
  Compass,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ModuleGuidePillProps {
  onStartTour?: () => void;
}

export default function ModuleGuidePill({ onStartTour }: ModuleGuidePillProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 rounded-full bg-zinc-950/90 hover:bg-black text-white text-xs font-semibold shadow-lg hover:shadow-xl border border-zinc-700/80 flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 group cursor-pointer"
        title="System Architecture Guide"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Compass className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
        <span className="tracking-tight">System Architecture</span>
      </button>

      {/* Slide-over Explanatory Popover */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 sm:w-96 bg-white border border-zinc-300 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 text-zinc-900 z-50">
          {/* Header */}
          <div className="p-3.5 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-xs">
                🌾
              </div>
              <div>
                <h4 className="font-bold text-xs tracking-tight text-white leading-tight">
                  TerraQuipu System Architecture
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Target users and module capabilities
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              title="Close guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Module Cards */}
          <div className="p-3 space-y-2.5 max-h-[75vh] overflow-y-auto text-xs">
            {onStartTour && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onStartTour();
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <span>🌾</span>
                <span>Start Guided Tool Walkthrough</span>
              </button>
            )}

            {/* 1. Territorial GIS & Agroclimatic Viewer */}
            <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 transition space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🗺️</span>
                  <span className="font-bold text-xs text-zinc-950">1. Territorial GIS &amp; Agroclimatic Viewer</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  Public Web
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                <strong>Target Audience:</strong> Agricultural extensionists, agronomic technicians, and farmers.
                <br />
                <strong>Capabilities:</strong> Delineates any Andean parcel, calculates exact surface area (ha), queries live NASA microwave radars (SMAP 0-5 cm soil moisture, Sentinel-2 NDVI, SRTM slopes), and computes an optimal 3-campaign succession.
              </p>
              <div className="pt-1 flex justify-end">
                <Link
                  href="/visor"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
                >
                  <span>Open Technical Viewer</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 2. Admin Console */}
            <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 transition space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🏛️</span>
                  <span className="font-bold text-xs text-zinc-950">2. Administrator Console</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900">
                  Restricted
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                <strong>Target Audience:</strong> Agrarian agencies, INIA researchers, and system coordinators.
                <br />
                <strong>Capabilities:</strong> Calibrates rules and crops in Supabase with rollback capabilities, monitors farmer ground-truth reports (weevil/frost), tracks NASA pipelines, and manages the RAG agronomic library.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>Access:</span>
                <span className="font-semibold text-zinc-700 bg-zinc-200/80 px-1.5 py-0.5 rounded">
                  Direct URL /admin
                </span>
              </div>
            </div>

            {/* 3. Mobile Field Companion App */}
            <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 transition space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📱</span>
                  <span className="font-bold text-xs text-zinc-950">3. Mobile Field Companion App</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-900">
                  Android APK / PWA
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                <strong>Target Audience:</strong> Smallholder farmers directly on smartphones in the field.
                <br />
                <strong>Capabilities:</strong> Packaged as a native application connected to Supabase and NASA streams. Ultra-accessible tactile interface, voice-assisted guidance, and in-situ ground-truth reporting.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-sky-800 font-mono">
                <span>Deployment:</span>
                <span className="font-bold bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300">
                  Native Android / Web App
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-2.5 bg-zinc-50 border-t border-zinc-200 text-[10px] text-zinc-500 font-sans flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Engineered for in-situ field operations</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-600 hover:text-zinc-950 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
