import { FarmerProfile, ParcelItem } from './types';

/**
 * Deterministic hardware hash function based on non-volatile hardware telemetry.
 * Produces the exact same signature across reloads and sessions on the same physical device.
 */
function createDeterministicHash(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

export function generateHardwareProfile(): { deviceId: string; hardwareHash: string } {
  if (typeof window === 'undefined') {
    return { deviceId: 'TQ-HW-SERVER', hardwareHash: '00000000' };
  }

  const screenMetrics = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}@${window.devicePixelRatio || 1}`;
  const cpuCores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 8;
  const platform = navigator.platform || 'Unknown';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Lima';
  const language = navigator.language || 'es-PE';

  const rawHardwareSignature = [
    screenMetrics,
    `cpu:${cpuCores}`,
    `ram:${memory}`,
    platform,
    timeZone,
    language,
  ].join('|');

  const hash = createDeterministicHash(rawHardwareSignature);
  const deviceId = `TQ-HW-${hash.substring(0, 4)}`;

  return { deviceId, hardwareHash: hash };
}

const STORAGE_KEY = 'terraquipu_hardware_farmer_profile';
const PARCELS_STORAGE_KEY = 'terraquipu_user_parcels';
const ACTIVE_PARCEL_KEY = 'terraquipu_active_parcel_id';

export const DEFAULT_PARCELS: ParcelItem[] = [
  {
    id: 'parcel-maras-01',
    name: 'Chacra Maras • Sector Yanacona',
    cropId: 'papa_nativa',
    cropName: 'Papa Huayro',
    cropCategory: 'Papa nativa',
    areaHa: 1.73,
    areaTopos: 5.7,
    lat: -13.332,
    lon: -72.158,
    altitudeMsnm: 3380,
    microcuenca: 'Microcuenca Vilcanota - Cusco',
    plantAgeDays: 45,
    estimatedYieldTons: 6,
    healthScore: 78,
    smapHumidity: 16,
    ndviScore: 0.68,
    photoUrl: '/images/andes_bright.jpg',
    notes: 'Suelo franco arcilloso con buena retención de rastrojo.',
    createdAt: '2026-10-15T08:00:00Z',
  },
  {
    id: 'parcel-huaypo-02',
    name: 'Andén Huaypo • Laguna',
    cropId: 'habas',
    cropName: 'Habas y Tarwi',
    cropCategory: 'Habas',
    areaHa: 1.2,
    areaTopos: 4.0,
    lat: -13.415,
    lon: -72.235,
    altitudeMsnm: 3450,
    microcuenca: 'Microcuenca Huaypo - Anta',
    plantAgeDays: 30,
    estimatedYieldTons: 4,
    healthScore: 84,
    smapHumidity: 22,
    ndviScore: 0.74,
    photoUrl: '/images/andes_satellite_hero.jpg',
    notes: 'Asociación de leguminosas fijadoras de nitrógeno.',
    createdAt: '2026-10-28T09:30:00Z',
  },
  {
    id: 'parcel-anta-03',
    name: 'Pampa de Anta • San Isidro',
    cropId: 'maiz_blanco',
    cropName: 'Maíz Blanco Gigante',
    cropCategory: 'Maíz',
    areaHa: 2.5,
    areaTopos: 8.2,
    lat: -13.456,
    lon: -72.189,
    altitudeMsnm: 3350,
    microcuenca: 'Microcuenca Anta - Cusco',
    plantAgeDays: 60,
    estimatedYieldTons: 8.5,
    healthScore: 75,
    smapHumidity: 18,
    ndviScore: 0.62,
    photoUrl: '/images/andes_bright.jpg',
    notes: 'Surcos en contorno para retención de humedad.',
    createdAt: '2026-09-20T11:00:00Z',
  },
];

export function getStoredParcels(): ParcelItem[] {
  if (typeof window === 'undefined') return DEFAULT_PARCELS;
  try {
    const raw = localStorage.getItem(PARCELS_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(DEFAULT_PARCELS));
      return DEFAULT_PARCELS;
    }
    const parcels = JSON.parse(raw);
    return Array.isArray(parcels) ? parcels : DEFAULT_PARCELS;
  } catch (e) {
    return DEFAULT_PARCELS;
  }
}

export function saveParcel(parcel: ParcelItem): ParcelItem[] {
  if (typeof window === 'undefined') return [parcel];
  try {
    const current = getStoredParcels();
    const updated = [parcel, ...current.filter((p) => p.id !== parcel.id)];
    localStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(ACTIVE_PARCEL_KEY, parcel.id);
    return updated;
  } catch (e) {
    return [parcel];
  }
}

export function updateParcel(id: string, updates: Partial<ParcelItem>): ParcelItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredParcels();
    const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
    localStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function deleteParcel(id: string): ParcelItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getStoredParcels();
    const updated = current.filter((p) => p.id !== id);
    localStorage.setItem(PARCELS_STORAGE_KEY, JSON.stringify(updated));
    if (localStorage.getItem(ACTIVE_PARCEL_KEY) === id) {
      if (updated.length > 0) {
        localStorage.setItem(ACTIVE_PARCEL_KEY, updated[0].id);
      } else {
        localStorage.removeItem(ACTIVE_PARCEL_KEY);
      }
    }
    return updated;
  } catch (e) {
    return [];
  }
}

export function getActiveParcelId(): string {
  if (typeof window === 'undefined') return DEFAULT_PARCELS[0].id;
  try {
    const stored = localStorage.getItem(ACTIVE_PARCEL_KEY);
    if (stored) return stored;
    const parcels = getStoredParcels();
    return parcels.length > 0 ? parcels[0].id : DEFAULT_PARCELS[0].id;
  } catch (e) {
    return DEFAULT_PARCELS[0].id;
  }
}

export function setActiveParcelId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_PARCEL_KEY, id);
  } catch (e) {
    // ignore
  }
}

export function getActiveParcel(): ParcelItem {
  const parcels = getStoredParcels();
  const activeId = getActiveParcelId();
  const found = parcels.find((p) => p.id === activeId);
  return found || parcels[0] || DEFAULT_PARCELS[0];
}

export function getStoredDeviceProfile(): (FarmerProfile & { deviceId: string; isConfigured: boolean }) | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw);
    return profile && profile.isConfigured ? profile : null;
  } catch (e) {
    return null;
  }
}

export function saveDeviceProfile(
  profile: FarmerProfile
): FarmerProfile & { deviceId: string; isConfigured: boolean } {
  const { deviceId, hardwareHash } = generateHardwareProfile();

  const fullProfile = {
    ...profile,
    deviceId,
    hardwareHash,
    isConfigured: true,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullProfile));
    // also sync legacy key for backward compatibility
    localStorage.setItem('terraquipu_farmer_profile', JSON.stringify(fullProfile));
  }

  return fullProfile;
}

export function resetDeviceProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('terraquipu_farmer_profile');
    localStorage.removeItem(PARCELS_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_PARCEL_KEY);
  }
}

