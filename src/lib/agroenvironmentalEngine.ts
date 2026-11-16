/**
 * SISTEMA: ASISTENTE AGROAMBIENTAL TERRAQUIPU
 * 
 * Motor agroambiental para la prevención y reducción de vulnerabilidad edáfica
 * frente a los posibles impactos del fenómeno de El Niño en la microcuenca
 * Piuray-Qorimarca (Cusco, Perú) y zonas altoandinas.
 * 
 * Integra 3 fuentes de información:
 * 1. Visor web TerraQuipu (espacial/parcela: coordenadas, pendiente, SMAP, NDVI)
 * 2. Cuestionario al agricultor (esenciales, complementarios, factores adicionales)
 * 3. APIs ambientales NASA (POWER, SMAP) y SENAMHI
 */

// ============================================================================
// 1. TIPOS DE DATOS Y ESTRUCTURAS DEL SISTEMA
// ============================================================================

export type CoberturaSuelo = 'cultivo' | 'rastrojo' | 'pasto' | 'suelo_desnudo';
export type DisponibilidadAgua = 'secano' | 'riego_auxilio' | 'riego_permanente';
export type EstadoObras = 'buen_estado' | 'mal_estado' | 'ninguna';
export type ProfundidadSuelo = 'profundo' | 'algo_piedras' | 'muy_pedregoso';
export type ClaseTextura = 'arenosa' | 'franca' | 'arcillosa';
export type OrigenTextura = 'declarado' | 'prueba_del_punado';
export type DisponibilidadPersonas = 'solo_yo' | 'dos_o_tres' | 'cuatro_o_mas';
export type TiempoSemanal = 'poco' | 'algo' | 'bastante';

export type EscenarioClimatico = 'deficit_lluvias' | 'lluvias_intensas' | 'heladas' | 'senal_incierta';
export type NivelConfianza = 'alta' | 'media' | 'baja';
export type NivelVulnerabilidad = 'Alta' | 'Media' | 'Baja';

export interface ParametrosEsenciales {
  cobertura: CoberturaSuelo;
  cultivo_actual?: string | null;
  siembra?: string | null;
  cultivo_proximo?: string | null;
}

export interface HistorialCultivos {
  vez_anterior?: string | { cultivo?: string; tipo?: string } | null;
  antes_de_esa?: string | { cultivo?: string; tipo?: string } | null;
}

export interface InfoTextura {
  clase: ClaseTextura;
  origen: OrigenTextura;
}

export interface ParametrosComplementarios {
  agua: DisponibilidadAgua;
  obras: EstadoObras;
  profundidad: ProfundidadSuelo;
  bloquea_obras_profundas?: boolean;
  textura: InfoTextura | ClaseTextura;
  historial: HistorialCultivos;
}

export interface FactoresAdicionales {
  personas: DisponibilidadPersonas;
  tiempo_semanal: TiempoSemanal;
}

export interface CuestionarioAgricultor {
  esenciales: ParametrosEsenciales;
  complementarias: ParametrosComplementarios;
  adicionales: FactoresAdicionales;
}

export interface ActiveParcel {
  id: string;
  name: string;
  areaHa: number;
  slopePct: number;
  elevationMsnm: number;
  smapMoisturePct: number;
  ndvi: number;
  center: [number, number];
  bounds: [number, number][];
  isCustom?: boolean;
  precipitationTodayMm?: number;
  soilTempC?: number;
  evapotranspirationMm?: number;
}

export interface DatosVisorParcela {
  parcel_id?: string;
  nombre?: string;
  coordenadas?: [number, number]; // [lat, lon]
  areaHa?: number;
  pendientePct?: number;
  altitudMsnm?: number;
  smapMoisturePct?: number;
  ndvi?: number;
  microcuenca?: string;
}

export interface PrediccionZonaV2 {
  escenario: EscenarioClimatico;
  T0: string; // Fecha ISO o YYYY-MM-DD
  fuente_institucional: string;
  confianza: NivelConfianza;
}

export interface EstadoClimaticoV3 {
  precipitacion_reciente_mm?: number;
  humedad_suelo_pct?: number;
  temp_aire_c?: number;
  temp_min_c?: number;
  alerta_helada?: boolean;
  fuente?: string;
}

export type CodigoAccion =
  | 'A1'
  | 'A2'
  | 'A3'
  | 'A4'
  | 'A5'
  | 'A6'
  | 'A7'
  | 'A8'
  | 'A9'
  | 'A10'
  | 'A11'
  | 'A12'
  | 'A13';

export interface AccionCatalogo {
  codigo: CodigoAccion;
  nombre: string;
  esfuerzo: 'pesado' | 'medio' | 'liviano';
  esObraEstructural: boolean;
  descripcion: string;
}

