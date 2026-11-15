'use client';

import React, { useState } from 'react';
import { ClimaNasa, FarmerProfile } from '@/lib/types';
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Leaf,
  Sprout,
  Sun,
  ShieldCheck,
  Droplets,
  ExternalLink,
} from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface InicioTabProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  smapPercent: number;
  hardwareId?: string;
  isElNino?: boolean;
  onOpenWizard?: () => void;
  onNavigateToParcelas?: () => void;
  onNavigateToRotacion?: () => void;
  onNavigateToCopiloto?: () => void;
}

export default function InicioTab({
  profile,
  climaNasa,
  smapPercent,
  hardwareId,
  isElNino,
  onOpenWizard,
  onNavigateToParcelas,
  onNavigateToRotacion,
  onNavigateToCopiloto,
}: InicioTabProps) {
  const [selectedCropFilter, setSelectedCropFilter] = useState<'Todos' | 'Papa nativa' | 'Maíz' | 'Quinua'>('Todos');
  const [activeConsejoVoice, setActiveConsejoVoice] = useState<'astro' | 'kipu'>('astro');

  const parcelsData = [
    {
      id: 'p1',
      cropCategory: 'Papa nativa',
      tag: 'Papa nativa',
      image: '/images/andes_bright.jpg',
      icon: <Leaf className="w-4 h-4 text-emerald-800" />,
      title: 'Conservar humedad con mulch',
      description: 'No quemes el rastrojo. Úsalo como cobertura frente a la sequía.',
      onClick: onOpenWizard,
    },
    {
      id: 'p2',
      cropCategory: 'Papa nativa',
      tag: 'Habas',
      image: '/images/tarwi_chocho.jpg',
      icon: <Sprout className="w-4 h-4 text-emerald-800" />,
      title: 'Rotar con Tarwi y Habas',
      description: 'Fijan nitrógeno y recuperan el suelo antes de la campaña grande.',
      onClick: onNavigateToRotacion,
    },
    {
      id: 'p3',
      cropCategory: 'Maíz',
      tag: 'Maíz Blanco',
      image: '/images/andes_poster.jpg',
      icon: <Sun className="w-4 h-4 text-emerald-800" />,
      title: 'Surcos en contorno',
      description: 'Retienen el agua de lluvia y reducen el lavado de nutrientes.',
      onClick: onNavigateToParcelas,
    },
    {
      id: 'p4',
      cropCategory: 'Quinua',
      tag: 'Quinua Roja',
      image: '/images/andes_bright.jpg',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-800" />,
      title: 'Resistencia a heladas',
      description: 'Monitorea vigor vegetativo Sentinel-2 con alta resiliencia.',
      onClick: onNavigateToCopiloto,
    },
  ];

  const filteredParcels = selectedCropFilter === 'Todos'
    ? parcelsData
    : parcelsData.filter((p) => p.cropCategory === selectedCropFilter);

  // Circular gauge calculations (78/100)
  const healthScore = 78;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="space-y-4 animate-in fade-in pb-16">
      {/* 0. Small Field Report Header */}
      <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-emerald-900/70 uppercase px-1 pt-1">
        <span>REPORTE DE CAMPO · HOY 08:40</span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          En línea
        </span>
      </div>

      {/* 1. SECCIÓN SALUD DEL SUELO (CIRCULAR GAUGE 78/100) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800/80 block">
            SALUD DEL SUELO
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#132A1C] leading-tight">
            Tu suelo está{' '}
            <span className="font-serif italic text-emerald-800 font-normal">
              respondiendo bien.
            </span>
          </h1>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Pequeñas prácticas de hoy protegen la cosecha de mañana.
          </p>
        </div>

        {/* Circular Gauge 78/100 */}
        <div className="relative shrink-0 flex flex-col items-center justify-center w-22 h-22">
          <svg className="w-22 h-22 transform -rotate-90" viewBox="0 0 80 80">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#E5ECE2"
              strokeWidth="6.5"
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#7BB63E"
              strokeWidth="6.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black text-[#132A1C] leading-none">
              78<span className="text-[10px] text-zinc-500 font-semibold">/100</span>
            </span>
            <span className="text-[7.5px] font-black text-emerald-800 uppercase tracking-tighter mt-0.5">
              BUEN ESTADO
            </span>
          </div>
        </div>
      </div>

      {/* 2. ALERTA DE RASTROJO (BANNER COLOR ÁMBAR SUAVE) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          playBubblePop();
          if (onNavigateToRotacion) onNavigateToRotacion();
        }}
        className="w-full text-left bg-[#FDF8F0] border border-[#F2E5D0] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs hover:border-amber-300 transition cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-100/90 border border-amber-300/50 flex items-center justify-center shrink-0 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-[#132A1C] leading-tight truncate">
              Protege el suelo, no quemes el rastrojo
            </h4>
            <p className="text-[11px] text-zinc-600 leading-snug mt-0.5">
              La cobertura conserva humedad durante los días secos.
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
      </div>

      {/* 3. SECCIÓN CAMPO Y SABERES (MIS PARCELAS + PÍLDORAS + TARJETAS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60 block">
              CAMPO Y SABERES
            </span>
            <h2 className="text-lg font-black text-[#132A1C]">Mis parcelas</h2>
          </div>
          {onNavigateToParcelas && (
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onNavigateToParcelas();
              }}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition"
            >
              <span>Ver mapa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['Todos', 'Papa nativa', 'Maíz', 'Quinua'] as const).map((filter) => {
            const isSelected = selectedCropFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  playBubblePop();
                  setSelectedCropFilter(filter);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#7BB63E] text-white shadow-xs'
                    : 'bg-white text-zinc-700 border border-[#E5ECE2] hover:bg-zinc-50'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Horizontal Scroll / Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredParcels.slice(0, 2).map((parcel) => (
            <div
              key={parcel.id}
              onClick={() => {
                playBubblePop();
                if (parcel.onClick) parcel.onClick();
              }}
              className="relative overflow-hidden rounded-3xl bg-[#132A1C] text-white shadow-sm border border-emerald-900/40 flex flex-col justify-between min-h-[220px] p-3.5 cursor-pointer group hover:shadow-md transition"
            >
              {/* Image Backdrop with subtle dark gradient mask */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('${parcel.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#132A1C] via-[#132A1C]/70 to-transparent" />

              {/* Top Row: Crop Tag & Checkmark */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/90 bg-[#132A1C]/80 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-xs">
                  {parcel.tag}
                </span>
                <div className="w-5 h-5 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                </div>
              </div>

              {/* Bottom Content: Icon Badge + Title + Subtitle */}
              <div className="relative z-10 space-y-1 mt-auto pt-8">
                <div className="w-7 h-7 rounded-xl bg-[#A3E635] flex items-center justify-center shadow-xs">
                  {parcel.icon}
                </div>
                <h3 className="text-xs font-black text-white leading-tight">
                  {parcel.title}
                </h3>
                <p className="text-[10px] text-zinc-300 leading-snug line-clamp-2">
                  {parcel.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECCIÓN CONSEJO DEL DÍA ("DOS MIRADAS, UNA CHACRA") */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60 block">
              CONSEJO DEL DÍA
            </span>
            <h2 className="text-base font-black text-[#132A1C]">
              Dos miradas, una chacra.
            </h2>
          </div>
          {onNavigateToCopiloto && (
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onNavigateToCopiloto();
              }}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition"
            >
              <span>Explorar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dual Character Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setActiveConsejoVoice('astro');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeConsejoVoice === 'astro'
                ? 'bg-[#132A1C] text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <span>☀️ Astro · NASA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setActiveConsejoVoice('kipu');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              activeConsejoVoice === 'kipu'
                ? 'bg-[#132A1C] text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <span>🌱 Kipu · saber local</span>
          </button>
        </div>

        {/* Dynamic Advice Text */}
        <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] text-xs text-zinc-800 leading-relaxed">
          {activeConsejoVoice === 'astro' ? (
            <p className="font-serif italic text-zinc-800 text-[13px] leading-relaxed">
              &ldquo;SMAP observa humedad baja en la superficie. Mantén mulch de 5–8 cm y revisa el surco al amanecer.&rdquo;
            </p>
          ) : (
            <p className="font-serif italic text-zinc-800 text-[13px] leading-relaxed">
              &ldquo;La luna menguante pide cuidar la humedad de la raíz. No remuevas la tierra en horas de sol fuerte y aporca con tierra fresca.&rdquo;
            </p>
          )}
        </div>

        {/* Footnote */}
        <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 font-medium pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          <span>Datos satelitales actualizados · SMAP, GPM y NDVI</span>
        </div>
      </div>
    </div>
  );
}
