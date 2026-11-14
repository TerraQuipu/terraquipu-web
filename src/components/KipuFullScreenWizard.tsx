'use client';

import React, { useState, useEffect } from 'react';
import { Microcuenca, Cultivo, FarmerProfile } from '@/lib/types';
import { generateHardwareProfile } from '@/lib/deviceProfile';
import {
  playBubblePop,
  playWhoosh,
  playQuestionChime,
  playSuccessFanfare,
} from '@/lib/soundEffects';

import WizardDialogHeader, { DialogSpeakerConfig } from './wizard/WizardDialogHeader';
import WizardStep1Location from './wizard/WizardStep1Location';
import WizardStep2Map from './wizard/WizardStep2Map';
import WizardStep3Soil from './wizard/WizardStep3Soil';
import WizardStep4Stoniness from './wizard/WizardStep4Stoniness';
import WizardStep5Cover from './wizard/WizardStep5Cover';
import WizardStep6Water from './wizard/WizardStep6Water';
import WizardStep7ElNino from './wizard/WizardStep7ElNino';
import WizardStep8CropPriority from './wizard/WizardStep8CropPriority';
import WizardFooter from './wizard/WizardFooter';

interface KipuFullScreenWizardProps {
  microcuencas: Microcuenca[];
  cultivos: Cultivo[];
  onComplete: (profile: FarmerProfile) => void;
  onCancel?: () => void;
  initialProfile?: Partial<FarmerProfile>;
}