export interface AccionRecomendadaItem {
  bloque: string;
  fechaTexto: string;
  accionCodigo: CodigoAccion;
  accionNombre: string;
  motivo: string;
  confianza: NivelConfianza;
  fuente: string;
}

export interface ResultadoAsistenteAgroambiental {
  estadoChacra: string;
  nivelVulnerabilidad: NivelVulnerabilidad;
  motivoVulnerabilidad: string;
  estadoClima: string;
  coincidenciaClima: 'Alerta y señal coinciden' | 'Alerta sin señal local todavía' | 'Señal local sin alerta' | 'No confirmada';
  recomendacionA13: {
    cultivo_sugerido: 'Papa' | 'Olluco' | 'Quinua' | 'Oca' | 'Tarwi' | 'Haba' | string | null;
    alternativa?: string | null;
    confianza: NivelConfianza;
    motivo: string;
    diferenciaConIntencion?: string | null;
  };
  calendario: AccionRecomendadaItem[];
  condicionalFinal: string;
}

// ============================================================================
// 2. CATÁLOGO DE ACCIONES PERMITIDAS (A1 - A13)
// ============================================================================

export const CATALOGO_ACCIONES: Record<CodigoAccion, AccionCatalogo> = {
  A1: {
    codigo: 'A1',
    nombre: 'Zanjas de infiltración y de coronación',
    esfuerzo: 'pesado',
    esObraEstructural: true,
    descripcion: 'Capturan agua de escorrentía en laderas, evitan cárcavas e infiltran agua al subsuelo.',
  },
  A2: {
    codigo: 'A2',
    nombre: 'Mantenimiento o construcción de terrazas y andenes',
    esfuerzo: 'pesado',
    esObraEstructural: true,
    descripcion: 'Muros de piedra y taludes que estabilizan pendientes andinas y retienen suelo fértil.',
  },
  A3: {
    codigo: 'A3',
    nombre: 'Siembra en curvas de nivel',
    esfuerzo: 'medio',
    esObraEstructural: false,
    descripcion: 'Trazar surcos transversales a la pendiente para frenar la fuerza de la lluvia.',
  },
  A4: {
    codigo: 'A4',
    nombre: 'Barreras vivas',
    esfuerzo: 'medio',
    esObraEstructural: false,
    descripcion: 'Líneas de pasto vetiver, qolli, queñua o retama que retienen sedimentos en laderas.',
  },
  A5: {
    codigo: 'A5',
    nombre: 'Cobertura del suelo (rastrojo, mulch, cultivo de cobertura)',
    esfuerzo: 'liviano',
    esObraEstructural: false,
    descripcion: 'Capa protectora de restos vegetales para evitar evaporación, planchado y erosión por gotas.',
  },
  A6: {
    codigo: 'A6',
    nombre: 'Drenaje y canales de evacuación',
    esfuerzo: 'medio',
    esObraEstructural: false,
    descripcion: 'Desvíos seguros de agua excedente para evitar encharcamiento y asfixia radicular.',
  },
  A7: {
    codigo: 'A7',
    nombre: 'Materia orgánica (compost, guano, abonos verdes)',
    esfuerzo: 'medio',
    esObraEstructural: false,
    descripcion: 'Incorporar guano de isla o corral para aumentar la capacidad de retención de humedad.',
  },
  A8: {
    codigo: 'A8',
    nombre: 'Cosecha de agua (qochas, reservorios)',
    esfuerzo: 'pesado',
    esObraEstructural: true,
    descripcion: 'Almacenamiento de agua de lluvia en microdepresiones comunales para riego de auxilio.',
  },
  A9: {
    codigo: 'A9',
    nombre: 'Ajuste de fechas de siembra, variedades y cultivos tolerantes',
    esfuerzo: 'liviano',
    esObraEstructural: false,
    descripcion: 'Modificar la fecha de siembra y elegir semillas rústicas según el pronóstico de lluvias.',
  },
  A10: {
    codigo: 'A10',
    nombre: 'Cortinas rompevientos y protección contra heladas',
    esfuerzo: 'medio',
    esObraEstructural: false,
    descripcion: 'Filas de árboles nativos que cortan vientos helados y protegen el microclima nocturno.',
  },
  A11: {
    codigo: 'A11',
    nombre: 'Reducir labranza y evitar suelo desnudo',
    esfuerzo: 'liviano',
    esObraEstructural: false,
    descripcion: 'Labranza mínima con chaquitaclla para no pulverizar la estructura del suelo.',
  },
  A12: {
    codigo: 'A12',
    nombre: 'Manejo del pastoreo (evitar sobrepastoreo)',
    esfuerzo: 'liviano',
    esObraEstructural: false,
    descripcion: 'Rotación y descanso de canchas de pastoreo para que el pasto nativo no se degrade.',
  },
  A13: {
    codigo: 'A13',
    nombre: 'Rotación de cultivos',
    esfuerzo: 'liviano',
    esObraEstructural: false,
    descripcion: 'Alternancia planificada entre tubérculos andinos y quinua según textura de suelo.',
  },
};

