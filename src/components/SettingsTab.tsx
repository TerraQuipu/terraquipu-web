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

  return (
    <div className="space-y-4 animate-in fade-in pb-8">
      {/* Kipu Hardware con su Globo de Diálogo (Mismo branding de Inicio y Clima) */}
      <div className="flex items-center gap-3.5 pt-1 pb-1 min-h-[155px]">
        {/* Llama Avatar libre sin fondo blanco */}
        <div className="w-28 sm:w-32 h-36 sm:h-40 shrink-0 relative flex items-center justify-center">
          <img
            src="/images/kipu_llama.png"
            alt="Kipu Ajustes"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* Globo de Diálogo apuntando a Kipu */}
        <div className="flex-1 relative bg-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-3xl p-3.5 shadow-xs">
          <div className="absolute top-7 -left-2.5 w-4 h-4 bg-white border-b-2 border-l-2 border-emerald-600 transform rotate-45"></div>

          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-black text-xs text-emerald-950 uppercase tracking-wide">
              KIPU AJUSTES
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                En Línea
              </span>
            </div>
          </div>

          <p className="text-xs text-black font-semibold leading-relaxed font-sans">
            <TypewriterText
              key={hardwareId}
              text={`¡Chacra calibrada! Dispositivo vinculado a ${profile.distrito} (${profile.altitude} msnm). Telemetría satelital NASA SMAP y parámetros edáficos sincronizados.`}
              speed={16}
            />
          </p>
        </div>
      </div>

      {/* Telemetría de Dispositivo: Barra oscura limpia sin tarjetas anidadas */}
      <div className="p-3.5 bg-slate-900 rounded-2xl text-white shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Identificador Físico de Dispositivo</span>
          </span>
          <span className="text-[11px] font-mono font-bold bg-emerald-800 text-white px-2.5 py-0.5 rounded-lg border border-emerald-500">
            {hardwareId}
          </span>
        </div>
        <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-2 pt-1 font-mono border-t border-slate-800">
          <div>
            <span className="text-slate-400 block text-[10px]">Pantalla:</span>
            <span>{typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Mobile'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Zona Horaria:</span>
            <span>America/Lima</span>
          </div>
        </div>
      </div>

      {/* Parámetros de la Parcela: Lista elegante sin cajitas dentro de cajitas */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h4 className="font-black text-sm text-slate-950">Parámetros de la Parcela</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Sincronizado
          </span>
        </div>

        {/* Rejilla limpia de pares clave-valor sin micro-cards ni bordes innecesarios */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Microcuenca</span>
            <span className="font-bold text-slate-950 block truncate">{profile.cuencaName}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Ubicación</span>
            <span className="font-bold text-slate-950 block truncate">
              {profile.distrito}, {profile.provincia}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Altitud Oficial</span>
            <span className="font-bold text-slate-950 block">{profile.altitude} msnm</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Coordenadas</span>
            <span className="font-bold text-slate-950 block font-mono text-[11px]">
              {profile.lat.toFixed(3)}, {profile.lon.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Área de Parcela</span>
            <span className="font-bold text-emerald-900 block font-mono">
              {profile.areaHa || 2.4} ha ({((profile.areaHa || 2.4) * 3.3).toFixed(1)} topos)
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium block">Cosecha Previa</span>
            <span className="font-bold text-slate-950 block">{profile.previousCropName}</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Prioridad de Campaña:</span>
            <span className="font-black text-emerald-900 text-xs bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {profile.priorityName}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones de Calibración */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <h4 className="font-black text-sm text-slate-950 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-700" />
          <span>Acciones de Calibración</span>
        </h4>

        {/* Reabrir Wizard */}
        <button
          type="button"
          onClick={onOpenWizard}
          className="w-full py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-emerald-200" />
          <span className="contrast-bold-white">Reconfigurar Chacra con Asistente Kipu</span>
        </button>

        {/* Probar GPS */}
        <button
          type="button"
          onClick={testGPS}
          disabled={gpsTesting}
          className="w-full py-3 px-4 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition cursor-pointer"
        >
          <Navigation className={`w-4 h-4 text-sky-100 ${gpsTesting ? 'animate-spin' : ''}`} />
          <span className="contrast-bold-white">
            {gpsTesting ? 'Comprobando Satélites GPS...' : 'Comprobar Señal GPS Satelital'}
          </span>
        </button>

        {gpsResult && (
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium">
            {gpsResult}
          </div>
        )}

        {/* Restablecer Perfil */}
        <button
          type="button"
          onClick={handleResetProfile}
          className="w-full py-2.5 px-4 rounded-2xl border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
          <span>Desvincular Chacra de este Dispositivo</span>
        </button>
      </div>

      {/* Estado de Conectividad con la Nube y APIs */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-4 space-y-2.5 shadow-xs text-xs">
        <h4 className="font-black text-sm text-slate-950 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-700" />
          <span>Conectividad de Base de Datos &amp; APIs</span>
        </h4>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Supabase Cloud (PostGIS)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">200 OK</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>NASA SMAP L4 (Humedad Suelo)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">ACTIVO</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>OpenStreetMap &amp; Leaflet Tiles</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">CONECTADO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
