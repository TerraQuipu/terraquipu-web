export interface FarmerHardwareProfile {
  deviceId: string;
  hardwareHash: string;
  farmerName: string;
  community: string;
  sector: string;
  lastHarvestCrop: string;
  priority: string;
  registeredAt: string;
  isConfigured: boolean;
}

/**
 * Deterministic hardware hash function based on non-volatile browser/hardware telemetry.
 * Produces the same signature across reloads and sessions on the same physical device.
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

export function getStoredFarmerProfile(): FarmerHardwareProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as FarmerHardwareProfile;
    return profile && profile.isConfigured ? profile : null;
  } catch (e) {
    return null;
  }
}

export function saveFarmerProfile(
  data: Omit<FarmerHardwareProfile, 'deviceId' | 'hardwareHash' | 'registeredAt' | 'isConfigured'>
): FarmerHardwareProfile {
  const { deviceId, hardwareHash } = generateHardwareProfile();

  const profile: FarmerHardwareProfile = {
    deviceId,
    hardwareHash,
    farmerName: data.farmerName || 'Agricultor Titular',
    community: data.community || 'Ayllu Chinchero',
    sector: data.sector || 'yanacona',
    lastHarvestCrop: data.lastHarvestCrop || 'papa',
    priority: data.priority || 'alimento',
    registeredAt: new Date().toISOString(),
    isConfigured: true,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  return profile;
}

export function resetFarmerProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
