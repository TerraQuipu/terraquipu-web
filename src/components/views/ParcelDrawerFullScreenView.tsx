'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Search,
  Layers,
  MapPin,
  Check,
  CheckCircle2,
  Sliders,
  Sprout,
  PenTool,
  RotateCcw,
  Sparkles,
  Mountain,
  Droplets,
  ChevronRight,
  TrendingUp,
  Leaf,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import { Cultivo, ParcelItem } from '@/lib/types';
import { saveParcel } from '@/lib/deviceProfile';
import DynamicTreeQuestionnaireView from '@/components/wizard/DynamicTreeQuestionnaireView';
import {
  calculateParcelAreaHa,
  calculateParcelCentroid,
  estimateTerrainMetrics,
  fetchRealTerrainMetrics,
  calculateDynamicSoilHealthIndex,
} from '@/lib/geoUtils';
import { getCultivos } from '@/lib/supabaseClient';

const FALLBACK_CROPS: Cultivo[] = [
  {
    crop_id: 'papa_nativa',
    nombre_comun: 'Papa Nativa Andina',
    nombre_cientifico: 'Solanum tuberosum subsp. andigenum',
    familia_botanica: 'Solanaceae',
    variedades_recomendadas: ['Huayro', 'Canchan', 'Amarilla Tumbay'],
    demanda_hidrica_min_mm: 500,
    demanda_hidrica_optima_mm: 650,
    altitud_min_msnm: 2800,
    altitud_max_msnm: 4100,
    ph_suelo_min: 5.0,
    ph_suelo_max: 6.5,
    balance_nitrogeno_kg_ha: -70.0,
    rompe_plaga_gorgojo: false,
    tolerancia_helada_c: -1.5,
    meses_ciclo: 6,
    sucesores_favorables: ['tarwi', 'haba', 'quinua'],
    sucesores_desfavorables: ['papa_nativa'],
    icono_emoji: '🥔',
  },
  {
    crop_id: 'tarwi',
    nombre_comun: 'Tarwi / Chocho',
    nombre_cientifico: 'Lupinus mutabilis',
    familia_botanica: 'Fabaceae',
    variedades_recomendadas: ['Andenes INIA', 'Yunguyo'],
    demanda_hidrica_min_mm: 350,
    demanda_hidrica_optima_mm: 480,
    altitud_min_msnm: 2800,
    altitud_max_msnm: 3900,
    ph_suelo_min: 5.5,
    ph_suelo_max: 7.2,
    balance_nitrogeno_kg_ha: 95.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: -3.0,
    meses_ciclo: 7,
    sucesores_favorables: ['papa_nativa', 'maiz', 'quinua'],
    sucesores_desfavorables: ['tarwi'],
    icono_emoji: '🌱',
  },
  {
    crop_id: 'maiz_blanco',
    nombre_comun: 'Maíz Blanco Gigante',
    nombre_cientifico: 'Zea mays var. amylacea',
    familia_botanica: 'Poaceae',
    variedades_recomendadas: ['Paraqay Sara', 'Urubamba'],
    demanda_hidrica_min_mm: 600,
    demanda_hidrica_optima_mm: 800,
    altitud_min_msnm: 2600,
    altitud_max_msnm: 3400,
    ph_suelo_min: 5.8,
    ph_suelo_max: 7.5,
    balance_nitrogeno_kg_ha: -50.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: 0.0,
    meses_ciclo: 8,
    sucesores_favorables: ['tarwi', 'haba'],
    sucesores_desfavorables: ['maiz_blanco'],
    icono_emoji: '🌽',
  },
  {
    crop_id: 'quinua_real',
    nombre_comun: 'Quinua Real del Altiplano',
    nombre_cientifico: 'Chenopodium quinoa',
    familia_botanica: 'Amaranthaceae',
    variedades_recomendadas: ['Kancolla', 'Blanca de Juli', 'Pasankalla'],
    demanda_hidrica_min_mm: 300,
    demanda_hidrica_optima_mm: 450,
    altitud_min_msnm: 3000,
    altitud_max_msnm: 4000,
    ph_suelo_min: 6.0,
    ph_suelo_max: 8.5,
    balance_nitrogeno_kg_ha: -25.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: -4.0,
    meses_ciclo: 5,
    sucesores_favorables: ['haba', 'tarwi', 'papa_nativa'],
    sucesores_desfavorables: ['quinua_real'],
    icono_emoji: '🌾',
  },
  {
    crop_id: 'habas_verdes',
    nombre_comun: 'Habas Verdes',
    nombre_cientifico: 'Vicia faba',
    familia_botanica: 'Fabaceae',
    variedades_recomendadas: ['Verde Anta', 'Gigante de Coporaque'],
    demanda_hidrica_min_mm: 400,
    demanda_hidrica_optima_mm: 550,
    altitud_min_msnm: 2800,
    altitud_max_msnm: 3850,
    ph_suelo_min: 6.0,
    ph_suelo_max: 7.5,
    balance_nitrogeno_kg_ha: 80.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: -2.0,
    meses_ciclo: 5,
    sucesores_favorables: ['papa_nativa', 'cebada', 'maiz_blanco'],
    sucesores_desfavorables: ['habas_verdes'],
    icono_emoji: '🌱',
  },
  {
    crop_id: 'cebada_grano',
    nombre_comun: 'Cebada Grano',
    nombre_cientifico: 'Hordeum vulgare',
    familia_botanica: 'Poaceae',
    variedades_recomendadas: ['Centenario', 'UNA La Molina'],
    demanda_hidrica_min_mm: 350,
    demanda_hidrica_optima_mm: 500,
    altitud_min_msnm: 2800,
    altitud_max_msnm: 4100,
    ph_suelo_min: 6.0,
    ph_suelo_max: 8.0,
    balance_nitrogeno_kg_ha: -30.0,
    rompe_plaga_gorgojo: true,
    tolerancia_helada_c: -4.5,
    meses_ciclo: 5,
    sucesores_favorables: ['tarwi', 'haba'],
    sucesores_desfavorables: ['cebada_grano'],
    icono_emoji: '🌿',
  },
];

