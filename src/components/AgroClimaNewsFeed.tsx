'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronRight,
  Sparkles,
  X,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { playBubblePop, playQuestionChime } from '@/lib/soundEffects';

export interface Article {
  id: string;
  category: string;
  title: string;
  source: string;
  date: string;
  readTime: string;
  summary: string;
  keyTakeaway: string;
  tags: string[];
  fullBody: string[];
  officialDocUrl: string;
  overlayBadge: string;
  overlayBadgeColor: 'amber' | 'emerald' | 'sky';
  colorScheme: 'amber' | 'emerald' | 'sky';
}

export const SCIENTIFIC_ARTICLES: Article[] = [
  {
    id: 'enfen-2026',
    category: 'ALERTA OFICIAL ENOS',
    overlayBadge: '+1.4°',
    overlayBadgeColor: 'amber',
    title: 'Vigilancia de El Niño & Previsión de Déficit Hídrico en la Sierra Sur',
    source: 'ENFEN / SENAMHI',
    date: 'Octubre 2026',
    readTime: '3 min de lectura',
    summary:
      'Modelos acoplados océano-atmósfera confirman condiciones de El Niño débil a moderado, con anomalía térmica de +1.4°C y reducción del 24% en precipitaciones estacionales en valles del Cusco.',
    keyTakeaway:
      'Se recomienda retrasar la siembra de variedades de papa exigentes en agua y priorizar zanjas de infiltración y mulch orgánico para retener la humedad del rocío.',
    tags: ['ENFEN', 'SENAMHI', 'Sequía -24%', 'Cusco'],
    colorScheme: 'amber',
    officialDocUrl: 'https://enfen.gob.pe',
    fullBody: [
      'El Comité Multisectorial Encargado del Estudio Nacional del Fenómeno El Niño (ENFEN) mantiene el estado de Alerta para la región andina centro-sur.',
      'Los análisis de temperatura superficial del mar (TSM) en la región Niño 1+2 y Niño 3.4 evidencian un calentamiento anómalo persistente que inhibe el flujo de vientos alisios húmedos desde la cuenca amazónica hacia la cordillera oriental.',
      'Impacto para el agricultor de Cusco: Las lluvias de inicio de campaña (octubre-noviembre) presentarán retrasos y lluvias dispersas de corta duración. Es mandatorio no quemar rastrojos de cosechas anteriores, ya que la materia orgánica sobre el suelo actúa como una esponja térmica reduciendo la evaporación diurna hasta en 40%.',
    ],
  },
  {
    id: 'inia-tarwi',
    category: 'ENSAYO CIENTÍFICO INIA',
    overlayBadge: '+95 N',
    overlayBadgeColor: 'emerald',
    title: 'Rotación con Tarwi / Chocho y Fijación Biológica de Nitrógeno en Altiplano',
    source: 'INIA Estación Illpa',
    date: 'Agosto 2026',
    readTime: '4 min de lectura',
    summary:
      'Ensayos multianuales en valles andinos demuestran que el Tarwi desarrolla raíces pivotantes profundas, sobreviviendo con 320 mm de lluvia mientras fija +95 kg de N₂ natural por hectárea.',
    keyTakeaway:
      'Cultivo de contingencia número 1: si no hay agua para papa o maíz, sembrar Tarwi garantiza cosecha comercial y enriquece biológicamente el suelo.',
    tags: ['INIA Cusco', 'Lupinus mutabilis', '+95 kg N₂/ha', 'Rusticidad'],
    colorScheme: 'emerald',
    officialDocUrl: 'https://www.gob.pe/inia',
    fullBody: [
      'Investigadores del Programa Nacional de Granos Andinos del INIA Cusco evaluaron la tolerancia a la sequía inducida en 12 ecotipos de Tarwi en parcelas demostrativas a 3,380 msnm.',
      'Los resultados demostraron que gracias a sus raíces pivotantes de anclaje profundo, el cultivo accede a napas freáticas inaccesibles para los tubérculos comunes.',
      'Simultáneamente, la simbiosis con bacterias del género Bradyrhizobium nodula intensamente incluso en suelos pedregosos, inyectando un promedio de 95 kg de nitrógeno puro por hectárea, ahorrando al agricultor el equivalente a 4 sacos de urea comercial por campaña.',
    ],
  },
  {
    id: 'nasa-smap-calib',
    category: 'REPORTE NASA SMAP / CIP',
    overlayBadge: '38%',
    overlayBadgeColor: 'sky',
    title: 'Balance Hídrico Superficial y Ventana Óptima de Aporque',
    source: 'NASA SMAP / CIP',
    date: 'Julio 2026',
    readTime: '2 min de lectura',
    summary:
      'El radiómetro satelital SMAP en banda L (1.4 GHz) mide la constante dieléctrica del suelo superficial. La validación en terreno con agricultores permite estimar la ventana de aporque óptima.',
    keyTakeaway:
      'Tus reportes en la app validan los satélites de la NASA desde el espacio, asegurando alertas precisas de sequía para toda la cuenca.',
    tags: ['NASA SMAP', 'Banda L', 'Validación Satélite', 'Capacidad de Campo'],
    colorScheme: 'sky',
    officialDocUrl: 'https://smap.jpl.nasa.gov',
    fullBody: [
      'El satélite Soil Moisture Active Passive (SMAP) de la NASA orbita a 685 km de altura escaneando la humedad de la biósfera cada 2 a 3 días con un radiómetro de microondas en banda L.',
      'En terrenos de montaña con pendientes pronunciadas (como los Andes peruanos), la orografía dispersa la señal. Al combinar la lectura del satélite con la validación táctil del agricultor (prueba del puño), el algoritmo de TerraQuipu calibra la capacidad de campo con exactitud milimétrica.',
      'Esto permite emitir avisos tempranos de siembra hasta 14 días antes de que los cultivos muestren síntomas visibles de marchitez por estrés hídrico.',
    ],
  },
];

