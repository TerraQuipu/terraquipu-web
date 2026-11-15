'use client';

import React, { useState } from 'react';
import { ClimaNasa, FarmerProfile } from '@/lib/types';
import {
  Tractor,
  MapPin,
  Sun,
  CloudSun,
  CloudRain,
  Droplets,
  Wind,
  Bookmark,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import KipuCarouselBanner from '@/components/KipuCarouselBanner';
import CuatroPilaresBanner from '@/components/CuatroPilaresBanner';

interface InicioTabProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  smapPercent: number;
  hardwareId: string;
  isElNino: boolean;
  onOpenWizard: () => void;
  onNavigateToClima: () => void;
  onNavigateToChacra: () => void;
  onOpenNews: () => void;
}

const CROP_CATEGORIES = [
  'Todos',
  'Papa Nativa',
  'Quinua Real',
  'Tarwi',
  'Maíz Blanco',
  'Habas',
];

interface FieldInsightCard {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  metricLabel: string;
  actionText: string;
  target: 'clima' | 'chacra' | 'wizard';
}

const FIELD_CARDS: FieldInsightCard[] = [
  {
    id: 'potato-harvest',
    category: 'Papa Nativa',
    title: 'Optimizar Cosecha de Papa Nativa',
    description: 'Implementar aporque alto y cobertura orgánica de rastrojo para resistir déficit hídrico.',
    image: '/images/andes_bright.jpg',
    badge: 'Prioridad Campaña',
    metricLabel: '+35% Retención Hídrica',
    actionText: 'Ver Plan Agroambiental',
    target: 'clima',
  },
  {
    id: 'tarwi-rotation',
    category: 'Tarwi',
    title: 'Ruta de 3 Campañas con Tarwi',
    description: 'Fijación biológica de +95 kg de N₂ por hectárea y corte del 84% en ciclo de gorgojo.',
    image: '/images/tarwi_chocho.jpg',
    badge: 'Rotación INIA',
    metricLabel: '-84% Riesgo Plagas',
    actionText: 'Explorar Parcela',
    target: 'chacra',
  },
  {
    id: 'quinua-real',
    category: 'Quinua Real',
    title: 'Monitoreo de Vigor Vegetativo NDVI',
    description: 'La reflectancia espectral Sentinel-2 muestra índice saludable en terrazas andinas.',
    image: '/images/andes_poster.jpg',
    badge: 'Sentinel-2 Órbita',
    metricLabel: 'NDVI 0.68 Óptimo',
    actionText: 'Recalibrar con Kipu',
    target: 'wizard',
  },
];

