"use client";

import React, { useState } from "react";
import { 
  Satellite, 
  Sprout, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  MapPin, 
  Droplets, 
  SunMedium, 
  Layers, 
  BookOpen, 
  Cpu, 
  Users, 
  QrCode,
  Github,
  ChevronDown
} from "lucide-react";

export default function SuperpowerTerraquipuLanding() {
  const [selectedRole, setSelectedRole] = useState("comunidad");
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [folio, setFolio] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const generatedFolio = "TQ-" + Math.floor(1000 + Math.random() * 9000);
    setFolio(generatedFolio);
    setLeadSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* ================= 1. FLOATING SUPERPOWER PILL NAVBAR ================= */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
        <div className="rounded-full bg-[#242426]/90 backdrop-blur-xl border border-white/15 px-6 py-2.5 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.65)]">
          
          {/* Left Navigation Links (Superpower: What we test, Reviews, FAQs, For Employers) */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-white/90">
            <a href="#como-funciona" className="hover:text-white transition">Cómo funciona</a>
            <a href="#diagnostico" className="hover:text-white transition">Diagnóstico 30m</a>
            <a href="#quipu" className="hover:text-white transition">El Quipu</a>
            <a href="#unirse" className="hover:text-white transition">Comunidad</a>
          </nav>

          {/* Center Brand Name (Exact Superpower Style: lowercase bold centered wordmark) */}
          <a href="#" className="flex items-center gap-2 group mx-auto lg:mx-0">
            <span className="brand-logo text-xl font-extrabold tracking-tight text-white lowercase">
              terraquipu
            </span>
          </a>

          {/* Right Action Cluster (Log in, Become a member, 3x3 Grid Dots) */}
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/TerraQuipu" 
              target="_blank" 
              rel="noreferrer" 
              className="hidden sm:inline-block text-[13px] font-semibold text-white/90 hover:text-white px-2 py-1 transition"
            >
              GitHub
            </a>

            {/* White Pill Button: Become a member */}
            <a 
              href="./app.html" 
              className="px-5 py-2 rounded-full bg-white text-black text-[13px] font-semibold hover:bg-zinc-100 transition-all shadow-sm flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Visor Satelital</span>
            </a>

            {/* Circular 3x3 Grid Dots Icon Button */}
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Menú"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <circle cx="5" cy="5" r="2"/>
                <circle cx="12" cy="5" r="2"/>
                <circle cx="19" cy="5" r="2"/>
                <circle cx="5" cy="12" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="19" cy="12" r="2"/>
                <circle cx="5" cy="19" r="2"/>
                <circle cx="12" cy="19" r="2"/>
                <circle cx="19" cy="19" r="2"/>
              </svg>
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="mt-2 p-5 rounded-3xl bg-[#1c1c1f]/95 backdrop-blur-2xl border border-white/15 text-white shadow-2xl flex flex-col gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-white/10">Cómo funciona</a>
            <a href="#diagnostico" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-white/10">Diagnóstico 30m</a>
            <a href="#quipu" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-white/10">El Quipu de Rotación</a>
            <a href="#unirse" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-white/10">Comunidad & Postulación</a>
            <a href="https://github.com/TerraQuipu" target="_blank" rel="noreferrer" className="hover:text-amber-400 py-1.5 flex items-center justify-between">
              <span>Repositorio en GitHub</span>
              <span>↗</span>
            </a>
          </div>
        )}
      </header>

      {/* ================= 2. HERO SECTION (ICONIC SUPERPOWER GOLDEN SUN HALO) ================= */}
      <section className="relative bg-[#090A0D] text-white pt-28 pb-24 md:pt-36 md:pb-36 overflow-hidden">
        
        {/* The Superpower Signature: Golden Solar Halo Glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] sm:w-[650px] md:w-[750px] aspect-square pointer-events-none opacity-90">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 blur-[90px] opacity-40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Copy Left */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>NASA SPACE APPS • VALIDACIÓN OFICIAL INIA PERÚ</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-white leading-[1.08] tracking-tight">
              Inteligencia satelital para regenerar la salud del suelo, <br className="hidden sm:inline" />
              <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                cada campaña.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-xl font-normal leading-relaxed">
              Terraquipu fusiona observaciones orbitales de la NASA con la sabiduría agronómica del Quipu milenario. Predecimos sequías por El Niño y diseñamos rotaciones multianuales que devuelven nitrógeno al suelo sin fertilizantes químicos.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a 
                href="./app.html" 
                className="px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
              >
                <span>🛰️ Explorar Visor Satelital</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="#como-funciona" 
                className="px-6 py-3.5 rounded-full border border-white/20 bg-white/5 text-white font-medium text-sm hover:bg-white/10 transition text-center"
              >
                Cómo funciona ↓
              </a>
            </div>

            {/* Bottom Hero Value Proposition Points */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <div className="text-xl font-bold font-mono text-white">100+</div>
                <div className="text-xs text-zinc-400 mt-0.5">Indicadores satelitales</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-amber-400">+95 kg/ha</div>
                <div className="text-xs text-zinc-400 mt-0.5">Nitrógeno biológico</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-white">3 Años</div>
                <div className="text-xs text-zinc-400 mt-0.5">Rotación Quipu</div>
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-emerald-400">0 Soles</div>
                <div className="text-xs text-zinc-400 mt-0.5">100% Código Abierto</div>
              </div>
            </div>

          </div>

          {/* Hero Visual Right (Superpower Dramatic Solar Glow + Farmer Portrait) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Golden Sun Ring Circle */}
            <div className="relative w-[340px] sm:w-[420px] aspect-square rounded-full border-[6px] border-amber-500/40 p-4 shadow-[0_0_100px_rgba(245,158,11,0.5)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-amber-500 via-amber-600 to-amber-900 overflow-hidden relative flex items-end justify-center">
                
                {/* Farmer / Soil Guardian silhouette photo representation */}
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop" 
                  alt="Agricultor Andino" 
                  className="w-full h-full object-cover object-top opacity-90 mix-blend-luminosity filter contrast-125"
                />

                {/* Floating Badge in Portrait */}
                <div className="absolute bottom-6 left-6 right-6 bg-[#090A0D]/85 backdrop-blur-md border border-white/20 p-3 rounded-xl text-center shadow-lg">
                  <div className="text-[10px] font-mono text-amber-300 uppercase tracking-widest font-semibold">Cusco, Perú • 3,762 m</div>
                  <div className="text-xs font-bold text-white mt-0.5">Parcela Piloto Chinchero Sector B</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">● Telemetría Satelital Activa</div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ================= 3. SCIENTIFIC TRUST STRIP ================= */}
      <section className="py-12 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-6 font-semibold">
            DESARROLLADO CON PROTOCOLOS Y DATOS DE CIENCIA PÚBLICA ABIERTA
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="font-mono text-xs font-bold text-zinc-800">✦ NASA POWER API</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ NASA SMAP RADAR</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ INIA PERÚ</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ SENAMHI CLIMA</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ ISRIC SOILGRIDS</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ OPEN-METEO DEM</div>
          </div>
        </div>
      </section>

      {/* ================= 4. FEATURE CAROUSEL CARDS ("CÓMO FUNCIONA" - SUPERPOWER 4 CARDS) ================= */}
      <section id="como-funciona" className="py-24 bg-[#FAF9F5] border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
              METODOLOGÍA TERRAQUIPU
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-zinc-950">
              La salud del suelo es el escudo más poderoso frente a El Niño.
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Un sistema integral de cuatro fases que convierte mediciones espaciales en decisiones agrícolas que salvan cosechas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Satellite className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Paso 01</div>
                <h3 className="text-lg font-bold text-zinc-900">Escaneo Orbital Continuo</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Monitoreo de precipitación histórica (NASA POWER) y humedad del suelo (NASA SMAP) para detectar anomalías de sequía con meses de anticipación.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-zinc-100 text-[11px] font-mono text-amber-800 font-medium">
                NASA POWER AG API
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Paso 02</div>
                <h3 className="text-lg font-bold text-zinc-900">Perfil Edáfico a 30m</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Corrección topográfica con elevaciones SRTM a 90m y SoilGrids para calcular pendiente, pH, materia orgánica y piso ecológico exacto.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-zinc-100 text-[11px] font-mono text-emerald-800 font-medium">
                Downscaling Topográfico
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Paso 03</div>
                <h3 className="text-lg font-bold text-zinc-900">El Quipu de Rotación</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Algoritmo determinista que diseña la secuencia multianual óptima: Leguminosa (Tarwi) $\rightarrow$ Grano resiliente (Quinua) $\rightarrow$ Papa Nativa.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-zinc-100 text-[11px] font-mono text-blue-800 font-medium">
                Motor INIA Auditable
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700">
                  <Sprout className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Paso 04</div>
                <h3 className="text-lg font-bold text-zinc-900">Regeneración y Cosecha</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Aporte biológico de +95 kg N/ha, reducción del 75% en la incidencia del gorgojo andino y suelo 100% fértil sin comprar fertilizantes químicos.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-zinc-100 text-[11px] font-mono text-orange-800 font-medium">
                Suelo 100% Regenerado
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 5. LIFESTYLE TABLET SHOWCASE ("DIAGNÓSTICO INTEGRAL") ================= */}
      <section id="diagnostico" className="py-24 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Tablet Mockup Screen */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border-[8px] border-zinc-900 bg-zinc-950 p-2 shadow-2xl overflow-hidden">
              <div className="rounded-xl overflow-hidden bg-zinc-900 aspect-[16/10] relative flex flex-col justify-between p-6 text-white">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-amber-400 font-bold">// VISOR GEOESPACIAL DE PARCELA</span>
                  <span className="text-zinc-400">CHINCHERO • 3,762 M</span>
                </div>

                <div className="grid grid-cols-3 gap-3 my-auto">
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-md">
                    <div className="text-[10px] text-zinc-400">Lluvia Campaña</div>
                    <div className="text-xl font-bold font-mono">510 mm</div>
                    <div className="text-[9px] text-amber-400">-24% Déficit</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-md">
                    <div className="text-[10px] text-zinc-400">Humedad Suelo</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">18.4%</div>
                    <div className="text-[9px] text-zinc-300">VWC Calibrado</div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-md">
                    <div className="text-[10px] text-zinc-400">Nitrógeno Ganado</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">+95 kg</div>
                    <div className="text-[9px] text-emerald-300">Por hectárea</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/10 text-xs font-mono">
                  <span>Recomendación: Tarwi (Leguminosa)</span>
                  <a href="./app.html" className="text-amber-300 hover:text-white flex items-center gap-1 font-bold">
                    <span>Lanzar Mapa</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Description Right */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
              DIAGNÓSTICO EN PARCELA
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-zinc-950 leading-tight">
              Un mapa integral de la salud de tu suelo en tus manos.
            </h2>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Los técnicos y agricultores ya no tienen que adivinar cuándo lloverá o si el suelo tiene los nutrientes suficientes. Con un solo clic sobre la parcela, Terraquipu despliega los indicadores críticos de la cuenca.
            </p>

            <ul className="space-y-3 text-xs text-zinc-700">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Resolución efectiva de 30m:</strong> Downscaling adaptado a laderas andinas.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Historial agroclimático de 20 años:</strong> Modelado estacional de sequías.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Cálculo de pH y textura edáfica:</strong> Datos de ISRIC SoilGrids v2.0.</span>
              </li>
            </ul>

            <div className="pt-2">
              <a 
                href="./app.html" 
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-black font-bold hover:gap-3 transition-all"
              >
                <span>Explorar sectores en vivo (Chinchero, Moray, Urubamba)</span>
                <span>→</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 6. COMMUNITY PLAN TRANSPARENT COMPARISON CARD (SUPERPOWER STYLE) ================= */}
      <section className="py-24 bg-[#090A0D] text-white">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              ACCESO COMUNITARIO ABIERTO
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-white">
              Todo lo que incluye el programa Terraquipu.
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              Tecnología espacial libre para campesinos y científicos, sin cuotas de licencia ni barreras comerciales.
            </p>
          </div>

          {/* Superpower Membership Card Style */}
          <div className="rounded-3xl border border-white/15 bg-[#12141A] p-8 sm:p-12 space-y-8 shadow-2xl relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h3 className="text-2xl font-serif text-white">Membresía Abierta de Microcuenca</h3>
                <p className="text-xs text-zinc-400 mt-1">Para comunidades agrícolas, investigadores y desarrolladores</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-extrabold font-mono text-white">0 Soles</div>
                <div className="text-xs text-emerald-400 font-mono">100% Open Source (Licencia MIT)</div>
              </div>
            </div>

            {/* Features Checklist (10 items) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Monitoreo satelital continuo (NASA POWER & SMAP)</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Alertas tempranas de estrés por El Niño</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Secuencia multianual de 3 campañas (Quipu)</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Justificación técnica con citas INIA Perú</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Matriz agronómica abierta (crop_matrix.json)</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>API REST de alto rendimiento en FastAPI</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Emulador de telemetría de campo Arduino</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Visor interactivo en Leaflet sin costo de servidor</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-400 font-mono">
                Desplegado para Cusco, Valle Sagrado y nuevas cuencas 2026-2027.
              </div>
              <a 
                href="#unirse" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-zinc-200 transition shadow-lg text-center"
              >
                Inscribir mi Parcela o Comunidad
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 7. SCIENTIFIC ADVISORY COUNCIL ================= */}
      <section className="py-24 bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              RESPALDO CIENTÍFICO
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-zinc-950">
              Guiado por agrónomos y científicos del clima.
            </h2>
            <p className="text-xs text-zinc-600">
              Validamos cada parámetro agronómico con literatura técnica oficial peruana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="text-xs font-mono uppercase text-amber-700 font-bold">INIA Perú</div>
              <h3 className="text-base font-bold text-zinc-900">Manual Técnico N° 14</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Manejo integrado del cultivo de Tarwi (<em>Lupinus mutabilis</em>) y fijación de hasta 100 kg N/ha en suelos de altura.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="text-xs font-mono uppercase text-blue-700 font-bold">SENAMHI</div>
              <h3 className="text-base font-bold text-zinc-900">Boletines Agroclimáticos</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Calibración de umbrales térmicos, heladas agronómicas y déficit estacional de lluvias en la Sierra Sur.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="text-xs font-mono uppercase text-emerald-700 font-bold">NASA Space Apps</div>
              <h3 className="text-base font-bold text-zinc-900">Global Challenge 2026</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Solución de software galardonada para democratizar la inteligencia de observación terrestre a comunidades campesinas.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 8. MULTI-PROFILE LEAD CAPTURE FORM (SUPERPOWER JOIN) ================= */}
      <section id="unirse" className="py-24 bg-[#FAF9F5] border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
              POSTULACIÓN ABIERTA 2026-2027
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-zinc-950">
              Forma parte de la Alianza Terraquipu.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Completa tus datos y nos pondremos en contacto contigo en menos de 24 horas para coordinar el diagnóstico de tu zona o tu aporte al código.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl space-y-6">
            
            {/* Persona Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <button 
                type="button" 
                onClick={() => setSelectedRole("comunidad")}
                className={`py-2 px-3 rounded-xl border transition ${selectedRole === 'comunidad' ? 'bg-black text-white border-black font-bold' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}
              >
                🌾 Comunidad
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedRole("desarrollador")}
                className={`py-2 px-3 rounded-xl border transition ${selectedRole === 'desarrollador' ? 'bg-black text-white border-black font-bold' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}
              >
                💻 Programador
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedRole("investigador")}
                className={`py-2 px-3 rounded-xl border transition ${selectedRole === 'investigador' ? 'bg-black text-white border-black font-bold' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}
              >
                🔬 Científico
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedRole("sponsor")}
                className={`py-2 px-3 rounded-xl border transition ${selectedRole === 'sponsor' ? 'bg-black text-white border-black font-bold' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}
              >
                🤝 Donante
              </button>
            </div>

            {leadSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold">
                  ✓
                </div>
                <h4 className="text-lg font-serif text-emerald-950 font-bold">¡Solicitud Registrada con Éxito!</h4>
                <p className="text-xs text-emerald-800">
                  Hemos generado tu folio de seguimiento <strong className="font-mono">{folio}</strong>. Te escribiremos vía WhatsApp o correo en menos de 24 horas.
                </p>
                <div className="pt-2">
                  <a href="./app.html" className="inline-block px-5 py-2 rounded-full bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition">
                    Ir al Visor Satelital →
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-600 mb-1">Nombre Completo *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ej. Juan Quispe" 
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-black transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-600 mb-1">Correo Electrónico *</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="juan@comunidad.org" 
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-600 mb-1">WhatsApp / Teléfono *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="+51 987 654 321" 
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-black transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-zinc-600 mb-1">Comunidad / Universidad / Zona</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Valle Sagrado, Cusco" 
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-black transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-600 mb-1">Mensaje o Detalle de tus Parcelas</label>
                  <textarea 
                    rows={2} 
                    placeholder="Cuéntanos brevemente sobre tus cultivos actuales o propuesta de contribución..." 
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-black transition"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 rounded-full bg-black text-white text-xs font-mono uppercase tracking-wider font-semibold hover:bg-zinc-800 transition shadow-md"
                >
                  Enviar Postulación Comunitaria →
                </button>

                <p className="text-[10px] text-center text-zinc-400 font-mono">
                  🔒 Cero spam. Datos tratados estrictamente para la coordinación técnica del piloto abierto.
                </p>
              </form>
            )}

          </div>

        </div>
      </section>

      {/* ================= 9. DRAMATIC BOTTOM GOLDEN HALO BANNER (SUPERPOWER SIGNATURE) ================= */}
      <section className="relative bg-[#090A0D] text-white py-28 px-6 overflow-hidden text-center">
        
        {/* Massive Centered Golden Solar Halo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] aspect-square pointer-events-none opacity-80">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 blur-[100px] opacity-45"></div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-semibold">
            TERRAQUIPU • EL PODER DEL SUELO
          </span>

          <h2 className="text-4xl sm:text-6xl font-serif font-light text-white leading-tight">
            El suelo es la mayor fuerza de los Andes.
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto font-normal">
            Únete a la red global de comunidades campesinas, agrónomos y desarrolladores que están protegiendo la soberanía alimentaria frente al cambio climático.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="./app.html" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-zinc-200 transition shadow-2xl"
            >
              Lanzar Visor Satelital
            </a>
            <a 
              href="#unirse" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 bg-white/10 text-white font-medium text-xs uppercase tracking-wider hover:bg-white/20 transition"
            >
              Registrar Parcela
            </a>
          </div>
        </div>

      </section>

      {/* ================= 10. CLEAN MULTI-COLUMN FOOTER ================= */}
      <footer className="bg-white py-16 border-t border-zinc-200 text-xs text-zinc-500 font-sans">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-10">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-zinc-900 font-mono font-bold tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500 inline-block"></span>
              TERRAQUIPU
            </div>
            <p className="text-xs text-zinc-600 max-w-sm">
              Sistema de inteligencia territorial y regeneración edáfica en los Andes. Desarrollado con datos de la NASA para el NASA Space Apps Challenge 2026.
            </p>
            <div className="text-[11px] font-mono text-zinc-400">
              MIT License • Código Abierto Comunitario
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-zinc-900">Plataforma</div>
            <ul className="space-y-1.5 text-xs">
              <li><a href="./app.html" className="hover:text-black transition">Visor GIS Satelital</a></li>
              <li><a href="#como-funciona" className="hover:text-black transition">Cómo Funciona</a></li>
              <li><a href="#diagnostico" className="hover:text-black transition">Diagnóstico 30m</a></li>
              <li><a href="#unirse" className="hover:text-black transition">Inscribir Parcela</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-zinc-900">Repositorios</div>
            <ul className="space-y-1.5 text-xs font-mono">
              <li><a href="https://github.com/TerraQuipu/terraquipu-web" target="_blank" className="hover:text-black transition">terraquipu-web</a></li>
              <li><a href="https://github.com/TerraQuipu/terraquipu-api" target="_blank" className="hover:text-black transition">terraquipu-api</a></li>
              <li><a href="https://github.com/TerraQuipu/terraquipu-data" target="_blank" className="hover:text-black transition">terraquipu-data</a></li>
              <li><a href="https://github.com/TerraQuipu/terraquipu-iot" target="_blank" className="hover:text-black transition">terraquipu-iot</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-zinc-900">Ciencia Abierta</div>
            <ul className="space-y-1.5 text-xs">
              <li><a href="https://power.larc.nasa.gov/" target="_blank" className="hover:text-black transition">NASA POWER</a></li>
              <li><a href="https://smap.jpl.nasa.gov/" target="_blank" className="hover:text-black transition">NASA SMAP</a></li>
              <li><a href="https://www.gob.pe/inia" target="_blank" className="hover:text-black transition">INIA Perú</a></li>
              <li><a href="https://www.senamhi.gob.pe/" target="_blank" className="hover:text-black transition">SENAMHI</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 mt-10 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>© 2026 Terraquipu Project. Diseñado con sabiduría ancestral y telemetría espacial.</div>
          <div>Cusco • Valle Sagrado • Perú</div>
        </div>
      </footer>

    </div>
  );
}
