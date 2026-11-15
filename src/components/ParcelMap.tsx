'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Microcuenca } from '@/lib/types';
import { Layers, Navigation, PenTool, Check, X, RotateCcw, Sliders } from 'lucide-react';
import { playBubblePop, playSuccessFanfare, playWhoosh } from '@/lib/soundEffects';
import { calculateParcelAreaHa } from '@/lib/geoUtils';

interface ParcelMapProps {
  cuenca?: Microcuenca | null;
  lat?: number;
  lon?: number;
  parcelName?: string;
  altitude?: number;
  slope?: number;
  areaHa?: number;
  onLocateGPS?: () => void;
  onUpdateArea?: (newAreaHa: number) => void;
}

export default function ParcelMap({
  cuenca,
  lat = -13.332,
  lon = -72.158,
  parcelName = 'Chacra Maras',
  altitude = 3380,
  slope = 12,
  areaHa = 1.0,
  onLocateGPS,
  onUpdateArea,
}: ParcelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const osmLayerRef = useRef<any>(null);
  const esriLayerRef = useRef<any>(null);
  const esriLabelsRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Drawing mode refs
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const drawPointsRef = useRef<[number, number][]>([]);
  drawPointsRef.current = drawPoints;

  const tempPolylineRef = useRef<any>(null);
  const tempMarkersRef = useRef<any[]>([]);

  // Default to ESRI Satellite HD for immersive visual matching Screen 3
  const [activeLayer, setActiveLayer] = useState<'sat' | 'osm'>('sat');

  const effectiveLat = cuenca?.latitud_centro || lat;
  const effectiveLon = cuenca?.longitud_centro || lon;

  const safeInvalidateSize = () => {
    try {
      const map = mapInstanceRef.current;
      const container = mapContainerRef.current;
      if (
        isMountedRef.current &&
        map &&
        container &&
        document.body.contains(container) &&
        map._container &&
        map._mapPane &&
        map._loaded &&
        !map._animatingZoom
      ) {
        requestAnimationFrame(() => {
          try {
            if (isMountedRef.current && mapInstanceRef.current === map && map._mapPane) {
              map.invalidateSize({ pan: false, debounceMoveEnd: true });
            }
          } catch {
            // Silently suppress container transition leaflet exceptions
          }
        });
      }
    } catch (e) {
      // Safely ignore if container is transitioning
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    isMountedRef.current = true;
    const timers: NodeJS.Timeout[] = [];

    const handleResize = () => {
      safeInvalidateSize();
    };

    const initLeaflet = async () => {
      try {
        const L = (await import('leaflet')).default;
        if (!mapContainerRef.current || mapInstanceRef.current || !isMountedRef.current) return;
        if (!document.body.contains(mapContainerRef.current)) return;

        // Monkey-patch L.DomUtil.getPosition to guarantee it NEVER throws TypeError
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

        const map = L.map(mapContainerRef.current, {
          center: [effectiveLat, effectiveLon],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });

        // 1. ESRI World Imagery
        const esriSat = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, crossOrigin: true }
        );

        // 2. ESRI Reference Labels
        const esriLabels = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, crossOrigin: true }
        );

        // 3. OpenStreetMap QGIS Terrain Vector
        const osm = L.tileLayer(
          'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 19, crossOrigin: true }
        );

        osmLayerRef.current = osm;
        esriLayerRef.current = esriSat;
        esriLabelsRef.current = esriLabels;

        // Add ESRI Sat by default
        esriSat.addTo(map);
        esriLabels.addTo(map);

        mapInstanceRef.current = map;

        // Draw initial parcel
        renderParcel(L, map, effectiveLat, effectiveLon, areaHa);

        // Map Click Listener for Freeform QGIS Polygon Drawing
        map.on('click', (e: any) => {
          if (!drawPointsRef.current) return;
          const { lat: clickLat, lng: clickLng } = e.latlng;

          // Check if drawing mode is active
          const isDrawMode = (map as any)._isDrawingMode;
          if (!isDrawMode) return;

          playBubblePop();
          const newPoint: [number, number] = [clickLat, clickLng];
          const updated = [...drawPointsRef.current, newPoint];
          setDrawPoints(updated);
          drawPointsRef.current = updated;

          // Place vertex marker
          const vertexMarker = L.circleMarker([clickLat, clickLng], {
            radius: 6,
            color: '#10b981',
            fillColor: '#34d399',
            fillOpacity: 0.9,
            weight: 2,
          }).addTo(map);

          tempMarkersRef.current.push(vertexMarker);

          // Update polyline
          if (tempPolylineRef.current) {
            map.removeLayer(tempPolylineRef.current);
          }
          if (updated.length > 1) {
            tempPolylineRef.current = L.polyline(updated, {
              color: '#34d399',
              weight: 3,
              dashArray: '5, 5',
            }).addTo(map);
          }
        });

        timers.push(setTimeout(() => safeInvalidateSize(), 200));
        timers.push(setTimeout(() => safeInvalidateSize(), 600));
      } catch (err) {
        console.error('Leaflet initialization error:', err);
      }
    };

    initLeaflet();
    window.addEventListener('resize', handleResize);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      timers.forEach((t) => clearTimeout(t));
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

  // Update parcel polygon when props change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMountedRef.current || isDrawing) return;

    import('leaflet').then(({ default: L }) => {
      if (!mapInstanceRef.current || !isMountedRef.current) return;
      try {
        mapInstanceRef.current.flyTo([effectiveLat, effectiveLon], 16, { duration: 0.8 });
        renderParcel(L, mapInstanceRef.current, effectiveLat, effectiveLon, areaHa);
        setTimeout(() => safeInvalidateSize(), 300);
      } catch (e) {}
    }).catch(() => {});
  }, [effectiveLat, effectiveLon, parcelName, areaHa, isDrawing]);

  const renderParcel = (
    L: any,
    map: any,
    latitude: number,
    longitude: number,
    parcelAreaHa: number = areaHa
  ) => {
    try {
      if (!map || !map._mapPane) return;

      if (polygonLayerRef.current) {
        try { map.removeLayer(polygonLayerRef.current); } catch (e) {}
      }
      if (markerLayerRef.current) {
        try { map.removeLayer(markerLayerRef.current); } catch (e) {}
      }

      // Calculate dynamic parcel polygon dimensions based on real areaHa
      const effectiveArea = parcelAreaHa > 0 ? parcelAreaHa : 1.0;
      const sideMeters = Math.round(Math.sqrt(effectiveArea * 10000));
      const latOffset = (sideMeters / 111320) / 2;
      const lonOffset = (sideMeters / (111320 * Math.cos((latitude * Math.PI) / 180))) / 2;

      const polygonCoords: [number, number][] = [
        [latitude - latOffset, longitude - lonOffset],
        [latitude + latOffset, longitude - lonOffset],
        [latitude + latOffset, longitude + lonOffset],
        [latitude - latOffset, longitude + lonOffset],
      ];

      const polygon = L.polygon(polygonCoords, {
        color: '#10b981',
        weight: 3.5,
        fillColor: '#34d399',
        fillOpacity: 0.4,
        dashArray: '6, 6',
      }).addTo(map);

      const markerHtml = `
        <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:#059669;border:3px solid #ffffff;border-radius:50%;box-shadow:0 6px 16px rgba(0,0,0,0.4);cursor:pointer;animation:pulse 2s infinite;">
          <span style="font-size:20px;line-height:1;">🌱</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-parcel-marker',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);

      const toposText = (effectiveArea * 3.3).toFixed(1);
      marker.bindPopup(`
        <div style="font-family:system-ui,-apple-system,sans-serif;padding:6px;min-width:180px;">
          <strong style="color:#065f46;font-size:14px;display:block;margin-bottom:4px;">${parcelName}</strong>
          <div style="font-size:12px;color:#334155;margin-bottom:4px;">
            Área: <strong>${effectiveArea} ha</strong> (≈ ${toposText} topos)
          </div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px;">
            Altitud: ${altitude} msnm • Pendiente: ${slope}%
          </div>
          <div style="font-size:10px;font-weight:bold;color:#059669;background:#ecfdf5;padding:4px 6px;border-radius:6px;border:1px solid #a7f3d0;">
            ✓ Parcela Calibrada y Delimitada
          </div>
        </div>
      `);

      polygonLayerRef.current = polygon;
      markerLayerRef.current = marker;
    } catch (e) {
      // Ignore if map unmounted
    }
  };

  const toggleLayer = () => {
    playBubblePop();
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      if (activeLayer === 'osm') {
        if (osmLayerRef.current && map.hasLayer(osmLayerRef.current)) {
          map.removeLayer(osmLayerRef.current);
        }
        if (esriLayerRef.current) esriLayerRef.current.addTo(map);
        if (esriLabelsRef.current) esriLabelsRef.current.addTo(map);
        setActiveLayer('sat');
      } else {
        if (esriLayerRef.current && map.hasLayer(esriLayerRef.current)) {
          map.removeLayer(esriLayerRef.current);
        }
        if (esriLabelsRef.current && map.hasLayer(esriLabelsRef.current)) {
          map.removeLayer(esriLabelsRef.current);
        }
        if (osmLayerRef.current) osmLayerRef.current.addTo(map);
        setActiveLayer('osm');
      }
    } catch (e) {}
  };

  // Start QGIS Freehand Polygon Drawing Mode
  const startDrawingMode = () => {
    playBubblePop();
    setIsDrawing(true);
    setDrawPoints([]);
    drawPointsRef.current = [];
    if (mapInstanceRef.current) {
      (mapInstanceRef.current as any)._isDrawingMode = true;
    }
  };

  // Cancel Drawing Mode
  const cancelDrawingMode = () => {
    playWhoosh();
    setIsDrawing(false);
    setDrawPoints([]);
    drawPointsRef.current = [];
    const map = mapInstanceRef.current;
    if (map) {
      (map as any)._isDrawingMode = false;
      tempMarkersRef.current.forEach((m) => {
        try { map.removeLayer(m); } catch (e) {}
      });
      tempMarkersRef.current = [];
      if (tempPolylineRef.current) {
        try { map.removeLayer(tempPolylineRef.current); } catch (e) {}
        tempPolylineRef.current = null;
      }
      import('leaflet').then(({ default: L }) => {
        renderParcel(L, map, effectiveLat, effectiveLon, areaHa);
      });
    }
  };

  // Finish QGIS Polygon Drawing
  const finishDrawingMode = async () => {
    if (drawPoints.length < 3) return;
    playSuccessFanfare();

    const computedAreaHa = calculateParcelAreaHa(drawPoints);
    setIsDrawing(false);
    const map = mapInstanceRef.current;

    if (map) {
      (map as any)._isDrawingMode = false;
      const L = (await import('leaflet')).default;

      // Clean temp drawing layers
      tempMarkersRef.current.forEach((m) => {
        try { map.removeLayer(m); } catch (e) {}
      });
      tempMarkersRef.current = [];
      if (tempPolylineRef.current) {
        try { map.removeLayer(tempPolylineRef.current); } catch (e) {}
        tempPolylineRef.current = null;
      }

      if (polygonLayerRef.current) {
        try { map.removeLayer(polygonLayerRef.current); } catch (e) {}
      }

      // Draw permanent drawn polygon
      const customPolygon = L.polygon(drawPoints, {
        color: '#10b981',
        weight: 3.5,
        fillColor: '#34d399',
        fillOpacity: 0.45,
      }).addTo(map);

      polygonLayerRef.current = customPolygon;
      map.fitBounds(customPolygon.getBounds(), { padding: [25, 25], maxZoom: 17 });
    }

    if (onUpdateArea) {
      onUpdateArea(computedAreaHa);
    }
  };

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Control Bar: Layer Switcher & Drawing Tool Trigger */}
        <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Toggle QGIS vs ESRI Satélite */}
            <button
              type="button"
              onClick={toggleLayer}
              className="px-3 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-white font-bold text-xs shadow-lg border border-emerald-500/40 flex items-center gap-1.5 transition active:scale-95 cursor-pointer backdrop-blur-md"
              title={activeLayer === 'osm' ? 'Cambiar a Satélite HD' : 'Cambiar a Mapa QGIS'}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeLayer === 'osm' ? 'Mapa QGIS' : 'Satélite HD'}</span>
            </button>

            {/* GPS Recenter */}
            {onLocateGPS && (
              <button
                type="button"
                onClick={() => {
                  playBubblePop();
                  onLocateGPS();
                }}
                className="p-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-cyan-400 shadow-lg border border-cyan-500/40 transition active:scale-95 cursor-pointer backdrop-blur-md"
                title="Centrar en mi GPS"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* QGIS Freehand Draw Tool Button */}
          <div className="pointer-events-auto">
            {!isDrawing ? (
              <button
                type="button"
                onClick={startDrawingMode}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs shadow-lg border border-emerald-400/50 flex items-center gap-1.5 transition active:scale-95 cursor-pointer backdrop-blur-md"
                title="Trazar polígono libre en el mapa con QGIS"
              >
                <PenTool className="w-3.5 h-3.5 text-lime-300" />
                <span>Trazar Libre QGIS</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                {drawPoints.length >= 3 && (
                  <button
                    type="button"
                    onClick={finishDrawingMode}
                    className="px-3 py-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs shadow-lg border border-lime-500 flex items-center gap-1 transition active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Guardar ({calculateParcelAreaHa(drawPoints)} ha)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={cancelDrawingMode}
                  className="p-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/40 shadow-lg transition active:scale-95 cursor-pointer backdrop-blur-md"
                  title="Cancelar trazado"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* QGIS Drawing Banner Notice (Active State) */}
        {isDrawing && (
          <div className="absolute bottom-12 inset-x-3 z-20 pointer-events-auto p-2.5 rounded-2xl bg-slate-950/90 border border-emerald-500/60 shadow-2xl backdrop-blur-md flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
              <span className="text-slate-100 font-bold">
                Toca el mapa para marcar vértices: <strong className="text-lime-300">{drawPoints.length} puntos</strong>
              </span>
            </div>
            {drawPoints.length < 3 && (
              <span className="text-[10px] text-emerald-400/80 italic font-mono">
                (Mínimo 3 vértices)
              </span>
            )}
          </div>
        )}

        {/* Telemetry coordinate pill */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-950/85 text-white px-2.5 py-1 rounded-xl text-[10px] font-mono backdrop-blur-md border border-emerald-500/30 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{effectiveLat.toFixed(4)}°, {effectiveLon.toFixed(4)}° • {activeLayer === 'osm' ? 'QGIS OSM' : 'ESRI Satélite'}</span>
        </div>
      </div>
    </div>
  );
}
