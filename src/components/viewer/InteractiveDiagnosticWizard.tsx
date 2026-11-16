'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Sparkles,
  Sprout,
  Home,
  DollarSign,
  Leaf,
  X,
} from 'lucide-react';

interface InteractiveDiagnosticWizardProps {
  currentSector: string;
  onSelectSector: (sector: string) => void;
  previousCrop: string;
  onSetPreviousCrop: (crop: string) => void;
  priority: string;
  onSetPriority: (priority: string) => void;
  hardwareId: string;
  onCompleteProfile: () => void;
  onCancel?: () => void;
}

export default function InteractiveDiagnosticWizard({
  currentSector,
  onSelectSector,
  previousCrop,
  onSetPreviousCrop,
  priority,
  onSetPriority,
  hardwareId,
  onCompleteProfile,
  onCancel,
}: InteractiveDiagnosticWizardProps) {
  const [step, setStep] = useState<number>(1);

  const KIPU_TIPS = [
    'Allillanchu! I am Kipu, your agroclimatic assistant. First, in which sector or terrace system is your parcel located to calibrate slope and soil structure?',
    'Excellent. Indicate the last crop harvested to disrupt the Andean potato weevil biological cycle and replenish soil nitrogen.',
    'Final step. Select your family farming priority so the deterministic engine calibrates water demand and economic margin.',
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs p-4 space-y-4 animate-in fade-in duration-200">
      {/* Kipu Llama Assistant Header */}
      <div className="flex items-start gap-3 pb-3 border-b border-zinc-100">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-200 bg-amber-50/60 flex-shrink-0 shadow-xs flex items-center justify-center p-1">
          <img
            src="/images/kipu_llama.png"
            alt="Kipu - Andean Assistant"
            className="w-full h-full object-contain filter drop-shadow-xs"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-zinc-950 flex items-center gap-1.5">
              <span>Kipu • Agroclimatic Assistant</span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-600 font-semibold bg-zinc-100 px-1.5 py-0.5 rounded">
                Step {step} of 3
              </span>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition"
                  title="Close assistant"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-700 mt-1 leading-relaxed bg-zinc-50/80 p-2 rounded-lg border border-zinc-150">
            &ldquo;{KIPU_TIPS[step - 1]}&rdquo;
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-zinc-900 h-full transition-all duration-300"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* Step 1: Sector Selection */}
      {step === 1 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-zinc-900">
            1. Select your Sector in Chinchero:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              {
                id: 'yanacona',
                name: 'Yanacona',
                slope: '14% Slope Gradient',
                alt: '3,754 m a.s.l.',
                soil: 'Clay Loam',
              },
              {
                id: 'taucca',
                name: 'Taucca - Upper Terrace',
                slope: '8% Slope Gradient',
                alt: '3,740 m a.s.l.',
                soil: 'Silt Loam',
              },
              {
                id: 'cuper',
                name: 'Cuper Alto - Ravine',
                slope: '19% Slope Gradient',
                alt: '3,780 m a.s.l.',
                soil: 'Stony Loam',
              },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => onSelectSector(s.id)}
                className={`p-3 rounded-lg border text-left flex items-center justify-between transition ${
                  currentSector === s.id
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-bold text-xs">{s.name}</span>
                  </div>
                  <span
                    className={`text-[11px] block mt-0.5 ${
                      currentSector === s.id ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    {s.slope} • {s.alt} • {s.soil}
                  </span>
                </div>
                {currentSector === s.id && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Previous Harvest Crop */}
      {step === 2 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-zinc-900">
            2. Which crop did you harvest in your last season?
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'papa', name: 'Native Andean Potato', desc: 'Solanum andigena • N₂ Depletion' },
              { id: 'quinua', name: 'Pasankalla Real Quinoa', desc: 'Chenopodium • Low nutrient extraction' },
              { id: 'tarwi', name: 'Tarwi / Andean Lupin', desc: 'Lupinus mutabilis • Fixes +95 kg N₂/ha' },
              { id: 'haba', name: 'Highland Broad Bean', desc: 'Vicia faba • Fixes +75 kg N₂/ha' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => onSetPreviousCrop(c.id)}
                className={`p-2.5 rounded-lg border text-left transition ${
                  previousCrop === c.id
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                    : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <span className="block font-bold text-xs">{c.name}</span>
                <span
                  className={`text-[10px] block mt-0.5 ${
                    previousCrop === c.id ? 'text-zinc-300' : 'text-zinc-500'
                  }`}
                >
                  {c.desc}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 text-xs font-medium flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Priority & Profile Binding */}
      {step === 3 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-zinc-900">
            3. What is the priority for this upcoming season?
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              {
                id: 'alimento',
                title: 'Food Security (Family Consumption)',
                desc: 'Secure nutritious Andean potatoes and legumes for household subsistence',
                icon: Home,
              },
              {
                id: 'venta',
                title: 'Commercialization & Market Trade',
                desc: 'Maximize economic returns in Urubamba agro-markets and gastronomic niches',
                icon: DollarSign,
              },
              {
                id: 'suelo',
                title: 'Integral Soil Regeneration',
                desc: 'Replenish organic matter and active biological nitrogen before replanting solanaceae',
                icon: Leaf,
              },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => onSetPriority(p.id)}
                  className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition ${
                    priority === p.id
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="block font-bold text-xs">{p.title}</span>
                    <span
                      className={`text-[11px] block mt-0.5 ${
                        priority === p.id ? 'text-zinc-300' : 'text-zinc-500'
                      }`}
                    >
                      {p.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-[11px] text-zinc-600 font-mono">
            <span>Hardware Device Binding: </span>
            <strong className="text-zinc-900">{hardwareId}</strong>
            <span className="block text-[10px] text-zinc-500 font-sans mt-0.5">
              Your profile is stored locally on this device and will persist across future sessions without re-entry.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-3 py-1.5 text-zinc-600 hover:text-zinc-950 text-xs font-medium flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={onCompleteProfile}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Profile &amp; Activate Quipu Engine</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
