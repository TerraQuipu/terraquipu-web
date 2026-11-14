'use client';

import React, { useState } from 'react';
import { Download, Upload, FileText, CheckCircle2, Layers, MapPin, Globe } from 'lucide-react';
import { CHINCHERO_PARCELS, exportQgisGeoJSON, parseQgisGeoJSON } from '@/lib/qgisGeojson';
import { GeoJsonFeatureCollection } from '@/types';

interface QgisManagerProps {
  onShowToast: (msg: string) => void;
}

export default function QgisManager({ onShowToast }: QgisManagerProps) {
  const [activeCollection, setActiveCollection] =
    useState<GeoJsonFeatureCollection>(CHINCHERO_PARCELS);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleExport = () => {
    exportQgisGeoJSON(activeCollection);
    onShowToast('Capa vectorial GeoJSON para QGIS descargada');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = parseQgisGeoJSON(content);
      if (res.success && res.collection) {
        setActiveCollection(res.collection);
        setUploadStatus(res.message);
        onShowToast(res.message);
      } else {
        setUploadStatus(`Advertencia: ${res.message}`);
        onShowToast(`Advertencia: ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Visual Header Banner */}
      <div className="relative h-28 rounded-2xl overflow-hidden border border-zinc-200 shadow-xs group">
        <img
          src="/images/tablet_showcase.jpg"
          alt="Integración GIS de campo"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex flex-col justify-end p-4">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Interoperabilidad Cartográfica &amp; PostGIS
          </span>
          <h2 className="text-white font-black text-lg leading-tight">
            Gestor Geoespacial QGIS Desktop &amp; Catastro Rural
          </h2>
          <p className="text-[11px] text-zinc-300 font-mono mt-0.5">
            Estándar RFC 7946 • Capas vectoriales compatibles con ESRI Shapefile y QGIS 3.x
          </p>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Capas Vectoriales Activas
          </span>
          <span className="text-sm font-bold text-zinc-900">
            {activeCollection.features.length} Polígonos Parcelarios Listos en WGS 84
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition active:scale-95">
            <Upload className="w-4 h-4 text-zinc-700" />
            <span>Importar GeoJSON</span>
            <input
              type="file"
              accept=".geojson,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-lg bg-zinc-900 text-white font-bold text-xs border border-zinc-900 shadow-xs hover:bg-zinc-800 flex items-center gap-2 transition active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Descargar Capa para QGIS</span>
          </button>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-mono text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Feature List Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-zinc-700" />
            <span>Atributos Topográficos &amp; Fenológicos de Polígonos</span>
          </span>
          <span className="font-mono text-xs text-zinc-500 font-semibold">
            SRC: EPSG:4326 (WGS 84)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-white text-zinc-500 text-[10px] uppercase border-b border-zinc-200 font-semibold">
              <tr>
                <th className="p-3">ID Parcela</th>
                <th className="p-3">Sector</th>
                <th className="p-3">Área (ha)</th>
                <th className="p-3">Pendiente %</th>
                <th className="p-3">pH Suelo</th>
                <th className="p-3">Cultivo Asociado</th>
                <th className="p-3 text-right">Geometría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {activeCollection.features.map((f: any, idx: number) => {
                const props = f.properties || {};
                return (
                  <tr key={props.id || idx} className="hover:bg-zinc-50/70 font-sans">
                    <td className="p-3 font-bold text-zinc-950 font-mono">{props.id || `P-${idx + 1}`}</td>
                    <td className="p-3 capitalize">{props.sector || props.name || 'Chinchero'}</td>
                    <td className="p-3 font-mono">{props.area_ha ? `${props.area_ha} ha` : 'N/D'}</td>
                    <td className="p-3 font-mono">{props.slope_pct ? `${props.slope_pct}%` : 'N/D'}</td>
                    <td className="p-3 font-mono">{props.ph ? `${props.ph}` : 'N/D'}</td>
                    <td className="p-3 font-semibold text-emerald-800 capitalize">
                      {props.current_crop || 'Rotación'}
                    </td>
                    <td className="p-3 text-right text-zinc-500 font-mono text-[10px]">
                      {f.geometry?.type || 'Polygon'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Note for QGIS */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-1.5 text-xs text-zinc-700">
        <h4 className="font-bold text-zinc-950 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Protocolo de Exportación para QGIS Desktop:</span>
        </h4>
        <p className="leading-relaxed font-sans text-zinc-600">
          El archivo generado cumple con el estándar RFC 7946 en coordenadas <code>[longitud, latitud]</code>. Al abrirlo en QGIS, los atributos de pendiente SRTM, humedad radicular SMAP y superficie calculada se reconocen de forma nativa para generar mapas de zonificación agroecológica.
        </p>
      </div>
    </div>
  );
}