export default function InicioTab({
  profile,
  climaNasa,
  smapPercent,
  hardwareId,
  isElNino,
  onOpenWizard,
  onNavigateToClima,
  onNavigateToChacra,
  onOpenNews,
}: InicioTabProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [bookmarkedCards, setBookmarkedCards] = useState<Record<string, boolean>>({
    'potato-harvest': true,
  });

  const currentArea = profile.areaHa !== undefined ? profile.areaHa : 1.0;
  const topos = (currentArea * 3.3).toFixed(1);

  const temp = climaNasa?.temp_media_c !== undefined ? climaNasa.temp_media_c : 18.4;
  const rain = climaNasa?.precipitacion_mm !== undefined ? climaNasa.precipitacion_mm : 0;
  const windKmh = (climaNasa as any)?.velocidad_viento_ms !== undefined
    ? Math.round((climaNasa as any).velocidad_viento_ms * 3.6)
    : 13;

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playBubblePop();
    setBookmarkedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCards = selectedCategory === 'Todos'
    ? FIELD_CARDS
    : FIELD_CARDS.filter((c) => c.category === selectedCategory);

  return (
    <div className="space-y-4 animate-in fade-in pb-16 pt-1">
      {/* 0. USER GREETING ROW (SCREEN 2 INSPIRATION) */}
      <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-800 to-teal-950 p-0.5 overflow-hidden shrink-0 shadow-md shadow-emerald-950/60 flex items-center justify-center">
            <img
              src="/images/kipu_llama.png"
              alt="Perfil Kipu"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-emerald-300/80 block leading-tight">
              Allillanchu, {profile.parcelName.replace('Chacra ', '')}
            </span>
            <span className="text-sm font-black text-white block leading-tight truncate">
              ¡Bienvenido de nuevo!
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onOpenNews();
          }}
          className="relative w-9 h-9 rounded-2xl bg-[#132A1C]/90 hover:bg-[#183925] border border-emerald-500/30 flex items-center justify-center text-emerald-300 hover:text-white transition cursor-pointer shadow-md"
          title="Ver Alertas ENOS & Boletines"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        </button>
      </div>

      {/* 1. KIPU COPILOTO & DIALOG BUBBLE (DARK FOREST GLASSMORPHISM) */}
      <KipuCarouselBanner
        profile={profile}
        climaNasa={climaNasa}
        smapPercent={smapPercent}
        hardwareId={hardwareId}
        isElNino={isElNino}
        onOpenWizard={onOpenWizard}
        onNavigateToClima={onNavigateToClima}
        onNavigateToChacra={onNavigateToChacra}
      />

      {/* 2. WEATHER & TELEMETRY HERO CARD (DARK FOREST FROSTED GLASS - SCREEN 2 STYLE) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#132A1C]/90 via-[#0F2418]/85 to-[#0A1A0F]/90 border border-emerald-500/30 p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-4">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Location & Weather Status */}
        <div className="flex items-start justify-between gap-2 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{profile.parcelName} • {profile.distrito}, {profile.departamento || 'Cusco'}</span>
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono block">
              {profile.altitude} msnm • {profile.cuencaName}
            </span>
          </div>

          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              {isElNino ? '⚠️ Sequía Activa' : '☀️ Soleado Andino'}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              NASA POWER • SENAMHI
            </span>
          </div>
        </div>

        {/* Center: Large Temperature & Cloud Sun Visual */}
        <div className="flex items-baseline justify-between pt-1 pb-1 relative z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tight text-glow-emerald">
              {temp}
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">°C</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              {isElNino ? (
                <Sun className="w-7 h-7 text-amber-400 animate-spin-slow" />
              ) : (
                <CloudSun className="w-7 h-7 text-emerald-300" />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Metrics: 3 Frosted Glass Telemetry Capsules */}
        <div className="grid grid-cols-3 gap-2 pt-1 relative z-10">
          {/* SMAP Moisture */}
          <div className="p-2.5 rounded-2xl bg-[#0A1A0F]/60 border border-cyan-500/30 backdrop-blur-md text-left">
            <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-300">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>Humedad</span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {smapPercent}%
            </div>
            <span className="text-[8px] text-cyan-200/70 block">NASA SMAP</span>
          </div>

          {/* SENAMHI Rain */}
          <div className="p-2.5 rounded-2xl bg-[#0A1A0F]/60 border border-sky-500/30 backdrop-blur-md text-left">
            <div className="flex items-center gap-1 text-[9px] font-bold text-sky-300">
              <CloudRain className="w-3 h-3 text-sky-400" />
              <span>Precipitación</span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {rain} mm
            </div>
            <span className="text-[8px] text-sky-200/70 block">SENAMHI</span>
          </div>

          {/* Wind Speed */}
          <div className="p-2.5 rounded-2xl bg-[#0A1A0F]/60 border border-emerald-500/30 backdrop-blur-md text-left">
            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-300">
              <Wind className="w-3 h-3 text-emerald-400" />
              <span>Viento</span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {windKmh} km/h
            </div>
            <span className="text-[8px] text-emerald-200/70 block">Velocidad</span>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY FILTER PILLS (HORIZONTAL SCROLL) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Mis Cultivos &amp; Estrategias
          </span>
          <button
            type="button"
            onClick={onNavigateToChacra}
            className="text-[10px] text-emerald-300 hover:text-white font-bold flex items-center gap-0.5 transition cursor-pointer"
          >
            <span>Ver Todo</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none no-scrollbar">
          {CROP_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  playBubblePop();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-black transition-all duration-200 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/30 scale-102'
                    : 'bg-[#132A1C]/80 border border-emerald-500/30 text-emerald-200/80 hover:bg-[#183925] hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. PHOTOGRAPHIC ANDEAN CARDS (SCREEN 2 STYLE "MY FIELDS") */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredCards.map((card) => {
          const isBookmarked = bookmarkedCards[card.id] || false;
          return (
            <div
              key={card.id}
              onClick={() => {
                playBubblePop();
                if (card.target === 'clima') onNavigateToClima();
                else if (card.target === 'chacra') onNavigateToChacra();
                else onOpenWizard();
              }}
              className="group cursor-pointer rounded-3xl bg-[#132A1C]/75 hover:bg-[#183925]/85 border border-emerald-500/30 hover:border-emerald-400/60 p-3 shadow-xl backdrop-blur-md transition-all duration-300 flex flex-col justify-between space-y-3"
            >
              {/* Image with Tag & Bookmark */}
              <div className="w-full h-36 rounded-2xl overflow-hidden relative shadow-inner bg-slate-950">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 text-[9px] font-black text-emerald-300">
                  {card.badge}
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleBookmark(card.id, e)}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition cursor-pointer border ${
                    isBookmarked
                      ? 'bg-amber-500 text-slate-950 border-amber-300'
                      : 'bg-slate-950/70 text-slate-300 border-white/20 hover:text-white'
                  }`}
                  title={isBookmarked ? 'Guardado en favoritos' : 'Guardar estrategia'}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                </button>

                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-white font-bold">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    {card.metricLabel}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {card.title}
                </h4>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-1 flex items-center justify-between border-t border-emerald-500/20 text-xs">
                <span className="text-[10px] font-bold text-emerald-400">
                  {card.actionText}
                </span>
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 group-hover:bg-lime-400 group-hover:text-slate-950 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. LOS CUATRO PILARES PARA VENCER A LA SEQUÍA (DARK GLASS BANNER) */}
      <CuatroPilaresBanner />

      {/* 6. CHIP BANNER: 3 BOLETINES ENOS & INIA DISPONIBLES */}
      <div className="flex justify-center pt-1 pb-1">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            onOpenNews();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#132A1C]/80 border border-emerald-500/30 shadow-lg hover:border-amber-400/80 text-xs font-bold text-emerald-200 active:scale-95 transition cursor-pointer backdrop-blur-md"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>3 Boletines ENOS &amp; INIA disponibles</span>
          <span className="text-emerald-400 font-normal">↗</span>
        </button>
      </div>

      {/* 7. TARJETA DESTACADA: TU CHACRA CALIBRADA */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#132A1C]/90 via-[#0F2418]/90 to-[#0A1A0F]/90 border border-emerald-500/40 text-white shadow-xl flex items-center justify-between backdrop-blur-md">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 block">
            TU CHACRA CALIBRADA
          </span>
          <div className="font-extrabold text-sm text-white mt-0.5">
            {profile.parcelName} ({currentArea} ha • {topos} topos)
          </div>
          <p className="text-[11px] text-emerald-200/90 mt-0.5">
            Cosecha: {profile.previousCropName} • Prioridad: {profile.priorityName}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playSuccessFanfare();
            onNavigateToChacra();
          }}
          className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition cursor-pointer shrink-0"
        >
          <Tractor className="w-4 h-4 text-emerald-950" />
          <span>Entrar a Mi Chacra</span>
        </button>
      </div>
    </div>
  );
}
