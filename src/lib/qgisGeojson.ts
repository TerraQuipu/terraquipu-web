import { GeoJsonFeatureCollection, ParcelProperties } from '@/types';

export const CHINCHERO_PARCELS: GeoJsonFeatureCollection<any, ParcelProperties> = {
  type: 'FeatureCollection',
  name: 'terraquipu_chinchero_parcels',
  crs: {
    type: 'name',
    properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
  },
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'P-01',
        name: 'Chacra Yanacona #4',
        sector: 'yanacona',
        area_ha: 1.68,
        slope_pct: 14.0,
        ph: 5.8,
        cic: 17.8,
        smap_moisture_pct: 41.2,
        ndvi: 0.68,
        current_crop: 'tarwi',
        elevation_msnm: 3754,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-72.0498, -13.3934],
            [-72.0475, -13.393],
            [-72.047, -13.395],
            [-72.0495, -13.3955],
            [-72.0498, -13.3934],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'P-02',
        name: 'Ayllu Taucca - Andén Alto',
        sector: 'taucca',
        area_ha: 2.4,
        slope_pct: 8.0,
        ph: 6.1,
        cic: 19.2,
        smap_moisture_pct: 38.0,
        ndvi: 0.74,
        current_crop: 'papa_nativa',
        elevation_msnm: 3740,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-72.051, -13.391],
            [-72.049, -13.3905],
            [-72.0485, -13.3925],
            [-72.0505, -13.393],
            [-72.051, -13.391],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'P-03',
        name: 'Cuper Alto - Quebrada',
        sector: 'cuper',
        area_ha: 0.95,
        slope_pct: 19.0,
        ph: 6.4,
        cic: 16.5,
        smap_moisture_pct: 46.1,
        ndvi: 0.61,
        current_crop: 'quinua',
        elevation_msnm: 3780,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-72.0465, -13.392],
            [-72.044, -13.3915],
            [-72.0435, -13.3935],
            [-72.046, -13.394],
            [-72.0465, -13.392],
          ],
        ],
      },
    },
  ],
};

// Topographic Contour Lines (Curvas de Nivel SRTM 30m)
export const CONTOUR_LINES_GEOJSON: GeoJsonFeatureCollection = {
  type: 'FeatureCollection',
  name: 'srtm_30m_elevation_contours',
  crs: {
    type: 'name',
    properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' },
  },
  features: [
    {
      type: 'Feature',
      properties: { elevation_m: 3740, type: 'intermediate' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-72.052, -13.39],
          [-72.049, -13.3915],
          [-72.046, -13.391],
          [-72.043, -13.3925],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { elevation_m: 3760, type: 'index' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-72.052, -13.392],
          [-72.048, -13.3935],
          [-72.045, -13.393],
          [-72.042, -13.3945],
        ],
      },
    },
    {
      type: 'Feature',
      properties: { elevation_m: 3780, type: 'intermediate' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-72.052, -13.394],
          [-72.047, -13.3955],
          [-72.044, -13.395],
          [-72.041, -13.3965],
        ],
      },
    },
  ],
};

/**
 * Generates and triggers browser download of standard GeoJSON file for QGIS
 */
export function exportQgisGeoJSON(customData?: GeoJsonFeatureCollection) {
  const dataToExport = customData || CHINCHERO_PARCELS;
  const jsonString = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonString], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'terraquipu_chinchero_qgis_layers.geojson';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses imported GeoJSON string from QGIS
 */
export function parseQgisGeoJSON(content: string): {
  success: boolean;
  collection: GeoJsonFeatureCollection | null;
  message: string;
} {
  try {
    const parsed = JSON.parse(content);
    if (!parsed || parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
      return {
        success: false,
        collection: null,
        message: 'El archivo no tiene formato FeatureCollection estándar GeoJSON.',
      };
    }
    return {
      success: true,
      collection: parsed as GeoJsonFeatureCollection,
      message: `Cargadas ${parsed.features.length} geometrías vectoriales de QGIS.`,
    };
  } catch (err: any) {
    return {
      success: false,
      collection: null,
      message: `Error al procesar archivo GeoJSON: ${err.message}`,
    };
  }
}
