'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
  Newspaper,
  Sprout,
  Cpu,
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
  updateParcel,
  getActiveParcelId,
} from '@/lib/deviceProfile';
import {
  getMicrocuencas,
  getCultivos,
  getClimaNasa,
  submitReportToCloud,
} from '@/lib/supabaseClient';
import { fetchLiveAgrometeo, type LiveAgrometeoData } from '@/lib/agrometeoClient';
import { playBubblePop } from '@/lib/soundEffects';

// Modular Screen & View Components
import InicioTab from '@/components/tabs/InicioTab';
import ChacraTab from '@/components/tabs/ChacraTab';
import RotationTab from '@/components/tabs/RotationTab';
import CopilotTab from '@/components/tabs/CopilotTab';
import BottomNav, { MainTab } from '@/components/layout/BottomNav';
import FloatingNewsFAB from '@/components/layout/FloatingNewsFAB';
import SoilDiagnosticWizardModal from '@/components/SoilDiagnosticWizardModal';
import SettingsFullScreenView from '@/components/views/SettingsFullScreenView';
import NewsFullScreenView from '@/components/views/NewsFullScreenView';
import ParcelDrawerFullScreenView from '@/components/views/ParcelDrawerFullScreenView';
import WelcomeSplash from '@/components/WelcomeSplash';
import KipuFarmerWelcomeView from '@/components/views/KipuFarmerWelcomeView';
import KipuFullScreenWizard from '@/components/KipuFullScreenWizard';

export type ScreenState = MainTab | 'ajustes' | 'noticias' | 'visor_qgis';
export type OnboardingPhase = 'none' | 'welcome' | 'kipu_name' | 'parcel_setup';

