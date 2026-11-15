'use client';

import React, { useState, useEffect } from 'react';
import { FarmerProfile, ParcelItem } from '@/lib/types';
import {
  Tractor,
  Sprout,
  Leaf,
  Droplets,
  ChevronRight,
  ArrowRight,
  Gauge,
  Check,
  Calendar,
  Sparkles,
  Wheat,
  Sun,
  Layers,
  MapPin,
  Plus,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import { getStoredParcels, getActiveParcel, setActiveParcelId } from '@/lib/deviceProfile';

interface RotationTabProps {
  profile: FarmerProfile;
  onNavigateToCopiloto?: (voice?: 'astro' | 'kipu') => void;
  onToast?: (msg: string) => void;
  onOpenQgisDrawer?: () => void;
}

export default function RotationTab({
  profile,
  onNavigateToCopiloto,
  onToast,
  onOpenQgisDrawer,
}: RotationTabProps) {
  const [activeSeasonTab, setActiveSeasonTab] = useState<'inmediato' | 'seca'>('inmediato');
  const [parcels, setParcels] = useState<ParcelItem[]>([]);
  const [activeParcel, setActiveParcel] = useState<ParcelItem | null>(null);
  const [rotateAreaHa, setRotateAreaHa] = useState<number>(profile.areaHa || 1.73);

  useEffect(() => {
    const list = getStoredParcels();
    setParcels(list);
    const active = getActiveParcel();
    setActiveParcel(active || (list.length > 0 ? list[0] : null));
    if (active) {
      setRotateAreaHa(active.areaHa);
    }
  }, []);

  const handleSelectParcel = (p: ParcelItem) => {
    playBubblePop();
    setActiveParcel(p);
    setActiveParcelId(p.id);
    setRotateAreaHa(p.areaHa);
    if (onToast) onToast(`Plan adaptado a ${p.name}`);
  };

  // Reference savings: S/ 286 per hectare (INIA Cusco validated)
  const savingsPerHa = 286;
  const calculatedSavings = Math.round(rotateAreaHa * savingsPerHa);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRotateAreaHa(val);
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-20">
      {/* 1. Header Section */}
      <div className="flex items-start justify-between px-1 pt-1">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
            PLAN DE CAMPAÑA · 2026 / 2027
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#132A1C] leading-tight">
            Rotar hoy,{' '}
            <span className="italic text-emerald-800 font-normal">
              cuidar mañana.
            </span>
          </h1>
        </div>

        <div className="bg-[#EBF2E5] text-[#4E6B38] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-[#D5E5CD]">
          <Leaf className="w-3 h-3 text-[#4E6B38]" />
          <span>ANDES SUR</span>
        </div>
      </div>

      {/* Parcel Selector Chips or Empty State Card */}
      {parcels.length > 0 ? (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1 block">
            PARCELA SELECCIONADA
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {parcels.map((p) => {
              const isSel = activeParcel?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectParcel(p)}
                  className={`px-3 py-1.5 rounded-full text-xs transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSel
                      ? 'bg-[#132A1C] text-white font-semibold shadow-xs'
                      : 'bg-white text-zinc-700 border border-[#E5ECE2] hover:bg-zinc-50'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isSel ? 'text-[#A3E635]' : 'text-zinc-400'}`} />
                  <span>{p.name.split('•')[0].trim()}</span>
                  <span className={`text-[10px] ${isSel ? 'text-zinc-300' : 'text-zinc-400'}`}>
                    ({p.cropCategory})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-5 border border-[#E5ECE2] text-center space-y-2.5 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto">
            <Sprout className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-zinc-800">
            Configura tus parcelas para ver tu rotación personalizada
          </h3>
          <p className="text-xs text-zinc-600 max-w-xs mx-auto">
            Delimita el terreno de tu chacra con el visor satelital para calibrar la demanda de nutrientes.
          </p>
          {onOpenQgisDrawer && (
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onOpenQgisDrawer();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7BB63E] text-[#132A1C] font-semibold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Delimitar con Visor QGIS</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Season Selector Tabs */}
      <div className="bg-[#EAEFE8] p-1 rounded-2xl flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setActiveSeasonTab('inmediato');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
            activeSeasonTab === 'inmediato'
              ? 'bg-white text-[#132A1C] shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span className="block leading-tight">Cronograma inmediato</span>
          <span className="text-[9.5px] font-normal text-zinc-500 block">Nov 2026 a Feb 2027</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setActiveSeasonTab('seca');
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
            activeSeasonTab === 'seca'
              ? 'bg-white text-[#132A1C] shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <span className="block leading-tight">Época seca</span>
          <span className="text-[9.5px] font-normal text-zinc-500 block">May a Ago 2027</span>
        </button>
      </div>

      {/* 3. Section: PRÓXIMOS CUATRO MESES */}
      <div className="space-y-2.5">
        <div className="px-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
            PRÓXIMOS CUATRO MESES
          </span>
          <h2 className="text-base font-semibold text-[#132A1C]">Lo que toca hacer</h2>
        </div>

        {activeSeasonTab === 'inmediato' ? (
          <div className="space-y-2 relative">
            <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-[#E5ECE2] z-0" />

            {/* NOV 2026 */}
            <div className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7BB63E] ring-4 ring-lime-100 mb-1" />
                  <span className="text-[9.5px] font-bold text-emerald-900 uppercase">NOV</span>
                  <span className="text-[8px] text-zinc-400 font-mono">2026</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                  <Tractor className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                    Preparar surcos en contorno
                  </h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Semana 3 · {activeParcel?.cropName || 'Papa nativa'} · Retención de humedad
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>

            {/* DIC 2026 */}
            <div className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                  <span className="w-2 h-2 rounded-full bg-zinc-300 ring-4 ring-zinc-100 mb-1" />
                  <span className="text-[9.5px] font-semibold text-zinc-600 uppercase">DIC</span>
                  <span className="text-[8px] text-zinc-400 font-mono">2026</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                    Sembrar Tarwi y Haba
                  </h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Primera lluvia · Asociar cultivos fijadores
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>

            {/* ENE 2027 */}
            <div className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                  <span className="w-2 h-2 rounded-full bg-zinc-300 ring-4 ring-zinc-100 mb-1" />
                  <span className="text-[9.5px] font-semibold text-zinc-600 uppercase">ENE</span>
                  <span className="text-[8px] text-zinc-400 font-mono">2027</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                    Revisar cobertura de rastrojo
                  </h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Cada 10 días · Evitar evaporación del suelo
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>

            {/* FEB 2027 */}
            <div className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                  <span className="w-2 h-2 rounded-full bg-zinc-300 ring-4 ring-zinc-100 mb-1" />
                  <span className="text-[9.5px] font-semibold text-zinc-600 uppercase">FEB</span>
                  <span className="text-[8px] text-zinc-400 font-mono">2027</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                  <Droplets className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                    Medir humedad del suelo
                  </h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Después de lluvias fuertes · Calibrar SMAP
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        ) : (
          <div className="space-y-2 relative">
            <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-[#E5ECE2] z-0" />

            {/* MAY 2027 */}
            <div className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7BB63E] ring-4 ring-lime-100 mb-1" />
                  <span className="text-[9.5px] font-bold text-emerald-900 uppercase">MAY</span>
                  <span className="text-[8px] text-zinc-400 font-mono">2027</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                  <Wheat className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                    Cosecha y trilla de granos
                  </h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Selección de semilla y clasificación de rastrojo
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>

            {/* JUN 2027 */}
            <div className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                  <span className="w-2 h-2 rounded-full bg-zinc-300 ring-4 ring-zinc-100 mb-1" />
                  <span className="text-[9.5px] font-semibold text-zinc-600 uppercase">JUN</span>
                  <span className="text-[8px] text-zinc-400 font-mono">2027</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                  <Leaf className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                    Mulch protector contra heladas
                  </h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Extender rastrojo de cebada · Cobertura 8 cm
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>

            {/* JUL 2027 */}
            <div className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                  <span className="w-2 h-2 rounded-full bg-zinc-300 ring-4 ring-zinc-100 mb-1" />
                  <span className="text-[9.5px] font-semibold text-zinc-600 uppercase">JUL</span>
                  <span className="text-[8px] text-zinc-400 font-mono">2027</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                  <Layers className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                    Descanso del suelo y pastoreo
                  </h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    Abonado orgánico natural con ganado
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
            </div>
          </div>
        )}
      </div>

      {/* 4. Section: NUTRIENTES QUE SE QUEDAN */}
      <div className="space-y-2.5">
        <div className="px-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
            NUTRIENTES QUE SE QUEDAN
          </span>
          <h2 className="text-base font-semibold text-[#132A1C]">La secuencia importa</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Card 1 */}
          <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-xs border border-[#E5ECE2] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Sprout className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
              CAMPAÑA 01
            </span>
            <h4 className="text-xs font-semibold text-[#132A1C]">
              {activeParcel?.cropCategory || 'Papa nativa'}
            </h4>
            <div className="text-sm font-semibold text-rose-700">
              -70 <span className="text-[10px] font-normal text-zinc-500">kg N/ha</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-snug">
              Demanda nitrógeno. Aprovecha el suelo abonado.
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />

          {/* Card 2 */}
          <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-xs border border-[#E5ECE2] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
              CAMPAÑA 02
            </span>
            <h4 className="text-xs font-semibold text-[#132A1C]">Tarwi y Haba</h4>
            <div className="text-sm font-semibold text-emerald-700">
              +95 <span className="text-[10px] font-normal text-zinc-500">kg N/ha</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-snug">
              Leguminosas fijan nitrógeno en las raíces.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Section: SIMULADOR DE AHORRO */}
      <div className="bg-[#1B3B22] rounded-3xl p-5 text-white shadow-md border border-emerald-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A3E635]">
            SIMULADOR DE AHORRO
          </span>
          <div className="w-7 h-7 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-[#A3E635]">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-white leading-tight">
            Menos insumos,{' '}
            <span className="italic text-[#A3E635] font-normal">
              más suelo vivo.
            </span>
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Estima el ahorro en fertilizantes con una rotación de leguminosas.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-300">Área a rotar</span>
            <span className="text-[#A3E635] text-sm font-semibold font-mono">
              {rotateAreaHa.toFixed(1)} ha
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="10.0"
            step="0.5"
            value={rotateAreaHa}
            onChange={handleSliderChange}
            className="w-full accent-[#7BB63E] bg-emerald-950/80 rounded-lg h-2 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>0.5 ha</span>
            <span>5.0 ha</span>
            <span>10.0 ha</span>
          </div>
        </div>

        {/* Big Savings Metric */}
        <div className="bg-[#132A1C]/90 rounded-2xl p-4 border border-emerald-800/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 block">
              AHORRO ESTIMADO EN ABONOS
            </span>
            <span className="text-2xl font-bold text-[#A3E635] font-mono block mt-0.5">
              S/ {calculatedSavings.toLocaleString('es-PE')}
            </span>
            <span className="text-[9.5px] text-zinc-400 block mt-0.5">
              Cálculo para {rotateAreaHa.toFixed(1)} ha rotadas con Tarwi
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-[#A3E635]">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
