import { FarmerProfile } from './types';

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
  }
}
