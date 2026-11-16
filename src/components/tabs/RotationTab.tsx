'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FarmerProfile, ParcelItem, Cultivo } from '@/lib/types';
import {
  Tractor,
  Sprout,
  Leaf,
  Droplets,
  ChevronRight,
  ArrowRight,
  Gauge,
  Sparkles,
  Wheat,
  Layers,
  MapPin,
  Plus,
  Edit3,
  Check,
  RotateCcw,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import { getStoredParcels, getActiveParcel, setActiveParcelId, getActiveParcelId } from '@/lib/deviceProfile';
import { calculateNitrogenSavings, getFertilizerPriceForParcel } from '@/lib/agronomicPricing';

interface RotationTabProps {
  profile: FarmerProfile;
  cultivos?: Cultivo[];
  onNavigateToCopiloto?: (voice?: 'astro' | 'kipu') => void;
  onToast?: (msg: string) => void;
  onOpenQgisDrawer?: () => void;
  activeParcelId?: string;
  parcels?: ParcelItem[];
  onSelectParcel?: (parcelId: string) => void;
}

interface MonthInfo {
  short: string;
  title: string;
  year: number;
}

function getUpcomingMonths(baseDate: Date, count: number, offset = 0): MonthInfo[] {
  const shortNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const titleNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const list: MonthInfo[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset + i, 1);
    list.push({
      short: shortNames[d.getMonth()],
      title: titleNames[d.getMonth()],
      year: d.getFullYear(),
    });
  }
  return list;
}

interface AgronomicCropData {
  id: string;
  name: string;
  balanceN: number;
  balanceLabel: string;
  isPositive: boolean;
  description: string;
  successor: {
    name: string;
    balanceN: number;
    balanceLabel: string;
    isPositive: boolean;
    description: string;
  };
}

const AGRONOMIC_MAP: Record<string, AgronomicCropData> = {
  papa: {
    id: 'papa_nativa',
    name: 'Native Andean Potato (Solanum tuberosum subsp. andigena)',
    balanceN: -70,
    balanceLabel: '-70',
    isPositive: false,
    description: 'High nitrogen demand crop. Exhausts mineral nutrients in prepared topsoil.',
    successor: {
      name: 'Tarwi & Broad Beans',
      balanceN: 95,
      balanceLabel: '+95',
      isPositive: true,
      description: 'Symbiotic legumes fix atmospheric nitrogen in root nodules and disrupt the Andean potato weevil (Premnotrypes spp.) life cycle.',
    },
  },
  habas: {
    id: 'habas',
    name: 'Andean Broad Bean (Vicia faba)',
    balanceN: 75,
    balanceLabel: '+75',
    isPositive: true,
    description: 'Symbiotic N-fixing legume. Enriches topsoil with organic nitrogen nodules.',
    successor: {
      name: 'Giant White Corn (Zea mays var. amylacea)',
      balanceN: -50,
      balanceLabel: '-50',
      isPositive: false,
      description: 'High-yielding Andean grain crop that scavenges residual nitrogen left by broad beans.',
    },
  },
  tarwi: {
    id: 'tarwi',
    name: 'Tarwi / Andean Lupin (Lupinus mutabilis)',
    balanceN: 95,
    balanceLabel: '+95',
    isPositive: true,
    description: 'Potent biological nitrogen fixer (+95 kg N/ha) and natural alkaloid biofumigant against soil-borne pathogens.',
    successor: {
      name: 'Native Andean Potato',
      balanceN: -70,
      balanceLabel: '-70',
      isPositive: false,
      description: 'Maximizes yield by leveraging fixed nitrogen and sanitized soil conditions left by Andean lupin.',
    },
  },
  maiz: {
    id: 'maiz_blanco',
    name: 'Giant White Corn (Zea mays)',
    balanceN: -50,
    balanceLabel: '-50',
    isPositive: false,
    description: 'Moderate nitrogen-extracting cereal. Generates abundant organic crop residue (stover).',
    successor: {
      name: 'Tarwi & Broad Beans',
      balanceN: 95,
      balanceLabel: '+95',
      isPositive: true,
      description: 'Restores extracted macronutrients and enhances beneficial soil microbiota.',
    },
  },
  quinua: {
    id: 'quinua',
    name: 'Real Andean Quinoa (Chenopodium quinoa)',
    balanceN: -30,
    balanceLabel: '-30',
    isPositive: false,
    description: 'Moderate fertility demand with high rusticity, salinity tolerance, and drought resistance.',
    successor: {
      name: 'Highland Broad Beans',
      balanceN: 75,
      balanceLabel: '+75',
      isPositive: true,
      description: 'Replenishes topsoil fertility layer prior to subsequent root or tuber cropping.',
    },
  },
  cebada: {
    id: 'cebada',
    name: 'Malting & Grain Barley (Hordeum vulgare)',
    balanceN: -30,
    balanceLabel: '-30',
    isPositive: false,
    description: 'Short-cycle rustic cereal. Frost-tolerant and supplies protective biomass for surface mulch.',
    successor: {
      name: 'Tarwi & Broad Beans',
      balanceN: 95,
      balanceLabel: '+95',
      isPositive: true,
      description: 'Restores nitrogen reserves while benefiting from surface mulch residue.',
    },
  },
};

