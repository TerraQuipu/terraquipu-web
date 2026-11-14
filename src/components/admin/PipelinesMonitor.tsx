'use client';

import React, { useState } from 'react';
import {
  Download,
  Satellite,
  Database,
  Activity,
  Radio,
  CloudRain,
  Thermometer,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  UserCheck,
} from 'lucide-react';
import { ReporteAgricultor } from '@/types';
import { exportQgisGeoJSON } from '@/lib/qgisGeojson';

interface PipelinesMonitorProps {
  reports: ReporteAgricultor[];
  onShowToast: (msg: string) => void;
}

export default function PipelinesMonitor({ reports, onShowToast }: PipelinesMonitorProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(20);
  const [filterType, setFilterType] = useState<'all' | 'weevil' | 'frost' | 'dry'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleExport = () => {
    exportQgisGeoJSON();
    onShowToast('Archivo GeoJSON para QGIS descargado con éxito');
  };

  const weevilAlertsCount = reports.filter((r) => r.presencia_gorgojo).length;
  const frostAlertsCount = reports.filter((r) => r.alerta_helada_observada).length;
  const dryAlertsCount = reports.filter((r) => r.humedad_suelo_estimada === 'SECO').length;

  // Filter and search logic
  const filteredReports = reports.filter((r) => {
    if (filterType === 'weevil' && !r.presencia_gorgojo) return false;
    if (filterType === 'frost' && !r.alerta_helada_observada) return false;
    if (filterType === 'dry' && r.humedad_suelo_estimada !== 'SECO') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDevice = r.dispositivo_id.toLowerCase().includes(q);
      const matchLat = r.latitud.toString().includes(q);
      const matchLng = r.longitud.toString().includes(q);
      return matchDevice || matchLat || matchLng;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Visual Header Banner */}
      <div className="relative h-28 rounded-2xl overflow-hidden border border-zinc-200 shadow-xs group">
        <img
          src="/images/nasa_orbit_poster.jpg"
          alt="Órbita de constelación de satélites NASA"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex flex-col justify-end p-4">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
            Telemetría Satelital NASA + Ciencia Ciudadana
          </span>
          <h2 className="text-white font-black text-lg leading-tight">
            Pipelines Satelitales (SMAP L4, GPM) &amp; Reportes de Campesinos
          </h2>
          <p className="text-[11px] text-zinc-300 font-mono mt-0.5">
            Telemetría orbital cruzada con observaciones en tierra emitidas por los agricultores
          </p>
        </div>
      </div>

      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Monitoreo Satelital Activo
          </span>
          <span className="text-sm font-bold text-zinc-900">
            3 Misiones NASA • {reports.length} Reportes Humanos Totales
          </span>
        </div>
        <button
          onClick={handleExport}
          className="px-3.5 py-2 rounded-lg bg-zinc-900 text-white font-bold text-xs border border-zinc-900 shadow-xs hover:bg-zinc-800 flex items-center gap-2 transition active:scale-95"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Exportar Capa QGIS (.geojson)</span>
        </button>
      </div>

      {/* Satellite Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* NASA POWER */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-2 hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-900 font-bold flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-emerald-600" /> NASA POWER API
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En Línea
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-sans">
            Precipitación satelital radar GPM IMERG y radiación solar acumulada diaria MERRA-2.
          </p>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <span>Resolución: 0.5° × 0.5°</span>
            <span className="text-emerald-700 font-bold">Latencia: 3h</span>
          </div>
        </div>

        {/* NASA SMAP L4 */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-2 hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-900 font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-sky-600" /> NASA SMAP L4_SM
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              Activo
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-sans">
            Humedad volumétrica en estrato radicular (0 - 100 cm). Base del modelo de estrés hídrico.
          </p>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <span>Grid: 9 km Global</span>
            <span className="text-sky-700 font-bold">Downscale 30m</span>
          </div>
        </div>

        {/* PostGIS & DEM SRTM */}
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs space-y-2 hover:border-zinc-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-900 font-bold flex items-center gap-1.5">
              <Database className="w-4 h-4 text-zinc-800" /> PostGIS Chinchero
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Sincronizado
            </span>
          </div>
          <p className="text-xs text-zinc-600 font-sans">
            Topografía DEM SRTM 30m. Estimación de pendientes y riesgos de erosión en laderas.
          </p>
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <span>SRID: EPSG:4326</span>
            <span className="text-zinc-900 font-bold">UTM 18S</span>
          </div>
        </div>
      </div>

      {/* Epidemiological Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
            🐛
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
              Focos de Gorgojo Reportados
            </span>
            <span className="font-bold text-sm text-zinc-950 font-mono">
              {weevilAlertsCount} parcelas con alerta
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
            ❄️
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
              Eventos de Heladas Validados
            </span>
            <span className="font-bold text-sm text-zinc-950 font-mono">
              {frostAlertsCount} observaciones en campo
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm flex-shrink-0">
            🍂
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
              Estrés Hídrico en Chacras
            </span>
            <span className="font-bold text-sm text-zinc-950 font-mono">
              {dryAlertsCount} parcelas con suelo seco
            </span>
          </div>
        </div>
      </div>

      {/* Ground Truth Reports Table with Pagination & Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        {/* Table Header with Explanation & Filters */}
        <div className="p-3.5 bg-zinc-50 border-b border-zinc-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-bold text-xs uppercase tracking-wide text-zinc-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Reportes de Campo Emitidos por Agricultores (Ground Truth • Supabase Live)</span>
              </span>
              <p className="text-[11px] text-zinc-500 font-sans mt-0.5">
                Información directa de los usuarios: Cada fila representa una observación enviada desde la app móvil o el visor de campo por campesinos y extensionistas.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-700 shadow-2xs">
              {filteredReports.length} Registros
            </span>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-200/70 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Filtrar:</span>
              <button
                onClick={() => {
                  setFilterType('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  filterType === 'all'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                Todos ({reports.length})
              </button>
              <button
                onClick={() => {
                  setFilterType('weevil');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                  filterType === 'weevil'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-amber-900 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <span>🐛 Solo Gorgojo</span>
                <span className="opacity-80">({weevilAlertsCount})</span>
              </button>
              <button
                onClick={() => {
                  setFilterType('frost');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                  filterType === 'frost'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-sky-900 hover:bg-sky-50 border border-sky-200'
                }`}
              >
                <span>❄️ Solo Heladas</span>
                <span className="opacity-80">({frostAlertsCount})</span>
              </button>
              <button
                onClick={() => {
                  setFilterType('dry');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                  filterType === 'dry'
                    ? 'bg-zinc-800 text-white shadow-xs'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                <span>🍂 Suelo Seco</span>
                <span className="opacity-80">({dryAlertsCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por Dispositivo o Coordenada..."
                className="pl-8 pr-3 py-1 bg-white border border-zinc-300 rounded-lg text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 w-64"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-white text-zinc-500 text-[10px] uppercase border-b border-zinc-200 font-semibold">
              <tr>
                <th className="p-3">ID Dispositivo (Hardware)</th>
                <th className="p-3">Coordenadas GPS</th>
                <th className="p-3">Humedad Palpada</th>
                <th className="p-3">Alerta Gorgojo</th>
                <th className="p-3">Alerta Helada</th>
                <th className="p-3">Fecha y Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {paginatedReports.length > 0 ? (
                paginatedReports.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="p-3 font-semibold text-zinc-950 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-xs">{r.dispositivo_id}</span>
                        {r.sincronizado_desde_outbox && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-sans font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200"
                            title="Sincronizado automáticamente tras recuperar señal"
                          >
                            Outbox
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-zinc-600">
                      {r.latitud.toFixed(4)}, {r.longitud.toFixed(4)}
                    </td>
                    <td className="p-3 font-semibold">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.humedad_suelo_estimada === 'SECO'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : r.humedad_suelo_estimada === 'SATURADO' ||
                              r.humedad_suelo_estimada === 'CHARCO'
                            ? 'bg-sky-100 text-sky-900 border border-sky-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {r.humedad_suelo_estimada}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.presencia_gorgojo ? (
                        <span className="text-red-600 font-bold flex items-center gap-1 font-sans">
                          ⚠️ Sí detectado
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-sans">No detectado</span>
                      )}
                    </td>
                    <td className="p-3">
                      {r.alerta_helada_observada ? (
                        <span className="text-sky-700 font-bold flex items-center gap-1 font-sans">
                          ❄️ Helada
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-sans">Normal</span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-500 font-sans text-[11px]">
                      {new Date(r.created_at).toLocaleString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-zinc-500 italic font-sans">
                    No se encontraron reportes con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination (Maximum 20 rows per page) */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-zinc-600 font-sans">
            Mostrando{' '}
            <span className="font-bold text-zinc-950 font-mono">
              {filteredReports.length === 0 ? 0 : startIndex + 1}
            </span>{' '}
            a{' '}
            <span className="font-bold text-zinc-950 font-mono">
              {Math.min(startIndex + pageSize, filteredReports.length)}
            </span>{' '}
            de{' '}
            <span className="font-bold text-zinc-950 font-mono">
              {filteredReports.length}
            </span>{' '}
            reportes ciudadanos de campo
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500">
              Página {currentPage} de {totalPages} • Máx. 20 filas
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 bg-white border border-zinc-300 rounded-md font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 transition flex items-center gap-1 shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-2.5 py-1 bg-white border border-zinc-300 rounded-md font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 transition flex items-center gap-1 shadow-2xs"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
