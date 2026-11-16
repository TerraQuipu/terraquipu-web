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
  { clave: 'papa', texto: 'Papa', subtexto: 'Tubérculo andino demandante en nitrógeno', icono: '🥔' },
  { clave: 'olluco', texto: 'Olluco', subtexto: 'Tubérculo de porte medio', icono: '🍠' },
  { clave: 'quinua', texto: 'Quinua', subtexto: 'Grano andino resistente y balanceador', icono: '🌾' },
  { clave: 'oca', texto: 'Oca', subtexto: 'Tubérculo dulce adaptado a suelos francos', icono: '🥕' },
  { clave: 'tarwi', texto: 'Tarwi / Chocho', subtexto: 'Leguminosa fijadora de nitrógeno', icono: '🌱' },
  { clave: 'haba', texto: 'Haba', subtexto: 'Leguminosa de vaina para rotación', icono: '🫛' },
  { clave: 'otro', texto: 'Otro cultivo', subtexto: 'Especificar tipo biológico', icono: '🌿' },
];

export const TIPOS_DE_CULTIVO: Opcion[] = [
  { clave: 'tuberculo_raiz', texto: 'Tubérculo / Raíz', subtexto: 'Papa, mashua, oca, camote, etc.' },
  { clave: 'leguminosa', texto: 'Leguminosa (Vaina)', subtexto: 'Tarwi, habas, arveja, frejol (fijan nitrógeno)' },
  { clave: 'cereal_grano', texto: 'Cereal / Grano', subtexto: 'Quinua, kiwicha, cebada, maíz, avena' },
  { clave: 'hortaliza', texto: 'Hortaliza', subtexto: 'Zanahoria, cebolla, lechuga, etc.' },
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
  texto: 'Descansó (Puruma)',
  subtexto: 'La chacra reposó durante toda la campaña',
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
    texto: '¿Qué tipo de cultivo es?',
    subtexto: 'Seleccione la familia biológica para estimar nutrientes',
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
  texto: '¿Qué hay en su chacra hoy?',
  subtexto: 'Estado actual del suelo observado en terreno',
  opciones: [
    { clave: 'cultivo_creciendo', texto: 'Cultivo creciendo', subtexto: 'Plantas vivas en desarrollo en el campo', icono: '🌱' },
    { clave: 'rastrojo', texto: 'Sin cultivo, pero con rastrojo', subtexto: 'Restos secos de la cosecha anterior (paja, tallos)', icono: '🌾' },
    { clave: 'pasto', texto: 'Pasto o hierba', subtexto: 'Cobertura vegetal espontánea o pastizal', icono: '🌿' },
    { clave: 'tierra_desnuda', texto: 'Solo tierra, sin nada encima', subtexto: 'Suelo arado o expuesto a la intemperie', icono: '🟤' },
  ],
  abre: {
    cultivo_creciendo: preguntaCultivo('1a', 'esencial', '¿Qué cultivo está creciendo?'),
  },
};

export const P2: Pregunta = {
  id: '2',
  bloque: 'esencial',
  texto: '¿Cuándo piensa sembrar?',
  subtexto: 'Planificación de la próxima siembra en la parcela',
  opciones: [
    { clave: 'esta_semana', texto: 'Empiezo esta semana', subtexto: 'Trabajos de surcado y siembra inmediata', icono: '⚡' },
    { clave: 'dos_a_cuatro_semanas', texto: 'En unas 2 a 4 semanas', subtexto: 'Preparando la chacra para este mes', icono: '📅' },
    { clave: 'mas_de_un_mes', texto: 'Dentro de más de un mes', subtexto: 'Esperando lluvias o época propicia', icono: '⏳' },
    { clave: 'descansar', texto: 'Esta vez la voy a dejar descansar', subtexto: 'Descanso programado (Puruma) para recuperar suelo', icono: '💤' },
  ],
  condicion: (r) => r['1'] !== 'cultivo_creciendo',
};

export const P2B: Pregunta = preguntaCultivo(
  '2b',
  'esencial',
  '¿Qué piensa sembrar?',
  [],
  (r) => r['1'] !== 'cultivo_creciendo' && r['2'] !== undefined && r['2'] !== 'descansar'
);

export const P3: Pregunta = {
  id: '3',
  bloque: 'complementaria',
  texto: '¿Cómo recibe agua su chacra?',
  subtexto: 'Régimen hídrico disponible para esta parcela',
  opciones: [
    { clave: 'solo_lluvia', texto: 'Solo cuando llueve (Secano)', subtexto: 'Depende 100% de las precipitaciones naturales', icono: '🌧️' },
    { clave: 'lluvia_y_auxilio', texto: 'Lluvia y riego de auxilio', subtexto: 'Secano con posibilidad de regar si hay sequía prolongada', icono: '💧' },
    { clave: 'riego_permanente', texto: 'Tengo riego todo el año', subtexto: 'Canal de regadío, reservorio, aspersión o goteo', icono: '🚰' },
  ],
};

export const P4: Pregunta = {
  id: '4',
  bloque: 'complementaria',
  texto: '¿Su parcela cuenta con defensas contra las lluvias?',
  subtexto: 'Obras de conservación de suelo como andenes, zanjas de infiltración o barreras vivas',
  opciones: [
    { clave: 'buen_estado', texto: 'Sí, y están en buen estado', subtexto: 'Andenes conservados, zanjas limpias y funcionales', icono: '🛡️' },
    { clave: 'mal_estado', texto: 'Sí, pero están en mal estado', subtexto: 'Muros caídos, zanjas colmatadas o barreras ralas', icono: '⚠️' },
    { clave: 'ninguna', texto: 'No tengo defensas', subtexto: 'Ladera abierta sin zanjas ni terrazas de contención', icono: '❌' },
  ],
};

