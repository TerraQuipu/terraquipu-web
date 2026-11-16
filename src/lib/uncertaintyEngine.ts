/**
 * Motor de Cálculo de Incertidumbre de Recomendación Agroambiental - TerraQuipu
 * Microcuenca Piuray-Qorimarca y Andes del Sur.
 *
 * Implementa el algoritmo de calibración de gemini-code-1794773971910 (2).py:
 * - El agricultor tiene la razón absoluta in situ.
 * - Las discrepancias con NASA/SENAMHI penalizan la fiabilidad satelital.
 * - Desglose de 6 penalizaciones independientes:
 *   1. Clima base (probabilidad oficial ENFEN / SENAMHI)
 *   2. Geometría espacial (tamaño del polígono <1,000m² o >30,000m²)
 *   3. Choque macro-microclima (alerta macro vs agrometeo en tiempo real)
 *   4. Satélite "ciego" (discrepancia en cobertura o agua fijada por el agricultor)
 *   5. Resolución edáfica (prueba del puñado vs SoilGrids 250m)
 *   6. Historial de rotación y nutrientes (cultivos fuera de la matriz andina)
 *
 * Semáforo UX:
 *   - Incertidumbre <= 20%: Alta (🟢)
 *   - Incertidumbre <= 45%: Media (🟡)
 *   - Incertidumbre > 45%:  Baja (🔴)
 */

export interface ParametrosCuestionarioIncertidumbre {
  esenciales?: {
    cobertura?: string;
    cultivo_actual?: { cultivo?: string; tipo?: string | null } | null;
    siembra?: string | null;
    cultivo_proximo?: { cultivo?: string; tipo?: string | null } | null;
  };
  complementarias?: {
    agua?: string;
    obras?: string;
    profundidad?: string;
    bloquea_obras_profundas?: boolean;
    textura?: {
      clase: string;
      origen: string; // 'declarado' | 'prueba_del_punado' | 'desconocido'
    };
    historial?: {
      vez_anterior?: { cultivo?: string; tipo?: string | null } | null;
      antes_de_esa?: { cultivo?: string; tipo?: string | null } | null;
    };
  };
  factores_extra?: {
    personas?: string;
    tiempo_semanal?: string;
  };
  [key: string]: any;
}

export interface DiscrepanciaDetalle {
  agricultor: any;
  externo: any;
}

export interface DatosVisorIncertidumbre {
  area_m2?: number;
  areaHa?: number;
  pendiente_pct?: number;
}

export interface DatosApiIncertidumbre {
  precipitation_mm?: number;
  ndvi_mean?: number;
  smap_humidity?: number;
}

export interface AlertaMacroIncertidumbre {
  escenario_activo?: string; // 'déficit_lluvias' | 'deficit_lluvias' | 'lluvias_intensas' | 'heladas' | 'senal_incierta'
  probabilidad_porcentaje?: number;
}

export interface DesglosePenalizaciones {
  clima_base: number;
  geometria_espacial: number;
  choque_macro_micro: number;
  satelite_ciego: number;
  resolucion_edafica: number;
  historial_desconocido: number;
}

export interface ResultadoIncertidumbre {
  incertidumbre_total_porcentaje: number;
  fiabilidad_porcentaje: number; // 100 - total (mínimo 0)
  desglose_penalizaciones: DesglosePenalizaciones;
  nivel_confianza_ux: 'High (🟢)' | 'Medium (🟡)' | 'Low (🔴)' | 'Alta (🟢)' | 'Media (🟡)' | 'Baja (🔴)';
  nivel_simple: 'alta' | 'media' | 'baja';
  motivos_principales: string[];
}