export default function KipuFullScreenWizard({
  microcuencas,
  cultivos,
  onComplete,
  onCancel,
  initialProfile,
}: KipuFullScreenWizardProps) {
  const [step, setStep] = useState(1);
  const [isHappy, setIsHappy] = useState(false);

  // Form State (5 + 1 NASA Ground-Truth Questionnaire)
  const [selectedCuencaId, setSelectedCuencaId] = useState<string>(
    initialProfile?.cuencaId || ''
  );
  // Farmer's chosen area in hectares: defaults cleanly to initialProfile or 1.0 ha
  const [areaHa, setAreaHa] = useState<number>(
    initialProfile?.areaHa !== undefined ? initialProfile.areaHa : 1.0
  );
  // 1. Textura del suelo
  const [soilTexture, setSoilTexture] = useState<'arena' | 'franca' | 'arcilla' | ''>(
    initialProfile?.soilTexture || ''
  );
  // 2. Pedregosidad y profundidad
  const [soilStoniness, setSoilStoniness] = useState<'pedregoso' | 'profundo' | ''>(
    initialProfile?.soilStoniness || ''
  );
  // 3. Cobertura actual del lote (NDVI Sentinel-2)
  const [cropCoverNdvi, setCropCoverNdvi] = useState<'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo' | ''>(
    initialProfile?.cropCoverNdvi || ''
  );
  // 4. Fuente de agua
  const [waterSource, setWaterSource] = useState<'secano' | 'auxilio' | 'permanente' | ''>(
    initialProfile?.waterSource || ''
  );
  // 5. Ventana de siembra El Niño
  const [sowingWindow, setSowingWindow] = useState<'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana' | ''>(
    initialProfile?.sowingWindow || ''
  );
  // 6. Cultivo previo y prioridad
  const [selectedCropId, setSelectedCropId] = useState<string>(
    initialProfile?.previousCropId || ''
  );
  const [selectedPriority, setSelectedPriority] = useState<'tierra' | 'comida' | 'mercado' | ''>(
    initialProfile?.priority || ''
  );

  // GPS detection states
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [actualCoords, setActualCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Hardware ID
  const [hardwareId, setHardwareId] = useState('TQ-HW-DETECT');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hw = generateHardwareProfile();
    setHardwareId(hw.deviceId);
  }, []);

  useEffect(() => {
    setIsHappy(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  // Dual-Character Dialog Script (Kipu & Astro-Satelín)
  const DIALOG_CONFIG: DialogSpeakerConfig[] = [
    {
      step: 1,
      speaker: 'astro',
      name: 'ASTRO • SATÉLITE NASA',
      tag: '🛰️ Telemetría Orbital',
      avatar: '/images/astro_satelin.png',
      bubbleBorder: 'border-sky-500 border-b-sky-700',
      tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
      speech:
        '¡Conexión satelital orbital establecida! Escaneando la cordillera de los Andes sobre Cusco. ¿Dónde se ubica tu parcela para sincronizar sensores SMAP y Sentinel-2?',
    },
    {
      step: 2,
      speaker: 'kipu',
      name: 'KIPU • COPILOTO ANDINO',
      tag: '🌾 Geometría Andina',
      avatar: '/images/kipu_llama.png',
      bubbleBorder: 'border-emerald-600 border-b-emerald-700',
      tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      speech:
        '¡Allillanchu hermano campesino! Dime el tamaño de tu terreno en hectáreas o topos. Con su área calcularemos con exactitud el ahorro en soles y fertilizante.',
    },
    {
      step: 3,
      speaker: 'kipu',
      name: 'KIPU • COPILOTO ANDINO',
      tag: '🌱 Prueba del Puño',
      avatar: '/images/kipu_llama.png',
      bubbleBorder: 'border-emerald-600 border-b-emerald-700',
      tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      speech:
        'Toca la tierra húmeda de tu parcela: al apretarla con tus manos, ¿cómo se siente hoy la textura del suelo? Tus dedos calibran los mapas globales de la NASA.',
    },
    {
      step: 4,
      speaker: 'kipu',
      name: 'KIPU • COPILOTO ANDINO',
      tag: '🏔️ Sanidad & Relieve',
      avatar: '/images/kipu_llama.png',
      bubbleBorder: 'border-emerald-600 border-b-emerald-700',
      tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      speech:
        '¿Tu chacra tiene muchas piedras superficiales o la capa de tierra fértil es poco profunda? Esto define si es viable cavar zanjas de infiltración y zanjas trampa contra el gorgojo.',
    },
    {
      step: 5,
      speaker: 'astro',
      name: 'ASTRO • SATÉLITE NASA',
      tag: '🛰️ Radar Sentinel-2 & Landsat',
      avatar: '/images/astro_satelin.png',
      bubbleBorder: 'border-sky-500 border-b-sky-700',
      tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
      speech:
        'Mis sensores ópticos en órbita leen el índice NDVI de tu lote. ¿Cómo está la cobertura vegetal real hoy en tu terreno? Corroboremos para medir riesgo de erosión.',
    },
    {
      step: 6,
      speaker: 'astro',
      name: 'ASTRO • SATÉLITE NASA',
      tag: '🌧️ Radar GPM & SMAP',
      avatar: '/images/astro_satelin.png',
      bubbleBorder: 'border-sky-500 border-b-sky-700',
      tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
      speech:
        'Cruzando el radar de precipitación NASA GPM con la humedad superficial: ¿De dónde toma agua tu chacra principalmente durante el año?',
    },
    {
      step: 7,
      speaker: 'astro',
      name: 'ASTRO • SATÉLITE NASA',
      tag: '⚠️ Alerta El Niño (ENOS)',
      avatar: '/images/astro_satelin.png',
      bubbleBorder: 'border-amber-500 border-b-amber-700',
      tagColor: 'bg-amber-100 text-amber-950 border-amber-300',
      speech:
        'Monitoreo ENFEN / NOAA confirma evento de calentamiento superficial. ¿Cuándo tienes proyectado preparar o sembrar tu terreno este año?',
    },
    {
      step: 8,
      speaker: 'kipu',
      name: 'KIPU & ASTRO • DUPLA CIENTÍFICA',
      tag: '✨ Calibración Final',
      avatar: '/images/kipu_llama.png',
      bubbleBorder: 'border-emerald-600 border-b-emerald-700',
      tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      speech:
        '¡Último paso! Selecciona qué cosechaste en la campaña anterior y cuál es tu prioridad este año para construir tu Ruta Quipu de 3 campañas.',
    },
  ];

  const currentDialog = DIALOG_CONFIG[step - 1] || DIALOG_CONFIG[0];

  const triggerHappyReaction = () => {
    setIsHappy(true);
    playQuestionChime();
  };

  const handleGPSDetect = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setGpsError('La geolocalización no está soportada en este navegador.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);
    setGpsStatus('Conectando con satélites GPS...');
    playBubblePop();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, altitude } = pos.coords;
        setActualCoords({ lat: latitude, lon: longitude });

        let nearest = microcuencas[0];
        let minDist = Infinity;
        microcuencas.forEach((mc) => {
          const dist = Math.sqrt(
            Math.pow(mc.latitud_centro - latitude, 2) +
            Math.pow(mc.longitud_centro - longitude, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            nearest = mc;
          }
        });

        if (nearest) {
          setSelectedCuencaId(nearest.id);
        }

        setGpsLoading(false);
        setGpsStatus(
          `GPS calibrado: ${latitude.toFixed(4)}°S, ${longitude.toFixed(4)}°W (${altitude ? `${Math.round(altitude)}m` : `${nearest?.elevacion_media_msnm || 3450}m`})`
        );
        triggerHappyReaction();
      },
      (err) => {
        setGpsLoading(false);
        setGpsError('No se pudo obtener señal GPS directa. Selecciona tu microcuenca manualmente abajo.');
      },
      { timeout: 9000, enableHighAccuracy: true }
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return Boolean(selectedCuencaId);
      case 2:
        return areaHa > 0;
      case 3:
        return Boolean(soilTexture);
      case 4:
        return Boolean(soilStoniness);
      case 5:
        return Boolean(cropCoverNdvi);
      case 6:
        return Boolean(waterSource);
      case 7:
        return Boolean(sowingWindow);
      case 8:
        return Boolean(selectedCropId && selectedPriority);
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (canProceed() && step < 8) {
      playWhoosh();
      setStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      playBubblePop();
      setStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    playSuccessFanfare();

    const cuenca = microcuencas.find((c) => c.id === selectedCuencaId) || microcuencas[0];
    const crop = cultivos.find((c) => c.crop_id === selectedCropId) || cultivos[0];

    const finalLat = actualCoords ? actualCoords.lat : (cuenca?.latitud_centro || -13.332);
    const finalLon = actualCoords ? actualCoords.lon : (cuenca?.longitud_centro || -72.158);
    const finalAltitude = cuenca?.elevacion_media_msnm || 3380;

    const priorityLabels: Record<string, string> = {
      tierra: 'Curar y Abonar Suelo',
      comida: 'Sustento del Hogar',
      mercado: 'Venta en Feria',
    };

    const moistureMap: Record<string, string> = {
      arena: 'SECO',
      franca: 'HUMEDAD_MEDIA',
      arcilla: 'SATURADO',
    };

    const profile: FarmerProfile = {
      cuencaId: cuenca?.id || '29699448-afa8-4fb4-b502-24e3e577ef90',
      cuencaName: cuenca?.nombre || 'Microcuenca Vilcanota - Urubamba',
      parcelName: `Chacra ${cuenca?.distrito || 'Maras'}`,
      distrito: cuenca?.distrito || 'Maras',
      provincia: cuenca?.provincia || 'Urubamba',
      departamento: cuenca?.departamento || 'Cusco',
      moisture: (moistureMap[soilTexture] as any) || 'HUMEDAD_MEDIA',
      moistureLabel: soilTexture === 'franca' ? 'Húmeda y Mullida' : soilTexture === 'arena' ? 'Seca y Arenosa' : 'Arcillosa / Húmeda',
      previousCropId: crop?.crop_id || 'papa_nativa',
      previousCropName: crop?.nombre_comun || 'Papa Nativa',
      priority: (selectedPriority as any) || 'tierra',
      priorityName: priorityLabels[selectedPriority || 'tierra'] || 'Curar y Abonar Suelo',
      lat: finalLat,
      lon: finalLon,
      altitude: finalAltitude,
      slope: 12,
      areaHa: areaHa,
      soilTexture: soilTexture as any,
      soilStoniness: soilStoniness as any,
      cropCoverNdvi: cropCoverNdvi as any,
      waterSource: waterSource as any,
      sowingWindow: sowingWindow as any,
    };

    onComplete(profile);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="fixed inset-0 z-50 bg-white flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200"
    >
      <WizardDialogHeader
        step={step}
        totalSteps={8}
        currentDialog={currentDialog}
        isHappy={isHappy}
        onCancel={onCancel}
      />

      {/* Main Body */}
      <div className="max-w-md mx-auto w-full px-5 py-3 flex-1 flex flex-col">
        {step === 1 && (
          <WizardStep1Location
            microcuencas={microcuencas}
            selectedCuencaId={selectedCuencaId}
            onSelectCuenca={(id) => {
              setSelectedCuencaId(id);
              setGpsError(null);
              triggerHappyReaction();
            }}
            onGPSDetect={handleGPSDetect}
            gpsLoading={gpsLoading}
            gpsStatus={gpsStatus}
            gpsError={gpsError}
          />
        )}

        {step === 2 && (
          <WizardStep2Map
            initialLat={actualCoords?.lat || (microcuencas.find((c) => c.id === selectedCuencaId)?.latitud_centro) || -13.332}
            initialLon={actualCoords?.lon || (microcuencas.find((c) => c.id === selectedCuencaId)?.longitud_centro) || -72.158}
            areaHa={areaHa}
            onChange={(data) => {
              setAreaHa(data.areaHa);
              setActualCoords({ lat: data.lat, lon: data.lon });
              triggerHappyReaction();
            }}
          />
        )}

        {step === 3 && (
          <WizardStep3Soil
            soilTexture={soilTexture}
            onSelect={(t) => {
              setSoilTexture(t);
              triggerHappyReaction();
            }}
          />
        )}

        {step === 4 && (
          <WizardStep4Stoniness
            soilStoniness={soilStoniness}
            onSelect={(s) => {
              setSoilStoniness(s);
              triggerHappyReaction();
            }}
          />
        )}

        {step === 5 && (
          <WizardStep5Cover
            cropCoverNdvi={cropCoverNdvi}
            onSelect={(c) => {
              setCropCoverNdvi(c);
              triggerHappyReaction();
            }}
          />
        )}

        {step === 6 && (
          <WizardStep6Water
            waterSource={waterSource}
            onSelect={(w) => {
              setWaterSource(w);
              triggerHappyReaction();
            }}
          />
        )}

        {step === 7 && (
          <WizardStep7ElNino
            sowingWindow={sowingWindow}
            onSelect={(sw) => {
              setSowingWindow(sw);
              triggerHappyReaction();
            }}
          />
        )}

        {step === 8 && (
          <WizardStep8CropPriority
            cultivos={cultivos}
            selectedCropId={selectedCropId}
            onSelectCrop={(cId) => {
              setSelectedCropId(cId);
              triggerHappyReaction();
            }}
            selectedPriority={selectedPriority}
            onSelectPriority={(p) => {
              setSelectedPriority(p);
              triggerHappyReaction();
            }}
            areaHa={areaHa}
            hardwareId={hardwareId}
          />
        )}

        <WizardFooter
          step={step}
          totalSteps={8}
          canProceed={canProceed()}
          speaker={currentDialog.speaker}
          areaHa={areaHa}
          onPrev={handlePrevStep}
          onNext={handleNextStep}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}