// ============================================================================
// 3. ALGORITMO A13: RECOMENDACIÓN DE ROTACIÓN (PORT DE PYTHON)
// ============================================================================

const TUBERCULOS_SET = new Set(['papa', 'olluco', 'oca']);
const LEGUMINOSAS_SET = new Set(['tarwi', 'haba']);
const EXTRACTORES_SET = new Set(['papa', 'olluco', 'oca', 'quinua']);
const CULTIVOS_PERMITIDOS_SET = new Set(['papa', 'olluco', 'oca', 'tarwi', 'haba', 'quinua']);

const ALIAS_CULTIVOS: Record<string, string> = {
  quinoa: 'quinua',
  oyuco: 'olluco',
  habas: 'haba',
  chocho: 'tarwi',
  lupino: 'tarwi',
  maiz: 'quinua',
  cebada: 'quinua',
  trigo: 'quinua',
  arveja: 'haba',
  frejol: 'tarwi',
};

const PREFERENCIAS_SUELO: Record<ClaseTextura, ('olluco' | 'papa' | 'oca')[]> = {
  arenosa: ['olluco', 'papa', 'oca'],
  franca: ['oca', 'papa', 'olluco'],
  arcillosa: ['papa', 'olluco', 'oca'],
};

export function limpiarTexto(valor: unknown): string | null {
  if (valor === null || valor === undefined) return null;
  const texto = String(valor).trim().toLowerCase();
  // Normalizar NFD y remover marcas diacríticas (acentos)
  const sinAcentos = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return sinAcentos.replace(/[\s-]+/g, '_');
}

export function obtenerCultivo(valor: unknown): string | null {
  if (!valor) return null;
  let raw = valor;
  let tipo: unknown = null;
  if (typeof valor === 'object' && valor !== null && 'cultivo' in valor) {
    raw = (valor as any).cultivo;
    tipo = (valor as any).tipo;
  }
  let clave = limpiarTexto(raw);
  if (!clave) return null;
  clave = ALIAS_CULTIVOS[clave] || clave;

  if (CULTIVOS_PERMITIDOS_SET.has(clave)) {
    return clave;
  }
  if (['descanso', 'descansar', 'descanso_de_parcela', 'barbecho', 'puruma'].includes(clave)) {
    return 'descanso';
  }

  // Si eligió 'otro' cultivo o un cultivo fuera del catálogo andino directo, inferir por familia botánica
  if (tipo) {
    const tipoLimpio = limpiarTexto(tipo);
    if (tipoLimpio === 'leguminosa') return 'haba';
    if (tipoLimpio === 'tuberculo_raiz' || tipoLimpio === 'tuberculo') return 'papa';
    if (tipoLimpio === 'cereal_grano' || tipoLimpio === 'cereal' || tipoLimpio === 'hortaliza') return 'quinua';
  }

  return null;
}

export function obtenerTextura(valor: unknown): ClaseTextura | null {
  if (!valor) return null;
  let raw = valor;
  if (typeof valor === 'object' && valor !== null && 'clase' in valor) {
    raw = (valor as any).clase;
  }
  const clave = limpiarTexto(raw);
  if (!clave) return null;

  const equivalencias: Record<string, ClaseTextura> = {
    suelta: 'arenosa',
    arenosa: 'arenosa',
    arena: 'arenosa',
    suave: 'franca',
    franca: 'franca',
    pesada: 'arcillosa',
    arcillosa: 'arcillosa',
    arcilla: 'arcillosa',
  };

  const normalizada = equivalencias[clave] || (clave as ClaseTextura);
  if (PREFERENCIAS_SUELO[normalizada]) {
    return normalizada;
  }
  return null;
}

export function elegirLeguminosa(
  suelo: ClaseTextura,
  agua?: unknown
): { sugerido: 'tarwi' | 'haba'; alternativa: 'tarwi' | 'haba'; detalle: string } {
  const aguaLimpia = limpiarTexto(agua);
  if (aguaLimpia === 'secano') {
    return {
      sugerido: 'tarwi',
      alternativa: 'haba',
      detalle: 'Con cultivo de secano se prioriza el tarwi por su mayor tolerancia a la falta de agua.',
    };
  }
  if (suelo === 'arenosa') {
    return {
      sugerido: 'tarwi',
      alternativa: 'haba',
      detalle: 'Se prioriza el tarwi por su adaptación a suelos sueltos de textura arenosa.',
    };
  }
  if (suelo === 'franca') {
    return {
      sugerido: 'haba',
      alternativa: 'tarwi',
      detalle: 'Se prioriza el haba por su buen desarrollo en suelos francos y profundos.',
    };
  }
  return {
    sugerido: 'haba',
    alternativa: 'tarwi',
    detalle: 'Se prioriza el haba, pero debe comprobarse que el suelo arcilloso tenga buen drenaje.',
  };
}

