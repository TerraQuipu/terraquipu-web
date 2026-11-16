'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FarmerProfile, ClimaNasa } from '@/lib/types';
import AgroenvironmentalAssistant from '@/components/viewer/AgroenvironmentalAssistant';
import { ActiveParcel } from '@/lib/agroenvironmentalEngine';

interface AgroenvironmentalAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FarmerProfile;
  climaNasa?: ClimaNasa | null;
  onToast: (msg: string) => void;
}

export default function AgroenvironmentalAssistantModal({
  isOpen,
  onClose,
  profile,
  climaNasa,
  onToast,
}: AgroenvironmentalAssistantModalProps) {
  if (!isOpen) return null;

  const parcel: ActiveParcel = {
    id: profile.parcelName || 'Chacra Calibrada',
    name: `${profile.parcelName} • ${profile.distrito}`,
    areaHa: profile.areaHa || 1.68,
    slopePct: profile.slope || 14.0,
    elevationMsnm: profile.altitude || 3754,
    smapMoisturePct: climaNasa?.humedad_suelo_smap_m3m3
      ? Math.round(climaNasa.humedad_suelo_smap_m3m3 * 100)
      : 35,
    ndvi: 0.65,
    center: [profile.lat || -13.3934, profile.lon || -72.0498],
    bounds: [
      [(profile.lat || -13.3934) + 0.002, (profile.lon || -72.0498) - 0.002],
      [(profile.lat || -13.3934) + 0.002, (profile.lon || -72.0498) + 0.002],
      [(profile.lat || -13.3934) - 0.002, (profile.lon || -72.0498) + 0.002],
      [(profile.lat || -13.3934) - 0.002, (profile.lon || -72.0498) - 0.002],
    ],
    isCustom: false,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <div>
              <h3 className="font-black text-sm text-white">
                Asistente Agroambiental TerraQuipu
              </h3>
              <p className="text-[10px] text-zinc-300 font-mono">
                Prevención El Niño • Piuray-Qorimarca &amp; {profile.distrito}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-zinc-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <AgroenvironmentalAssistant
            activeParcel={parcel}
            climaNasa={climaNasa}
            onShowToast={onToast}
          />
        </div>
      </div>
    </div>
  );
}
