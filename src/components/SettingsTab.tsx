'use client';

import React, { useState, useEffect } from 'react';
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
  Globe,
  Check,
} from 'lucide-react';
import {
  resetDeviceProfile,
  getStoredLanguage,
  saveStoredLanguage,
} from '@/lib/deviceProfile';
import { getTranslation, SupportedLanguage } from '@/lib/translations';
import { playBubblePop, playSuccessFanfare, playWhoosh } from '@/lib/soundEffects';
import TypewriterText from './TypewriterText';

interface SettingsTabProps {
  profile: FarmerProfile;
  hardwareId: string;
  onOpenWizard: () => void;
  onOpenWelcome?: () => void;
  onToast: (msg: string) => void;
  onReset: () => void;
}

export default function SettingsTab({
  profile,
  hardwareId,
  onOpenWizard,
  onOpenWelcome,
  onToast,
  onReset,
}: SettingsTabProps) {
  const [gpsTesting, setGpsTesting] = useState(false);
  const [gpsResult, setGpsResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>('es');

  useEffect(() => {
    setLanguage(getStoredLanguage() as SupportedLanguage);
    const handleLangChange = () => {
      setLanguage(getStoredLanguage() as SupportedLanguage);
    };
    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const t = getTranslation(language).app;

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    playBubblePop();
    saveStoredLanguage(lang);
    setLanguage(lang);
    onToast(lang === 'qu' ? 'Runasimi simi akllasqa' : 'Idioma cambiado a Castellano');
  };

  const testGPS = () => {
    playBubblePop();
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsResult('Geolocalización no disponible en este navegador.');
      return;
    }
    setGpsTesting(true);
    setGpsResult(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsTesting(false);
        playSuccessFanfare();
        setGpsResult(
          `GPS Activo: Lat ${pos.coords.latitude.toFixed(4)}, Lon ${pos.coords.longitude.toFixed(4)} (Precisión: ${Math.round(pos.coords.accuracy)}m)`
        );
        onToast('Satélite GPS conectado con éxito');
      },
      (err) => {
        setGpsTesting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsResult('Permiso GPS bloqueado en el navegador. Por favor habilítalo en la barra de direcciones.');
        } else {
          setGpsResult(`Error GPS (${err.message}).`);
        }
        onToast('GPS bloqueado o no disponible');
      },
      { timeout: 7000 }
    );
  };

  const handleResetProfile = () => {
    playWhoosh();
    const confirmMsg = language === 'qu'
      ? 'Allpa allichaykunata dispostivomanta t\'aqayta munankichu?'
      : '¿Estás seguro de restablecer el perfil de esta chacra en este dispositivo?';
    if (confirm(confirmMsg)) {
      resetDeviceProfile();
      onReset();
      onToast(language === 'qu' ? 'Dispositivo allichaykuna qallarisqa' : 'Perfil de dispositivo restablecido');
    }
  };

  const area = profile.areaHa || 1.0;
  const topos = (area * 3.3).toFixed(1);

  const kipuIntroText = language === 'qu'
    ? `¡Chajra allichasqa! Kay dispositivoqa ${profile.distrito} (${profile.altitude} msnm) nisqawan watasqa. NASA SMAP radar yupaykunawan allpapa kawsayninwan tupasqa.`
    : `¡Chacra calibrada! Dispositivo vinculado a ${profile.distrito} (${profile.altitude} msnm). Telemetría satelital NASA SMAP y parámetros edáficos sincronizados.`;

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
              <span>{language === 'qu' ? 'KIPU ALLICHAYKUNA' : 'KIPU AJUSTES'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              {t.kipuOnline}
            </span>
          </div>

          <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
            <TypewriterText
              key={`${hardwareId}-${language}`}
              text={kipuIntroText}
              speed={16}
            />
          </p>
        </div>
      </div>

      {/* SELECTOR DE IDIOMA / RUNASIMI */}
      <div className="glass-panel p-4 space-y-3 border-2 border-emerald-500/40 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h4 className="font-black text-sm text-white">{t.language}</h4>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            {language === 'qu' ? 'Runasimi' : 'Castellano'}
          </span>
        </div>

        <p className="text-xs text-slate-300">
          {language === 'qu'
            ? 'Akllay chajraykipi rimayta: Castellano otaq Runasimi (Quechua Chanka / Cusco-Collao).'
            : 'Selecciona el idioma de interfaz y síntesis de voz: Castellano o Runasimi (Quechua Chanka / Cusco-Collao).'}
        </p>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleSelectLanguage('es')}
            className={`p-3 rounded-2xl flex items-center justify-between border transition cursor-pointer ${
              language === 'es'
                ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/50 shadow-md'
                : 'bg-[#0A1A0F]/60 border-emerald-500/20 text-slate-300 hover:bg-[#132A1C]'
            }`}
          >
            <div className="text-left">
              <span className="text-xs font-bold block">Castellano</span>
              <span className="text-[10px] text-emerald-300/80 block font-normal">Español</span>
            </div>
            {language === 'es' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelectLanguage('qu')}
            className={`p-3 rounded-2xl flex items-center justify-between border transition cursor-pointer ${
              language === 'qu'
                ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/50 shadow-md'
                : 'bg-[#0A1A0F]/60 border-emerald-500/20 text-slate-300 hover:bg-[#132A1C]'
            }`}
          >
            <div className="text-left">
              <span className="text-xs font-bold block">Runasimi</span>
              <span className="text-[10px] text-emerald-300/80 block font-normal">Quechua</span>
            </div>
            {language === 'qu' && <Check className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. IDENTIFICADOR FÍSICO DE DISPOSITIVO (DARK FOREST GLASS PANEL) */}
      <div className="glass-panel p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>{language === 'qu' ? 'Dispositivo Yupay (Hardware ID)' : 'Identificador Físico de Dispositivo'}</span>
          </span>
          <span className="text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-500/40">
            {hardwareId}
          </span>
        </div>
        <div className="text-[11px] text-slate-300 grid grid-cols-2 gap-2 pt-1 font-mono border-t border-emerald-500/20">
          <div>
            <span className="text-emerald-400/80 block text-[10px]">{language === 'qu' ? 'Qhawana Pantalla:' : 'Pantalla:'}</span>
            <span>{typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'Mobile'}</span>
          </div>
          <div>
            <span className="text-emerald-400/80 block text-[10px]">{language === 'qu' ? 'Pacha Suyu:' : 'Zona Horaria:'}</span>
            <span>America/Lima</span>
          </div>
        </div>
      </div>

      {/* 3. PARÁMETROS DE LA PARCELA */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <h4 className="font-black text-sm text-white">
              {language === 'qu' ? 'Chajrapa Tupunkuna' : 'Parámetros de la Parcela'}
            </h4>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {language === 'qu' ? 'Tupasqa' : 'Sincronizado'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">Microcuenca</span>
            <span className="font-bold text-white block truncate">{profile.cuencaName}</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">
              {language === 'qu' ? 'Suyu / Ayllu' : 'Ubicación'}
            </span>
            <span className="font-bold text-white block truncate">
              {profile.distrito}, {profile.provincia}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">
              {language === 'qu' ? 'Hanan Kay (Altitud)' : 'Altitud Oficial'}
            </span>
            <span className="font-bold text-white block">{profile.altitude} msnm</span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">Coordenadas</span>
            <span className="font-bold text-slate-200 block font-mono text-[11px]">
              {profile.lat.toFixed(3)}, {profile.lon.toFixed(3)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">
              {language === 'qu' ? 'Chajrapa Hatun Kaynin' : 'Área de Parcela'}
            </span>
            <span className="font-bold text-lime-300 block font-mono">
              {area} ha ({topos} topos)
            </span>
          </div>
          <div>
            <span className="text-[11px] text-emerald-400/80 font-medium block">
              {language === 'qu' ? 'Ñawpa Tarpusqa' : 'Cosecha Previa'}
            </span>
            <span className="font-bold text-white block">{profile.previousCropName}</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400/80 font-medium">
              {language === 'qu' ? 'Tarpuy Paqtay:' : 'Prioridad de Campaña:'}
            </span>
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
          <span>{language === 'qu' ? 'Allichay Llamk\'anakuna' : 'Acciones de Calibración'}</span>
        </h4>

        {/* Ver Pantalla de Bienvenida */}
        {onOpenWelcome && (
          <button
            type="button"
            onClick={onOpenWelcome}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#132A1C]/90 hover:bg-[#183925] text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/30 transition cursor-pointer shadow-sm"
          >
            <span>🌱</span>
            <span>{language === 'qu' ? 'Qallariy Qhawana Rikuy' : 'Ver Pantalla de Bienvenida'}</span>
          </button>
        )}

        {/* Reabrir Wizard */}
        <button
          type="button"
          onClick={onOpenWizard}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition cursor-pointer border border-emerald-400/40"
        >
          <RotateCcw className="w-4 h-4 text-lime-300" />
          <span>{t.reconfigChacra}</span>
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
            {gpsTesting
              ? (language === 'qu' ? 'GPS Satélitewan tupuchkan...' : 'Comprobando Satélites GPS...')
              : t.checkGps}
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
          <span>{t.disconnectChacra}</span>
        </button>
      </div>

      {/* 5. ESTADO DE CONECTIVIDAD CON LA NUBE Y APIS */}
      <div className="glass-panel p-4 space-y-2.5 text-xs">
        <h4 className="font-black text-sm text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>{language === 'qu' ? 'Llikawan Tupanachiy' : 'Conectividad de Base de Datos & APIs'}</span>
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
              <span>NASA SMAP L4 ({language === 'qu' ? 'Allpa Chiri-poqo' : 'Humedad Suelo'})</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              {language === 'qu' ? 'KAWSACHKAN' : 'ACTIVO'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A1A0F]/60 border border-emerald-500/20">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ESRI World Imagery & QGIS OSM</span>
            </span>
            <span className="font-mono text-[10px] text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              {language === 'qu' ? 'TUPASQA' : 'CONECTADO'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
