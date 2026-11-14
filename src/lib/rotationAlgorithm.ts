import { CampaignStep, CropRecord, RotationEngineResult } from '@/types';
import { ActiveParcel } from './geoUtils';

const CROP_IMAGES: Record<string, string> = {
  papa: '/images/papa_nativa.jpg',
  quinua: '/images/quinua_real.jpg',
  tarwi: '/images/tarwi_chocho.jpg',
  haba: '/images/haba_verde.jpg',
  maiz: '/images/maiz_blanco.jpg',
};

export function calculateRotationSequence(
  previousCrop: string,
  priority: string,
  climateMode: 'normal' | 'nino',
  cropMatrix: CropRecord[],
  parcel?: ActiveParcel
): RotationEngineResult {
  const isNino = climateMode === 'nino';
  const areaHa = parcel?.areaHa || 1.68;
  const slopePct = parcel?.slopePct || 14.0;
  const elev = parcel?.elevationMsnm || 3754;

  // SCENARIO 1: Fenómeno El Niño (-25% rain, higher pest pressure)
  if (isNino) {
    const totalN = Math.round(areaHa * 95);
    const totalSavings = Math.round(areaHa * 340);
    const totalWater = Math.round(areaHa * 350 * 10);

    const c1: CampaignStep = {
      cycleNumber: 1,
      period: 'Campaña 1 (Inmediata 2024-25)',
      title: 'Tarwi Altiplano (Súper Resistente Sequía)',
      cropKey: 'tarwi',
      emoji: '🫘',
      imageUrl: CROP_IMAGES.tarwi,
      scientificName: 'Lupinus mutabilis cv. Andenes INIA',
      suitabilityScore: 98,
      nitrogenBalance: `+95 kg N/ha (+${totalN} kg total)`,
      totalNitrogenKg: totalN,
      savingsSoles: totalSavings,
      waterDemand: '350 mm agua',
      totalWaterM3: totalWater,
      pestStatus: 'Gorgojo: -90%',
      description:
        `Leguminosa andina rústica. Para tu parcela de ${areaHa.toFixed(2)} ha, fija ${totalN} kg de nitrógeno orgánico y corta drásticamente el ciclo biológico del gorgojo andino con ahorro de S/. ${totalSavings}.`,
      advice:
        `¡Atención hermano! Por El Niño las lluvias bajan 25%. El Tarwi resiste sequía en tu terreno (${slopePct}% pendiente) y desinfecta la tierra sin agroquímicos.`,
      tag: 'RESISTE SEQUÍA EXTREMA',
    };

    const c2: CampaignStep = {
      cycleNumber: 2,
      period: 'Campaña 2 (2025-26)',
      title: 'Papa Nativa Huayro / Amarilla',
      cropKey: 'papa',
      emoji: '🥔',
      imageUrl: CROP_IMAGES.papa,
      scientificName: 'Solanum tuberosum subsp. andigena',
      suitabilityScore: 89,
      nitrogenBalance: '-35 kg N/ha (Aprovecha)',
      totalNitrogenKg: Math.round(areaHa * -35),
      savingsSoles: Math.round(areaHa * 180),
      waterDemand: '540 mm agua',
      totalWaterM3: Math.round(areaHa * 540 * 10),
      pestStatus: 'Suelo Saneado',
      description:
        'Cosecha de alto rendimiento gracias al abono biológico previo. El suelo desinfectado minimiza el uso de insumos químicos.',
      advice:
        'Con el suelo nutrido por el tarwi anterior y libre de plagas, tu papa nativa rendirá con tubérculos sanos.',
      tag: 'SUELO RECUPERADO',
    };

    const c3: CampaignStep = {
      cycleNumber: 3,
      period: 'Campaña 3 (2026-27)',
      title: 'Quinua Negra Collana / Pasankalla',
      cropKey: 'quinua',
      emoji: '🌾',
      imageUrl: CROP_IMAGES.quinua,
      scientificName: 'Chenopodium quinoa',
      suitabilityScore: 92,
      nitrogenBalance: '+15 kg N/ha',
      totalNitrogenKg: Math.round(areaHa * 15),
      savingsSoles: Math.round(areaHa * 220),
      waterDemand: '310 mm agua',
      totalWaterM3: Math.round(areaHa * 310 * 10),
      pestStatus: 'Saponina Biocida',
      description:
        'Pseudocereal de bajísimo requerimiento hídrico. Su rastrojo actúa como manto protector contra la erosión andina.',
      advice:
        'Cerramos con quinua negra para proteger la estructura del suelo y asegurar granos de alto valor.',
      tag: 'COBERTURA Y RESILIENCIA',
    };

    return {
      compatibilityRate: 96,
      campaigns: [c1, c2, c3],
      chaskiMessage:
        `¡Alerta El Niño! Lluvias con 25% de déficit. En tus ${areaHa.toFixed(2)} ha priorizamos Tarwi para asegurar tu cosecha.`,
      elNinoAlert: true,
    };
  }

  // SCENARIO 2: Normal Climate - Rotation based on previous crop and priority
  if (previousCrop === 'papa') {
    const isFood = priority === 'alimento';
    const c1Title = isFood ? 'Haba San Pedro / Verde Criollo' : 'Tarwi Chocho INIA-445';
    const c1Key: 'haba' | 'tarwi' = isFood ? 'haba' : 'tarwi';
    const c1RateN = isFood ? 65 : 95;
    const c1RateSavings = isFood ? 280 : 320;
    const c1WaterMm = isFood ? 420 : 350;

    const totalN = Math.round(areaHa * c1RateN);
    const totalSavings = Math.round(areaHa * c1RateSavings);
    const totalWater = Math.round(areaHa * c1WaterMm * 10);

    const c1: CampaignStep = {
      cycleNumber: 1,
      period: 'Campaña 1 (Inmediata 2024-25)',
      title: c1Title,
      cropKey: c1Key,
      emoji: isFood ? '🌱' : '🫘',
      imageUrl: isFood ? CROP_IMAGES.haba : CROP_IMAGES.tarwi,
      scientificName: isFood ? 'Vicia faba cv. San Pedro' : 'Lupinus mutabilis cv. Andenes INIA',
      suitabilityScore: 96,
      nitrogenBalance: `+${c1RateN} kg N/ha (+${totalN} kg total)`,
      totalNitrogenKg: totalN,
      savingsSoles: totalSavings,
      waterDemand: `${c1WaterMm} mm agua`,
      totalWaterM3: totalWater,
      pestStatus: 'Gorgojo: -84%',
      description:
        `Para tu parcela de ${areaHa.toFixed(2)} ha (altitud ${elev} msnm, pendiente ${slopePct}%), esta leguminosa aporta +${totalN} kg de nitrógeno biológico con un ahorro de S/. ${totalSavings} en fertilizantes sintéticos.`,
      advice:
        `Hermano campesino, cosechaste papa en tu parcela. El suelo necesita reponer nitrógeno: sembremos ${isFood ? 'Haba Verde' : 'Tarwi Chocho'} para romper el ciclo biológico del gorgojo andino.`,
      tag: 'FIJACIÓN DE NITRÓGENO',
    };

    const c2: CampaignStep = {
      cycleNumber: 2,
      period: 'Campaña 2 (2025-26)',
      title: priority === 'venta' ? 'Papa Canchán Comercial' : 'Papa Nativa Huayro / Amarilla',
      cropKey: 'papa',
      emoji: '🥔',
      imageUrl: CROP_IMAGES.papa,
      scientificName: 'Solanum tuberosum subsp. andigena',
      suitabilityScore: 93,
      nitrogenBalance: '-35 kg N/ha (Aprovecha)',
      totalNitrogenKg: Math.round(areaHa * -35),
      savingsSoles: Math.round(areaHa * 190),
      waterDemand: '560 mm agua',
      totalWaterM3: Math.round(areaHa * 560 * 10),
      pestStatus: 'Suelo Saneado',
      description:
        'Retorno óptimo al cultivo principal con nitrógeno orgánico residual disponible y baja presión sanitaria.',
      advice:
        'Con el suelo enriquecido por la leguminosa, tu papa crecerá fuerte y con excelente tamaño de tubérculo.',
      tag: 'RENDIMIENTO MÁXIMO',
    };

    const c3: CampaignStep = {
      cycleNumber: 3,
      period: 'Campaña 3 (2026-27)',
      title: priority === 'venta' ? 'Maíz Blanco Urubamba' : 'Quinua Negra Collana / Pasankalla',
      cropKey: priority === 'venta' ? 'maiz' : 'quinua',
      emoji: priority === 'venta' ? '🌽' : '🌾',
      imageUrl: priority === 'venta' ? CROP_IMAGES.maiz : CROP_IMAGES.quinua,
      scientificName: priority === 'venta' ? 'Zea mays var. amylacea' : 'Chenopodium quinoa',
      suitabilityScore: 91,
      nitrogenBalance: 'Baja demanda N',
      totalNitrogenKg: Math.round(areaHa * 10),
      savingsSoles: Math.round(areaHa * 210),
      waterDemand: '320 mm agua',
      totalWaterM3: Math.round(areaHa * 320 * 10),
      pestStatus: 'Saponina Biocida',
      description:
        'Cierre del ciclo trienal con grano andino rústico que equilibra el balance hídrico y protege contra heladas.',
      advice:
        'Terminamos la secuencia con quinua o maíz para conservar la fertilidad y no agotar el subsuelo.',
      tag: 'PROTECCIÓN Y EQUILIBRIO',
    };

    return {
      compatibilityRate: 95,
      campaigns: [c1, c2, c3],
      chaskiMessage:
        `Cosechaste papa en tu área de ${areaHa.toFixed(2)} ha. Recargamos nitrógeno con leguminosas antes de volver al tubérculo.`,
      elNinoAlert: false,
    };
  }

  if (previousCrop === 'tarwi' || previousCrop === 'haba') {
    // Soil is rich in nitrogen! Excellent for Papa Nativa
    const totalN = Math.round(areaHa * -45);
    const totalSavings = Math.round(areaHa * 350);
    const totalWater = Math.round(areaHa * 580 * 10);

    const c1: CampaignStep = {
      cycleNumber: 1,
      period: 'Campaña 1 (Inmediata 2024-25)',
      title: 'Papa Nativa Huayro / Compis',
      cropKey: 'papa',
      emoji: '🥔',
      imageUrl: CROP_IMAGES.papa,
      scientificName: 'Solanum tuberosum subsp. andigenum',
      suitabilityScore: 97,
      nitrogenBalance: `-45 kg N/ha (Usa reserva)`,
      totalNitrogenKg: totalN,
      savingsSoles: totalSavings,
      waterDemand: '580 mm agua',
      totalWaterM3: totalWater,
      pestStatus: 'Suelo Desinfectado',
      description:
        `Aprovechamiento directo de los nódulos de Rhizobium dejados por la leguminosa en tus ${areaHa.toFixed(2)} ha. Cero inóculo de gorgojo.`,
      advice:
        'Tu suelo está repleto de nitrógeno natural tras la leguminosa. Es el momento perfecto para una gran cosecha de Papa Nativa.',
      tag: 'ALTO RENDIMIENTO',
    };

    const c2: CampaignStep = {
      cycleNumber: 2,
      period: 'Campaña 2 (2025-26)',
      title: 'Quinua Real / Pasankalla',
      cropKey: 'quinua',
      emoji: '🌾',
      imageUrl: CROP_IMAGES.quinua,
      scientificName: 'Chenopodium quinoa',
      suitabilityScore: 92,
      nitrogenBalance: '-20 kg N/ha',
      totalNitrogenKg: Math.round(areaHa * -20),
      savingsSoles: Math.round(areaHa * 230),
      waterDemand: '350 mm agua',
      totalWaterM3: Math.round(areaHa * 350 * 10),
      pestStatus: 'Resistencia Alta',
      description:
        'Aprovecha el rastrojo suelto y estructura porosa que deja la papa sin exigir fertilización extra.',
      advice:
        'La quinua aprovechará la tierra mullida de la papa para dar panojas tupidas y resistentes.',
      tag: 'GRANO RESILIENTE',
    };

    const c3: CampaignStep = {
      cycleNumber: 3,
      period: 'Campaña 3 (2026-27)',
      title: 'Haba Verde / Cebada Forrajera',
      cropKey: 'haba',
      emoji: '🌱',
      imageUrl: CROP_IMAGES.haba,
      scientificName: 'Vicia faba / Hordeum vulgare',
      suitabilityScore: 90,
      nitrogenBalance: '+50 kg N/ha',
      totalNitrogenKg: Math.round(areaHa * 50),
      savingsSoles: Math.round(areaHa * 260),
      waterDemand: '290 mm agua',
      totalWaterM3: Math.round(areaHa * 290 * 10),
      pestStatus: 'Control Activo',
      description:
        'Cobertura vegetal activa que previene la erosión eólica andina y produce forraje para los animales.',
      advice:
        'Cierra con haba o cebada para descanso activo y alimento seguro para tu familia.',
      tag: 'DESCANSO ACTIVO',
    };

    return {
      compatibilityRate: 97,
      campaigns: [c1, c2, c3],
      chaskiMessage:
        `¡Suelo fértil y oxigenado en tus ${areaHa.toFixed(2)} ha! La leguminosa anterior dejó el terreno listo para la mejor papa nativa.`,
      elNinoAlert: false,
    };
  }

  // Fallback / Previous crop was Quinua or Maiz
  const totalN = Math.round(areaHa * 95);
  const totalSavings = Math.round(areaHa * 320);
  const totalWater = Math.round(areaHa * 340 * 10);

  const c1: CampaignStep = {
    cycleNumber: 1,
    period: 'Campaña 1 (Inmediata 2024-25)',
    title: 'Tarwi Criollo / Haba Verde',
    cropKey: 'tarwi',
    emoji: '🫘',
    imageUrl: CROP_IMAGES.tarwi,
    scientificName: 'Lupinus mutabilis',
    suitabilityScore: 95,
    nitrogenBalance: `+95 kg N/ha (+${totalN} kg total)`,
    totalNitrogenKg: totalN,
    savingsSoles: totalSavings,
    waterDemand: '340 mm agua',
    totalWaterM3: totalWater,
    pestStatus: 'Rotación Sanitaria',
    description:
      `La quinua dejó el suelo suelto. La leguminosa aportará +${totalN} kg de nitrógeno orgánico en tus ${areaHa.toFixed(2)} ha.`,
    advice:
      'Sembremos tarwi o haba para recargar nutrientes tras la cosecha de quinua.',
    tag: 'RECARGA ORGÁNICA',
  };

  const c2: CampaignStep = {
    cycleNumber: 2,
    period: 'Campaña 2 (2025-26)',
    title: 'Papa Nativa Amarilla Tumbay',
    cropKey: 'papa',
    emoji: '🥔',
    imageUrl: CROP_IMAGES.papa,
    scientificName: 'Solanum andigena',
    suitabilityScore: 93,
    nitrogenBalance: '-35 kg N/ha',
    totalNitrogenKg: Math.round(areaHa * -35),
    savingsSoles: Math.round(areaHa * 200),
    waterDemand: '570 mm agua',
    totalWaterM3: Math.round(areaHa * 570 * 10),
    pestStatus: 'Suelo Saneado',
    description:
      'Tubérculo vigoroso sobre suelo balanceado. Máxima calidad culinaria y comercial.',
    advice:
      'Tu chacra estará en su punto para producir papa nativa de primer nivel.',
    tag: 'CALIDAD SUPERIOR',
  };

  const c3: CampaignStep = {
    cycleNumber: 3,
    period: 'Campaña 3 (2026-27)',
    title: 'Maíz Blanco Urubamba',
    cropKey: 'maiz',
    emoji: '🌽',
    imageUrl: CROP_IMAGES.maiz,
    scientificName: 'Zea mays var. amylacea',
    suitabilityScore: 89,
    nitrogenBalance: 'Baja demanda',
    totalNitrogenKg: Math.round(areaHa * 12),
    savingsSoles: Math.round(areaHa * 210),
    waterDemand: '340 mm agua',
    totalWaterM3: Math.round(areaHa * 340 * 10),
    pestStatus: 'Sin Plagas Cruzadas',
    description:
      'Cierre con cereal de reserva campesina para autoconsumo o venta a centros de acopio.',
    advice:
      'Cerramos la triada con maíz gigante de Urubamba para despensa familiar o venta en feria.',
    tag: 'SEGURIDAD ALIMENTARIA',
  };

  return {
    compatibilityRate: 94,
    campaigns: [c1, c2, c3],
    chaskiMessage:
      `Tras la quinua en tus ${areaHa.toFixed(2)} ha, recargamos con leguminosa para preparar la tierra hacia una papa nativa limpia.`,
    elNinoAlert: false,
  };
}