/**
 * Función central recomendar_A13 (port estricto de Python).
 * Sugiere el siguiente cultivo entre: Papa, Olluco, Oca, Quinua, Tarwi o Haba.
 */
export function recomendar_A13(
  ultimoCultivo: unknown,
  penultimoCultivo: unknown,
  textura: unknown,
  agua?: unknown
): {
  cultivo_sugerido: string | null;
  alternativa: string | null;
  confianza: NivelConfianza;
  motivo: string;
} {
  const ultimo = obtenerCultivo(ultimoCultivo);
  const penultimo = obtenerCultivo(penultimoCultivo);
  const suelo = obtenerTextura(textura);

  // Validación de datos indispensables
  if (ultimo === null || penultimo === null) {
    return {
      cultivo_sugerido: null,
      alternativa: null,
      confianza: 'baja',
      motivo: 'Falta identificar los dos cultivos anteriores para calcular la rotación biológica.',
    };
  }

  if (suelo === null) {
    return {
      cultivo_sugerido: null,
      alternativa: null,
      confianza: 'baja',
      motivo: 'Falta conocer la textura del suelo (arenosa, franca o arcillosa).',
    };
  }

  let origen = '';
  if (typeof textura === 'object' && textura !== null && 'origen' in textura) {
    origen = limpiarTexto((textura as any).origen) || '';
  }

  let sugerido = '';
  let alternativa: string | null = null;
  let motivo = '';
  let confianza: NivelConfianza = 'media';

  // REGLA 1: El último cultivo fue leguminosa (aprovechar nitrógeno fijado con tubérculo exigente)
  if (LEGUMINOSAS_SET.has(ultimo)) {
    sugerido = 'papa';
    confianza = 'media';
    motivo = `Después de ${ultimo} (leguminosa) se propone papa para aprovechar el nitrógeno que deja en el suelo.`;
  }
  // REGLA 2: Los dos cultivos anteriores fueron extractores (priorizar leguminosa)
  else if (EXTRACTORES_SET.has(ultimo) && EXTRACTORES_SET.has(penultimo)) {
    const leg = elegirLeguminosa(suelo, agua);
    sugerido = leg.sugerido;
    alternativa = leg.alternativa;
    confianza = 'media';
    motivo = `Los dos cultivos anteriores (${penultimo} y ${ultimo}) extraen muchos nutrientes del suelo, por lo que se propone una leguminosa. ${leg.detalle}`;
    if (suelo === 'arcillosa' && sugerido === 'haba') {
      confianza = 'baja';
    }
  }
  // REGLA 3: Último tubérculo, penúltimo no extractor
  else if (TUBERCULOS_SET.has(ultimo)) {
    sugerido = 'quinua';
    if (ultimo === 'papa') {
      confianza = 'media';
      motivo = 'Después de la papa se propone quinua para alternar cultivos y evitar repetir tubérculos.';
    } else {
      confianza = 'baja';
      motivo = 'Después de un tubérculo andino se propone quinua como alternancia entre grupos de cultivo. Es una regla orientativa.';
    }
  }
  // REGLA 4: Último quinua o descanso (penúltimo no extractor)
  else {
    const candidatos = [...PREFERENCIAS_SUELO[suelo]];
    // Evita repetir el cultivo de la campaña anterior
    if (penultimo && (candidatos as string[]).includes(penultimo)) {
      const idx = candidatos.indexOf(penultimo as any);
      if (idx > -1) {
        candidatos.splice(idx, 1);
        candidatos.push(penultimo as any);
      }
    }
    sugerido = candidatos[0];
    confianza = suelo !== 'arcillosa' ? 'media' : 'baja';
    motivo = `Se propone ${sugerido} como tubérculo más adecuado para suelo ${suelo}.`;
    if (suelo === 'arcillosa') {
      motivo += ' Debe comprobarse buena estructura y drenaje.';
    }
    if (ultimo === 'descanso') {
      motivo += ' La parcela estuvo en descanso; se usa el historial anterior como referencia.';
      confianza = 'baja';
    }
  }

  // Si la textura se estimó mediante la prueba del puñado, se reduce la confianza
  if (origen === 'prueba_del_punado') {
    confianza = 'baja';
  }

  const capitalize = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : null);

  return {
    cultivo_sugerido: capitalize(sugerido),
    alternativa: capitalize(alternativa),
    confianza,
    motivo,
  };
}

