import { createClient } from '@supabase/supabase-js';
import { Microcuenca, Cultivo, ClimaNasa, ReporteAgricultor } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkijtmrhohcllphadwhu.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJraWp0bXJob2hjbGxwaGFkd2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1Mzk4NDQsImV4cCI6MjExMDExNTg0NH0.EWPUJ0RYXZtVm5NCdLdMIe8ggl0Nx3rlvdqGDi3C480';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getMicrocuencas(): Promise<Microcuenca[]> {
  try {
    const { data, error } = await supabase
      .from('microcuencas_grid')
      .select('*')
      .order('nombre');

    if (error) {
      console.warn('Error fetching microcuencas:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Network error fetching microcuencas:', e);
    return [];
  }
}

export async function getCultivos(): Promise<Cultivo[]> {
  try {
    const { data, error } = await supabase
      .from('matriz_cultivos')
      .select('*')
      .order('nombre_comun');

    if (error) {
      console.warn('Error fetching matriz_cultivos:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error('Network error fetching matriz_cultivos:', e);
    return [];
  }
}

export async function getClimaNasa(cuencaId?: string): Promise<ClimaNasa | null> {
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
      return fallback.data?.[0] || null;
    }

    return data[0];
  } catch (e) {
    console.error('Error fetching clima_nasa:', e);
    return null;
  }
}

export async function submitReportToCloud(report: ReporteAgricultor): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const payload = {
      cuenca_id: report.cuenca_id || null,
      dispositivo_id: report.dispositivo_id,
      latitud: report.latitud,
      longitud: report.longitud,
      cultivo_actual_id: report.cultivo_actual_id || null,
      humedad_suelo_estimada: report.humedad_suelo_estimada,
      presencia_gorgojo: report.presencia_gorgojo,
      alerta_helada_observada: report.alerta_helada_observada || false,
      notas_voz_url: report.notas_voz_url || null,
      sincronizado_desde_outbox: report.sincronizado_desde_outbox || false
    };

    const { data, error } = await supabase
      .from('reportes_agricultores')
      .insert([payload])
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data?.[0] };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Error de conexión' };
  }
}

export async function getRecentReports(limit = 10): Promise<ReporteAgricultor[]> {
  try {
    const { data, error } = await supabase
      .from('reportes_agricultores')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching recent reports:', e);
    return [];
  }
}
