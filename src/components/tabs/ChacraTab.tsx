'use client';

import React, { useState, useEffect } from 'react';
import { Cultivo, FarmerProfile, ParcelItem } from '@/lib/types';
import {
  HelpCircle,
  Droplets,
  Leaf,
  Layers,
  AlertTriangle,
  ChevronRight,
  MapPin,
  PenTool,
  Sliders,
  Sun,
  Plus,
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';
import { playBubblePop, playSuccessFanfare } from '@/lib/soundEffects';
import ParcelMap from '@/components/ParcelMap';
import {
  getStoredParcels,
  saveParcel,
  updateParcel,
  deleteParcel,
  setActiveParcelId,
  getActiveParcelId,
} from '@/lib/deviceProfile';

interface ChacraTabProps {
  profile: FarmerProfile;
  cultivos?: Cultivo[];
  isElNino?: boolean;
  hardwareId?: string;
  selectedParcelId?: string | null;
  onClearSelectedParcel?: () => void;
  onToast: (msg: string) => void;
  onRecalibrate?: () => void;
  onNavigateToInicio?: () => void;
  onUpdateCrop?: (cropId: string, cropName: string) => void;
  onUpdatePriority?: (priority: 'tierra' | 'comida' | 'mercado', priorityName: string) => void;
  onUpdateArea?: (areaHa: number) => void;
  onOpenWizard?: () => void;
  onOpenQgisDrawer?: () => void;
}

export default function ChacraTab({
  profile,
  cultivos = [],
  isElNino = false,
  hardwareId,
  selectedParcelId,
  onClearSelectedParcel,
  onToast,
  onRecalibrate,
  onNavigateToInicio,
  onUpdateCrop,
  onUpdatePriority,
  onUpdateArea,
  onOpenWizard,
  onOpenQgisDrawer,
}: ChacraTabProps) {
  // Parcels list from local storage
  const [parcels, setParcels] = useState<ParcelItem[]>([]);
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('Todos');
  const [selectedParcel, setSelectedParcel] = useState<ParcelItem | null>(null);

  // Edit and Delete Modals
  const [editingParcel, setEditingParcel] = useState<ParcelItem | null>(null);
  const [deletingParcelId, setDeletingParcelId] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editCrop, setEditCrop] = useState('');
  const [editArea, setEditArea] = useState(1.5);
  const [editNotes, setEditNotes] = useState('');

  // Satellite layer toggles for detail view
  const [layerSmap, setLayerSmap] = useState(true);
  const [layerNdvi, setLayerNdvi] = useState(false);
  const [layerDrought, setLayerDrought] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Load parcels on mount and select target parcel if specified
  useEffect(() => {
    const loaded = getStoredParcels();
    setParcels(loaded);
    if (selectedParcelId) {
      const target = loaded.find((p) => p.id === selectedParcelId);
      if (target) {
        setSelectedParcel(target);
      }
    }
  }, [selectedParcelId]);

  const handleToggleSmap = () => {
    playBubblePop();
    const next = !layerSmap;
    setLayerSmap(next);
    onToast(next ? 'Capa SMAP humedad activada' : 'Capa SMAP desactivada');
  };

  const handleToggleNdvi = () => {
    playBubblePop();
    const next = !layerNdvi;
    setLayerNdvi(next);
    onToast(next ? 'Capa NDVI vegetación activada' : 'Capa NDVI desactivada');
  };

  const handleToggleDrought = () => {
    playBubblePop();
    const next = !layerDrought;
    setLayerDrought(next);
    onToast(next ? 'Capa Calor y sequía activada' : 'Capa Sequía desactivada');
  };

  const handleSelectParcel = (parcel: ParcelItem) => {
    playBubblePop();
    setSelectedParcel(parcel);
    setActiveParcelId(parcel.id);
  };

  const handleOpenEdit = (parcel: ParcelItem) => {
    playBubblePop();
    setEditingParcel(parcel);
    setEditName(parcel.name);
    setEditCrop(parcel.cropName);
    setEditArea(parcel.areaHa);
    setEditNotes(parcel.notes || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParcel) return;
    playSuccessFanfare();

    const updatedList = updateParcel(editingParcel.id, {
      name: editName.trim() || editingParcel.name,
      cropName: editCrop.trim() || editingParcel.cropName,
      areaHa: editArea,
      areaTopos: Number((editArea * 3.3).toFixed(1)),
      notes: editNotes.trim(),
    });

    setParcels(updatedList);
    const updatedSelected = updatedList.find((p) => p.id === editingParcel.id) || null;
    setSelectedParcel(updatedSelected);
    setEditingParcel(null);
    onToast('Parcela actualizada correctamente');
  };

  const handleDeleteConfirm = () => {
    if (!deletingParcelId) return;
    playBubblePop();

    const updatedList = deleteParcel(deletingParcelId);
    setParcels(updatedList);
    if (selectedParcel?.id === deletingParcelId) {
      setSelectedParcel(null);
    }
    setDeletingParcelId(null);
    onToast('Parcela eliminada');
  };

  const filteredParcels = selectedCropFilter === 'Todos'
    ? parcels
    : parcels.filter((p) => p.cropCategory === selectedCropFilter || p.cropName.includes(selectedCropFilter));

  // =========================================================================
  // VISTA 1: MIS PARCELAS (CARDS VIEW)
  // =========================================================================
  if (!selectedParcel) {
    return (
      <div className="space-y-4 animate-in fade-in pb-20">
        {/* Top Header */}
        <div className="flex items-start justify-between px-1 pt-1">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
              CAMPO Y SABERES
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#132A1C] leading-tight">
              Mis parcelas
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              playBubblePop();
              if (onOpenQgisDrawer) onOpenQgisDrawer();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7BB63E] hover:bg-[#8CD045] text-[#132A1C] font-semibold text-xs transition cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva parcela</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['Todos', 'Papa nativa', 'Maíz', 'Quinua', 'Cebada', 'Habas'].map((filter) => {
            const isSelected = selectedCropFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  playBubblePop();
                  setSelectedCropFilter(filter);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#7BB63E] text-white shadow-xs font-semibold'
                    : 'bg-white text-zinc-700 border border-[#E5ECE2] hover:bg-zinc-50'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        {filteredParcels.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-[#E5ECE2] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-800">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800">No hay parcelas en esta categoría</h3>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              Delimita una nueva parcela utilizando el visor satelital con el botón superior.
            </p>
            <button
              type="button"
              onClick={() => {
                playBubblePop();
                if (onOpenQgisDrawer) onOpenQgisDrawer();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#7BB63E] text-[#132A1C] font-semibold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Delimitar con Visor QGIS</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredParcels.map((parcel) => (
              <div
                key={parcel.id}
                onClick={() => handleSelectParcel(parcel)}
                className="relative overflow-hidden rounded-3xl bg-[#132A1C] text-white shadow-sm border border-emerald-900/40 flex flex-col justify-between min-h-[240px] p-4 cursor-pointer group hover:shadow-md transition active:scale-98"
              >
                {/* Andean Background Photo */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('${parcel.photoUrl || '/images/andes_bright.jpg'}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#132A1C] via-[#132A1C]/70 to-transparent" />

                {/* Top Row: Crop Tag & Checkmark */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-white/95 bg-[#132A1C]/80 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-xs">
                    {parcel.cropCategory || parcel.cropName}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 space-y-2 mt-auto pt-6">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                      {parcel.name}
                    </h3>
                    <p className="text-[11px] text-zinc-300 leading-snug font-normal mt-0.5">
                      {parcel.microcuenca}
                    </p>
                  </div>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center font-mono">
                    <div className="bg-[#132A1C]/80 backdrop-blur-xs rounded-xl p-1.5 border border-white/10">
                      <span className="text-[9px] text-zinc-400 block">ÁREA</span>
                      <span className="text-xs font-bold text-white">{parcel.areaHa} ha</span>
                    </div>
                    <div className="bg-[#132A1C]/80 backdrop-blur-xs rounded-xl p-1.5 border border-white/10">
                      <span className="text-[9px] text-zinc-400 block">SMAP</span>
                      <span className="text-xs font-bold text-[#A3E635]">{parcel.smapHumidity}%</span>
                    </div>
                    <div className="bg-[#132A1C]/80 backdrop-blur-xs rounded-xl p-1.5 border border-white/10">
                      <span className="text-[9px] text-zinc-400 block">SALUD</span>
                      <span className="text-xs font-bold text-white">{parcel.healthScore}/100</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-300 font-semibold">
                    <span>Ver mapa e informe satelital</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VISTA 2: DETALLE DE PARCELA (SATELLITE MAP + LAYER TOGGLES + EDIT/DELETE)
  // =========================================================================
  const currentArea = selectedParcel.areaHa;
  const topos = (currentArea * 3.3).toFixed(1);

  return (
    <div className="space-y-4 animate-in fade-in pb-20">
      {/* 1. Header Section with Back Button */}
      <div className="flex items-start justify-between px-1 pt-1">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              setSelectedParcel(null);
              if (onClearSelectedParcel) onClearSelectedParcel();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Mis Parcelas</span>
          </button>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
              {selectedParcel.microcuenca.toUpperCase()}
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#132A1C] leading-tight">
              Tu campo,{' '}
              <span className="italic text-emerald-800 font-normal">
                desde arriba.
              </span>
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playBubblePop();
            setShowInfoModal(!showInfoModal);
          }}
          className="w-9 h-9 rounded-full bg-white border border-[#E5ECE2] text-zinc-600 hover:text-emerald-800 flex items-center justify-center shadow-xs transition cursor-pointer"
          title="Información de capas satelitales"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Info Popover if clicked */}
      {showInfoModal && (
        <div className="bg-white rounded-2xl p-3.5 border border-[#E5ECE2] shadow-sm text-xs text-zinc-700 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-semibold text-emerald-900 text-[11px] uppercase">
            <span>Guía de Telemetría Satelital</span>
            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="text-zinc-400 hover:text-zinc-600 font-bold text-xs"
            >
              ✕
            </button>
          </div>
          <p className="leading-relaxed">
            Las capas combinan radiometría radar L-band (NASA SMAP) a 9 km interpolada con topografía SRTM 30m y reflectancia espectral Sentinel-2 para el Valle de Urubamba.
          </p>
        </div>
      )}

      {/* 2. SATELLITE MAP CONTAINER (CONCENTRIC RADAR RINGS & OVERLAYS - Imagen 8) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#132A1C] border border-[#E5ECE2] shadow-sm min-h-[300px] h-[300px]">
        {/* Leaflet Satellite Map Layer */}
        <div className="h-full w-full relative z-0">
          <ParcelMap
            lat={selectedParcel.lat}
            lon={selectedParcel.lon}
            parcelName={`${selectedParcel.name} (${currentArea} ha)`}
            altitude={selectedParcel.altitudeMsnm}
            slope={12}
            areaHa={currentArea}
            cropName={selectedParcel.cropName}
            isEditorialView={true}
          />
        </div>

        {/* Concentric Radar Overlay Rings */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border border-white/20 border-dashed animate-pulse" />
          <div className="w-64 h-64 rounded-full border border-white/15 border-dashed absolute" />
          <div className="w-80 h-80 rounded-full border border-white/10 border-dashed absolute" />
        </div>

        {/* Top Floating Badges on Map: LOCALIDAD · MSNM · EN VIVO */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-[#132A1C]/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3 text-[#A3E635]" />
            <span>{selectedParcel.name.split('•')[0].trim().toUpperCase()} · {selectedParcel.altitudeMsnm} MSNM</span>
          </div>

          <div className="bg-[#132A1C]/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15 text-[10px] font-bold text-[#A3E635] flex items-center gap-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
            <span>EN VIVO</span>
          </div>
        </div>

        {/* QGIS Drawing Tool toggle button bottom-right */}
        {onOpenQgisDrawer && (
          <button
            type="button"
            onClick={() => {
              playBubblePop();
              onOpenQgisDrawer();
            }}
            className="absolute bottom-3 right-3 z-20 bg-white/90 hover:bg-white text-[#132A1C] text-[10px] font-semibold px-2.5 py-1 rounded-xl shadow-md border border-zinc-200 flex items-center gap-1 cursor-pointer transition active:scale-95"
            title="Redelimitar con visor satelital QGIS"
          >
            <PenTool className="w-3 h-3 text-emerald-800" />
            <span>QGIS</span>
          </button>
        )}
      </div>

      {/* 3. LAYER TOGGLE SWITCHES UNDER MAP (Exact styling from Frame 003 / Imagen 8) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {/* Toggle 1: SMAP humedad */}
          <button
            type="button"
            onClick={handleToggleSmap}
            className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-full border text-xs font-bold transition cursor-pointer shadow-2xs ${
              layerSmap
                ? 'bg-emerald-50/70 border-emerald-300 text-[#132A1C]'
                : 'bg-white border-[#E5ECE2] text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Droplets className={`w-3.5 h-3.5 shrink-0 ${layerSmap ? 'text-emerald-700' : 'text-zinc-400'}`} />
              <span className="truncate">SMAP humedad</span>
            </div>
            <div
              className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                layerSmap ? 'bg-[#7BB63E]' : 'bg-zinc-200'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                  layerSmap ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          {/* Toggle 2: NDVI vegetación */}
          <button
            type="button"
            onClick={handleToggleNdvi}
            className={`flex-1 flex items-center justify-between px-3.5 py-2 rounded-full border text-xs font-bold transition cursor-pointer shadow-2xs ${
              layerNdvi
                ? 'bg-emerald-50/70 border-emerald-300 text-[#132A1C]'
                : 'bg-white border-[#E5ECE2] text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Leaf className={`w-3.5 h-3.5 shrink-0 ${layerNdvi ? 'text-emerald-700' : 'text-zinc-400'}`} />
              <span className="truncate">NDVI vegetación</span>
            </div>
            <div
              className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                layerNdvi ? 'bg-[#7BB63E]' : 'bg-zinc-200'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                  layerNdvi ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Toggle 3: Calor y sequía */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleToggleDrought}
            className={`w-1/2 flex items-center justify-between px-3.5 py-2 rounded-full border text-xs font-bold transition cursor-pointer shadow-2xs ${
              layerDrought
                ? 'bg-amber-50/70 border-amber-300 text-[#132A1C]'
                : 'bg-white border-[#E5ECE2] text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Sun className={`w-3.5 h-3.5 shrink-0 ${layerDrought ? 'text-amber-600' : 'text-zinc-400'}`} />
              <span className="truncate">Calor y sequía</span>
            </div>
            <div
              className={`w-8 h-4.5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                layerDrought ? 'bg-amber-400' : 'bg-zinc-200'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                  layerDrought ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* 4. SELECTED PARCEL CARD (Imagen 8) */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5ECE2] space-y-4">
        {/* Header row: PARCELA SELECCIONADA + Crop Name + Edit/Delete Actions */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-900/60 block">
              PARCELA SELECCIONADA · {selectedParcel.name}
            </span>
            <h2 className="text-xl font-bold text-[#132A1C] mt-0.5">
              {selectedParcel.cropName}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenEdit(selectedParcel)}
              className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition cursor-pointer"
              title="Editar datos de parcela"
            >
              <Edit3 className="w-4 h-4 text-emerald-800" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingParcelId(selectedParcel.id)}
              className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-700 transition cursor-pointer"
              title="Eliminar parcela"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3 Summary Stats with vertical divider lines */}
        <div className="grid grid-cols-3 divide-x divide-[#E5ECE2] border-t border-b border-[#E5ECE2] py-3 text-center">
          <div className="px-1">
            <span className="text-[10px] font-semibold text-zinc-500 block">Área total</span>
            <span className="text-sm font-semibold text-[#132A1C] mt-0.5 block">
              {currentArea} ha
            </span>
          </div>
          <div className="px-1">
            <span className="text-[10px] font-semibold text-zinc-500 block">Edad cultivo</span>
            <span className="text-sm font-semibold text-[#132A1C] mt-0.5 block">
              {selectedParcel.plantAgeDays} días
            </span>
          </div>
          <div className="px-1">
            <span className="text-[10px] font-semibold text-zinc-500 block">Rendimiento est.</span>
            <span className="text-sm font-semibold text-[#132A1C] mt-0.5 block">
              {selectedParcel.estimatedYieldTons} t
            </span>
          </div>
        </div>

        {/* 2x2 Grid of 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Metric 1: Humedad suelo */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Droplets className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block">Humedad suelo</span>
            <span className="text-xl font-semibold text-[#132A1C] block leading-none">
              {selectedParcel.smapHumidity}%
            </span>
            <span className="text-[9.5px] text-zinc-400 block font-mono">SMAP</span>
          </div>

          {/* Metric 2: Salud planta */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Leaf className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block">Salud planta</span>
            <span className="text-xl font-semibold text-[#132A1C] block leading-none">
              {Math.round(selectedParcel.ndviScore * 100)}%
            </span>
            <span className="text-[9.5px] text-zinc-400 block font-mono">NDVI</span>
          </div>

          {/* Metric 3: Calidad suelo */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <Layers className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block">Calidad suelo</span>
            <span className="text-xl font-semibold text-[#132A1C] block leading-none">
              {selectedParcel.healthScore}%
            </span>
            <span className="text-[9.5px] text-zinc-400 block font-mono">Muestreo local</span>
          </div>

          {/* Metric 4: Riesgo sequía */}
          <div className="bg-[#F7F9F6] rounded-2xl p-3.5 border border-[#E5ECE2] space-y-1">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3E3] flex items-center justify-center text-emerald-800">
              <AlertTriangle className="w-4 h-4 text-emerald-700" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 block">Riesgo sequía</span>
            <span className="text-xl font-semibold text-[#132A1C] block leading-none">
              {selectedParcel.smapHumidity < 15 ? 'Alto' : 'Moderado'}
            </span>
            <span className="text-[9.5px] text-zinc-400 block font-mono">Alerta preventiva</span>
          </div>
        </div>

        {/* Notes if available */}
        {selectedParcel.notes && (
          <div className="bg-emerald-50/50 rounded-2xl p-3 border border-emerald-200/60 text-xs text-emerald-950">
            <span className="font-semibold text-[10px] uppercase block text-emerald-800">Notas de campo:</span>
            <p className="mt-0.5">{selectedParcel.notes}</p>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: EDITAR PARCELA
         ========================================================================= */}
      {editingParcel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-[#E5ECE2] animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E5ECE2] pb-3">
              <h3 className="text-base font-bold text-[#132A1C]">Editar Parcela</h3>
              <button
                type="button"
                onClick={() => setEditingParcel(null)}
                className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 hover:text-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-300 text-zinc-800 focus:outline-hidden focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Cultivo</label>
                <input
                  type="text"
                  value={editCrop}
                  onChange={(e) => setEditCrop(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-300 text-zinc-800 focus:outline-hidden focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between font-semibold text-zinc-700 mb-1">
                  <span>Área: {editArea} ha</span>
                  <span className="text-zinc-500 font-normal font-mono">({(editArea * 3.3).toFixed(1)} topos)</span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={10.0}
                  step={0.25}
                  value={editArea}
                  onChange={(e) => setEditArea(parseFloat(e.target.value))}
                  className="w-full accent-[#7BB63E]"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Notas de manejo</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-xl border border-zinc-300 text-zinc-800 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingParcel(null)}
                  className="flex-1 py-2.5 rounded-full border border-zinc-300 text-zinc-700 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#7BB63E] text-[#132A1C] font-semibold text-xs shadow-xs"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIRMAR BORRADO
         ========================================================================= */}
      {deletingParcelId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-[#E5ECE2] animate-in fade-in text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-800">¿Eliminar esta parcela?</h3>
              <p className="text-xs text-zinc-600 mt-1">
                Esta acción eliminará el registro de la parcela y su calibración satelital.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingParcelId(null)}
                className="flex-1 py-2.5 rounded-full border border-zinc-300 text-zinc-700 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
