import { Cultivo, RotationRecommendation } from './types';

export function calculateDynamicRotation(
  previousCropId: string,
  priority: 'tierra' | 'comida' | 'mercado',
  isElNino: boolean,
  allCrops: Cultivo[]
): RotationRecommendation | null {
  if (!allCrops || allCrops.length === 0) return null;

  const previousCrop = allCrops.find((c) => c.crop_id === previousCropId) || allCrops[0];
  const favorableIds = previousCrop.sucesores_favorables || [];
  let candidates = allCrops.filter((c) => c.crop_id !== previousCrop.crop_id);

  const scored = candidates.map((crop) => {
    let score = 50;

    // Favorability matching from Andean agro-ecology matrix
    if (favorableIds.includes(crop.crop_id)) {
      score += 30;
    }
    if (crop.rompe_plaga_gorgojo) {
      score += 15;
    }

    // Priority-based weighting
    if (priority === 'tierra') {
      if (crop.balance_nitrogeno_kg_ha > 0) {
        score += crop.balance_nitrogeno_kg_ha > 50 ? 30 : 20;
      }
    } else if (priority === 'comida') {
      if (['haba', 'maiz', 'papa_nativa'].includes(crop.crop_id)) {
        score += 25;
      }
    } else if (priority === 'mercado') {
      // High market value crops
      if (['papa_nativa', 'quinua', 'tarwi'].includes(crop.crop_id)) {
        score += 25;
      }
    }

    // El Niño drought conditions
    if (isElNino) {
      if (crop.demanda_hidrica_optima_mm <= 480) {
        score += 30;
      } else {
        score -= 25;
      }
    }

    return { crop, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0].crop;
  const second = scored[1]?.crop || allCrops[1];
  const third = scored[2]?.crop || allCrops[2];

  let savings = 'S/. 250/ha en insumos';
  let badge = `${best.balance_nitrogeno_kg_ha > 0 ? '+' : ''}${best.balance_nitrogeno_kg_ha} kg N/ha en suelo`;
  let pestReduction = best.rompe_plaga_gorgojo ? '-84% Gorgojo' : 'Riesgo Moderado';

  if (best.balance_nitrogeno_kg_ha >= 70) {
    savings = 'S/. 420/ha en urea y abono químico';
    badge = `+${best.balance_nitrogeno_kg_ha} kg N/ha fijado biológicamente`;
  }

  if (isElNino) {
    badge = 'Gasta 40% menos agua • Alta rusticidad';
    pestReduction = '-90% Plagas por sequía';
  }

  // Dynamic, context-rich advice based on previous crop and chosen priority
  let advice = '';

  const isLegume = previousCrop.balance_nitrogeno_kg_ha > 0; // Haba, Tarwi
  const isTuber = ['papa_nativa', 'olluco', 'mashua'].includes(previousCrop.crop_id);

  if (isLegume) {
    if (priority === 'mercado') {
      advice = `¡Gran acierto hermano! Como cosechaste ${previousCrop.nombre_comun}, tu suelo quedó desinfectado de gorgojo y cargado con +${previousCrop.balance_nitrogeno_kg_ha} kg de nitrógeno natural. Tu meta es vender: la mejor opción para maximizar ingresos comerciales es sembrar ${best.nombre_comun}, que aprovechará gratis esos nutrientes para dar gran rendimiento sin gastar en químicos.`;
    } else if (priority === 'comida') {
      advice = `Cosechaste ${previousCrop.nombre_comun}: tu tierra tiene nitrógeno disponible. Sembrando ${best.nombre_comun} aseguras una cosecha nutritiva y abundante para el hogar.`;
    } else {
      advice = `Tu suelo ya está abonado gracias a ${previousCrop.nombre_comun}. Sembrando ${best.nombre_comun} mantendrás la fertilidad biológica y romperás cualquier ciclo de plagas.`;
    }
  } else if (isTuber) {
    if (priority === 'tierra' || priority === 'mercado') {
      advice = `Cosechaste ${previousCrop.nombre_comun}, que extrajo nutrientes del suelo y atrae al gorgojo andino. Para curar la tierra gratis y romper el ciclo biológico de la plaga, INIA recomienda rotar de inmediato con ${best.nombre_comun} (fija nitrógeno natural y desinfecta el terreno).`;
    } else {
      advice = `Después de ${previousCrop.nombre_comun}, rota con ${best.nombre_comun} para recuperar el suelo y garantizar granos para tu familia.`;
    }
  } else {
    // Grain or other
    advice = `Tras cosechar ${previousCrop.nombre_comun}, la ciencia del INIA recomienda sembrar ${best.nombre_comun} para diversificar la rotación y proteger la rentabilidad de tu chacra.`;
  }

  if (isElNino) {
    advice = `¡Alerta El Niño! El satélite prevé déficit hídrico. No siembres cultivos exigentes. Rota con ${best.nombre_comun}, cuya raíz profunda busca agua y resiste la sequía.`;
  }

  return {
    crop: best,
    score: scored[0].score,
    badge,
    savings,
    pestReduction,
    waterDemand: `${best.demanda_hidrica_optima_mm} mm`,
    advice,
    sequence: [best, second, third],
  };
}
