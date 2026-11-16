import assert from 'node:assert';
import {
  recomendar_A13,
  ejecutar_A13,
  clasificarVulnerabilidad,
  compararClima,
  ejecutarAsistenteAgroambiental,
  type CuestionarioAgricultor,
  type PrediccionZonaV2,
  type DatosVisorParcela,
} from '../src/lib/agroenvironmentalEngine.ts';

console.log('🧪 Iniciando Suite de Pruebas: Motor Agroambiental TerraQuipu...');

// Caso 1: Regla 2 - Dos extractores consecutivos (papa + quinua en suelo franco) -> Leguminosa Haba
{
  const res = recomendar_A13('papa', 'quinua', { clase: 'franca', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Haba', 'Dos extractores deben sugerir leguminosa Haba');
  assert.strictEqual(res.alternativa, 'Tarwi');
  assert.strictEqual(res.confianza, 'media', 'Confianza debe ser media');
  console.log('✅ Caso 1 pasado: papa + quinua -> Haba (alternativa Tarwi, confianza media)');
}

// Caso 2: Regla 1 - Tras leguminosa (haba) sugiere Papa para aprovechar nitrógeno
{
  const res = recomendar_A13('haba', 'papa', { clase: 'franca', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Papa', 'Tras leguminosa debe sugerir Papa');
  assert.strictEqual(res.confianza, 'media');
  console.log('✅ Caso 2 pasado: haba -> Papa (confianza media)');
}

// Caso 3: Regla 3 - Papa tras cultivo no extractor (haba) -> Quinua con confianza media
{
  const res = recomendar_A13('papa', 'haba', { clase: 'franca', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Quinua', 'Debe sugerir Quinua tras papa');
  assert.strictEqual(res.confianza, 'media', 'Confianza debe ser media para papa');
  console.log('✅ Caso 3 pasado: papa + haba -> Quinua (confianza media)');
}

// Caso 4: Regla 3 - Olluco tras cultivo no extractor (haba) -> Quinua con confianza baja
{
  const res = recomendar_A13('olluco', 'haba', { clase: 'franca', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Quinua', 'Debe sugerir Quinua tras olluco');
  assert.strictEqual(res.confianza, 'baja', 'Confianza debe ser baja para tubérculos no-papa');
  console.log('✅ Caso 4 pasado: olluco + haba -> Quinua (confianza baja)');
}

// Caso 5: Regla 4 - Quinua tras leguminosa + suelo arenoso -> Olluco
{
  const res = recomendar_A13('quinua', 'haba', { clase: 'arenosa', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Olluco', 'Suelo arenoso prioriza Olluco');
  assert.strictEqual(res.confianza, 'media');
  console.log('✅ Caso 5 pasado: quinua + arenosa -> Olluco');
}

// Caso 6: Regla 4 - Quinua tras leguminosa + suelo franco -> Oca
{
  const res = recomendar_A13('quinua', 'haba', { clase: 'franca', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Oca', 'Suelo franco prioriza Oca');
  assert.strictEqual(res.confianza, 'media');
  console.log('✅ Caso 6 pasado: quinua + franca -> Oca');
}

// Caso 7: Regla 4 - Quinua tras leguminosa + suelo arcilloso -> Papa
{
  const res = recomendar_A13('quinua', 'haba', { clase: 'arcillosa', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Papa', 'Suelo arcilloso propone Papa');
  assert.strictEqual(res.confianza, 'baja');
  console.log('✅ Caso 7 pasado: quinua + arcillosa -> Papa');
}

// Caso 8: Prueba del puñado degrada confianza a baja
{
  const res = recomendar_A13('quinua', 'haba', { clase: 'franca', origen: 'prueba_del_punado' });
  assert.strictEqual(res.cultivo_sugerido, 'Oca');
  assert.strictEqual(res.confianza, 'baja', 'Prueba del puñado debe degradar confianza a baja');
  console.log('✅ Caso 8 pasado: prueba_del_punado -> confianza baja');
}

// Caso 9: Bloqueo de obras profundas ante pedregosidad
{
  const cuestionario: CuestionarioAgricultor = {
    esenciales: {
      cobertura: 'rastrojo',
    },
    complementarias: {
      agua: 'secano',
      obras: 'ninguna',
      profundidad: 'muy_pedregoso',
      bloquea_obras_profundas: true,
      textura: { clase: 'franca', origen: 'declarado' },
      historial: { vez_anterior: 'papa', antes_de_esa: 'quinua' },
    },
    adicionales: {
      personas: 'solo_yo',
      tiempo_semanal: 'poco',
    },
  };

  const v2: PrediccionZonaV2 = {
    escenario: 'deficit_lluvias',
    T0: '2026-12-15',
    fuente_institucional: 'SENAMHI',
    confianza: 'alta',
  };

  const visor: DatosVisorParcela = {
    pendientePct: 16,
  };

  const res = ejecutarAsistenteAgroambiental(cuestionario, v2, undefined, visor);
  const codigos = res.calendario.map((c) => c.accionCodigo);
  assert.ok(!codigos.includes('A1'), 'NO debe recomendar zanjas profundas A1 si el suelo es muy pedregoso');
  console.log('✅ Caso 9 pasado: bloquea_obras_profundas impide A1');
}

console.log('🎉 Todas las pruebas del Motor Agroambiental pasaron exitosamente.');
