'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Sun,
  AlertTriangle,
  ChevronDown,
  WifiOff,
  Droplets,
  Thermometer,
} from 'lucide-react';
import {
  Microcuenca,
  Cultivo,
  ClimaNasa,
  FarmerProfile,
} from '@/lib/types';
import {
  generateHardwareProfile,
  getStoredDeviceProfile,
  saveDeviceProfile,
  resetDeviceProfile,
} from '@/lib/deviceProfile';
import {
  getMicrocuencas,
  getCultivos,
  getClimaNasa,
  submitReportToCloud,
} from '@/lib/supabaseClient';
import { playBubblePop } from '@/lib/soundEffects';

// Modular Tab & Subsystem Components
import InicioTab from '@/components/tabs/InicioTab';
import ChacraTab from '@/components/tabs/ChacraTab';
import ClimaTab from '@/components/tabs/ClimaTab';
import BottomNav from '@/components/layout/BottomNav';
import SoilValidator from '@/components/SoilValidator';
import SaberesCard from '@/components/SaberesCard';
import SettingsTab from '@/components/SettingsTab';
import KipuFullScreenWizard from '@/components/KipuFullScreenWizard';
import AgroClimaNewsFeed from '@/components/AgroClimaNewsFeed';

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'elnino' | 'chacra' | 'tierra' | 'saberes' | 'ajustes'>('inicio');
  const [isElNino, setIsElNino] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hardwareId, setHardwareId] = useState('TQ-HW-INIT');
  const [isNewsOpen, setIsNewsOpen] = useState(false);

  // Full-screen first-time setup / onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase live database states
  const [microcuencas, setMicrocuencas] = useState<Microcuenca[]>([]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [climaNasa, setClimaNasa] = useState<ClimaNasa | null>(null);

  // Farmer Profile
  const [profile, setProfile] = useState<FarmerProfile>({
    cuencaId: '29699448-afa8-4fb4-b502-24e3e577ef90',
    cuencaName: 'Microcuenca Vilcanota - Urubamba',
    parcelName: 'Chacra Maras',
    distrito: 'Maras',
    provincia: 'Urubamba',
    departamento: 'Cusco',
    moisture: 'HUMEDAD_MEDIA',
    moistureLabel: 'Húmeda y Mullida',
    previousCropId: 'papa_nativa',
    previousCropName: 'Papa Nativa',
    priority: 'tierra',
    priorityName: 'Curar y Abonar Suelo',
    lat: -13.332,
    lon: -72.158,
    altitude: 3380,
    slope: 12,
    areaHa: 1.0,
  });

  // Check online status and detect hardware profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        triggerToast('🟢 Conexión reestablecida con la nube');
      };
      const handleOffline = () => {
        setIsOnline(false);
        triggerToast('🟠 Modo Sin Señal activado (100% Funcional)');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Deterministic Hardware Signature Detection
      const hw = generateHardwareProfile();
      setHardwareId(hw.deviceId);

      // Support ?reset=1 or ?wizard=1 in URL for instant verification
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('reset') === '1' || urlParams.get('reset') === 'true') {
        resetDeviceProfile();
        setShowOnboarding(true);
      } else if (urlParams.get('wizard') === '1' || urlParams.get('wizard') === 'true') {
        setShowOnboarding(true);
      } else {
        // Check for persistent profile stored on this hardware
        const stored = getStoredDeviceProfile();
        if (stored) {
          setProfile(stored);
          setShowOnboarding(false);
        } else {
          // First time on this hardware device: display full-screen onboarding wizard
          setShowOnboarding(true);
        }
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Fetch live Supabase data on mount and whenever cuencaId changes
  useEffect(() => {
    async function loadData() {
      const [cuencasData, cultivosData] = await Promise.all([
        getMicrocuencas(),
        getCultivos(),
      ]);
      setMicrocuencas(cuencasData);
      setCultivos(cultivosData);

      // Match microcuenca by profile
      const activeCuenca = cuencasData.find((c) => c.id === profile.cuencaId) || cuencasData[0];
      if (activeCuenca) {
        const climaData = await getClimaNasa(activeCuenca.id);
        setClimaNasa(climaData);
      }
    }
    loadData();
  }, [profile.cuencaId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    triggerToast('🔄 Conectando con Supabase & NASA SMAP...');

    try {
      const [cuencasData, cultivosData] = await Promise.all([
        getMicrocuencas(),
        getCultivos(),
      ]);

      if (cuencasData.length > 0) setMicrocuencas(cuencasData);
      if (cultivosData.length > 0) setCultivos(cultivosData);

      const activeCuenca = cuencasData.find((c) => c.id === profile.cuencaId) || cuencasData[0];
      if (activeCuenca) {
        const climaData = await getClimaNasa(activeCuenca.id);
        if (climaData) setClimaNasa(climaData);
      }

      const peruTime = new Date().toLocaleTimeString('es-PE', {
        timeZone: 'America/Lima',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      triggerToast(`🟢 Telemetría actualizada (Hora Perú: ${peruTime})`);
    } catch (e) {
      console.error(e);
      triggerToast('⚠️ Error al conectar con la nube');
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const handleProfileComplete = (newProfile: FarmerProfile) => {
    const saved = saveDeviceProfile(newProfile);
    setProfile(saved);
    setShowOnboarding(false);
    triggerToast(`🌾 Chacra (${saved.areaHa} ha) calibrada en hardware [${saved.deviceId}]`);

    // Sincronización transparente con Supabase para el Visor Territorial y Ground-Truth Comunal
    submitReportToCloud({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}`,
      dispositivo_id: saved.deviceId,
      cuenca_id: saved.cuencaId,
      latitud: saved.lat,
      longitud: saved.lon,
      cultivo_actual_id: saved.previousCropId,
      humedad_suelo_estimada: saved.moisture,
      presencia_gorgojo: false,
      alerta_helada_observada: false,
      sincronizado_desde_outbox: false,
      created_at: new Date().toISOString(),
    }).then((res) => {
      if (res.success) {
        triggerToast('🛰️ Calibración triangulada enviada a Supabase (Ground-Truth Comunal)');
      }
    }).catch(() => {});
  };

  const handleUpdateProfile = (updatedFields: Partial<FarmerProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updatedFields };
      saveDeviceProfile(next);
      return next;
    });

    // Sincronización transparente en segundo plano con Supabase para el Visor Territorial
    if (typeof window !== 'undefined' && navigator.onLine) {
      submitReportToCloud({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rep-${Date.now()}`,
        dispositivo_id: hardwareId,
        cuenca_id: profile.cuencaId,
        latitud: profile.lat,
        longitud: profile.lon,
        cultivo_actual_id: updatedFields.previousCropId || profile.previousCropId,
        humedad_suelo_estimada: updatedFields.moisture || profile.moisture,
        presencia_gorgojo: (updatedFields.pest || profile.pest) === 'gorgojo',
        alerta_helada_observada: false,
        textura_suelo: updatedFields.soilTexture || profile.soilTexture || 'franca',
        pedregosidad: updatedFields.soilStoniness || profile.soilStoniness || 'profundo',
        cobertura_ndvi_real: updatedFields.cropCoverNdvi || profile.cropCoverNdvi || 'barbecho',
        fuente_agua: updatedFields.waterSource || profile.waterSource || 'auxilio',
        ventana_siembra: updatedFields.sowingWindow || profile.sowingWindow || '2_4_semanas',
        sincronizado_desde_outbox: false,
        created_at: new Date().toISOString(),
      }).catch(() => {});
    }
  };

  // Calculate live SMAP percentage from Supabase or cuenca defaults
  const smapPercent = climaNasa?.humedad_suelo_smap_m3m3
    ? Math.round(climaNasa.humedad_suelo_smap_m3m3 * 100)
    : profile.cuencaId === '29699448-afa8-4fb4-b502-24e3e577ef90'
    ? 12
    : profile.cuencaId === '5ca30027-bcea-4223-a073-ee6eadb6c702'
    ? 35
    : 38;

  if (showOnboarding) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-white">
        {/* Toast Notification Pill */}
        {toastMessage && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-2xl bg-slate-900/95 text-white font-bold text-xs shadow-xl backdrop-blur-md border border-slate-700 flex items-center gap-2">
            <span className="contrast-bold-white">{toastMessage}</span>
          </div>
        )}

        <KipuFullScreenWizard
          microcuencas={microcuencas}
          cultivos={cultivos}
          onComplete={handleProfileComplete}
          onCancel={getStoredDeviceProfile() ? () => setShowOnboarding(false) : undefined}
          initialProfile={profile}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#0A1A0F] text-slate-100 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-2xl bg-slate-900/95 text-white font-bold text-xs shadow-2xl backdrop-blur-md border border-emerald-500/40 flex items-center gap-2">
          <span className="contrast-bold-white">{toastMessage}</span>
        </div>
      )}

      {/* Top Mobile App Header - Dark Forest Glassmorphism */}
      <header className="bg-[#0A1A0F]/85 backdrop-blur-xl border-b border-emerald-500/20 px-3 py-2 sticky top-0 z-40 shadow-lg">
        <div className="max-w-md mx-auto w-full flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0 shrink">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-950/60 shrink-0 border border-emerald-400/30">
              🌱
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-tight truncate">
                  TerraQuipu
                </span>
                <span className="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  Móvil
                </span>
              </div>
              {/* Quick Parcel Switcher / Profile Pill */}
              <button
                type="button"
                onClick={() => setActiveTab('ajustes')}
                className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 hover:text-emerald-100 transition cursor-pointer truncate max-w-[130px] sm:max-w-[170px]"
                title="Ir a ajustes de la parcela"
              >
                <span className="truncate">{profile.parcelName} • {profile.distrito}</span>
                <ChevronDown className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              </button>
            </div>
          </div>

          {/* Right: Refresh button + Compact Telemetry (Humedad & Temperatura) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Refresh button with green border */}
            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className={`w-7 h-7 rounded-full border border-emerald-500/40 bg-[#132A1C]/80 text-emerald-400 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-sm hover:bg-emerald-900/60 shrink-0 ${
                isRefreshing ? 'border-emerald-400 bg-emerald-900/80' : ''
              }`}
              title="Recibir datos frescos de la nube (Hora Perú)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-300' : 'text-emerald-400'}`} />
            </button>

            {/* Compact Humedad SMAP Pill */}
            <div className="px-2 py-0.5 rounded-xl bg-[#132A1C]/80 border border-cyan-500/30 text-left leading-tight shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-0.5 text-[8.5px] font-bold text-cyan-300">
                <Droplets className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span className="truncate">Humedad SMAP</span>
              </div>
              <div className="text-[11px] font-black text-white leading-none my-0.5">
                {smapPercent}% <span className="text-[8px] font-normal text-cyan-200/70">vol</span>
              </div>
              <div className="text-[7.5px] font-extrabold text-emerald-400 truncate leading-none">
                {smapPercent < 20 ? '⚠️ Déficit' : '✓ Adecuada'}
              </div>
            </div>

            {/* Compact Temperatura Pill */}
            <div className="px-2 py-0.5 rounded-xl bg-[#132A1C]/80 border border-amber-500/30 text-left leading-tight shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-0.5 text-[8.5px] font-bold text-amber-300">
                <Thermometer className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span className="truncate">Temperatura</span>
              </div>
              <div className="text-[11px] font-black text-white leading-none my-0.5">
                {climaNasa?.temp_media_c ? `${climaNasa.temp_media_c} °C` : '11.1 °C'}
              </div>
              <div className="text-[7.5px] font-medium text-amber-200/70 truncate leading-none">
                NASA POWER
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Paisaje Andino Oscuro de Fondo (Dark Forest Atmosphere) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-0 inset-x-0 h-[640px] bg-top bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url('/images/andes_bright.jpg')`,
            opacity: 0.12,
            filter: 'saturate(1.2) brightness(0.8)',
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 90%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0) 90%)',
          }}
        />
        {/* Degradé profundo al Dark Forest */}
        <div className="absolute top-0 inset-x-0 h-[700px] bg-gradient-to-b from-[#0F2918]/60 via-[#0A1A0F]/90 to-[#0A1A0F]" />
      </div>

      {/* Main Tab Content (Scrollable, z-10 sobre el fondo andino) */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4 max-w-md mx-auto w-full relative z-10">
        {/* ================= TAB 1: INICIO ================= */}
        {activeTab === 'inicio' && (
          <InicioTab
            profile={profile}
            climaNasa={climaNasa}
            smapPercent={smapPercent}
            hardwareId={hardwareId}
            isElNino={isElNino}
            onOpenWizard={() => setShowOnboarding(true)}
            onNavigateToClima={() => setActiveTab('elnino')}
            onNavigateToChacra={() => setActiveTab('chacra')}
            onOpenNews={() => setIsNewsOpen(true)}
          />
        )}

        {/* ================= TAB 2: MI CHACRA & ROTACIÓN ================= */}
        {activeTab === 'chacra' && (
          <ChacraTab
            profile={profile}
            cultivos={cultivos}
            isElNino={isElNino}
            hardwareId={hardwareId}
            onToast={triggerToast}
            onRecalibrate={() => setShowOnboarding(true)}
            onUpdateCrop={(cropId, cropName) => {
              setProfile((prev) => ({
                ...prev,
                previousCropId: cropId,
                previousCropName: cropName,
              }));
            }}
            onUpdatePriority={(prio, prioName) => {
              setProfile((prev) => ({
                ...prev,
                priority: prio,
                priorityName: prioName,
              }));
            }}
            onUpdateArea={(newArea) => {
              setProfile((prev) => {
                const updated = { ...prev, areaHa: newArea };
                saveDeviceProfile(updated);
                return updated;
              });
            }}
          />
        )}

        {/* ================= TAB 3: CLIMA & ALERTA EL NIÑO ================= */}
        {activeTab === 'elnino' && (
          <ClimaTab
            profile={profile}
            climaNasa={climaNasa}
            isElNino={isElNino}
            onToast={triggerToast}
            onToggleElNino={(val) => {
              setIsElNino(val);
              triggerToast(val ? '⚠️ Modo Sequía El Niño activo' : '☀️ Modo Normal activo');
            }}
          />
        )}

        {/* ================= TAB 4: DIAGNÓSTICO DE SUELO ================= */}
        {activeTab === 'tierra' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Kipu Agrónomo Mascot con Globo de Diálogo Glassmorphic */}
            <div className="flex items-center gap-3.5 pt-1 pb-1 min-h-[155px]">
              <div className="w-28 sm:w-32 h-36 sm:h-40 shrink-0 relative flex items-center justify-center">
                <img
                  src="/images/kipu_llama.png"
                  alt="Kipu Suelo"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                />
              </div>
              <div className="flex-1 relative bg-[#132A1C]/80 border border-emerald-500/40 rounded-3xl p-3.5 shadow-xl backdrop-blur-md text-slate-100">
                <div className="absolute top-7 -left-2.5 w-4 h-4 bg-[#132A1C] border-b border-l border-emerald-500/40 transform rotate-45"></div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="font-black text-xs text-emerald-400 uppercase tracking-wide">
                    KIPU AGRÓNOMO
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Laboratorio
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
                  Tocar la tierra con tus manos revela su estructura y humedad al instante. Realiza la prueba del puño para calibrar los sensores NASA con tu terreno:
                </p>
              </div>
            </div>

            <SoilValidator
              cuencaId={profile.cuencaId}
              lat={profile.lat}
              lon={profile.lon}
              profile={profile}
              climaNasa={climaNasa}
              microcuencas={microcuencas}
              cultivos={cultivos}
              onToast={triggerToast}
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}

        {/* ================= TAB 5: SABERES ANDINOS ================= */}
        {activeTab === 'saberes' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Kipu Sabio Mascot Glassmorphic */}
            <div className="flex items-center gap-3.5 pt-1 pb-1 min-h-[155px]">
              <div className="w-28 sm:w-32 h-36 sm:h-40 shrink-0 relative flex items-center justify-center">
                <img
                  src="/images/kipu_llama.png"
                  alt="Kipu Saberes"
                  className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                />
              </div>
              <div className="flex-1 relative bg-[#132A1C]/80 border border-purple-500/40 rounded-3xl p-3.5 shadow-xl backdrop-blur-md text-slate-100">
                <div className="absolute top-7 -left-2.5 w-4 h-4 bg-[#132A1C] border-b border-l border-purple-500/40 transform rotate-45"></div>
                <span className="font-extrabold text-xs text-purple-400 uppercase tracking-wide block mb-1">
                  KIPU SABIO
                </span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed font-sans">
                  Nuestros abuelos perfeccionaron los andenes y las asociaciones de cultivos. Aplica estos saberes en tu chacra para no depender de químicos:
                </p>
              </div>
            </div>

            <SaberesCard />
          </div>
        )}

        {/* ================= TAB 6: AJUSTES & HARDWARE ================= */}
        {activeTab === 'ajustes' && (
          <div className="space-y-4 animate-in fade-in">
            <SettingsTab
              profile={profile}
              hardwareId={hardwareId}
              onOpenWizard={() => setShowOnboarding(true)}
              onToast={triggerToast}
              onReset={() => {
                setShowOnboarding(true);
              }}
            />
          </div>
        )}
      </main>

      {/* Floating News Button Container (Elevated cleanly above navbar, aligned to max-w-md, z-50 so NEVER behind BottomNav) */}
      <div className="fixed bottom-24 inset-x-0 max-w-md mx-auto pointer-events-none z-50 px-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setIsNewsOpen(true);
            }}
            className="pointer-events-auto relative w-13 h-13 rounded-2xl bg-emerald-900 hover:bg-emerald-800 border-2 border-emerald-600 text-white flex items-center justify-center shadow-2xl transition transform active:scale-95 cursor-pointer group hover:shadow-emerald-900/50"
            title="Abrir Boletines Científicos y Alertas ENOS"
          >
            <span className="text-2xl">📰</span>
            {/* Notification Badge with '3' */}
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center border-2 border-white shadow-md animate-pulse">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Slide-Up Bottom Sheet for News & ENOS Bulletins */}
      <AgroClimaNewsFeed isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />

      {/* Bottom Mobile Navigation Bar */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