export function calcular_incertidumbre_recomendacion(
  parametros_cuestionario: ParametrosCuestionarioIncertidumbre,
  discrepancias_esenciales: Record<string, DiscrepanciaDetalle> = {},
  datos_visor: DatosVisorIncertidumbre = {},
  datos_api: DatosApiIncertidumbre = {},
  alerta_macro: AlertaMacroIncertidumbre = {}
): ResultadoIncertidumbre {
  let i_total = 0;
  const desglose: DesglosePenalizaciones = {
    clima_base: 0,
    geometria_espacial: 0,
    choque_macro_micro: 0,
    satelite_ciego: 0,
    resolucion_edafica: 0,
    historial_desconocido: 0,
  };
  const motivos: string[] = [];

  // 1. Incertidumbre Climática Base (De la alerta oficial ENFEN/SENAMHI)
  // Por defecto 50% si señal incierta (exacto Python gemini-code-1794773971910)
  const prob_oficial =
    typeof alerta_macro.probabilidad_porcentaje === 'number'
      ? alerta_macro.probabilidad_porcentaje
      : 50;
  const i_clima = Math.max(0, 100 - prob_oficial);
  desglose.clima_base = i_clima;
  i_total += i_clima;
  if (i_clima > 25) {
    motivos.push(`Regional climate forecast dispersion (${prob_oficial}% official certainty).`);
  }

  // 2. Incertidumbre Espacial (Topografía / Tamaño del polígono del Visor)
  // Puede venir en area_m2 o areaHa
  let area_m2 = datos_visor.area_m2;
  if (typeof area_m2 !== 'number' && typeof datos_visor.areaHa === 'number') {
    area_m2 = datos_visor.areaHa * 10000;
  }
  area_m2 = area_m2 || 0;

  let i_espacial = 0;
  // Menor a 1,000m² (sub-píxel satelital) o mayor a 30,000m² (mezcla pendientes)
  if (area_m2 < 1000 || area_m2 > 30000) {
    i_espacial = 15;
    if (area_m2 < 1000) {
      motivos.push('Parcel smaller than 1,000 m2 (below SMAP/NASA microwave sensor resolution).');
    } else {
      motivos.push('Extensive parcel (>3 ha): potential slope and moisture heterogeneity.');
    }
  }
  desglose.geometria_espacial = i_espacial;
  i_total += i_espacial;

  // 3. Incertidumbre Macro-Micro (Alerta regional vs agrometeo local en tiempo real)
  let i_macro_micro = 0;
  const escenario = (alerta_macro.escenario_activo || '').toLowerCase();
  const precipitacion_api = datos_api.precipitation_mm ?? 0.0;

  if (
    (escenario === 'déficit_lluvias' || escenario === 'deficit_lluvias') &&
    precipitacion_api > 5.0
  ) {
    i_macro_micro = 15;
    motivos.push('Macro-micro discrepancy: Regional drought advisory, but local agrometeo reports precipitation.');
  } else if (escenario === 'lluvias_intensas' && precipitacion_api === 0.0) {
    i_macro_micro = 15;
    motivos.push('Macro-micro discrepancy: Severe rain warning, but local sensors record dry conditions.');
  }
  desglose.choque_macro_micro = i_macro_micro;
  i_total += i_macro_micro;

  // 4. Incertidumbre por Satélite "Ciego" (Cuestionario vs Satélite)
  let i_satelite = 0;
  if (
    discrepancias_esenciales &&
    ('cobertura' in discrepancias_esenciales || 'agua' in discrepancias_esenciales)
  ) {
    i_satelite = 20;
    motivos.push('In-situ correction: Farmer ground observation rectified satellite NDVI reading.');
  }
  desglose.satelite_ciego = i_satelite;
  i_total += i_satelite;

  // 5. Incertidumbre por Resolución Edáfica (Textura del suelo)
  let i_edafica = 0;
  const texturaInfo = parametros_cuestionario?.complementarias?.textura;
  const origen_textura =
    typeof texturaInfo === 'object' && texturaInfo !== null ? texturaInfo.origen : 'prueba_del_punado';

  if (origen_textura === 'prueba_del_punado') {
    i_edafica = 5; // Leve margen empírico
  } else if (origen_textura === 'desconocido') {
    i_edafica = 10;
    motivos.push('Soil texture inferred from SoilGrids global model (250 m resolution).');
  }
  desglose.resolucion_edafica = i_edafica;
  i_total += i_edafica;

  // 6. Incertidumbre de Rotación / Nutrientes (Historial)
  let i_historial = 0;
  const historial = parametros_cuestionario?.complementarias?.historial;
  const v_anterior = historial?.vez_anterior;
  const a_de_esa = historial?.antes_de_esa;

  if (
    (v_anterior && typeof v_anterior === 'object' && v_anterior.cultivo === 'otro') ||
    (a_de_esa && typeof a_de_esa === 'object' && a_de_esa.cultivo === 'otro')
  ) {
    i_historial = 5;
    motivos.push('Non-standard crop in rotational history: Approximate nitrogen balance adjustment.');
  }
  desglose.historial_desconocido = i_historial;
  i_total += i_historial;

  // --- Traducción de la Incertidumbre a UX (Semáforo de la App) ---
  let nivel_ux: 'High (🟢)' | 'Medium (🟡)' | 'Low (🔴)' | 'Alta (🟢)' | 'Media (🟡)' | 'Baja (🔴)';
  let nivel_simple: 'alta' | 'media' | 'baja';

  if (i_total <= 20) {
    nivel_ux = 'High (🟢)';
    nivel_simple = 'alta';
  } else if (i_total <= 45) {
    nivel_ux = 'Medium (🟡)';
    nivel_simple = 'media';
  } else {
    nivel_ux = 'Low (🔴)';
    nivel_simple = 'baja';
  }

  const fiabilidad = Math.max(5, Math.min(99, 100 - i_total));

  return {
    incertidumbre_total_porcentaje: i_total,
    fiabilidad_porcentaje: fiabilidad,
    desglose_penalizaciones: desglose,
    nivel_confianza_ux: nivel_ux,
    nivel_simple,
    motivos_principales: motivos,
  };
}
