import { createClient } from '@supabase/supabase-js';
import { CropRecord, MicrocuencaRecord, ReporteAgricultor } from '@/types';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkijtmrhohcllphadwhu.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWp0bXJob2hjbGxwaGFkd2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1Mzk4NDQsImV4cCI6MjExMDExNTg0NH0.EWPUJ0RYXZtVm5NCdLdMIe8ggl0Nx3rlvdqGDi3C480';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fallback seed data in case of network interruption
export const DEFAULT_CROPS: CropRecord[] = [
  {
    crop_id: 'papa_nativa',
    nombre_comun: 'Papa Nativa Andina',
    nombre_cientifico: 'Solanum tuberosum subsp. andigenum',
    familia_botanica: 'Solanaceae',
    variedades_recomendadas: ['Huayro', 'Canchan', 'Amarilla Tumbay'],
    demanda_hidrica_min_mm: 500,
    demanda_hidrica_optima_mm: 650,
    altitud_min_msnm: 2800,
    altitud_max_msnm: 4100,
    ph_suelo_min: 5.0,
    ph_suelo_max: 6.5,
    balance_nitrogeno_kg_ha: -70.0,
    rompe_plaga_gorgojo: false,
    tolerancia_helada_c: -1.5,
    meses_ciclo: 6,
    sucesores_favorables: ['tarwi', 'haba', 'quinua'],
    sucesores_desfavorables: ['papa_nativa'],
    icono_emoji: '🥔',
  },
  {
    crop_id: 'tarwi',
    nombre_comun: 'Tarwi / Chocho',
    nombre_cientifico: 'Lupinus mutabilis',
    familia_botanica: 'Fabaceae',
    variedades_recomendadas: ['Andenes INIA', 'Yunguyo'],
    demanda_hidrica_min_mm: 350,
    demanda_hidrica_optima_mm: 480,
    altitud_min_msnm: 2800,
    altitud_max_msnm: 3900,
    ph_suelo_min: 5.5,
    ph_suelo_max: 7.2,
    balance_nitrogeno_kg_ha: 95.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: -3.0,
    meses_ciclo: 7,
    sucesores_favorables: ['papa_nativa', 'maiz', 'quinua'],
    sucesores_desfavorables: ['tarwi'],
    icono_emoji: '🫘',
  },
  {
    crop_id: 'quinua',
    nombre_comun: 'Quinua Real / Pasankalla',
    nombre_cientifico: 'Chenopodium quinoa',
    familia_botanica: 'Amaranthaceae',
    variedades_recomendadas: ['Pasankalla INIA', 'Salcedo INIA'],
    demanda_hidrica_min_mm: 300,
    demanda_hidrica_optima_mm: 420,
    altitud_min_msnm: 2500,
    altitud_max_msnm: 4000,
    ph_suelo_min: 5.5,
    ph_suelo_max: 8.0,
    balance_nitrogeno_kg_ha: -25.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: -4.0,
    meses_ciclo: 5,
    sucesores_favorables: ['papa_nativa', 'haba'],
    sucesores_desfavorables: ['quinua'],
    icono_emoji: '🌾',
  },
  {
    crop_id: 'haba',
    nombre_comun: 'Haba Verde / Grano',
    nombre_cientifico: 'Vicia faba',
    familia_botanica: 'Fabaceae',
    variedades_recomendadas: ['Blanca de Urubamba', 'Verde Anta'],
    demanda_hidrica_min_mm: 380,
    demanda_hidrica_optima_mm: 520,
    altitud_min_msnm: 2600,
    altitud_max_msnm: 3800,
    ph_suelo_min: 6.0,
    ph_suelo_max: 7.5,
    balance_nitrogeno_kg_ha: 75.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: -2.5,
    meses_ciclo: 6,
    sucesores_favorables: ['papa_nativa', 'maiz'],
    sucesores_desfavorables: ['haba'],
    icono_emoji: '🌱',
  },
  {
    crop_id: 'cebada',
    nombre_comun: 'Cebada Grano',
    nombre_cientifico: 'Hordeum vulgare',
    familia_botanica: 'Poaceae',
    variedades_recomendadas: ['Centenario INIA'],
    demanda_hidrica_min_mm: 300,
    demanda_hidrica_optima_mm: 450,
    altitud_min_msnm: 3000,
    altitud_max_msnm: 4200,
    ph_suelo_min: 5.5,
    ph_suelo_max: 7.5,
    balance_nitrogeno_kg_ha: -30.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: -4.5,
    meses_ciclo: 5,
    sucesores_favorables: ['papa_nativa', 'tarwi'],
    sucesores_desfavorables: ['cebada'],
    icono_emoji: '🌿',
  },
];

