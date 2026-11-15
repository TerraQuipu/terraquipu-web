'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Map,
  Plus,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  X,
  Compass,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';

export type AppScreen =
  | 'inicio'
  | 'parcelas'
  | 'diagnostico'
  | 'rotacion'
  | 'copiloto'
  | 'ajustes'
  | 'noticias';

interface FloatingNavFABProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export default function FloatingNavFAB({
  currentScreen,
  onNavigate,
}: FloatingNavFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const navItems = [
    {
      id: 'inicio' as AppScreen,
      label: 'Inicio',
      description: 'Reporte de campo y clima',
      icon: <Home className="w-5 h-5" />,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'parcelas' as AppScreen,
      label: 'Mis Parcelas',
      description: 'Visor satelital y polígono QGIS',
      icon: <Map className="w-5 h-5" />,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'diagnostico' as AppScreen,
      label: 'Diagnóstico de Suelo',
      description: 'Prueba rápida de humedad y textura',
      icon: <Plus className="w-5 h-5 text-white" />,
      color: 'text-white bg-[#7BB63E] border-lime-500 shadow-sm',
      isPrimary: true,
    },
    {
      id: 'rotacion' as AppScreen,
      label: 'Rotación de Cultivos',
      description: 'Plan de 3 campañas y nitrógeno',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'copiloto' as AppScreen,
      label: 'Copiloto Andino',
      description: 'Diálogo con Astro y Kipu',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      id: 'ajustes' as AppScreen,
      label: 'Ajustes y Hardware',
      description: 'Telemetría TQ-HW-C249 y GPS',
      icon: <SlidersHorizontal className="w-5 h-5" />,
      color: 'text-zinc-700 bg-zinc-100 border-zinc-200',
    },
  ];

  const handleSelect = (screen: AppScreen) => {
    if (screen === 'diagnostico') {
      playSuccessFanfare();
    } else {
      playBubblePop();
    }
    onNavigate(screen);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-5 z-50 select-none">
      {/* Floating Menu Popover */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-2 w-72 bg-white/95 backdrop-blur-md rounded-3xl p-3 shadow-2xl border border-[#E5ECE2] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-[#E5ECE2] flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/70">
              Navegación TerraQuipu
            </span>
            <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              Andes 2026
            </span>
          </div>

          <div className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50/80 border border-emerald-300 shadow-2xs font-bold'
                      : 'hover:bg-zinc-50 border border-transparent font-medium'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#132A1C] truncate">
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 block truncate">
                      {item.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => {
          playBubblePop();
          setIsOpen(!isOpen);
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-emerald-950/20 border transition-all transform active:scale-90 cursor-pointer ${
          isOpen
            ? 'bg-[#132A1C] text-white border-emerald-600 rotate-90'
            : 'bg-[#1B3B22] hover:bg-[#132A1C] text-white border-emerald-500/40'
        }`}
        title={isOpen ? 'Cerrar menú' : 'Abrir navegación rápida'}
        aria-label="Abrir navegación rápida"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Compass className="w-6 h-6 text-[#A3E635]" />
        )}
      </button>
    </div>
  );
}
