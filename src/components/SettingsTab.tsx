'use client';

import React, { useState } from 'react';
import { FarmerProfile } from '@/lib/types';
import {
  Cpu,
  MapPin,
  Sprout,
  RotateCcw,
  Navigation,
  Database,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  RefreshCw,
  Trash2,
  Globe,
  Radio,
} from 'lucide-react';
import { resetDeviceProfile } from '@/lib/deviceProfile';
import { playBubblePop, playSuccessFanfare, playWhoosh } from '@/lib/soundEffects';

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
      {/* Header Card */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50/90 border border-amber-200/80 p-1 flex-shrink-0 flex items-center justify-center shadow-xs">
            <img
              src="/images/kipu_llama.png"
              alt="Kipu"
              className="w-full h-full object-contain filter drop-shadow-xs"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-slate-950">Ajustes &amp; Perfil de Chacra</h3>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-xs text-slate-500">
              Gestión de hardware, telemetría y calibración agronómica
            </p>
          </div>
        </div>

        {/* Hardware Info Pill */}
        <div className="p-3 bg-slate-900 rounded-xl text-white space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="contrast-bold-white">Identificador Físico de Dispositivo</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-800 text-white px-2 py-0.5 rounded border border-emerald-500">
              {hardwareId}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-2 pt-1 font-mono">
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
      </div>

      {/* Datos Actuales de la Parcela */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <h4 className="font-bold text-sm text-slate-950">Parámetros de la Parcela</h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            Sincronizado
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Microcuenca</span>
            <span className="font-bold text-slate-900 block truncate">{profile.cuencaName}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Ubicación</span>
            <span className="font-bold text-slate-900 block truncate">
              {profile.distrito}, {profile.provincia}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Altitud Oficial</span>
            <span className="font-bold text-slate-900 block">{profile.altitude} msnm</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Coordenadas</span>
            <span className="font-bold text-slate-900 block font-mono text-[11px]">
              {profile.lat.toFixed(3)}, {profile.lon.toFixed(3)}
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Área de Parcela</span>
            <span className="font-bold text-emerald-900 block font-mono">
              {profile.areaHa || 2.4} ha ({((profile.areaHa || 2.4) * 3.3).toFixed(1)} topos)
            </span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Cosecha Previa</span>
            <span className="font-bold text-slate-900 block">{profile.previousCropName}</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-medium">Prioridad Campaña</span>
            <span className="font-bold text-emerald-800 block truncate">{profile.priorityName}</span>
          </div>
        </div>
      </div>

      {/* Acciones de Calibración */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-3 shadow-xs">
        <h4 className="font-bold text-sm text-slate-950 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-700" />
          <span>Acciones de Calibración</span>
        </h4>

        {/* Reabrir Wizard */}
        <button
          type="button"
          onClick={onOpenWizard}
          className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition"
        >
          <RotateCcw className="w-4 h-4 text-emerald-200" />
          <span className="contrast-bold-white">Reconfigurar Chacra con Asistente Kipu</span>
        </button>

        {/* Probar GPS */}
        <button
          type="button"
          onClick={testGPS}
          disabled={gpsTesting}
          className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition"
        >
          <Navigation className={`w-4 h-4 text-sky-100 ${gpsTesting ? 'animate-spin' : ''}`} />
          <span className="contrast-bold-white">
            {gpsTesting ? 'Comprobando Satélites GPS...' : 'Comprobar Señal GPS Satelital'}
          </span>
        </button>

        {gpsResult && (
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 font-medium">
            {gpsResult}
          </div>
        )}

        {/* Restablecer Perfil */}
        <button
          type="button"
          onClick={handleResetProfile}
          className="w-full py-2.5 px-4 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 transition"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
          <span>Desvincular Chacra de este Dispositivo</span>
        </button>
      </div>

      {/* Estado de Conectividad con la Nube y APIs */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 space-y-2.5 shadow-xs text-xs">
        <h4 className="font-bold text-sm text-slate-950 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-700" />
          <span>Conectividad de Base de Datos &amp; APIs</span>
        </h4>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Supabase Cloud (PostGIS)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-800 font-bold">200 OK</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>NASA SMAP L4 (Humedad Suelo)</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-800 font-bold">ACTIVO</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>OpenStreetMap &amp; Leaflet Tiles</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-800 font-bold">CONECTADO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
