'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Newspaper,
} from 'lucide-react';
import { Article, SCIENTIFIC_ARTICLES } from '@/components/AgroClimaNewsFeed';
import { playBubblePop, playQuestionChime } from '@/lib/soundEffects';

interface NewsFullScreenViewProps {
  onBack: () => void;
}

export default function NewsFullScreenView({ onBack }: NewsFullScreenViewProps) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9F6] text-[#132A1C] animate-in fade-in pb-24">
      {/* Top Header with <- Volver button */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5ECE2] px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              if (selectedArticle) {
                setSelectedArticle(null);
              } else {
                onBack();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-[#132A1C] font-bold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{selectedArticle ? 'Lista de Boletines' : 'Volver'}</span>
          </button>

          <div className="text-center">
            <h1 className="text-sm font-semibold text-[#132A1C]">
              {selectedArticle ? 'Lectura Científica' : 'Boletines Científicos'}
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono">
              ENFEN · SENAMHI · INIA · NASA
            </span>
          </div>

          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <Newspaper className="w-4 h-4 text-amber-800" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-4 py-4 space-y-4 flex-1">
        {selectedArticle ? (
          /* Article Detail View */
          <div className="space-y-4 animate-in fade-in">
            <div className="relative rounded-3xl overflow-hidden shadow-sm border border-[#E5ECE2] aspect-[16/9] bg-zinc-900">
              <img
                src={selectedArticle.heroImage}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-1">
                  {selectedArticle.category}
                </span>
                <h2 className="text-base font-semibold text-white leading-tight">
                  {selectedArticle.title}
                </h2>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-[#E5ECE2] shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-[#E5ECE2] pb-2">
                <span className="font-bold text-[#132A1C]">{selectedArticle.source}</span>
                <span>{selectedArticle.date}</span>
              </div>

              <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-900 block">
                  RECOMENDACIÓN CLAVE
                </span>
                <p className="text-xs font-bold text-amber-950 leading-relaxed">
                  {selectedArticle.keyTakeaway}
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-700 leading-relaxed pt-2">
                {selectedArticle.fullBody.map((parr, idx) => (
                  <p key={idx}>{parr}</p>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E5ECE2]">
                <a
                  href={selectedArticle.officialDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl border border-emerald-800 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-50 transition"
                >
                  <span>Consultar Publicación Oficial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          /* Article List View */
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-white rounded-3xl p-4 border border-[#E5ECE2] shadow-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900/60 block">
                VIGILANCIA AGROCLIMÁTICA 2026
              </span>
              <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                Reportes validados por centros de investigación agronómica y comités ENOS para la sierra sur del Perú.
              </p>
            </div>

            <div className="space-y-3">
              {SCIENTIFIC_ARTICLES.map((article) => (
                <div
                  key={article.id}
                  onClick={() => {
                    playBubblePop();
                    setSelectedArticle(article);
                  }}
                  className="bg-white rounded-3xl p-4 border border-[#E5ECE2] shadow-xs hover:border-emerald-300 transition cursor-pointer flex items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 border border-[#E5ECE2]">
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9.5px] font-semibold uppercase tracking-wider text-emerald-800 block">
                      {article.category}
                    </span>
                    <h3 className="text-xs font-semibold text-[#132A1C] leading-snug line-clamp-2 mt-0.5">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
