'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  Trash2,
  X,
} from 'lucide-react';
import { CropRecord } from '@/types';
import { updateCropRecord } from '@/lib/supabase';

interface CropMatrixTableProps {
  crops: CropRecord[];
  onRefresh: () => void;
  onShowToast: (msg: string) => void;
}

interface BackupSnapshot {
  id: string;
  name: string;
  timestamp: string;
  cropsCount: number;
  data: CropRecord[];
  note: string;
}

const CROP_IMAGES: Record<string, string> = {
  papa_nativa: '/images/papa_nativa.jpg',
  tarwi: '/images/tarwi_chocho.jpg',
  quinua: '/images/quinua_real.jpg',
  haba: '/images/haba_verde.jpg',
  maiz: '/images/maiz_blanco.jpg',
  cebada: '/images/trigo_viento_poster.jpg',
};

export default function CropMatrixTable({
  crops,
  onRefresh,
  onShowToast,
}: CropMatrixTableProps) {
  const [editableCrops, setEditableCrops] = useState<CropRecord[]>(crops);
  const [isSaving, setIsSaving] = useState(false);
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set());
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotNote, setSnapshotNote] = useState('');

  // Backup Snapshots state (persisted in localStorage)
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('terraquipu_matrix_snapshots');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      {
        id: 'snap-initial',
        name: 'Línea Base Oficial INIA 2024',
        timestamp: '14 Nov 2024, 08:00 AM',
        cropsCount: crops.length || 5,
        data: crops,
        note: 'Parámetros biológicos iniciales calibrados con la Estación Experimental Andenes Cusco.',
      },
    ];
  });

  useEffect(() => {
    setEditableCrops(crops);
  }, [crops]);

  const saveSnapshotsToStorage = (updated: BackupSnapshot[]) => {
    setSnapshots(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('terraquipu_matrix_snapshots', JSON.stringify(updated));
    }
  };

  const handleFieldChange = (cropId: string, field: keyof CropRecord, value: any) => {
    setEditableCrops((prev) =>
      prev.map((c) => (c.crop_id === cropId ? { ...c, [field]: value } : c))
    );
    setModifiedIds((prev) => new Set(prev).add(cropId));
  };

  const handleCreateSnapshot = () => {
    const newSnapshot: BackupSnapshot = {
      id: `snap-${Date.now()}`,
      name: snapshotNote.trim() || `Punto de Restauración #${snapshots.length + 1}`,
      timestamp: new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      cropsCount: editableCrops.length,
      data: JSON.parse(JSON.stringify(editableCrops)),
      note: snapshotNote.trim() || 'Respaldo manual creado por el administrador antes de modificar producción.',
    };

    const updated = [newSnapshot, ...snapshots];
    saveSnapshotsToStorage(updated);
    setSnapshotNote('');
    setIsSnapshotModalOpen(false);
    onShowToast(`Snapshot "${newSnapshot.name}" creado con éxito.`);
  };

  const handleRollback = async (snapshot: BackupSnapshot) => {
    setIsSaving(true);
    onShowToast(`Revertiendo a snapshot: ${snapshot.name}...`);

    let restoredCount = 0;
    for (const crop of snapshot.data) {
      await updateCropRecord(crop.crop_id, {
        demanda_hidrica_optima_mm: Number(crop.demanda_hidrica_optima_mm),
        tolerancia_helada_c: Number(crop.tolerancia_helada_c),
        balance_nitrogeno_kg_ha: Number(crop.balance_nitrogeno_kg_ha),
        rompe_plaga_gorgojo: Boolean(crop.rompe_plaga_gorgojo),
      });
      restoredCount++;
    }

    setEditableCrops(snapshot.data);
    setModifiedIds(new Set());
    setIsSaving(false);
    setIsRollbackModalOpen(false);
    onShowToast(`¡Rollback completado! ${restoredCount} cultivos restaurados a ${snapshot.name}.`);
    onRefresh();
  };

  const handleDeleteSnapshot = (id: string) => {
    if (snapshots.length <= 1) {
      onShowToast('No puedes eliminar el último punto de restauración base');
      return;
    }
    const filtered = snapshots.filter((s) => s.id !== id);
    saveSnapshotsToStorage(filtered);
    onShowToast('Punto de restauración eliminado.');
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    let successCount = 0;
    let errors: string[] = [];

    for (const crop of editableCrops) {
      if (modifiedIds.has(crop.crop_id)) {
        const res = await updateCropRecord(crop.crop_id, {
          demanda_hidrica_optima_mm: Number(crop.demanda_hidrica_optima_mm),
          tolerancia_helada_c: Number(crop.tolerancia_helada_c),
          balance_nitrogeno_kg_ha: Number(crop.balance_nitrogeno_kg_ha),
          rompe_plaga_gorgojo: Boolean(crop.rompe_plaga_gorgojo),
        });
        if (res.success) {
          successCount++;
        } else if (res.error) {
          errors.push(res.error);
        }
      }
    }

    setIsSaving(false);
    setModifiedIds(new Set());

    if (errors.length > 0) {
      onShowToast(`Advertencia: ${errors[0]}`);
    } else if (successCount > 0) {
      onShowToast(`Sincronizados ${successCount} cultivos en Supabase con éxito`);
      onRefresh();
    } else {
      onShowToast('No hay modificaciones pendientes en la matriz');
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto animate-in fade-in duration-150">
      {/* Visual Photographic Banner */}
      <div className="relative h-28 rounded-2xl overflow-hidden border border-zinc-200 shadow-xs group">
        <img
          src="/images/cosecha_poster.jpg"
          alt="Cosecha de cultivos andinos"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex flex-col justify-end p-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            Gobernanza Agronómica &amp; Base de Datos Central
          </span>
          <h2 className="text-white font-black text-lg leading-tight">
            Matriz Fenológica y Biológica de Cultivos Andinos
          </h2>
          <p className="text-[11px] text-zinc-300 font-mono mt-0.5">
            Calibrado para microcuencas de Cusco (3,400 - 3,900 msnm) • Conexión Supabase Live
          </p>
        </div>
      </div>

      {/* Action Header with Rollback / Backup Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Control de Versiones &amp; Producción
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-zinc-900">
              {editableCrops.length} Especies Monitoreadas
            </span>
            {modifiedIds.size > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                {modifiedIds.size} cambios sin guardar
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Create Snapshot (Backup) */}
          <button
            onClick={() => setIsSnapshotModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs border border-zinc-300 flex items-center gap-1.5 transition active:scale-95"
            title="Crear un punto de restauración antes de editar"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Crear Snapshot (Backup)</span>
          </button>

          {/* Rollback (Restore) */}
          <button
            onClick={() => setIsRollbackModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs border border-zinc-300 flex items-center gap-1.5 transition active:scale-95"
            title="Revertir cambios si ocurrió un error humano"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Rollback ({snapshots.length})</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 transition"
            title="Recargar desde Supabase"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Save to Supabase */}
          <button
            onClick={handleSaveChanges}
            disabled={isSaving || modifiedIds.size === 0}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white font-bold text-xs border border-zinc-900 shadow-xs hover:bg-zinc-800 flex items-center gap-1.5 transition disabled:opacity-40 active:scale-95"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Guardando...' : 'Guardar en Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Crop Matrix Table with Photographic Thumbnails */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead className="bg-zinc-50 text-zinc-700 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="p-3">Especie &amp; Fotografía</th>
                <th className="p-3">Demanda Hídrica (mm)</th>
                <th className="p-3">Tolerancia Helada (°C)</th>
                <th className="p-3">Balance N₂ Suelo (kg/ha)</th>
                <th className="p-3">Barrera Sanitaria Gorgojo</th>
                <th className="p-3 text-right">Estado Producción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-mono">
              {editableCrops.map((crop) => {
                const imgUrl = CROP_IMAGES[crop.crop_id] || '/images/papa_nativa.jpg';
                const isModified = modifiedIds.has(crop.crop_id);
                const isNitrogenOutRange =
                  crop.crop_id === 'tarwi' &&
                  (crop.balance_nitrogeno_kg_ha > 120 || crop.balance_nitrogeno_kg_ha < 60);

                return (
                  <tr
                    key={crop.crop_id}
                    className={`transition-colors ${
                      isModified ? 'bg-amber-50/60' : 'hover:bg-zinc-50/80'
                    }`}
                  >
                    {/* Crop Name & Photo */}
                    <td className="p-3 font-semibold text-zinc-950 font-sans">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0 shadow-2xs">
                          <img
                            src={imgUrl}
                            alt={crop.nombre_comun}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">{crop.nombre_comun}</span>
                            {isModified && (
                              <span className="w-2 h-2 rounded-full bg-amber-500" title="Modificado" />
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 italic font-mono block">
                            {crop.nombre_cientifico}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Water Demand */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={crop.demanda_hidrica_optima_mm}
                          onChange={(e) =>
                            handleFieldChange(
                              crop.crop_id,
                              'demanda_hidrica_optima_mm',
                              e.target.value
                            )
                          }
                          className="w-20 px-2 py-1 bg-white border border-zinc-300 rounded-md text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <span className="text-[10px] text-zinc-500">mm</span>
                      </div>
                    </td>

                    {/* Frost Tolerance */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          value={crop.tolerancia_helada_c}
                          onChange={(e) =>
                            handleFieldChange(crop.crop_id, 'tolerancia_helada_c', e.target.value)
                          }
                          className="w-20 px-2 py-1 bg-white border border-zinc-300 rounded-md text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                        />
                        <span className="text-[10px] text-zinc-500">°C</span>
                      </div>
                    </td>

                    {/* Nitrogen Balance */}
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={crop.balance_nitrogeno_kg_ha}
                            onChange={(e) =>
                              handleFieldChange(
                                crop.crop_id,
                                'balance_nitrogeno_kg_ha',
                                e.target.value
                              )
                            }
                            className={`w-20 px-2 py-1 border rounded-md text-xs font-bold text-center ${
                              crop.balance_nitrogeno_kg_ha > 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-zinc-50 text-zinc-700 border-zinc-300'
                            }`}
                          />
                          <span className="text-[10px] text-zinc-500">kg/ha</span>
                        </div>
                        {isNitrogenOutRange && (
                          <span className="text-[9px] font-sans text-amber-700 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Rango INIA: 80-120
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Weevil Pest Disruption */}
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(
                            crop.crop_id,
                            'rompe_plaga_gorgojo',
                            !crop.rompe_plaga_gorgojo
                          )
                        }
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition ${
                          crop.rompe_plaga_gorgojo
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                        }`}
                      >
                        {crop.rompe_plaga_gorgojo ? '🛡️ Inmune (Corta Ciclo)' : '⚠️ Huésped (Sensible)'}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="p-3 text-right">
                      <span className="text-emerald-700 font-bold flex items-center justify-end gap-1.5 text-xs font-sans">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {isModified ? 'Pendiente' : 'Activo Live'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Snapshot Creation Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-zinc-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-zinc-950">
                  Crear Punto de Restauración (Snapshot)
                </h3>
              </div>
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600">
              Guarda el estado completo de los {editableCrops.length} cultivos actuales. Si te equivocas o experimentas valores, podrás restaurar este punto con un solo clic.
            </p>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Etiqueta o Motivo del Respaldo:
              </label>
              <input
                type="text"
                value={snapshotNote}
                onChange={(e) => setSnapshotNote(e.target.value)}
                placeholder="ej. Previo a recalibrar nitrógeno de leguminosas"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-1 focus:ring-zinc-900"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="flex-1 py-2 rounded-lg border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSnapshot}
                className="flex-1 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-xs"
              >
                Guardar Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback & History Modal */}
      {isRollbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 border border-zinc-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-zinc-950">
                  Historial de Snapshots &amp; Rollback
                </h3>
              </div>
              <button
                onClick={() => setIsRollbackModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600">
              ¿Cometiste un error al ingresar datos? Selecciona un punto de restauración anterior para revertir la tabla y sincronizarla de inmediato en Supabase.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 hover:border-zinc-300 transition flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-900">{snap.name}</span>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {snap.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 font-sans">{snap.note}</p>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold block">
                      {snap.cropsCount} especies respaldadas
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleRollback(snap)}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                      title="Revertir producción a esta versión"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Revertir</span>
                    </button>
                    {snapshots.length > 1 && snap.id !== 'snap-initial' && (
                      <button
                        onClick={() => handleDeleteSnapshot(snap.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Eliminar snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setIsRollbackModalOpen(false)}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs font-semibold rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
