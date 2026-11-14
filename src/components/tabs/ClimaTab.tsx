'use client';

import React, { useState } from 'react';
import { ClimaNasa, FarmerProfile } from '@/lib/types';
import { ArrowLeft, Sparkles, ShieldCheck, Thermometer, CloudRain, Bug } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import AgroClimaNewsFeed from '@/components/AgroClimaNewsFeed';
import WeatherForecastCard from '@/components/WeatherForecastCard';
import ElNinoSimulatorCard from '@/components/ElNinoSimulatorCard';
import ClimaCarouselBanner from '@/components/ClimaCarouselBanner';
import SanidadVegetalModal from '@/components/SanidadVegetalModal';

interface ClimaTabProps {
  profile: FarmerProfile;
  climaNasa: ClimaNasa | null;
  isElNino: boolean;
  onToast: (msg: string) => void;
  onToggleElNino?: (val: boolean) => void;
}

export default function ClimaTab({
  profile,
  climaNasa,
  isElNino,
  onToast,
  onToggleElNino,
}: ClimaTabProps) {
  const [climaView, setClimaView] = useState<'index' | 'forecast' | 'elnino'>('index');
  const [isSanidadOpen, setIsSanidadOpen] = useState<boolean>(false);

  const temp = climaNasa?.temp_media_c || 14.2;
  const rain = climaNasa?.precipitacion_mm || 0;

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Encabezado de Sección */}
      <div className="flex items-center justify-between pb-0.5">
        <div>
          <h1 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
            <span>🌦️ Clima &amp; Alerta El Niño</span>
          </h1>
          <p className="text-xs text-slate-500">
            Pronóstico meteorológico a 5 días y simulador de sequía andina
          </p>
        </div>
      </div>

      {/* Sub-navegación por Índice (Elimina el scroll infinito en móvil) */}
      {climaView === 'index' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Banner Carrusel Dinámico con múltiples tarjetas rotativas */}
          <ClimaCarouselBanner
            profile={profile}
            climaNasa={climaNasa}
            isElNino={isElNino}
            onOpenForecast={() => setClimaView('forecast')}
            onOpenSanidadModal={() => setIsSanidadOpen(true)}
          />

          {/* Boletines Científicos Oficiales & Alertas ENOS */}
          <AgroClimaNewsFeed />

          {/* Grid de Módulos Temáticos con Imagen Superior y Enlaces Limpios */}
          <div className="space-y-3.5 pt-1">
            {/* Tarjeta 1: Pronóstico 5 Días & Heladas */}
            <div
              onClick={() => {
                playBubblePop();
                setClimaView('forecast');
              }}
              className="rounded-3xl bg-white border-2 border-sky-300 border-b-4 border-b-sky-400 hover:border-sky-500 text-left transition-all active:border-b-2 active:translate-y-0.5 cursor-pointer shadow-xs group overflow-hidden"
            >
              {/* Imagen temática arriba */}
              <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-slate-100">
                <img
                  src="/images/andes_poster.jpg"
                  alt="Cordillera de los Andes Pronóstico"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-600/90 text-white tracking-wider backdrop-blur-xs">
                    ☀️ Meteorología Satelital
                  </span>
                  <span className="text-xs font-black text-sky-200">
                    NASA POWER
                  </span>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-sky-900 transition leading-snug">
                    Pronóstico a 5 Días &amp; Heladas
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Temperaturas mín/máx, radiación solar UV y alerta de heladas nocturnas para {profile.distrito}.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-sky-950 flex-wrap">
                  <span className="bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-sky-600" />
                    <span>Temp: {temp}°C</span>
                  </span>
                  <span className="bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-200 flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-sky-600" />
                    <span>Lluvia: {rain} mm</span>
                  </span>
                </div>

                {/* Enlace limpio de texto sin cápsula */}
                <div className="pt-1 flex items-center justify-end">
                  <span className="text-xs font-black text-sky-700 group-hover:text-sky-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver pronóstico →
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Simulador El Niño & Plagas */}
            <div
              onClick={() => {
                playBubblePop();
                setClimaView('elnino');
              }}
              className="rounded-3xl bg-white border-2 border-amber-300 border-b-4 border-b-amber-400 hover:border-amber-500 text-left transition-all active:border-b-2 active:translate-y-0.5 cursor-pointer shadow-xs group overflow-hidden"
            >
              {/* Imagen temática arriba */}
              <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-slate-100">
                <img
                  src="/images/cultivos_poster.jpg"
                  alt="Simulador Sequía El Niño"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-600/90 text-white tracking-wider backdrop-blur-xs">
                    ⚠️ Simulación de Sequía
                  </span>
                  <span className="text-xs font-black text-amber-200">
                    ENFEN &amp; NOAA
                  </span>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-amber-900 transition leading-snug">
                    Simulador de Sequía El Niño &amp; Plagas
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Simula escenarios de sequía andina, variedades de contingencia (Tarwi) y corte de plagas.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-amber-950 flex-wrap">
                  <span className="bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    {isElNino ? '⚠️ Sequía Activa' : '☀️ Año Normal'}
                  </span>
                  <span className="bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    Semáforo de Plagas
                  </span>
                </div>

                {/* Enlace limpio de texto sin cápsula */}
                <div className="pt-1 flex items-center justify-end">
                  <span className="text-xs font-black text-amber-700 group-hover:text-amber-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Abrir simulador →
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta 3: Sanidad Vegetal & Biocontrol Andino */}
            <div
              onClick={() => {
                playBubblePop();
                setIsSanidadOpen(true);
              }}
              className="rounded-3xl bg-white border-2 border-emerald-300 border-b-4 border-b-emerald-500 hover:border-emerald-600 text-left transition-all active:border-b-2 active:translate-y-0.5 cursor-pointer shadow-xs group overflow-hidden"
            >
              {/* Imagen temática arriba */}
              <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-slate-100">
                <img
                  src="/images/tarwi_chocho.jpg"
                  alt="Sanidad Vegetal Tarwi Biocontrol"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-700/90 text-white tracking-wider backdrop-blur-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-200" />
                    <span>Biocontrol Ancestral</span>
                  </span>
                  <span className="text-xs font-black text-emerald-200">
                    INIA Andino
                  </span>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-900 transition leading-snug">
                    Sanidad Vegetal &amp; Biocontrol Andino
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Barrera perimetral de Tarwi con alcaloides repelentes (-84% gorgojo), zanjas trampa con ceniza y Beauveria bassiana.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 flex-wrap">
                  <span className="bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                    <Bug className="w-3 h-3 text-emerald-700" />
                    <span>-84% Gorgojo</span>
                  </span>
                  <span className="bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    Cero Químicos
                  </span>
                </div>

                {/* Enlace limpio de texto sin cápsula */}
                <div className="pt-1 flex items-center justify-end">
                  <span className="text-xs font-black text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Ver sanidad vegetal →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista 1: Pronóstico Detallado con Botón de Regreso */}
      {climaView === 'forecast' && (
        <div className="space-y-3 animate-in fade-in">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setClimaView('index');
            }}
            className="px-4 py-2 rounded-2xl bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 transition active:border-b-2 active:translate-y-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Volver al Índice de Clima</span>
          </button>

          <WeatherForecastCard
            clima={climaNasa}
            cuencaName={profile.distrito}
            isElNino={isElNino}
          />
        </div>
      )}

      {/* Vista 2: Simulador El Niño con Botón de Regreso */}
      {climaView === 'elnino' && (
        <div className="space-y-3 animate-in fade-in">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setClimaView('index');
            }}
            className="px-4 py-2 rounded-2xl bg-white border-2 border-slate-200 border-b-4 border-b-slate-300 text-slate-800 font-bold text-xs flex items-center gap-2 transition active:border-b-2 active:translate-y-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Volver al Índice de Clima</span>
          </button>

          <ElNinoSimulatorCard
            isElNino={isElNino}
            onToggleElNino={(val) => {
              if (onToggleElNino) onToggleElNino(val);
            }}
            onToast={onToast}
          />
        </div>
      )}

      {/* Modal de Sanidad Vegetal */}
      <SanidadVegetalModal
        isOpen={isSanidadOpen}
        onClose={() => setIsSanidadOpen(false)}
        distrito={profile.distrito}
      />
    </div>
  );
}
