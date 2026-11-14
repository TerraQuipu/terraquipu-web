'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Droplets,
  Sprout,
  Mountain,
  MapPin,
  Pencil,
  Crosshair,
  Trash2,
  Check,
  Download,
  AlertCircle,
  Maximize2,
} from 'lucide-react';
import {
  ActiveParcel,
  calculateParcelAreaHa,
  calculateParcelCentroid,
  estimateTerrainMetrics,
  generateQgisGeoJson,
  downloadGeoJsonFile,
} from '@/lib/geoUtils';

interface MapViewerProps {
  activeParcel: ActiveParcel;
  onSelectParcel: (parcel: ActiveParcel) => void;
  climateMode: 'normal' | 'nino';
  onShowToast: (msg: string) => void;
  previousCrop?: string;
  recommendedCrop?: string;
}

// Preset reference andenes in Chinchero
const PRESET_PARCELS: Record<string, ActiveParcel> = {
  yanacona: {
    id: 'P-01',
    name: 'Chacra Pukara • Sector Yanacona',
    areaHa: 1.68,
    slopePct: 14.0,
    elevationMsnm: 3754,
    smapMoisturePct: 41.2,
    ndvi: 0.68,
    center: [-13.3934, -72.0498],
    bounds: [
      [-13.3918, -72.0515],
      [-13.3912, -72.0475],
      [-13.3948, -72.047],
      [-13.3952, -72.051],
    ],
    isCustom: false,
  },
  taucca: {
    id: 'P-02',
    name: 'Ayllu Taucca • Andén Alto',
    areaHa: 2.4,
    slopePct: 8.0,
    elevationMsnm: 3740,
    smapMoisturePct: 38.0,
    ndvi: 0.74,
    center: [-13.391, -72.05],
    bounds: [
      [-13.3895, -72.0515],
      [-13.389, -72.0485],
      [-13.392, -72.048],
      [-13.3925, -72.051],
    ],
    isCustom: false,
  },
  cuper: {
    id: 'P-03',
    name: 'Cuper Alto • Quebrada Piuray',
    areaHa: 0.95,
    slopePct: 19.0,
    elevationMsnm: 3780,
    smapMoisturePct: 46.1,
    ndvi: 0.61,
    center: [-13.3925, -72.044],
    bounds: [
      [-13.391, -72.0455],
      [-13.3905, -72.0425],
      [-13.394, -72.042],
      [-13.3945, -72.045],
    ],
    isCustom: false,
  },
};

