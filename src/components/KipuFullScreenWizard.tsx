'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Microcuenca, Cultivo, FarmerProfile } from '@/lib/types';
import { generateHardwareProfile } from '@/lib/deviceProfile';
import {
  playBubblePop,
  playWhoosh,
  playQuestionChime,
  playSuccessFanfare,
} from '@/lib/soundEffects';
import {
  CuestionarioAgricultor,
  PrediccionZonaV2,
  ResultadoAsistenteAgroambiental,
  ejecutarAsistenteAgroambiental,
  CoberturaSuelo,
  DisponibilidadAgua,
  EstadoObras,
  ProfundidadSuelo,
  ClaseTextura,
  OrigenTextura,
  DisponibilidadPersonas,
  TiempoSemanal,
} from '@/lib/agroenvironmentalEngine';

import WizardDialogHeader, { DialogSpeakerConfig } from './wizard/WizardDialogHeader';
import WizardStep1Location from './wizard/WizardStep1Location';
import WizardStep2Map from './wizard/WizardStep2Map';
import WizardStep3Soil from './wizard/WizardStep3Soil';
import WizardStep4Stoniness from './wizard/WizardStep4Stoniness';
import WizardStep5Cover from './wizard/WizardStep5Cover';
import WizardStep6Water from './wizard/WizardStep6Water';
import WizardStep7ElNino from './wizard/WizardStep7ElNino';
import WizardStep8CropPriority from './wizard/WizardStep8CropPriority';
import WizardStepPest from './wizard/WizardStepPest';
import WizardStepConservation from './wizard/WizardStepConservation';
import WizardStepHistorial from './wizard/WizardStepHistorial';
import WizardStepWorkload from './wizard/WizardStepWorkload';
import WizardStepConclusion from './wizard/WizardStepConclusion';
import WizardFooter from './wizard/WizardFooter';

export interface KipuFullScreenWizardProps {
  microcuencas: Microcuenca[];
  cultivos: Cultivo[];
  mode?: 'full' | 'soil' | 'elnino' | 'rotation';
  onComplete: (profile: FarmerProfile, agroResult?: ResultadoAsistenteAgroambiental) => void;
  onCancel?: () => void;
  initialProfile?: Partial<FarmerProfile>;
  activeParcel?: any;
}

