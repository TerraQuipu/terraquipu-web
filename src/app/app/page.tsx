'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  ChevronDown,
  Settings,
  Droplets,
  Thermometer,
  Sliders,
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
import RotationTab from '@/components/tabs/RotationTab';
import CopilotTab from '@/components/tabs/CopilotTab';
import BottomNav, { MainTab } from '@/components/layout/BottomNav';
import SoilDiagnosticWizardModal from '@/components/SoilDiagnosticWizardModal';
import SettingsModal from '@/components/SettingsModal';
import AgroClimaNewsFeed from '@/components/AgroClimaNewsFeed';
import WelcomeSplash from '@/components/WelcomeSplash';
import KipuFullScreenWizard from '@/components/KipuFullScreenWizard';

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<MainTab>('inicio');
  const [previousTab, setPreviousTab] = useState<MainTab>('inicio');
  const [copilotVoice, setCopilotVoice] = useState<'astro' | 'kipu'>('astro');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hardwareId, setHardwareId] = useState('TQ-HW-C249');
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Full-screen first-time setup / onboarding state
  const [showWelcome, setShowWelcome] = useState(false);
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
    distrito: 'Urubamba',
    provincia: 'Urubamba',
    departamento: 'Cusco',
    moisture: 'HUMEDAD_MEDIA',
    moistureLabel: 'Húmeda y Mullida',
    previousCropId: 'papa_nativa',
    previousCropName: 'Papa Huayro',
    priority: 'tierra',
    priorityName: 'Curar y Abonar Suelo',
    lat: -13.332,
    lon: -72.158,
    altitude: 3380,
    slope: 12,
    areaHa: 3.5,
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
      setHardwareId(hw.deviceId || 'TQ-HW-C249');

      // Support ?welcome=1, ?reset=1 or ?wizard=1 in URL for instant verification
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('welcome') === '1' || urlParams.get('welcome') === 'true') {
        setShowWelcome(true);
      } else if (urlParams.get('reset') === '1' || urlParams.get('reset') === 'true') {
        resetDeviceProfile();
        setShowWelcome(true);
      } else if (urlParams.get('wizard') === '1' || urlParams.get('wizard') === 'true') {
        setShowOnboarding(true);
      } else {
        const stored = getStoredDeviceProfile();
        if (stored) {
          setProfile(stored);
          setShowOnboarding(false);
          setShowWelcome(false);
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
  };

  // Live SMAP calculation
  const smapPercent = climaNasa?.humedad_suelo_smap_m3m3
    ? Math.round(climaNasa.humedad_suelo_smap_m3m3 * 100)
    : 35;

  if (showWelcome) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-[#F7F9F6]">
        <WelcomeSplash
          onStartWizard={() => {
            setShowWelcome(false);
            setShowOnboarding(true);
          }}
          onEnterDirect={() => {
            setShowWelcome(false);
          }}
        />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-[#F7F9F6]">
        {toastMessage && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-2xl bg-[#132A1C] text-white font-bold text-xs shadow-2xl backdrop-blur-md border border-emerald-500/40 flex items-center gap-2">
            <span>{toastMessage}</span>
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

  const handleOpenDiagnostic = (fromTab?: MainTab) => {
    setPreviousTab(fromTab || (activeTab === 'diagnostico' ? 'inicio' : activeTab));
    setActiveTab('diagnostico');
  };

  const handleCloseDiagnostic = () => {
    setActiveTab(previousTab === 'diagnostico' ? 'inicio' : previousTab);
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#F7F9F6] text-[#132A1C] relative overflow-hidden font-sans selection:bg-[#84CC16] selection:text-[#132A1C]">
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-2xl bg-[#132A1C] text-white font-bold text-xs shadow-2xl backdrop-blur-md border border-emerald-500/40 flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Light Organic Design (Hidden in Diagnóstico view to match Frame 006) */}
      {activeTab !== 'diagnostico' && (
        <header className="bg-white/90 backdrop-blur-md border-b border-[#E5ECE2] px-3.5 py-2.5 sticky top-0 z-40 shadow-xs">
          <div className="max-w-md mx-auto w-full flex items-center justify-between gap-2">
            {/* Left: Logo + Parcel Switcher Badge */}
            <div className="flex items-center gap-2 min-w-0 shrink">
              <div className="w-8 h-8 rounded-xl bg-[#132A1C] flex items-center justify-center text-[#A3E635] font-black text-sm shadow-xs shrink-0">
                🌱
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-[#132A1C] tracking-tight truncate">
                    TerraQuipu
                  </span>
                  <span className="text-[8.5px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    Andes
                  </span>
                </div>

                {/* Active Parcel Badge: Click opens Settings/Hardware Modal */}
                <button
                  type="button"
                  onClick={() => {
                    playBubblePop();
                    setIsSettingsOpen(true);
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 hover:text-emerald-800 transition cursor-pointer truncate max-w-[150px] sm:max-w-[200px]"
                  title="Ver detalles de la chacra y hardware"
                >
                  <span className="truncate">
                    {profile.parcelName} • {profile.distrito || 'Urubamba'}, {profile.altitude || 3380} msnm
                  </span>
                  <ChevronDown className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
                </button>
              </div>
            </div>

            {/* Right: News + Refresh + Settings Trigger */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* News / ENOS Bulletins Trigger */}
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setIsNewsOpen(true);
                }}
                className="relative w-8 h-8 rounded-full border border-[#E5ECE2] bg-white text-zinc-700 hover:text-emerald-800 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-2xs"
                title="Boletines Científicos y Alertas ENOS"
              >
                <span className="text-xs">📰</span>
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 text-white font-black text-[8px] flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className={`w-8 h-8 rounded-full border border-[#E5ECE2] bg-white text-zinc-700 hover:text-emerald-800 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-2xs ${
                  isRefreshing ? 'border-emerald-500 text-emerald-700' : ''
                }`}
                title="Actualizar datos satelitales (Hora Perú)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
              </button>

              {/* Settings & Hardware Trigger */}
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setIsSettingsOpen(true);
                }}
                className="w-8 h-8 rounded-full border border-[#E5ECE2] bg-[#F7F9F6] text-[#132A1C] hover:bg-emerald-50 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-2xs"
                title="Ajustes de Parcela y Hardware"
              >
                <Settings className="w-4 h-4 text-emerald-900" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Tab Content (Scrollable, Light Organic #F7F9F6) */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4 max-w-md mx-auto w-full relative z-10">
        {/* ================= TAB 1: INICIO ================= */}
        {activeTab === 'inicio' && (
          <InicioTab
            profile={profile}
            climaNasa={climaNasa}
            smapPercent={smapPercent}
            hardwareId={hardwareId}
            onOpenWizard={() => handleOpenDiagnostic('inicio')}
            onNavigateToParcelas={() => setActiveTab('parcelas')}
            onNavigateToRotacion={() => setActiveTab('rotacion')}
            onNavigateToCopiloto={() => setActiveTab('copiloto')}
          />
        )}

        {/* ================= TAB 2: PARCELAS ================= */}
        {activeTab === 'parcelas' && (
          <ChacraTab
            profile={profile}
            cultivos={cultivos}
            hardwareId={hardwareId}
            onToast={triggerToast}
            onRecalibrate={() => setShowOnboarding(true)}
            onNavigateToInicio={() => setActiveTab('inicio')}
            onUpdateCrop={(cropId, cropName) => {
              handleUpdateProfile({
                previousCropId: cropId,
                previousCropName: cropName,
              });
            }}
            onUpdatePriority={(prio, prioName) => {
              handleUpdateProfile({
                priority: prio,
                priorityName: prioName,
              });
            }}
            onUpdateArea={(newArea) => {
              handleUpdateProfile({ areaHa: newArea });
            }}
            onOpenWizard={() => handleOpenDiagnostic('parcelas')}
          />
        )}

        {/* ================= TAB 3: DIAGNÓSTICO (CENTRAL FAB '+') ================= */}
        {activeTab === 'diagnostico' && (
          <SoilDiagnosticWizardModal
            isInline={true}
            isOpen={true}
            onClose={handleCloseDiagnostic}
            onCompleteToRotation={() => {
              setActiveTab('rotacion');
              triggerToast('🌱 Plan de rotación activado según resiliencia del suelo.');
            }}
            onSaveProfileData={(data) => {
              triggerToast('✓ Diagnóstico edáfico registrado');
            }}
          />
        )}

        {/* ================= TAB 4: ROTACIÓN ================= */}
        {activeTab === 'rotacion' && (
          <RotationTab
            profile={profile}
            onNavigateToCopiloto={(voice) => {
              setCopilotVoice(voice || 'kipu');
              setActiveTab('copiloto');
            }}
            onToast={triggerToast}
          />
        )}

        {/* ================= TAB 5: COPILOTO ================= */}
        {activeTab === 'copiloto' && (
          <CopilotTab
            profile={profile}
            climaNasa={climaNasa}
            smapPercent={smapPercent}
            initialVoice={copilotVoice}
            onOpenDiagnostic={() => handleOpenDiagnostic('copiloto')}
            onToast={triggerToast}
          />
        )}
      </main>

      {/* Slide-Up Bottom Sheet for News & ENOS Bulletins */}
      <AgroClimaNewsFeed isOpen={isNewsOpen} onClose={() => setIsNewsOpen(false)} />

      {/* Settings & Hardware Modal (Triggered from Top Header) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        hardwareId={hardwareId}
        microcuencas={microcuencas}
        onToast={triggerToast}
        onOpenWizard={() => setShowOnboarding(true)}
        onReset={() => setShowWelcome(true)}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Bottom Mobile Navigation Bar (Always visible matching Frames 001, 003, 006, 009, 013) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'diagnostico') {
            handleOpenDiagnostic();
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenDiagnostic={() => handleOpenDiagnostic()}
      />
    </div>
  );
}
