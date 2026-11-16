/**
 * Motor del Árbol Dinámico de Preguntas - TerraQuipu
 * Microcuenca Piuray-Qorimarca y zonas agroecológicas altoandinas.
 *
 * Implementa la lógica formal de Cuestionario_en_phyton.ipynb:
 * - Preguntas estructuradas por bloques: esencial, complementaria, extra.
 * - Condiciones dinámicas de visibilidad y subpreguntas anidadas (abre).
 * - Componentes reutilizables de cultivo con desglose botánico si es "otro".
 * - Construcción y normalización de parámetros agronómicos.
 * - Reconciliación de verdades de campo (el agricultor tiene la verdad absoluta sobre el satélite).
 */

export interface Opcion {
  clave: string;
  texto: string;
  subtexto?: string;
  icono?: string;
}

export type BloquePregunta = 'esencial' | 'complementaria' | 'extra';

export interface Pregunta {
  id: string;
  bloque: BloquePregunta;
  texto: string;
  subtexto?: string;
  opciones: Opcion[];
  condicion?: (respuestas: Record<string, string>) => boolean;
  abre?: Record<string, Pregunta>;
}

// ----------------------------------------------------------------------
// Catálogo de Cultivos y Tipos Botánicos
// ----------------------------------------------------------------------
export const CULTIVOS: Opcion[] = [
  { clave: 'papa', texto: 'Native Andean Potato', subtexto: 'High nitrogen-demand Andean tuber', icono: '🥔' },
  { clave: 'olluco', texto: 'Olluco (Ullucus tuberosus)', subtexto: 'Rustic mid-tier Andean tuber', icono: '🍠' },
  { clave: 'quinua', texto: 'Real Andean Quinoa', subtexto: 'Resilient and nutrient-balancing Andean grain', icono: '🌾' },
  { clave: 'oca', texto: 'Oca (Oxalis tuberosa)', subtexto: 'Sweet highland tuber adapted to loamy soils', icono: '🥕' },
  { clave: 'tarwi', texto: 'Tarwi / Andean Lupin', subtexto: 'Biological nitrogen-fixing legume', icono: '🌱' },
  { clave: 'haba', texto: 'Broad Bean (Vicia faba)', subtexto: 'Pod legume for soil restoration and rotation', icono: '🫛' },
  { clave: 'otro', texto: 'Other crop', subtexto: 'Specify botanical family', icono: '🌿' },
];

export const TIPOS_DE_CULTIVO: Opcion[] = [
  { clave: 'tuberculo_raiz', texto: 'Tuber / Root Crop', subtexto: 'Potato, mashua, oca, sweet potato, etc.' },
  { clave: 'leguminosa', texto: 'Legume (Pod Crop)', subtexto: 'Tarwi, broad beans, peas, beans (fix atmospheric N)' },
  { clave: 'cereal_grano', texto: 'Cereal / Grain Crop', subtexto: 'Quinoa, kiwicha, barley, corn, oats' },
  { clave: 'hortaliza', texto: 'Vegetable / Green Crop', subtexto: 'Carrot, onion, lettuce, etc.' },
];

export const TIPO_POR_CULTIVO: Record<string, string> = {
  papa: 'tuberculo_raiz',
  olluco: 'tuberculo_raiz',
  oca: 'tuberculo_raiz',
  tarwi: 'leguminosa',
  haba: 'leguminosa',
  quinua: 'cereal_grano',
  maiz: 'cereal_grano',
  cebada: 'cereal_grano',
};

export const DESCANSO: Opcion = {
  clave: 'descanso',
  texto: 'Fallow / Soil Rest (Puruma)',
  subtexto: 'Parcel remained in rest throughout the campaign',
  icono: '💤',
};

export function preguntaCultivo(
  id: string,
  bloque: BloquePregunta,
  texto: string,
  extra: Opcion[] = [],
  condicion: (r: Record<string, string>) => boolean = () => true
): Pregunta {
  const tipo: Pregunta = {
    id: `${id}_tipo`,
    bloque,
    texto: 'What biological crop family is it?',
    subtexto: 'Select botanical family to compute nutrient requirements',
    opciones: TIPOS_DE_CULTIVO,
  };

  return {
    id,
    bloque,
    texto,
    opciones: [...CULTIVOS, ...extra],
    condicion,
    abre: {
      otro: tipo,
    },
  };
}

// ----------------------------------------------------------------------
// Árbol Completo de Preguntas
// ----------------------------------------------------------------------