function getCropAgronomics(parcel: ParcelItem | null, dbCrops?: Cultivo[]): AgronomicCropData {
  if (!parcel) return AGRONOMIC_MAP.papa;
  const raw = `${parcel.cropId || ''} ${parcel.cropName || ''} ${parcel.cropCategory || ''}`.toLowerCase();

  // If real Supabase crops are loaded, leverage them
  if (dbCrops && dbCrops.length > 0) {
    const found = dbCrops.find((c) => {
      const cid = c.crop_id.toLowerCase();
      const cname = c.nombre_comun.toLowerCase();
      return raw.includes(cid) || raw.includes(cname);
    });

    if (found) {
      const succId = found.sucesores_favorables?.[0] || 'tarwi';
      const succCrop = dbCrops.find((c) => c.crop_id.toLowerCase().includes(succId.toLowerCase()));
      const succBal = succCrop?.balance_nitrogeno_kg_ha ?? 95;
      const succName = succCrop?.nombre_comun || 'Tarwi / Andean Lupin';

      return {
        id: found.crop_id,
        name: found.nombre_comun,
        balanceN: found.balance_nitrogeno_kg_ha,
        balanceLabel: found.balance_nitrogeno_kg_ha > 0 ? `+${found.balance_nitrogeno_kg_ha}` : `${found.balance_nitrogeno_kg_ha}`,
        isPositive: found.balance_nitrogeno_kg_ha > 0,
        description: found.rompe_plaga_gorgojo
          ? 'Disrupts Andean potato weevil (Premnotrypes spp.) life cycle and enriches soil microbiota.'
          : 'Depletes topsoil nutrients; requires crop rotation with symbiotic legumes.',
        successor: {
          name: succName,
          balanceN: succBal,
          balanceLabel: succBal > 0 ? `+${succBal}` : `${succBal}`,
          isPositive: succBal > 0,
          description: `Favorable agroecological successor per INIA matrix with an edaphic balance of ${succBal > 0 ? '+' : ''}${succBal} kg N/ha.`,
        },
      };
    }
  }

  if (raw.includes('tarwi') || raw.includes('chocho')) return AGRONOMIC_MAP.tarwi;
  if (raw.includes('haba')) return AGRONOMIC_MAP.habas;
  if (raw.includes('maiz') || raw.includes('maíz')) return AGRONOMIC_MAP.maiz;
  if (raw.includes('quinua')) return AGRONOMIC_MAP.quinua;
  if (raw.includes('cebada')) return AGRONOMIC_MAP.cebada;
  return AGRONOMIC_MAP.papa;
}

