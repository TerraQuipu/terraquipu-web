'use client';

import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  ChevronRight,
  Sparkles,
  X,
  ArrowLeft,
  BookOpen,
  Calendar,
  ShieldAlert,
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
  heroImage: string;
  overlayBadge: string;
  overlayBadgeColor: 'amber' | 'emerald' | 'sky' | 'purple';
  colorScheme: 'amber' | 'emerald' | 'sky' | 'purple';
}

export const SCIENTIFIC_ARTICLES: Article[] = [
  {
    id: 'enfen-2026',
    category: 'OFFICIAL ENSO ADVISORY',
    overlayBadge: '+1.4°',
    overlayBadgeColor: 'amber',
    title: 'ENSO Surveillance & Precipitation Deficit Forecast in the Southern Andes',
    source: 'ENFEN / SENAMHI',
    date: 'October 2026',
    readTime: '3 min read',
    heroImage: '/images/andes_poster.jpg',
    summary:
      'Coupled ocean-atmosphere models project weak-to-moderate El Niño conditions, with a +1.4°C SST thermal anomaly and a 24% reduction in seasonal precipitation across Cusco highland valleys.',
    keyTakeaway:
      'Delay sowing water-intensive potato cultivars; prioritize contour infiltration trenches and organic mulch to retain morning dew and soil moisture.',
    tags: ['ENFEN', 'SENAMHI', 'Drought -24%', 'Cusco Highlands'],
    colorScheme: 'amber',
    officialDocUrl: 'https://enfen.gob.pe',
    fullBody: [
      'The Multisectoral Committee for the National Study of the El Niño Phenomenon (ENFEN) maintains Alert status for the south-central Andean region.',
      'Sea surface temperature (SST) anomalies across Niño 1+2 and Niño 3.4 regions confirm persistent warming, inhibiting easterly moisture trade winds from the Amazon basin into the eastern Andean cordillera.',
      'Field management protocol for Andean farmers: Early-season rains (October-November) will exhibit delays and short-duration scattered convective showers. Crop residue burning is strictly prohibited, as organic surface mulch functions as a thermal cushion reducing daytime evapotranspiration by up to 40%.',
    ],
  },
  {
    id: 'inia-tarwi',
    category: 'INIA AGRONOMIC TRIAL',
    overlayBadge: '+95 N',
    overlayBadgeColor: 'emerald',
    title: 'Tarwi / Andean Lupin Rotation and Biological Nitrogen Fixation in Highland Soils',
    source: 'INIA Illpa Experimental Station',
    date: 'August 2026',
    readTime: '4 min read',
    heroImage: '/images/tarwi_chocho.jpg',
    summary:
      'Multi-year agronomic field trials demonstrate that Tarwi develops deep taproots, surviving with only 320 mm seasonal precipitation while fixing +95 kg biological N₂ per hectare.',
    keyTakeaway:
      'Primary contingency crop: when irrigation is unavailable for potato or corn, sowing Tarwi secures commercial yield and biologically enriches the edaphic profile.',
    tags: ['INIA Cusco', 'Lupinus mutabilis', '+95 kg N₂/ha', 'Drought Hardiness'],
    colorScheme: 'emerald',
    officialDocUrl: 'https://www.gob.pe/inia',
    fullBody: [
      'Agronomic researchers from the National Andean Grains Program at INIA evaluated drought tolerance in 12 Tarwi ecotypes at 3,380 m a.s.l.',
      'Results confirmed that deep-rooting architectures tap deep moisture reserves inaccessible to shallow-rooted tuber crops.',
      'Concurrently, symbiosis with Bradyrhizobium strains nodules vigorously in stony highland soils, injecting ~95 kg pure bioavailable nitrogen per hectare—saving farmers the equivalent of 4 commercial urea sacks per campaign.',
    ],
  },
  {
    id: 'nasa-smap-calib',
    category: 'NASA SMAP / CIP DOSSIER',
    overlayBadge: '38%',
    overlayBadgeColor: 'sky',
    title: 'Root-Zone Hydric Balance and Optimal Hilling Window via L-Band Radiometry',
    source: 'NASA SMAP / CIP',
    date: 'July 2026',
    readTime: '2 min read',
    heroImage: '/images/nasa_orbit_poster.jpg',
    summary:
      'NASA SMAP L-band (1.4 GHz) microwave radiometer measures surface soil dielectric constant. Ground-truth validation with smallholders calibrates the optimal hilling window.',
    keyTakeaway:
      'In-situ farmer field reports calibrate NASA orbital radar from space, delivering reliable drought warning telemetry across the watershed.',
    tags: ['NASA SMAP', 'L-Band Radiometer', 'Ground-Truth Calibration', 'Field Capacity'],
    colorScheme: 'sky',
    officialDocUrl: 'https://smap.jpl.nasa.gov',
    fullBody: [
      'The NASA Soil Moisture Active Passive (SMAP) observatory orbits at 685 km altitude, mapping global soil moisture every 2 to 3 days via an L-band microwave radiometer.',
      'In steep Andean terrain, rugged topography scatters orbital microwave backscatter. Cross-referencing orbital radiometry with in-situ tactile field tests (hand-squeeze test) enables TerraQuipu algorithms to calibrate field capacity with high fidelity.',
      'This unlocks early warning alerts up to 14 days before crops exhibit irreversible vegetative wilting from moisture deficit.',
    ],
  },
  {
    id: 'cip-gorgojo-plaga',
    category: 'CIP / FAO PHYTOSANITARY BULLETIN',
    overlayBadge: '🪲 Bio',
    overlayBadgeColor: 'purple',
    title: 'Agroecological Disruption of the Andean Potato Weevil under Warm Winter Anomalies',
    source: 'International Potato Center (CIP)',
    date: 'September 2026',
    readTime: '3 min read',
    heroImage: '/images/papa_nativa.jpg',
    summary:
      'Warmer mean temperatures accelerate the life cycle of the Andean potato weevil (Premnotrypes spp.). Legume crop rotation and muña repellent barriers reduce larval infestation by 84% without synthetic pesticides.',
    keyTakeaway:
      'Disrupt the weevil cycle: avoid planting tubers sequentially after tubers. Rotation with faba beans or Tarwi deprives larvae of host tubers and sanitizes the soil.',
    tags: ['CIP', 'Premnotrypes spp.', 'Biocontrol', 'Soil Health'],
    colorScheme: 'purple',
    officialDocUrl: 'https://cipotato.org',
    fullBody: [
      'Entomological trials conducted by CIP confirm that absence of severe nocturnal winter frosts enables overwintering larvae of Premnotrypes spp. to survive in topsoil.',
      'Intercropping perimeter barriers of wild muña (Minthostachys mollis, rich in pulegone) and substituting potato with legumes in the subsequent campaign drops larval survival to 16%.',
      'This indigenous agroecological practice recommended by Kipu shelters farm revenues and halts toxic soil contamination from synthetic organophosphates.',
    ],
  },
];

interface AgroClimaNewsFeedProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AgroClimaNewsFeed({ isOpen, onClose }: AgroClimaNewsFeedProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered && !isClosing) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
        setSelectedArticle(null);
      }, 280);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered, isClosing]);

  const handleStartClose = () => {
    playBubblePop();
    setIsClosing(true);
    setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      setSelectedArticle(null);
      onClose();
    }, 280);
  };

  if (!isRendered) return null;

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

  return (
    <div
      className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex flex-col justify-end ${
        isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
      }`}
    >
      {/* Inline Keyframes for 100% Reliable Cross-Browser Slide-Up & Down */}
      <style>{`
        @keyframes sheetSlideUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(0%); }
        }
        @keyframes sheetSlideDown {
          0% { transform: translateY(0%); }
          100% { transform: translateY(100%); }
        }
        @keyframes backdropFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes backdropFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-sheet-up {
          animation: sheetSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          will-change: transform;
        }
        .animate-sheet-down {
          animation: sheetSlideDown 0.28s cubic-bezier(0.7, 0, 0.84, 0) forwards !important;
          will-change: transform;
        }
        .animate-backdrop-in {
          animation: backdropFadeIn 0.3s ease-out forwards !important;
        }
        .animate-backdrop-out {
          animation: backdropFadeOut 0.28s ease-in forwards !important;
        }
      `}</style>

      {/* Click outside to close with slide-down animation */}
      <div className="absolute inset-0 -z-10 cursor-pointer" onClick={handleStartClose} />

      {/* Bottom Sheet Container with Smooth Keyframe Slide-Up / Slide-Down */}
      <div
        className={`w-full max-w-md mx-auto bg-white rounded-t-[32px] border-t-2 border-slate-200 shadow-2xl max-h-[88vh] flex flex-col overflow-hidden ${
          isClosing ? 'animate-sheet-down' : 'animate-sheet-up'
        }`}
      >
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
                  Scientific Bulletins &amp; ENSO Advisories
                </h3>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  Official peer-reviewed telemetry supported by ENFEN, INIA, CIP, SENAMHI and NASA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                Verified Sources
              </span>
              <button
                type="button"
                onClick={handleStartClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
                title="Close bulletins"
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
              <span>Back to Bulletins</span>
            </button>
            <button
              type="button"
              onClick={handleStartClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm transition active:scale-95 cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="px-4 py-3 space-y-3 overflow-y-auto flex-1 pb-8">
          {!selectedArticle ? (
            /* List of 4 Rich Scientific Cards */
            <div className="space-y-3">
              {SCIENTIFIC_ARTICLES.map((article) => {
                const borderStyles = {
                  amber: 'border-amber-200 hover:border-amber-400 bg-white',
                  emerald: 'border-emerald-200 hover:border-emerald-400 bg-white',
                  sky: 'border-sky-200 hover:border-sky-400 bg-white',
                  purple: 'border-purple-200 hover:border-purple-400 bg-white',
                };

                const badgeStyles = {
                  amber: 'bg-amber-100 text-amber-900 border-amber-300',
                  emerald: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                  sky: 'bg-sky-100 text-sky-900 border-sky-300',
                  purple: 'bg-purple-100 text-purple-900 border-purple-300',
                };

                const tagOverlayStyles = {
                  amber: 'bg-amber-500 text-white',
                  emerald: 'bg-emerald-600 text-white',
                  sky: 'bg-sky-600 text-white',
                  purple: 'bg-purple-600 text-white',
                };

                return (
                  <div
                    key={article.id}
                    onClick={() => handleOpenArticle(article)}
                    className={`p-3 rounded-2xl border-2 border-b-4 transition-all cursor-pointer active:border-b-2 active:translate-y-0.5 shadow-2xs flex items-center gap-3 ${borderStyles[article.colorScheme]}`}
                  >
                    {/* Left Thumbnail Graphic / Image */}
                    <div className="w-16 h-16 rounded-xl relative overflow-hidden shrink-0 border border-slate-200 shadow-2xs bg-slate-900">
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

                      {article.id === 'cip-gorgojo-plaga' && (
                        <div className="w-full h-full relative">
                          <img
                            src="/images/papa_nativa.jpg"
                            alt="Papa Nativa CIP"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-purple-950/40" />
                        </div>
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
                          Source: {article.source}
                        </span>
                        <span className="text-xs font-black text-emerald-800 flex items-center gap-0.5 shrink-0">
                          <span>Read</span>
                          <span className="text-[11px]">&gt;</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Full Article Expanded Reader with Real Hero Image */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Hero Banner Image */}
              <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden relative shadow-md bg-slate-900 shrink-0 border border-slate-200">
                <img
                  src={selectedArticle.heroImage}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                      selectedArticle.colorScheme === 'amber'
                        ? 'bg-amber-600'
                        : selectedArticle.colorScheme === 'emerald'
                        ? 'bg-emerald-600'
                        : selectedArticle.colorScheme === 'purple'
                        ? 'bg-purple-600'
                        : 'bg-sky-600'
                    }`}
                  >
                    {selectedArticle.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-200 font-medium">
                    {selectedArticle.readTime}
                  </span>
                </div>
              </div>

              {/* Source & Date Meta */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
                <span>Source: {selectedArticle.source}</span>
                <span>{selectedArticle.date}</span>
              </div>

              {/* Title */}
              <h3 className="font-black text-base sm:text-lg text-slate-950 leading-tight">
                {selectedArticle.title}
              </h3>

              {/* Practical Recommendation Box */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-900">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>Actionable Field Recommendation:</span>
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
                    <span>Official Scientific Portal</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleBackToList}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer active:scale-95 transition"
                  >
                    Back to Bulletins
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