export const P1: Pregunta = {
  id: '1',
  bloque: 'esencial',
  texto: 'What is currently on your parcel?',
  subtexto: 'Current ground-truth soil condition observed in-situ',
  opciones: [
    { clave: 'cultivo_creciendo', texto: 'Growing crop', subtexto: 'Actively developing live vegetation in the field', icono: '🌱' },
    { clave: 'rastrojo', texto: 'No crop, but crop residue (mulch)', subtexto: 'Dry post-harvest biomass (stover, straw, stubble)', icono: '🌾' },
    { clave: 'pasto', texto: 'Pasture or natural grassland', subtexto: 'Spontaneous vegetative cover or managed rangeland', icono: '🌿' },
    { clave: 'tierra_desnuda', texto: 'Bare soil, completely exposed', subtexto: 'Tilled or uncovered soil vulnerable to erosion', icono: '🟤' },
  ],
  abre: {
    cultivo_creciendo: preguntaCultivo('1a', 'esencial', 'What crop is actively growing?'),
  },
};

export const P2: Pregunta = {
  id: '2',
  bloque: 'esencial',
  texto: 'When do you plan to sow?',
  subtexto: 'Projected planting timeline for this parcel',
  opciones: [
    { clave: 'esta_semana', texto: 'Starting this week', subtexto: 'Immediate furrowing and sowing operations', icono: '⚡' },
    { clave: 'dos_a_cuatro_semanas', texto: 'In 2 to 4 weeks', subtexto: 'Preparing seedbed for this month', icono: '📅' },
    { clave: 'mas_de_un_mes', texto: 'In more than one month', subtexto: 'Waiting for seasonal rains or optimal window', icono: '⏳' },
    { clave: 'descansar', texto: 'Letting the soil rest this campaign', subtexto: 'Planned fallow (Puruma) to regenerate soil health', icono: '💤' },
  ],
  condicion: (r) => r['1'] !== 'cultivo_creciendo',
};

export const P2B: Pregunta = preguntaCultivo(
  '2b',
  'esencial',
  'What crop do you plan to sow?',
  [],
  (r) => r['1'] !== 'cultivo_creciendo' && r['2'] !== undefined && r['2'] !== 'descansar'
);

export const P3: Pregunta = {
  id: '3',
  bloque: 'complementaria',
  texto: 'How does your parcel receive water?',
  subtexto: 'Hydrological regime available for this parcel',
  opciones: [
    { clave: 'solo_lluvia', texto: 'Rainfed only (Secano)', subtexto: '100% dependent on natural precipitation', icono: '🌧️' },
    { clave: 'lluvia_y_auxilio', texto: 'Rainfed with emergency irrigation', subtexto: 'Rainfed with occasional turn during prolonged dry spells', icono: '💧' },
    { clave: 'riego_permanente', texto: 'Permanent irrigation year-round', subtexto: 'Gravity canal, reservoir, sprinkler or drip system', icono: '🚰' },
  ],
};

export const P4: Pregunta = {
  id: '4',
  bloque: 'complementaria',
  texto: 'Does your parcel have soil conservation defenses against heavy rains?',
  subtexto: 'Terraces (andenes), infiltration trenches, or living vegetative barriers',
  opciones: [
    { clave: 'buen_estado', texto: 'Yes, in good operational condition', subtexto: 'Maintained terraces, clean functional trenches', icono: '🛡️' },
    { clave: 'mal_estado', texto: 'Yes, but degraded or clogged', subtexto: 'Collapsed retaining walls, silted infiltration trenches', icono: '⚠️' },
    { clave: 'ninguna', texto: 'No defenses installed', subtexto: 'Open hillside without containment terraces or trenches', icono: '❌' },
  ],
};

export const P5: Pregunta = {
  id: '5',
  bloque: 'complementaria',
  texto: 'When digging with a spade or pick, what is the soil depth?',
  subtexto: 'Effective rooting depth before striking stones or bedrock',
  opciones: [
    { clave: 'profundo', texto: 'Deep topsoil (>50 cm) without obstruction', subtexto: 'Deep, loose, fertile rooting layer', icono: '⛏️' },
    { clave: 'algo_piedras', texto: 'Moderate stoniness, but easily workable', subtexto: 'Medium depth (20 - 50 cm) with scattered pebbles', icono: '🪨' },
    { clave: 'muy_pedregoso', texto: 'Abundant rock or strikes bedrock quickly', subtexto: 'Shallow soil (<20 cm) over rocky substrate', icono: '⛰️' },
  ],
};

