'use client';

import React, { useState } from 'react';
import { FarmerProfile, Microcuenca } from '@/lib/types';
import {
  X,
  Cpu,
  MapPin,
  RotateCcw,
  Navigation,
  Database,
  CheckCircle2,
  Trash2,
  Sliders,
  Radio,
  Satellite,
} from 'lucide-react';
import { resetDeviceProfile } from '@/lib/deviceProfile';
import { playBubblePop, playSuccessFanfare, playWhoosh } from '@/lib/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FarmerProfile;
  hardwareId: string;
  microcuencas?: Microcuenca[];
  onToast: (msg: string) => void;
  onOpenWizard: () => void;
  onReset: () => void;
  onUpdateProfile?: (updated: Partial<FarmerProfile>) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  profile,
  hardwareId,
  microcuencas = [],
  onToast,
  onOpenWizard,
  onReset,
  onUpdateProfile,
}: SettingsModalProps) {
  const [gpsTesting, setGpsTesting] = useState(false);
  const [gpsResult, setGpsResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const testGPS = () => {
    playBubblePop();
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsResult('⚠️ Geolocalización no disponible en este dispositivo.');
      return;
    }
    setGpsTesting(true);
    setGpsResult(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsTesting(false);
        playSuccessFanfare();
        setGpsResult(
          `✅ GPS Calibrado: Lat ${pos.coords.latitude.toFixed(4)}, Lon ${pos.coords.longitude.toFixed(4)} (Precisión: ±${Math.round(pos.coords.accuracy)}m)`
        );
        onToast('🛰️ Satélite GPS conectado con éxito');
        if (onUpdateProfile) {
          onUpdateProfile({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lon: Number(pos.coords.longitude.toFixed(4)),
          });
        }
      },
      (err) => {
        setGpsTesting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsResult('⚠️ Permiso GPS bloqueado en el navegador. Por favor actívalo en permisos.');
        } else {
          setGpsResult(`⚠️ Error GPS (${err.message}).`);
        }
        onToast('⚠️ GPS no disponible');
      },
      { timeout: 7000 }
    );
  };

  const handleResetProfile = () => {
    if (confirm('¿Deseas restaurar la configuración inicial y calibrar de nuevo tu chacra?')) {
      playWhoosh();
      resetDeviceProfile();
      onToast('🔄 Configuración de chacra restablecida.');
      onReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#F7F9F6] w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-5 shadow-2xl border border-[#E5ECE2] text-zinc-900 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E5ECE2]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Cpu className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#132A1C]">Ajustes de Parcela & Hardware</h2>
              <span className="text-[10px] text-zinc-500 font-mono">ID: {hardwareId || 'TQ-HW-C249'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E5ECE2] flex items-center justify-center text-zinc-600 hover:text-zinc-900 cursor-pointer shadow-2xs"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Parcela Activa Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5ECE2] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60">
              PARCELA ACTIVA
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {profile.altitude || 3380} msnm
            </span>
          </div>

          <div className="space-y-0.5">
            <h3 className="text-base font-black text-[#132A1C]">
              {profile.parcelName} • {profile.distrito || 'Urubamba'}
            </h3>
            <p className="text-xs text-zinc-500">
              {profile.cuencaName} ({profile.departamento || 'Cusco'})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-[#E5ECE2]">
            <div>
              <span className="text-[10px] text-zinc-400 block">Cultivo Principal:</span>
              <span className="font-bold text-[#132A1C]">{profile.previousCropName || 'Papa Nativa'}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Área Registrada:</span>
              <span className="font-bold text-[#132A1C]">{profile.areaHa || 1.0} ha (≈ {((profile.areaHa || 1.0) * 3.3).toFixed(1)} topos)</span>
            </div>
          </div>
        </div>

        {/* GPS Satellite Testing */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5ECE2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60">
              CONEXIÓN SATELITAL GPS
            </span>
            <Satellite className="w-4 h-4 text-emerald-800" />
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Sincroniza la antena GNSS de tu dispositivo con las coordenadas orbitales de NASA SMAP.
          </p>

          <button
            type="button"
            onClick={testGPS}
            disabled={gpsTesting}
            className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition cursor-pointer ${
              gpsTesting
                ? 'bg-zinc-100 text-zinc-400 border-zinc-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsTesting ? 'animate-spin' : ''}`} />
            <span>{gpsTesting ? 'Triangulando Satélites...' : 'Probar Precisión GPS en Vivo'}</span>
          </button>

          {gpsResult && (
            <div className="p-2.5 rounded-xl bg-[#F7F9F6] border border-[#E5ECE2] text-xs font-mono text-zinc-800 leading-snug">
              {gpsResult}
            </div>
          )}
        </div>

        {/* Telemetría y Persistencia en Hardware */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5ECE2] shadow-xs space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900/60 block">
            PERSISTENCIA OFFLINE EN HARDWARE
          </span>
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <span>Identificador Hardware Único:</span>
            <span className="font-mono font-bold text-emerald-900">{hardwareId || 'TQ-HW-C249'}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <span>Almacenamiento Local (IndexedDB):</span>
            <span className="font-bold text-emerald-700">100% Operativo sin señal</span>
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-600">
            <span>Sincronización Supabase Cloud:</span>
            <span className="font-bold text-emerald-700">Outbox activo</span>
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onClose();
              onOpenWizard();
            }}
            className="w-full py-3 rounded-full bg-[#84CC16] hover:bg-[#72b012] text-[#132A1C] font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Recalibrar Asistente Completo (Onboarding)</span>
          </button>

          <button
            type="button"
            onClick={handleResetProfile}
            className="w-full py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Restablecer Configuración a Valores de Fábrica</span>
          </button>
        </div>

        {/* GeoTeam Credits */}
        <div className="pt-2 pb-1 text-center text-[10px] text-zinc-400 space-y-0.5 border-t border-zinc-200/60">
          <div className="font-semibold text-zinc-500 uppercase tracking-wider">
            GeoTeam • NASA Space Apps Challenge 2026
          </div>
          <p className="text-[9.5px] text-zinc-400 leading-relaxed">
            Alina Castañeda · Rafael Gil · Luciana Carbajo · Angel Lopez · Reiser Soplin · Hector Ramos
          </p>
        </div>
      </div>
    </div>
  );
}
