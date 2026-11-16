'use client';

import React, { useState } from 'react';
import { FarmerProfile, Microcuenca } from '@/lib/types';
import {
  ArrowLeft,
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
  Compass,
  Sparkles,
} from 'lucide-react';
import { resetDeviceProfile } from '@/lib/deviceProfile';
import { playBubblePop, playSuccessFanfare, playWhoosh } from '@/lib/soundEffects';

interface SettingsFullScreenViewProps {
  onBack: () => void;
  profile: FarmerProfile;
  hardwareId: string;
  microcuencas?: Microcuenca[];
  onToast: (msg: string) => void;
  onOpenWizard: () => void;
  onReset: () => void;
  onUpdateProfile?: (updated: Partial<FarmerProfile>) => void;
}

export default function SettingsFullScreenView({
  onBack,
  profile,
  hardwareId,
  microcuencas = [],
  onToast,
  onOpenWizard,
  onReset,
  onUpdateProfile,
}: SettingsFullScreenViewProps) {
  const [gpsTesting, setGpsTesting] = useState(false);
  const [gpsResult, setGpsResult] = useState<string | null>(null);
  const [parcelNameInput, setParcelNameInput] = useState(profile.parcelName || 'Chacra Maras');

  const testGPS = () => {
    playBubblePop();
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsResult('Geolocation unavailable on this device.');
      return;
    }
    setGpsTesting(true);
    setGpsResult(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsTesting(false);
        playSuccessFanfare();
        setGpsResult(
          `GPS Calibrated: Lat ${pos.coords.latitude.toFixed(4)}, Lon ${pos.coords.longitude.toFixed(4)} (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`
        );
        onToast('GNSS / GPS satellite fix established');
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
          setGpsResult('GPS permission blocked in browser. Please enable location permissions.');
        } else {
          setGpsResult(`GPS Error (${err.message}).`);
        }
        onToast('GPS unavailable');
      },
      { timeout: 7000 }
    );
  };

  const handleResetProfile = () => {
    if (confirm('Reset configuration and recalibrate your field parcel from scratch?')) {
      playWhoosh();
      resetDeviceProfile();
      onToast('Field parcel configuration reset.');
      onReset();
    }
  };

  const handleSaveParcelName = () => {
    if (onUpdateProfile && parcelNameInput.trim()) {
      onUpdateProfile({ parcelName: parcelNameInput.trim() });
      onToast('Parcel name updated.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9F6] text-[#132A1C] animate-in fade-in pb-24">
      {/* Top Fullscreen Header with <- Volver button */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5ECE2] px-4 py-3 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-[#132A1C] font-bold text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-sm font-semibold text-[#132A1C]">Settings &amp; Hardware Profile</h1>
            <span className="text-[10px] text-zinc-500 font-mono">ID: {hardwareId || 'TQ-HW-C249'}</span>
          </div>

          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <Cpu className="w-4 h-4 text-emerald-800" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto w-full px-4 py-4 space-y-4 flex-1">
        {/* Parcela Activa Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5ECE2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900/60">
              ACTIVE PARCEL
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {profile.altitude || 3380} m a.s.l.
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-500 block">
              Parcel Name:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={parcelNameInput}
                onChange={(e) => setParcelNameInput(e.target.value)}
                onBlur={handleSaveParcelName}
                className="flex-1 px-3 py-2 rounded-xl bg-[#F7F9F6] border border-[#E5ECE2] text-xs font-bold text-[#132A1C] focus:outline-emerald-600"
                placeholder="Parcel name"
              />
              <button
                type="button"
                onClick={handleSaveParcelName}
                className="px-3 py-2 rounded-xl bg-[#132A1C] text-white text-xs font-bold hover:bg-emerald-900 transition"
              >
                Save
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-[#E5ECE2]">
            <div>
              <span className="text-[10px] text-zinc-400 block">Micro-watershed:</span>
              <span className="font-bold text-[#132A1C] truncate block">
                {profile.cuencaName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Location:</span>
              <span className="font-bold text-[#132A1C]">
                {profile.distrito || 'Urubamba'}, {profile.departamento || 'Cusco'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Primary Crop:</span>
              <span className="font-bold text-[#132A1C]">
                {profile.previousCropName || 'Native Andean Potato'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Registered Area:</span>
              <span className="font-bold text-[#132A1C]">
                {profile.areaHa || 1.0} ha (≈ {((profile.areaHa || 1.0) * 3.3).toFixed(1)} topos)
              </span>
            </div>
          </div>
        </div>

        {/* Microcuenca Selector */}
        {microcuencas.length > 0 && onUpdateProfile && (
          <div className="bg-white rounded-3xl p-5 border border-[#E5ECE2] shadow-xs space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900/60 block">
              CHANGE ASSOCIATED MICRO-WATERSHED
            </span>
            <select
              value={profile.cuencaId}
              onChange={(e) => {
                const selected = microcuencas.find((c) => c.id === e.target.value);
                if (selected) {
                  onUpdateProfile({
                    cuencaId: selected.id,
                    cuencaName: selected.nombre,
                    lat: selected.latitud_centro,
                    lon: selected.longitud_centro,
                    altitude: selected.elevacion_media_msnm,
                  });
                  onToast(`Micro-watershed changed to: ${selected.nombre}`);
                }
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-[#F7F9F6] border border-[#E5ECE2] text-xs font-bold text-[#132A1C] focus:outline-emerald-600"
            >
              {microcuencas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} ({c.elevacion_media_msnm} m a.s.l.)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Geolocation & GPS Diagnostic */}
        <div className="bg-white rounded-3xl p-5 border border-[#E5ECE2] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-900/60">
              GPS &amp; SATELLITE TELEMETRY
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              {profile.lat.toFixed(4)}, {profile.lon.toFixed(4)}
            </span>
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            TerraQuipu triangulates your physical ground position with NASA SMAP and Sentinel-2 constellations to validate edaphic moisture.
          </p>

          <button
            type="button"
            onClick={testGPS}
            disabled={gpsTesting}
            className="w-full py-2.5 rounded-xl border border-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsTesting ? 'animate-spin' : ''}`} />
            <span>{gpsTesting ? 'Connecting with GPS satellites...' : 'Verify Live GPS Signal'}</span>
          </button>

          {gpsResult && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono text-zinc-700">
              {gpsResult}
            </div>
          )}
        </div>

        {/* Re-Calibrate / Reset Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={() => {
              playSuccessFanfare();
              onOpenWizard();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-98 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Calibrate Field Parcel with Kipu Assistant</span>
          </button>

          <button
            type="button"
            onClick={handleResetProfile}
            className="w-full py-3 rounded-2xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Reset Local Profile Settings</span>
          </button>
        </div>
      </main>
    </div>
  );
}
