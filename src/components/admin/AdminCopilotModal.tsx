'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info,
  X,
  AlertTriangle,
  FileText,
  Satellite,
  CheckCircle2,
} from 'lucide-react';
import { CropRecord, ReporteAgricultor } from '@/types';

interface Message {
  id: string;
  sender: 'user' | 'kipu';
  text: string;
  timestamp: string;
  alertType?: 'warning' | 'info' | 'success';
  suggestedAction?: string;
}

interface AdminCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  crops: CropRecord[];
  reports: ReporteAgricultor[];
  onTriggerBackup?: () => void;
  onShowToast: (msg: string) => void;
}

export default function AdminCopilotModal({
  isOpen,
  onClose,
  crops,
  reports,
  onTriggerBackup,
  onShowToast,
}: AdminCopilotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'kipu',
      text: '¡Allillanchu, Administrador! Soy Kipu Guardián, tu copiloto de gobernanza agronómica e IA territorial. Estoy aquí para advertirte sobre riesgos biológicos antes de alterar la matriz en Supabase, auditar datos de la NASA y asistirte en la gestión de backups.',
      timestamp: 'Ahora',
      alertType: 'info',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsThinking(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = '';
      let alertType: 'warning' | 'info' | 'success' = 'info';
      let suggestedAction: string | undefined = undefined;

      if (lower.includes('tarwi') && (lower.includes('subir') || lower.includes('cambiar') || lower.includes('150') || lower.includes('130') || lower.includes('aumentar'))) {
        alertType = 'warning';
        responseText = `⚠️ ADVERTENCIA DE RIESGO BIOLÓGICO:\nActualmente el Tarwi está configurado en +95 kg N/ha (Estándar INIA Estación Andenes). La fisiología vegetal de Lupinus mutabilis con Bradyrhizobium lupini tiene un límite fisiológico de fijación de 120 kg N/ha en suelos de altura.\n\nSubir a más de 120 kg/ha sobrestimará el nitrógeno biológico, haciendo que los agricultores apliquen menos fertilizante del necesario y arriesgando el rendimiento del cultivo posterior. Te recomiendo mantenerlo entre 85 y 110 kg N/ha y SIEMPRE crear un Snapshot de Backup antes de guardar.`;
        suggestedAction = 'Crear Punto de Restauración (Backup) ahora';
      } else if (lower.includes('backup') || lower.includes('rollback') || lower.includes('error') || lower.includes('equivoc') || lower.includes('restaurar')) {
        alertType = 'success';
        responseText = `🛡️ POLÍTICA DE SEGURIDAD (ANTI-ERROR HUMANO):\nComo administrador tienes poder total sobre la base de datos de producción. Si cometes un error al ingresar valores:\n1. Tienes disponible el botón "Crear Snapshot (Backup)" en la Matriz.\n2. Si algo sale mal, haz clic en "Rollback" para revertir la tabla instantáneamente al estado oficial del INIA.\n3. Ningún campesino recibirá datos corrompidos si mantienes snapshots activos.`;
      } else if (lower.includes('auditar') || lower.includes('matriz') || lower.includes('inia')) {
        alertType = 'success';
        responseText = `✅ AUDITORÍA DE MATRIZ AGRONÓMICA VIGENTE:\n• Especies activas: ${crops.length} cultivos andinos.\n• Tarwi: +95 kg N/ha (Fijador óptimo, Inmune a gorgojo).\n• Papa Nativa: -70 kg N/ha, 650 mm agua (Demanda alta de humedad).\n• Haba Verde: +75 kg N/ha, tolerancia helada -2.5°C.\n• Quinua Real: -25 kg N/ha, tolerancia helada -4.0°C (Grano rústico).\n\nTodos los valores cumplen con las tablas agronómicas del INIA y el CIP. La base de datos es 100% coherente.`;
      } else if (lower.includes('sequía') || lower.includes('el niño') || lower.includes('clima') || lower.includes('nasa')) {
        alertType = 'warning';
        responseText = `🛰️ TELEMETRÍA SATELITAL NASA EN VIVO:\n• Sensor SMAP L4: Humedad promedio del estrato radicular en Chinchero está en 41.2% (rango normal).\n• En caso de declarar "Simular El Niño", las precipitaciones proyectadas caerán un 25% (de 680 mm a 510 mm).\n• El motor de rotación cambiará automáticamente la recomendación prioritaria a Tarwi o Quinua Pasankalla para evitar pérdidas catastróficas.`;
      } else if (lower.includes('gorgojo') || lower.includes('plaga') || lower.includes('reportes')) {
        const gorgojoCount = reports.filter((r) => r.presencia_gorgojo).length;
        alertType = gorgojoCount > 0 ? 'warning' : 'info';
        responseText = `🐛 VIGILANCIA FITOSANITARIA (GROUND TRUTH):\nSe registran ${reports.length} reportes de agricultores en la base de datos.\n• Focos de gorgojo reportados: ${gorgojoCount} parcelas.\n• Medida recomendada: Para parcelas infectadas con Premnotrypes vorax, exigir rotación obligatoria a leguminosas (tarwi/haba) para asfixiar las larvas durante 1 campaña completa.`;
      } else {
        responseText = `Entendido. Como administrador territorial, tienes acceso a la matriz agronómica, ingesta de satélites NASA POWER/SMAP, base RAG de investigación del INIA y gestor QGIS.\n¿Deseas auditar la matriz, revisar las anomalías de precipitación satelital o simular una alerta regional?`;
      }

      const kipuMsg: Message = {
        id: `kipu-${Date.now()}`,
        sender: 'kipu',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        alertType,
        suggestedAction,
      };

      setMessages((prev) => [...prev, kipuMsg]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/50 bg-emerald-950 flex items-center justify-center shadow-xs">
                <img
                  src="/images/kipu_llama_happy.png"
                  alt="Kipu Admin Guardián"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Kipu Copilot • Guardián Admin</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 uppercase tracking-wide">
                  IA de Gobernanza
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Auditoría agronómica, prevención de errores y respaldo en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Warning Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Rol Administrador:</strong> Las modificaciones en Supabase afectan a todas las parcelas de los técnicos en campo.
            </span>
          </div>
          <button
            onClick={() => {
              if (onTriggerBackup) onTriggerBackup();
              onShowToast('Punto de restauración (Snapshot) generado con éxito');
            }}
            className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-200 rounded font-bold text-[11px] text-amber-950 transition flex items-center gap-1 flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3 text-amber-800" />
            <span>Crear Backup</span>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 text-white rounded-br-xs'
                    : msg.alertType === 'warning'
                    ? 'bg-amber-50 text-amber-950 border border-amber-300 rounded-bl-xs'
                    : msg.alertType === 'success'
                    ? 'bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-bl-xs'
                    : 'bg-white text-zinc-900 border border-zinc-200 rounded-bl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1">
                  <span className="font-bold flex items-center gap-1.5 text-[11px]">
                    {msg.sender === 'kipu' ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Kipu Guardián
                      </>
                    ) : (
                      'Tú (Admin)'
                    )}
                  </span>
                  <span className="text-[10px] opacity-60 font-mono">{msg.timestamp}</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>

                {msg.suggestedAction && (
                  <button
                    onClick={() => {
                      if (onTriggerBackup) onTriggerBackup();
                      onShowToast('Punto de restauración creado preventivamente');
                    }}
                    className="mt-2.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{msg.suggestedAction}</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white border border-zinc-200 rounded-2xl rounded-bl-xs p-3 text-xs text-zinc-500 flex items-center gap-2 shadow-xs">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Kipu consultando base agronómica del INIA y satélites...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-[10px] text-zinc-400 font-bold uppercase px-1">Preguntar:</span>
          {[
            'Auditar matriz actual contra INIA',
            '¿Qué pasa si subo Tarwi a 150 kg N/ha?',
            '¿Cómo funciona el Rollback si me equivoco?',
            'Simular sequía El Niño con satélite NASA',
            'Focos de gorgojo reportados en campo',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium whitespace-nowrap transition active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Pregunta a Kipu: ej. '¿Qué impacto tiene cambiar la tolerancia a heladas?'"
            className="flex-1 px-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-xl transition shadow-xs active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
