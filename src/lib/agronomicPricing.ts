export interface FertilizerPriceInfo {
  microcuenca: string;
  distritoOProvincia: string;
  precioUreaSaco50kg: number;
  fuente: string;
}

export const REGIONAL_FERTILIZER_PRICES: Record<string, FertilizerPriceInfo> = {
  'Microcuenca Huaypo - Anta': {
    microcuenca: 'Microcuenca Huaypo - Anta',
    distritoOProvincia: 'Anta / Izcuchaca',
    precioUreaSaco50kg: 88,
    fuente: 'MIDAGRI SISAP · Almacén Anta',
  },
  'Microcuenca Vilcanota - Cusco': {
    microcuenca: 'Microcuenca Vilcanota - Cusco',
    distritoOProvincia: 'Maras / Urubamba',
    precioUreaSaco50kg: 92,
    fuente: 'MIDAGRI SISAP · Feria Urubamba',
  },
  'Microcuenca Vilcanota - Urubamba': {
    microcuenca: 'Microcuenca Vilcanota - Urubamba',
    distritoOProvincia: 'Maras / Urubamba',
    precioUreaSaco50kg: 92,
    fuente: 'MIDAGRI SISAP · Feria Urubamba',
  },
  'Microcuenca Vilcanota': {
    microcuenca: 'Microcuenca Vilcanota',
    distritoOProvincia: 'Valle Sagrado / Vilcanota',
    precioUreaSaco50kg: 90,
    fuente: 'MIDAGRI SISAP · Feria Calca / Vilcanota',
  },
  'Microcuenca Anta - Cusco': {
    microcuenca: 'Microcuenca Anta - Cusco',
    distritoOProvincia: 'Pampa de Anta',
    precioUreaSaco50kg: 89,
    fuente: 'MIDAGRI SISAP · Feria Izcuchaca',
  },
  'Microcuenca Canas - Espinar': {
    microcuenca: 'Microcuenca Canas - Espinar',
    distritoOProvincia: 'Canas / Yauri',
    precioUreaSaco50kg: 96,
    fuente: 'MIDAGRI SISAP · Feria Yauri',
  },
  default: {
    microcuenca: 'Cusco Sierra',
    distritoOProvincia: 'Cusco Mayorista',
    precioUreaSaco50kg: 90,
    fuente: 'MIDAGRI SISAP · Mercado Mayorista Cusco',
  },
};

export function getFertilizerPriceForParcel(
  microcuenca?: string,
  provinciaOrDistrito?: string
): FertilizerPriceInfo {
  if (microcuenca && REGIONAL_FERTILIZER_PRICES[microcuenca]) {
    return REGIONAL_FERTILIZER_PRICES[microcuenca];
  }

  // Substring matching on microcuenca name
  if (microcuenca) {
    const lower = microcuenca.toLowerCase();
    if (lower.includes('huaypo') || lower.includes('anta')) {
      return REGIONAL_FERTILIZER_PRICES['Microcuenca Huaypo - Anta'];
    }
    if (lower.includes('urubamba') || lower.includes('maras')) {
      return REGIONAL_FERTILIZER_PRICES['Microcuenca Vilcanota - Urubamba'];
    }
    if (lower.includes('vilcanota')) {
      return REGIONAL_FERTILIZER_PRICES['Microcuenca Vilcanota'];
    }
    if (lower.includes('canas') || lower.includes('espinar')) {
      return REGIONAL_FERTILIZER_PRICES['Microcuenca Canas - Espinar'];
    }
  }

  // Fallback to provincia or distrito name
  if (provinciaOrDistrito) {
    const lower = provinciaOrDistrito.toLowerCase();
    if (lower.includes('anta') || lower.includes('izcuchaca')) {
      return REGIONAL_FERTILIZER_PRICES['Microcuenca Huaypo - Anta'];
    }
    if (lower.includes('urubamba') || lower.includes('maras')) {
      return REGIONAL_FERTILIZER_PRICES['Microcuenca Vilcanota - Urubamba'];
    }
    if (lower.includes('vilcanota') || lower.includes('calca')) {
      return REGIONAL_FERTILIZER_PRICES['Microcuenca Vilcanota'];
    }
    if (lower.includes('canas') || lower.includes('espinar')) {
      return REGIONAL_FERTILIZER_PRICES['Microcuenca Canas - Espinar'];
    }
  }

  return REGIONAL_FERTILIZER_PRICES.default;
}

export function calculateNitrogenSavings(
  areaHa: number,
  nitrogenKgHa: number = 75,
  customPricePerSack?: number,
  microcuenca?: string,
  provinciaOrDistrito?: string
): {
  sacksAvoidedPerHa: number;
  totalSacksAvoided: number;
  pricePerSack: number;
  savingsPerHa: number;
  totalSavings: number;
  fuente: string;
  isCustomPrice: boolean;
} {
  const priceInfo = getFertilizerPriceForParcel(microcuenca, provinciaOrDistrito);
  const isValidCustomPrice = Boolean(
    customPricePerSack &&
      !isNaN(customPricePerSack) &&
      customPricePerSack > 0 &&
      customPricePerSack !== priceInfo.precioUreaSaco50kg
  );
  const pricePerSack =
    isValidCustomPrice && customPricePerSack
      ? customPricePerSack
      : priceInfo.precioUreaSaco50kg;

  // Safe numerical handling of area (clamps negative or NaN values to 0)
  const safeAreaHa = isNaN(areaHa) || areaHa <= 0 ? 0 : areaHa;

  // 1 saco de urea (50 kg al 46% N) = 23 kg de N puro
  // Si nitrogenKgHa <= 0 (e.g. balance negativo de papa que requiere N o valor sin especificar),
  // se asume el aporte estándar de fijación simbiótica de leguminosas andinas (~75 kg N/ha).
  const effectiveNitrogenKgHa = !isNaN(nitrogenKgHa) && nitrogenKgHa > 0 ? nitrogenKgHa : 75;
  const sacksAvoidedPerHa = Math.max(0, effectiveNitrogenKgHa / 23);
  const totalSacksAvoided = Math.round(sacksAvoidedPerHa * safeAreaHa * 10) / 10;
  const savingsPerHa = sacksAvoidedPerHa * pricePerSack;
  const totalSavings = Math.round(safeAreaHa * savingsPerHa);

  return {
    sacksAvoidedPerHa: Math.round(sacksAvoidedPerHa * 10) / 10,
    totalSacksAvoided,
    pricePerSack,
    savingsPerHa: Math.round(savingsPerHa),
    totalSavings,
    fuente: isValidCustomPrice ? 'Precio personalizado por agricultor' : priceInfo.fuente,
    isCustomPrice: isValidCustomPrice,
  };
}