export default function MobileApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('inicio');
  const [previousScreen, setPreviousScreen] = useState<ScreenState>('inicio');
  const [selectedParcelForDetail, setSelectedParcelForDetail] = useState<string | null>(null);
  const [copilotVoice, setCopilotVoice] = useState<'astro' | 'kipu'>('astro');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hardwareId, setHardwareId] = useState('TQ-HW-C249');

  // Full-screen first-time setup / onboarding state
  const [onboardingPhase, setOnboardingPhase] = useState<OnboardingPhase>('none');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase live database states
  const [microcuencas, setMicrocuencas] = useState<Microcuenca[]>([]);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [climaNasa, setClimaNasa] = useState<ClimaNasa | null>(null);
  const [liveAgrometeo, setLiveAgrometeo] = useState<LiveAgrometeoData | null>(null);

  // Farmer Profile (limpio para nuevo dispositivo - sin datos fantasma)
  const [profile, setProfile] = useState<FarmerProfile>({
    farmerName: '',
    cuencaId: '',
    cuencaName: '',
    parcelName: '',
    distrito: '',
    provincia: '',
    departamento: '',
    moisture: 'HUMEDAD_MEDIA',
    moistureLabel: 'Húmeda y Mullida',
    previousCropId: '',
    previousCropName: '',
    priority: 'tierra',
    priorityName: 'Curar y Abonar Suelo',
    lat: -13.332,
    lon: -72.158,
    altitude: 3380,
    slope: 12,
    areaHa: 0,
  });

  // Check online status and detect hardware profile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        triggerToast('Conexión reestablecida con la nube');
      };
      const handleOffline = () => {
        setIsOnline(false);
        triggerToast('Modo Sin Señal activado (100% Funcional)');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Hardware Signature Detection
      const hw = generateHardwareProfile();
      setHardwareId(hw.deviceId || 'TQ-HW-C249');

      // Support ?welcome=1, ?reset=1, ?kipu=1 or ?wizard=1 in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('welcome') === '1' || urlParams.get('welcome') === 'true') {
        setOnboardingPhase('welcome');
      } else if (urlParams.get('reset') === '1' || urlParams.get('reset') === 'true') {
        resetDeviceProfile();
        setOnboardingPhase('welcome');
      } else if (urlParams.get('kipu') === '1' || urlParams.get('kipu') === 'true') {
        setOnboardingPhase('kipu_name');
      } else if (urlParams.get('wizard') === '1' || urlParams.get('wizard') === 'true') {
        setShowOnboarding(true);
      } else {
        const stored = getStoredDeviceProfile();
        if (stored && stored.isConfigured) {
          setProfile(stored);
          setShowOnboarding(false);
          setOnboardingPhase('none');
        } else {
          // New device detected on the system! Promptly show welcome splash
          setOnboardingPhase('welcome');
        }
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Fetch live Supabase data and live agrometeo on mount and whenever cuencaId changes
  useEffect(() => {
    async function loadData() {
      const [cuencasData, cultivosData, liveMeteo] = await Promise.all([
        getMicrocuencas(),
        getCultivos(),
        fetchLiveAgrometeo(profile.lat || -13.332, profile.lon || -72.158).catch(() => null),
      ]);
      setMicrocuencas(cuencasData);
      setCultivos(cultivosData);

      if (liveMeteo) {
        setLiveAgrometeo(liveMeteo);
        setProfile((prev) => ({
          ...prev,
          altitude: liveMeteo.elevationMsnm || prev.altitude,
          slope: liveMeteo.slopePct || prev.slope,
        }));
      }

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
    }, 3500);
  };

  const navigateTo = (screen: ScreenState) => {
    setPreviousScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen(previousScreen === currentScreen ? 'inicio' : previousScreen);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    triggerToast('Conectando con Supabase y NASA SMAP...');

    try {
      const [cuencasData, cultivosData, liveMeteo] = await Promise.all([
        getMicrocuencas(),
        getCultivos(),
        fetchLiveAgrometeo(profile.lat || -13.332, profile.lon || -72.158).catch(() => null),
      ]);

      if (cuencasData.length > 0) setMicrocuencas(cuencasData);
      if (cultivosData.length > 0) setCultivos(cultivosData);

      if (liveMeteo) {
        setLiveAgrometeo(liveMeteo);
        setProfile((prev) => ({
          ...prev,
          altitude: liveMeteo.elevationMsnm || prev.altitude,
          slope: liveMeteo.slopePct || prev.slope,
        }));
      }

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

      triggerToast(`Telemetría actualizada (Hora Perú: ${peruTime})`);
    } catch (e) {
      console.error(e);
      triggerToast('Error al conectar con la nube');
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
    triggerToast(`Chacra (${saved.areaHa} ha) calibrada en hardware [${saved.deviceId}]`);

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
        triggerToast('Calibración enviada a Supabase (Ground-Truth Comunal)');
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

  // Live SMAP calculation from Live Agrometeo or Supabase climaNasa
  const smapPercent = liveAgrometeo?.smapMoisturePct !== undefined
    ? Math.round(liveAgrometeo.smapMoisturePct)
    : climaNasa?.humedad_suelo_smap_m3m3
    ? Math.round(climaNasa.humedad_suelo_smap_m3m3 * 100)
    : 18;

  // =========================================================================
  // ONBOARDING WORKFLOW (NUEVO DISPOSITIVO: BIENVENIDA -> KIPU PERFIL -> DELIMITAR PARCELA)
  // =========================================================================

  // Paso 1 de Onboarding: Welcome Splash (Adaptado de Imagen 4) - Sin botón omitir
  if (onboardingPhase === 'welcome') {
    return (
      <div className="flex flex-col h-full min-h-screen bg-[#0A1A0F]">
        <WelcomeSplash
          onStartWizard={() => {
            playBubblePop();
            setOnboardingPhase('kipu_name');
          }}
        />
      </div>
    );
  }

  // Paso 2 de Onboarding: Kipu Copiloto pregunta Nombre y Comunidad Obligatorios
  if (onboardingPhase === 'kipu_name') {
    return (
      <div className="flex flex-col h-full min-h-screen bg-[#0A1A0F]">
        <KipuFarmerWelcomeView
          initialName={profile.farmerName || ''}
          initialCommunity={profile.distrito || ''}
          onBack={() => setOnboardingPhase('welcome')}
          onContinue={(farmerName, community, regionData) => {
            setProfile((prev) => ({
              ...prev,
              farmerName,
              parcelName: `Chacra de ${farmerName}`,
              distrito: community,
              ...(regionData
                ? {
                    lat: regionData.lat,
                    lon: regionData.lon,
                    altitude: regionData.altitude,
                    cuencaName: regionData.cuencaName,
                  }
                : {}),
            }));
            setOnboardingPhase('parcel_setup');
          }}
        />
      </div>
    );
  }

  // Paso 3 de Onboarding: Delimitar Primera Parcela en Visor Satelital QGIS
  if (onboardingPhase === 'parcel_setup') {
    return (
      <ParcelDrawerFullScreenView
        onBack={() => setOnboardingPhase('kipu_name')}
        cultivos={cultivos}
        initialLat={profile.lat}
        initialLon={profile.lon}
        initialAreaHa={profile.areaHa || 1.73}
        farmerName={profile.farmerName}
        initialCommunityName={profile.distrito}
        onParcelCreated={(newParcel) => {
          const updatedProfile: FarmerProfile = {
            ...profile,
            farmerName: profile.farmerName || 'Agricultor Andino',
            parcelName: newParcel.name,
            areaHa: newParcel.areaHa,
            lat: newParcel.lat,
            lon: newParcel.lon,
            altitude: newParcel.altitudeMsnm,
            cuencaName: newParcel.microcuenca,
            distrito: profile.distrito || newParcel.microcuenca,
            previousCropName: newParcel.cropName,
            previousCropId: newParcel.cropId,
            healthScore: newParcel.healthScore,
          };
          saveDeviceProfile(updatedProfile);
          setProfile(updatedProfile);
          setOnboardingPhase('none');
          setSelectedParcelForDetail(newParcel.id);
          triggerToast(`¡Bienvenido ${updatedProfile.farmerName}! Tu chacra "${newParcel.name}" ha sido guardada y calibrada in situ.`);
          navigateTo('parcelas');
        }}
      />
    );
  }

  if (showOnboarding) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-[#F7F9F6]">
        {toastMessage && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-2xl bg-[#132A1C] text-white font-medium text-xs shadow-2xl backdrop-blur-md border border-emerald-500/40 flex items-center gap-2">
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

  // Full Screen View: Ajustes & Hardware
  if (currentScreen === 'ajustes') {
    return (
      <div className="flex flex-col h-full min-h-screen bg-[#F7F9F6] text-[#132A1C]">
        <SettingsFullScreenView
          onBack={goBack}
          profile={profile}
          hardwareId={hardwareId}
          microcuencas={microcuencas}
          onToast={triggerToast}
          onOpenWizard={() => setShowOnboarding(true)}
          onReset={() => setOnboardingPhase('welcome')}
          onUpdateProfile={handleUpdateProfile}
        />
      </div>
    );
  }

  // Full Screen View: Boletines & Noticias ENOS
  if (currentScreen === 'noticias') {
    return (
      <div className="flex flex-col h-full min-h-screen bg-[#F7F9F6] text-[#132A1C]">
        <NewsFullScreenView onBack={goBack} />
      </div>
    );
  }

  // Full Screen View: Visor Satelital QGIS
  if (currentScreen === 'visor_qgis') {
    return (
      <ParcelDrawerFullScreenView
        onBack={goBack}
        cultivos={cultivos}
        farmerName={profile.farmerName}
        initialCommunityName={profile.distrito}
        onParcelCreated={(newParcel) => {
          handleUpdateProfile({
            parcelName: newParcel.name,
            areaHa: newParcel.areaHa,
            lat: newParcel.lat,
            lon: newParcel.lon,
            altitude: newParcel.altitudeMsnm,
            previousCropName: newParcel.cropName,
            previousCropId: newParcel.cropId,
          });
          setSelectedParcelForDetail(newParcel.id);
          triggerToast(`Parcela "${newParcel.name}" guardada y calibrada con éxito`);
          navigateTo('parcelas');
        }}
        initialLat={profile.lat}
        initialLon={profile.lon}
        initialAreaHa={profile.areaHa || 1.73}
      />
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#F7F9F6] text-[#132A1C] relative overflow-x-hidden font-sans selection:bg-[#84CC16] selection:text-[#132A1C]">
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-2xl bg-[#132A1C] text-white font-medium text-xs shadow-2xl backdrop-blur-md border border-emerald-500/40 flex items-center gap-2 animate-in fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SUB-SCREEN TOP NAVIGATION BAR: Only visible on secondary screens (NOT on Inicio or Diagnóstico) */}
      {currentScreen !== 'inicio' && currentScreen !== 'diagnostico' && (
        <header className="bg-white/95 backdrop-blur-md border-b border-[#E5ECE2] px-4 py-3 sticky top-0 z-30 shadow-xs">
          <div className="max-w-md mx-auto w-full flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                navigateTo('inicio');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-[#132A1C] font-semibold text-xs transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Inicio</span>
            </button>

            <span className="text-xs font-semibold text-zinc-800 capitalize">
              {currentScreen === 'parcelas' && 'Mis Parcelas'}
              {currentScreen === 'rotacion' && 'Rotación de Cultivos'}
              {currentScreen === 'copiloto' && 'Copiloto Andino'}
            </span>

            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="w-8 h-8 rounded-full border border-[#E5ECE2] bg-white text-zinc-700 hover:text-emerald-800 flex items-center justify-center transition active:scale-90 cursor-pointer shadow-2xs"
              title="Actualizar datos satelitales"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
            </button>
          </div>
        </header>
      )}

      {/* Main Screen Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 max-w-md mx-auto w-full relative z-10">
        {/* ================= SCREEN 1: INICIO (IMAGEN 3) ================= */}
        {currentScreen === 'inicio' && (
          <InicioTab
            profile={profile}
            climaNasa={climaNasa}
            liveAgrometeo={liveAgrometeo}
            smapPercent={smapPercent}
            hardwareId={hardwareId}
            onOpenWizard={() => navigateTo('diagnostico')}
            onNavigateToParcelas={(parcelId?: string) => {
              setSelectedParcelForDetail(parcelId || null);
              navigateTo('parcelas');
            }}
            onNavigateToRotacion={() => navigateTo('rotacion')}
            onNavigateToCopiloto={() => navigateTo('copiloto')}
            onOpenNews={() => navigateTo('noticias')}
            onOpenSettings={() => navigateTo('ajustes')}
          />
        )}

        {/* ================= SCREEN 2: PARCELAS ================= */}
        {currentScreen === 'parcelas' && (
          <ChacraTab
            profile={profile}
            cultivos={cultivos}
            hardwareId={hardwareId}
            selectedParcelId={selectedParcelForDetail}
            onClearSelectedParcel={() => setSelectedParcelForDetail(null)}
            onToast={triggerToast}
            onRecalibrate={() => setShowOnboarding(true)}
            onNavigateToInicio={() => navigateTo('inicio')}
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
            onOpenWizard={() => navigateTo('diagnostico')}
            onOpenQgisDrawer={() => navigateTo('visor_qgis')}
          />
        )}

        {/* ================= SCREEN 3: DIAGNÓSTICO (PANTALLA COMPLETA) ================= */}
        {currentScreen === 'diagnostico' && (
          <SoilDiagnosticWizardModal
            isInline={true}
            isOpen={true}
            onClose={() => navigateTo(previousScreen === 'diagnostico' ? 'inicio' : previousScreen)}
            onCompleteToRotation={() => {
              navigateTo('rotacion');
              triggerToast('Plan de rotación activado según resiliencia del suelo.');
            }}
            onSaveProfileData={(data) => {
              handleUpdateProfile({
                healthScore: data.healthScore,
                moisture: data.soilMoisture.includes('Seca') ? 'SECO' : data.soilMoisture.includes('Barro') ? 'SATURADO' : 'HUMEDAD_MEDIA',
                moistureLabel: data.soilMoisture,
                pest: data.pestStatus.includes('sana') ? 'sano' : data.pestStatus.includes('gorgojo') ? 'gorgojo' : 'rancha',
                soilStoniness: data.soilDepth.includes('Profundo') ? 'profundo' : 'pedregoso',
              });
              const activeId = getActiveParcelId();
              updateParcel(activeId, {
                healthScore: data.healthScore,
              });
              triggerToast(`Diagnóstico edáfico registrado: ${data.healthScore || 80}/100`);
            }}
          />
        )}

        {/* ================= SCREEN 4: ROTACIÓN ================= */}
        {currentScreen === 'rotacion' && (
          <RotationTab
            profile={profile}
            cultivos={cultivos}
            onNavigateToCopiloto={(voice) => {
              setCopilotVoice(voice || 'kipu');
              navigateTo('copiloto');
            }}
            onToast={triggerToast}
            onOpenQgisDrawer={() => navigateTo('visor_qgis')}
          />
        )}

        {/* ================= SCREEN 5: COPILOTO ================= */}
        {currentScreen === 'copiloto' && (
          <CopilotTab
            profile={profile}
            climaNasa={climaNasa}
            liveAgrometeo={liveAgrometeo}
            cultivos={cultivos}
            smapPercent={smapPercent}
            initialVoice={copilotVoice}
            onOpenDiagnostic={() => navigateTo('diagnostico')}
            onToast={triggerToast}
          />
        )}
      </main>

      {/* Floating Action Button for News / Boletines ENOS (Positioned comfortably on the right above the bottom nav) */}
      <FloatingNewsFAB onOpenNews={() => navigateTo('noticias')} />

      {/* Bottom Mobile Navigation Bar (Fixed at the bottom across all main tabs) */}
      {currentScreen !== 'diagnostico' && (
        <BottomNav
          activeTab={currentScreen === 'inicio' || currentScreen === 'parcelas' || currentScreen === 'rotacion' || currentScreen === 'copiloto' ? currentScreen : 'inicio'}
          onSelectTab={(tab) => {
            if (tab === 'parcelas') setSelectedParcelForDetail(null);
            navigateTo(tab);
          }}
          onOpenDiagnostic={() => navigateTo('diagnostico')}
          onOpenQgisDrawer={() => navigateTo('visor_qgis')}
        />
      )}
    </div>
  );
}