export const P5: Pregunta = {
  id: '5',
  bloque: 'complementaria',
  texto: 'Cuando cava con la lampa, ¿cómo es la tierra?',
  subtexto: 'Profundidad efectiva del suelo antes de encontrar piedras o roca madre',
  opciones: [
    { clave: 'profundo', texto: 'Puedo cavar hondo sin problema', subtexto: 'Suelo profundo (>50 cm) con tierra suelta', icono: '⛏️' },
    { clave: 'algo_piedras', texto: 'Hay algunas piedras, pero igual se cava', subtexto: 'Profundidad media con pedregosidad moderada', icono: '🪨' },
    { clave: 'muy_pedregoso', texto: 'Hay muchas piedras o topa roca pronto', subtexto: 'Suelo superficial con roca o pedregal duro', icono: '⛰️' },
  ],
};

export const P6A: Pregunta = {
  id: '6a',
  bloque: 'complementaria',
  texto: '¿Cómo es la textura de su tierra?',
  subtexto: 'Comportamiento del suelo al labrarlo',
  opciones: [
    { clave: 'suelta', texto: 'Suelta, se deshace fácil (Arenosa)', subtexto: 'No retiene agua, drena rápido y es ligera', icono: '🏜️' },
    { clave: 'suave', texto: 'Suave y buena para trabajar (Franca)', subtexto: 'Equilibrada, retiene humedad y nutrientes', icono: '🌱' },
    { clave: 'pesada', texto: 'Pesada y pegajosa (Arcillosa)', subtexto: 'Se encharca con facilidad y forma terrones duros al secar', icono: '🧱' },
  ],
};

export const P6B: Pregunta = {
  id: '6b',
  bloque: 'complementaria',
  texto: 'Prueba del Puñado: Coja tierra húmeda y apriétela en la mano',
  subtexto: '¿Qué sucede al abrir la palma de la mano?',
  opciones: [
    {
      clave: 'se_desmorona',
      texto: 'Se desmorona y raspa la piel',
      subtexto: 'Textura Arenosa: Granos ásperos, no forma bolita, drena muy rápido.',
      icono: '🪨',
    },
    {
      clave: 'bolita',
      texto: 'Se forma una bolita suave que se sostiene',
      subtexto: 'Textura Franca: Suelo ideal andino, suave al tacto y balance hídrico.',
      icono: '🌰',
    },
    {
      clave: 'barro',
      texto: 'Se pega como barro y queda marcada la mano',
      subtexto: 'Textura Arcillosa: Moldeable como plastilina, pegajosa y retiene mucha agua.',
      icono: '🧱',
    },
  ],
};

export const P6: Pregunta = {
  id: '6',
  bloque: 'complementaria',
  texto: '¿Sabe qué tipo de tierra tiene su chacra?',
  subtexto: 'Conocimiento empírico de la textura edáfica',
  opciones: [
    { clave: 'conoce', texto: 'Sí, la conozco', subtexto: 'Identifico si es suelta, suave o pesada', icono: '🧠' },
    { clave: 'no_seguro', texto: 'No estoy seguro (Hacer prueba del puñado)', subtexto: 'Guía práctica táctil en 10 segundos', icono: '✋' },
  ],
  abre: {
    conoce: P6A,
    no_seguro: P6B,
  },
};

export const P7A: Pregunta = preguntaCultivo(
  '7a',
  'complementaria',
  '¿Qué sembró en esta chacra la campaña anterior?',
  [DESCANSO]
);

export const P7B: Pregunta = preguntaCultivo(
  '7b',
  'complementaria',
  '¿Qué sembró la penúltima vez? (Hace dos campañas)',
  [DESCANSO]
);

export const P8: Pregunta = {
  id: '8',
  bloque: 'extra',
  texto: '¿Cuántas personas pueden trabajar en la chacra?',
  subtexto: 'Mano de obra familiar o ayni disponible para labores',
  opciones: [
    { clave: 'solo_yo', texto: 'Solo yo', subtexto: 'Trabajo individual', icono: '👤' },
    { clave: 'dos_o_tres', texto: '2 o 3 personas', subtexto: 'Apoyo familiar cercano', icono: '👥' },
    { clave: 'cuatro_o_mas', texto: '4 o más personas', subtexto: 'Familia extendida o faena comunal / ayni', icono: '👨‍👩‍👧‍👦' },
  ],
};

export const P9: Pregunta = {
  id: '9',
  bloque: 'extra',
  texto: '¿Cuánto tiempo puede dedicar cada semana?',
  subtexto: 'Disponibilidad para mantenimiento, deshierbe y aporque',
  opciones: [
    { clave: 'poco', texto: 'Poco, algunas horas', subtexto: 'Visitas puntuales fines de semana', icono: '⏱️' },
    { clave: 'algo', texto: 'Algo, uno o dos días por semana', subtexto: 'Dedicación a tiempo parcial', icono: '🗓️' },
    { clave: 'bastante', texto: 'Bastante, tres días o más', subtexto: 'Dedicación continua a la chacra', icono: '💪' },
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