export default function RotationTab({
  profile,
  cultivos = [],
  onNavigateToCopiloto,
  onToast,
  onOpenQgisDrawer,
  activeParcelId: propActiveParcelId,
  parcels: propParcels,
  onSelectParcel,
}: RotationTabProps) {
  const [activeSeasonTab, setActiveSeasonTab] = useState<'inmediato' | 'seca'>('inmediato');
  const [parcels, setParcels] = useState<ParcelItem[]>([]);
  const [activeParcel, setActiveParcel] = useState<ParcelItem | null>(null);
  const [rotateAreaHa, setRotateAreaHa] = useState<number>(profile.areaHa || 1.73);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Custom urea sack price states
  const [customSackPrice, setCustomSackPrice] = useState<number | undefined>(undefined);
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const [priceInputText, setPriceInputText] = useState<string>('');

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  // Sync parcels from props or storage
  useEffect(() => {
    if (propParcels && propParcels.length > 0) {
      setParcels(propParcels);
    } else {
      const list = getStoredParcels();
      setParcels(list);
    }
  }, [propParcels]);

  // Sync active parcel from props or storage
  useEffect(() => {
    const list = propParcels && propParcels.length > 0 ? propParcels : getStoredParcels();
    const targetId = propActiveParcelId || getActiveParcelId();
    const found = list.find((p) => p.id === targetId) || (list.length > 0 ? list[0] : null);
    if (found) {
      setActiveParcel(found);
      setRotateAreaHa(found.areaHa);
    }
  }, [propActiveParcelId, propParcels]);

  const handleSelectParcel = (p: ParcelItem) => {
    playBubblePop();
    setActiveParcel(p);
    setActiveParcelId(p.id);
    setRotateAreaHa(p.areaHa);
    setCustomSackPrice(undefined);
    setIsEditingPrice(false);
    if (onSelectParcel) {
      onSelectParcel(p.id);
    }
    if (onToast) onToast(`Plan adapted to ${p.name.split('•')[0].trim()}`);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRotateAreaHa(val);
  };

  // Dynamic upcoming months
  const immediateMonths = useMemo(() => getUpcomingMonths(currentDate, 4, 0), [currentDate]);
  const secondaryMonths = useMemo(() => getUpcomingMonths(currentDate, 3, 4), [currentDate]);

  // Agronomic data for the active parcel from Supabase matriz_cultivos
  const activeCropAgro = useMemo(() => getCropAgronomics(activeParcel, cultivos), [activeParcel, cultivos]);

  // Legume nitrogen fixation: if successor fixes N, use it; default 75 kg N/ha
  const legumeNitrogenKgHa =
    activeCropAgro.successor?.balanceN && activeCropAgro.successor.balanceN > 0
      ? activeCropAgro.successor.balanceN
      : 75;

  // Dynamic nitrogen savings calculated with regional fertilizer pricing matrix
  const savingsCalc = useMemo(() => {
    return calculateNitrogenSavings(
      rotateAreaHa,
      legumeNitrogenKgHa,
      customSackPrice,
      activeParcel?.microcuenca || profile.cuencaName,
      profile.distrito || profile.provincia
    );
  }, [
    rotateAreaHa,
    legumeNitrogenKgHa,
    customSackPrice,
    activeParcel?.microcuenca,
    profile.cuencaName,
    profile.distrito,
    profile.provincia,
  ]);

  // Dynamic campaign year string
  const campaignYear = currentDate.getFullYear();
  const nextYear = campaignYear + 1;

  // Timeline tasks adapted to the active parcel crop
  const getImmediateTasks = () => {
    const crop = activeParcel?.cropName || activeCropAgro.name;
    const raw = (activeParcel?.cropCategory || crop).toLowerCase();

    if (raw.includes('tarwi') || raw.includes('chocho') || raw.includes('haba')) {
      return [
        {
          title: 'Seedbed preparation & leveling',
          subtitle: `Week 3 - ${crop} - Field leveling & tilth`,
          icon: <Tractor className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Sowing & nodule inoculation',
          subtitle: 'First rains - Biological N-fixing strain incorporation',
          icon: <Sprout className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Manual weeding & light hilling',
          subtitle: 'Every 15 days - Root zone aeration',
          icon: <Leaf className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Flowering & moisture monitoring',
          subtitle: 'Pod filling - Calibrate SMAP radar telemetry',
          icon: <Droplets className="w-4 h-4 text-emerald-700" />,
        },
      ];
    }

    if (raw.includes('maiz') || raw.includes('maíz')) {
      return [
        {
          title: 'Contour furrowing & basal fertilization',
          subtitle: `Week 3 - ${crop} - Compost & organic manure incorporation`,
          icon: <Tractor className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Hill-drop corn sowing',
          subtitle: 'First stable rains - Optimal seed density',
          icon: <Sprout className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'First hilling & mechanical weeding',
          subtitle: 'Stem lodging support & moisture retention',
          icon: <Leaf className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Growth monitoring & SMAP telemetry',
          subtitle: 'Moisture deficit control & tasseling stage',
          icon: <Droplets className="w-4 h-4 text-emerald-700" />,
        },
      ];
    }

    if (raw.includes('quinua')) {
      return [
        {
          title: 'Fine seedbed tilth preparation',
          subtitle: `Week 3 - ${crop} - Surface leveling`,
          icon: <Tractor className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Continuous row precision sowing',
          subtitle: 'First rains - Shallow seed distribution',
          icon: <Sprout className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Weeding & first plant thinning',
          subtitle: 'At 25 days - Optimal inter-plant spacing',
          icon: <Leaf className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Panicle emergence & rusticity check',
          subtitle: 'Frost resilience - Calibrate SMAP radar telemetry',
          icon: <Droplets className="w-4 h-4 text-emerald-700" />,
        },
      ];
    }

    if (raw.includes('cebada')) {
      return [
        {
          title: 'Soil tillage & furrowing',
          subtitle: `Week 3 - ${crop} - Rustic seedbed`,
          icon: <Tractor className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Barley grain sowing & fertilization',
          subtitle: 'First rains - Organic amendment incorporation',
          icon: <Sprout className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Tillering stage monitoring',
          subtitle: 'Vigorous vegetative growth against frost',
          icon: <Leaf className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'SMAP calibration for heading stage',
          subtitle: 'Moisture retention prior to grain filling',
          icon: <Droplets className="w-4 h-4 text-emerald-700" />,
        },
      ];
    }

    return [
      {
        title: 'Contour furrow preparation',
        subtitle: `Week 3 - ${crop} - Moisture retention`,
        icon: <Tractor className="w-4 h-4 text-emerald-700" />,
      },
      {
        title: 'Planting & basal fertilization',
        subtitle: 'First rains - Selected certified seed distribution',
        icon: <Sprout className="w-4 h-4 text-emerald-700" />,
      },
      {
        title: 'High hilling & mulch cover',
        subtitle: 'Every 10 days - Prevent evaporative loss',
        icon: <Leaf className="w-4 h-4 text-emerald-700" />,
      },
      {
        title: 'Soil moisture & tuber bulking assessment',
        subtitle: 'Vegetative development - Calibrate SMAP',
        icon: <Droplets className="w-4 h-4 text-emerald-700" />,
      },
    ];
  };

  const immediateTasks = getImmediateTasks();

  return (
    <div className="space-y-4 animate-in fade-in pb-20">
      {/* 1. Header Section */}
      <div className="flex items-start justify-between px-1 pt-1">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
            CAMPAIGN PLAN - {campaignYear} / {nextYear}
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#132A1C] leading-tight">
            Schedule & Input Savings
          </h1>
        </div>

        <div className="bg-[#EBF2E5] text-[#4E6B38] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-[#D5E5CD]">
          <Leaf className="w-3 h-3 text-[#4E6B38]" />
          <span>SOUTHERN ANDES</span>
        </div>
      </div>

      {/* Parcel Selector Chips or Empty State Card */}
      {parcels.length > 0 ? (
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-1 block">
            SELECTED PARCEL
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
                    ({p.cropCategory || p.cropName})
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
            Configure your parcels to view your personalized rotation plan
          </h3>
          <p className="text-xs text-zinc-600 max-w-xs mx-auto">
            Delineate your field boundary in the satellite GIS viewer to calibrate nutrient demand.
          </p>
          {onOpenQgisDrawer && (
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onOpenQgisDrawer();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7BB63E] text-[#132A1C] font-semibold text-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Delineate with QGIS Viewer</span>
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
          <span className="block leading-tight">Immediate schedule</span>
          <span className="text-[9.5px] font-normal text-zinc-500 block">
            {immediateMonths[0]?.title} {immediateMonths[0]?.year} to {immediateMonths[3]?.title} {immediateMonths[3]?.year}
          </span>
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
          <span className="block leading-tight">Next campaign</span>
          <span className="text-[9.5px] font-normal text-zinc-500 block">
            {secondaryMonths[0]?.title} {secondaryMonths[0]?.year} to {secondaryMonths[2]?.title} {secondaryMonths[2]?.year}
          </span>
        </button>
      </div>

      {/* 3. Section: UPCOMING FOUR MONTHS */}
      <div className="space-y-2.5">
        <div className="px-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
            UPCOMING FOUR MONTHS
          </span>
          <h2 className="text-base font-semibold text-[#132A1C]">Scheduled Agronomic Operations</h2>
        </div>

        {activeSeasonTab === 'inmediato' ? (
          <div className="space-y-2 relative">
            <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-[#E5ECE2] z-0" />

            {immediateMonths.map((m, idx) => {
              const task = immediateTasks[idx] || immediateTasks[0];
              const isFirst = idx === 0;
              return (
                <div
                  key={`${m.short}-${m.year}`}
                  className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mb-1 ${
                          isFirst
                            ? 'bg-[#7BB63E] ring-4 ring-lime-100'
                            : 'bg-zinc-300 ring-4 ring-zinc-100'
                        }`}
                      />
                      <span
                        className={`text-[9.5px] uppercase font-semibold ${
                          isFirst ? 'font-bold text-emerald-900' : 'text-zinc-600'
                        }`}
                      >
                        {m.short}
                      </span>
                      <span className="text-[8px] text-zinc-400 font-mono">{m.year}</span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                      {task.icon}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                        {task.title}
                      </h3>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {task.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 relative">
            <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-[#E5ECE2] z-0" />

            {secondaryMonths.map((m, idx) => {
              const dryTasks = [
                {
                  title: 'Harvesting & seed selection',
                  subtitle: 'Seed grading & crop residue sorting',
                  icon: <Wheat className="w-4 h-4 text-emerald-700" />,
                },
                {
                  title: 'Protective mulch against frost',
                  subtitle: 'Apply barley stover or straw - 8 cm protective layer',
                  icon: <Leaf className="w-4 h-4 text-emerald-700" />,
                },
                {
                  title: 'Soil rest & rotational preparation',
                  subtitle: `Prepare parcel for rotational succession with ${activeCropAgro.successor.name}`,
                  icon: <Layers className="w-4 h-4 text-emerald-700" />,
                },
              ];
              const task = dryTasks[idx] || dryTasks[0];
              const isFirst = idx === 0;

              return (
                <div
                  key={`${m.short}-${m.year}`}
                  className="relative z-10 bg-white rounded-2xl p-3 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3 hover:border-emerald-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-center justify-center shrink-0 w-9 text-center">
                      <span
                        className={`w-2.5 h-2.5 rounded-full mb-1 ${
                          isFirst
                            ? 'bg-[#7BB63E] ring-4 ring-lime-100'
                            : 'bg-zinc-300 ring-4 ring-zinc-100'
                        }`}
                      />
                      <span
                        className={`text-[9.5px] uppercase font-semibold ${
                          isFirst ? 'font-bold text-emerald-900' : 'text-zinc-600'
                        }`}
                      >
                        {m.short}
                      </span>
                      <span className="text-[8px] text-zinc-400 font-mono">{m.year}</span>
                    </div>

                    <div className="w-8 h-8 rounded-xl bg-[#EAF3E3] flex items-center justify-center text-emerald-800 shrink-0">
                      {task.icon}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-[#132A1C] truncate">
                        {task.title}
                      </h3>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {task.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Section: RESIDUAL SOIL NUTRIENTS */}
      <div className="space-y-2.5">
        <div className="px-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
            RESIDUAL SOIL NUTRIENTS
          </span>
          <h2 className="text-base font-semibold text-[#132A1C]">Sequence Matters for Soil Health</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Card 1: Campaign 01 */}
          <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-xs border border-[#E5ECE2] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Sprout className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
              CAMPAIGN 01
            </span>
            <h4 className="text-xs font-semibold text-[#132A1C] truncate">
              {activeParcel?.cropName || activeCropAgro.name}
            </h4>
            <div
              className={`text-sm font-semibold ${
                activeCropAgro.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {activeCropAgro.balanceLabel}{' '}
              <span className="text-[10px] font-normal text-zinc-500">kg N/ha</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-snug">
              {activeCropAgro.description}
            </p>
          </div>

          <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />

          {/* Card 2: Campaign 02 */}
          <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-xs border border-[#E5ECE2] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
              CAMPAIGN 02
            </span>
            <h4 className="text-xs font-semibold text-[#132A1C] truncate">
              {activeCropAgro.successor.name}
            </h4>
            <div
              className={`text-sm font-semibold ${
                activeCropAgro.successor.isPositive ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {activeCropAgro.successor.balanceLabel}{' '}
              <span className="text-[10px] font-normal text-zinc-500">kg N/ha</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-snug">
              {activeCropAgro.successor.description}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Section: INPUT SAVINGS SIMULATOR */}
      <div className="bg-[#1B3B22] rounded-3xl p-5 text-white shadow-md border border-emerald-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A3E635]">
            INPUT SAVINGS SIMULATOR
          </span>
          <div className="w-7 h-7 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-[#A3E635]">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-semibold text-white leading-tight">
            Fewer synthetic inputs,{' '}
            <span className="italic text-[#A3E635] font-normal">
              living, resilient soil.
            </span>
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Estimate synthetic fertilizer savings through legume rotation using local micro-watershed pricing.
          </p>
        </div>

        {/* Parcel selector for microcuenca pricing */}
        {parcels.length > 1 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-semibold text-[#A3E635] uppercase tracking-wider block">
              Select parcel for local micro-watershed pricing:
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
                        ? 'bg-[#A3E635] text-[#132A1C] font-bold shadow-xs'
                        : 'bg-emerald-950/80 text-zinc-200 border border-emerald-700/50 hover:bg-emerald-900'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isSel ? 'text-[#132A1C]' : 'text-[#A3E635]'}`} />
                    <span>{p.name.split('•')[0].trim()}</span>
                    <span className={`text-[10px] ${isSel ? 'text-emerald-950 font-semibold' : 'text-zinc-400'}`}>
                      ({p.cropCategory || p.cropName})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Microcuenca Location & Fertilizer Price Banner */}
        <div className="bg-[#132A1C]/90 rounded-2xl p-3.5 border border-emerald-800/40 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />
              <span className="font-semibold text-white truncate">
                {activeParcel ? activeParcel.name.split('•')[0].trim() : profile.parcelName}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 shrink-0 ml-2">
              {activeParcel?.microcuenca || profile.cuencaName || 'Cusco Highlands'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-emerald-800/30">
            <div>
              <span className="text-[9.5px] uppercase tracking-wider text-zinc-400 block">
                Urea Sack Price (50 kg)
              </span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-base font-bold text-[#A3E635] font-mono">
                  S/ {savingsCalc.pricePerSack}
                </span>
                <span className="text-[10px] text-zinc-300 font-normal">
                  / sack
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                  savingsCalc.isCustomPrice
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {savingsCalc.fuente}
                </span>
              </div>
            </div>

            {!isEditingPrice && (
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setPriceInputText(String(savingsCalc.pricePerSack));
                  setIsEditingPrice(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-[11px] text-[#A3E635] flex items-center gap-1 transition cursor-pointer shrink-0"
                title="Edit sack price if purchased at a different price"
              >
                <Edit3 className="w-3 h-3" />
                <span>Modify</span>
              </button>
            )}
          </div>

          {/* Inline Edit Form */}
          {isEditingPrice && (
            <div className="pt-2 border-t border-emerald-800/30 space-y-2">
              <label className="text-[10px] text-zinc-300 block">
                Enter price paid at local market (PEN per 50 kg sack):
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="40"
                    max="200"
                    value={priceInputText}
                    onChange={(e) => setPriceInputText(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-emerald-950 text-white font-mono text-sm border border-[#7BB63E] focus:outline-hidden"
                    autoFocus
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const val = parseFloat(priceInputText);
                    if (!isNaN(val) && val > 0) {
                      playSuccessFanfare();
                      setCustomSackPrice(val);
                      setIsEditingPrice(false);
                      if (onToast) onToast(`Urea sack price adjusted to S/ ${val}`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#7BB63E] text-[#132A1C] font-bold text-xs hover:bg-[#8CD045] transition cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPrice(false)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-950 text-zinc-400 text-xs hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reset button if custom price is active */}
          {savingsCalc.isCustomPrice && !isEditingPrice && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setCustomSackPrice(undefined);
                  if (onToast) onToast('Reset to official MIDAGRI SISAP pricing');
                }}
                className="text-[10px] text-zinc-400 hover:text-emerald-300 underline flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to official MIDAGRI benchmark</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-300">Rotational Area</span>
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
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 block">
              ESTIMATED FERTILIZER SAVINGS
            </span>
            <span className="text-2xl font-bold text-[#A3E635] font-mono block">
              S/ {savingsCalc.totalSavings.toLocaleString('en-US')}
            </span>
            <span className="text-[10px] text-zinc-300 block">
              Avoids ~{savingsCalc.totalSacksAvoided} urea sacks (S/ {savingsCalc.pricePerSack}/sack) across {rotateAreaHa.toFixed(1)} ha
            </span>
            <span className="text-[9px] text-zinc-400 block">
              Equivalent to ~{savingsCalc.sacksAvoidedPerHa} sacks saved per hectare of legume succession
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-[#A3E635] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
