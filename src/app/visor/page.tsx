'use client';

import React, { useState, useEffect, useRef } from 'react';
import TopHeader from '@/components/layout/TopHeader';
import Toast from '@/components/layout/Toast';
import ModuleGuidePill from '@/components/layout/ModuleGuidePill';
import MapViewer from '@/components/viewer/MapViewer';
import DecisionPanel from '@/components/viewer/DecisionPanel';
import FarmerReportDetailModal from '@/components/viewer/FarmerReportDetailModal';
import FarmerTourGuide, { FarmerTourGuideRef } from '@/components/viewer/FarmerTourGuide';
import { DecisionStepType } from '@/lib/farmerTour';
import { calculateRotationSequence } from '@/lib/rotationAlgorithm';
import {
  fetchCropMatrix,
  fetchFarmerReports,
  fetchMicrocuencas,
  fetchClimaNasa,
  DEFAULT_CROPS,
} from '@/lib/supabase';
import { CropRecord, MicrocuencaRecord, ReporteAgricultor } from '@/types';
import { ClimaNasa } from '@/lib/types';
import { ActiveParcel, fetchRealTerrainMetrics } from '@/lib/geoUtils';

const DEFAULT_PARCEL: ActiveParcel = {
  id: 'P-01',
  name: 'Pukara Parcel - Yanacona Sector',
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
  const [selectedFarmerReport, setSelectedFarmerReport] = useState<ReporteAgricultor | null>(null);
  const [decisionStep, setDecisionStep] = useState<DecisionStepType>('parcel');
  const tourGuideRef = useRef<FarmerTourGuideRef>(null);

  // Supabase states
  const [crops, setCrops] = useState<CropRecord[]>(DEFAULT_CROPS);
  const [farmerReports, setFarmerReports] = useState<ReporteAgricultor[]>([]);
  const [microcuencas, setMicrocuencas] = useState<MicrocuencaRecord[]>([]);
  const [climaNasa, setClimaNasa] = useState<ClimaNasa | null>(null);
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

      const [cropsRes, reportsRes, terrainRes, cuencasRes, climaRes] = await Promise.all([
        fetchCropMatrix(),
        fetchFarmerReports(),
        fetchRealTerrainMetrics(DEFAULT_PARCEL.center, DEFAULT_PARCEL.areaHa).catch(() => null),
        fetchMicrocuencas(),
        fetchClimaNasa('29699448-afa8-4fb4-b502-24e3e577ef90'),
      ]);

      if (cropsRes.data && cropsRes.data.length > 0) {
        setCrops(cropsRes.data);
      }
      if (reportsRes.data && reportsRes.data.length > 0) {
        setFarmerReports(reportsRes.data);
      }
      if (cuencasRes.data && cuencasRes.data.length > 0) {
        setMicrocuencas(cuencasRes.data);
      }
      if (climaRes.data) {
        setClimaNasa(climaRes.data);
      }
      if (terrainRes) {
        setActiveParcel((prev) => ({
          ...prev,
          elevationMsnm: terrainRes.elevationMsnm,
          slopePct: terrainRes.slopePct,
          smapMoisturePct: terrainRes.smapMoisturePct,
          ndvi: terrainRes.ndvi,
          precipitationTodayMm: terrainRes.precipitationTodayMm,
          soilTempC: terrainRes.soilTempC,
          evapotranspirationMm: terrainRes.evapotranspirationMm,
        }));
      }

      setIsSyncing(false);
      setDbStatus(cropsRes.error ? 'offline' : 'connected');
      showToast('PostGIS, NASA SMAP & Ground-Truth Supabase telemetry connected');
    }

    loadInitialData();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setDbStatus('syncing');
    showToast('Synchronizing with Supabase in real-time...');

    const [cropsRes, reportsRes, cuencasRes, climaRes] = await Promise.all([
      fetchCropMatrix(),
      fetchFarmerReports(),
      fetchMicrocuencas(),
      fetchClimaNasa('29699448-afa8-4fb4-b502-24e3e577ef90'),
    ]);

    if (cropsRes.data && cropsRes.data.length > 0) {
      setCrops(cropsRes.data);
    }
    if (reportsRes.data && reportsRes.data.length > 0) {
      setFarmerReports(reportsRes.data);
    }
    if (cuencasRes.data && cuencasRes.data.length > 0) {
      setMicrocuencas(cuencasRes.data);
    }
    if (climaRes.data) {
      setClimaNasa(climaRes.data);
    }

    setIsSyncing(false);
    setDbStatus(cropsRes.error ? 'offline' : 'connected');
    showToast('Database and farmer reports synchronized');
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
      {/* Top Header */}
      <TopHeader
        onSync={handleManualSync}
        isSyncing={isSyncing}
        dbStatus={dbStatus}
        onStartTour={() => tourGuideRef.current?.startTour()}
      />

      {/* Main Workspace */}
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
          onSelectFarmerReport={setSelectedFarmerReport}
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
          climaNasa={climaNasa}
          microcuencas={microcuencas}
          onShowToast={showToast}
          onCalibrationComplete={handleCalibrationComplete}
          activeStep={decisionStep}
          onSetActiveStep={setDecisionStep}
        />
      </main>

      {/* Farmer Walkthrough Guide (Driver.js) */}
      <FarmerTourGuide
        ref={tourGuideRef}
        onSetDecisionStep={setDecisionStep}
        onShowToast={showToast}
      />

      {/* Toast Notifications */}
      <Toast message={toastMessage} isVisible={toastVisible} />

      {/* Floating System Architecture Guide */}
      <ModuleGuidePill onStartTour={() => tourGuideRef.current?.startTour()} />

      {/* Ground-Truth Farmer Report Detail Inspection Modal */}
      <FarmerReportDetailModal
        report={selectedFarmerReport}
        onClose={() => setSelectedFarmerReport(null)}
        onLoadAsActiveParcel={(parcel) => {
          setActiveParcel(parcel);
        }}
        onShowToast={showToast}
      />
    </div>
  );
}