export async function fetchCropMatrix(): Promise<{ data: CropRecord[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('matriz_cultivos')
      .select('*')
      .order('demanda_hidrica_optima_mm', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Usando matriz local de respaldo:', error?.message);
      return { data: DEFAULT_CROPS, error: error?.message || null };
    }

    return { data: data as CropRecord[], error: null };
  } catch (err: any) {
    return { data: DEFAULT_CROPS, error: err.message };
  }
}

export async function updateCropRecord(
  cropId: string,
  updates: Partial<CropRecord>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('matriz_cultivos')
      .update(updates)
      .eq('crop_id', cropId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchMicrocuencas(): Promise<{
  data: MicrocuencaRecord[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('microcuencas_grid')
      .select('id, codigo_cuenca, nombre, distrito, provincia, departamento, elevacion_media_msnm, latitud_centro, longitud_centro, vulnerabilidad_sequia')
      .order('nombre');

    if (error) throw error;
    return { data: data as MicrocuencaRecord[], error: null };
  } catch (err: any) {
    return { data: [], error: err.message };
  }
}

export const DEMO_FIELD_REPORTS: ReporteAgricultor[] = [
  { id: 'rep-01', dispositivo_id: 'TQ-HW-2DFD', latitud: -13.3934, longitud: -72.0498, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 'rep-02', dispositivo_id: 'TQ-HW-3FC9', latitud: -13.3852, longitud: -72.0411, humedad_suelo_estimada: 'SECO', presencia_gorgojo: true, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 'rep-03', dispositivo_id: 'TQ-HW-81A2', latitud: -13.4107, longitud: -72.0289, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: true, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: 'rep-04', dispositivo_id: 'TQ-HW-99C1', latitud: -13.3912, longitud: -72.0475, humedad_suelo_estimada: 'SECO', presencia_gorgojo: true, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: 'rep-05', dispositivo_id: 'TQ-HW-11B4', latitud: -13.3806, longitud: -72.0687, humedad_suelo_estimada: 'SATURADO', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: 'rep-06', dispositivo_id: 'TQ-HW-55F8', latitud: -13.3285, longitud: -72.1562, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: 'rep-07', dispositivo_id: 'TQ-HW-64A1', latitud: -13.3312, longitud: -72.1489, humedad_suelo_estimada: 'SECO', presencia_gorgojo: true, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
  { id: 'rep-08', dispositivo_id: 'TQ-HW-77D3', latitud: -13.3451, longitud: -72.1620, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: true, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
  { id: 'rep-09', dispositivo_id: 'TQ-HW-88E2', latitud: -13.4520, longitud: -72.2315, humedad_suelo_estimada: 'SECO', presencia_gorgojo: false, alerta_helada_observada: true, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString() },
  { id: 'rep-10', dispositivo_id: 'TQ-HW-92K9', latitud: -13.4480, longitud: -72.2280, humedad_suelo_estimada: 'CHARCO', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 480).toISOString() },
  { id: 'rep-11', dispositivo_id: 'TQ-HW-43M1', latitud: -13.3150, longitud: -72.1120, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 540).toISOString() },
  { id: 'rep-12', dispositivo_id: 'TQ-HW-28P4', latitud: -13.3210, longitud: -72.1080, humedad_suelo_estimada: 'SECO', presencia_gorgojo: true, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString() },
  { id: 'rep-13', dispositivo_id: 'TQ-HW-19R7', latitud: -13.3980, longitud: -72.0530, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: true, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 660).toISOString() },
  { id: 'rep-14', dispositivo_id: 'TQ-HW-72T5', latitud: -13.4020, longitud: -72.0460, humedad_suelo_estimada: 'SECO', presencia_gorgojo: false, alerta_helada_observada: true, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 720).toISOString() },
  { id: 'rep-15', dispositivo_id: 'TQ-HW-61W2', latitud: -13.3750, longitud: -72.0720, humedad_suelo_estimada: 'SATURADO', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 780).toISOString() },
  { id: 'rep-16', dispositivo_id: 'TQ-HW-34Y8', latitud: -13.3820, longitud: -72.0390, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: true, alerta_helada_observada: false, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 840).toISOString() },
  { id: 'rep-17', dispositivo_id: 'TQ-HW-85Z1', latitud: -13.3950, longitud: -72.0550, humedad_suelo_estimada: 'SECO', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 900).toISOString() },
  { id: 'rep-18', dispositivo_id: 'TQ-HW-47B9', latitud: -13.3380, longitud: -72.1590, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 960).toISOString() },
  { id: 'rep-19', dispositivo_id: 'TQ-HW-59C3', latitud: -13.3420, longitud: -72.1640, humedad_suelo_estimada: 'SECO', presencia_gorgojo: true, alerta_helada_observada: true, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 1020).toISOString() },
  { id: 'rep-20', dispositivo_id: 'TQ-HW-68D7', latitud: -13.4580, longitud: -72.2350, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 1080).toISOString() },
  { id: 'rep-21', dispositivo_id: 'TQ-HW-73E5', latitud: -13.4620, longitud: -72.2400, humedad_suelo_estimada: 'SECO', presencia_gorgojo: false, alerta_helada_observada: true, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 1140).toISOString() },
  { id: 'rep-22', dispositivo_id: 'TQ-HW-82F1', latitud: -14.8820, longitud: -70.5890, humedad_suelo_estimada: 'SECO', presencia_gorgojo: false, alerta_helada_observada: true, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 1200).toISOString() },
  { id: 'rep-23', dispositivo_id: 'TQ-HW-91G4', latitud: -14.8950, longitud: -70.5950, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: false, alerta_helada_observada: true, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 1260).toISOString() },
  { id: 'rep-24', dispositivo_id: 'TQ-HW-14H8', latitud: -13.3990, longitud: -72.0480, humedad_suelo_estimada: 'HUMEDAD_MEDIA', presencia_gorgojo: true, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 1320).toISOString() },
  { id: 'rep-25', dispositivo_id: 'TQ-HW-26J2', latitud: -13.3890, longitud: -72.0440, humedad_suelo_estimada: 'SECO', presencia_gorgojo: true, alerta_helada_observada: false, sincronizado_desde_outbox: true, created_at: new Date(Date.now() - 1000 * 60 * 1380).toISOString() },
  { id: 'rep-26', dispositivo_id: 'TQ-HW-37K6', latitud: -13.3120, longitud: -72.1250, humedad_suelo_estimada: 'CHARCO', presencia_gorgojo: false, alerta_helada_observada: false, sincronizado_desde_outbox: false, created_at: new Date(Date.now() - 1000 * 60 * 1440).toISOString() },
];

