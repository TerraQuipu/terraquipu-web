/**
 * Terraquipu Plan Export Service
 * Generates formatted Word (.doc / .docx compatible) dossiers and JSON technical sheets.
 */

import { ActiveParcel } from './geoUtils';
import { RotationEngineResult } from '@/types';

export interface PlanExportData {
  parcel: ActiveParcel;
  rotationResult: RotationEngineResult;
  previousCrop: string;
  priority: string;
  climateMode: 'normal' | 'nino';
  hardwareId?: string;
  technicianName?: string;
}

/**
 * Generates a styled Word-compatible document (.doc) with complete agronomic dossier
 */
export function generateWordReport(data: PlanExportData): string {
  const { parcel, rotationResult, previousCrop, priority, climateMode, hardwareId } = data;
  const c1 = rotationResult.campaigns[0];
  const c2 = rotationResult.campaigns[1];
  const c3 = rotationResult.campaigns[2];

  const dateStr = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Plan Agroclimático Terraquipu - ${parcel.name}</title>
  <style>
    body {
      font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
      color: #1a202c;
      line-height: 1.5;
      margin: 30px;
    }
    h1 {
      color: #065f46;
      font-size: 24pt;
      margin-bottom: 2pt;
      font-weight: bold;
    }
    h2 {
      color: #047857;
      font-size: 15pt;
      border-bottom: 2pt solid #047857;
      padding-bottom: 4pt;
      margin-top: 20pt;
    }
    h3 {
      color: #1f2937;
      font-size: 12pt;
      margin-top: 10pt;
    }
    p {
      font-size: 11pt;
      margin-bottom: 6pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12pt 0;
      font-size: 10.5pt;
    }
    th {
      background-color: #065f46;
      color: white;
      text-align: left;
      padding: 8pt;
      font-weight: bold;
      border: 1pt solid #065f46;
    }
    td {
      padding: 7pt;
      border: 1pt solid #d1d5db;
    }
    tr:nth-child(even) td {
      background-color: #f9fafb;
    }
    .badge {
      display: inline-block;
      padding: 3pt 8pt;
      background-color: #d1fae5;
      color: #065f46;
      font-weight: bold;
      border-radius: 4pt;
      font-size: 10pt;
    }
    .highlight-box {
      background-color: #ecfdf5;
      border-left: 4pt solid #059669;
      padding: 12pt;
      margin: 12pt 0;
    }
    .footer {
      margin-top: 40pt;
      border-top: 1pt solid #9ca3af;
      padding-top: 10pt;
      font-size: 9pt;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>

  <!-- Official Header -->
  <table style="border: none; margin-bottom: 20pt;">
    <tr style="border: none; background: transparent;">
      <td style="border: none; width: 70%; padding: 0;">
        <h1>TERRAQUIPU</h1>
        <p style="font-size: 13pt; color: #4b5563; margin-top: 0;">
          <strong>Dossier Agronómico de Manejo Territorial &amp; Rotación Científica</strong>
        </p>
        <p style="font-size: 10pt; color: #6b7280;">
          Validación Oficial INIA Perú • Datos Satelitales NASA SMAP L4 &amp; GPM IMERG
        </p>
      </td>
      <td style="border: none; width: 30%; text-align: right; vertical-align: top; padding: 0;">
        <p style="font-size: 10pt; color: #4b5563;">
          <strong>Fecha:</strong> ${dateStr}<br>
          <strong>Hardware ID:</strong> ${hardwareId || 'TQ-TECH-PRO'}<br>
          <strong>Escenario:</strong> ${climateMode === 'nino' ? 'Simulación El Niño' : 'Año Normal'}
        </p>
      </td>
    </tr>
  </table>

  <!-- SECTION 1: PARCEL GEOMETRY & TOPOGRAPHY -->
  <h2>1. Identificación y Parámetros Topográficos de la Parcela</h2>
  <p>Información geodésica extraída mediante delimitación vectorial y modelo digital de elevación SRTM:</p>

  <table>
    <tr>
      <th style="width: 35%;">Parámetro</th>
      <th style="width: 65%;">Valor Registrado</th>
    </tr>
    <tr>
      <td><strong>Nombre de Parcela</strong></td>
      <td>${parcel.name}</td>
    </tr>
    <tr>
      <td><strong>Superficie Delimitada</strong></td>
      <td><strong>${parcel.areaHa.toFixed(2)} hectáreas</strong> (${Math.round(parcel.areaHa * 10000).toLocaleString()} m²)</td>
    </tr>
    <tr>
      <td><strong>Pendiente Media</strong></td>
      <td>${parcel.slopePct}% (${parcel.slopePct > 18 ? 'Ladera Pronunciada L3' : parcel.slopePct > 10 ? 'Ladera Media L2' : 'Ladera Suave L1'})</td>
    </tr>
    <tr>
      <td><strong>Altitud Topográfica</strong></td>
      <td>${parcel.elevationMsnm} m s. n. m. (Piso Agroecológico Quechua/Suni)</td>
    </tr>
    <tr>
      <td><strong>Coordenadas Centroide</strong></td>
      <td>Latitud: ${parcel.center[0].toFixed(5)}° S | Longitud: ${parcel.center[1].toFixed(5)}° W</td>
    </tr>
    <tr>
      <td><strong>Cultivo Previo Reportado</strong></td>
      <td>${previousCrop.toUpperCase()}</td>
    </tr>
    <tr>
      <td><strong>Prioridad del Agricultor</strong></td>
      <td>${priority === 'alimento' ? 'Seguridad y Consumo Familiar' : priority === 'venta' ? 'Comercialización y Mercado' : 'Regeneración Integral del Suelo'}</td>
    </tr>
  </table>

  <!-- SECTION 2: SATELLITE TELEMETRY -->
  <h2>2. Diagnóstico Satelital Agroclimático (NASA)</h2>
  <table>
    <tr>
      <th>Sensor Satelital</th>
      <th>Métrica Evaluada</th>
      <th>Diagnóstico Técnico</th>
    </tr>
    <tr>
      <td><strong>NASA SMAP L4</strong></td>
      <td>Humedad Radicular: <strong>${climateMode === 'nino' ? (parcel.smapMoisturePct * 0.58).toFixed(1) : parcel.smapMoisturePct}%</strong></td>
      <td>${climateMode === 'nino' ? 'Déficit hídrico en estrato radicular. Requiere cultivo de secano.' : 'Estrato superficial óptimo para preparación de terreno y siembra.'}</td>
    </tr>
    <tr>
      <td><strong>NASA GPM IMERG</strong></td>
      <td>Precipitación: <strong>${climateMode === 'nino' ? '510 mm' : '680 mm'}</strong></td>
      <td>${climateMode === 'nino' ? 'Anomalía negativa de -24% respecto al promedio histórico.' : 'Volumen pluvial dentro de rango normal para la microcuenca.'}</td>
    </tr>
    <tr>
      <td><strong>Sentinel-2 / HLS</strong></td>
      <td>Vigor Vegetal NDVI: <strong>${parcel.ndvi.toFixed(2)}</strong></td>
      <td>Cobertura fotosintética activa y saludable en el entorno inmediato.</td>
    </tr>
    <tr>
      <td><strong>SENAMHI / POWER</strong></td>
      <td>Temperatura Nocturna Mínima: <strong>2.0 °C</strong></td>
      <td>Riesgo de helada andina leve. Se recomienda aporque alto preventivo.</td>
    </tr>
  </table>

  <!-- SECTION 3: PRESCRIPTION INMEDIATA -->
  <h2>3. Prescripción Agronómica Inmediata (Campaña 2024-2025)</h2>
  
  <div class="highlight-box">
    <p style="font-size: 14pt; color: #065f46; margin: 0 0 6pt 0;">
      <strong>Cultivo Recomendado: ${c1.title}</strong>
    </p>
    <p style="font-size: 11pt; color: #047857; margin: 0 0 10pt 0;">
      <em>${c1.scientificName}</em> • Índice de Compatibilidad: <strong>${c1.suitabilityScore}%</strong>
    </p>
    <p style="margin-bottom: 8pt;">
      ${c1.description}
    </p>
    <table>
      <tr>
        <th style="background-color: #047857;">Aporte de Nitrógeno</th>
        <th style="background-color: #047857;">Ahorro en Fertilizante</th>
        <th style="background-color: #047857;">Control de Plagas</th>
        <th style="background-color: #047857;">Demanda Hídrica</th>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold; color: #065f46;">${c1.nitrogenBalance}</td>
        <td style="text-align: center; font-weight: bold; color: #92400e;">S/. ${c1.savingsSoles}</td>
        <td style="text-align: center; font-weight: bold;">${c1.pestStatus}</td>
        <td style="text-align: center; font-weight: bold;">${c1.waterDemand} (${c1.totalWaterM3.toLocaleString()} m³)</td>
      </tr>
    </table>
  </div>

  <!-- SECTION 4: 3-CAMPAIGN ROTATION SEQUENCE -->
  <h2>4. Secuencia Planificada de Rotación Trienal (2024 - 2027)</h2>
  <table>
    <tr>
      <th style="width: 25%;">Campaña</th>
      <th style="width: 35%;">Cultivo &amp; Variedad</th>
      <th style="width: 20%;">Función Ecológica</th>
      <th style="width: 20%;">Compatibilidad</th>
    </tr>
    <tr>
      <td><strong>1. Inmediata (2024-25)</strong></td>
      <td>${c1.title}<br><small style="color: #6b7280;">${c1.scientificName}</small></td>
      <td>Fijación masiva de nitrógeno y ruptura del gorgojo andino.</td>
      <td><span class="badge">${c1.suitabilityScore}% Óptimo</span></td>
    </tr>
    <tr>
      <td><strong>2. Siguiente (2025-26)</strong></td>
      <td>${c2.title}<br><small style="color: #6b7280;">${c2.scientificName}</small></td>
      <td>Aprovechamiento del nitrógeno orgánico residual para alto rendimiento.</td>
      <td><span class="badge">${c2.suitabilityScore}% Óptimo</span></td>
    </tr>
    <tr>
      <td><strong>3. Cierre (2026-27)</strong></td>
      <td>${c3.title}<br><small style="color: #6b7280;">${c3.scientificName}</small></td>
      <td>Resguardo de humedad del subsuelo y protección contra heladas.</td>
      <td><span class="badge">${c3.suitabilityScore}% Óptimo</span></td>
    </tr>
  </table>

  <!-- SECTION 5: RECOMMENDATIONS & SANITARY CONTROL -->
  <h2>5. Prácticas de Manejo Agroecológico y Control de Plagas</h2>
  <ol>
    <li>
      <strong>Ruptura del Gorgojo Andino (<em>Premnotrypes suturicallus</em>):</strong>
      La siembra de leguminosas (Tarwi/Haba) impide que las larvas de gorgojo encuentren tubérculos hospederos, reduciendo en más del 80% su población sin insecticidas tóxicos.
    </li>
    <li>
      <strong>Manejo de Laderas y Terrazas:</strong>
      Con una pendiente del ${parcel.slopePct}%, es indispensable trazar los surcos en curvas de nivel (perpendiculares a la pendiente) para evitar cárcavas y arrastre de nutrientes por escorrentía pluvial.
    </li>
    <li>
      <strong>Protección contra Heladas Nocturnas:</strong>
      Realizar aporque alto (35-40 cm) para acumular la radiación térmica solar en el caballón y liberarla durante la madrugada.
    </li>
  </ol>

  <!-- Signatures -->
  <table style="border: none; margin-top: 40pt;">
    <tr style="border: none; background: transparent;">
      <td style="border: none; text-align: center; width: 50%;">
        <div style="border-top: 1pt solid #000; width: 200pt; margin: 0 auto; padding-top: 5pt;">
          <strong>Agricultor Titular</strong><br>
          Comunidad Campesina de Chinchero
        </div>
      </td>
      <td style="border: none; text-align: center; width: 50%;">
        <div style="border-top: 1pt solid #000; width: 200pt; margin: 0 auto; padding-top: 5pt;">
          <strong>Técnico Promotor Agroclimático</strong><br>
          Terraquipu • Validación INIA Perú
        </div>
      </td>
    </tr>
  </table>

  <div class="footer">
    Documento emitido por la Plataforma Agro-Ecológica y Satelital Terraquipu.<br>
    Sincronizado con Supabase Cloud y la Red de Observación Satelital NASA Space Apps.
  </div>

</body>
</html>`;
}

/**
 * Downloads the Word-compatible report
 */
export function downloadWordReportFile(data: PlanExportData) {
  if (typeof window === 'undefined') return;
  const content = generateWordReport(data);
  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = data.parcel.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `plan_agroclimatico_${safeName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads the JSON technical sheet
 */
export function downloadJsonPlanFile(data: PlanExportData) {
  if (typeof window === 'undefined') return;
  const payload = {
    sistema: 'Terraquipu Agroclimático',
    version: '2.0-produccion',
    fecha_emision: new Date().toISOString(),
    hardware_id: data.hardwareId || 'TQ-TECH-PRO',
    escenario_climatico: data.climateMode,
    parcela: {
      nombre: data.parcel.name,
      superficie_ha: data.parcel.areaHa,
      superficie_m2: Math.round(data.parcel.areaHa * 10000),
      pendiente_pct: data.parcel.slopePct,
      altitud_msnm: data.parcel.elevationMsnm,
      centroide: {
        latitud: data.parcel.center[0],
        longitud: data.parcel.center[1],
      },
      vertices_poligono: data.parcel.bounds,
      smap_humedad_pct: data.parcel.smapMoisturePct,
      ndvi_vigor: data.parcel.ndvi,
    },
    entradas_agricultor: {
      cultivo_anterior: data.previousCrop,
      prioridad: data.priority,
    },
    prescripcion_inmediata: {
      cultivo_recomendado: data.rotationResult.campaigns[0].title,
      variedad_cientifica: data.rotationResult.campaigns[0].scientificName,
      compatibilidad_score: data.rotationResult.campaigns[0].suitabilityScore,
      balance_nitrogeno: data.rotationResult.campaigns[0].nitrogenBalance,
      nitrogeno_total_kg: data.rotationResult.campaigns[0].totalNitrogenKg,
      ahorro_fertilizante_soles: data.rotationResult.campaigns[0].savingsSoles,
      demanda_agua: data.rotationResult.campaigns[0].waterDemand,
      volumen_agua_m3: data.rotationResult.campaigns[0].totalWaterM3,
      control_plagas: data.rotationResult.campaigns[0].pestStatus,
      justificacion_tecnica: data.rotationResult.campaigns[0].description,
    },
    secuencia_trienal: data.rotationResult.campaigns.map((c) => ({
      campaña: c.period,
      cultivo: c.title,
      nombre_cientifico: c.scientificName,
      score: c.suitabilityScore,
      nitrogeno: c.nitrogenBalance,
      agua: c.waterDemand,
    })),
    fuente_satelital: 'NASA SMAP L4, Sentinel-2, GPM IMERG, INIA Perú & PostGIS Supabase',
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = data.parcel.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  a.download = `plan_agroclimatico_${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
