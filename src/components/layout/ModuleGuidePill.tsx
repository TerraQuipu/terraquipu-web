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

export default function ModuleGuidePill() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Floating Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 rounded-full bg-zinc-950/90 hover:bg-black text-white text-xs font-semibold shadow-lg hover:shadow-xl border border-zinc-700/80 flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 group"
        title="¿Qué hace cada módulo? Guía rápida"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <Compass className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
        <span className="tracking-tight">Guía del Sistema</span>
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
                  Arquitectura Terraquipu
                </h4>
                <p className="text-[10px] text-zinc-400">
                  ¿Para quién es y qué hace cada parte?
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Cerrar guía"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Module Cards */}
          <div className="p-3 space-y-2.5 max-h-[75vh] overflow-y-auto text-xs">
            {/* 1. Visor Técnico de Campo */}
            <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 transition space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🗺️</span>
                  <span className="font-bold text-xs text-zinc-950">1. Visor Técnico Territorial</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                  Público Web
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                <strong>¿Quién lo usa?</strong> Extensionistas, técnicos agrícolas y campesinos.
                <br />
                <strong>¿Qué hace?</strong> Permite trazar cualquier parcela andina en el mapa, calcula su área exacta (ha), consulta en vivo radares NASA (humedad SMAP, NDVI, pendiente) y genera la secuencia óptima de 3 campañas agrícolas.
              </p>
              <div className="pt-1 flex justify-end">
                <Link
                  href="/visor"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
                >
                  <span>Ver Visor Técnico</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 2. Consola Admin */}
            <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 transition space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🏛️</span>
                  <span className="font-bold text-xs text-zinc-950">2. Consola Administrador</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900">
                  Protegido
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                <strong>¿Quién lo usa?</strong> Agencias Agrarias, INIA y coordinadores del sistema.
                <br />
                <strong>¿Qué hace?</strong> Calibra las reglas y cultivos en Supabase con opción de Rollback (deshacer errores), monitorea reportes de campesinos (gorgojo/helada), pipelines NASA y biblioteca RAG de manuales.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>Acceso restringido:</span>
                <span className="font-semibold text-zinc-700 bg-zinc-200/80 px-1.5 py-0.5 rounded">
                  URL directo /admin
                </span>
              </div>
            </div>

            {/* 3. App Móvil Nativa (APK) */}
            <div className="p-2.5 rounded-xl border border-zinc-200 bg-zinc-50/70 hover:bg-zinc-100/70 transition space-y-1.5 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📱</span>
                  <span className="font-bold text-xs text-zinc-950">3. App Móvil APK del Campesino</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-900">
                  APK Android
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                <strong>¿Quién lo usa?</strong> Agricultores familiares en su teléfono en la chacra.
                <br />
                <strong>¿Cómo funciona?</strong> Empaquetada como aplicación APK nativa conectada a la nube Supabase. Interfaz táctil ultra-simple asistida por voz en quechua/español, calendario lunar y reporte rápido de plagas.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-sky-800 font-mono">
                <span>Enmascarada como:</span>
                <span className="font-bold bg-sky-100 px-1.5 py-0.5 rounded border border-sky-300">
                  App Nativa Android
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="p-2.5 bg-zinc-50 border-t border-zinc-200 text-[10px] text-zinc-500 font-sans flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Diseñado para uso intuitivo en campo</span>
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-600 hover:text-zinc-950 font-bold"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
