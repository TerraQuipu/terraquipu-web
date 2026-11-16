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

    if (error) {
      console.warn('Error al consultar reportes en Supabase:', error.message);
      return { data: [], error: error.message };
    }

    return { data: (data as ReporteAgricultor[]) || [], error: null };
  } catch (err: any) {
    console.error('Error de red al consultar reportes:', err);
    return { data: [], error: err.message };
  }
}

export async function fetchClimaNasa(cuencaId?: string): Promise<{
  data: any | null;
  error: string | null;
}> {
  try {
    let query = supabase
      .from('clima_nasa_diario')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(1);

    if (cuencaId) {
      query = query.eq('cuenca_id', cuencaId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      const fallback = await supabase
        .from('clima_nasa_diario')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(1);
      return { data: fallback.data?.[0] || null, error: error?.message || null };
    }
    return { data: data[0], error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
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