export default function MapViewer({
  activeParcel,
  onSelectParcel,
  climateMode,
  onShowToast,
  previousCrop = 'Papa Nativa',
  recommendedCrop = 'Tarwi Chocho INIA-445',
}: MapViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const activePolygonRef = useRef<any>(null);
  const presetLayersRef = useRef<Record<string, any>>({});
  const markerRef = useRef<any>(null);
  const tileLayersRef = useRef<{ osm: any; sat: any; topo: any } | null>(null);

  // Drawing mode refs & state
  const [drawMode, setDrawMode] = useState<'none' | 'polygon' | 'point'>('none');
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const drawPointsRef = useRef<[number, number][]>([]);
  const tempPolylineRef = useRef<any>(null);
  const tempMarkersRef = useRef<any[]>([]);

  // Base map & sensor layer states
  const [activeBaseMap, setActiveBaseMap] = useState<'osm' | 'sat' | 'topo'>('osm');
  const [activeNasaLayer, setActiveNasaLayer] = useState<'smap' | 'ndvi' | 'srtm'>('smap');
  const [mouseCoords, setMouseCoords] = useState<string>('-13.3934° S, -72.0498° W');

  // Keep drawPointsRef in sync
  useEffect(() => {
    drawPointsRef.current = drawPoints;
  }, [drawPoints]);

  // Initialize Leaflet Map on Client
  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      if (!isMounted || !mapContainerRef.current) return;

      // 1. Initialize Map centered at Chinchero
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView(activeParcel.center, 15);

      mapInstanceRef.current = map;

      // 2. Add Zoom Control to Bottom Right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // 3. Tile Layers (Free, Fast, CDN without API key requirements)
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      });

      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 18,
          attribution: 'Esri, Maxar | Terraquipu',
        }
      );

      const cartoLayer = L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '© CARTO, © OpenStreetMap',
        }
      );

      tileLayersRef.current = { osm: osmLayer, sat: satLayer, topo: cartoLayer };
      osmLayer.addTo(map);

      // 4. Coordinates tracker
      map.on('mousemove', (e: any) => {
        setMouseCoords(`${e.latlng.lat.toFixed(4)}° S, ${e.latlng.lng.toFixed(4)}° W`);
      });

      // 5. Radar Pulse Marker on Centroid
      const radarIcon = L.divIcon({
        className: 'pulse-radar',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      const marker = L.marker(activeParcel.center, { icon: radarIcon }).addTo(map);
      markerRef.current = marker;

      // 6. Draw Active Polygon
      const polygon = L.polygon(activeParcel.bounds, {
        color: '#059669',
        weight: 3.5,
        fillColor: '#10b981',
        fillOpacity: 0.35,
      }).addTo(map);

      polygon.bindTooltip(
        `<strong>${activeParcel.name}</strong><br><span style="color:#52525b">Área: ${activeParcel.areaHa.toFixed(2)} ha • Pendiente: ${activeParcel.slopePct}%</span>`,
        {
          direction: 'center',
          className:
            'bg-white text-zinc-950 border border-zinc-300 px-2.5 py-1 rounded-md text-xs shadow-sm font-sans',
        }
      );
      activePolygonRef.current = polygon;

      // 7. Interactive Map Click for Drawing Modes
      map.on('click', async (e: any) => {
        const clickedLatLng: [number, number] = [
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6)),
        ];

        // Access current mode directly from attribute or closure
        const currentMode = map.getContainer().getAttribute('data-draw-mode');

        if (currentMode === 'point') {
          // Quick 1-click parcel generation: Standard Andean family chacra (~1.20 ha, ~110m x ~108m)
          const deltaLat = 0.0005; // ~55.5 meters radius (total height ~111m)
          const deltaLng = 0.0005; // ~54 meters radius (total width ~108m)
          const newBounds: [number, number][] = [
            [clickedLatLng[0] + deltaLat, clickedLatLng[1] - deltaLng],
            [clickedLatLng[0] + deltaLat, clickedLatLng[1] + deltaLng],
            [clickedLatLng[0] - deltaLat, clickedLatLng[1] + deltaLng],
            [clickedLatLng[0] - deltaLat, clickedLatLng[1] - deltaLng],
          ];

          const areaHa = calculateParcelAreaHa(newBounds);
          const terrain = estimateTerrainMetrics(clickedLatLng, areaHa);

          const newParcel: ActiveParcel = {
            id: `custom-${Date.now()}`,
            name: `Chacra Familiar (${clickedLatLng[0].toFixed(4)}, ${clickedLatLng[1].toFixed(4)})`,
            areaHa,
            slopePct: terrain.slopePct,
            elevationMsnm: terrain.elevationMsnm,
            smapMoisturePct: terrain.smapMoisturePct,
            ndvi: terrain.ndvi,
            center: clickedLatLng,
            bounds: newBounds,
            isCustom: true,
          };

          onSelectParcel(newParcel);
          setDrawMode('none');
          map.getContainer().removeAttribute('data-draw-mode');
          map.getContainer().style.cursor = '';
          onShowToast(`Chacra familiar de ${areaHa.toFixed(2)} ha delimitada en el terreno`);
        } else if (currentMode === 'polygon') {
          // Polygon vertex placement
          const updated = [...drawPointsRef.current, clickedLatLng];
          setDrawPoints(updated);
          drawPointsRef.current = updated;

          // Add a visual vertex dot
          const vertexMarker = L.circleMarker(clickedLatLng, {
            radius: 5,
            color: '#10b981',
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2,
          }).addTo(map);
          tempMarkersRef.current.push(vertexMarker);

          // Update connecting polyline
          if (tempPolylineRef.current) {
            tempPolylineRef.current.setLatLngs(updated);
          } else {
            tempPolylineRef.current = L.polyline(updated, {
              color: '#059669',
              weight: 3,
              dashArray: '5, 5',
            }).addTo(map);
          }
        }
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync drawMode attribute on map container for click handler
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (drawMode !== 'none') {
      mapContainerRef.current.setAttribute('data-draw-mode', drawMode);
      mapContainerRef.current.style.cursor = 'crosshair';
    } else {
      mapContainerRef.current.removeAttribute('data-draw-mode');
      mapContainerRef.current.style.cursor = '';
    }
  }, [drawMode]);

  // Update Polygon and Camera when activeParcel changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Smoothly fly camera to new parcel
    mapInstanceRef.current.flyTo(activeParcel.center, 15, { duration: 1.0 });

    // Update marker position
    if (markerRef.current) {
      markerRef.current.setLatLng(activeParcel.center);
    }

    // Update polygon geometry and styling
    if (activePolygonRef.current) {
      activePolygonRef.current.setLatLngs(activeParcel.bounds);
      activePolygonRef.current.setStyle({
        color: activeParcel.isCustom ? '#2563eb' : '#059669',
        fillColor: activeParcel.isCustom ? '#3b82f6' : '#10b981',
        weight: 3.5,
        fillOpacity: 0.38,
      });

      activePolygonRef.current.setTooltipContent(
        `<strong>${activeParcel.name}</strong><br><span style="color:#52525b">Área: ${activeParcel.areaHa.toFixed(2)} ha • Pendiente: ${activeParcel.slopePct}%</span>`
      );
    }
  }, [activeParcel]);

  // Finish polygon drawing
  const handleFinishPolygon = () => {
    if (drawPoints.length < 3) {
      onShowToast('Debes marcar al menos 3 puntos en el mapa para delimitar tu parcela');
      return;
    }

    const areaHa = calculateParcelAreaHa(drawPoints);
    const center = calculateParcelCentroid(drawPoints);
    const terrain = estimateTerrainMetrics(center, areaHa);

    const newParcel: ActiveParcel = {
      id: `custom-poly-${Date.now()}`,
      name: `Parcela Trazada (${areaHa.toFixed(2)} ha)`,
      areaHa,
      slopePct: terrain.slopePct,
      elevationMsnm: terrain.elevationMsnm,
      smapMoisturePct: terrain.smapMoisturePct,
      ndvi: terrain.ndvi,
      center,
      bounds: drawPoints,
      isCustom: true,
    };

    // Clean up temporary drawing layers
    if (tempPolylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempPolylineRef.current);
      tempPolylineRef.current = null;
    }
    tempMarkersRef.current.forEach((m) => {
      if (mapInstanceRef.current) mapInstanceRef.current.removeLayer(m);
    });
    tempMarkersRef.current = [];

    setDrawPoints([]);
    drawPointsRef.current = [];
    setDrawMode('none');

    onSelectParcel(newParcel);
    onShowToast(`Parcela delimitada con éxito: ${areaHa.toFixed(2)} ha calculadas`);
  };

  // Cancel drawing
  const handleCancelDrawing = () => {
    if (tempPolylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tempPolylineRef.current);
      tempPolylineRef.current = null;
    }
    tempMarkersRef.current.forEach((m) => {
      if (mapInstanceRef.current) mapInstanceRef.current.removeLayer(m);
    });
    tempMarkersRef.current = [];
    setDrawPoints([]);
    drawPointsRef.current = [];
    setDrawMode('none');
    onShowToast('Modo dibujo cancelado');
  };

  // Handle Preset Selection
  const handleSelectPreset = (key: 'yanacona' | 'taucca' | 'cuper') => {
    const preset = PRESET_PARCELS[key];
    if (preset) {
      handleCancelDrawing();
      onSelectParcel(preset);
      onShowToast(`Sector ${preset.name} seleccionado`);
    }
  };

  // Handle Base Layer Switcher
  const handleBaseLayerChange = (layer: 'osm' | 'sat' | 'topo') => {
    if (!mapInstanceRef.current || !tileLayersRef.current) return;
    const { osm, sat, topo } = tileLayersRef.current;

    mapInstanceRef.current.removeLayer(osm);
    mapInstanceRef.current.removeLayer(sat);
    mapInstanceRef.current.removeLayer(topo);

    if (layer === 'sat') {
      sat.addTo(mapInstanceRef.current);
      onShowToast('Capa satelital de alta resolución (Esri World Imagery) activada');
    } else if (layer === 'topo') {
      topo.addTo(mapInstanceRef.current);
      onShowToast('Capa topográfica (curvas de nivel) activada');
    } else {
      osm.addTo(mapInstanceRef.current);
      onShowToast('Cartografía base OpenStreetMap activada');
    }

    setActiveBaseMap(layer);
  };

  const handleNasaLayerChange = (layer: 'smap' | 'ndvi' | 'srtm') => {
    setActiveNasaLayer(layer);
    const names = {
      smap: 'SMAP L4 Humedad Radicular (NASA SMAP 9km -> 30m)',
      ndvi: 'NDVI Vigor Vegetal (Sentinel-2 / HLS NASA)',
      srtm: 'SRTM 30m Modelo Digital de Elevación & Pendiente',
    };
    onShowToast(`Sensor activado: ${names[layer]}`);
  };

  // Export current parcel to QGIS
  const handleExportQgis = () => {
    const geojson = generateQgisGeoJson(activeParcel, {
      previousCrop,
      recommendedCrop,
      nitrogenGain: '+95 kg N/ha',
      savingsSoles: 320,
    });
    const filename = `parcela_${activeParcel.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.geojson`;
    downloadGeoJsonFile(filename, geojson);
    onShowToast(`Exportando ${filename} listo para QGIS 3.x`);
  };

  return (
    <div className="w-full lg:w-[60%] h-full relative flex flex-col border-r border-zinc-200 bg-zinc-100 overflow-hidden select-none">
      {/* Top Floating Toolbar: Area Delimitation & Drawing Controls */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Drawing & Selection Tools */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-1.5 overflow-x-auto max-w-full">
          <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider px-1.5 flex items-center gap-1 border-r border-zinc-200">
            <MapPin className="w-3.5 h-3.5 text-zinc-800" /> Área:
          </span>

          {/* Polygon Drawing Tool */}
          <button
            onClick={() => {
              if (drawMode === 'polygon') {
                handleCancelDrawing();
              } else {
                handleCancelDrawing();
                setDrawMode('polygon');
                onShowToast('Modo Trazar Parcela: Haz clics en el mapa para marcar los límites');
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              drawMode === 'polygon'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
            title="Trazar los límites de tu parcela haciendo clics en el mapa"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Trazar Parcela</span>
          </button>

          {/* Quick 1-Click Point Area Tool */}
          <button
            onClick={() => {
              if (drawMode === 'point') {
                handleCancelDrawing();
              } else {
                handleCancelDrawing();
                setDrawMode('point');
                onShowToast('Modo Clic Rápido: Haz clic en cualquier terreno para delimitarlo');
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              drawMode === 'point'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
            title="Haz un solo clic sobre tu terreno para seleccionarlo automáticamente"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Clic en Terreno</span>
          </button>

          <span className="h-4 w-px bg-zinc-200 mx-0.5" />

          {/* Preset Andenes Pills */}
          <button
            onClick={() => handleSelectPreset('yanacona')}
            className={`px-2 py-1 rounded-md text-xs font-medium transition ${
              !activeParcel.isCustom && activeParcel.id === 'P-01'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Yanacona
          </button>

          <button
            onClick={() => handleSelectPreset('taucca')}
            className={`px-2 py-1 rounded-md text-xs font-medium transition ${
              !activeParcel.isCustom && activeParcel.id === 'P-02'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Taucca
          </button>

          <button
            onClick={() => handleSelectPreset('cuper')}
            className={`px-2 py-1 rounded-md text-xs font-medium transition ${
              !activeParcel.isCustom && activeParcel.id === 'P-03'
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            Cuper
          </button>
        </div>

        {/* NASA Telemetry Sensor Switcher */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-1 text-xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase px-1.5">Sensor:</span>

          <button
            onClick={() => handleNasaLayerChange('smap')}
            className={`px-2 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
              activeNasaLayer === 'smap'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>SMAP</span>
          </button>

          <button
            onClick={() => handleNasaLayerChange('ndvi')}
            className={`px-2 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
              activeNasaLayer === 'ndvi'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-500" />
            <span>NDVI</span>
          </button>

          <button
            onClick={() => handleNasaLayerChange('srtm')}
            className={`px-2 py-1 rounded-md text-xs font-semibold transition flex items-center gap-1 ${
              activeNasaLayer === 'srtm'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Mountain className="w-3.5 h-3.5 text-amber-500" />
            <span>SRTM</span>
          </button>
        </div>
      </div>

      {/* Active Drawing Banner Notice */}
      {drawMode !== 'none' && (
        <div className="absolute top-16 left-3 right-3 z-30 pointer-events-auto flex items-center justify-between bg-blue-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-blue-700 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-300 animate-pulse" />
            {drawMode === 'polygon' ? (
              <span>
                <strong>Modo Trazar:</strong> Haz clic en el mapa para marcar vértices ({drawPoints.length} puntos marcados). Mínimo 3 puntos.
              </span>
            ) : (
              <span>
                <strong>Modo Clic Rápido:</strong> Haz un solo clic sobre cualquier parte del valle para delimitar tu parcela.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {drawMode === 'polygon' && drawPoints.length >= 3 && (
              <button
                onClick={handleFinishPolygon}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Finalizar Trazado</span>
              </button>
            )}
            <button
              onClick={handleCancelDrawing}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2.5 py-1 rounded-md text-xs transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Real OpenStreetMap Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full relative" />

      {/* Selected Parcel Floating HUD Card (Bottom-Left Float) */}
      <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-zinc-200 shadow-md max-w-sm pointer-events-auto">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Parcela Activa
              </span>
              {activeParcel.isCustom && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Área Libre
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-zinc-950 leading-tight">
              {activeParcel.name}
            </h4>
          </div>

          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-900 border border-zinc-200 font-mono">
            {activeParcel.areaHa.toFixed(2)} ha
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-2.5">
          <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
            <span className="text-[10px] text-zinc-500 font-medium block">Humedad SMAP</span>
            <span className="font-bold text-zinc-950 text-sm font-mono">
              {climateMode === 'nino'
                ? `${(activeParcel.smapMoisturePct * 0.58).toFixed(1)}%`
                : `${activeParcel.smapMoisturePct.toFixed(1)}%`}
            </span>
          </div>
          <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
            <span className="text-[10px] text-zinc-500 font-medium block">NDVI Sat</span>
            <span className="font-bold text-emerald-700 text-sm font-mono">
              {activeParcel.ndvi.toFixed(2)}
            </span>
          </div>
          <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
            <span className="text-[10px] text-zinc-500 font-medium block">Pendiente</span>
            <span className="font-bold text-zinc-900 text-sm font-mono">
              {activeParcel.slopePct}% L{activeParcel.slopePct > 15 ? '3' : activeParcel.slopePct > 10 ? '2' : '1'}
            </span>
          </div>
        </div>

        {/* One-Click Export to QGIS Button */}
        <button
          onClick={handleExportQgis}
          className="w-full py-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
          title="Descargar capa GeoJSON para abrir directamente en QGIS 3.x"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Exportar Parcela a QGIS (.geojson)</span>
        </button>
      </div>

      {/* Bottom-Right Controls: Map Layer Switcher & Coordinates HUD */}
      <div className="absolute bottom-3 right-12 z-30 flex items-center gap-2 pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-md border border-zinc-200 shadow-sm text-xs text-zinc-600 hidden sm:flex items-center gap-1.5">
          <span>Coords:</span>
          <strong className="text-zinc-950 font-mono text-[11px]">{mouseCoords}</strong>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-1 rounded-md border border-zinc-200 shadow-sm flex text-xs font-semibold">
          <button
            onClick={() => handleBaseLayerChange('osm')}
            className={`px-2 py-1 rounded transition ${
              activeBaseMap === 'osm'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            OpenStreetMap
          </button>
          <button
            onClick={() => handleBaseLayerChange('topo')}
            className={`px-2 py-1 rounded transition ${
              activeBaseMap === 'topo'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Topográfico
          </button>
          <button
            onClick={() => handleBaseLayerChange('sat')}
            className={`px-2 py-1 rounded transition ${
              activeBaseMap === 'sat'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            Satélite
          </button>
        </div>
      </div>
    </div>
  );
}
