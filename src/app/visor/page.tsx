'use client';

import React, { useState, useEffect } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import Toast from '@/components/layout/Toast';
import ModuleGuidePill from '@/components/layout/ModuleGuidePill';
import MapViewer from '@/components/viewer/MapViewer';
import DecisionPanel from '@/components/viewer/DecisionPanel';
import { calculateRotationSequence } from '@/lib/rotationAlgorithm';
import {
  fetchCropMatrix,
  fetchFarmerReports,
  DEFAULT_CROPS,
} from '@/lib/supabase';
import { CropRecord, ReporteAgricultor } from '@/types';
import { ActiveParcel } from '@/lib/geoUtils';

const DEFAULT_PARCEL: ActiveParcel = {
  id: 'P-01',
  name: 'Chacra Pukara • Sector Yanacona',
  areaHa: 1.68,
  slopePct: 14.0,
  elevationMsnm: 3754,
  smapMoisturePct: 41.2,
  ndvi: 0.68,
  center: [-13.3934, -72.0498],
  bounds: [
    [-13.3918, -72.0515],
    [-13.3912, -72.0475],
    [-13.3948, -72.047],
    [-13.3952, -72.051],
  ],
  isCustom: false,
};

export default function TerraQuipuSuitePage() {
  const [activeParcel, setActiveParcel] = useState<ActiveParcel>(DEFAULT_PARCEL);
  const [climateMode, setClimateMode] = useState<'normal' | 'nino'>('normal');
  const [previousCrop, setPreviousCrop] = useState<string>('papa');
  const [priority, setPriority] = useState<string>('alimento');

  // Supabase states
  const [crops, setCrops] = useState<CropRecord[]>(DEFAULT_CROPS);
  const [farmerReports, setFarmerReports] = useState<ReporteAgricultor[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  };

  // Load live Supabase data on mount
  useEffect(() => {
    async function loadInitialData() {
      setIsSyncing(true);
      setDbStatus('syncing');

      const [cropsRes, reportsRes] = await Promise.all([
        fetchCropMatrix(),
        fetchFarmerReports(),
      ]);

      if (cropsRes.data && cropsRes.data.length > 0) {
        setCrops(cropsRes.data);
      }
      if (reportsRes.data && reportsRes.data.length > 0) {
        setFarmerReports(reportsRes.data);
      }

      setIsSyncing(false);
      setDbStatus(cropsRes.error ? 'offline' : 'connected');
      showToast('Telemetría PostGIS, NASA SMAP y Ground-Truth Supabase conectada');
    }

    loadInitialData();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setDbStatus('syncing');
    showToast('Sincronizando con Supabase en tiempo real...');

    const [cropsRes, reportsRes] = await Promise.all([
      fetchCropMatrix(),
      fetchFarmerReports(),
    ]);

    if (cropsRes.data && cropsRes.data.length > 0) {
      setCrops(cropsRes.data);
    }
    if (reportsRes.data && reportsRes.data.length > 0) {
      setFarmerReports(reportsRes.data);
    }

    setIsSyncing(false);
    setDbStatus(cropsRes.error ? 'offline' : 'connected');
    showToast('Base de datos y reportes de agricultores sincronizados');
  };

  // Calculate dynamic rotation based on state and active parcel geometry
  const rotationResult = calculateRotationSequence(
    previousCrop,
    priority,
    climateMode,
    crops,
    activeParcel
  );

  const handleCalibrationComplete = (
    calibratedParcel: ActiveParcel,
    newReport?: ReporteAgricultor
  ) => {
    setActiveParcel(calibratedParcel);
    if (newReport) {
      setFarmerReports((prev) => [newReport, ...prev]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-100 overflow-hidden">
      {/* Top Header - Production Technician / Farmer View */}
      <TopHeader
        onSync={handleManualSync}
        isSyncing={isSyncing}
        dbStatus={dbStatus}
      />

      {/* Main Workspace (60% OpenStreetMap Map + 40% Decision Panel) */}
      <main className="flex-1 relative overflow-hidden flex flex-col lg:flex-row">
        <MapViewer
          activeParcel={activeParcel}
          onSelectParcel={(newParcel) => {
            setActiveParcel(newParcel);
          }}
          climateMode={climateMode}
          onShowToast={showToast}
          previousCrop={previousCrop}
          recommendedCrop={rotationResult.campaigns[0].title}
          farmerReports={farmerReports}
        />
        <DecisionPanel
          activeParcel={activeParcel}
          onUpdateParcelName={(name) => {
            setActiveParcel((prev) => ({ ...prev, name }));
          }}
          climateMode={climateMode}
          onSetClimateMode={setClimateMode}
          previousCrop={previousCrop}
          onSetPreviousCrop={setPreviousCrop}
          priority={priority}
          onSetPriority={setPriority}
          rotationResult={rotationResult}
          onShowToast={showToast}
          onCalibrationComplete={handleCalibrationComplete}
        />
      </main>

      {/* Toast Notifications */}
      <Toast message={toastMessage} isVisible={toastVisible} />

      {/* Floating System Architecture Guide - Only in Visor */}
      <ModuleGuidePill />
    </div>
  );
}
