'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Toast from '@/components/layout/Toast';
import CropMatrixTable from '@/components/admin/CropMatrixTable';
import PipelinesMonitor from '@/components/admin/PipelinesMonitor';
import QgisManager from '@/components/admin/QgisManager';
import RagDocuments from '@/components/admin/RagDocuments';
import AdminCopilotModal from '@/components/admin/AdminCopilotModal';
import AdminLoginForm, { AdminSession } from '@/components/admin/AdminLoginForm';
import {
  fetchCropMatrix,
  fetchFarmerReports,
  DEFAULT_CROPS,
} from '@/lib/supabase';
import { CropRecord, ReporteAgricultor } from '@/types';
import {
  Table,
  Satellite,
  Map,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Bot,
  LogOut,
  UserCheck,
} from 'lucide-react';

export default function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'matrix' | 'pipelines' | 'qgis' | 'rag'>('matrix');
  const [crops, setCrops] = useState<CropRecord[]>(DEFAULT_CROPS);
  const [reports, setReports] = useState<ReporteAgricultor[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  // Check stored session on mount
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('terraquipu_admin_session') ||
        sessionStorage.getItem('terraquipu_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored) as AdminSession;
        // Optionally check if older than 30 days
        setSession(parsed);
      }
    } catch (e) {
      console.warn('Error reading admin session from storage', e);
    } finally {
      setAuthChecked(true);
    }
  }, []);

  // Load initial data only if authenticated
  useEffect(() => {
    if (!session) return;

    async function loadInitialData() {
      setIsSyncing(true);
      const [cropsRes, reportsRes] = await Promise.all([
        fetchCropMatrix(),
        fetchFarmerReports(),
      ]);
      if (cropsRes.data && cropsRes.data.length > 0) setCrops(cropsRes.data);
      if (reportsRes.data) setReports(reportsRes.data);
      setIsSyncing(false);
      setDbStatus(cropsRes.error ? 'offline' : 'connected');
    }
    loadInitialData();
  }, [session]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setDbStatus('syncing');
    showToast('Sincronizando con Supabase en tiempo real...');
    const [cropsRes, reportsRes] = await Promise.all([
      fetchCropMatrix(),
      fetchFarmerReports(),
    ]);
    if (cropsRes.data && cropsRes.data.length > 0) setCrops(cropsRes.data);
    if (reportsRes.data) setReports(reportsRes.data);
    setIsSyncing(false);
    setDbStatus(cropsRes.error ? 'offline' : 'connected');
    showToast('Base de datos Supabase sincronizada');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('terraquipu_admin_session');
      sessionStorage.removeItem('terraquipu_admin_session');
    } catch (e) {
      console.error(e);
    }
    setSession(null);
    showToast('Sesión de administrador cerrada correctamente');
  };

  // 1. Initial Auth Check Loading State
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
        <p className="text-xs text-zinc-400 font-mono">Verificando credenciales de seguridad...</p>
      </div>
    );
  }

  // 2. Unauthenticated State -> Show Admin Login Form
  if (!session) {
    return (
      <>
        <AdminLoginForm
          onLoginSuccess={(validSession) => {
            setSession(validSession);
            showToast(`Bienvenido a la consola, ${validSession.email}`);
          }}
        />
        <Toast message={toastMessage} isVisible={toastVisible} />
      </>
    );
  }

  // 3. Authenticated State -> Full Admin Backoffice Console
  return (
    <div className="h-screen flex flex-col bg-zinc-100 overflow-hidden">
      {/* Dedicated Admin Header */}
      <header className="h-14 bg-zinc-950 text-white px-4 sm:px-6 flex items-center justify-between border-b border-zinc-800 flex-shrink-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs brand-logo">
            TQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white uppercase">
                Terraquipu
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/40">
                Consola Admin (Backoffice)
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              Gobernanza Agronómica, Ingesta Satelital NASA &amp; Base RAG
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Session Info Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-300 font-bold text-[10px]">
              {session.email.charAt(0).toUpperCase()}
            </div>
            <div className="text-left leading-tight">
              <span className="block text-zinc-200 font-semibold text-[11px] truncate max-w-[140px]">
                {session.email}
              </span>
              <span className="block text-[9px] text-emerald-400 font-mono truncate max-w-[140px]">
                {session.role}
              </span>
            </div>
          </div>

          {/* AI Copilot Button */}
          <button
            onClick={() => setIsCopilotOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-700/70 shadow-xs flex items-center gap-1.5 transition active:scale-95 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Copiloto IA Guardián</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          {/* Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs border border-zinc-700 shadow-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Sync Supabase</span>
          </button>

          <span className="h-4 w-px bg-zinc-800 mx-1" />

          {/* Navigation to Field Technician Viewer */}
          <Link
            href="/visor"
            className="px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs border border-zinc-700 shadow-xs flex items-center gap-1.5 transition"
            title="Ir al Visor Técnico Territorial de Parcelas"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden md:inline">Visor Técnico</span>
          </Link>

          {/* Log Out Button */}
          <button
            onClick={handleLogout}
            className="px-2.5 py-1.5 rounded-md bg-red-950/40 hover:bg-red-900/60 text-red-300 hover:text-red-100 font-semibold text-xs border border-red-800/50 shadow-xs flex items-center gap-1.5 transition active:scale-95"
            title="Cerrar Sesión Segura de Administrador"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Admin Body with Sidebar and Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row bg-zinc-50">
        <aside className="w-full md:w-64 bg-zinc-950 text-white flex flex-col border-r border-zinc-800 flex-shrink-0">
          <div className="p-4 border-b border-zinc-800">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
              Consola Backoffice
            </span>
            <h3 className="font-bold text-base text-white leading-tight mt-0.5">
              Administración de Datos
            </h3>
            <p className="text-xs text-zinc-400">Nodo Cusco v4.2 • Supabase Live</p>
          </div>

          <nav className="p-3 space-y-1.5 flex-1 text-xs">
            {/* AI Copilot Sidebar Callout */}
            <button
              onClick={() => setIsCopilotOpen(true)}
              className="w-full p-2.5 rounded-xl font-bold flex items-center gap-2.5 bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-800/60 text-emerald-200 hover:text-white hover:border-emerald-500 transition shadow-xs group"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-500/50 bg-emerald-950 flex items-center justify-center flex-shrink-0">
                <img
                  src="/images/kipu_llama_happy.png"
                  alt="Kipu Guardián"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left flex-1 min-w-0">
                <span className="block truncate text-xs font-bold text-white">
                  Kipu Guardián (IA)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auditor Activo
                </span>
              </div>
            </button>

            <span className="block h-px bg-zinc-800 my-2" />

            <button
              onClick={() => setAdminTab('matrix')}
              className={`w-full p-2.5 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
                adminTab === 'matrix'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Table className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <span className="block">Matriz de Cultivos</span>
                <span className="text-[10px] opacity-70 font-mono">CRUD &amp; Rollback</span>
              </div>
            </button>

            <button
              onClick={() => setAdminTab('pipelines')}
              className={`w-full p-2.5 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
                adminTab === 'pipelines'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Satellite className="w-4 h-4 text-sky-500" />
              <div className="text-left">
                <span className="block">Pipelines Satelitales</span>
                <span className="text-[10px] opacity-70 font-mono">NASA POWER &amp; SMAP</span>
              </div>
            </button>

            <button
              onClick={() => setAdminTab('qgis')}
              className={`w-full p-2.5 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
                adminTab === 'qgis'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Map className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <span className="block">Gestor QGIS</span>
                <span className="text-[10px] opacity-70 font-mono">GeoJSON Export/Import</span>
              </div>
            </button>

            <button
              onClick={() => setAdminTab('rag')}
              className={`w-full p-2.5 rounded-lg font-semibold flex items-center gap-2.5 transition-all ${
                adminTab === 'rag'
                  ? 'bg-white text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              <div className="text-left">
                <span className="block">Base RAG (INIA)</span>
                <span className="text-[10px] opacity-70 font-mono">Indexación de Chunks</span>
              </div>
            </button>
          </nav>

          <div className="p-3.5 border-t border-zinc-800 bg-zinc-900/60">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">Cultivos activos:</span>
              <span className="text-white font-bold">{crops.length} especies</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Sesión:</span>
              <span className="text-emerald-400 font-semibold truncate max-w-[120px]">
                {session.role.split(' ')[0]}
              </span>
            </div>
          </div>
        </aside>

        <div className="flex-1 h-full overflow-y-auto p-6 bg-zinc-50">
          {adminTab === 'matrix' && (
            <CropMatrixTable
              crops={crops}
              onRefresh={handleManualSync}
              onShowToast={showToast}
            />
          )}
          {adminTab === 'pipelines' && (
            <PipelinesMonitor reports={reports} onShowToast={showToast} />
          )}
          {adminTab === 'qgis' && <QgisManager onShowToast={showToast} />}
          {adminTab === 'rag' && <RagDocuments onShowToast={showToast} />}
        </div>
      </main>

      {/* Admin AI Copilot Modal */}
      <AdminCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        crops={crops}
        reports={reports}
        onTriggerBackup={() => {
          showToast('Punto de restauración (Snapshot) preventivo generado');
        }}
        onShowToast={showToast}
      />

      <Toast message={toastMessage} isVisible={toastVisible} />
    </div>
  );
}
