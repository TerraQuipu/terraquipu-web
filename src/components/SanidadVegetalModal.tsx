'use client';

import React from 'react';
import { X, ShieldCheck, Bug, Sprout, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface SanidadVegetalModalProps {
  isOpen: boolean;
  onClose: () => void;
  distrito: string;
}

export default function SanidadVegetalModal({
  isOpen,
  onClose,
}: SanidadVegetalModalProps) {
  if (!isOpen) return null;

  const practices = [
    {
      title: 'Live Tarwi / Lupin Bio-Repellent Barrier',
      tag: 'Disrupts Weevil (-84%)',
      tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: 'Plant 3 to 4 perimeter rows of Tarwi. Natural alkaloids (sparteine and lupanine) act as an organic biological repellent against Premnotrypes vorax (Andean potato weevil).',
      icon: '🌿',
      tiempo: 'Perimeter sowing stage',
    },
    {
      title: 'Trench Traps with Plastic & Wood Ash',
      tag: 'Physical Barrier',
      tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
      desc: 'Excavate 30 cm perimeter trenches along terrace edges lined with plastic and dusted with wood ash. Adult weevils tumble in and cannot climb the slick walls.',
      icon: '🪤',
      tiempo: 'Pre-emergence stage',
    },
    {
      title: 'Bio-Inoculation with Beauveria bassiana',
      tag: 'INIA Biological Control',
      tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
      desc: 'Beneficial entomopathogenic fungus that parasitizes soil larvae without toxic synthetic residues. Apply around root crown during first contour hilling.',
      icon: '🍄',
      tiempo: 'First contour hilling',
    },
    {
      title: 'Straw & Crop Residue Mulching',
      tag: 'Moisture Retention (+45%)',
      tagColor: 'bg-purple-100 text-purple-900 border-purple-300',
      desc: 'Apply a 5 to 8 cm residue mulch layer across ridges. Suppresses evaporative loss under intense Andean UV radiation and deters potato tuber moth oviposition.',
      icon: '🌾',
      tiempo: 'Immediate post-sowing',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-2 border-slate-200">
        {/* Header */}
        <div className="relative p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-white/20 text-xl">🛡️</span>
              <div>
                <h2 className="text-base font-extrabold tracking-tight">
                  Plant Health &amp; Agroecological Biocontrol
                </h2>
                <p className="text-xs text-emerald-200">
                  Agroecological protocol validated by INIA and ancestral Andean science
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-slate-800 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <span className="text-[11px] text-emerald-950 font-medium">
              <strong>Zero-Agrochemicals Strategy:</strong> Replaces hazardous synthetic pesticides with native Andean biological barriers.
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {practices.map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border-2 border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-1.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <span className="text-xl">{p.icon}</span>
                    <span>{p.title}</span>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${p.tagColor}`}>
                    {p.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                  {p.desc}
                </p>
                <div className="text-[10px] text-slate-400 font-mono font-medium flex items-center gap-1">
                  <span>⏱️ Operational window:</span>
                  <span className="text-slate-700 font-bold">{p.tiempo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">
            Validated by INIA Andean Terracing Station (Cusco)
          </span>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
