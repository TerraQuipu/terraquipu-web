'use client';

import React from 'react';
import { Microcuenca, Cultivo, FarmerProfile } from '@/lib/types';
import KipuFullScreenWizard from './KipuFullScreenWizard';

interface KipuDiagnosticCardProps {
  microcuencas: Microcuenca[];
  cultivos: Cultivo[];
  onComplete: (profile: FarmerProfile) => void;
  onCancel?: () => void;
  initialCuencaId?: string;
  initialMoisture?: 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO';
  initialCropId?: string;
  initialPriority?: 'tierra' | 'comida' | 'mercado';
}

export default function KipuDiagnosticCard({
  microcuencas,
  cultivos,
  onComplete,
  onCancel,
  initialCuencaId,
  initialMoisture,
  initialCropId,
  initialPriority,
}: KipuDiagnosticCardProps) {
  return (
    <KipuFullScreenWizard
      microcuencas={microcuencas}
      cultivos={cultivos}
      onComplete={onComplete}
      onCancel={onCancel}
      initialProfile={{
        cuencaId: initialCuencaId,
        moisture: initialMoisture,
        previousCropId: initialCropId,
        priority: initialPriority,
      }}
    />
  );
}