export default function KipuFullScreenWizard({
  microcuencas,
  cultivos,
  mode = 'full',
  onComplete,
  onCancel,
  initialProfile,
  activeParcel,
}: KipuFullScreenWizardProps) {
  const [step, setStep] = useState(1);
  const [isHappy, setIsHappy] = useState(false);

  // States for parameters
  const [selectedCuencaId, setSelectedCuencaId] = useState<string>(
    initialProfile?.cuencaId || microcuencas[0]?.id || ''
  );
  const [areaHa, setAreaHa] = useState<number>(
    initialProfile?.areaHa !== undefined ? initialProfile.areaHa : 1.0
  );
  const [soilTexture, setSoilTexture] = useState<'arena' | 'franca' | 'arcilla' | ''>(
    initialProfile?.soilTexture || 'franca'
  );
  const [soilStoniness, setSoilStoniness] = useState<'pedregoso' | 'profundo' | ''>(
    initialProfile?.soilStoniness || 'profundo'
  );
  const [cropCoverNdvi, setCropCoverNdvi] = useState<'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo' | ''>(
    initialProfile?.cropCoverNdvi || 'barbecho'
  );
  const [waterSource, setWaterSource] = useState<'secano' | 'auxilio' | 'permanente' | ''>(
    initialProfile?.waterSource || 'auxilio'
  );
  const [sowingWindow, setSowingWindow] = useState<'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana' | ''>(
    initialProfile?.sowingWindow || '2_4_semanas'
  );
  const [selectedCropId, setSelectedCropId] = useState<string>(
    initialProfile?.previousCropId || 'papa_nativa'
  );
  const [selectedPriority, setSelectedPriority] = useState<'tierra' | 'comida' | 'mercado' | ''>(
    initialProfile?.priority || 'tierra'
  );

  // Modular steps states
  const [pest, setPest] = useState<'sano' | 'gorgojo' | 'rancha'>(
    initialProfile?.pest || 'sano'
  );
  const [obras, setObras] = useState<EstadoObras>('buen_estado');
  const [vezAnterior, setVezAnterior] = useState<string>('papa');
  const [antesDeEsa, setAntesDeEsa] = useState<string>('quinua');
  const [personas, setPersonas] = useState<DisponibilidadPersonas>('dos_o_tres');
  const [tiempoSemanal, setTiempoSemanal] = useState<TiempoSemanal>('algo');

  // GPS states
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [actualCoords, setActualCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Hardware ID
  const [hardwareId, setHardwareId] = useState('TQ-HW-DETECT');
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Determine total steps based on mode
  const totalSteps = useMemo(() => {
    switch (mode) {
      case 'soil':
        return 4; // 1: Texture, 2: Stoniness, 3: Pest, 4: Conclusion
      case 'elnino':
        return 6; // 1: Cover, 2: Water, 3: Obras, 4: Historial, 5: Workload, 6: Conclusion
      case 'rotation':
        return 2; // 1: Crop & Priority, 2: Conclusion
      case 'full':
      default:
        return 9; // 1..8 questions + 9: Conclusion
    }
  }, [mode]);

  // Dialog configuration per mode and step
  const currentDialog: DialogSpeakerConfig = useMemo(() => {
    if (mode === 'soil') {
      const dialogs: DialogSpeakerConfig[] = [
        {
          step: 1,
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
          step: 2,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '🏔️ Sanidad & Relieve',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            '¿Tu chacra tiene muchas piedras superficiales o la capa fértil es delgada? Esto define si es viable abrir zanjas de infiltración y zanjas trampa.',
        },
        {
          step: 3,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '🪲 Semáforo Biológico',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            '¿Observas alguna plaga o enfermedad en tus plantas o rastrojo? Calibraremos la rotación para erradicar el gorgojo y prevenir la rancha.',
        },
        {
          step: 4,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '✨ Calibración Lista',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            '¡Suelo verificado con éxito! Cruzamos tu prueba de puño con los radares orbitales SMAP.',
        },
      ];
      return dialogs[step - 1] || dialogs[0];
    }

    if (mode === 'elnino') {
      const dialogs: DialogSpeakerConfig[] = [
        {
          step: 1,
          speaker: 'astro',
          name: 'ASTRO • SATÉLITE NASA',
          tag: '🛰️ Cobertura Sentinel-2',
          avatar: '/images/astro_satelin.png',
          bubbleBorder: 'border-sky-500 border-b-sky-700',
          tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
          speech:
            'Mis sensores ópticos leen el índice NDVI de tu lote. ¿Cómo está la cobertura vegetal real hoy en tu terreno? Corroboremos para medir riesgo de erosión.',
        },
        {
          step: 2,
          speaker: 'astro',
          name: 'ASTRO • SATÉLITE NASA',
          tag: '🌧️ Disponibilidad Hídrica',
          avatar: '/images/astro_satelin.png',
          bubbleBorder: 'border-sky-500 border-b-sky-700',
          tagColor: 'bg-sky-100 text-sky-900 border-sky-300',
          speech:
            'Cruzando el radar de precipitación NASA GPM con la humedad superficial: ¿De dónde toma agua tu chacra principalmente durante el año?',
        },
        {
          step: 3,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '🧱 Obras de Conservación',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            '¿Tu chacra cuenta con terrazas, andenes, zanjas o muros en la ladera? Si están deterioradas, El Niño puede causar cárcavas por escorrentía.',
        },
        {
          step: 4,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '🌾 Historial Precedente A13',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            'El algoritmo A13 requiere conocer los 2 cultivos precedentes para alternar familias botánicas y romper el ciclo biológico de plagas.',
        },
        {
          step: 5,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '👥 Mano de Obra y Tiempo',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            '¿Cuántas personas trabajan la parcela y cuánto tiempo le dedican por semana? Esto ajustará la dificultad de tu calendario preventivo.',
        },
        {
          step: 6,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '✨ Recomendación Generada',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            '¡Diagnóstico agroambiental completo! Hemos generado tu calendario preventivo en 4 bloques.',
        },
      ];
      return dialogs[step - 1] || dialogs[0];
    }

    if (mode === 'rotation') {
      const dialogs: DialogSpeakerConfig[] = [
        {
          step: 1,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '🌾 Rotación de Campañas',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            'Selecciona qué cultivo cosechaste en la campaña anterior y cuál es tu prioridad este año para construir tu Ruta Quipu de 3 campañas.',
        },
        {
          step: 2,
          speaker: 'kipu',
          name: 'KIPU • COPILOTO ANDINO',
          tag: '✨ Ruta Óptima',
          avatar: '/images/kipu_llama.png',
          bubbleBorder: 'border-emerald-600 border-b-emerald-700',
          tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          speech:
            '¡Ruta Quipu calculada! Reducción de fertilizantes y corte de plagas garantizado.',
        },
      ];
      return dialogs[step - 1] || dialogs[0];
    }

    // Default: 'full' mode (9 steps)
    const fullDialogs: DialogSpeakerConfig[] = [
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
      {
        step: 9,
        speaker: 'kipu',
        name: 'KIPU & ASTRO • CELEBRACIÓN',
        tag: '✨ Todo Calibrado',
        avatar: '/images/kipu_llama.png',
        bubbleBorder: 'border-emerald-600 border-b-emerald-700',
        tagColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
        speech:
          '¡Allillanchu hermano campesino! Tu chacra está sincronizada con los satélites de la NASA y la ciencia andina.',
      },
    ];
    return fullDialogs[step - 1] || fullDialogs[0];
  }, [mode, step]);

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

  // Validation to proceed
  const canProceed = () => {
    if (mode === 'soil') {
      switch (step) {
        case 1:
          return Boolean(soilTexture);
        case 2:
          return Boolean(soilStoniness);
        case 3:
          return Boolean(pest);
        case 4:
          return true;
        default:
          return false;
      }
    }

    if (mode === 'elnino') {
      switch (step) {
        case 1:
          return Boolean(cropCoverNdvi);
        case 2:
          return Boolean(waterSource);
        case 3:
          return Boolean(obras);
        case 4:
          return Boolean(vezAnterior && antesDeEsa);
        case 5:
          return Boolean(personas && tiempoSemanal);
        case 6:
          return true;
        default:
          return false;
      }
    }

    if (mode === 'rotation') {
      switch (step) {
        case 1:
          return Boolean(selectedCropId && selectedPriority);
        case 2:
          return true;
        default:
          return false;
      }
    }

    // Full mode
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
      case 9:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (canProceed() && step < totalSteps) {
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

  // Algorithmic Calculations
  const calculatedHealthScore = useMemo(() => {
    let score = 60;
    if (soilTexture === 'franca') score += 15;
    else if (soilTexture === 'arcilla') score += 8;
    else if (soilTexture === 'arena') score -= 5;

    if (soilStoniness === 'profundo') score += 12;
    else score -= 8;

    if (pest === 'sano') score += 13;
    else if (pest === 'gorgojo') score -= 18;
    else if (pest === 'rancha') score -= 14;

    return Math.max(20, Math.min(99, score));
  }, [soilTexture, soilStoniness, pest]);

  const agroResult = useMemo(() => {
    const cuenca = microcuencas.find((c) => c.id === selectedCuencaId) || microcuencas[0];
    const cuestionario: CuestionarioAgricultor = {
      esenciales: {
        cobertura: (cropCoverNdvi === 'sembrado'
          ? 'cultivo'
          : cropCoverNdvi === 'pasto'
          ? 'pasto'
          : cropCoverNdvi === 'suelo_desnudo'
          ? 'suelo_desnudo'
          : 'rastrojo') as CoberturaSuelo,
        cultivo_actual: selectedCropId || 'papa',
        siembra: sowingWindow || 'En 2 a 4 semanas',
        cultivo_proximo: 'quinua',
      },
      complementarias: {
        agua: (waterSource === 'secano'
          ? 'secano'
          : waterSource === 'permanente'
          ? 'riego_permanente'
          : 'riego_auxilio') as DisponibilidadAgua,
        obras: obras,
        profundidad: (soilStoniness === 'pedregoso' ? 'muy_pedregoso' : 'profundo') as ProfundidadSuelo,
        bloquea_obras_profundas: soilStoniness === 'pedregoso',
        textura: {
          clase: (soilTexture === 'arena'
            ? 'arenosa'
            : soilTexture === 'arcilla'
            ? 'arcillosa'
            : 'franca') as ClaseTextura,
          origen: 'prueba_del_punado' as OrigenTextura,
        },
        historial: {
          vez_anterior: vezAnterior || 'papa',
          antes_de_esa: antesDeEsa || 'quinua',
        },
      },
      adicionales: {
        personas: personas,
        tiempo_semanal: tiempoSemanal,
      },
    };

    const v2: PrediccionZonaV2 = {
      escenario: 'deficit_lluvias',
      T0: '2026-12-15',
      fuente_institucional: 'SENAMHI / ENFEN Alerta ENOS',
      confianza: 'alta',
    };

    return ejecutarAsistenteAgroambiental(cuestionario, v2);
  }, [
    activeParcel,
    selectedCuencaId,
    cropCoverNdvi,
    selectedCropId,
    sowingWindow,
    waterSource,
    obras,
    soilStoniness,
    soilTexture,
    vezAnterior,
    antesDeEsa,
    personas,
    tiempoSemanal,
    microcuencas,
  ]);

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
      moistureLabel:
        soilTexture === 'franca'
          ? 'Húmeda y Mullida'
          : soilTexture === 'arena'
          ? 'Seca y Arenosa'
          : 'Arcillosa / Húmeda',
      previousCropId: crop?.crop_id || 'papa_nativa',
      previousCropName: crop?.nombre_comun || 'Papa Nativa',
      priority: (selectedPriority as any) || 'tierra',
      priorityName: priorityLabels[selectedPriority || 'tierra'] || 'Curar y Abonar Suelo',
      lat: finalLat,
      lon: finalLon,
      altitude: finalAltitude,
      slope: 12,
      areaHa: areaHa,
      soilTexture: (soilTexture as any) || 'franca',
      soilStoniness: (soilStoniness as any) || 'profundo',
      cropCoverNdvi: (cropCoverNdvi as any) || 'barbecho',
      waterSource: (waterSource as any) || 'auxilio',
      sowingWindow: (sowingWindow as any) || '2_4_semanas',
      pest: pest,
      pestLabel:
        pest === 'sano'
          ? 'Chacra Sana (Sin Plagas)'
          : pest === 'gorgojo'
          ? 'Gorgojo de los Andes'
          : 'Rancha / Tizón',
    };

    onComplete(profile, agroResult);
  };

  const isConclusionStep = step === totalSteps;

  const cuencaCurrent = microcuencas.find((c) => c.id === selectedCuencaId) || microcuencas[0];
  const cropCurrent = cultivos.find((c) => c.crop_id === selectedCropId) || cultivos[0];

  if (!mounted) return null;

  return createPortal(
    <div
      ref={scrollContainerRef}
      className="fixed inset-0 z-50 bg-white text-slate-900 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200 selection:bg-sky-500 selection:text-white"
    >
      <WizardDialogHeader
        step={step}
        totalSteps={totalSteps}
        currentDialog={currentDialog}
        isHappy={isHappy}
        onCancel={onCancel}
      />

      {/* Main Body */}
      <div className="max-w-md mx-auto w-full px-5 py-3 flex-1 flex flex-col">
        {/* ======================================================== */}
        {/* MODE: SOIL (4 steps)                                      */}
        {/* ======================================================== */}
        {mode === 'soil' && (
          <>
            {step === 1 && (
              <WizardStep3Soil
                soilTexture={soilTexture}
                onSelect={(t) => {
                  setSoilTexture(t);
                  triggerHappyReaction();
                }}
              />
            )}
            {step === 2 && (
              <WizardStep4Stoniness
                soilStoniness={soilStoniness}
                onSelect={(s) => {
                  setSoilStoniness(s);
                  triggerHappyReaction();
                }}
              />
            )}
            {step === 3 && (
              <WizardStepPest
                pest={pest}
                onSelect={(p) => {
                  setPest(p);
                  triggerHappyReaction();
                }}
              />
            )}
            {step === 4 && (
              <WizardStepConclusion
                mode="soil"
                profileData={{
                  parcelName: `Chacra ${cuencaCurrent?.distrito || 'Maras'}`,
                  areaHa: areaHa,
                  distrito: cuencaCurrent?.distrito || 'Maras',
                  altitude: cuencaCurrent?.elevacion_media_msnm || 3380,
                  moistureText: soilTexture === 'franca' ? 'Húmeda y Mullida' : 'Seca y Arenosa',
                  cropName: cropCurrent?.nombre_comun || 'Papa Nativa',
                  priorityName: selectedPriority === 'tierra' ? 'Curar Suelo' : 'Alimento',
                }}
                healthScore={calculatedHealthScore}
                onConfirm={handleFinish}
              />
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* MODE: EL NINO (6 steps)                                   */}
        {/* ======================================================== */}
        {mode === 'elnino' && (
          <>
            {step === 1 && (
              <WizardStep5Cover
                cropCoverNdvi={cropCoverNdvi}
                onSelect={(c) => {
                  setCropCoverNdvi(c);
                  triggerHappyReaction();
                }}
              />
            )}
            {step === 2 && (
              <WizardStep6Water
                waterSource={waterSource}
                onSelect={(w) => {
                  setWaterSource(w);
                  triggerHappyReaction();
                }}
              />
            )}
            {step === 3 && (
              <WizardStepConservation
                obras={obras}
                onSelect={(o) => {
                  setObras(o);
                  triggerHappyReaction();
                }}
              />
            )}
            {step === 4 && (
              <WizardStepHistorial
                vezAnterior={vezAnterior}
                antesDeEsa={antesDeEsa}
                onUpdate={(v, a) => {
                  setVezAnterior(v);
                  setAntesDeEsa(a);
                  triggerHappyReaction();
                }}
              />
            )}
            {step === 5 && (
              <WizardStepWorkload
                personas={personas}
                tiempoSemanal={tiempoSemanal}
                onUpdate={(p, t) => {
                  setPersonas(p);
                  setTiempoSemanal(t);
                  triggerHappyReaction();
                }}
              />
            )}
            {step === 6 && (
              <WizardStepConclusion
                mode="elnino"
                profileData={{
                  parcelName: `Chacra ${cuencaCurrent?.distrito || 'Maras'}`,
                  areaHa: areaHa,
                  distrito: cuencaCurrent?.distrito || 'Maras',
                  altitude: cuencaCurrent?.elevacion_media_msnm || 3380,
                  moistureText: waterSource === 'secano' ? 'Secano Estricto' : 'Riego Auxilio',
                  cropName: cropCurrent?.nombre_comun || 'Papa Nativa',
                  priorityName: 'Prevención El Niño',
                }}
                agroResult={agroResult}
                onConfirm={handleFinish}
              />
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* MODE: ROTATION (2 steps)                                  */}
        {/* ======================================================== */}
        {mode === 'rotation' && (
          <>
            {step === 1 && (
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
            {step === 2 && (
              <WizardStepConclusion
                mode="rotation"
                profileData={{
                  parcelName: `Chacra ${cuencaCurrent?.distrito || 'Maras'}`,
                  areaHa: areaHa,
                  distrito: cuencaCurrent?.distrito || 'Maras',
                  altitude: cuencaCurrent?.elevacion_media_msnm || 3380,
                  moistureText: 'Calibrado',
                  cropName: cropCurrent?.nombre_comun || 'Papa Nativa',
                  priorityName: selectedPriority === 'tierra' ? 'Curar Suelo' : selectedPriority === 'comida' ? 'Sustento del Hogar' : 'Venta en Feria',
                }}
                onConfirm={handleFinish}
              />
            )}
          </>
        )}

        {/* ======================================================== */}
        {/* MODE: FULL (9 steps)                                      */}
        {/* ======================================================== */}
        {mode === 'full' && (
          <>
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
                initialLat={
                  actualCoords?.lat ||
                  microcuencas.find((c) => c.id === selectedCuencaId)?.latitud_centro ||
                  -13.332
                }
                initialLon={
                  actualCoords?.lon ||
                  microcuencas.find((c) => c.id === selectedCuencaId)?.longitud_centro ||
                  -72.158
                }
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

            {step === 9 && (
              <WizardStepConclusion
                mode="full"
                profileData={{
                  parcelName: `Chacra ${cuencaCurrent?.distrito || 'Maras'}`,
                  areaHa: areaHa,
                  distrito: cuencaCurrent?.distrito || 'Maras',
                  altitude: cuencaCurrent?.elevacion_media_msnm || 3380,
                  moistureText: soilTexture === 'franca' ? 'Húmeda y Mullida' : 'Seca y Arenosa',
                  cropName: cropCurrent?.nombre_comun || 'Papa Nativa',
                  priorityName: selectedPriority === 'tierra' ? 'Curar Suelo' : 'Sustento',
                }}
                healthScore={calculatedHealthScore}
                onConfirm={handleFinish}
              />
            )}
          </>
        )}

        {/* Footer Navigation (Hide on conclusion step since WizardStepConclusion has its own CTA) */}
        {!isConclusionStep && (
          <WizardFooter
            step={step}
            totalSteps={totalSteps}
            canProceed={canProceed()}
            speaker={currentDialog.speaker}
            areaHa={areaHa}
            onPrev={handlePrevStep}
            onNext={handleNextStep}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