export function ejecutar_A13(
  esenciales: ParametrosEsenciales,
  complementarias: ParametrosComplementarios
) {
  const historial = complementarias.historial || {};
  let ultimo: unknown;
  let penultimo: unknown;

  if (esenciales.cobertura === 'cultivo') {
    ultimo = esenciales.cultivo_actual;
    penultimo = historial.vez_anterior;
  } else {
    ultimo = historial.vez_anterior;
    penultimo = historial.antes_de_esa;
  }

  const res = recomendar_A13(ultimo, penultimo, complementarias.textura, complementarias.agua);

  // Comparación con cultivo_proximo si fue indicado por el agricultor
  let diferenciaConIntencion: string | null = null;
  if (esenciales.cultivo_proximo && res.cultivo_sugerido) {
    const proxCrop = obtenerCultivo(esenciales.cultivo_proximo);
    const proxNorm = limpiarTexto(proxCrop);
    const sugNorm = limpiarTexto(res.cultivo_sugerido);
    if (proxNorm && sugNorm && proxNorm !== sugNorm && proxNorm !== 'descanso') {
      const nombreMostrar =
        typeof esenciales.cultivo_proximo === 'object' &&
        esenciales.cultivo_proximo !== null &&
        'cultivo' in (esenciales.cultivo_proximo as any)
          ? (esenciales.cultivo_proximo as any).cultivo
          : esenciales.cultivo_proximo;
      diferenciaConIntencion = `Tu intención es sembrar ${nombreMostrar}, pero el algoritmo propone ${res.cultivo_sugerido} para mejorar la rotación. No es obligatorio cambiar, pero considera esta recomendación para proteger el suelo.`;
    }
  }

  return {
    ...res,
    diferenciaConIntencion,
  };
}

// ============================================================================
// 4. CLASIFICACIÓN DE VULNERABILIDAD (REGLA 6)
// ============================================================================

export function clasificarVulnerabilidad(
  cuestionario: CuestionarioAgricultor,
  visor?: DatosVisorParcela
): {
  nivel: NivelVulnerabilidad;
  motivo: string;
} {
  const { esenciales, complementarias } = cuestionario;
  const pendiente = visor?.pendientePct ?? 12.0;

  let puntosRiesgo = 0;
  const factoresDesfavorables: string[] = [];
  const factoresProtectores: string[] = [];

  // 1. Pendiente
  if (pendiente >= 18) {
    puntosRiesgo += 2;
    factoresDesfavorables.push(`pendiente pronunciada (${pendiente}%)`);
  } else if (pendiente <= 8) {
    factoresProtectores.push(`pendiente suave (${pendiente}%)`);
  }

  // 2. Cobertura del suelo
  if (esenciales.cobertura === 'suelo_desnudo') {
    puntosRiesgo += 3;
    factoresDesfavorables.push('suelo desnudo vulnerable a erosión');
  } else if (esenciales.cobertura === 'rastrojo' || esenciales.cobertura === 'cultivo') {
    factoresProtectores.push(`cobertura vegetal (${esenciales.cobertura})`);
  }

  // 3. Profundidad y pedregosidad
  if (complementarias.profundidad === 'muy_pedregoso') {
    puntosRiesgo += 2;
    factoresDesfavorables.push('suelo muy pedregoso con poca profundidad efectiva');
  } else if (complementarias.profundidad === 'profundo') {
    factoresProtectores.push('suelo profundo');
  }

  // 4. Disponibilidad de agua
  if (complementarias.agua === 'secano') {
    puntosRiesgo += 2;
    factoresDesfavorables.push('dependencia total de lluvias (secano)');
  } else if (complementarias.agua === 'riego_permanente') {
    factoresProtectores.push('agua permanente');
  }

  // 5. Obras de protección
  if (complementarias.obras === 'ninguna') {
    puntosRiesgo += 2;
    factoresDesfavorables.push('sin obras de conservación');
  } else if (complementarias.obras === 'mal_estado') {
    puntosRiesgo += 2;
    factoresDesfavorables.push('obras de protección deterioradas');
  } else if (complementarias.obras === 'buen_estado') {
    factoresProtectores.push('obras de conservación en buen estado');
  }

  let nivel: NivelVulnerabilidad = 'Media';
  let motivo = '';

  if (puntosRiesgo >= 6) {
    nivel = 'Alta';
    motivo = `Chacra con vulnerabilidad alta debido a la combinación de ${factoresDesfavorables.join(', ')}.`;
  } else if (puntosRiesgo <= 2 && factoresProtectores.length >= 2) {
    nivel = 'Baja';
    motivo = `Chacra con vulnerabilidad baja respaldada por ${factoresProtectores.join(', ')}.`;
  } else {
    nivel = 'Media';
    motivo = `Chacra con vulnerabilidad media: presenta riesgos como ${factoresDesfavorables.join(', ') || 'exposición climática'}, pero cuenta con ${factoresProtectores.join(', ') || 'cierta estabilidad edáfica'}.`;
  }

  return { nivel, motivo };
}

