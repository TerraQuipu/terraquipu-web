'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Navigation, Layers, MapPin, ZoomIn, ZoomOut, Sliders } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface InteractiveParcelSelectorMapProps {
  initialLat?: number;
  initialLon?: number;
  initialAreaHa?: number;
  onChange: (data: { areaHa: number; lat: number; lon: number; locationName?: string }) => void;
}

// Verified Peruvian Agricultural & Regional Coordinates
const PRESET_REGIONS = [
  { id: 'puno', name: 'Puno', fullName: 'Puno • Lago Titicaca', lat: -15.8402, lon: -70.0219, zoom: 14, desc: 'Altiplano Sur • 3812m' },
  { id: 'arequipa', name: 'Arequipa', fullName: 'Arequipa • Valle Chili', lat: -16.4090, lon: -71.5375, zoom: 14, desc: 'Campiña Arequipeña • 2325m' },
  { id: 'maras', name: 'Cusco (Maras)', fullName: 'Cusco • Maras / Urubamba', lat: -13.3320, lon: -72.1580, zoom: 14, desc: 'Valle Sagrado • 3380m' },
  { id: 'anta', name: 'Cusco (Anta)', fullName: 'Cusco • Pampa de Anta', lat: -13.4150, lon: -72.2350, zoom: 14, desc: 'Llanura Andina • 3450m' },
  { id: 'ayaviri', name: 'Melgar (Ayaviri)', fullName: 'Puno • Ayaviri / Melgar', lat: -14.8820, lon: -70.5890, zoom: 14, desc: 'Altiplano Norte • 3910m' },
  { id: 'majes', name: 'Majes', fullName: 'Arequipa • Irrigación Majes', lat: -16.3250, lon: -72.2080, zoom: 14, desc: 'Majes • 1400m' },
];

