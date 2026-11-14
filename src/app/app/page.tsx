'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Sun,
  AlertTriangle,
  ChevronDown,
  WifiOff,
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

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState<'inicio' | 'elnino' | 'chacra' | 'tierra' | 'saberes' | 'ajustes'>('inicio');
  const [isElNino, setIsElNino] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hardwareId, setHardwareId] = useState('TQ-HW-INIT');

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
      const activeCuenca = cuencasData.find((c: Microcuenca) => c.id === profile.cuencaId) || cuencasData[0];
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

      const activeCuenca = cuencasData.find((c: Microcuenca) => c.id === profile.cuencaId) || cuencasData[0];
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
    }).then((res: any) => {
      if (res && res.success) {
        triggerToast('🛰️ Calibración triangulada enviada a Supabase (Ground-Truth Comunal)');
      }
    }).catch(() => {});
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
    <div className="flex flex-col h-full min-h-screen bg-[#FAF8F5]">
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-2xl bg-slate-900/95 text-white font-bold text-xs shadow-xl backdrop-blur-md border border-slate-700 flex items-center gap-2">
          <span className="contrast-bold-white">{toastMessage}</span>
        </div>
      )}

      {/* Top Mobile App Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-800 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-950 tracking-tight">
                TerraQuipu
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Móvil
              </span>
            </div>
            {/* Quick Parcel Switcher / Profile Pill */}
            <button
              type="button"
              onClick={() => setActiveTab('ajustes')}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-950 transition cursor-pointer"
              title="Ir a ajustes de la parcela"
            >
              <span>{profile.parcelName} ({profile.areaHa || 1.0} ha) • {profile.altitude}m</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5">
          {/* Online status indicator */}
          <div
            className={`px-2 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">En Línea</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>Sin Señal</span>
              </>
            )}
          </div>

          {/* El Niño mode indicator */}
          <button
            type="button"
            onClick={() => {
              const next = !isElNino;
              setIsElNino(next);
              triggerToast(next ? '⚠️ Modo Sequía El Niño activo' : '☀️ Modo Año Normal');
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 border transition cursor-pointer ${
              isElNino
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isElNino ? (
              <>
                <AlertTriangle className="w-3 h-3 text-amber-200" />
                <span className="contrast-bold-white">Sequía</span>
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-amber-600" />
                <span>Normal</span>
              </>
            )}
          </button>

          {/* Refresh button for fresh cloud data */}
          <button
            type="button"
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className={`p-1.5 rounded-xl border transition flex items-center justify-center active:scale-95 cursor-pointer ${
              isRefreshing
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-emerald-800 border-slate-200'
            }`}
            title="Recibir datos frescos de la nube (Hora Perú)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Tab Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4 max-w-md mx-auto w-full">
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
            <div className="flex items-center justify-between pb-0.5">
              <div>
                <h1 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                  <span>🧪 Diagnóstico de Suelo</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Prueba táctil de campo, humedad edáfica y balance de nutrientes
                </p>
              </div>
            </div>

            {/* Kipu Agrónomo Mascot */}
            <div className="flex items-center gap-3.5 pt-1 pb-1">
              <div className="w-28 sm:w-32 h-36 sm:h-40 flex-shrink-0 relative flex items-center justify-center">
                <img
                  src="/images/kipu_llama.png"
                  alt="Kipu Suelo"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
              <div className="flex-1 relative bg-white border-2 border-emerald-600 border-b-4 border-b-emerald-700 rounded-3xl p-3.5 shadow-xs">
                <div className="absolute top-7 -left-2.5 w-4 h-4 bg-white border-b-2 border-l-2 border-emerald-600 transform rotate-45"></div>
                <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide block mb-1">
                  Kipu Agrónomo
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
                  Tocar la tierra con tus manos te revela la estructura y humedad al instante. Realiza la prueba del puño para calibrar el riego:
                </p>
              </div>
            </div>

            <SoilValidator
              cuencaId={profile.cuencaId}
              lat={profile.lat}
              lon={profile.lon}
              profile={profile}
              climaNasa={climaNasa}
              onToast={triggerToast}
            />
          </div>
        )}

        {/* ================= TAB 5: SABERES ANDINOS ================= */}
        {activeTab === 'saberes' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-0.5">
              <div>
                <h1 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                  <span>📚 Saberes Andinos</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Prácticas agrícolas incaicas validadas por la ciencia INIA y FAO
                </p>
              </div>
            </div>

            {/* Kipu Sabio Mascot */}
            <div className="flex items-center gap-3.5 pt-1 pb-1">
              <div className="w-28 sm:w-32 h-36 sm:h-40 flex-shrink-0 relative flex items-center justify-center">
                <img
                  src="/images/kipu_llama.png"
                  alt="Kipu Saberes"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
              <div className="flex-1 relative bg-white border-2 border-purple-600 border-b-4 border-b-purple-700 rounded-3xl p-3.5 shadow-xs">
                <div className="absolute top-7 -left-2.5 w-4 h-4 bg-white border-b-2 border-l-2 border-purple-600 transform rotate-45"></div>
                <span className="font-extrabold text-xs text-purple-950 uppercase tracking-wide block mb-1">
                  Kipu Sabio
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
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
            <div className="flex items-center justify-between pb-0.5">
              <div>
                <h1 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
                  <span>⚙️ Ajustes &amp; Hardware</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Identificador de dispositivo, comprobación GPS y recalibración
                </p>
              </div>
            </div>

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

      {/* Bottom Mobile Navigation Bar */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}
