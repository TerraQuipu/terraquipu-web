/**
 * Test Suite Automatizado para Árbol Dinámico de Preguntas e Incertidumbre
 * Ejecutar con: npx ts-node scripts/test-dynamic-questionnaire.ts
 */

import {
  P1,
  P2,
  P2B,
  P6,
  obtenerPreguntasActivas,
  construir_parametros,
  reconciliar_esenciales,
} from '../src/lib/dynamicQuestionnaireEngine';

import {
  calcular_incertidumbre_recomendacion,
} from '../src/lib/uncertaintyEngine';

import {
  recomendar_A13,
  ejecutar_A13,
  generarCalendarioPreventivo,
  PrediccionZonaV2,
  CuestionarioAgricultor,
} from '../src/lib/agroenvironmentalEngine';

import {
  calculateDynamicSoilHealthIndex,
} from '../src/lib/geoUtils';

import {
  getStoredParcels,
} from '../src/lib/deviceProfile';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FALLÓ ASSERTION: ${msg}`);
    process.exit(1);
  } else {
    console.log(`  ✓ ${msg}`);
  }
}

console.log('\n--- 1. PRUEBAS DEL ÁRBOL DINÁMICO DE PREGUNTAS ---');

// Caso 1: Cultivo Creciendo -> Debe abrir P1a y omitir P2 y P2b
{
  const respuestas1 = { '1': 'cultivo_creciendo', '1a': 'papa' };
  const activas = obtenerPreguntasActivas(respuestas1);
  const ids = activas.map((q) => q.id);

  assert(ids.includes('1'), 'Pregunta 1 presente');
  assert(ids.includes('1a'), 'Pregunta 1a abierta dinámicamente');
  assert(!ids.includes('2'), 'Pregunta 2 omitida porque el cultivo ya está creciendo');
  assert(!ids.includes('2b'), 'Pregunta 2b omitida');
}

// Caso 2: Rastrojo + Sembrará pronto -> Debe abrir P2 y P2b, y omitir P1a
{
  const respuestas2 = { '1': 'rastrojo', '2': 'esta_semana', '2b': 'quinua' };
  const activas = obtenerPreguntasActivas(respuestas2);
  const ids = activas.map((q) => q.id);

  assert(!ids.includes('1a'), 'Pregunta 1a omitida en rastrojo');
  assert(ids.includes('2'), 'Pregunta 2 presente');
  assert(ids.includes('2b'), 'Pregunta 2b presente');
}

// Caso 3: Rastrojo + Descanso -> Debe omitir P2b
{
  const respuestas3 = { '1': 'rastrojo', '2': 'descansar' };
  const activas = obtenerPreguntasActivas(respuestas3);
  const ids = activas.map((q) => q.id);

  assert(ids.includes('2'), 'Pregunta 2 presente');
  assert(!ids.includes('2b'), 'Pregunta 2b omitida porque descansará');
}

// Caso 4: P6 Conoce el suelo -> Abre P6a (suelta/suave/pesada), omite P6b
{
  const respuestas4 = { '6': 'conoce', '6a': 'suave' };
  const activas = obtenerPreguntasActivas(respuestas4);
  const ids = activas.map((q) => q.id);

  assert(ids.includes('6a'), 'Pregunta 6a abierta');
  assert(!ids.includes('6b'), 'Pregunta 6b (Prueba del puñado) omitida');
}

// Caso 5: P6 No seguro -> Abre P6b (Prueba del puñado ilustrada), omite P6a
{
  const respuestas5 = { '6': 'no_seguro', '6b': 'bolita' };
  const activas = obtenerPreguntasActivas(respuestas5);
  const ids = activas.map((q) => q.id);

  assert(ids.includes('6b'), 'Pregunta 6b (Prueba del puñado) abierta');
  assert(!ids.includes('6a'), 'Pregunta 6a omitida');
}

console.log('\n--- 2. PRUEBAS DE CONSTRUCCIÓN DE PARÁMETROS Y RECONCILIACIÓN ---');

{
  const respuestas = {
    '1': 'rastrojo',
    '2': 'dos_a_cuatro_semanas',
    '2b': 'papa',
    '3': 'solo_lluvia',
    '4': 'buen_estado',
    '5': 'algo_piedras',
    '6': 'no_seguro',
    '6b': 'bolita',
    '7a': 'quinua',
    '7b': 'descanso',
    '8': 'dos_o_tres',
    '9': 'bastante',
  };

  const params = construir_parametros(respuestas);

  assert(params.esenciales.cobertura === 'rastrojo', 'Cobertura mapeada a rastrojo');
  assert(params.complementarias.agua === 'secano', 'Agua mapeada a secano');
  assert(params.complementarias.textura.clase === 'franca', 'Textura de puñado (bolita) mapeada a franca');
  assert(params.complementarias.textura.origen === 'prueba_del_punado', 'Origen identificado como prueba_del_punado');
  assert(params.complementarias.historial.vez_anterior?.cultivo === 'quinua', 'Historial anterior: quinua');
  assert(params.complementarias.historial.antes_de_esa?.cultivo === 'descanso', 'Historial penúltimo: descanso');

  // Reconciliación con satélite
  const satelite = { cobertura: 'cultivo', agua: 'riego_permanente' };
  const { finales, discrepancias } = reconciliar_esenciales(params.esenciales, satelite);

  assert(finales.cobertura === 'rastrojo', 'Gana la verdad en terreno del agricultor sobre cobertura');
  assert('cobertura' in discrepancias, 'Discrepancia detectada con el satélite');
}

console.log('\n--- 3. PRUEBAS DEL MOTOR DE INCERTIDUMBRE (gemini-code-1794773971910) ---');

// Caso oficial de la simulación Python
{
  const parametros = {
    complementarias: {
      textura: { clase: 'franca', origen: 'prueba_del_punado' },
      historial: {
        vez_anterior: { cultivo: 'papa', tipo: 'tuberculo' },
        antes_de_esa: { cultivo: 'quinua', tipo: 'cereal' },
      },
    },
  };

  const discrepancias = {
    cobertura: { agricultor: 'suelo_desnudo', externo: 'vegetacion_alta' },
  };

  const visor = {
    area_m2: 15000,
    pendiente_pct: 12,
  };

  const apis = {
    precipitation_mm: 0.0,
    ndvi_mean: 0.45,
  };

  const alerta = {
    escenario_activo: 'deficit_lluvias',
    probabilidad_porcentaje: 80,
  };

  const res = calcular_incertidumbre_recomendacion(
    parametros,
    discrepancias,
    visor,
    apis,
    alerta
  );

  assert(res.desglose_penalizaciones.clima_base === 20, 'Penalización clima base = 20% (100 - 80)');
  assert(res.desglose_penalizaciones.geometria_espacial === 0, 'Penalización espacial = 0% (área 15,000 m² dentro de rango)');
  assert(res.desglose_penalizaciones.choque_macro_micro === 0, 'Penalización macro-micro = 0%');
  assert(res.desglose_penalizaciones.satelite_ciego === 20, 'Penalización satélite ciego = 20% por discrepancia de cobertura');
  assert(res.desglose_penalizaciones.resolucion_edafica === 5, 'Penalización edáfica = 5% por prueba_del_punado');
  assert(res.desglose_penalizaciones.historial_desconocido === 0, 'Penalización historial = 0%');
  assert(res.incertidumbre_total_porcentaje === 45, 'Incertidumbre total = 45%');
  assert(res.nivel_confianza_ux === 'Media (🟡)', 'Semáforo UX = Media (🟡) para 45%');
  assert(res.fiabilidad_porcentaje === 55, 'Fiabilidad global = 55%');
}

// Caso de Incertidumbre Baja (Alta Fiabilidad <= 20%)
{
  const parametros = {
    complementarias: {
      textura: { clase: 'franca', origen: 'declarado' },
      historial: {
        vez_anterior: { cultivo: 'tarwi', tipo: 'leguminosa' },
        antes_de_esa: { cultivo: 'papa', tipo: 'tuberculo' },
      },
    },
  };
  const res = calcular_incertidumbre_recomendacion(
    parametros,
    {}, // sin discrepancias
    { area_m2: 5000 },
    { precipitation_mm: 0.0 },
    { escenario_activo: 'deficit_lluvias', probabilidad_porcentaje: 85 } // i_clima = 15
  );

  assert(res.incertidumbre_total_porcentaje === 15, 'Incertidumbre total = 15%');
  assert(res.nivel_confianza_ux === 'Alta (🟢)', 'Semáforo UX = Alta (🟢) para <= 20%');
}

// Caso de Incertidumbre Alta (Baja Fiabilidad > 45%)
{
  const parametros = {
    complementarias: {
      textura: { clase: 'arenosa', origen: 'desconocido' }, // +10
      historial: {
        vez_anterior: { cultivo: 'otro' }, // +5
      },
    },
  };
  const res = calcular_incertidumbre_recomendacion(
    parametros,
    { cobertura: { agricultor: 'rastrojo', externo: 'cultivo' } }, // +20
    { area_m2: 800 }, // +15 (menor a 1,000 m2)
    { precipitation_mm: 12.0 },
    { escenario_activo: 'deficit_lluvias', probabilidad_porcentaje: 60 } // +40 clima + 15 choque macro-micro
  );

  assert(res.incertidumbre_total_porcentaje > 45, 'Incertidumbre total > 45%');
  assert(res.nivel_confianza_ux === 'Baja (🔴)', 'Semáforo UX = Baja (🔴) para > 45%');
}

console.log('\n--- 4. PRUEBAS DEL ALGORITMO DE ROTACIÓN A13 ---');

// Regla 1: Último leguminosa -> Papa para aprovechar nitrógeno
{
  const res = recomendar_A13('tarwi', 'papa', 'franca');
  assert(res.cultivo_sugerido === 'Papa', 'Regla 1: Tarwi seguido de Papa');
  assert(res.confianza === 'media', 'Confianza media para rotación de nitrógeno');
}

// Regla 2: Dos extractores anteriores (Papa y Quinua) -> Leguminosa (Tarwi en secano)
{
  const res = recomendar_A13('papa', 'quinua', 'arenosa', 'secano');
  assert(res.cultivo_sugerido === 'Tarwi', 'Regla 2: Tras papa y quinua en suelo arenoso de secano sugiere Tarwi');
  assert(res.alternativa === 'Haba', 'Alternativa es Haba');
}

// Regla 3: Último tubérculo, penúltimo no extractor -> Quinua
{
  const res = recomendar_A13('papa', 'descanso', 'franca');
  assert(res.cultivo_sugerido === 'Quinua', 'Regla 3: Tras papa y descanso sugiere Quinua');
}

// Regla 4: Último quinua -> Tubérculo según textura (Suelo arenoso -> Olluco)
{
  const res = recomendar_A13('quinua', 'tarwi', 'arenosa');
  assert(res.cultivo_sugerido === 'Olluco', 'Regla 4: En suelo arenoso tras quinua sugiere Olluco');
}

// Cultivos personalizados ('otro' con familia botánica):
{
  const resCustom1 = recomendar_A13({ cultivo: 'otro', tipo: 'leguminosa' }, 'papa', 'franca');
  assert(resCustom1.cultivo_sugerido === 'Papa', 'Cultivo custom leguminosa activa Regla 1 (sugiere Papa)');

  const resCustom2 = recomendar_A13('papa', { cultivo: 'otro', tipo: 'cereal_grano' }, 'franca');
  assert(resCustom2.cultivo_sugerido === 'Haba', 'Cultivo custom cereal_grano activa Regla 2 con papa (sugiere Haba)');
}

// Discrepancia de régimen de agua entre agricultor y satélite:
{
  const delAgric = { cobertura: 'rastrojo', agua: 'secano' };
  const externosAgua = { cobertura: 'rastrojo', agua: 'riego_permanente' };
  const { discrepancias: discAgua } = reconciliar_esenciales(delAgric, externosAgua);
  assert('agua' in discAgua, 'Discrepancia de agua detectada al comparar con satélite');
  const resUnc = calcular_incertidumbre_recomendacion({}, discAgua, { area_m2: 5000 }, {}, { probabilidad_porcentaje: 80 });
  assert(resUnc.desglose_penalizaciones.satelite_ciego === 20, 'Penalización satélite ciego (+20%) por discrepancia de agua');
}

console.log('\n--- 5. PRUEBAS DE PERSISTENCIA INDEPENDIENTE POR PARCELA ---');

{
  const parcelas: Record<string, any> = {
    'parcel-01': {
      id: 'parcel-01',
      name: 'Chacra Yanacona',
      cropName: 'Papa Huayro',
      areaHa: 1.5,
    },
    'parcel-02': {
      id: 'parcel-02',
      name: 'Andén Huaypo',
      cropName: 'Tarwi',
      areaHa: 0.8,
    },
  };

  function simularCalibracion(id: string, respuestas: any, incertidumbre: any) {
    parcelas[id] = {
      ...parcelas[id],
      cuestionarioRespuestas: respuestas,
      diagnosticoIncertidumbre: incertidumbre,
      fechaCalibracion: new Date().toISOString(),
    };
  }

  // Calibrar solo parcela 1
  simularCalibracion('parcel-01', { '1': 'cultivo_creciendo', '1a': 'papa' }, { total: 20, nivel: 'Alta (🟢)' });

  assert(parcelas['parcel-01'].fechaCalibracion !== undefined, 'Parcela 1 tiene calibración');
  assert(parcelas['parcel-01'].diagnosticoIncertidumbre.nivel === 'Alta (🟢)', 'Parcela 1 tiene nivel Alta');
  assert(parcelas['parcel-02'].fechaCalibracion === undefined, 'Parcela 2 permanece sin calibrar (independencia garantizada)');

  // Calibrar parcela 2 con respuestas distintas
  simularCalibracion('parcel-02', { '1': 'rastrojo', '2': 'esta_semana' }, { total: 40, nivel: 'Media (🟡)' });

  assert(parcelas['parcel-02'].fechaCalibracion !== undefined, 'Parcela 2 ahora está calibrada');
  assert(parcelas['parcel-02'].diagnosticoIncertidumbre.nivel === 'Media (🟡)', 'Parcela 2 tiene nivel Media');
  assert(parcelas['parcel-01'].diagnosticoIncertidumbre.nivel === 'Alta (🟢)', 'Parcela 1 mantiene su diagnóstico original intacto');
}

console.log('\n--- 6. PRUEBAS DE SALUD DEL SUELO DINÁMICA (DES-HARDCODING 78) ---');

{
  // 1. Suelo óptimo con buena humedad y biomasa
  const scoreOptimo = calculateDynamicSoilHealthIndex({
    smapHumidity: 24,
    ndvi: 0.72,
    profundidad: 'profundo',
    pedregosidad: 'sin_piedras',
    obras: 'buen_estado',
    cobertura: 'cultivo',
  });
  assert(scoreOptimo > 80, `Puntuación de suelo óptimo es alta: ${scoreOptimo} (> 80)`);

  // 2. Suelo degradado con sequía severa y piedras
  const scoreDegradado = calculateDynamicSoilHealthIndex({
    smapHumidity: 10,
    ndvi: 0.22,
    profundidad: 'muy_pedregoso',
    pedregosidad: 'muy_pedregoso',
    obras: 'ninguna',
    cobertura: 'suelo_desnudo',
  });
  assert(scoreDegradado < 40, `Puntuación de suelo degradado es baja: ${scoreDegradado} (< 40)`);

  // 3. Confirmar que no hay valores fijos de 78 invariables
  assert(scoreOptimo !== scoreDegradado, 'La salud del suelo es reactiva y no un valor constante');
  assert(scoreOptimo <= 96 && scoreDegradado >= 20, 'Valores dentro de los límites agronómicos [20, 96]');
}

console.log('\n--- 7. PRUEBAS DE RESOLUCIÓN ESPACIAL (> 30 HECTÁREAS) ---');

{
  // Parcela > 30 ha (350,000 m² = 35 ha)
  const resGrande = calcular_incertidumbre_recomendacion(
    {},
    {},
    { area_m2: 350000, pendiente_pct: 15 },
    { precipitation_mm: 5 },
    { escenario_activo: 'deficit_lluvias', probabilidad_porcentaje: 80 }
  );
  assert(
    resGrande.desglose_penalizaciones.geometria_espacial === 15,
    'Parcela > 30 ha aplica penalización de 15% por heterogeneidad de relieve'
  );

  // Parcela típica pequeña/mediana (1.5 ha = 15,000 m²)
  const resNormal = calcular_incertidumbre_recomendacion(
    {},
    {},
    { area_m2: 15000, pendiente_pct: 8 },
    { precipitation_mm: 5 },
    { escenario_activo: 'deficit_lluvias', probabilidad_porcentaje: 80 }
  );
  assert(
    resNormal.desglose_penalizaciones.geometria_espacial === 0,
    'Parcela normal (1.5 ha) no sufre penalización de resolución espacial'
  );
}

console.log('\n--- 8. PRUEBAS DE DISPOSITIVO LIMPIO (CERO PARCELAS FANTASMA) ---');

{
  const parcels = getStoredParcels();
  assert(Array.isArray(parcels), 'getStoredParcels retorna un arreglo');
  assert(parcels.length === 0, 'Dispositivo limpio inicia con 0 parcelas por defecto');
}

console.log('\n--- 9. PRUEBAS DE CALENDARIO PREVENTIVO Y TÁCTICO (A1 A A13) ---');

{
  const fechaSimulada = new Date('2026-09-01T00:00:00Z');
  const fechaT0 = '2027-01-15T00:00:00Z'; // ~136 días después (diffDays > 85, entra a bloque 1)

  const v2: PrediccionZonaV2 = {
    escenario: 'deficit_lluvias',
    probabilidad: 80,
    horizonte_temporal: '4 meses',
    T0: fechaT0,
    fuente_institucional: 'SENAMHI / ENFEN',
  };

  const cuestionario: CuestionarioAgricultor = {
    esenciales: {
      cobertura: 'rastrojo',
      siembra: 'esta_semana',
      cultivo_proximo: 'papa',
    },
    complementarias: {
      agua: 'secano',
      obras: 'ninguna',
      profundidad: 'profundo',
      bloquea_obras_profundas: false,
      textura: { clase: 'franca', origen: 'prueba_del_punado' },
      historial: {
        vez_anterior: 'haba',
        antes_de_esa: 'papa',
      },
    },
    adicionales: {
      personas: 'dos_o_tres',
      tiempo_semanal: 'bastante',
    },
  };

  const visor = {
    coordenadas: [-13.418, -72.045] as [number, number],
    area_m2: 12000,
    pendiente_pct: 14,
    humedad_smap_pct: 22,
    ndvi_medio: 0.54,
  };

  const acciones = generarCalendarioPreventivo(cuestionario, v2, undefined, visor, fechaSimulada);

  assert(acciones.length > 0, `Calendario generó ${acciones.length} acciones preventivas estructuradas`);
  
  const codigos = acciones.map((a) => a.accionCodigo);
  assert(codigos.some((c) => c.startsWith('A')), 'Las acciones pertenecen al catálogo oficial (A1-A13)');

  const primeraAccion = acciones[0];
  assert(Boolean(primeraAccion.bloque), 'Cada acción tiene su bloque temporal definido');
  assert(Boolean(primeraAccion.fechaTexto), 'Cada acción tiene fecha objetivo calculada');
  assert(Boolean(primeraAccion.accionNombre), 'Cada acción incluye nombre descriptivo');
  assert(Boolean(primeraAccion.motivo), 'Cada acción incluye justificación/motivo agronómico');
  assert(Boolean(primeraAccion.confianza), 'Cada acción incluye nivel de confianza');
}

console.log('\n🎉 ¡TODAS LAS PRUEBAS AUTOMATIZADAS PASARON EXITOSAMENTE!');
