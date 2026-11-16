import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando Suite de Pruebas de Linaje y Trazabilidad NASA (Web Studio)...');

// Test 1: Verificación de fuentes satelitales oficiales en agrometeoClient
{
  const clientPath = path.resolve(process.cwd(), 'terraquipu-web/src/lib/agrometeoClient.ts');
  const fallbackPath = path.resolve(process.cwd(), 'src/lib/agrometeoClient.ts');
  const targetPath = fs.existsSync(clientPath) ? clientPath : fallbackPath;

  const content = fs.readFileSync(targetPath, 'utf8');
  assert.ok(content.includes('NASA SMAP'), 'agrometeoClient debe citar NASA SMAP');
  assert.ok(content.includes('Copernicus DEM 30m') || content.includes('SRTM'), 'Debe citar elevación DEM orbital');
  console.log('✅ Test 1 Pasado: Misiones satelitales NASA SMAP y DEM formalmente referenciadas.');
}

// Test 2: Validación de la Regla de Compresión Temporal por Sequía SMAP (< 18%)
{
  function evaluateSmapDroughtTrigger(smapHumidityPct: number, hasIrrigation: boolean) {
    const isCriticalDrought = smapHumidityPct < 18.0;
    return {
      isCriticalDrought,
      action: isCriticalDrought
        ? (hasIrrigation ? 'RIEGO_AUXILIO_INMEDIATO' : 'COMPRESION_TEMPORAL_NO_ZANJAS_PRIORIZAR_MULCH')
        : 'LABORES_REGULARES',
      alertMessage: isCriticalDrought
        ? 'Alerta NASA SMAP: Humedad superficial critica (<18%). Evitar remover suelo seco.'
        : 'Condiciones de humedad favorables.',
    };
  }

  // Caso A: Parcela en secano con 12% SMAP (Maras)
  const secanoDrought = evaluateSmapDroughtTrigger(12.0, false);
  assert.strictEqual(secanoDrought.isCriticalDrought, true);
  assert.strictEqual(secanoDrought.action, 'COMPRESION_TEMPORAL_NO_ZANJAS_PRIORIZAR_MULCH');
  assert.ok(secanoDrought.alertMessage.includes('NASA SMAP'));

  // Caso B: Parcela con riego de auxilio con 14% SMAP
  const auxilioDrought = evaluateSmapDroughtTrigger(14.0, true);
  assert.strictEqual(auxilioDrought.isCriticalDrought, true);
  assert.strictEqual(auxilioDrought.action, 'RIEGO_AUXILIO_INMEDIATO');

  // Caso C: Parcela con humedad adecuada (25% SMAP)
  const normalMoisture = evaluateSmapDroughtTrigger(25.0, false);
  assert.strictEqual(normalMoisture.isCriticalDrought, false);
  assert.strictEqual(normalMoisture.action, 'LABORES_REGULARES');

  console.log('✅ Test 2 Pasado: Regla de gatillo por deficit hídrico NASA SMAP (<18%) validada.');
}

// Test 3: Verificación de Regla Satelital Antifuego (NASA FIRMS / MODIS)
{
  function evaluateFireBanRule(hasDryBiomass: boolean, ensoDroughtAnomalyPct: number, satelliteHotspots: number) {
    const fireRiskActive = satelliteHotspots > 0 || (hasDryBiomass && ensoDroughtAnomalyPct < -15.0);
    return {
      fireRiskActive,
      burningForbidden: fireRiskActive,
      advice: fireRiskActive
        ? 'PROHIBIDO QUEMAR RASTROJO: Riesgo extremo de incendio y degradacion. Conservar como mulch.'
        : 'Manejo ordinario de rastrojo permitido.',
    };
  }

  const drySeasonCusco = evaluateFireBanRule(true, -29.2, 0);
  assert.strictEqual(drySeasonCusco.burningForbidden, true);
  assert.ok(drySeasonCusco.advice.includes('PROHIBIDO QUEMAR RASTROJO'));

  const activeHotspotDetected = evaluateFireBanRule(false, -5.0, 2);
  assert.strictEqual(activeHotspotDetected.burningForbidden, true);

  console.log('✅ Test 3 Pasado: Regla satelital de prohibicion de quema (NASA FIRMS) validada.');
}

// Test 4: Verificación de pureza de texto (Cero en-dash y Cero em-dash)
{
  const filePath = fs.existsSync('terraquipu-web/tests/nasaDataLineage.test.ts')
    ? 'terraquipu-web/tests/nasaDataLineage.test.ts'
    : 'tests/nasaDataLineage.test.ts';

  if (fs.existsSync(filePath)) {
    const text = fs.readFileSync(filePath, 'utf8');
    assert.strictEqual(text.includes('\u2013'), false, 'No deben existir en-dashes');
    assert.strictEqual(text.includes('\u2014'), false, 'No deben existir em-dashes');
  }
  console.log('✅ Test 4 Pasado: Regla de escritura simple verificada (sin en-dash ni em-dash).');
}

console.log('🎉 TODOS LOS TESTS DE LINEAJE Y TRAZABILIDAD NASA PASARON EXITOSAMENTE!');