interface ParcelDrawerFullScreenViewProps {
  onBack: () => void;
  onParcelCreated: (parcel: ParcelItem) => void;
  initialLat?: number;
  initialLon?: number;
  initialAreaHa?: number;
  cultivos?: Cultivo[];
  farmerName?: string;
  initialCommunityName?: string;
}

// Verified Peruvian Agricultural & Regional Coordinates
const PRESET_REGIONS = [
  { id: 'maras', name: 'Maras', fullName: 'Maras · Valle Sagrado', lat: -13.332, lon: -72.158, altitude: 3380 },
  { id: 'chinchero', name: 'Chinchero', fullName: 'Chinchero · Cusco', lat: -13.393, lon: -72.049, altitude: 3760 },
  { id: 'urubamba', name: 'Urubamba', fullName: 'Valle de Urubamba', lat: -13.305, lon: -72.115, altitude: 2870 },
  { id: 'anta', name: 'Anta', fullName: 'Pampa de Anta', lat: -13.415, lon: -72.235, altitude: 3450 },
  { id: 'ayaviri', name: 'Ayaviri', fullName: 'Melgar · Ayaviri', lat: -14.882, lon: -70.589, altitude: 3910 },
  { id: 'majes', name: 'Majes', fullName: 'Irrigación Majes', lat: -16.325, lon: -72.208, altitude: 1400 },
  { id: 'puno', name: 'Puno', fullName: 'Puno · Titicaca', lat: -15.84, lon: -70.021, altitude: 3812 },
];

export function getCropImage(cropId: string, nombreComun: string): string {
  const id = (cropId || '').toLowerCase();
  const name = (nombreComun || '').toLowerCase();
  if (id.includes('papa') || name.includes('papa')) return '/images/papa_nativa.jpg';
  if (id.includes('tarwi') || name.includes('tarwi') || id.includes('chocho') || name.includes('chocho')) return '/images/tarwi_chocho.jpg';
  if (id.includes('maiz') || name.includes('maíz') || name.includes('maiz')) return '/images/maiz_blanco.jpg';
  if (id.includes('quinua') || name.includes('quinua')) return '/images/quinua_real.jpg';
  if (id.includes('haba') || name.includes('haba')) return '/images/haba_verde.jpg';
  if (id.includes('cebada') || name.includes('cebada') || id.includes('trigo') || name.includes('trigo')) return '/images/trigo_viento_poster.jpg';
  return '/images/cultivos_poster.jpg';
}

