'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Search,
  Layers,
  MapPin,
  Check,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Sparkles,
  Sliders,
  Sprout,
  Compass,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import { ParcelItem } from '@/lib/types';
import { saveParcel } from '@/lib/deviceProfile';

interface ParcelDrawerFullScreenViewProps {
  onBack: () => void;
  onParcelCreated: (parcel: ParcelItem) => void;
  initialLat?: number;
  initialLon?: number;
  initialAreaHa?: number;
}

// Verified Peruvian Agricultural & Regional Coordinates
const PRESET_REGIONS = [
  { id: 'maras', name: 'Maras', fullName: 'Maras • Valle Sagrado', lat: -13.332, lon: -72.158, altitude: 3380, desc: 'Valle Sagrado • 3,380 msnm' },
  { id: 'chinchero', name: 'Chinchero', fullName: 'Chinchero • Cusco', lat: -13.393, lon: -72.049, altitude: 3760, desc: 'Meseta Andina • 3,760 msnm' },
  { id: 'urubamba', name: 'Urubamba', fullName: 'Valle de Urubamba', lat: -13.305, lon: -72.115, altitude: 2870, desc: 'Fondo de Valle • 2,870 msnm' },
  { id: 'anta', name: 'Anta', fullName: 'Pampa de Anta', lat: -13.415, lon: -72.235, altitude: 3450, desc: 'Llanura Cerealera • 3,450 msnm' },
  { id: 'ayaviri', name: 'Ayaviri', fullName: 'Melgar • Ayaviri', lat: -14.882, lon: -70.589, altitude: 3910, desc: 'Altiplano Norte • 3,910 msnm' },
  { id: 'majes', name: 'Majes', fullName: 'Irrigación Majes', lat: -16.325, lon: -72.208, altitude: 1400, desc: 'Arequipa • 1,400 msnm' },
  { id: 'puno', name: 'Puno', fullName: 'Puno • Titicaca', lat: -15.84, lon: -70.021, altitude: 3812, desc: 'Cuenca Lago • 3,812 msnm' },
];

const CROP_OPTIONS = [
  { id: 'papa_nativa', name: 'Papa nativa', category: 'Papa nativa', icon: '🥔' },
  { id: 'maiz_blanco', name: 'Maíz Blanco', category: 'Maíz', icon: '🌽' },
  { id: 'quinua_real', name: 'Quinua', category: 'Quinua', icon: '🌾' },
  { id: 'cebada_grano', name: 'Cebada Grano', category: 'Cebada', icon: '🌿' },
  { id: 'habas_tarwi', name: 'Habas y Tarwi', category: 'Habas', icon: '🌱' },
];

