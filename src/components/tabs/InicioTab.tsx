'use client';

import React, { useState, useEffect } from 'react';
import { ClimaNasa, FarmerProfile, ParcelItem } from '@/lib/types';
import {
  Bell,
  MapPin,
  Sun,
  Droplets,
  CloudRain,
  Wind,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Leaf,
  Sprout,
  ShieldCheck,
  X,
} from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import { getStoredParcels, setActiveParcelId } from '@/lib/deviceProfile';

interface InicioTabProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  smapPercent: number;
  hardwareId?: string;
  isElNino?: boolean;
  onOpenWizard?: () => void;
  onNavigateToParcelas?: (parcelId?: string) => void;
  onNavigateToRotacion?: () => void;
  onNavigateToCopiloto?: () => void;
  onOpenNews?: () => void;
  onOpenSettings?: () => void;
}

export default function InicioTab({
  profile,
  climaNasa,
  smapPercent = 16,
  hardwareId,
  isElNino,
  onOpenWizard,
  onNavigateToParcelas,
  onNavigateToRotacion,
  onNavigateToCopiloto,
  onOpenNews,
  onOpenSettings,
}: InicioTabProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('Todos');
  const [activeConsejoVoice, setActiveConsejoVoice] = useState<'astro' | 'kipu'>('astro');
  const [parcels, setParcels] = useState<ParcelItem[]>([]);

  // Live dynamic local time formatting (e.g. 15:55)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-PE', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Read real stored parcels
  useEffect(() => {
    const stored = getStoredParcels();
    setParcels(stored);
  }, []);

  // Dynamic filter pills derived from real parcels
  const availableFilters = React.useMemo(() => {
    const base = ['Todos'];
    const categories = Array.from(
      new Set(
        parcels
          .map((p) => p.cropCategory || p.cropName)
          .filter(Boolean) as string[]
      )
    );
    return [...base, ...categories];
  }, [parcels]);

  const filteredParcels = selectedCropFilter === 'Todos'
    ? parcels
    : parcels.filter(
        (p) =>
          p.cropCategory === selectedCropFilter ||
          p.cropName === selectedCropFilter
      );

  // Circular gauge calculations and dynamic smooth animation
  const healthScore = (profile as any)?.healthScore || 78;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(healthScore);
    }, 120);
    return () => clearTimeout(timer);
  }, [healthScore]);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;
  const scoreStatus = healthScore >= 75 ? 'BUEN ESTADO' : healthScore >= 50 ? 'REGULAR' : 'ALERTA';
  const scoreColor = healthScore >= 75 ? '#7BB63E' : healthScore >= 50 ? '#F59E0B' : '#EF4444';

  // Real or calibrated telemetry readings
  const tempC = climaNasa?.temp_media_c ? Math.round(climaNasa.temp_media_c) : 21;
  const rainMm = climaNasa?.precipitacion_mm ? climaNasa.precipitacion_mm.toFixed(1) : '2.4';
  const windKm = 14;

  // Agricultural warning banner calculated dynamically from SMAP and NASA weather
  const agriculturalBanner = React.useMemo(() => {
    const isFrostRisk = climaNasa?.alerta_helada || tempC <= 2;
    if (isFrostRisk) {
      return {
        title: 'Alerta de helada en la zona',
        description: `Temperatura estimada en ${tempC}°C. Protege los brotes con mulch o riego nocturno.`,
        bg: 'bg-[#EFF6FF] border-[#BFDBFE]',
        iconBg: 'bg-blue-100/90 border-blue-300/50 text-blue-800',
        icon: <AlertTriangle className="w-4 h-4 text-blue-700" />,
      };
    }
    if (smapPercent < 15) {
      return {
        title: 'Protege el suelo, no quemes el rastrojo',
        description: `Humedad SMAP baja (${smapPercent}%). La cobertura conserva humedad en días secos.`,
        bg: 'bg-[#FDF8F0] border-[#F2E5D0]',
        iconBg: 'bg-amber-100/90 border-amber-300/50 text-amber-800',
        icon: <AlertTriangle className="w-4 h-4 text-amber-700" />,
      };
    }
    if (smapPercent > 35) {
      return {
        title: 'Humedad alta en el suelo',
        description: `Humedad SMAP en ${smapPercent}%. Revisa zanjas de drenaje para evitar asfixia radicular.`,
        bg: 'bg-[#ECFDF5] border-[#A7F3D0]',
        iconBg: 'bg-emerald-100/90 border-emerald-300/50 text-emerald-800',
        icon: <Droplets className="w-4 h-4 text-emerald-700" />,
      };
    }
    return {
      title: 'Condiciones favorables en el suelo',
      description: `Humedad SMAP óptima (${smapPercent}%). Buen momento para labores de aporque y abonado.`,
      bg: 'bg-[#F0FDF4] border-[#BBF7D0]',
      iconBg: 'bg-emerald-100/90 border-emerald-300/50 text-emerald-800',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700" />,
    };
  }, [climaNasa, tempC, smapPercent]);

  // Dynamic recommendation based on parcel crop and SMAP humidity
  const getParcelRecommendation = (parcel: ParcelItem) => {
    const cropLower = (parcel.cropCategory || parcel.cropName || '').toLowerCase();
    const smap = parcel.smapHumidity ?? smapPercent;

    if (smap < 15) {
      return {
        title: 'Conservar humedad con mulch',
        description: `Humedad SMAP en ${smap}%. Mantén cobertura de rastrojo frente a la sequía.`,
        icon: <Leaf className="w-4 h-4 text-emerald-800" />,
      };
    }
    if (cropLower.includes('tarwi') || cropLower.includes('haba')) {
      return {
        title: 'Fijación biológica de nitrógeno',
        description: 'Leguminosa activa aportando fertilidad natural y rompiendo plagas.',
        icon: <Sprout className="w-4 h-4 text-emerald-800" />,
      };
    }
    if (cropLower.includes('maiz') || cropLower.includes('maíz')) {
      return {
        title: 'Surcos en contorno',
        description: 'Retienen el agua de lluvia y reducen el lavado de nutrientes en ladera.',
        icon: <Sun className="w-4 h-4 text-emerald-800" />,
      };
    }
    if (cropLower.includes('quinua')) {
      return {
        title: 'Resistencia a heladas y sequía',
        description: 'Monitorea vigor Sentinel-2 con alta resiliencia climática.',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-800" />,
      };
    }
    return {
      title: 'Manejo agroecológico de suelo',
      description: `Abonado orgánico y aporque oportuno para ${parcel.cropName}.`,
      icon: <Sprout className="w-4 h-4 text-emerald-800" />,
    };
  };

  return (
    <div className="space-y-4 animate-in fade-in -mx-4 -mt-4 pb-24">
      {/* =========================================================================
          HERO SUPERIOR: FOTO ANDINA + HEADER + GREETING + WEATHER GLASS CARD
         ========================================================================= */}
      <div className="relative w-full overflow-hidden bg-emerald-950 px-4 pt-4 pb-6 rounded-b-[2.5rem] shadow-lg">
        {/* Andean Mountain Photographic Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70 scale-105"
          style={{ backgroundImage: "url('/images/andes_bright.jpg')" }}
        />
        {/* Soft dark gradient mask over mountain photo for optimal legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-[#132A1C]/90" />

        <div className="relative z-10 space-y-4 max-w-md mx-auto">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#7BB63E] flex items-center justify-center text-[#132A1C] shadow-xs">
                <Sprout className="w-5 h-5 text-[#132A1C]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight lowercase">
                terraquipu
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                playBubblePop();
                if (onOpenNews) onOpenNews();
              }}
              className="relative w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition active:scale-95 cursor-pointer shadow-md"
              title="Ver boletines científicos y alertas ENOS"
              aria-label="Ver boletines científicos y alertas ENOS"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#7BB63E] ring-2 ring-emerald-950" />
            </button>
          </div>

          {/* Farmer Greeting Chip */}
          <div className="flex items-center gap-3 pt-0.5">
            <div className="w-10 h-10 rounded-full bg-[#E5ECE2] text-[#132A1C] font-bold text-sm flex items-center justify-center shadow-md border border-white/40">
              {(profile?.farmerName || 'Miguel').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Hola, {profile?.farmerName || 'Miguel'}
              </h2>
              <p className="text-xs text-white/80 font-normal">
                Comunidad {profile.distrito || profile.cuencaName || 'Urubamba'}
              </p>
            </div>
          </div>

          {/* Weather Glassmorphic Dark Forest Green Card */}
          <div className="bg-[#1B3B22]/90 backdrop-blur-md rounded-3xl p-5 border border-emerald-500/20 shadow-2xl text-white space-y-3.5">
            {/* Top Row: Location & Soleado */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#A3E635] shrink-0" />
                <div className="leading-tight truncate">
                  <span className="font-semibold text-white/95 block truncate">
                    Microcuenca {profile.distrito || 'Vilcanota'}
                  </span>
                  <span className="text-[10px] text-white/70">
                    {profile.departamento || 'Cusco'} · {profile.altitude || 3400} msnm
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/20 text-[#FACC15] font-semibold text-[10.5px] tracking-wider uppercase shrink-0">
                <Sun className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>SOLEADO</span>
              </div>
            </div>

            {/* Middle Row: Temperature + Riesgo de sequía */}
            <div className="flex items-baseline gap-3 pt-0.5">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {tempC}°C
              </span>
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-white/90 block">
                  Riesgo de sequía
                </span>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Moderado · hoy</span>
                </div>
              </div>
            </div>

            {/* Divider + 3 Metrics Row */}
            <div className="pt-2 border-t border-emerald-500/20">
              <div className="grid grid-cols-3 gap-2 text-left">
                {/* Metric 1: Humedad SMAP */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-[#A3E635] shrink-0">
                    <Droplets className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9.5px] text-white/70 block truncate">
                      Humedad · SMAP
                    </span>
                    <span className="text-xs font-semibold text-white/95">
                      {smapPercent}%
                    </span>
                  </div>
                </div>

                {/* Metric 2: Lluvia GPM */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-[#A3E635] shrink-0">
                    <CloudRain className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9.5px] text-white/70 block truncate">
                      Lluvia · GPM
                    </span>
                    <span className="text-xs font-semibold text-white/95">
                      {rainMm} mm
                    </span>
                  </div>
                </div>

                {/* Metric 3: Viento */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-900/60 border border-emerald-500/30 flex items-center justify-center text-[#A3E635] shrink-0">
                    <Wind className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9.5px] text-white/70 block truncate">
                      Viento
                    </span>
                    <span className="text-xs font-semibold text-white/95">
                      {windKm} km/h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-bar: REPORTE DE CAMPO · HORA REAL EN VIVO */}
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-300/80 pt-2 border-t border-emerald-500/15">
              <span className="font-semibold tracking-wider text-emerald-300 uppercase">
                REPORTE DE CAMPO
              </span>
              <span>HOY · {currentTime || 'EN VIVO'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTENIDO INFERIOR: SALUD DEL SUELO + ALERTA DINÁMICA + PARCELAS + CONSEJO
         ========================================================================= */}
      <div className="px-4 space-y-4 max-w-md mx-auto">
        {/* 1. SECCIÓN SALUD DEL SUELO */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800/80 block">
              SALUD DEL SUELO
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-800 leading-tight">
              Tu suelo está{' '}
              <span className="italic text-emerald-800 font-normal">
                respondiendo bien.
              </span>
            </h1>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Pequeñas prácticas de hoy protegen la cosecha de mañana.
            </p>
          </div>

          {/* Circular Gauge */}
          <div className="relative shrink-0 flex flex-col items-center justify-center w-20 h-20">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80" width={80} height={80}>
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#E5ECE2"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke={scoreColor}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-lg font-bold text-zinc-800 leading-none">
                {healthScore}<span className="text-[10px] text-zinc-500 font-normal">/100</span>
              </span>
              <span className="text-[7.5px] font-semibold text-emerald-800 uppercase tracking-tight mt-0.5">
                {scoreStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 2. ALERTA DINÁMICA MOMENTÁNEA / DESCARTABLE */}
        {!isBannerDismissed && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              playBubblePop();
              if (onNavigateToRotacion) onNavigateToRotacion();
            }}
            className={`w-full text-left rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs border transition cursor-pointer ${agriculturalBanner.bg}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${agriculturalBanner.iconBg}`}>
                {agriculturalBanner.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-zinc-800 leading-tight truncate">
                  {agriculturalBanner.title}
                </h4>
                <p className="text-[11px] text-zinc-600 leading-snug mt-0.5 font-normal">
                  {agriculturalBanner.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  playBubblePop();
                  setIsBannerDismissed(true);
                }}
                className="p-1 rounded-full hover:bg-black/10 text-zinc-400 hover:text-zinc-600 transition"
                title="Descartar aviso"
              >
                <X className="w-4 h-4" />
              </button>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
        )}

        {/* 3. SECCIÓN CAMPO Y SABERES (MIS PARCELAS DINÁMICAS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900/60 block">
                CAMPO Y SABERES
              </span>
              <h2 className="text-base sm:text-lg font-bold text-zinc-800">Mis parcelas</h2>
            </div>
            {onNavigateToParcelas && (
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  onNavigateToParcelas();
                }}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition"
              >
                <span>Ver mapa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          {parcels.length > 0 && availableFilters.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {availableFilters.map((filter) => {
                const isSelected = selectedCropFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      playBubblePop();
                      setSelectedCropFilter(filter);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
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
          )}

          {/* Real Parcels Grid or Empty State Card */}
          {filteredParcels.length > 0 ? (
            <div className={`grid ${filteredParcels.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
              {filteredParcels.map((parcel) => {
                const rec = getParcelRecommendation(parcel);
                return (
                  <div
                    key={parcel.id}
                    onClick={() => {
                      playBubblePop();
                      setActiveParcelId(parcel.id);
                      if (onNavigateToParcelas) onNavigateToParcelas(parcel.id);
                    }}
                    className="relative overflow-hidden rounded-3xl bg-[#132A1C] text-white shadow-sm border border-emerald-900/40 flex flex-col justify-between min-h-[220px] p-3.5 cursor-pointer group hover:shadow-md transition"
                  >
                    {/* Image Backdrop with subtle dark gradient mask */}
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-45 group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${parcel.photoUrl || '/images/andes_bright.jpg'}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#132A1C] via-[#132A1C]/75 to-transparent" />

                    {/* Top Row: Crop Tag & Checkmark */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-white/90 bg-[#132A1C]/80 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-xs truncate max-w-[120px]">
                        {parcel.cropCategory || parcel.cropName}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" />
                      </div>
                    </div>

                    {/* Bottom Content: Icon Badge + Parcel Name + Area + Rec */}
                    <div className="relative z-10 space-y-1 mt-auto pt-6">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-xl bg-[#A3E635] flex items-center justify-center shadow-xs">
                          {rec.icon}
                        </div>
                        <span className="text-[10px] font-mono text-lime-300 font-semibold">
                          {parcel.areaHa} ha · {parcel.areaTopos || Number((parcel.areaHa * 3.3).toFixed(1))} topos
                        </span>
                      </div>
                      <h3 className="text-xs font-semibold text-white leading-tight truncate">
                        {parcel.name}
                      </h3>
                      <p className="text-[10.5px] text-emerald-200 font-medium leading-snug">
                        {rec.title}
                      </p>
                      <p className="text-[9.5px] text-zinc-300 leading-snug line-clamp-2 font-normal">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-[#E5ECE2] text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mx-auto shadow-xs">
                <Sprout className="w-6 h-6 text-emerald-800" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-800">
                  Aún no has delimitado tus parcelas
                </h3>
                <p className="text-xs text-zinc-600 max-w-xs mx-auto">
                  Dibuja el contorno de tu chacra en el visor satelital para calibrar humedad y recomendaciones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  if (onNavigateToParcelas) {
                    onNavigateToParcelas();
                  } else if (onOpenWizard) {
                    onOpenWizard();
                  }
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-semibold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <span>Delimitar mi primera parcela</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 4. SECCIÓN CONSEJO DEL DÍA ("DOS MIRADAS, UNA CHACRA") */}
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900/60 block">
                CONSEJO DEL DÍA
              </span>
              <h2 className="text-base font-bold text-zinc-800">
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
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer transition"
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                activeConsejoVoice === 'astro'
                  ? 'bg-[#132A1C] text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Astro · NASA</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setActiveConsejoVoice('kipu');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                activeConsejoVoice === 'kipu'
                  ? 'bg-[#132A1C] text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-500" />
              <span>Kipu · saber local</span>
            </button>
          </div>

          {/* Dynamic Advice Text */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] text-xs text-zinc-700 leading-relaxed">
            {activeConsejoVoice === 'astro' ? (
              <p className="italic text-zinc-700 text-[12.5px] leading-relaxed font-normal">
                &ldquo;SMAP observa humedad en {smapPercent}%. Mantén mulch de 5 a 8 cm y revisa el surco al amanecer para evaluar retención.&rdquo;
              </p>
            ) : (
              <p className="italic text-zinc-700 text-[12.5px] leading-relaxed font-normal">
                &ldquo;La luna menguante pide cuidar la humedad de la raíz. No remuevas la tierra en horas de sol fuerte y aporca con tierra fresca.&rdquo;
              </p>
            )}
          </div>

          {/* Footnote */}
          <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 font-normal pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Datos satelitales actualizados · SMAP, GPM y NDVI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