// ============================================================================
// 5. COMPARACIÓN V2 (PREDICCIÓN) VS V3 (ESTADO CLIMÁTICO OBSERVADO)
// ============================================================================

export function compararClima(
  v2: PrediccionZonaV2,
  v3?: EstadoClimaticoV3
): {
  coincidencia: 'Alerta y señal coinciden' | 'Alerta sin señal local todavía' | 'Señal local sin alerta' | 'No confirmada';
  descripcion: string;
} {
  if (!v3) {
    return {
      coincidencia: 'No confirmada',
      descripcion: `Predicción institucional de ${v2.escenario} activa, pero faltan mediciones locales suficientes para confirmar coincidencia.`,
    };
  }

  const lluviaBaja = (v3.precipitacion_reciente_mm ?? 10) < 5;
  const sueloSeco = (v3.humedad_suelo_pct ?? 30) < 20;
  const heladaDetectada = (v3.temp_min_c ?? 10) <= 2 || v3.alerta_helada;

  if (v2.escenario === 'deficit_lluvias') {
    if (lluviaBaja || sueloSeco) {
      return {
        coincidencia: 'Alerta y señal coinciden',
        descripcion: 'El clima observado (déficit de lluvia y humedad baja) respalda la alerta de sequía por El Niño.',
      };
    } else {
      return {
        coincidencia: 'Alerta sin señal local todavía',
        descripcion: 'Existe alerta institucional de déficit hídrico, pero las lluvias y humedad locales aún no muestran caída crítica.',
      };
    }
  }

  if (v2.escenario === 'heladas') {
    if (heladaDetectada) {
      return {
        coincidencia: 'Alerta y señal coinciden',
        descripcion: 'Temperaturas nocturnas críticas confirman la alerta de heladas agronómicas.',
      };
    } else {
      return {
        coincidencia: 'Alerta sin señal local todavía',
        descripcion: 'Alerta de helada activa, pero las temperaturas nocturnas se mantienen en rango seguro por ahora.',
      };
    }
  }

  return {
    coincidencia: 'Alerta y señal coinciden',
    descripcion: `Monitoreo concordante entre pronóstico ${v2.fuente_institucional} y estaciones locales.`,
  };
}

// ============================================================================
// 6. GENERADOR DE CALENDARIO PREVENTIVO (4 BLOQUES TEMPORALES)
// ============================================================================

