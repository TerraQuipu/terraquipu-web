'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FarmerProfile, ClimaNasa, ParcelItem, Cultivo } from '@/lib/types';
import type { LiveAgrometeoData } from '@/lib/agrometeoClient';
import {
  Sun,
  Sprout,
  Send,
  MapPin,
  Flame,
  Droplets,
  AlertTriangle,
  Leaf,
  Layers,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import { getActiveParcel, getStoredParcels, setActiveParcelId, getActiveParcelId } from '@/lib/deviceProfile';

interface Message {
  id: string;
  sender: 'user' | 'kipu' | 'astro';
  text: string;
  timestamp: string;
}

interface CopilotTabProps {
  profile: FarmerProfile;
  climaNasa?: ClimaNasa | null;
  liveAgrometeo?: LiveAgrometeoData | null;
  cultivos?: Cultivo[];
  smapPercent?: number;
  initialVoice?: 'astro' | 'kipu';
  onOpenDiagnostic: () => void;
  onToast?: (msg: string) => void;
  activeParcelId?: string;
  parcels?: ParcelItem[];
  onSelectParcel?: (parcelId: string) => void;
}

interface CropKnowledge {
  name: string;
  family: string;
  waterDemandMinMm: number;
  waterDemandOptMm: number;
  altitudeMinMsnm: number;
  altitudeMaxMsnm: number;
  phMin: number;
  phMax: number;
  nitrogenKgHa: number;
  breaksWeevilPest: boolean;
  frostToleranceC: number;
  favSuccessors: string[];
}

const CROP_DATABASE: Record<string, CropKnowledge> = {
  papa: {
    name: 'Native Andean Potato (Solanum tuberosum subsp. andigena)',
    family: 'Solanaceae',
    waterDemandMinMm: 500,
    waterDemandOptMm: 650,
    altitudeMinMsnm: 2800,
    altitudeMaxMsnm: 4100,
    phMin: 5.0,
    phMax: 6.5,
    nitrogenKgHa: -70.0,
    breaksWeevilPest: false,
    frostToleranceC: -1.5,
    favSuccessors: ['Tarwi', 'Broad Beans', 'Quinoa'],
  },
  tarwi: {
    name: 'Tarwi / Andean Lupin (Lupinus mutabilis)',
    family: 'Fabaceae',
    waterDemandMinMm: 350,
    waterDemandOptMm: 480,
    altitudeMinMsnm: 2800,
    altitudeMaxMsnm: 3900,
    phMin: 5.5,
    phMax: 7.2,
    nitrogenKgHa: 95.0,
    breaksWeevilPest: true,
    frostToleranceC: -3.0,
    favSuccessors: ['Native Potato', 'Giant White Corn', 'Quinoa'],
  },
  habas: {
    name: 'Highland Broad Beans (Vicia faba)',
    family: 'Fabaceae',
    waterDemandMinMm: 400,
    waterDemandOptMm: 550,
    altitudeMinMsnm: 2600,
    altitudeMaxMsnm: 3850,
    phMin: 6.0,
    phMax: 7.5,
    nitrogenKgHa: 75.0,
    breaksWeevilPest: true,
    frostToleranceC: -2.0,
    favSuccessors: ['Giant White Corn', 'Native Potato', 'Cereals'],
  },
  maiz: {
    name: 'Giant White Corn (Zea mays var. amylacea)',
    family: 'Poaceae',
    waterDemandMinMm: 500,
    waterDemandOptMm: 700,
    altitudeMinMsnm: 2400,
    altitudeMaxMsnm: 3350,
    phMin: 5.5,
    phMax: 7.0,
    nitrogenKgHa: -50.0,
    breaksWeevilPest: false,
    frostToleranceC: 0.0,
    favSuccessors: ['Tarwi', 'Broad Beans', 'Alfalfa'],
  },
  quinua: {
    name: 'Real Andean Quinoa (Chenopodium quinoa)',
    family: 'Amaranthaceae',
    waterDemandMinMm: 250,
    waterDemandOptMm: 400,
    altitudeMinMsnm: 2500,
    altitudeMaxMsnm: 4000,
    phMin: 6.0,
    phMax: 8.5,
    nitrogenKgHa: -30.0,
    breaksWeevilPest: true,
    frostToleranceC: -4.0,
    favSuccessors: ['Broad Beans', 'Tarwi', 'Native Potato'],
  },
  cebada: {
    name: 'Malting & Grain Barley (Hordeum vulgare)',
    family: 'Poaceae',
    waterDemandMinMm: 300,
    waterDemandOptMm: 450,
    altitudeMinMsnm: 3000,
    altitudeMaxMsnm: 4200,
    phMin: 5.5,
    phMax: 7.5,
    nitrogenKgHa: -30.0,
    breaksWeevilPest: true,
    frostToleranceC: -4.5,
    favSuccessors: ['Tarwi', 'Broad Beans', 'Native Potato'],
  },
};

function resolveCropKnowledge(cropStr: string, dbCrops?: Cultivo[]): CropKnowledge {
  const lower = cropStr.toLowerCase();

  if (dbCrops && dbCrops.length > 0) {
    const found = dbCrops.find(
      (c) =>
        lower.includes(c.crop_id.toLowerCase()) ||
        lower.includes(c.nombre_comun.toLowerCase())
    );
    if (found) {
      return {
        name: found.nombre_comun,
        family: found.familia_botanica || 'Andina',
        waterDemandMinMm: found.demanda_hidrica_min_mm,
        waterDemandOptMm: found.demanda_hidrica_optima_mm,
        altitudeMinMsnm: found.altitud_min_msnm,
        altitudeMaxMsnm: found.altitud_max_msnm,
        phMin: found.ph_suelo_min,
        phMax: found.ph_suelo_max,
        nitrogenKgHa: found.balance_nitrogeno_kg_ha,
        breaksWeevilPest: found.rompe_plaga_gorgojo,
        frostToleranceC: found.tolerancia_helada_c,
        favSuccessors: found.sucesores_favorables || ['Tarwi', 'Broad Beans'],
      };
    }
  }

  if (lower.includes('tarwi') || lower.includes('chocho')) return CROP_DATABASE.tarwi;
  if (lower.includes('haba')) return CROP_DATABASE.habas;
  if (lower.includes('maiz') || lower.includes('maíz')) return CROP_DATABASE.maiz;
  if (lower.includes('quinua')) return CROP_DATABASE.quinua;
  if (lower.includes('cebada')) return CROP_DATABASE.cebada;
  return CROP_DATABASE.papa;
}

export default function CopilotTab({
  profile,
  climaNasa,
  liveAgrometeo,
  cultivos = [],
  smapPercent = 16,
  initialVoice = 'kipu',
  onOpenDiagnostic,
  onToast,
  activeParcelId: propActiveParcelId,
  parcels: propParcels,
  onSelectParcel,
}: CopilotTabProps) {
  const [activeVoice, setActiveVoice] = useState<'astro' | 'kipu'>(initialVoice);
  const [parcels, setParcels] = useState<ParcelItem[]>([]);
  const [activeParcel, setActiveParcel] = useState<ParcelItem | null>(() => {
    if (typeof window !== 'undefined') {
      return getActiveParcel();
    }
    return null;
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load real parcels on mount and keep synced with props
  useEffect(() => {
    if (propParcels && propParcels.length > 0) {
      setParcels(propParcels);
    } else {
      const list = getStoredParcels();
      setParcels(list);
    }
  }, [propParcels]);

  useEffect(() => {
    const list = propParcels && propParcels.length > 0 ? propParcels : getStoredParcels();
    const targetId = propActiveParcelId || getActiveParcelId();
    const found = list.find((p) => p.id === targetId) || (list.length > 0 ? list[0] : null);
    if (found) {
      setActiveParcel(found);
    }
  }, [propActiveParcelId, propParcels]);

  const handleSelectParcel = (p: ParcelItem) => {
    playBubblePop();
    setActiveParcel(p);
    setActiveParcelId(p.id);
    if (onSelectParcel) {
      onSelectParcel(p.id);
    }
    if (onToast) onToast(`Copilot & field telemetry focused on ${p.name.split('•')[0].trim()}`);
  };

  const parcelName = activeParcel?.name || profile.parcelName || 'Main field';
  const cropName = activeParcel?.cropName || profile.previousCropName || 'Native Andean Potato';
  const parcelAreaHa = activeParcel?.areaHa || profile.areaHa || 1.73;
  const currentSmap = activeParcel?.smapHumidity ?? smapPercent;
  const altitude = activeParcel?.altitudeMsnm || profile.altitude || 3380;
  const cropKnowledge = useMemo(() => resolveCropKnowledge(cropName, cultivos), [cropName, cultivos]);

  // Initial greeting tailored to real telemetry
  const initialGreeting = useMemo(() => {
    const farmer = profile.farmerName || 'farmer colleague';
    if (activeVoice === 'astro') {
      return `Greetings, ${farmer}! I am Astro from NASA Telemetry. At your parcel "${parcelName}", SMAP radar records ${currentSmap}% surface soil moisture at ${altitude} m a.s.l. with a ${cropName} standing crop. What precision geospatial analysis would you like to conduct today?`;
    }
    return `Allillanchu, brother ${farmer}! I am Kipu, your Andean agroecological companion. At your field "${parcelName}", the topsoil holds ${currentSmap}% moisture for your ${cropName} at ${altitude} m a.s.l. Which field task or crop rotation would you like to plan today?`;
  }, [profile.farmerName, activeVoice, parcelName, currentSmap, altitude, cropName]);

  // Active dialogue shown in the prominent Duolingo mascot speech bubble
  const [activeDialogue, setActiveDialogue] = useState<string>(initialGreeting);

  // Synchronize greeting when activeVoice or activeParcel changes if no conversation yet
  useEffect(() => {
    setActiveDialogue(initialGreeting);
  }, [initialGreeting]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: initialVoice,
      text: initialGreeting,
      timestamp: typeof window !== 'undefined'
        ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : 'LIVE',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Duolingo Quick Choice Cards
  const duolingoOptions = [
    {
      id: 'opt-humedad',
      icon: <Droplets className="w-4 h-4 text-emerald-600" />,
      title: 'SMAP Moisture & Mulch',
      desc: `Monitor soil at ${currentSmap}% volumetric moisture`,
      query: `How can I protect soil moisture in ${parcelName}?`,
    },
    {
      id: 'opt-helada',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      title: 'Frost Risk Telemetry',
      desc: `Microclimatic forecast for ${altitude} m a.s.l.`,
      query: `Is there an imminent frost risk for my ${cropName} crop?`,
    },
    {
      id: 'opt-rotacion',
      icon: <Leaf className="w-4 h-4 text-lime-600" />,
      title: 'Crop Rotation & Savings',
      desc: `Biological N-fixation across ${parcelAreaHa} ha`,
      query: `How much synthetic fertilizer and cost can I save by rotating my field?`,
    },
    {
      id: 'opt-aporque',
      icon: <Sprout className="w-4 h-4 text-emerald-700" />,
      title: 'Hilling & Agronomic Care',
      desc: `Optimal calendar for ${cropKnowledge.name}`,
      query: `When should I hill up and weed my ${cropName}?`,
    },
  ];

  // RAG & Agronomic Database Engine
  const generateRagResponse = (queryText: string): string => {
    const lower = queryText.toLowerCase();
    const tempMedia = climaNasa?.temp_media_c ? Math.round(climaNasa.temp_media_c) : 21;
    const isFrostAlert = climaNasa?.alerta_helada || tempMedia <= 2;
    const savingsSoles = Math.round(parcelAreaHa * 286);

    // 1. Moisture / Irrigation / SMAP / Drought
    if (lower.includes('humedad') || lower.includes('agua') || lower.includes('riego') || lower.includes('seco') || lower.includes('smap') || lower.includes('moisture') || lower.includes('water') || lower.includes('irrigation')) {
      if (activeVoice === 'astro') {
        return `SMAP Radar Telemetry Report for ${parcelName}: Soil volumetric moisture is currently ${currentSmap}%. For ${cropKnowledge.name}, which requires an optimal water balance of ${cropKnowledge.waterDemandOptMm} mm, a level of ${currentSmap}% requires avoiding midday soil tillage to curb 3.2 mm/day evapotranspirative losses.`;
      }
      return `Colleague, at ${parcelName} the soil is speaking: with ${currentSmap}% surface moisture, dry Andean winds desiccate tender roots. Apply a 6 to 8 cm mulch layer using barley stover or ichu straw to preserve morning dew and arrest topsoil crusting.`;
    }

    // 2. Frost / Temperature / Cold / Weather
    if (lower.includes('helada') || lower.includes('frio') || lower.includes('frío') || lower.includes('temperatura') || lower.includes('clima') || lower.includes('frost') || lower.includes('cold') || lower.includes('temperature') || lower.includes('weather')) {
      if (isFrostAlert) {
        if (activeVoice === 'astro') {
          return `Active Frost Alert: At ${altitude} m a.s.l. in ${parcelName}, night radiative cooling will drop temperatures near 0°C under calm winds and clear skies. The critical biological tolerance for ${cropKnowledge.name} is ${cropKnowledge.frostToleranceC}°C. We recommend preventative evening irrigation to release latent heat.`;
        }
        return `Attention! The Andean night will be clear and windless at ${altitude} m a.s.l. White radiative frost threatens your ${cropName}. If accessible, apply light perimeter irrigation at dusk or maintain gentle moist residue smoke smudges along upper borders to shelter the parcel.`;
      }
      return activeVoice === 'astro'
        ? `Favorable thermal telemetry: Current mean temperature is ${tempMedia}°C at ${altitude} m a.s.l. No severe thermal anomalies are projected for the next 48 hours in ${parcelName}. Continue regular NDVI vigor monitoring.`
        : `Winds are currently protecting your parcel ${parcelName}. At ${tempMedia}°C, nighttime cold stays within normal seasonal ranges. Ensure perimeter mulch barriers remain intact against sudden night temperature inversions.`;
    }

    // 3. Rotation / Nitrogen / Fertilizers / Savings
    if (lower.includes('rotar') || lower.includes('rotacion') || lower.includes('rotación') || lower.includes('nitrogeno') || lower.includes('nitrógeno') || lower.includes('abono') || lower.includes('ahorro') || lower.includes('rotat') || lower.includes('nitrogen') || lower.includes('fertiliz') || lower.includes('saving')) {
      const successors = cropKnowledge.favSuccessors.join(', ');
      if (cropKnowledge.nitrogenKgHa > 0) {
        return `Your current ${cropName} crop is an active symbiotic nitrogen-fixing legume contributing +${cropKnowledge.nitrogenKgHa} kg N/ha at ${parcelName}. In subsequent rotational succession with Native Potato or Giant White Corn, you will save approximately S/ ${savingsSoles.toLocaleString('en-US')} in synthetic nitrogen fertilizers across your ${parcelAreaHa} ha.`;
      }
      return `In your parcel ${parcelName} of ${parcelAreaHa} ha, your ${cropName} extracts ${Math.abs(cropKnowledge.nitrogenKgHa)} kg N/ha. We recommend immediate crop rotation with legumes such as ${successors}, fixing +75 to +95 kg N/ha and delivering a verified savings of S/ ${savingsSoles.toLocaleString('en-US')} in organic soil amendments.`;
    }

    // 4. Hilling / Weeding / Pests / Weevil / Sowing
    if (lower.includes('aporcar') || lower.includes('aporque') || lower.includes('deshierbe') || lower.includes('plaga') || lower.includes('gorgojo') || lower.includes('siembra') || lower.includes('hill') || lower.includes('weed') || lower.includes('pest') || lower.includes('weevil') || lower.includes('sow')) {
      if (cropKnowledge.breaksWeevilPest) {
        return `Key agroecological insight: ${cropKnowledge.name} disrupts the biological life cycle of the Andean potato weevil (Premnotrypes spp.). Light hilling should occur at 35 days to aerate the rhizosphere and foster Rhizobium nodule formation without disturbing lateral root architecture.`;
      }
      return `For your ${cropName} in ${parcelName}, conduct the first hilling when stems reach 18 to 22 cm in height. Build high contour mounds to protect tubers from solar greening, deter oviposition by the Andean potato weevil, and channel seasonal rainfall into the root zone.`;
    }

    // Default general grounding
    if (activeVoice === 'astro') {
      return `Integrated satellite telemetry: Parcel "${parcelName}" calibrated at ${altitude} m a.s.l. spanning ${parcelAreaHa} ha of ${cropName}. SMAP soil moisture stands at ${currentSmap}%, with optimal edaphic pH between ${cropKnowledge.phMin} and ${cropKnowledge.phMax}. Telemetry confirmed via NASA Earth observation streams.`;
    }
    return `Understood regarding your field "${parcelName}". Ancestral wisdom has long read lunar cycles and soil temperature at ${altitude} m a.s.l. At ${currentSmap}% moisture, your ${cropName} will flourish with maintained surface mulch and timely contour hilling.`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    playBubblePop();
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      playSuccessFanfare();
      setIsTyping(false);
      const reply = generateRagResponse(text);
      setActiveDialogue(reply);

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: activeVoice,
        text: reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-20">
      {/* 1. TOP BAR: CHARACTER SWITCHER & STREAK BADGE */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E5ECE2] shadow-2xs">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setActiveVoice('kipu');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeVoice === 'kipu'
                ? 'bg-[#132A1C] text-[#A3E635] shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Kipu - Local Agroecology</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setActiveVoice('astro');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeVoice === 'astro'
                ? 'bg-[#132A1C] text-amber-300 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Astro - NASA Telemetry</span>
          </button>
        </div>

        {/* Gamification Streak Badge */}
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300/70 px-3 py-1.5 rounded-2xl text-amber-800 text-xs font-bold shadow-2xs shrink-0">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>5-day streak</span>
        </div>
      </div>

      {/* 2. DUOLINGO MASCOT STAGE: CHARACTER + DIRECT SPEECH BUBBLE */}
      <div className="bg-[#132A1C] rounded-3xl p-4 sm:p-5 border border-emerald-900/60 shadow-md text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
          {/* Mascot Avatar with Animation */}
          <div className="relative shrink-0 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-950/90 border-2 border-[#A3E635] flex items-center justify-center p-1.5 shadow-xl">
              <img
                src={activeVoice === 'astro' ? '/images/astro_satelin.png' : '/images/kipu_llama_happy.png'}
                alt={activeVoice === 'astro' ? 'Astro' : 'Kipu'}
                className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="mt-1.5 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/50 border border-white/10 text-[10px] font-semibold text-lime-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
              <span>{activeVoice === 'astro' ? 'Astro NASA' : 'Kipu Andean'}</span>
            </div>
          </div>

          {/* Speech Bubble with Tail pointing to Mascot */}
          <div className="flex-1 min-w-0 w-full relative">
            <div className="relative bg-[#1A3824] border border-emerald-500/30 rounded-2xl p-3.5 text-white shadow-lg backdrop-blur-md">
              {/* Top Bubble Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/20 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-[#A3E635] truncate">
                    {activeVoice === 'astro' ? 'Astro (NASA Telemetry)' : 'Kipu (Andean Copilot)'}
                  </span>
                </div>
                <span className="text-[9.5px] font-mono text-emerald-300/80 uppercase shrink-0">
                  {cropName} - {currentSmap}% SMAP
                </span>
              </div>

              {/* Bubble Body */}
              {isTyping ? (
                <div className="flex items-center gap-2 py-1 text-xs text-emerald-200">
                  <Sprout className="w-4 h-4 text-[#A3E635] animate-spin shrink-0" />
                  <span>Querying satellite telemetry and agronomic matrix...</span>
                </div>
              ) : (
                <p className="text-xs text-zinc-100 leading-relaxed font-normal">
                  {activeDialogue}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE PARCEL CONTEXT CARD / SELECTOR */}
      {parcels.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
              ACTIVE FIELD IN CONSULTATION
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold">
              SMAP {currentSmap}% - {altitude} m a.s.l.
            </span>
          </div>

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
                    ({p.cropCategory || p.cropName})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DUOLINGO STYLE INTERACTIVE CHOICE CARDS */}
      <div className="space-y-2">
        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1 block">
          QUICK FIELD INQUIRIES
        </span>
        <div className="grid grid-cols-2 gap-2.5">
          {duolingoOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSendMessage(opt.query)}
              className="bg-white hover:bg-emerald-50/60 p-3 rounded-2xl border border-[#E5ECE2] hover:border-emerald-400 text-left transition cursor-pointer shadow-xs flex flex-col justify-between group active:scale-95"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center">
                  {opt.icon}
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-800 leading-tight">
                  {opt.title}
                </h4>
                <p className="text-[10px] text-zinc-500 leading-snug mt-0.5 line-clamp-1">
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. INTERACTIVE CHAT MESSAGES CONTAINER */}
      <div className="bg-white rounded-3xl p-4 border border-[#E5ECE2] shadow-xs space-y-3 min-h-[260px] flex flex-col justify-between">
        {/* Messages List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300 text-emerald-800">
                    {m.sender === 'astro' ? <Sun className="w-3.5 h-3.5 text-amber-700" /> : <Sprout className="w-3.5 h-3.5 text-emerald-800" />}
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[#132A1C] text-white rounded-br-xs font-normal'
                      : 'bg-[#F4F7F2] text-zinc-800 border border-[#E5ECE2] rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`text-[9px] block text-right mt-1 font-mono ${
                      isMe ? 'text-zinc-400' : 'text-zinc-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
                <Sprout className="w-3.5 h-3.5 text-emerald-800 animate-spin" />
              </div>
              <div className="bg-[#F4F7F2] rounded-2xl px-3 py-2 border border-[#E5ECE2] text-xs text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 6. INPUT MESSAGE BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-[#E5ECE2]"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Kipu or Astro about your parcel, soil health, or satellite telemetry..."
            className="flex-1 h-10 px-3.5 rounded-full bg-[#F7F9F6] border border-[#E5ECE2] text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:border-[#7BB63E] transition"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] disabled:opacity-40 text-[#132A1C] flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* 7. Quick Action: Diagnostic Evaluation */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] space-y-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block">
              IN-SITU FIELD REPORT
            </span>
            <h4 className="text-sm font-bold text-zinc-800 leading-tight">
              Would you like to record an in-situ field diagnostic today?
            </h4>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-normal">
              Validate satellite radar signals against ground-truth soil texture and moisture.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playSuccessFanfare();
              onOpenDiagnostic();
            }}
            className="px-4 py-2.5 rounded-full bg-[#132A1C] hover:bg-emerald-950 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Assess Soil Health</span>
          </button>
        </div>

        {/* Selected Parcel Badge for the Report */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-950">
          <div className="w-6 h-6 rounded-full bg-emerald-200/80 flex items-center justify-center text-emerald-900 shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-800 block">
              Reference parcel:
            </span>
            <span className="text-xs font-bold text-zinc-900 truncate block">
              {activeParcel
                ? `${activeParcel.name} - ${activeParcel.cropCategory || activeParcel.cropName} (${activeParcel.areaHa} ha)`
                : profile.parcelName || 'Main field'}
            </span>
          </div>
        </div>

        {/* Interactive Chip Selector for Field Report */}
        {parcels.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            <span className="text-[9.5px] font-semibold text-zinc-500 uppercase tracking-wider block">
              Select parcel for this field report:
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
                    <MapPin className={`w-3 h-3 ${isSel ? 'text-[#A3E635]' : 'text-zinc-400'}`} />
                    <span>{p.name.split('•')[0].trim()}</span>
                    <span className={`text-[10px] ${isSel ? 'text-zinc-300' : 'text-zinc-400'}`}>
                      ({p.cropCategory || p.cropName})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
