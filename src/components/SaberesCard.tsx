'use client';

import React, { useState } from 'react';
import { BookOpen, Moon, ShieldCheck, Flame, Mountain, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface SaberesCardProps {
  onToast?: (msg: string) => void;
}

export default function SaberesCard({ onToast }: SaberesCardProps) {
  const [activeTab, setActiveTab] = useState<'luna' | 'repelente' | 'aporque' | 'waru'>('luna');

  const playSpeech = (text: string) => {
    playBubblePop();
    if (typeof window === 'undefined') return;
    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.lang = 'es-PE';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
    if (onToast) onToast('🔊 Reproduciendo saber ancestral en audio...');
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border-2 border-purple-400 border-b-4 border-b-purple-500 p-4 sm:p-5 space-y-4 shadow-xs">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-950 flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
                📚
              </span>
              <span>Sabiduría Andina Validada por INIA</span>
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
              Ciencia &amp; Tradición
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conocimiento ancestral de nuestros abuelos validado por agrometeorología satelital
          </p>
        </div>

        {/* 4 Categorías Táctiles con Sonido */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'luna' as const, label: 'Fase Lunar', icon: '🌙', sub: 'Gravedad & Savia' },
            { id: 'repelente' as const, label: 'Muña & Ceniza', icon: '🌿', sub: 'Bio-Repelente' },
            { id: 'aporque' as const, label: 'Aporque Alto', icon: '🏔️', sub: 'Barrera Heladas' },
            { id: 'waru' as const, label: 'Waru Waru', icon: '🌊', sub: 'Cosecha de Agua' },
          ].map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playBubblePop();
                  setActiveTab(item.id);
                }}
                className={`p-3 rounded-2xl border-2 border-b-4 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-600 border-b-purple-700 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-500/20 active:border-b-2 active:translate-y-0.5'
                    : 'border-slate-200 border-b-slate-300 bg-white hover:bg-slate-50 active:border-b-2 active:translate-y-0.5 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-medium">{item.sub}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Contenido Dinámico de la Práctica Ancestral Seleccionada */}
        <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
          {activeTab === 'luna' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs text-purple-950 uppercase tracking-wide">
                  <Moon className="w-4 h-4 text-purple-700" />
                  <span>Fase Lunar: Cuarto Creciente (Killa Pukllay)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    playSpeech(
                      'Fase Lunar Cuarto Creciente. La gravedad lunar hace que la savia ascienda hacia los tallos y hojas superiores. Es el momento óptimo para la siembra de granos andinos como quinua, maíz y kiwicha.'
                    )
                  }
                  className="p-1.5 rounded-lg bg-white border border-purple-300 text-purple-800 hover:bg-purple-100 transition active:scale-95 cursor-pointer"
                  title="Escuchar saber"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                La atracción gravitacional de la luna tira de la savia hacia los ápices y hojas superiores. Es el momento óptimo para la <strong>siembra de granos andinos (quinua, maíz y kiwicha)</strong>.
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-purple-200 text-xs text-purple-900 flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-purple-700 flex-shrink-0" />
                <span>Regla de oro: No podar tallos ni cosechar tubérculos bajo esta fase.</span>
              </div>
            </div>
          )}

          {activeTab === 'repelente' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                  <Flame className="w-4 h-4 text-emerald-700" />
                  <span>Bio-Repelente de Muña y Ceniza de Leña</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    playSpeech(
                      'Bio repelente ancestral de muña y ceniza de leña. Hervir dos kilos de muña con quinientos gramos de ceniza cernida en veinte litros de agua. La pulegona bloquea el olfato del gorgojo andino.'
                    )
                  }
                  className="p-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
                  title="Escuchar saber"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-slate-800 space-y-1.5 leading-relaxed font-sans font-medium">
                <p>
                  <strong>Receta ancestral:</strong> Hervir 2 kg de hojas de muña silvestre con 500 g de ceniza cernida de fogón en 20 litros de agua durante 20 minutos.
                </p>
                <p>
                  <strong>Efecto biológico comprobado por INIA:</strong> La pulegona volátil satura las antenas del gorgojo andino (Premnotrypes), impidiendo que localice la planta de papa para ovipositar.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'aporque' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs text-amber-950 uppercase tracking-wide">
                  <Mountain className="w-4 h-4 text-amber-700" />
                  <span>Aporque Alto contra Heladas Negras</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    playSpeech(
                      'Aporque alto contra heladas negras. Levantar camellones de treinta y cinco centímetros alrededor del cuello de la planta. El montículo almacena el calor solar diurno y salva las raíces de temperaturas de hasta menos tres grados.'
                    )
                  }
                  className="p-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition active:scale-95 cursor-pointer"
                  title="Escuchar saber"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                Levantar camellones de 35 a 40 cm alrededor del tallo. El montículo de tierra almacena la radiación solar diurna y la libera lentamente de madrugada, protegiendo las raíces de heladas de hasta <strong>-3°C</strong>.
              </p>
            </div>
          )}

          {activeTab === 'waru' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs text-sky-950 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-sky-700" />
                  <span>Siembra y Cosecha de Agua (Waru Waru)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    playSpeech(
                      'Siembra y cosecha de agua, waru waru. Los canales de agua alrededor de las plataformas de cultivo amortiguan las heladas nocturnas y recargan los acuíferos locales.'
                    )
                  }
                  className="p-1.5 rounded-lg bg-white border border-sky-300 text-sky-800 hover:bg-sky-100 transition active:scale-95 cursor-pointer"
                  title="Escuchar saber"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                Plataformas elevadas rodeadas de canales de agua. El agua absorbe calor durante el día y lo irradia en la noche, reduciendo la severidad de las heladas y recargando la capa freática en sequía.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
