'use client';

import React, { useState } from 'react';
import { ClimaNasa, FarmerProfile } from '@/lib/types';
import { ArrowLeft, ArrowRight, Sparkles, ShieldCheck, Thermometer, CloudRain, Bug } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';
import AgroClimaNewsFeed from '@/components/AgroClimaNewsFeed';
import WeatherForecastCard from '@/components/WeatherForecastCard';
import ElNinoSimulatorCard from '@/components/ElNinoSimulatorCard';
import ClimaCarouselBanner from '@/components/ClimaCarouselBanner';
import SanidadVegetalModal from '@/components/SanidadVegetalModal';
import AgroenvironmentalAssistantModal from '@/components/AgroenvironmentalAssistantModal';

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
  const [isNewsOpen, setIsNewsOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  const temp = climaNasa?.temp_media_c || 14.2;
  const rain = climaNasa?.precipitacion_mm || 0;

  return (
    <div className="space-y-4 animate-in fade-in pt-1">
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
          <div className="flex justify-center pt-0.5 pb-0.5">
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                setIsNewsOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-2xs hover:shadow-xs hover:border-amber-300 text-xs font-bold text-slate-700 active:scale-95 transition cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>3 Boletines ENOS &amp; INIA disponibles</span>
              <span className="text-slate-400 font-normal">↗</span>
            </button>
          </div>

          <AgroClimaNewsFeed isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />

          {/* Módulos Temáticos Limpios: Imagen a la izquierda, sin card de fondo ni redundancias */}
          <div className="space-y-4 pt-1">
            {/* Tarjeta 1: Pronóstico 5 Días & Heladas */}
            <div
              onClick={() => {
                playBubblePop();
                setClimaView('forecast');
              }}
              className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[140px] px-1 group cursor-pointer"
            >
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-slate-900">
                <img
                  src="/images/andes_poster.jpg"
                  alt="Cordillera de los Andes Pronóstico"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-base text-slate-950 group-hover:text-sky-900 transition leading-snug">
                  Pronóstico a 5 Días &amp; Heladas
                </h3>
                <p className="text-xs text-black font-semibold font-sans leading-relaxed">
                  Temperaturas mín/máx, radiación solar UV y alerta de heladas nocturnas para {profile.distrito}.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-white text-xs font-bold shadow-xs active:scale-95 transition">
                    <span>Ver pronóstico</span>
                    <ArrowRight className="w-3 h-3 text-sky-200" />
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
              className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[140px] px-1 group cursor-pointer"
            >
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-slate-900">
                <img
                  src="/images/cultivos_poster.jpg"
                  alt="Simulador Sequía El Niño"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-base text-slate-950 group-hover:text-amber-900 transition leading-snug">
                  Simulador Sequía El Niño &amp; Plagas
                </h3>
                <p className="text-xs text-black font-semibold font-sans leading-relaxed">
                  Simula escenarios de sequía andina, variedades de contingencia (Tarwi) y corte del gorgojo.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold shadow-xs active:scale-95 transition">
                    <span>Abrir simulador</span>
                    <ArrowRight className="w-3 h-3 text-amber-200" />
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
              className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[140px] px-1 group cursor-pointer"
            >
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-slate-900">
                <img
                  src="/images/tarwi_chocho.jpg"
                  alt="Sanidad Vegetal Tarwi Biocontrol"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-base text-slate-950 group-hover:text-emerald-900 transition leading-snug">
                  Sanidad Vegetal &amp; Biocontrol Andino
                </h3>
                <p className="text-xs text-black font-semibold font-sans leading-relaxed">
                  Barrera perimetral de Tarwi con alcaloides repelentes (-84% gorgojo), zanjas trampa con ceniza y Beauveria bassiana.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition">
                    <span>Ver sanidad vegetal</span>
                    <ArrowRight className="w-3 h-3 text-emerald-200" />
                  </span>
                </div>
              </div>
            </div>

            {/* Tarjeta 4: Asistente Agroambiental & Calendario Preventivo El Niño */}
            <div
              onClick={() => {
                playBubblePop();
                setIsAssistantOpen(true);
              }}
              className="flex items-center gap-3.5 pt-1 pb-1 animate-in fade-in duration-300 min-h-[140px] px-1 group cursor-pointer"
            >
              <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/90 bg-slate-900">
                <img
                  src="/images/quipu_plan.jpg"
                  alt="Asistente Agroambiental El Niño"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-black text-base text-slate-950 group-hover:text-emerald-900 transition leading-snug">
                  Asistente Agroambiental &amp; Calendario
                </h3>
                <p className="text-xs text-black font-semibold font-sans leading-relaxed">
                  Calendario preventivo en 4 bloques temporales y rotación A13 para proteger tu suelo ante El Niño en Piuray-Qorimarca y Cusco.
                </p>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition">
                    <span>Consultar Asistente</span>
                    <ArrowRight className="w-3 h-3 text-emerald-200" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal del Asistente Agroambiental */}
          <AgroenvironmentalAssistantModal
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            profile={profile}
            climaNasa={climaNasa}
            onToast={onToast}
          />
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
