import assert from 'node:assert';
import {
  getFertilizerPriceForParcel,
  calculateNitrogenSavings,
  REGIONAL_FERTILIZER_PRICES,
} from '../src/lib/agronomicPricing';

console.log('🧪 Starting Agronomic Pricing Unit Tests...');

// Test 1: Exact microcuenca lookups
{
  const anta = getFertilizerPriceForParcel('Microcuenca Huaypo - Anta');
  assert.strictEqual(anta.precioUreaSaco50kg, 88, 'Anta should be S/ 88');
  assert.ok(anta.fuente.includes('MIDAGRI SISAP'), 'Source should include MIDAGRI SISAP');

  const maras = getFertilizerPriceForParcel('Microcuenca Vilcanota - Cusco');
  assert.strictEqual(maras.precioUreaSaco50kg, 92, 'Maras/Vilcanota should be S/ 92');

  const pampaAnta = getFertilizerPriceForParcel('Microcuenca Anta - Cusco');
  assert.strictEqual(pampaAnta.precioUreaSaco50kg, 89, 'Pampa de Anta should be S/ 89');

  console.log('✅ Test 1 Passed: Exact microcuenca prices match official specification.');
}

// Test 2: Substring / Fuzzy microcuenca lookups
{
  const fuzzyUrubamba = getFertilizerPriceForParcel('Zona Agrícola de Urubamba Alta');
  assert.strictEqual(fuzzyUrubamba.precioUreaSaco50kg, 92);

  const fuzzyVilcanota = getFertilizerPriceForParcel('Cuenca Río Vilcanota Sector Calca');
  assert.strictEqual(fuzzyVilcanota.precioUreaSaco50kg, 90, 'Vilcanota without Maras/Urubamba should be S/ 90');

  const fuzzyAnta = getFertilizerPriceForParcel('Valle Anta');
  assert.strictEqual(fuzzyAnta.precioUreaSaco50kg, 88);

  const espinar = getFertilizerPriceForParcel('Microcuenca Canas - Espinar');
  assert.strictEqual(espinar.precioUreaSaco50kg, 96);

  console.log('✅ Test 2 Passed: Fuzzy microcuenca matching correctly resolves.');
}

// Test 3: Provincia/Distrito fallback
{
  const distritoAnta = getFertilizerPriceForParcel(undefined, 'Izcuchaca');
  assert.strictEqual(distritoAnta.precioUreaSaco50kg, 88);

  const distritoMaras = getFertilizerPriceForParcel(undefined, 'Maras');
  assert.strictEqual(distritoMaras.precioUreaSaco50kg, 92);

  const unknown = getFertilizerPriceForParcel(undefined, 'Distrito Desconocido');
  assert.strictEqual(unknown.precioUreaSaco50kg, 90, 'Unknown should fallback to default Cusco S/ 90');

  console.log('✅ Test 3 Passed: District/province fallback and default lookup work.');
}

// Test 4: Calculation of nitrogen savings with regional prices
{
  // 1.73 ha in Maras (S/ 92/saco), legume fixing 75 kg N/ha
  // 75 / 23 = 3.26 sacks/ha -> rounded to 3.3
  // savingsPerHa = 3.26 * 92 = 300
  // totalSavings = 1.73 * 300 = 519
  const res = calculateNitrogenSavings(1.73, 75, undefined, 'Microcuenca Vilcanota - Cusco');
  assert.strictEqual(res.pricePerSack, 92);
  assert.strictEqual(res.isCustomPrice, false);
  assert.strictEqual(res.sacksAvoidedPerHa, 3.3);
  assert.ok(res.totalSavings > 500 && res.totalSavings < 540, `totalSavings expected ~519, got ${res.totalSavings}`);

  console.log('✅ Test 4 Passed: Maras standard nitrogen savings formula verified.');
}

// Test 5: Custom sack price override by farmer
{
  const customRes = calculateNitrogenSavings(1.73, 75, 98, 'Microcuenca Vilcanota - Cusco');
  assert.strictEqual(customRes.pricePerSack, 98);
  assert.strictEqual(customRes.isCustomPrice, true);
  assert.strictEqual(customRes.fuente, 'Precio personalizado por agricultor');
  assert.ok(customRes.totalSavings > customRes.savingsPerHa);

  console.log('✅ Test 5 Passed: Custom sack price overrides correctly.');
}

// Test 6: Boundary values and zero/negative nitrogen
{
  const zeroArea = calculateNitrogenSavings(0, 75, undefined, 'Microcuenca Huaypo - Anta');
  assert.strictEqual(zeroArea.totalSavings, 0);
  assert.strictEqual(zeroArea.totalSacksAvoided, 0);

  const negArea = calculateNitrogenSavings(-2.5, 75, undefined, 'Microcuenca Huaypo - Anta');
  assert.strictEqual(negArea.totalSavings, 0, 'Negative area must safely yield 0 savings');
  assert.strictEqual(negArea.totalSacksAvoided, 0);

  const nanArea = calculateNitrogenSavings(NaN, 75, undefined, 'Microcuenca Huaypo - Anta');
  assert.strictEqual(nanArea.totalSavings, 0, 'NaN area must safely yield 0 savings');

  const negCustomPrice = calculateNitrogenSavings(1.0, 75, -50, 'Microcuenca Huaypo - Anta');
  assert.strictEqual(negCustomPrice.pricePerSack, 88, 'Negative custom price should fallback to regional price');
  assert.strictEqual(negCustomPrice.isCustomPrice, false);

  // Negative or zero nitrogen should default to 75 kg N/ha
  const negN = calculateNitrogenSavings(1.0, -50, undefined, 'Microcuenca Huaypo - Anta');
  assert.strictEqual(negN.sacksAvoidedPerHa, 3.3);
  assert.strictEqual(negN.pricePerSack, 88);

  console.log('✅ Test 6 Passed: Boundary values (zero area, negative N) handled safely.');
}

console.log('🎉 ALL AGRONOMIC PRICING TESTS PASSED SUCCESSFULLY!');
