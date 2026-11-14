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
      title: 'Barrera Viva de Tarwi / Chocho',
      tag: 'Corta Gorgojo (-84%)',
      tagColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      desc: 'Sembrar 3 a 4 surcos de Tarwi en el perímetro del lote. Los alcaloides naturales (esparteína y lupanina) actúan como repelente biológico contra el Premnotrypes vorax (gorgojo de los Andes).',
      icon: '🌿',
      tiempo: 'En siembra perimetral',
    },
    {
      title: 'Zanjas Trampa con Plástico & Ceniza',
      tag: 'Trampa Física',
      tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
      desc: 'Cavar zanjas de 30 cm de profundidad en bordes del andén cubiertas con plástico y espolvoreadas con ceniza de leña. Los adultos del gorgojo caen y no pueden trepar por la pared resbaladiza.',
      icon: '🪤',
      tiempo: 'Antes de emergencia',
    },
    {
      title: 'Bio-Inoculación con Beauveria bassiana',
      tag: 'Control Biológico INIA',
      tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
      desc: 'Hongo benéfico entomopatógeno que parasita larvas en el suelo sin dejar residuos tóxicos. Aplicación al cuello de la planta con el primer aporque.',
      icon: '🍄',
      tiempo: 'Primer aporque',
    },
    {
      title: 'Acolchado de Paja & Rastrojo (Mulch)',
      tag: 'Protege Humedad (+45%)',
      tagColor: 'bg-purple-100 text-purple-900 border-purple-300',
      desc: 'Capa protectora de 5 cm de rastrojo sobre camellones. Evita evaporación rápida por radiación solar andina y desorienta la polilla de la papa.',
      icon: '🌾',
      tiempo: 'Post-siembra inmediata',
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
                  Sanidad Vegetal &amp; Biocontrol
                </h2>
                <p className="text-xs text-emerald-200">
                  Protocolo agroecológico respaldado por INIA y saberes andinos
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
              Estrategia <strong>Cero Químicos</strong>: sustituye insecticidas sintéticos costosos por barreras biológicas andinas.
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
                  <span>⏱️ Momento de labor:</span>
                  <span className="text-slate-700 font-bold">{p.tiempo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] text-slate-500 font-mono">
            Validado por INIA Andenes Cusco
          </span>
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
