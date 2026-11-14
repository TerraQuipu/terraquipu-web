export interface CropRecord {
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

export interface MicrocuencaRecord {
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

export interface ReporteAgricultor {
  id: string;
  cuenca_id?: string;
  dispositivo_id: string;
  latitud: number;
  longitud: number;
  cultivo_actual_id?: string;
  humedad_suelo_estimada: 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO' | 'CHARCO';
  presencia_gorgojo: boolean;
  alerta_helada_observada: boolean;
  notas_voz_url?: string;
  sincronizado_desde_outbox: boolean;
  created_at: string;
}

export interface ClimaNasaDiario {
  id: number;
  cuenca_id: string;
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
}

export interface ParcelProperties {
  id: string;
  name: string;
  sector: string;
  area_ha: number;
  slope_pct: number;
  ph: number;
  cic: number;
  smap_moisture_pct: number;
  ndvi: number;
  current_crop: string;
  elevation_msnm: number;
}

export interface GeoJsonFeature<G = any, P = any> {
  type: 'Feature';
  geometry: G;
  properties: P;
}

export interface GeoJsonFeatureCollection<G = any, P = any> {
  type: 'FeatureCollection';
  name?: string;
  crs?: {
    type: string;
    properties: { name: string };
  };
  features: GeoJsonFeature<G, P>[];
}

export interface CampaignStep {
  cycleNumber: number;
  period: string;
  title: string;
  cropKey: 'papa' | 'quinua' | 'tarwi' | 'haba' | 'maiz';
  emoji: string;
  imageUrl: string;
  scientificName: string;
  suitabilityScore: number;
  nitrogenBalance: string;
  totalNitrogenKg: number;
  savingsSoles: number;
  waterDemand: string;
  totalWaterM3: number;
  pestStatus: string;
  description: string;
  advice: string;
  tag: string;
}

export interface RotationEngineResult {
  compatibilityRate: number;
  campaigns: [CampaignStep, CampaignStep, CampaignStep];
  chaskiMessage: string;
  elNinoAlert: boolean;
}