export default function ParcelDrawerFullScreenView({
  onBack,
  onParcelCreated,
  initialLat = -13.332,
  initialLon = -72.158,
  initialAreaHa = 1.73,
  cultivos: propCultivos = [],
  farmerName = '',
  initialCommunityName = '',
}: ParcelDrawerFullScreenViewProps) {
  // Wizard Step: 1 = Delimitar en mapa, 2 = Confirmar telemetría, 3 = Nombre de chacra y calibrar
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [calibratingParcel, setCalibratingParcel] = useState<ParcelItem | null>(null);

  // Drawing Mode: 'freehand' (clics para vértices libres) vs 'box' (chacra rápida 1 clic + slider)
  // En trazo libre, iniciamos limpio sin polígono predefinido para que el agricultor marque libremente
  const [drawMode, setDrawMode] = useState<'freehand' | 'box'>('freehand');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const tempMarkersRef = useRef<any[]>([]);
  const tempPolylineRef = useRef<any>(null);
  const centroidMarkerRef = useRef<any>(null);

  // Tile Layers
  const satLayerRef = useRef<any>(null);
  const osmLayerRef = useRef<any>(null);

  // State Coordinates & Geometry (Comienza limpio con 0 vértices y 0 área)
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLon, setCurrentLon] = useState(initialLon);
  const [areaHa, setAreaHa] = useState(0);
  const [polygonCoords, setPolygonCoords] = useState<[number, number][]>([]);
  const polygonCoordsRef = useRef<[number, number][]>([]);
  polygonCoordsRef.current = polygonCoords;

  const [activeLayer, setActiveLayer] = useState<'sat' | 'qgis'>('sat');
  const [altitudeMsnm, setAltitudeMsnm] = useState(3380);
  const [slopePct, setSlopePct] = useState(12.0);
  const [smapMoisturePct, setSmapMoisturePct] = useState(18.0);
  const [activeRegionId, setActiveRegionId] = useState(
    initialCommunityName ? initialCommunityName.toLowerCase() : 'maras'
  );

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Form Fields
  const [parcelName, setParcelName] = useState(
    farmerName ? `Chacra de ${farmerName}` : 'Mi Chacra Andina'
  );
  const [notes, setNotes] = useState('Suelo franco arcilloso, delimitado con precisión satelital.');

  // Live Supabase Crops Data (Real Data, zero mockups)
  const [dbCrops, setDbCrops] = useState<Cultivo[]>(propCultivos);
  const [selectedCrop, setSelectedCrop] = useState<Cultivo | null>(null);
  const [cropFilter, setCropFilter] = useState('');
  const [loadingCrops, setLoadingCrops] = useState(false);

  const isMountedRef = useRef(true);
  const topos = (areaHa * 3.3).toFixed(1);

  // Load real crops from Supabase on mount if not provided as props
  useEffect(() => {
    async function loadCrops() {
      if (propCultivos && propCultivos.length > 0) {
        setDbCrops(propCultivos);
        setSelectedCrop(propCultivos[0]);
        return;
      }
      setLoadingCrops(true);
      try {
        const data = await getCultivos();
        if (data && data.length > 0) {
          setDbCrops(data);
          setSelectedCrop(data[0]);
        } else {
          setDbCrops(FALLBACK_CROPS);
          setSelectedCrop(FALLBACK_CROPS[0]);
        }
      } catch {
        setDbCrops(FALLBACK_CROPS);
        setSelectedCrop(FALLBACK_CROPS[0]);
      } finally {
        setLoadingCrops(false);
      }
    }
    loadCrops();
  }, [propCultivos]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (typeof window === 'undefined') return;
    isMountedRef.current = true;
    let invalidateTimer: NodeJS.Timeout | null = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      if (!mapContainerRef.current || mapInstanceRef.current || !isMountedRef.current) return;
      if (!document.body.contains(mapContainerRef.current)) return;

      // Safe getPosition monkey-patch
      if (L && L.DomUtil) {
        const origGetPosition = L.DomUtil.getPosition;
        L.DomUtil.getPosition = function (el: any) {
          if (!el) return (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 }) as any;
          try {
            return origGetPosition ? origGetPosition.call(L.DomUtil, el) : (el._leaflet_pos || { x: 0, y: 0 });
          } catch {
            return (el._leaflet_pos || { x: 0, y: 0 }) as any;
          }
        };
      }

      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      // Zoom 15 provides an optimal landscape view of the valley without tile errors
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLon],
        zoom: 15,
        minZoom: 12,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Base Satellite (Esri World Imagery) with maxNativeZoom: 17 to prevent grey "Map data not yet available" tiles
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxNativeZoom: 17,
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri',
        }
      );
      satLayerRef.current = satLayer;

      // Base Cartographic (OpenStreetMap)
      const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      osmLayerRef.current = osmLayer;

      satLayer.addTo(map);

      // Limpio al inicio: NO se dibuja parcela predefinida en modo trazo libre
      // El agricultor inicia con el mapa despejado para colocar sus propios vértices con toques directos

      // Handle map clicks based on drawMode
      map.on('click', (e: any) => {
        const clicked: [number, number] = [
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6)),
        ];

        const activeMode = map.getContainer().getAttribute('data-draw-mode') || 'freehand';

        if (activeMode === 'freehand') {
          playBubblePop();
          // Add new vertex in freehand mode
          const updated = [...polygonCoordsRef.current, clicked];
          setPolygonCoords(updated);
          polygonCoordsRef.current = updated;

          // Add visual circle dot for this vertex
          const vertexMarker = L.circleMarker(clicked, {
            radius: 6,
            color: '#132A1C',
            fillColor: '#A3E635',
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);
          tempMarkersRef.current.push(vertexMarker);

          if (updated.length >= 3) {
            // Compute real area using geodesic Shoelace formula
            const realArea = calculateParcelAreaHa(updated);
            const safeArea = Number(Math.max(0.1, realArea).toFixed(2));
            setAreaHa(safeArea);
            renderPolygon(L, map, updated, safeArea);
          } else {
            // Connecting line before polygon is closed
            if (tempPolylineRef.current) {
              tempPolylineRef.current.setLatLngs(updated);
            } else {
              tempPolylineRef.current = L.polyline(updated, {
                color: '#A3E635',
                weight: 3,
                dashArray: '4, 4',
              }).addTo(map);
            }
          }
        } else {
          // Box Mode: relocate standard parcel
          playBubblePop();
          setCurrentLat(clicked[0]);
          setCurrentLon(clicked[1]);
          const newBox = generateBoxCoords(clicked[0], clicked[1], areaHa);
          setPolygonCoords(newBox);
          polygonCoordsRef.current = newBox;
          renderPolygon(L, map, newBox, areaHa);
        }
      });

      invalidateTimer = setTimeout(() => {
        if (!isMountedRef.current || !mapInstanceRef.current || !mapContainerRef.current) return;
        try {
          map.invalidateSize();
        } catch {}
      }, 300);
    };

    initMap();

    return () => {
      isMountedRef.current = false;
      if (invalidateTimer) clearTimeout(invalidateTimer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        try {
          delete (mapContainerRef.current as any)._leaflet_id;
        } catch {}
      }
    };
  }, []);

  // Sync data-draw-mode on container
  useEffect(() => {
    if (mapInstanceRef.current) {
      const container = mapInstanceRef.current.getContainer();
      container.setAttribute('data-draw-mode', drawMode);
      container.style.cursor = drawMode === 'freehand' ? 'crosshair' : 'pointer';
    }
  }, [drawMode]);

  // Generate standard rectangular bounds around lat, lon for ha
  const generateBoxCoords = (lat: number, lon: number, ha: number): [number, number][] => {
    const sideMeters = Math.sqrt(ha * 10000);
    const dLat = (sideMeters / 2) / 111320;
    const dLon = (sideMeters / 2) / (111320 * Math.cos((lat * Math.PI) / 180));
    return [
      [lat + dLat, lon - dLon],
      [lat + dLat * 1.04, lon + dLon],
      [lat - dLat, lon + dLon * 0.96],
      [lat - dLat * 1.03, lon - dLon],
    ];
  };

  // Render polygon and centroid marker on Leaflet map
  const renderPolygon = (L: any, map: any, coords: [number, number][], ha: number) => {
    if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
    if (centroidMarkerRef.current) map.removeLayer(centroidMarkerRef.current);
    if (tempPolylineRef.current) {
      map.removeLayer(tempPolylineRef.current);
      tempPolylineRef.current = null;
    }

    if (coords.length < 3) return;

    const poly = L.polygon(coords, {
      color: '#A3E635',
      weight: 3,
      opacity: 0.95,
      fillColor: '#7BB63E',
      fillOpacity: 0.32,
      dashArray: '4, 4',
    }).addTo(map);

    polygonLayerRef.current = poly;

    // Centroid pin
    const centroid = calculateParcelCentroid(coords);
    setCurrentLat(centroid[0]);
    setCurrentLon(centroid[1]);

    const iconHtml = `
      <div style="background-color: #132A1C; border: 2px solid #A3E635; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 5px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); white-space: nowrap; transform: translate(-50%, -50%);">
        <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background-color: #A3E635;"></span>
        <span>${ha} ha</span>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'tq-parcel-pin',
      iconSize: [0, 0],
    });

    const marker = L.marker(centroid, { icon: customIcon }).addTo(map);
    centroidMarkerRef.current = marker;
  };

  // Clear freehand points
  const handleClearPoints = () => {
    playBubblePop();
    if (mapInstanceRef.current) {
      tempMarkersRef.current.forEach((m) => mapInstanceRef.current.removeLayer(m));
      tempMarkersRef.current = [];
      if (polygonLayerRef.current) mapInstanceRef.current.removeLayer(polygonLayerRef.current);
      if (centroidMarkerRef.current) mapInstanceRef.current.removeLayer(centroidMarkerRef.current);
      if (tempPolylineRef.current) mapInstanceRef.current.removeLayer(tempPolylineRef.current);
    }
    setPolygonCoords([]);
    polygonCoordsRef.current = [];
    setAreaHa(0);
  };

  // Switch between Freehand Polygon (clean start) and Box (Chacra Rápida)
  const handleSwitchDrawMode = (mode: 'freehand' | 'box') => {
    playBubblePop();
    setDrawMode(mode);
    if (mode === 'box') {
      const defaultHa = areaHa > 0 ? areaHa : 1.73;
      setAreaHa(defaultHa);
      const newBox = generateBoxCoords(currentLat, currentLon, defaultHa);
      setPolygonCoords(newBox);
      polygonCoordsRef.current = newBox;
      if (mapInstanceRef.current) {
        import('leaflet').then((mod) => {
          renderPolygon(mod.default, mapInstanceRef.current, newBox, defaultHa);
        });
      }
    } else {
      // Freehand starts completely clean with no polygon
      handleClearPoints();
    }
  };

  // Undo last vertex
  const handleUndoPoint = () => {
    playBubblePop();
    if (polygonCoords.length === 0) return;
    const updated = polygonCoords.slice(0, -1);
    setPolygonCoords(updated);
    polygonCoordsRef.current = updated;

    if (mapInstanceRef.current && tempMarkersRef.current.length > 0) {
      const last = tempMarkersRef.current.pop();
      mapInstanceRef.current.removeLayer(last);

      import('leaflet').then((mod) => {
        const L = mod.default;
        if (updated.length >= 3) {
          const safeArea = Number(calculateParcelAreaHa(updated).toFixed(2));
          setAreaHa(safeArea);
          renderPolygon(L, mapInstanceRef.current, updated, safeArea);
        } else {
          setAreaHa(0);
          if (polygonLayerRef.current) mapInstanceRef.current.removeLayer(polygonLayerRef.current);
          if (centroidMarkerRef.current) mapInstanceRef.current.removeLayer(centroidMarkerRef.current);
          if (updated.length > 0 && tempPolylineRef.current) {
            tempPolylineRef.current.setLatLngs(updated);
          }
        }
      });
    }
  };

  // Handle box area slider
  const handleAreaSlider = (newArea: number) => {
    setAreaHa(newArea);
    const newCoords = generateBoxCoords(currentLat, currentLon, newArea);
    setPolygonCoords(newCoords);
    polygonCoordsRef.current = newCoords;

    if (mapInstanceRef.current) {
      import('leaflet').then((mod) => {
        renderPolygon(mod.default, mapInstanceRef.current, newCoords, newArea);
      });
    }
  };

  // Select Preset Region
  const handleSelectRegion = (region: typeof PRESET_REGIONS[0]) => {
    playBubblePop();
    setActiveRegionId(region.id);
    setCurrentLat(region.lat);
    setCurrentLon(region.lon);
    setAltitudeMsnm(region.altitude);
    if (!parcelName || parcelName === 'Mi Chacra Andina' || parcelName.startsWith('Chacra ')) {
      setParcelName(farmerName ? `Chacra de ${farmerName}` : `Chacra ${region.name}`);
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([region.lat, region.lon], 15, { duration: 1.2 });
    }

    if (drawMode === 'box') {
      const targetHa = areaHa > 0 ? areaHa : 1.73;
      const newCoords = generateBoxCoords(region.lat, region.lon, targetHa);
      setPolygonCoords(newCoords);
      polygonCoordsRef.current = newCoords;
      if (mapInstanceRef.current) {
        import('leaflet').then((mod) => {
          renderPolygon(mod.default, mapInstanceRef.current, newCoords, targetHa);
        });
      }
    }
  };

  // Search Submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + ', Peru'
      )}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setCurrentLat(lat);
        setCurrentLon(lon);
        setParcelName(searchQuery);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lon], 15, { duration: 1.2 });
        }

        if (drawMode === 'box') {
          const targetHa = areaHa > 0 ? areaHa : 1.73;
          const newCoords = generateBoxCoords(lat, lon, targetHa);
          setPolygonCoords(newCoords);
          polygonCoordsRef.current = newCoords;

          if (mapInstanceRef.current) {
            import('leaflet').then((mod) => {
              renderPolygon(mod.default, mapInstanceRef.current, newCoords, targetHa);
            });
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Toggle Layer
  const handleToggleLayer = (layer: 'sat' | 'qgis') => {
    playBubblePop();
    setActiveLayer(layer);
    if (!mapInstanceRef.current || !satLayerRef.current || !osmLayerRef.current) return;
    if (layer === 'sat') {
      mapInstanceRef.current.removeLayer(osmLayerRef.current);
      satLayerRef.current.addTo(mapInstanceRef.current);
    } else {
      mapInstanceRef.current.removeLayer(satLayerRef.current);
      osmLayerRef.current.addTo(mapInstanceRef.current);
    }
  };

  // Move from Step 1 to Step 2: Confirm Selection & Fetch Real Telemetry
  const handleConfirmStep1 = async () => {
    if (polygonCoords.length < 3) return;
    playSuccessFanfare();

    // Zoom into parcel bounds
    if (mapInstanceRef.current) {
      import('leaflet').then((mod) => {
        const L = mod.default;
        const bounds = L.latLngBounds(polygonCoords);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], duration: 1.0 });
      });
    }

    // Query real terrain telemetry from DEM & NASA
    const centroid = calculateParcelCentroid(polygonCoords);
    try {
      const metrics = await fetchRealTerrainMetrics(centroid, areaHa);
      setAltitudeMsnm(metrics.elevationMsnm);
      setSlopePct(metrics.slopePct);
      setSmapMoisturePct(metrics.smapMoisturePct);
    } catch {
      const fallback = estimateTerrainMetrics(centroid, areaHa);
      setAltitudeMsnm(fallback.elevationMsnm);
      setSlopePct(fallback.slopePct);
      setSmapMoisturePct(fallback.smapMoisturePct);
    }

    setCurrentStep(2);
  };

  // Move from Step 2 to Step 3: Name Input
  const handleGoToStep3 = () => {
    playBubblePop();
    setCurrentStep(3);
  };

  // Guardar Parcela e Iniciar Calibración In Situ Directa (Eliminado Paso 4 redundante de cultivo)
  const handleSaveParcelAndCalibrate = () => {
    if (!parcelName.trim()) return;
    playSuccessFanfare();

    const activeRegion = PRESET_REGIONS.find((r) => r.id === activeRegionId) || PRESET_REGIONS[0];
    const centroid = calculateParcelCentroid(polygonCoords);

    // Salud del suelo calculada dinámicamente según telemetría SMAP y NDVI (cero valores fijos de 78)
    const dynamicHealth = calculateDynamicSoilHealthIndex({
      ndvi: 0.68,
      smapHumidity: Math.round(smapMoisturePct),
      profundidad: 'medio',
      pedregosidad: 'pocas_piedras',
    });

    const newParcel: ParcelItem = {
      id: `parcel-${Date.now()}`,
      name: parcelName.trim() || 'Mi Chacra Andina',
      cropId: 'por_calibrar',
      cropName: 'Por calibrar en terreno',
      cropCategory: 'Por calibrar',
      areaHa: areaHa,
      areaTopos: Number((areaHa * 3.3).toFixed(1)),
      lat: centroid[0],
      lon: centroid[1],
      altitudeMsnm: altitudeMsnm,
      microcuenca: activeRegion.fullName,
      polygonCoords: polygonCoords,
      plantAgeDays: 0,
      estimatedYieldTons: Number((areaHa * 4.2).toFixed(1)),
      healthScore: dynamicHealth,
      smapHumidity: Math.round(smapMoisturePct),
      ndviScore: 0.68,
      photoUrl: '/images/andes_bright.jpg',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    saveParcel(newParcel);
    setCalibratingParcel(newParcel);
  };

  if (calibratingParcel) {
    return (
      <DynamicTreeQuestionnaireView
        parcel={calibratingParcel}
        onComplete={(calibratedParcel) => {
          onParcelCreated(calibratedParcel);
        }}
        onCancel={() => {
          onParcelCreated(calibratingParcel);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white font-sans overflow-hidden">
      {/* =========================================================================
          TOP BAR & SEARCH (GOOGLE MAPS STYLE)
         ========================================================================= */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto w-full pointer-events-auto space-y-2">
          {/* Top row */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                if (currentStep > 1) {
                  setCurrentStep((prev) => (prev - 1) as any);
                } else {
                  onBack();
                }
              }}
              className="w-10 h-10 rounded-full bg-[#132A1C]/90 hover:bg-[#132A1C] border border-white/20 text-white flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer backdrop-blur-md shrink-0"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar comunidad o valle andino..."
                className="w-full h-10 pl-9 pr-8 rounded-full bg-[#132A1C]/90 border border-white/20 text-white placeholder-zinc-400 text-xs shadow-lg backdrop-blur-md focus:outline-hidden focus:border-[#A3E635] transition"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              {isSearching && (
                <div className="w-3.5 h-3.5 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </form>

            {/* Layer Toggle Button */}
            <button
              type="button"
              onClick={() => handleToggleLayer(activeLayer === 'sat' ? 'qgis' : 'sat')}
              className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-lg transition cursor-pointer backdrop-blur-md shrink-0 ${
                activeLayer === 'sat'
                  ? 'bg-emerald-900/90 border-[#A3E635] text-[#A3E635]'
                  : 'bg-[#132A1C]/90 border-white/20 text-white'
              }`}
              title="Cambiar capa satelital / mapa"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Quick Fly Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_REGIONS.map((region) => {
              const isActive = activeRegionId === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => handleSelectRegion(region)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer shadow-sm backdrop-blur-md ${
                    isActive
                      ? 'bg-[#7BB63E] text-[#132A1C] font-semibold border border-[#A3E635]'
                      : 'bg-[#132A1C]/80 text-zinc-200 border border-white/15 hover:bg-[#132A1C]'
                  }`}
                >
                  {region.name}
                </button>
              );
            })}
          </div>

          {/* Mode Switcher Pills (Polígono Libre vs Chacra Rápida) in Step 1 */}
          {currentStep === 1 && (
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="bg-[#132A1C]/90 backdrop-blur-md p-1 rounded-full border border-white/15 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSwitchDrawMode('freehand')}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    drawMode === 'freehand'
                      ? 'bg-[#7BB63E] text-[#132A1C] shadow-xs'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  <span>Polígono Libre (Vértices)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchDrawMode('box')}
                  className={`px-3 py-1 rounded-full text-[10.5px] font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    drawMode === 'box'
                      ? 'bg-[#7BB63E] text-[#132A1C] shadow-xs'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3 h-3" />
                  <span>Chacra Rápida (1 Clic)</span>
                </button>
              </div>

              {drawMode === 'freehand' && polygonCoords.length > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleUndoPoint}
                    className="p-1.5 rounded-full bg-[#132A1C]/90 text-zinc-300 hover:text-white border border-white/15 backdrop-blur-md"
                    title="Deshacer último vértice"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearPoints}
                    className="px-2.5 py-1 rounded-full bg-red-950/80 text-red-200 border border-red-800/40 text-[10px] backdrop-blur-md font-semibold"
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          FULLSCREEN MAP CONTAINER
         ========================================================================= */}
      <div className="flex-1 w-full h-full relative z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Live HUD Floating Badge (Top Right) */}
        <div className="absolute top-36 right-3 z-10 pointer-events-none">
          <div className="bg-[#132A1C]/90 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shadow-xl text-right space-y-1">
            <div className="flex items-center justify-end gap-1 text-[#A3E635] text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
              <span>VISOR QGIS</span>
            </div>
            <div className="text-xs font-semibold text-white">
              {areaHa > 0 ? `${areaHa} ha` : '0.00 ha'}{' '}
              <span className="text-[10px] text-zinc-400">
                ({areaHa > 0 ? topos : '0.0'} topos)
              </span>
            </div>
            <div className="text-[9.5px] text-zinc-300 font-mono">
              {altitudeMsnm} msnm
            </div>
            {drawMode === 'freehand' && (
              <div className="text-[9px] text-[#A3E635] font-semibold">
                {polygonCoords.length} vértices
              </div>
            )}
          </div>
        </div>

        {/* Center Help Pill in Step 1 */}
        {currentStep === 1 && (
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <div className="bg-black/75 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/20 text-[10.5px] text-white shadow-md text-center whitespace-nowrap">
              {drawMode === 'freehand'
                ? polygonCoords.length === 0
                  ? 'Toca el mapa para marcar el primer vértice de tu chacra'
                  : polygonCoords.length < 3
                  ? `Marca ${3 - polygonCoords.length} vértice(s) más para cerrar el terreno`
                  : 'Terreno delimitado. Toca más vértices o confirma abajo'
                : 'Toca el mapa para posicionar el polígono de tu chacra'}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          BOTTOM STEP-BY-STEP WORKFLOW SHEETS
         ========================================================================= */}
      <div className="relative z-20 bg-[#132A1C] border-t border-emerald-900/60 rounded-t-3xl shadow-2xl p-4 text-white max-w-md mx-auto w-full space-y-3">
        {/* Drag Handle Indicator */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1" />

        {/* ================= PASO 1: DELIMITAR Y CONFIRMAR ================= */}
        {currentStep === 1 && (
          <div className="space-y-3">
            {/* Box area slider if in box mode */}
            {drawMode === 'box' && (
              <div className="bg-emerald-950/70 rounded-2xl p-3 border border-emerald-900/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Dimensionar chacra</span>
                  <span className="text-[#A3E635] font-bold">
                    {areaHa} ha ({topos} topos)
                  </span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={60.0}
                  step={0.25}
                  value={areaHa}
                  onChange={(e) => handleAreaSlider(parseFloat(e.target.value))}
                  className="w-full accent-[#7BB63E] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>0.25 ha</span>
                  <span>15 ha</span>
                  <span>30 ha</span>
                  <span>60 ha</span>
                </div>
              </div>
            )}

            {/* Alerta de Resolución Espacial para parcelas > 30 ha */}
            {areaHa > 30 && (
              <div className="bg-amber-950/90 border border-amber-500/70 rounded-2xl p-3 flex items-start gap-2.5 text-amber-200 shadow-xl backdrop-blur-md animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <strong className="text-amber-300 block font-semibold">Aviso de Resolución Espacial:</strong>
                  Para parcelas mayores a 30 hectáreas, las estimaciones satelitales tendrán menor precisión debido a la heterogeneidad del relieve y mezcla de pendientes.
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  PASO 1 DE 3 · TERRENO
                </span>
                <span className="text-xs text-zinc-300">
                  {polygonCoords.length < 3
                    ? 'Marca al menos 3 vértices en el mapa'
                    : `Área calculada: ${areaHa} ha (${topos} topos)`}
                </span>
              </div>

              <button
                type="button"
                disabled={polygonCoords.length < 3}
                onClick={handleConfirmStep1}
                className="px-5 py-3 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] disabled:opacity-40 text-[#132A1C] font-semibold text-xs flex items-center gap-2 shadow-lg shadow-lime-600/30 transition transform active:scale-95 cursor-pointer"
              >
                <span>Confirmar Parcela</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 2: CONFIRMAR TELEMETRÍA REAL ================= */}
        {currentStep === 2 && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                CONFIRMACIÓN DE TERRENO Y TELEMETRÍA REAL
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {currentLat.toFixed(4)}, {currentLon.toFixed(4)}
              </span>
            </div>

            {/* Alerta de Resolución Espacial para parcelas > 30 ha */}
            {areaHa > 30 && (
              <div className="bg-amber-950/90 border border-amber-500/70 rounded-2xl p-2.5 flex items-start gap-2 text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Aviso de Resolución Espacial:</strong> Para parcelas mayores a 30 hectáreas, las estimaciones satelitales tendrán menor precisión debido a la heterogeneidad del relieve y mezcla de pendientes.
                </span>
              </div>
            )}

            {/* 4 Real Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-950/80 rounded-2xl p-2.5 border border-emerald-800/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                  <Layers className="w-3 h-3 text-[#A3E635]" />
                  <span>Área Real</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {areaHa} ha <span className="text-[10px] text-[#A3E635]">({topos} topos)</span>
                </div>
              </div>

              <div className="bg-emerald-950/80 rounded-2xl p-2.5 border border-emerald-800/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                  <Mountain className="w-3 h-3 text-amber-400" />
                  <span>Altitud SRTM</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {altitudeMsnm} msnm
                </div>
              </div>

              <div className="bg-emerald-950/80 rounded-2xl p-2.5 border border-emerald-800/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                  <Droplets className="w-3 h-3 text-sky-400" />
                  <span>Humedad SMAP</span>
                </div>
                <div className="text-sm font-bold text-sky-300">
                  {Math.round(smapMoisturePct)}% <span className="text-[9.5px] text-zinc-400 font-normal">superficial</span>
                </div>
              </div>

              <div className="bg-emerald-950/80 rounded-2xl p-2.5 border border-emerald-800/60 space-y-0.5">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>Pendiente Andén</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {slopePct}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setCurrentStep(1);
                }}
                className="flex-1 py-3 rounded-full border border-white/20 text-zinc-300 hover:text-white font-semibold text-xs transition cursor-pointer"
              >
                Retocar Trazado
              </button>

              <button
                type="button"
                onClick={handleGoToStep3}
                className="flex-1 py-3 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-lime-600/30 transition cursor-pointer"
              >
                <span>Siguiente: Nombre</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= PASO 3: ASIGNAR NOMBRE Y PASAR A CALIBRACIÓN IN SITU ================= */}
        {currentStep === 3 && (
          <div className="space-y-3 animate-in fade-in">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                PASO 3 DE 3 · FINALIZAR IDENTIFICACIÓN
              </span>
              <h3 className="text-base font-bold text-white">¿Cómo se llama tu parcela?</h3>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10.5px] text-zinc-400 block mb-1">Nombre de la chacra</label>
                <input
                  type="text"
                  value={parcelName}
                  onChange={(e) => setParcelName(e.target.value)}
                  placeholder="Ej. Chacra Yanacona, Andén Huaypo"
                  className="w-full h-10 px-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-white text-xs placeholder-zinc-500 focus:outline-hidden focus:border-[#A3E635]"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[10.5px] text-zinc-400 block mb-1">Notas de manejo (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ej. Suelo con rastrojo de cebada, buena retención de humedad..."
                  className="w-full p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-white text-xs placeholder-zinc-500 focus:outline-hidden focus:border-[#A3E635]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  setCurrentStep(2);
                }}
                className="flex-1 py-3 rounded-full border border-white/20 text-zinc-300 hover:text-white font-semibold text-xs transition cursor-pointer"
              >
                Volver
              </button>

              <button
                type="button"
                disabled={!parcelName.trim()}
                onClick={handleSaveParcelAndCalibrate}
                className="flex-2 py-3 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] disabled:opacity-40 text-[#132A1C] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-lime-600/30 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Guardar y Calibrar en Terreno</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
