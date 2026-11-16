import assert from 'node:assert';
import { TRANSLATIONS, getTranslation } from '../src/lib/translations';

console.log('🧪 Starting translation and Runasimi Quechua verification suite...');

// Test 1: Complete parity between Spanish and Quechua dictionary structures
{
  const es = TRANSLATIONS.es;
  const qu = TRANSLATIONS.qu;

  assert.ok(es, 'Spanish translation must exist');
  assert.ok(qu, 'Quechua translation must exist');

  const esSections = Object.keys(es) as (keyof typeof es)[];
  const quSections = Object.keys(qu) as (keyof typeof qu)[];

  assert.deepStrictEqual(
    quSections.sort(),
    esSections.sort(),
    'Quechua sections must match Spanish sections exactly'
  );

  for (const section of esSections) {
    const esKeys = Object.keys(es[section]);
    const quKeys = Object.keys(qu[section]);
    assert.deepStrictEqual(
      quKeys.sort(),
      esKeys.sort(),
      `Keys in section ${section} must match exactly between ES and QU`
    );

    // Verify all strings are non-empty
    for (const k of esKeys) {
      const valEs = (es[section] as any)[k];
      const valQu = (qu[section] as any)[k];
      assert.strictEqual(typeof valEs, 'string', `ES ${section}.${k} must be a string`);
      assert.strictEqual(typeof valQu, 'string', `QU ${section}.${k} must be a string`);
      assert.ok(valEs.trim().length > 0, `ES ${section}.${k} must not be empty`);
      assert.ok(valQu.trim().length > 0, `QU ${section}.${k} must not be empty`);
    }
  }

  console.log('✅ Test 1 Passed: Structural dictionary parity and non-empty strings');
}

// Test 2: Authentic Andean agroecological Quechua terminology
{
  const qu = TRANSLATIONS.qu;

  // Key agricultural concepts
  assert.strictEqual(qu.app.parcels, 'Chajrakuna');
  assert.strictEqual(qu.app.addParcel, 'Chajra Yapay');
  assert.strictEqual(qu.app.rotation, 'Muyuy & Qolqe');
  assert.strictEqual(qu.app.copilot, 'Kipu Yanapaq');
  assert.strictEqual(qu.app.settings, 'Allichaykuna');
  assert.strictEqual(qu.app.soilMoisture, 'Allpapa chiri-poqon');
  assert.strictEqual(qu.app.frostRisk, 'Qasa sasachakuy');
  assert.strictEqual(qu.app.nitrogenBalance, 'Allpapi Wanu Tupuy');

  // Visor terminology
  assert.strictEqual(qu.visor.normalMode, 'Kawsay Pacha');
  assert.strictEqual(qu.visor.ninoMode, 'Hatun Para Pacha');
  assert.strictEqual(qu.visor.prioritySoil, 'Allpa Allinyachiy');
  assert.strictEqual(qu.visor.optimalSuccession, 'Allin Muyuy Tarpuykuna');

  console.log('✅ Test 2 Passed: Authentic Andean Runasimi agricultural terminology verified');
}

// Test 3: Fallback behavior for invalid or missing language
{
  const fallback = getTranslation('de' as any);
  assert.strictEqual(fallback.meta.code, 'es', 'Unknown language code must fall back to Spanish');

  const explicitEs = getTranslation('es');
  assert.strictEqual(explicitEs.meta.code, 'es');

  const explicitQu = getTranslation('qu');
  assert.strictEqual(explicitQu.meta.code, 'qu');

  console.log('✅ Test 3 Passed: Safe language resolution and Spanish fallback');
}

console.log('🎉 All translation verification tests passed successfully.');