export const P6A: Pregunta = {
  id: '6a',
  bloque: 'complementaria',
  texto: 'What is the texture of your soil?',
  subtexto: 'Soil behavior during field tillage',
  opciones: [
    { clave: 'suelta', texto: 'Loose, easily crumbles (Sandy)', subtexto: 'Low water retention, drains rapidly, light texture', icono: '🏜️' },
    { clave: 'suave', texto: 'Smooth and fertile to work (Loam)', subtexto: 'Balanced, retains moisture and nutrients', icono: '🌱' },
    { clave: 'pesada', texto: 'Heavy and sticky (Clay)', subtexto: 'Prone to waterlogging, forms hard clods when dry', icono: '🧱' },
  ],
};

export const P6B: Pregunta = {
  id: '6b',
  bloque: 'complementaria',
  texto: 'Hand Squeeze Test: Take moist topsoil and squeeze firmly in your palm',
  subtexto: 'What happens when you open your palm?',
  opciones: [
    {
      clave: 'se_desmorona',
      texto: 'Crumbles immediately and grittily scratches skin',
      subtexto: 'Sandy texture: Coarse grains, cannot form ball, drains rapidly.',
      icono: '🪨',
    },
    {
      clave: 'bolita',
      texto: 'Forms a cohesive, soft ball that holds shape',
      subtexto: 'Loam texture: Ideal Andean agricultural soil with balanced hydrology.',
      icono: '🌰',
    },
    {
      clave: 'barro',
      texto: 'Sticks like dough and stains the hand',
      subtexto: 'Clay texture: Highly moldable, sticky, holds heavy moisture.',
      icono: '🧱',
    },
  ],
};

export const P6: Pregunta = {
  id: '6',
  bloque: 'complementaria',
  texto: 'Do you know your parcel soil texture?',
  subtexto: 'Empirical knowledge of edaphic texture',
  opciones: [
    { clave: 'conoce', texto: 'Yes, I know it well', subtexto: 'Can identify whether it is sandy, loamy, or clayey', icono: '🧠' },
    { clave: 'no_seguro', texto: 'Not sure (Conduct Hand Squeeze Test)', subtexto: '10-second practical in-situ field guide', icono: '✋' },
  ],
  abre: {
    conoce: P6A,
    no_seguro: P6B,
  },
};

export const P7A: Pregunta = preguntaCultivo(
  '7a',
  'complementaria',
  'What did you cultivate in this parcel last campaign?',
  [DESCANSO]
);

export const P7B: Pregunta = preguntaCultivo(
  '7b',
  'complementaria',
  'What was cultivated two campaigns ago?',
  [DESCANSO]
);

export const P8: Pregunta = {
  id: '8',
  bloque: 'extra',
  texto: 'How many people can work on the parcel?',
  subtexto: 'Available family labor or communal ayni support',
  opciones: [
    { clave: 'solo_yo', texto: 'Only myself', subtexto: 'Individual farm labor', icono: '👤' },
    { clave: 'dos_o_tres', texto: '2 or 3 people', subtexto: 'Close family support', icono: '👥' },
    { clave: 'cuatro_o_mas', texto: '4 or more people', subtexto: 'Extended family or communal faena / ayni', icono: '👨‍👩‍👧‍👦' },
  ],
};

export const P9: Pregunta = {
  id: '9',
  bloque: 'extra',
  texto: 'How much time can you dedicate weekly?',
  subtexto: 'Availability for maintenance, weeding, and hilling',
  opciones: [
    { clave: 'poco', texto: 'A few hours per week', subtexto: 'Weekend or occasional visits', icono: '⏱️' },
    { clave: 'algo', texto: '1 or 2 days per week', subtexto: 'Part-time farm dedication', icono: '🗓️' },
    { clave: 'bastante', texto: '3 days or more', subtexto: 'Full-time dedicated field management', icono: '💪' },
  ],
};

export const PREGUNTAS_RAIZ: Pregunta[] = [P1, P2, P2B, P3, P4, P5, P6, P7A, P7B, P8, P9];

// ----------------------------------------------------------------------
// Mapeos a Parámetros Agronómicos
// ----------------------------------------------------------------------
export const MAPA_COBERTURA: Record<string, string> = {
  cultivo_creciendo: 'cultivo',
  rastrojo: 'rastrojo',
  pasto: 'pasto',
  tierra_desnuda: 'suelo_desnudo',
};

export const MAPA_AGUA: Record<string, string> = {
  solo_lluvia: 'secano',
  lluvia_y_auxilio: 'riego_auxilio',
  riego_permanente: 'riego_permanente',
};

export const MAPA_TEXTURA: Record<string, string> = {
  suelta: 'arenosa',
  se_desmorona: 'arenosa',
  suave: 'franca',
  bolita: 'franca',
  pesada: 'arcillosa',
  barro: 'arcillosa',
};

export interface CultivoParametro {
  cultivo: string;
  tipo: string | null;
}

