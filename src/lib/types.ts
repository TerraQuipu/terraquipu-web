export interface Microcuenca {
  id: string;
  codigo_cuenca: string;
  nombre: string;
  distrito: string;
  provincia: string;
  departamento: string;
  elevacion_media_msnm: number;
  latitud_centro: number;
  longitud_centro: number;
  vulnerabilidad_sequia: 'BAJA' | 'MEDIA' | 'ALTA' | 'EXTREMA';
}

export interface Cultivo {
  crop_id: string;
  nombre_comun: string;
  nombre_cientifico: string;
  familia_botanica: string;
  variedades_recomendadas: string[];
  demanda_hidrica_min_mm: number;
  demanda_hidrica_optima_mm: number;
  altitud_min_msnm: number;
  altitud_max_msnm: number;
  ph_suelo_min: number;
  ph_suelo_max: number;
  balance_nitrogeno_kg_ha: number;
  rompe_plaga_gorgojo: boolean;
  tolerancia_helada_c: number;
  meses_ciclo: number;
  sucesores_favorables: string[];
  sucesores_desfavorables: string[];
  icono_emoji: string;
}

export interface ClimaNasa {
  id?: number;
  cuenca_id?: string;
  fecha: string;
  precipitacion_mm: number;
  temp_max_c: number;
  temp_min_c: number;
  temp_media_c: number;
  humedad_suelo_smap_m3m3: number;
  radiacion_solar_mj_m2: number;
  alerta_helada: boolean;
  anomalia_precipitacion_pct: number;
  fase_el_nino: string;
  calibrado_con_reportes?: boolean;
}

export interface ReporteAgricultor {
  id?: string;
  cuenca_id?: string | null;
  dispositivo_id: string;
  latitud: number;
  longitud: number;
  cultivo_actual_id?: string | null;
  humedad_suelo_estimada: 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO';
  presencia_gorgojo: boolean;
  alerta_helada_observada?: boolean;
  notas_voz_url?: string | null;
  sincronizado_desde_outbox: boolean;
  textura_suelo?: string | null;
  pedregosidad?: string | null;
  cobertura_ndvi_real?: string | null;
  fuente_agua?: string | null;
  ventana_siembra?: string | null;
  indice_salud?: number;
  created_at?: string;
  synced?: boolean;
}

export interface FarmerProfile {
  cuencaId: string;
  cuencaName: string;
  parcelName: string;
  distrito: string;
  provincia: string;
  departamento: string;
  moisture: 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO';
  moistureLabel: string;
  previousCropId: string;
  previousCropName: string;
  priority: 'tierra' | 'comida' | 'mercado';
  priorityName: string;
  lat: number;
  lon: number;
  altitude: number;
  slope: number;
  areaHa?: number;
  // NASA & Ground-Truth Scientific Calibration (5 + 1)
  soilTexture?: 'arena' | 'franca' | 'arcilla';
  soilStoniness?: 'pedregoso' | 'profundo';
  cropCoverNdvi?: 'sembrado' | 'barbecho' | 'pasto' | 'suelo_desnudo';
  waterSource?: 'secano' | 'auxilio' | 'permanente';
  sowingWindow?: 'esta_semana' | '2_4_semanas' | '1_2_meses' | 'proxima_campana';
}

export interface RotationRecommendation {
  crop: Cultivo;
  score: number;
  badge: string;
  savings: string;
  pestReduction: string;
  waterDemand: string;
  advice: string;
  sequence: Cultivo[];
}