export default function InteractiveParcelSelectorMap({
  initialLat = -13.332,
  initialLon = -72.158,
  initialAreaHa = 1.0,
  onChange,
}: InteractiveParcelSelectorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);

  // Layers
  const qgisOsmLayerRef = useRef<any>(null);
  const esriSatLayerRef = useRef<any>(null);
  const esriLabelsLayerRef = useRef<any>(null);

  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLon, setCurrentLon] = useState(initialLon);
  const [areaHa, setAreaHa] = useState(initialAreaHa);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  // Default to QGIS / OpenStreetMap so city labels (Puno, Arequipa, Cusco, roads) are 100% visible with zero watermarks (same as Visor Técnico)
  const [activeLayer, setActiveLayer] = useState<'qgis' | 'sat'>('qgis');
  const [locationLabel, setLocationLabel] = useState('Valle Sagrado - Cusco');

  // Active refs to avoid stale closures in Leaflet event listeners
  const areaHaRef = useRef(areaHa);
  areaHaRef.current = areaHa;
  const locationLabelRef = useRef(locationLabel);
  locationLabelRef.current = locationLabel;
  const isMountedRef = useRef(true);

  // Sync if initialAreaHa changes from parent
  useEffect(() => {
    if (initialAreaHa !== undefined && initialAreaHa !== areaHaRef.current) {
      setAreaHa(initialAreaHa);
      areaHaRef.current = initialAreaHa;
    }
  }, [initialAreaHa]);

  // Topos andinos conversion (1 ha ≈ 3.33 topos en sierra peruana)
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

      // Safe getPosition monkey-patch to prevent _leaflet_pos runtime errors
      if (L && L.DomUtil) {
        const origGetPosition = L.DomUtil.getPosition;
        L.DomUtil.getPosition = function (el: any) {
          if (!el) {
            return (L.Point ? new L.Point(0, 0) : { x: 0, y: 0 }) as any;
          }
          try {
            return origGetPosition ? origGetPosition.call(L.DomUtil, el) : (el._leaflet_pos || { x: 0, y: 0 });
          } catch {
            return (el._leaflet_pos || { x: 0, y: 0 }) as any;
          }
        };
      }

      // Clean existing leaflet id if re-mounting
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }

      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLon],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        minZoom: 5,
        maxZoom: 18,
      });

      // Assign map instance immediately
      mapInstanceRef.current = map;

      if (!isMountedRef.current || !mapContainerRef.current || !document.body.contains(mapContainerRef.current)) {
        try { map.remove(); } catch (e) {}
        mapInstanceRef.current = null;
        return;
      }

      // 1. OpenStreetMap (QGIS Standard / Visor Técnico):
      // Free, no API key, zero watermarks, crystal clear labels for Puno, Arequipa, Cusco, roads, rivers & borders
      const qgisOsm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors | QGIS',
      });

      // 2. ESRI World Imagery: CORRECT ArcGIS format is {z}/{y}/{x} (Row y, Col x)
      const esriSat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18, attribution: 'Esri, Maxar' }
      );

      // 3. ESRI Boundaries and Labels overlay
      const esriLabels = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        { maxZoom: 18 }
      );

      // Add default QGIS / OpenStreetMap layer (identical to Visor Técnico)
      try {
        qgisOsm.addTo(map);
      } catch (e) {}

      qgisOsmLayerRef.current = qgisOsm;
      esriSatLayerRef.current = esriSat;
      esriLabelsLayerRef.current = esriLabels;

      // Click to reposition parcel (Reads areaHaRef to ALWAYS respect farmer's chosen area, never stale closure)
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setCurrentLat(lat);
        setCurrentLon(lng);
        playBubblePop();
        const activeArea = areaHaRef.current;
        drawParcelPolygon(L, map, lat, lng, activeArea);
        onChange({ areaHa: activeArea, lat, lon: lng, locationName: locationLabelRef.current });
      });

      drawParcelPolygon(L, map, currentLat, currentLon, areaHaRef.current);

      invalidateTimer = setTimeout(() => {
        if (!isMountedRef.current || !mapInstanceRef.current || !mapContainerRef.current) return;
        try {
          const map = mapInstanceRef.current;
          const container = mapContainerRef.current;
          if (
            container &&
            document.body.contains(container) &&
            map &&
            map._mapPane &&
            map._loaded &&
            !map._animatingZoom
          ) {
            map.invalidateSize({ pan: false, debounceMoveEnd: true });
          }
        } catch (e) {
          // Leaflet unmounted safely
        }
      }, 250);
    };

    initMap();

    return () => {
      isMountedRef.current = false;
      if (invalidateTimer) {
        clearTimeout(invalidateTimer);
        invalidateTimer = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        try {
          delete (mapContainerRef.current as any)._leaflet_id;
        } catch (e) {}
      }
    };
  }, []);

  // Update polygon whenever areaHa or coordinates change
  const drawParcelPolygon = (L: any, map: any, lat: number, lon: number, ha: number) => {
    if (polygonLayerRef.current) map.removeLayer(polygonLayerRef.current);
    if (markerLayerRef.current) map.removeLayer(markerLayerRef.current);

    // Calculate bounding box in meters: area in m2 = ha * 10,000
    // side length s = sqrt(area) in meters
    // 1 deg lat ≈ 111,320 m
    // 1 deg lon ≈ 111,320 * cos(lat) m
    const sideMeters = Math.sqrt(ha * 10000);
    const dLat = (sideMeters / 2) / 111320;
    const dLon = (sideMeters / 2) / (111320 * Math.cos((lat * Math.PI) / 180));

    const coords = [
      [lat + dLat, lon - dLon],
      [lat + dLat * 1.05, lon + dLon],
      [lat - dLat, lon + dLon * 0.95],
      [lat - dLat * 1.05, lon - dLon],
    ];

    const poly = L.polygon(coords, {
      color: '#059669',
      weight: 3.5,
      fillColor: '#10b981',
      fillOpacity: 0.45,
      dashArray: '6, 6',
    }).addTo(map);

    const customIcon = L.divIcon({
      className: 'parcel-center-marker',
      html: `
        <div style="background-color: #047857; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 18px; transform: translate(-50%, -50%);">
          🌱
        </div>
      `,
      iconSize: [0, 0],
    });

    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);

    polygonLayerRef.current = poly;
    markerLayerRef.current = marker;
  };

  const handleAreaChange = (newHa: number) => {
    const clamped = Math.max(0.1, Math.min(25.0, Math.round(newHa * 10) / 10));
    setAreaHa(clamped);
    areaHaRef.current = clamped;
    playBubblePop();
    if (mapInstanceRef.current) {
      import('leaflet').then(({ default: L }) => {
        if (!mapInstanceRef.current) return;
        drawParcelPolygon(L, mapInstanceRef.current, currentLat, currentLon, clamped);
      });
    }
    onChange({ areaHa: clamped, lat: currentLat, lon: currentLon, locationName: locationLabelRef.current });
  };

  const flyToCoords = (lat: number, lon: number, name: string, zoom = 14) => {
    playBubblePop();
    setCurrentLat(lat);
    setCurrentLon(lon);
    setLocationLabel(name);
    locationLabelRef.current = name;
    const currentArea = areaHaRef.current;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], zoom, { duration: 1.2 });
      import('leaflet').then(({ default: L }) => {
        if (!mapInstanceRef.current) return;
        drawParcelPolygon(L, mapInstanceRef.current, lat, lon, currentArea);
      });
    }
    onChange({ areaHa: currentArea, lat, lon, locationName: name });
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    setIsSearching(true);
    playBubblePop();

    // 1. Check exact or partial preset matches (Puno, Arequipa, Cusco, Anta, etc.)
    const preset = PRESET_REGIONS.find((p) =>
      p.name.toLowerCase().includes(query) ||
      p.fullName.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query)
    );

    if (preset) {
      flyToCoords(preset.lat, preset.lon, preset.fullName, preset.zoom);
      setIsSearching(false);
      setSearchQuery('');
      return;
    }

    // 2. Fallback to OpenStreetMap Nominatim restricted to Peru
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=pe&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const name = item.display_name.split(',')[0];
        flyToCoords(lat, lon, name, 14);
      } else {
        alert(`No encontramos "${searchQuery}" en Perú. Puedes pulsar los botones directos de Puno, Arequipa o Cusco.`);
      }
    } catch (err) {
      console.error('Error in search:', err);
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  const toggleLayer = () => {
    playBubblePop();
    if (!mapInstanceRef.current || !qgisOsmLayerRef.current || !esriSatLayerRef.current) return;

    if (activeLayer === 'qgis') {
      // Switch to Satellite + Labels Overlay
      mapInstanceRef.current.removeLayer(qgisOsmLayerRef.current);
      esriSatLayerRef.current.addTo(mapInstanceRef.current);
      if (esriLabelsLayerRef.current) esriLabelsLayerRef.current.addTo(mapInstanceRef.current);
      setActiveLayer('sat');
    } else {
      // Switch back to QGIS / OpenStreetMap (Standard Visor Layer)
      mapInstanceRef.current.removeLayer(esriSatLayerRef.current);
      if (esriLabelsLayerRef.current) mapInstanceRef.current.removeLayer(esriLabelsLayerRef.current);
      qgisOsmLayerRef.current.addTo(mapInstanceRef.current);
      setActiveLayer('qgis');
    }
  };

  const handleZoomIn = () => {
    playBubblePop();
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    playBubblePop();
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleLocateGPS = () => {
    playBubblePop();
    if (typeof window === 'undefined' || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        flyToCoords(lat, lon, 'Mi ubicación GPS actual', 15);
      },
      () => {
        alert('GPS no disponible. Usa los botones directos de Puno, Arequipa o Cusco.');
      },
      { timeout: 7000 }
    );
  };

  return (
    <div className="space-y-3">
      {/* 1. Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ciudad o distrito: Puno, Arequipa, Cusco..."
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border-2 border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-medium shadow-xs"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs border-b-2 border-b-emerald-900 active:translate-y-0.5 transition cursor-pointer"
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {/* 2. Direct Region Pills (Puno, Arequipa, Cusco, etc.) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-shrink-0">
          Directos:
        </span>
        {PRESET_REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => flyToCoords(r.lat, r.lon, r.fullName, r.zoom)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-950 text-slate-700 font-extrabold border-2 border-slate-200 border-b-2 hover:border-emerald-500 flex-shrink-0 transition active:scale-95 cursor-pointer shadow-xs flex items-center gap-1"
          >
            <MapPin className="w-3 h-3 text-emerald-700" />
            <span>{r.name}</span>
          </button>
        ))}
      </div>

      {/* 3. Interactive Leaflet Map Container */}
      <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden border-2 border-emerald-600 border-b-4 border-b-emerald-700 shadow-md bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Top Header Floating Badge */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-slate-900 text-[11px] font-bold border border-slate-200 shadow-sm flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{locationLabel}</span>
          </span>
          <span className="text-emerald-800 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
            {activeLayer === 'qgis' ? '🗺️ Mapa QGIS / Ciudades' : '🛰️ Satélite Híbrido'}
          </span>
        </div>

        {/* Floating Side Controls (Zoom & Layers) */}
        <div className="absolute top-12 right-2.5 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={toggleLayer}
            className="p-2 rounded-xl bg-white text-slate-800 shadow-md border border-slate-200 transition active:scale-95 cursor-pointer hover:bg-emerald-50"
            title={activeLayer === 'qgis' ? 'Cambiar a Satélite Híbrido' : 'Cambiar a Mapa QGIS'}
          >
            <Layers className="w-4 h-4 text-emerald-800" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-white text-slate-800 shadow-md border border-slate-200 transition active:scale-95 cursor-pointer hover:bg-slate-50"
            title="Acercar mapa (+)"
          >
            <ZoomIn className="w-4 h-4 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-white text-slate-800 shadow-md border border-slate-200 transition active:scale-95 cursor-pointer hover:bg-slate-50"
            title="Alejar mapa (-)"
          >
            <ZoomOut className="w-4 h-4 text-slate-700" />
          </button>
          <button
            type="button"
            onClick={handleLocateGPS}
            className="p-2 rounded-xl bg-white text-blue-600 shadow-md border border-slate-200 transition active:scale-95 cursor-pointer hover:bg-blue-50"
            title="Ir a mi GPS actual"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Coordinates & Area Status Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 px-3 py-2 rounded-2xl bg-slate-950/90 text-white backdrop-blur-md border border-emerald-500/40 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-black text-white">
                {areaHa} ha <span className="text-emerald-300 font-normal">({topos} topos andinos)</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentLat.toFixed(4)}° S, {currentLon.toFixed(4)}° W
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            ✓ Parcela Trazada
          </span>
        </div>
      </div>

      {/* 4. Interactive Area Sizer Slider & Quick Buttons */}
      <div className="p-3.5 bg-white rounded-2xl border-2 border-slate-200 border-b-4 border-b-slate-300 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ajustar tamaño de la parcela:</span>
          </span>
          <span className="text-xs font-black text-emerald-800 font-mono">
            {areaHa} Hectáreas
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0.1"
          max="8.0"
          step="0.1"
          value={areaHa}
          onChange={(e) => handleAreaChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
        />

        {/* Quick Size Chips */}
        <div className="grid grid-cols-4 gap-1.5 pt-0.5">
          {[
            { ha: 0.5, label: '0.5 ha' },
            { ha: 1.0, label: '1.0 ha' },
            { ha: 2.4, label: '2.4 ha' },
            { ha: 5.0, label: '5.0 ha' },
          ].map((s) => (
            <button
              key={s.ha}
              type="button"
              onClick={() => handleAreaChange(s.ha)}
              className={`py-1.5 px-1 rounded-xl text-center text-[10px] font-bold border-2 transition active:scale-95 cursor-pointer ${
                areaHa === s.ha
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              {s.ha} ha
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
