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
  const shortNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
  const titleNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
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
    name: 'Papa Nativa Andina',
    balanceN: -70,
    balanceLabel: '-70',
    isPositive: false,
    description: 'Demanda nitrógeno. Consume los nutrientes del suelo preparado.',
    successor: {
      name: 'Tarwi y Habas',
      balanceN: 95,
      balanceLabel: '+95',
      isPositive: true,
      description: 'Leguminosas fijan nitrógeno en las raíces y rompen el ciclo del gorgojo.',
    },
  },
  habas: {
    id: 'habas',
    name: 'Habas Andinas',
    balanceN: 75,
    balanceLabel: '+75',
    isPositive: true,
    description: 'Leguminosa fijadora simbiótica. Enriquece el suelo con nitrógeno orgánico.',
    successor: {
      name: 'Maíz Blanco Gigante',
      balanceN: -50,
      balanceLabel: '-50',
      isPositive: false,
      description: 'Gramínea de alto rendimiento que aprovecha el nitrógeno residual de las habas.',
    },
  },
  tarwi: {
    id: 'tarwi',
    name: 'Tarwi / Chocho',
    balanceN: 95,
    balanceLabel: '+95',
    isPositive: true,
    description: 'Poderoso fijador de nitrógeno (+95 kg N/ha) y biofumigante natural con alcaloides.',
    successor: {
      name: 'Papa Nativa',
      balanceN: -70,
      balanceLabel: '-70',
      isPositive: false,
      description: 'Aprovecha al máximo el nitrógeno y suelo desinfectado dejado por el tarwi.',
    },
  },
  maiz: {
    id: 'maiz_blanco',
    name: 'Maíz Blanco Gigante',
    balanceN: -50,
    balanceLabel: '-50',
    isPositive: false,
    description: 'Gramínea extractora moderada de nitrógeno. Aporta abundante rastrojo superficial.',
    successor: {
      name: 'Tarwi y Habas',
      balanceN: 95,
      balanceLabel: '+95',
      isPositive: true,
      description: 'Restaura los macronutrientes consumidos y mejora la microbiología del suelo.',
    },
  },
  quinua: {
    id: 'quinua',
    name: 'Quinua Roja / Real',
    balanceN: -30,
    balanceLabel: '-30',
    isPositive: false,
    description: 'Demanda moderada de fertilidad con gran rusticidad y tolerancia a sequías.',
    successor: {
      name: 'Habas serranas',
      balanceN: 75,
      balanceLabel: '+75',
      isPositive: true,
      description: 'Recupera la capa fértil antes de volver a sembrar cultivos de raíz.',
    },
  },
  cebada: {
    id: 'cebada',
    name: 'Cebada Grano',
    balanceN: -30,
    balanceLabel: '-30',
    isPositive: false,
    description: 'Cereal rústico de ciclo corto. Tolera heladas y aporta rastrojo para mulch.',
    successor: {
      name: 'Tarwi y Habas',
      balanceN: 95,
      balanceLabel: '+95',
      isPositive: true,
      description: 'Leguminosa que restaura nitrógeno y aprovecha la cobertura del rastrojo.',
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
      const succName = succCrop?.nombre_comun || 'Tarwi Chocho';

      return {
        id: found.crop_id,
        name: found.nombre_comun,
        balanceN: found.balance_nitrogeno_kg_ha,
        balanceLabel: found.balance_nitrogeno_kg_ha > 0 ? `+${found.balance_nitrogeno_kg_ha}` : `${found.balance_nitrogeno_kg_ha}`,
        isPositive: found.balance_nitrogeno_kg_ha > 0,
        description: found.rompe_plaga_gorgojo
          ? 'Rompe el ciclo del gorgojo andino y enriquece la microbiología del suelo.'
          : 'Demanda nutrientes del suelo preparado; requiere rotación con leguminosas.',
        successor: {
          name: succName,
          balanceN: succBal,
          balanceLabel: succBal > 0 ? `+${succBal}` : `${succBal}`,
          isPositive: succBal > 0,
          description: `Sucesor agroecológico favorable según matriz INIA con balance de ${succBal > 0 ? '+' : ''}${succBal} kg N/ha.`,
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
    if (onToast) onToast(`Plan adaptado a ${p.name.split('•')[0].trim()}`);
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
          title: 'Preparación de cama de siembra',
          subtitle: `Semana 3 · ${crop} · Nivelación del terreno`,
          icon: <Tractor className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Siembra e inoculación de nódulos',
          subtitle: 'Primera lluvia · Incorporación de cepas fijadoras de N',
          icon: <Sprout className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Deshierbe manual y aporque ligero',
          subtitle: 'Cada 15 días · Oxigenación de las raíces',
          icon: <Leaf className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Monitoreo de floración y humedad',
          subtitle: 'Llenado de vainas · Calibrar radar SMAP',
          icon: <Droplets className="w-4 h-4 text-emerald-700" />,
        },
      ];
    }

    if (raw.includes('maiz') || raw.includes('maíz')) {
      return [
        {
          title: 'Surcos en contorno y abonado base',
          subtitle: `Semana 3 · ${crop} · Incorporar guano de corral`,
          icon: <Tractor className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Siembra de maíz en golpe',
          subtitle: 'Primeras lluvias firmes · Densidad óptima de semilla',
          icon: <Sprout className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Primer aporque y deshierbe',
          subtitle: 'Soporte del tallo contra viento y retención de humedad',
          icon: <Leaf className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Monitoreo de crecimiento y SMAP',
          subtitle: 'Control preventivo de humedad y espigado',
          icon: <Droplets className="w-4 h-4 text-emerald-700" />,
        },
      ];
    }

    if (raw.includes('quinua')) {
      return [
        {
          title: 'Preparación de cama fina y mullida',
          subtitle: `Semana 3 · ${crop} · Nivelación del suelo`,
          icon: <Tractor className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Siembra en líneas continuas',
          subtitle: 'Primeras lluvias · Distribución superficial de semilla',
          icon: <Sprout className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Deshierbe y primer raleo',
          subtitle: 'A los 25 días · Espaciamiento óptimo entre plantas',
          icon: <Leaf className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Monitoreo de panoja y rusticidad',
          subtitle: 'Resistencia a heladas · Calibrar radar SMAP',
          icon: <Droplets className="w-4 h-4 text-emerald-700" />,
        },
      ];
    }

    if (raw.includes('cebada')) {
      return [
        {
          title: 'Preparación de suelo y surcado',
          subtitle: `Semana 3 · ${crop} · Cama de siembra rústica`,
          icon: <Tractor className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Siembra de grano y abonado',
          subtitle: 'Primeras lluvias · Incorporación de abono orgánico',
          icon: <Sprout className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Monitoreo de macollamiento',
          subtitle: 'Desarrollo vegetativo vigoroso contra heladas',
          icon: <Leaf className="w-4 h-4 text-emerald-700" />,
        },
        {
          title: 'Calibración SMAP para espigado',
          subtitle: 'Retención de humedad antes de la fase de grano',
          icon: <Droplets className="w-4 h-4 text-emerald-700" />,
        },
      ];
    }

    return [
      {
        title: 'Preparar surcos en contorno',
        subtitle: `Semana 3 · ${crop} · Retención de humedad`,
        icon: <Tractor className="w-4 h-4 text-emerald-700" />,
      },
      {
        title: 'Siembra y abonado de fondo',
        subtitle: 'Primeras lluvias · Distribución de semilla seleccionada',
        icon: <Sprout className="w-4 h-4 text-emerald-700" />,
      },
      {
        title: 'Aporque alto y cobertura de rastrojo',
        subtitle: 'Cada 10 días · Evitar evaporación del suelo',
        icon: <Leaf className="w-4 h-4 text-emerald-700" />,
      },
      {
        title: 'Medir humedad del suelo y tubérculos',
        subtitle: 'Desarrollo vegetativo · Calibrar SMAP',
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
            PLAN DE CAMPAÑA · {campaignYear} / {nextYear}
          </span>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#132A1C] leading-tight">
            Cronograma y ahorro
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
          <span className="text-[9.5px] font-normal text-zinc-500 block">
            {immediateMonths[0]?.title} {immediateMonths[0]?.year} a {immediateMonths[3]?.title} {immediateMonths[3]?.year}
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
          <span className="block leading-tight">Campaña siguiente</span>
          <span className="text-[9.5px] font-normal text-zinc-500 block">
            {secondaryMonths[0]?.title} {secondaryMonths[0]?.year} a {secondaryMonths[2]?.title} {secondaryMonths[2]?.year}
          </span>
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
                  title: 'Cosecha y selección de grano',
                  subtitle: 'Selección de semilla y clasificación de rastrojo',
                  icon: <Wheat className="w-4 h-4 text-emerald-700" />,
                },
                {
                  title: 'Mulch protector contra heladas',
                  subtitle: 'Extender rastrojo de cebada o chala · Cobertura 8 cm',
                  icon: <Leaf className="w-4 h-4 text-emerald-700" />,
                },
                {
                  title: 'Descanso del suelo y rotación',
                  subtitle: `Preparar terreno para rotar con ${activeCropAgro.successor.name}`,
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

      {/* 4. Section: NUTRIENTES QUE SE QUEDAN (DINÁMICO CON DATOS VERÍDICOS) */}
      <div className="space-y-2.5">
        <div className="px-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
            NUTRIENTES QUE SE QUEDAN
          </span>
          <h2 className="text-base font-semibold text-[#132A1C]">La secuencia importa</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Card 1: Campaña 01 (Cultivo real de la parcela activa) */}
          <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-xs border border-[#E5ECE2] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Sprout className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
              CAMPAÑA 01
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

          {/* Card 2: Campaña 02 (Sucesor agronómico favorable) */}
          <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-xs border border-[#E5ECE2] space-y-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
              CAMPAÑA 02
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
            Estima el ahorro en fertilizantes con una rotación de leguminosas según los precios de tu microcuenca.
          </p>
        </div>

        {/* Selector de parcelas para ver el precio de cada una allí */}
        {parcels.length > 1 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-semibold text-[#A3E635] uppercase tracking-wider block">
              Elegir parcela para ver precio local:
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
              {activeParcel?.microcuenca || profile.cuencaName || 'Cusco Sierra'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-emerald-800/30">
            <div>
              <span className="text-[9.5px] uppercase tracking-wider text-zinc-400 block">
                Precio de Urea (50 kg)
              </span>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-base font-bold text-[#A3E635] font-mono">
                  S/ {savingsCalc.pricePerSack}
                </span>
                <span className="text-[10px] text-zinc-300 font-normal">
                  / saco
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
                title="Editar precio del saco si compraste a otro valor"
              >
                <Edit3 className="w-3 h-3" />
                <span>Modificar</span>
              </button>
            )}
          </div>

          {/* Inline Edit Form */}
          {isEditingPrice && (
            <div className="pt-2 border-t border-emerald-800/30 space-y-2">
              <label className="text-[10px] text-zinc-300 block">
                Ingresa el precio pagado en tu feria local (S/ por saco de 50 kg):
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
                      if (onToast) onToast(`Precio de urea ajustado a S/ ${val}`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#7BB63E] text-[#132A1C] font-bold text-xs hover:bg-[#8CD045] transition cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Listo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPrice(false)}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-950 text-zinc-400 text-xs hover:text-white transition cursor-pointer"
                >
                  Cancelar
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
                  if (onToast) onToast('Restablecido a precio oficial MIDAGRI SISAP');
                }}
                className="text-[10px] text-zinc-400 hover:text-emerald-300 underline flex items-center gap-1 cursor-pointer transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer a precio oficial MIDAGRI</span>
              </button>
            </div>
          )}
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
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 block">
              AHORRO ESTIMADO EN ABONOS
            </span>
            <span className="text-2xl font-bold text-[#A3E635] font-mono block">
              S/ {savingsCalc.totalSavings.toLocaleString('es-PE')}
            </span>
            <span className="text-[10px] text-zinc-300 block">
              Ahorro de ~{savingsCalc.totalSacksAvoided} sacos de urea (S/ {savingsCalc.pricePerSack}/saco) en {rotateAreaHa.toFixed(1)} ha
            </span>
            <span className="text-[9px] text-zinc-400 block">
              Equivale a ~{savingsCalc.sacksAvoidedPerHa} sacos evitados por cada ha de leguminosa
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
