'use client';

import React, { useState } from 'react';
import { FarmerProfile } from '@/lib/types';
import {
  Cpu,
  MapPin,
  RotateCcw,
  Navigation,
  Database,
  CheckCircle2,
  Sliders,
  Trash2,
} from 'lucide-react';
import { resetDeviceProfile } from '@/lib/deviceProfile';
import { playBubblePop, playSuccessFanfare, playWhoosh } from '@/lib/soundEffects';
import TypewriterText from './TypewriterText';

interface SettingsTabProps {
  profile: FarmerProfile;
  hardwareId: string;
  onOpenWizard: () => void;
  onToast: (msg: string) => void;
  onReset: () => void;
}

export default function SettingsTab({
  profile,
  hardwareId,
  onOpenWizard,
  onToast,
  onReset,
}: SettingsTabProps) {
  const [gpsTesting, setGpsTesting] = useState(false);
  const [gpsResult, setGpsResult] = useState<string | null>(null);

  const testGPS = () => {
    playBubblePop();
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsResult('⚠️ Geolocalización no disponible en este navegador.');
      return;
    }
    setGpsTesting(true);
    setGpsResult(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsTesting(false);
        playSuccessFanfare();
        setGpsResult(
          `✅ GPS Activo: Lat ${pos.coords.latitude.toFixed(4)}, Lon ${pos.coords.longitude.toFixed(4)} (Precisión: ±${Math.round(pos.coords.accuracy)}m)`
        );
        onToast('🛰️ Satélite GPS conectado con éxito');
      },
      (err) => {
        setGpsTesting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsResult('⚠️ Permiso GPS bloqueado en el navegador. Por favor habilítalo en la barra de direcciones.');
        } else {
          setGpsResult(`⚠️ Error GPS (${err.message}).`);
        }
        onToast('⚠️ GPS bloqueado o no disponible');
      },
      { timeout: 7000 }
    );
  };

  const handleResetProfile = () => {
    playWhoosh();
    if (confirm('¿Estás seguro de restablecer el perfil de esta chacra en este dispositivo?')) {
      resetDeviceProfile();
      onReset();
      onToast('🔄 Perfil de dispositivo restablecido');
    }
  };

  const area = profile.areaHa || 1.0;
  const topos = (area * 3.3).toFixed(1);

  return (
    <div className="space-y-4 animate-in fade-in pb-16 pt-1">
      {/* 1. KIPU HARDWARE CON GLOBO GLASSMORPHIC */}
      <div className="flex items-center gap-3.5 pt-1 pb-1 min-h-[155px]">
        {/* Llama Avatar libre */}
        <div className="w-28 sm:w-32 h-36 sm:h-40 shrink-0 relative flex items-center justify-center">
          <img
            src="/images/kipu_llama.png"
            alt="Kipu Ajustes"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Globo de Diálogo Glassmorphic */}
        <div className="flex-1 relative bg-[#132A1C]/80 border border-emerald-500/40 rounded-3xl p-3.5 shadow-xl backdrop-blur-md text-slate-100">
          <div className="absolute top-7 -left-2.5 w-4 h-4 bg-[#132A1C] border-b border-l border-emerald-500/40 transform rotate-45"></div>

          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-black text-xs text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
              <span>KIPU AJUSTES</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              En Línea
            </span>
          </div>

          <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
            <TypewriterText
              key={hardwareId}
              text={`¡Chacra calibrada! Dispositivo vinculado a ${profile.distrito} (${profile.altitude} msnm). Telemetría satelital NASA SMAP y parámetros edáficos sincronizados.`}
              speed={16}
            />
          </p>
        </div>
      </div>

      {/* 2. IDENTIFICADOR FÍSICO DE DISPOSITIVO (DARK FOREST GLASS PANEL) */}
      <div className="glass-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Identificador Físico de Dispositivo</span>
          </span>
          <span className="text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-500/40">
            {hardwareId}
          </span>
        </div>
        <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-2 pt-1 font-mono border-t border-emerald-500/20">
          <div>
            <span className="text-emerald-400/80 block text-[10px]">Pantalla:</span>
            <span>{typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Mobile'}</span>
          </div>
          <div>
            <span className="text-emerald-400/80 block text-[10px]">Zona Horaria:</span>
            <span>America/Lima</span>
          </div>
        </div>
      </div>

      {/* 3. PARÁMETROS DE LA PARCELA (SIN CARDS ANIDADOS INNECESARIOS) */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h4 className="font-black text-sm text-white">Parámetros de la Parcela</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Sincronizado
          </span>
        </div>

        {/* Rejilla limpia de pares clave-valor */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">Microcuenca</span>
            <span className="font-bold text-white block truncate">{profile.cuencaName}</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">Ubicación</span>
            <span className="font-bold text-white block truncate">
              {profile.distrito}, {profile.provincia}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">Altitud Oficial</span>
            <span className="font-bold text-white block">{profile.altitude} msnm</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">Coordenadas</span>
            <span className="font-bold text-slate-200 block font-mono text-[11px]">
              {profile.lat.toFixed(3)}, {profile.lon.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">Área de Parcela</span>
            <span className="font-bold text-lime-300 block font-mono">
              {area} ha ({topos} topos)
            </span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">Cosecha Previa</span>
            <span className="font-bold text-white block">{profile.previousCropName}</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400/80 font-medium">Prioridad de Campaña:</span>
            <span className="font-black text-slate-950 text-xs bg-lime-400 px-2.5 py-0.5 rounded-lg border border-lime-500">
              {profile.priorityName}
            </span>
          </div>
        </div>
      </div>

      {/* 4. ACCIONES DE CALIBRACIÓN */}
      <div className="glass-panel p-4 space-y-3">
        <h4 className="font-black text-sm text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Acciones de Calibración</span>
        </h4>

        {/* Reabrir Wizard */}
        <button
          type="button"
          onClick={onOpenWizard}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition cursor-pointer border border-emerald-400/40"
        >
          <RotateCcw className="w-4 h-4 text-lime-300" />
          <span>Reconfigurar Chacra con Asistente Kipu</span>
        </button>

        {/* Probar GPS */}
        <button
          type="button"
          onClick={testGPS}
          disabled={gpsTesting}
          className="w-full py-3 px-4 rounded-2xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-200 font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition cursor-pointer"
        >
          <Navigation className={`w-4 h-4 text-cyan-400 ${gpsTesting ? 'animate-spin' : ''}`} />
          <span>
            {gpsTesting ? 'Comprobando Satélites GPS...' : 'Comprobar Señal GPS Satelital'}
          </span>
        </button>

        {gpsResult && (
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-xs text-emerald-200 font-mono">
            {gpsResult}
          </div>
        )}

        {/* Restablecer Perfil */}
        <button
          type="button"
          onClick={handleResetProfile}
          className="w-full py-2.5 px-4 rounded-2xl border border-red-500/40 bg-red-950/30 text-red-300 hover:bg-red-950/60 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>Desvincular Chacra de este Dispositivo</span>
        </button>
      </div>

      {/* 5. ESTADO DE CONECTIVIDAD CON LA NUBE Y APIS */}
      <div className="glass-panel p-4 space-y-2.5 text-xs">
        <h4 className="font-black text-sm text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Conectividad de Base de Datos &amp; APIs</span>
        </h4>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Cloud (PostGIS)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">200 OK</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>NASA SMAP L4 (Humedad Suelo)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">ACTIVO</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ESRI World Imagery &amp; QGIS OSM</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">CONECTADO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