export async function fetchFarmerReports(): Promise<{
  data: ReporteAgricultor[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('reportes_agricultores')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data || data.length === 0) {
      return { data: DEMO_FIELD_REPORTS, error: error?.message || null };
    }

    // If Supabase has fewer than 20 rows, merge with demo reports to ensure full pagination preview
    if (data.length < 20) {
      const merged = [...(data as ReporteAgricultor[]), ...DEMO_FIELD_REPORTS.slice(data.length)];
      return { data: merged, error: null };
    }

    return { data: data as ReporteAgricultor[], error: null };
  } catch (err: any) {
    return { data: DEMO_FIELD_REPORTS, error: err.message };
  }
}

export async function submitFarmerReport(report: {
  dispositivo_id: string;
  latitud: number;
  longitud: number;
  humedad_suelo_estimada: 'SECO' | 'HUMEDAD_MEDIA' | 'SATURADO' | 'CHARCO';
  presencia_gorgojo: boolean;
  alerta_helada_observada: boolean;
  cuenca_id?: string;
  cultivo_actual_id?: string;
  notas_voz_url?: string;
  sincronizado_desde_outbox?: boolean;
}): Promise<{ success: boolean; data?: ReporteAgricultor; error: string | null }> {
  try {
    const payload = {
      ...report,
      sincronizado_desde_outbox: report.sincronizado_desde_outbox ?? false,
    };
    const { data, error } = await supabase
      .from('reportes_agricultores')
      .insert([payload])
      .select();

    if (error) throw error;
    return { success: true, data: data?.[0] as ReporteAgricultor, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
