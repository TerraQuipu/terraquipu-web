'use client';

import React from 'react';
import { Microcuenca, Cultivo, FarmerProfile } from '@/lib/types';
import KipuDiagnosticCard from './KipuDiagnosticCard';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  microcuencas: Microcuenca[];
  cultivos: Cultivo[];
  onComplete: (profile: FarmerProfile) => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  microcuencas,
  cultivos,
  onComplete,
}: OnboardingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="w-full my-2 animate-in fade-in duration-150">
      <KipuDiagnosticCard
        microcuencas={microcuencas}
        cultivos={cultivos}
        onComplete={(profile) => {
          onComplete(profile);
          onClose();
        }}
        onCancel={onClose}
      />
    </div>
  );
}
