'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Microcuenca } from '@/lib/types';
import { Layers, Navigation, ExternalLink } from 'lucide-react';
import { playBubblePop } from '@/lib/soundEffects';

interface ParcelMapProps {
  cuenca?: Microcuenca | null;
  lat?: number;
  lon?: number;
  parcelName?: string;
  altitude?: number;
  slope?: number;
  areaHa?: number;
  onLocateGPS?: () => void;
}

export default function ParcelMap({
  cuenca,
  lat = -13.3934,
  lon = -72.0498,
  parcelName = 'Mi Chacra Pukara',
  altitude = 3754,
  slope = 14,
  areaHa = 1.0,
  onLocateGPS,
}: ParcelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const osmLayerRef = useRef<any>(null);
  const esriLayerRef = useRef<any>(null);
  const esriLabelsRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Default to OpenStreetMap / QGIS vector terrain map with city labels (Zero watermark, matching Visor Técnico)
  const [activeLayer, setActiveLayer] = useState<'sat' | 'osm'>('osm');

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

        // Monkey-patch L.DomUtil.getPosition to guarantee it NEVER throws TypeError on undefined _leaflet_pos
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

        // Clean any leftover _leaflet_id to avoid "Map container is already initialized"
        if ((mapContainerRef.current as any)._leaflet_id) {
          delete (mapContainerRef.current as any)._leaflet_id;
        }

        const map = L.map(mapContainerRef.current, {
          center: [effectiveLat, effectiveLon],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });

        // Store instance IMMEDIATELY so cleanup can ALWAYS call map.remove()
        mapInstanceRef.current = map;

        if (!isMountedRef.current || !mapContainerRef.current || !document.body.contains(mapContainerRef.current)) {
          try { map.remove(); } catch (e) {}
          mapInstanceRef.current = null;
          return;
        }

        try {
          L.control.zoom({ position: 'bottomright' }).addTo(map);
        } catch (e) {}

        // ESRI World Imagery: global high-resolution agricultural satellite view (ArcGIS format is {z}/{y}/{x})
        const esri = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19 }
        );

        const esriLabels = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19 }
        );

        // OpenStreetMap: the exact layer used in the Visor Técnico (No API key, zero watermark, all Peruvian cities)
        const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors | QGIS',
        });

        esriLayerRef.current = esri;
        esriLabelsRef.current = esriLabels;
        osmLayerRef.current = osm;

        map.whenReady(() => {
          if (!isMountedRef.current || mapInstanceRef.current !== map) return;
          try {
            osm.addTo(map);
          } catch (e) {}
          try {
            renderParcel(L, map, effectiveLat, effectiveLon, areaHa);
          } catch (e) {}
          safeInvalidateSize();
        });

        // Safely staged invalidation
        timers.push(setTimeout(() => safeInvalidateSize(), 150));
        timers.push(setTimeout(() => safeInvalidateSize(), 400));
        timers.push(setTimeout(() => safeInvalidateSize(), 800));
      } catch (err) {
        // Prevent unhandled runtime error overlay
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

  useEffect(() => {
    if (!mapInstanceRef.current || !isMountedRef.current) return;

    import('leaflet').then(({ default: L }) => {
      if (!mapInstanceRef.current || !isMountedRef.current) return;
      try {
        mapInstanceRef.current.flyTo([effectiveLat, effectiveLon], 16, { duration: 1.0 });
        renderParcel(L, mapInstanceRef.current, effectiveLat, effectiveLon, areaHa);
        setTimeout(() => safeInvalidateSize(), 300);
      } catch (e) {}
    }).catch(() => {});
  }, [effectiveLat, effectiveLon, parcelName, areaHa]);

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
        weight: 3,
        fillColor: '#34d399',
        fillOpacity: 0.35,
        dashArray: '6, 6',
      }).addTo(map);

      const markerHtml = `
        <div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:#059669;border:3px solid #ffffff;border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.3);cursor:pointer;animation:pulse 2s infinite;">
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
            ✓ Parcela Calibrada y Guardada
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

  return (
    <div className="space-y-2">
      <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Toggle Layer Button: Map QGIS/OSM vs Satellite */}
        <button
          type="button"
          onClick={toggleLayer}
          className="absolute top-2.5 right-2.5 z-10 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 font-bold text-xs shadow-md border border-slate-300 flex items-center gap-1.5 transition active:scale-95 cursor-pointer backdrop-blur-xs"
          title={activeLayer === 'osm' ? 'Cambiar a Satélite HD' : 'Cambiar a Mapa QGIS'}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>{activeLayer === 'osm' ? 'Mapa QGIS' : 'Satélite HD'}</span>
        </button>

        {/* GPS Quick Recenter Button */}
        {onLocateGPS && (
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onLocateGPS();
            }}
            className="absolute top-12 right-2.5 z-10 p-2 rounded-xl bg-white/95 hover:bg-white text-slate-800 shadow-md border border-slate-300 transition active:scale-95 cursor-pointer backdrop-blur-xs"
            title="Centrar en mi ubicación GPS"
          >
            <Navigation className="w-4 h-4 text-sky-700" />
          </button>
        )}

        {/* Telemetry pill overlay */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-900/85 text-white px-2.5 py-1 rounded-xl text-[11px] font-mono backdrop-blur-xs border border-white/20 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{effectiveLat.toFixed(4)}°, {effectiveLon.toFixed(4)}° • {activeLayer === 'osm' ? 'Mapa QGIS / OSM' : 'Satélite ESRI'}</span>
        </div>
      </div>
    </div>
  );
}
