'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FarmerProfile, ClimaNasa, ParcelItem } from '@/lib/types';
import {
  Globe,
  Sun,
  Sprout,
  Send,
  Sparkles,
  Bot,
  User,
  MapPin,
  RefreshCw,
  Flame,
  Award,
  ChevronRight,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import { getActiveParcel, getStoredParcels } from '@/lib/deviceProfile';

interface Message {
  id: string;
  sender: 'user' | 'kipu' | 'astro';
  text: string;
  timestamp: string;
}

interface CopilotTabProps {
  profile: FarmerProfile;
  climaNasa?: ClimaNasa | null;
  smapPercent?: number;
  initialVoice?: 'astro' | 'kipu';
  onOpenDiagnostic: () => void;
  onToast?: (msg: string) => void;
}

export default function CopilotTab({
  profile,
  climaNasa,
  smapPercent = 16,
  initialVoice = 'kipu',
  onOpenDiagnostic,
  onToast,
}: CopilotTabProps) {
  const [activeVoice, setActiveVoice] = useState<'astro' | 'kipu'>(initialVoice);
  const [activeParcel, setActiveParcel] = useState<ParcelItem | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic initial greeting based on active parcel
  useEffect(() => {
    const parcel = getActiveParcel();
    setActiveParcel(parcel);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'kipu',
      text: `¡Allillanchu, ${profile.farmerName ? `hermano ${profile.farmerName}` : 'hermano agricultor'}! Soy Kipu, tu compañero andino. Veo que en tu parcela "${profile.parcelName || 'Chacra Maras'}" la humedad SMAP está en ${smapPercent}%. ¿Sobre qué labor agrícola deseas conversar hoy?`,
      timestamp: '08:42',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Suggested prompt chips
  const suggestedQuestions = [
    '¿Cómo está la humedad en mi parcela?',
    '¿Cuándo debo aporcar mi cultivo?',
    '¿Qué hacer si hay helada esta noche?',
    '¿Cómo preparar la cobertura de rastrojo?',
    '¿Cuánto nitrógeno ahorro al rotar?',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    playBubblePop();
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Context-aware Kipu / Astro bot response
    setTimeout(() => {
      playSuccessFanfare();
      setIsTyping(false);

      const parcelName = activeParcel?.name || profile.parcelName || 'tu chacra';
      const crop = activeParcel?.cropName || profile.previousCropName || 'Papa nativa';
      const lower = text.toLowerCase();
      let reply = '';

      if (lower.includes('humedad') || lower.includes('agua') || lower.includes('seco')) {
        reply = activeVoice === 'astro'
          ? `NASA SMAP registra ${smapPercent}% de humedad volumétrica superficial en ${parcelName}. Estamos en rango seco. Te recomiendo no remover suelo al mediodía para evitar evapotranspiración.`
          : `Hermano, en ${parcelName} la tierra pide abrigo. El viento andino seca los primeros 5 cm. Aplica mulch de rastrojo de cebada para que el rocío matutino no se escape.`;
      } else if (lower.includes('aporcar') || lower.includes('cultivo') || lower.includes('siembra')) {
        reply = `Para tu cultivo de ${crop} en ${parcelName}, el aporque debe hacerse cuando las plantas alcancen unos 20 cm de altura. Haz surcos altos en contorno para proteger los tubérculos de la radiación directa y retener agua de lluvia.`;
      } else if (lower.includes('helada') || lower.includes('frío') || lower.includes('clima')) {
        reply = climaNasa?.alerta_helada
          ? `¡Atención! La telemetría satelital indica noche despejada y viento calmo. Hay alta probabilidad de helada blanca al amanecer en ${parcelName}. Te aconsejo realizar riego ligero o quemar rastrojo húmedo en los linderos para generar humo protector.`
          : `Por ahora no hay alerta crítica de helada severa para los ${activeParcel?.altitudeMsnm || 3380} msnm de tu zona. Sin embargo, mantén la cobertura vegetal activa.`;
      } else if (lower.includes('rastrojo') || lower.includes('mulch') || lower.includes('quemar')) {
        reply = `¡Nunca quemes el rastrojo! Al dejar 8 cm de chala o paja sobre ${parcelName}, reduces la evaporación hasta un 40% y proteges a los microorganismos benéficos del suelo contra el calor solar.`;
      } else if (lower.includes('nitrógeno') || lower.includes('rotar') || lower.includes('ahorro')) {
        reply = `Rotar tu parcela de ${crop} con Tarwi o Habas fijará entre 80 y 95 kg de nitrógeno por hectárea. Esto representa un ahorro de más de S/ 280 por hectárea en abonos químicos para la siguiente campaña.`;
      } else {
        reply = activeVoice === 'astro'
          ? `He analizado la posición satelital de ${parcelName} (${activeParcel?.lat.toFixed(3) || -13.332}, ${activeParcel?.lon.toFixed(3) || -72.158}). Con ${crop} en desarrollo y ${smapPercent}% de humedad, tu mejor estrategia es monitoreo preventivo de vigor NDVI.`
          : `Entendido sobre tu parcela ${parcelName}. Nuestros abuelos siempre miraban las nubes al atardecer y cuidaban la madre tierra con abono natural. ¿Quieres que revisemos el diagnóstico de tu suelo?`;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: activeVoice,
        text: reply,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 700);
  };

  return (
    <div className="space-y-4 animate-in fade-in pb-20">
      {/* 1. DUOLINGO STYLE MASCOT BANNER (KIPU LLAMA) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A3D24] via-[#132A1C] to-emerald-950 p-4 text-white shadow-md border border-emerald-900/60">
        <div className="flex items-center justify-between gap-3">
          {/* Mascot Avatar with Animation */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-[#A3E635] shadow-md">
                <img
                  src={activeVoice === 'astro' ? '/images/astro_satelin.png' : '/images/kipu_llama_happy.png'}
                  alt="Mascota"
                  className="w-11 h-11 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#7BB63E] text-[#132A1C] flex items-center justify-center text-[10px] font-bold border border-white">
                ✓
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white leading-none">
                  {activeVoice === 'astro' ? 'Astro' : 'Kipu'}
                </h2>
                <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {activeVoice === 'astro' ? 'Ciencia NASA' : 'Saber Andino'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 mt-1">
                {activeVoice === 'astro' ? 'Telemetría y radares orbitales' : 'Tu copiloto agroecológico local'}
              </p>
            </div>
          </div>

          {/* Gamification Streak Badge (Duolingo Style) */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-400/30 px-2.5 py-1 rounded-full text-amber-300 text-xs font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>5 días</span>
            </div>
            <span className="text-[9px] text-zinc-400 mt-1">Racha de campo</span>
          </div>
        </div>

        {/* Character Switcher Tabs */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-2xl mt-3 border border-white/10">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setActiveVoice('kipu');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeVoice === 'kipu'
                ? 'bg-[#7BB63E] text-[#132A1C] shadow-xs'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Kipu · Saber Local</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setActiveVoice('astro');
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeVoice === 'astro'
                ? 'bg-amber-400 text-[#132A1C] shadow-xs'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Astro · Datos NASA</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE PARCEL CONTEXT PILL */}
      {activeParcel && (
        <div className="bg-white rounded-2xl p-2.5 border border-[#E5ECE2] shadow-2xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9.5px] text-zinc-500 uppercase block font-semibold">
                CONVERSANDO SOBRE
              </span>
              <span className="text-xs font-bold text-[#132A1C] truncate block">
                {activeParcel.name} · {activeParcel.cropName} ({activeParcel.areaHa} ha)
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              SMAP {activeParcel.smapHumidity}%
            </span>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE CHAT MESSAGES CONTAINER */}
      <div className="bg-white rounded-3xl p-4 border border-[#E5ECE2] shadow-xs space-y-3 min-h-[300px] flex flex-col justify-between">
        {/* Messages List */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300 text-emerald-800">
                    {m.sender === 'astro' ? <Sun className="w-3.5 h-3.5 text-amber-700" /> : <Sprout className="w-3.5 h-3.5 text-emerald-800" />}
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-[#132A1C] text-white rounded-br-xs font-normal'
                      : 'bg-[#F4F7F2] text-zinc-800 border border-[#E5ECE2] rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`text-[9px] block text-right mt-1 font-mono ${
                      isMe ? 'text-zinc-400' : 'text-zinc-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
                <Sprout className="w-3.5 h-3.5 text-emerald-800 animate-spin" />
              </div>
              <div className="bg-[#F4F7F2] rounded-2xl px-3 py-2 border border-[#E5ECE2] text-xs text-zinc-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. SUGGESTED PROMPT CHIPS */}
        <div className="pt-2 border-t border-[#E5ECE2] space-y-1.5">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
            PREGUNTAS SUGERIDAS
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1.5 rounded-full bg-[#EBF2E5] hover:bg-[#DEEBD7] text-emerald-950 text-[11px] font-medium whitespace-nowrap border border-[#D5E5CD] transition cursor-pointer shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 5. INPUT MESSAGE BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu consulta sobre tu parcela..."
            className="flex-1 h-10 px-3.5 rounded-full bg-[#F7F9F6] border border-[#E5ECE2] text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:border-[#7BB63E] transition"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] disabled:opacity-40 text-[#132A1C] flex items-center justify-center shadow-xs transition active:scale-95 cursor-pointer shrink-0"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* 6. Quick Action: Diagnostic Evaluation */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-[#E5ECE2] flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-zinc-800">
            ¿Deseas registrar un reporte de campo hoy?
          </h4>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Compara la señal satelital con la textura y humedad de tu suelo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playSuccessFanfare();
            onOpenDiagnostic();
          }}
          className="px-3.5 py-2 rounded-full bg-[#132A1C] text-white font-semibold text-xs shrink-0 cursor-pointer hover:bg-emerald-950 transition"
        >
          Evaluar suelo
        </button>
      </div>
    </div>
  );
}
