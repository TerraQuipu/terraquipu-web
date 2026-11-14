'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface AdminSession {
  email: string;
  role: string;
  institution: string;
  loggedAt: number;
  token?: string;
}

interface AdminLoginFormProps {
  onLoginSuccess: (session: AdminSession) => void;
}

export default function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  // Entradas limpias sin precarga de datos
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Credenciales autorizadas
  const VALID_USERS: Record<string, { pass: string; role: string; institution: string }> = {
    'admin@terraquipu.gob.pe': {
      pass: 'Andenes2024*',
      role: 'SuperAdmin Territorial',
      institution: 'INIA Perú / MINAGRI / Terraquipu',
    },
    'inia.cusco@terraquipu.org': {
      pass: 'Inia2024*',
      role: 'Especialista Agrónomo Regional',
      institution: 'Estación Experimental Andenes - Cusco',
    },
    'cip.lima@terraquipu.org': {
      pass: 'Cip2024*',
      role: 'Investigador RAG & Semillas',
      institution: 'Centro Internacional de la Papa (CIP)',
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. Intento primario con Supabase Auth
      let authUser: AdminSession | null = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (data?.session && !error) {
          authUser = {
            email: data.user.email || cleanEmail,
            role: 'SuperAdmin Supabase Auth',
            institution: 'MINAGRI / Terraquipu Cloud',
            loggedAt: Date.now(),
            token: data.session.access_token,
          };
        }
      } catch (authErr) {
        console.warn('Supabase Auth attempt:', authErr);
      }

      // 2. Validación de credenciales autorizadas
      if (!authUser) {
        const expected = VALID_USERS[cleanEmail];
        if (expected && expected.pass === cleanPassword) {
          authUser = {
            email: cleanEmail,
            role: expected.role,
            institution: expected.institution,
            loggedAt: Date.now(),
            token: 'tq-jwt-' + Math.random().toString(36).substring(2),
          };
        }
      }

      if (authUser) {
        localStorage.setItem('terraquipu_admin_session', JSON.stringify(authUser));
        onLoginSuccess(authUser);
      } else {
        setErrorMessage('Credenciales no autorizadas. Verifique el correo institucional y la clave.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en el servicio de autenticación.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col justify-between items-center px-4 py-8 text-zinc-100 font-sans">
      <div className="w-full flex-1 flex flex-col justify-center items-center">
        {/* Contenedor formal tipo institucional / gubernamental */}
        <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-xl">
          {/* Título formal sobrio */}
          <div className="border-b border-zinc-800 pb-4 mb-5 text-left">
            <h1 className="text-base font-bold text-white tracking-tight">
              Consola de Administración
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sistema de Gobernanza Agraria Terraquipu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Correo institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@terraquipu.gob.pe"
                required
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-3 pr-9 py-2 bg-zinc-950 border border-zinc-700 rounded text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-medium text-xs rounded transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <span>Iniciar sesión</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
            <Link
              href="/visor"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition inline-flex items-center gap-1"
            >
              <span>← Volver al visor principal</span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="text-[11px] text-zinc-500 text-center">
        Terraquipu • Sistema de Monitoreo Territorial e Ingesta Satelital
      </footer>
    </div>
  );
}