export default function ParcelDrawerFullScreenView({
  onBack,
  onParcelCreated,
  initialLat = -13.332,
  initialLon = -72.158,
  initialAreaHa = 1.73,
}: ParcelDrawerFullScreenViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);

  // Layers
  const satLayerRef = useRef<any>(null);
  const osmLayerRef = useRef<any>(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLon, setCurrentLon] = useState(initialLon);
  const [areaHa, setAreaHa] = useState(initialAreaHa);
  const [activeLayer, setActiveLayer] = useState<'sat' | 'qgis'>('sat');
  const [altitudeMsnm, setAltitudeMsnm] = useState(3380);

  // Form Fields for Confirmation
  const [parcelName, setParcelName] = useState('Chacra Yanacona');
  const [selectedCrop, setSelectedCrop] = useState(CROP_OPTIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeRegionId, setActiveRegionId] = useState('maras');

  const areaHaRef = useRef(areaHa);
  areaHaRef.current = areaHa;
  const isMountedRef = useRef(true);

  const topos = (areaHa * 3.3).toFixed(1);

  // Initialize Leaflet Map
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

      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLon],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Base Satellite (Esri)
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 19 }
      );
      satLayerRef.current = satLayer;

      // Base Cartographic (OpenStreetMap)
      const osmLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { maxZoom: 19 }
      );
      osmLayerRef.current = osmLayer;

      satLayer.addTo(map);

      // Render initial parcel polygon
      drawPolygon(L, map, currentLat, currentLon, areaHaRef.current);

      // Click to relocate center of parcel
      map.on('click', (e: any) => {
        playBubblePop();
        const { lat, lng } = e.latlng;
        setCurrentLat(lat);
        setCurrentLon(lng);
        drawPolygon(L, map, lat, lng, areaHaRef.current);
      });

      invalidateTimer = setTimeout(() => {
        if (!isMountedRef.current || !mapInstanceRef.current || !mapContainerRef.current) return;
        try {
          map.invalidateSize();
        } catch (e) {}
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
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        try {
          delete (mapContainerRef.current as any)._leaflet_id;
        } catch (e) {}
      }
    };
  }, []);

  // Update polygon geometry based on lat, lon, and area
  const drawPolygon = (L: any, map: any, lat: number, lon: number, ha: number) => {
    if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
    if (markerLayerRef.current) map.removeLayer(markerLayerRef.current);

    const sideMeters = Math.sqrt(ha * 10000);
    const dLat = (sideMeters / 2) / 111320;
    const dLon = (sideMeters / 2) / (111320 * Math.cos((lat * Math.PI) / 180));

    const coords = [
      [lat + dLat, lon - dLon],
      [lat + dLat * 1.04, lon + dLon],
      [lat - dLat, lon + dLon * 0.96],
      [lat - dLat * 1.03, lon - dLon],
    ];

    const poly = L.polygon(coords, {
      color: '#A3E635',
      weight: 3,
      opacity: 0.95,
      fillColor: '#7BB63E',
      fillOpacity: 0.28,
      dashArray: '4, 4',
    }).addTo(map);

    polygonLayerRef.current = poly;

    // Custom Centroid Pin Marker
    const iconHtml = `
      <div style="background-color: #132A1C; border: 2px solid #A3E635; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); white-space: nowrap; transform: translate(-50%, -50%);">
        <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: #A3E635;"></span>
        <span>${ha} ha</span>
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'tq-parcel-pin',
      iconSize: [0, 0],
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    markerLayerRef.current = marker;
  };

  // Fly to preset region
  const handleSelectRegion = (region: typeof PRESET_REGIONS[0]) => {
    playBubblePop();
    setActiveRegionId(region.id);
    setCurrentLat(region.lat);
    setCurrentLon(region.lon);
    setAltitudeMsnm(region.altitude);
    setParcelName(`Chacra ${region.name}`);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([region.lat, region.lon], 15, { duration: 1.2 });
      import('leaflet').then((mod) => {
        const L = mod.default;
        drawPolygon(L, mapInstanceRef.current, region.lat, region.lon, areaHa);
      });
    }
  };

  // Switch Layer
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

  // Handle area change
  const handleAreaSlider = (newArea: number) => {
    setAreaHa(newArea);
    areaHaRef.current = newArea;
    if (mapInstanceRef.current) {
      import('leaflet').then((mod) => {
        const L = mod.default;
        drawPolygon(L, mapInstanceRef.current, currentLat, currentLon, newArea);
      });
    }
  };

  // Search geocoding
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
          const mod = await import('leaflet');
          drawPolygon(mod.default, mapInstanceRef.current, lat, lon, areaHa);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Confirm and Save Parcel
  const handleConfirmAndSave = () => {
    playSuccessFanfare();

    const activeRegion = PRESET_REGIONS.find((r) => r.id === activeRegionId) || PRESET_REGIONS[0];

    const newParcel: ParcelItem = {
      id: `parcel-${Date.now()}`,
      name: parcelName.trim() || 'Mi Chacra Andina',
      cropId: selectedCrop.id,
      cropName: selectedCrop.name,
      cropCategory: selectedCrop.category,
      areaHa: Number(areaHa.toFixed(2)),
      areaTopos: Number((areaHa * 3.3).toFixed(1)),
      lat: currentLat,
      lon: currentLon,
      altitudeMsnm: altitudeMsnm,
      microcuenca: activeRegion.fullName,
      plantAgeDays: 35,
      estimatedYieldTons: Number((areaHa * 4.2).toFixed(1)),
      healthScore: 78,
      smapHumidity: 18,
      ndviScore: 0.68,
      photoUrl: '/images/andes_bright.jpg',
      notes: `Delimitada con visor satelital en ${activeRegion.name}.`,
      createdAt: new Date().toISOString(),
    };

    saveParcel(newParcel);
    onParcelCreated(newParcel);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white font-sans overflow-hidden">
      {/* 1. TOP HEADER & SEARCH BAR (GOOGLE MAPS STYLE) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto w-full pointer-events-auto space-y-2">
          {/* Main Top Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                onBack();
              }}
              className="w-10 h-10 rounded-full bg-[#132A1C]/90 hover:bg-[#132A1C] border border-white/20 text-white flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer backdrop-blur-md shrink-0"
              title="Volver a la aplicación"
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
        </div>
      </div>

      {/* 2. FULLSCREEN LEAFLET MAP CONTAINER */}
      <div className="flex-1 w-full h-full relative z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Live HUD Floating Badge (Top Right) */}
        <div className="absolute top-28 right-3 z-10 pointer-events-none">
          <div className="bg-[#132A1C]/90 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shadow-xl text-right space-y-1">
            <div className="flex items-center justify-end gap-1 text-[#A3E635] text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
              <span>VISOR QGIS</span>
            </div>
            <div className="text-xs font-semibold text-white">
              {areaHa} ha <span className="text-[10px] text-zinc-400">({topos} topos)</span>
            </div>
            <div className="text-[9.5px] text-zinc-300 font-mono">
              {altitudeMsnm} msnm
            </div>
          </div>
        </div>

        {/* Crosshair Center Instruction Overlay */}
        <div className="absolute bottom-60 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 text-[10px] text-white/90 shadow-md">
            Toca el mapa para centrar el polígono de tu chacra
          </div>
        </div>
      </div>

      {/* 3. BOTTOM CONFIRMATION DRAWER (CALCULATOR & SAVE) */}
      <div className="relative z-20 bg-[#132A1C] border-t border-emerald-900/60 rounded-t-3xl shadow-2xl p-4 text-white max-w-md mx-auto w-full space-y-3">
        {/* Drag Handle Indicator */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-2" />

        {/* Parcel Name and Crop Row */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400 uppercase text-[10px] tracking-wider">
              INFORMACIÓN DE TU PARCELA
            </span>
            <span className="text-zinc-400 text-[10px]">
              {currentLat.toFixed(4)}, {currentLon.toFixed(4)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Nombre de la parcela</label>
              <input
                type="text"
                value={parcelName}
                onChange={(e) => setParcelName(e.target.value)}
                placeholder="Ej. Chacra Yanacona"
                className="w-full h-9 px-3 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-white text-xs placeholder-zinc-500 focus:outline-hidden focus:border-[#A3E635]"
              />
            </div>

            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">Cultivo principal</label>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {CROP_OPTIONS.map((c) => {
                  const isSel = selectedCrop.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        playBubblePop();
                        setSelectedCrop(c);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-medium whitespace-nowrap transition cursor-pointer ${
                        isSel
                          ? 'bg-[#7BB63E] text-[#132A1C] font-bold'
                          : 'bg-emerald-950/80 border border-emerald-800/60 text-zinc-300'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Area Slider Control */}
        <div className="bg-emerald-950/70 rounded-2xl p-3 border border-emerald-900/60 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-300">Tamaño del terreno</span>
            <span className="text-[#A3E635] font-bold">
              {areaHa} hectáreas <span className="text-white/70 font-normal">({topos} topos)</span>
            </span>
          </div>
          <input
            type="range"
            min={0.25}
            max={10.0}
            step={0.25}
            value={areaHa}
            onChange={(e) => handleAreaSlider(parseFloat(e.target.value))}
            className="w-full accent-[#7BB63E] cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-zinc-400">
            <span>0.25 ha (0.8 topos)</span>
            <span>5.0 ha (16.5 topos)</span>
            <span>10.0 ha (33 topos)</span>
          </div>
        </div>

        {/* Action Button: Confirm and Save */}
        <button
          type="button"
          onClick={handleConfirmAndSave}
          className="w-full py-3.5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-lime-600/30 transition transform active:scale-98 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>Confirmar y Guardar en Mis Parcelas</span>
        </button>
      </div>
    </div>
  );
}