export function generarCalendarioPreventivo(
  cuestionario: CuestionarioAgricultor,
  v2: PrediccionZonaV2,
  v3?: EstadoClimaticoV3,
  visor?: DatosVisorParcela,
  fechaReferencia: Date = new Date()
): AccionRecomendadaItem[] {
  const { esenciales, complementarias, adicionales } = cuestionario;
  const items: AccionRecomendadaItem[] = [];

  const t0Date = new Date(v2.T0);
  const diffDays = Math.ceil((t0Date.getTime() - fechaReferencia.getTime()) / (1000 * 60 * 60 * 24));

  // Bloqueo de obras profundas si es muy pedregoso
  const bloqueaProfundas = complementarias.profundidad === 'muy_pedregoso' || complementarias.bloquea_obras_profundas;

  // Límite de acciones por disponibilidad
  const esPocoEsfuerzo = adicionales.personas === 'solo_yo' && adicionales.tiempo_semanal === 'poco';
  const maxAccionesPorBloque = esPocoEsfuerzo ? 2 : 3;

  // Formato de fechas DD/MM/AAAA
  const formatDDMMYYYY = (d: Date) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calcDateString = (offsetDays: number) => {
    const d = new Date(t0Date);
    d.setDate(d.getDate() - offsetDays);
    return formatDDMMYYYY(d);
  };

  // --------------------------------------------------------------------------
  // BLOQUE 1: Más de 12 semanas antes (hasta T0 - 85 días)
  // --------------------------------------------------------------------------
  if (diffDays > 85) {
    const fechaTexto = `Hasta el ${calcDateString(85)}`;
    let count = 0;

    if (!bloqueaProfundas && complementarias.obras === 'ninguna' && !esPocoEsfuerzo && count < maxAccionesPorBloque) {
      items.push({
        bloque: 'Más de 12 semanas antes',
        fechaTexto,
        accionCodigo: 'A1',
        accionNombre: CATALOGO_ACCIONES.A1.nombre,
        motivo: 'Trazar zanjas de infiltración con tiempo suficiente para captar agua en subsuelo antes de que comience la sequía.',
        confianza: 'alta',
        fuente: 'Cuestionario + Visor DEM',
      });
      count++;
    }

    if (complementarias.obras === 'mal_estado' && count < maxAccionesPorBloque) {
      items.push({
        bloque: 'Más de 12 semanas antes',
        fechaTexto,
        accionCodigo: 'A2',
        accionNombre: 'Reparación y mantenimiento de terrazas y andenes',
        motivo: 'Reforzar los muros caídos y limpiar taludes para retener el suelo ante eventos climáticos.',
        confianza: 'alta',
        fuente: 'Cuestionario del Agricultor',
      });
      count++;
    }

    if (count < maxAccionesPorBloque) {
      items.push({
        bloque: 'Más de 12 semanas antes',
        fechaTexto,
        accionCodigo: 'A7',
        accionNombre: CATALOGO_ACCIONES.A7.nombre,
        motivo: 'Acopiar y madurar compost o guano de corral para tener abono orgánico listo.',
        confianza: 'alta',
        fuente: 'Saberes Andinos + INIA',
      });
      count++;
    }
  }

  // --------------------------------------------------------------------------
  // BLOQUE 2: De 12 a 4 semanas antes (T0 - 84 a T0 - 29 días)
  // --------------------------------------------------------------------------
  if (diffDays >= 29) {
    const fechaTexto = `Del ${calcDateString(84)} al ${calcDateString(29)}`;
    let count = 0;

    // Si bloquea obras profundas o ladera media, barreras vivas
    if (count < maxAccionesPorBloque) {
      items.push({
        bloque: 'De 12 a 4 semanas antes',
        fechaTexto,
        accionCodigo: 'A4',
        accionNombre: CATALOGO_ACCIONES.A4.nombre,
        motivo: bloqueaProfundas
          ? 'Instalar barreras vivas (retama, pasto o queñua) ya que la pedregosidad impide zanjas profundas.'
          : 'Establecer barreras vivas para cortar el viento y retener humedad.',
        confianza: 'alta',
        fuente: 'Cuestionario de Suelo',
      });
      count++;
    }

    // Curvas de nivel
    if ((visor?.pendientePct ?? 0) > 8 && count < maxAccionesPorBloque) {
      items.push({
        bloque: 'De 12 a 4 semanas antes',
        fechaTexto,
        accionCodigo: 'A3',
        accionNombre: CATALOGO_ACCIONES.A3.nombre,
        motivo: `Marcar curvas de nivel con el nivel 'A' para que la pendiente de ${visor?.pendientePct ?? 14}% no lave la tierra.`,
        confianza: 'alta',
        fuente: 'Visor TerraQuipu (Pendiente)',
      });
      count++;
    }

    // Rotación A13
    const rotacion = ejecutar_A13(esenciales, complementarias);
    if (rotacion.cultivo_sugerido && count < maxAccionesPorBloque) {
      items.push({
        bloque: 'De 12 a 4 semanas antes',
        fechaTexto,
        accionCodigo: 'A13',
        accionNombre: `Rotación: Planificar siembra de ${rotacion.cultivo_sugerido}`,
        motivo: rotacion.motivo,
        confianza: rotacion.confianza,
        fuente: 'Algoritmo A13 INIA/TerraQuipu',
      });
      count++;
    }
  }

  // --------------------------------------------------------------------------
  // BLOQUE 3: De 4 a 1 semana antes (T0 - 28 a T0 - 1 día)
  // --------------------------------------------------------------------------
  if (diffDays >= 1) {
    const fechaTexto = `Del ${calcDateString(28)} al ${calcDateString(1)}`;
    let count = 0;

    // Regla obligatoria: si cobertura es suelo_desnudo, A5 es urgente
    if (esenciales.cobertura === 'suelo_desnudo' && count < maxAccionesPorBloque) {
      items.push({
        bloque: 'De 4 a 1 semana antes',
        fechaTexto,
        accionCodigo: 'A5',
        accionNombre: 'URGENTE: Cobertura del suelo con rastrojo o mulch',
        motivo: 'Chacra con suelo desnudo expuesto. Proteger de inmediato con paja o rastrojo para frenar la pérdida de humedad.',
        confianza: 'alta',
        fuente: 'Cuestionario (Suelo Desnudo)',
      });
      count++;
    } else if (count < maxAccionesPorBloque) {
      items.push({
        bloque: 'De 4 a 1 semana antes',
        fechaTexto,
        accionCodigo: 'A5',
        accionNombre: CATALOGO_ACCIONES.A5.nombre,
        motivo: 'Colocar manto de rastrojo sobre los surcos para proteger la semilla del sol y vientos secos.',
        confianza: 'alta',
        fuente: 'Buenas Prácticas Edáficas',
      });
      count++;
    }

    // A9: Ajuste de siembra o variedades
    if (count < maxAccionesPorBloque) {
      items.push({
        bloque: 'De 4 a 1 semana antes',
        fechaTexto,
        accionCodigo: 'A9',
        accionNombre: CATALOGO_ACCIONES.A9.nombre,
        motivo: 'Asegurar semilla andina de ciclo corto o tolerancia comprobada a sequía.',
        confianza: 'media',
        fuente: 'SENAMHI / INIA Alerta',
      });
      count++;
    }

    // Si cobertura es pasto -> A12 sugerencia expresa
    if (esenciales.cobertura === 'pasto' && count < maxAccionesPorBloque) {
      items.push({
        bloque: 'De 4 a 1 semana antes',
        fechaTexto,
        accionCodigo: 'A12',
        accionNombre: 'Sugerencia: Manejo y rotación de pastoreo',
        motivo: 'Evitar sobrepastoreo en la parcela para no dejar el pasto a ras del suelo antes de la temporada seca.',
        confianza: 'alta',
        fuente: 'Cuestionario (Pasto)',
      });
      count++;
    }
  }

  // --------------------------------------------------------------------------
  // BLOQUE 4: Durante la alerta (Desde T0 mientras se mantenga activa)
  // --------------------------------------------------------------------------
  {
    const fechaTexto = `Desde el ${formatDDMMYYYY(t0Date)} (Alerta Activa)`;
    let count = 0;

    // A11: Reducir labranza
    items.push({
      bloque: 'Durante la alerta',
      fechaTexto,
      accionCodigo: 'A11',
      accionNombre: CATALOGO_ACCIONES.A11.nombre,
      motivo: 'No remover el suelo innecesariamente para no acelerar la evaporación del agua profunda.',
      confianza: 'alta',
      fuente: 'Guía de Conservación de Suelos',
    });
    count++;

    // Mantenimiento de obras si existen
    if (complementarias.obras === 'buen_estado' && count < maxAccionesPorBloque) {
      items.push({
        bloque: 'Durante la alerta',
        fechaTexto,
        accionCodigo: 'A2',
        accionNombre: 'Revisión y limpieza preventiva de obras',
        motivo: 'Inspeccionar que los andenes o canales no tengan grietas ni acumulaciones que desvíen el agua.',
        confianza: 'alta',
        fuente: 'Cuestionario de Obras',
      });
      count++;
    } else if (count < maxAccionesPorBloque) {
      items.push({
        bloque: 'Durante la alerta',
        fechaTexto,
        accionCodigo: 'A6',
        accionNombre: CATALOGO_ACCIONES.A6.nombre,
        motivo: 'Mantener limpios los canales de desvío superficial para emergencias pluviales.',
        confianza: 'media',
        fuente: 'Monitoreo de Campo',
      });
      count++;
    }
  }

  return items;
}