export function resolverCultivoParametro(respuestas: Record<string, string>, id: string): CultivoParametro | null {
  const clave = respuestas[id];
  if (!clave) return null;
  if (clave === 'descanso') {
    return { cultivo: 'descanso', tipo: null };
  }
  if (clave === 'otro') {
    return { cultivo: 'otro', tipo: respuestas[`${id}_tipo`] || null };
  }
  return {
    cultivo: clave,
    tipo: TIPO_POR_CULTIVO[clave] || 'tuberculo_raiz',
  };
}

export interface ParametrosConstruidos {
  esenciales: {
    cobertura: string;
    cultivo_actual: CultivoParametro | null;
    siembra: string | null;
    cultivo_proximo: CultivoParametro | null;
  };
  complementarias: {
    agua: string;
    obras: string;
    profundidad: string;
    bloquea_obras_profundas: boolean;
    textura: {
      clase: string;
      origen: 'declarado' | 'prueba_del_punado';
    };
    historial: {
      vez_anterior: CultivoParametro | null;
      antes_de_esa: CultivoParametro | null;
    };
  };
  factores_extra: {
    personas: string;
    tiempo_semanal: string;
  };
}

export function construir_parametros(respuestas: Record<string, string>): ParametrosConstruidos {
  const r1 = respuestas['1'] || 'rastrojo';
  const cobertura = MAPA_COBERTURA[r1] || 'suelo_desnudo';

  let cultivoActual: CultivoParametro | null = null;
  let siembra: string | null = null;
  let cultivoProximo: CultivoParametro | null = null;

  if (r1 === 'cultivo_creciendo') {
    cultivoActual = resolverCultivoParametro(respuestas, '1a');
  } else {
    siembra = respuestas['2'] || 'dos_a_cuatro_semanas';
    if (siembra === 'descansar') {
      cultivoProximo = { cultivo: 'descanso', tipo: null };
    } else {
      cultivoProximo = resolverCultivoParametro(respuestas, '2b');
    }
  }

  const texturaClave = respuestas['6a'] || respuestas['6b'] || 'bolita';
  const claseTextura = MAPA_TEXTURA[texturaClave] || 'franca';
  const origenTextura = respuestas['6'] === 'conoce' ? 'declarado' : 'prueba_del_punado';

  const profundidad = respuestas['5'] || 'algo_piedras';

  return {
    esenciales: {
      cobertura,
      cultivo_actual: cultivoActual,
      siembra,
      cultivo_proximo: cultivoProximo,
    },
    complementarias: {
      agua: MAPA_AGUA[respuestas['3']] || 'secano',
      obras: respuestas['4'] || 'ninguna',
      profundidad,
      bloquea_obras_profundas: profundidad === 'muy_pedregoso',
      textura: {
        clase: claseTextura,
        origen: origenTextura,
      },
      historial: {
        vez_anterior: resolverCultivoParametro(respuestas, '7a'),
        antes_de_esa: resolverCultivoParametro(respuestas, '7b'),
      },
    },
    factores_extra: {
      personas: respuestas['8'] || 'dos_o_tres',
      tiempo_semanal: respuestas['9'] || 'algo',
    },
  };
}

export interface Discrepancia {
  agricultor: any;
  externo: any;
}

export function reconciliar_esenciales(
  del_agricultor: Record<string, any>,
  externos: Record<string, any>
): { finales: Record<string, any>; discrepancias: Record<string, Discrepancia> } {
  const finales: Record<string, any> = { ...externos };
  const discrepancias: Record<string, Discrepancia> = {};

  for (const [clave, valor] of Object.entries(del_agricultor)) {
    if (valor !== undefined && valor !== null) {
      if (clave in externos && externos[clave] !== valor) {
        discrepancias[clave] = {
          agricultor: valor,
          externo: externos[clave],
        };
      }
      finales[clave] = valor;
    }
  }

  return { finales, discrepancias };
}

/**
 * Retorna la lista secuencial y dinámica de preguntas visibles
 * según las respuestas dadas hasta el momento.
 */
export function obtenerPreguntasActivas(respuestas: Record<string, string>): Pregunta[] {
  const activas: Pregunta[] = [];

  function procesar(p: Pregunta) {
    if (p.condicion && !p.condicion(respuestas)) {
      return;
    }
    activas.push(p);

    const valorSeleccionado = respuestas[p.id];
    if (valorSeleccionado && p.abre && p.abre[valorSeleccionado]) {
      procesar(p.abre[valorSeleccionado]);
    }
  }

  for (const p of PREGUNTAS_RAIZ) {
    procesar(p);
  }

  return activas;
}