interface AgroClimaNewsFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgroClimaNewsFeed({ isOpen, onClose }: AgroClimaNewsFeedProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (!isOpen) return null;

  const handleOpenArticle = (article: Article) => {
    playBubblePop();
    setTimeout(() => {
      playQuestionChime();
    }, 120);
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    playBubblePop();
    setSelectedArticle(null);
  };

  const handleCloseAll = () => {
    playBubblePop();
    setSelectedArticle(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={handleCloseAll} />

      {/* Bottom Sheet Container */}
      <div className="w-full max-w-md mx-auto bg-white rounded-t-[32px] border-t-2 border-slate-200 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Pull Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 shrink-0" />

        {/* Sheet Header (only shown if not reading a single article) */}
        {!selectedArticle ? (
          <div className="px-5 pt-2 pb-3 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 text-xl flex items-center justify-center shrink-0 shadow-2xs">
                📰
              </span>
              <div>
                <h3 className="font-extrabold text-base text-slate-950 tracking-tight leading-snug">
                  Boletines Científicos &amp; Alertas ENOS
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  Evidencia oficial respaldada por ENFEN, INIA, CIP, SENAMHI y NASA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                Con Fuentes
              </span>
              <button
                type="button"
                onClick={handleCloseAll}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
                title="Cerrar boletines"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          /* Reader Header */
          <div className="px-5 pt-2 pb-3 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={handleBackToList}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Boletines</span>
            </button>
            <button
              type="button"
              onClick={handleCloseAll}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1 pb-8">
          {!selectedArticle ? (
            /* List of 3 Rich Scientific Cards */
            <div className="space-y-3">
              {SCIENTIFIC_ARTICLES.map((article) => {
                const borderStyles = {
                  amber: 'border-amber-200 hover:border-amber-400 bg-white',
                  emerald: 'border-emerald-200 hover:border-emerald-400 bg-white',
                  sky: 'border-sky-200 hover:border-sky-400 bg-white',
                };

                const badgeStyles = {
                  amber: 'bg-amber-100 text-amber-900 border-amber-300',
                  emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  sky: 'bg-sky-100 text-sky-900 border-sky-300',
                };

                const tagOverlayStyles = {
                  amber: 'bg-amber-500 text-white',
                  emerald: 'bg-emerald-600 text-white',
                  sky: 'bg-sky-600 text-white',
                };

                return (
                  <div
                    key={article.id}
                    onClick={() => handleOpenArticle(article)}
                    className={`p-3 rounded-2xl border-2 border-b-4 transition-all cursor-pointer active:border-b-2 active:translate-y-0.5 shadow-2xs flex items-center gap-3 ${borderStyles[article.colorScheme]}`}
                  >
                    {/* Left Thumbnail Graphic */}
                    <div className="w-16 h-16 rounded-xl relative overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                      {article.id === 'enfen-2026' && (
                        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
                          <rect width="64" height="64" rx="12" fill="#0F172A" />
                          <circle cx="26" cy="38" r="20" fill="url(#warmSst)" />
                          <path
                            d="M48 6 Q44 24 50 42 Q52 54 58 64"
                            stroke="#FACC15"
                            strokeWidth="2.5"
                            strokeDasharray="3 2"
                          />
                          <defs>
                            <radialGradient id="warmSst" cx="40%" cy="40%" r="60%">
                              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
                              <stop offset="60%" stopColor="#F97316" stopOpacity="0.75" />
                              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                        </svg>
                      )}

                      {article.id === 'inia-tarwi' && (
                        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
                          <rect width="64" height="64" rx="12" fill="#13241B" />
                          <path
                            d="M32 24 V12 M28 16 Q32 12 36 16"
                            stroke="#4ADE80"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle cx="32" cy="11" r="3" fill="#A855F7" />
                          <circle cx="28" cy="14" r="2.5" fill="#C084FC" />
                          <circle cx="36" cy="14" r="2.5" fill="#C084FC" />
                          <rect x="0" y="38" width="64" height="26" fill="#3E2723" />
                          <line x1="0" y1="38" x2="64" y2="38" stroke="#78350F" strokeWidth="1.5" />
                          <path
                            d="M32 38 V60 M32 44 L22 52 M32 48 L42 56"
                            stroke="#FDE68A"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <circle cx="26" cy="48" r="2.5" fill="#22C55E" />
                          <circle cx="38" cy="52" r="2.5" fill="#22C55E" />
                          <circle cx="32" cy="54" r="2.5" fill="#22C55E" />
                        </svg>
                      )}

                      {article.id === 'nasa-smap-calib' && (
                        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
                          <rect width="64" height="64" rx="12" fill="#091E3A" />
                          <path d="M-5 52 Q32 44 69 52 V64 H-5 Z" fill="#047857" />
                          <path d="M-5 56 Q32 48 69 56 V64 H-5 Z" fill="#064E3B" />
                          <path
                            d="M22 34 Q32 40 42 34"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.6"
                          />
                          <path
                            d="M18 40 Q32 47 46 40"
                            stroke="#38BDF8"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            opacity="0.8"
                          />
                          <g transform="translate(32, 20)">
                            <rect x="-4" y="-3" width="8" height="6" rx="1" fill="#E2E8F0" />
                            <line x1="-12" y1="0" x2="-4" y2="0" stroke="#38BDF8" strokeWidth="2.5" />
                            <line x1="4" y1="0" x2="12" y2="0" stroke="#38BDF8" strokeWidth="2.5" />
                            <circle cx="0" cy="3" r="1.5" fill="#F59E0B" />
                          </g>
                        </svg>
                      )}

                      {/* Top-Left Tag Overlay */}
                      <span
                        className={`absolute top-1 left-1 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs ${tagOverlayStyles[article.overlayBadgeColor]}`}
                      >
                        {article.overlayBadge}
                      </span>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeStyles[article.colorScheme]}`}
                        >
                          {article.category}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {article.readTime}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug hover:text-emerald-900 transition line-clamp-2">
                        {article.title}
                      </h4>

                      <div className="mt-2 flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-[10px] font-medium text-slate-500 truncate max-w-[170px] sm:max-w-[210px]">
                          Fuente: {article.source}
                        </span>
                        <span className="text-xs font-black text-emerald-800 flex items-center gap-0.5 shrink-0">
                          <span>Leer</span>
                          <span className="text-[11px]">&gt;</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Full Article Expanded Reader */
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Category & Source Meta */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    selectedArticle.colorScheme === 'amber'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : selectedArticle.colorScheme === 'emerald'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-sky-100 text-sky-900 border-sky-300'
                  }`}
                >
                  {selectedArticle.category}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedArticle.source} • {selectedArticle.date}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-black text-base sm:text-lg text-slate-950 leading-tight">
                {selectedArticle.title}
              </h3>

              {/* Practical Recommendation Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Recomendación Práctica para tu Chacra:</span>
                </div>
                <p className="leading-relaxed font-sans font-medium">
                  {selectedArticle.keyTakeaway}
                </p>
              </div>

              {/* Full Article Body */}
              <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed font-sans">
                {selectedArticle.fullBody.map((para, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>

              {/* Tags & Official Link */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={selectedArticle.officialDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Portal Oficial</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer active:scale-95 transition"
                  >
                    Volver a Boletines
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
