'use client';

import React from 'react';
import { Newspaper } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface FloatingNewsFABProps {
  onOpenNews: () => void;
}

export default function FloatingNewsFAB({ onOpenNews }: FloatingNewsFABProps) {
  return (
    <div className="fixed bottom-20 right-4 z-40 select-none">
      <button
        type="button"
        onClick={() => {
          playBubblePop();
          onOpenNews();
        }}
        className="relative w-12 h-12 rounded-full bg-[#1B3B22] hover:bg-[#132A1C] text-white border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-950/25 transition-all transform active:scale-90 cursor-pointer"
        title="Boletines Científicos y Alertas ENOS"
        aria-label="Abrir boletines científicos y alertas ENOS"
      >
        <Newspaper className="w-5 h-5 text-emerald-200" />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-white font-bold text-[8.5px] flex items-center justify-center ring-2 ring-emerald-950">
          3
        </span>
      </button>
    </div>
  );
}