// ============================================================================
// 7. EJECUTOR INTEGRAL DEL ASISTENTE AGROAMBIENTAL
// ============================================================================

export function ejecutarAsistenteAgroambiental(
  cuestionario: CuestionarioAgricultor,
  v2: PrediccionZonaV2,
  v3?: EstadoClimaticoV3,
  visor?: DatosVisorParcela
): ResultadoAsistenteAgroambiental {
  // 1. Clasificación de Vulnerabilidad
  const vulnerabilidad = clasificarVulnerabilidad(cuestionario, visor);

  // 2. Comparación de Clima
  const clima = compararClima(v2, v3);

  // 3. Algoritmo A13
  const a13 = ejecutar_A13(cuestionario.esenciales, cuestionario.complementarias);

  // 4. Calendario en 4 bloques
  const calendario = generarCalendarioPreventivo(cuestionario, v2, v3, visor);

  // 5. Condicional de cierre
  let condicionalFinal = '';
  if (cuestionario.esenciales.cobertura === 'suelo_desnudo') {
    condicionalFinal =
      'Esta recomendación cambiaría si cubres el suelo desnudo con rastrojo o mulch antes de iniciar la ventana crítica.';
  } else if (cuestionario.complementarias.agua === 'secano') {
    condicionalFinal =
      'Esta recomendación cambiaría si accedes a un turno de riego de auxilio o reservorio comunitario.';
  } else if (cuestionario.complementarias.obras === 'ninguna') {
    condicionalFinal =
      'Esta recomendación cambiaría si se construyen zanjas o barreras vivas antes de las lluvias.';
  } else {
    condicionalFinal =
      'Esta recomendación cambiaría si las estaciones SENAMHI confirman un cambio en la fecha de inicio del déficit hídrico.';
  }

  return {
    estadoChacra: `Estado de la chacra: Vulnerabilidad ${vulnerabilidad.nivel}. ${vulnerabilidad.motivo}`,
    nivelVulnerabilidad: vulnerabilidad.nivel,
    motivoVulnerabilidad: vulnerabilidad.motivo,
    estadoClima: `Estado del clima: ${clima.coincidencia}. ${clima.descripcion}`,
    coincidenciaClima: clima.coincidencia,
    recomendacionA13: a13,
    calendario,
    condicionalFinal,
  };
}
