import assert from 'node:assert';
// @ts-ignore
import { recomendar_A13, ejecutar_A13, clasificarVulnerabilidad, compararClima, ejecutarAsistenteAgroambiental, type CuestionarioAgricultor, type PrediccionZonaV2, type DatosVisorParcela } from '../src/lib/agroenvironmentalEngine.ts';

console.log('🧪 Iniciando Suite de Pruebas: Motor Agroambiental TerraQuipu...');

// Caso 1: Regla 1 - Después de papa debe sugerir Quinua con confianza media
{
  const res = recomendar_A13('papa', 'quinua', { clase: 'franca', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Quinua', 'Debe sugerir Quinua tras papa');
  assert.strictEqual(res.confianza, 'media', 'Confianza debe ser media');
  console.log('✅ Caso 1 pasado: papa -> Quinua (confianza media)');
}

// Caso 2: Regla 1 - Después de olluco u oca debe sugerir Quinua con confianza baja
{
  const res = recomendar_A13('olluco', 'papa', { clase: 'franca', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Quinua', 'Debe sugerir Quinua tras olluco');
  assert.strictEqual(res.confianza, 'baja', 'Confianza debe ser baja para tubérculos no-papa');
  console.log('✅ Caso 2 pasado: olluco -> Quinua (confianza baja)');
}

// Caso 3: Regla 2 - Quinua + suelo arenoso -> Olluco
{
  const res = recomendar_A13('quinua', 'papa', { clase: 'arenosa', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Olluco', 'Suelo arenoso prioriza Olluco');
  assert.strictEqual(res.confianza, 'media');
  console.log('✅ Caso 3 pasado: quinua + arenosa -> Olluco');
}

// Caso 4: Regla 2 - Quinua + suelo franco -> Oca
{
  const res = recomendar_A13('quinua', 'papa', { clase: 'franca', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Oca', 'Suelo franco prioriza Oca');
  assert.strictEqual(res.confianza, 'media');
  console.log('✅ Caso 4 pasado: quinua + franca -> Oca');
}

// Caso 5: Regla 2 - Quinua + suelo arcilloso -> Papa
{
  const res = recomendar_A13('quinua', 'oca', { clase: 'arcillosa', origen: 'declarado' });
  assert.strictEqual(res.cultivo_sugerido, 'Papa', 'Suelo arcilloso propone Papa');
  assert.strictEqual(res.confianza, 'baja');
  console.log('✅ Caso 5 pasado: quinua + arcillosa -> Papa');
}

// Caso 6: Prueba del puñado degrada confianza a baja
{
  const res = recomendar_A13('quinua', 'papa', { clase: 'franca', origen: 'prueba_del_punado' });
  assert.strictEqual(res.cultivo_sugerido, 'Oca');
  assert.strictEqual(res.confianza, 'baja', 'Prueba del puñado debe degradar confianza a baja');
  console.log('✅ Caso 6 pasado: prueba_del_punado -> confianza baja');
}

// Caso 7: Bloqueo de obras profundas ante pedregosidad
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
  console.log('✅ Caso 7 pasado: bloquea_obras_profundas impide A1');
}

console.log('🎉 Todas las pruebas del Motor Agroambiental pasaron exitosamente.');
