"use client";

import React, { useState, useEffect } from "react";
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

// Royalty-free background video playlist (Optimized local MP4 with CDN fallback - Andes aerials & Andean agriculture)
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/terraquipu-web' : '';

const HERO_PLAYLIST = [
  {
    id: "andes",
    label: "Cordillera de los Andes",
    url: `${BASE_PATH}/videos/andes.mp4`,
    fallback: "https://assets.mixkit.co/videos/4132/4132-720.mp4",
    poster: `${BASE_PATH}/videos/andes_poster.jpg`
  },
  {
    id: "cultivos",
    label: "Valles y Maizales",
    url: `${BASE_PATH}/videos/cultivos.mp4`,
    fallback: "https://assets.mixkit.co/videos/35854/35854-720.mp4",
    poster: `${BASE_PATH}/videos/cultivos_poster.jpg`
  },
  {
    id: "cosecha",
    label: "Cosecha & Semilla",
    url: `${BASE_PATH}/videos/cosecha.mp4`,
    fallback: "https://assets.mixkit.co/videos/48769/48769-720.mp4",
    poster: `${BASE_PATH}/videos/cosecha_poster.jpg`
  }
];

const DIAGNOSTICO_TABS = [
  {
    label: "Diagnóstico en Parcela",
    title: "Cada parcela comienza con 100+ indicadores agroclimáticos.",
    subtitle: "Diagnóstico edáfico a 30m de resolución con telemetría satelital en tiempo real para anticipar sequías, optimizar nitrógeno y proteger tus cultivos frente a El Niño."
  },
  {
    label: "Historial Agroclimático",
    title: "Dos décadas de memoria satelital para tu cuenca.",
    subtitle: "Modelado agroclimático de 20 años con NASA POWER para anticipar anomalías pluviométricas y calcular curvas de evapotranspiración con rigor científico."
  },
  {
    label: "Rotación Quipu",
    title: "Un plan multianual regenerativo para tu suelo.",
    subtitle: "Secuencia determinista auditada por INIA: Tarwi para inyección biológica de nitrógeno (+95 kg N/ha), Quinua tolerante y Papa Nativa resistente."
  },
  {
    label: "Alertas El Niño",
    title: "Alertas predictivas antes de que la sequía golpee.",
    subtitle: "Telemetría radar NASA SMAP para calibrar la humedad radicular y activar planes de contingencia hídrica meses antes de la siembra."
  }
];

const DIAGNOSTICO_FAQS = [
  {
    q: "¿Cómo mide Terraquipu la humedad a 30m?",
    a: "Combinando radar L-Band NASA SMAP con downscaling topográfico SRTM a 90m y modelos edáficos SoilGrids a 30m calibrados para laderas andinas."
  },
  {
    q: "¿Qué datos satelitales y públicos se integran?",
    a: "Datos abiertos de NASA POWER (clima y radiación solar), NASA SMAP (humedad de suelo), ISRIC SoilGrids v2 (perfil de suelo) y registros meteorológicos de SENAMHI."
  },
  {
    q: "¿Cómo se valida la rotación con normas INIA?",
    a: "El motor algorítmico sigue las guías técnicas del INIA (Instituto Nacional de Innovación Agraria) para fijación biológica de nitrógeno (+95 kg N/ha) y control del gorgojo andino."
  }
];

export default function SuperpowerTerraquipuLanding() {
  const [selectedRole, setSelectedRole] = useState("comunidad");
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [folio, setFolio] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [activeDiagnosticoTab, setActiveDiagnosticoTab] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Automatic seamless transition across videos every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIdx((prev) => (prev + 1) % HERO_PLAYLIST.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const generatedFolio = "TQ-" + Math.floor(1000 + Math.random() * 9000);
    setFolio(generatedFolio);
    setLeadSuccess(true);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* ================= 1. DYNAMIC NAVBAR (SUPERPOWER DEFAULT -> SCROLL PILL) ================= */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? "pt-3 px-4 sm:px-0" : "pt-2"
      }`}>
        <div className={`transition-all duration-300 ease-in-out flex items-center justify-between ${
          isScrolled 
            ? "max-w-6xl mx-auto rounded-full bg-[#242426]/90 backdrop-blur-xl border border-white/15 px-6 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)]" 
            : "max-w-7xl mx-auto px-6 sm:px-10 py-4 bg-transparent border-b border-transparent"
        }`}>
          
          {/* Left Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-white/90">
            <a href="#como-funciona" className="hover:text-white transition">Cómo funciona</a>
            <a href="#diagnostico" className="hover:text-white transition">Diagnóstico 30m</a>
            <a href="#quipu" className="hover:text-white transition">El Quipu</a>
            <a href="#unirse" className="hover:text-white transition">Comunidad</a>
          </nav>

          {/* Center Brand Name (Exact Superpower Style: lowercase bold centered wordmark) */}
          <a href="#" className="flex items-center gap-2 group mx-auto lg:mx-0">
            <span className="brand-logo text-xl sm:text-2xl font-extrabold tracking-tight text-white lowercase">
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

            {/* White Pill Button */}
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
          <div className="max-w-6xl mx-auto mt-2 p-5 rounded-3xl bg-[#1c1c1f]/95 backdrop-blur-2xl border border-white/15 text-white shadow-2xl flex flex-col gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200">
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

      {/* ================= 2. HERO SECTION ================= */}
      <section id="hero-section" className="relative bg-[#090A0D] text-white pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-[92vh] flex items-center">
        
        {/* Dynamic Background Video (Andes & Agriculture) - Bright, Vibrant and Fully Visible */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            key={HERO_PLAYLIST[currentVideoIdx].url}
            autoPlay
            muted
            loop={false}
            playsInline
            poster={HERO_PLAYLIST[currentVideoIdx].poster}
            onEnded={() => setCurrentVideoIdx((prev) => (prev + 1) % HERO_PLAYLIST.length)}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
          >
            <source src={HERO_PLAYLIST[currentVideoIdx].url} type="video/mp4" />
            <source src={HERO_PLAYLIST[currentVideoIdx].fallback} type="video/mp4" />
          </video>

          {/* Minimal, subtle scrim so white text is readable without hiding the video */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D]/80 via-transparent to-black/30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full py-12 md:py-20">
          
          {/* Hero Copy Left */}
          <div className="max-w-3xl space-y-7">
            
            {/* Trust Badge: Open Science Attribution */}
            <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
              <span className="text-amber-400 font-bold">✓</span>
              <span>Protocolos basados en datos de INIA & SENAMHI • NASA Space Apps Challenge</span>
            </div>

            <h1 className="hero-headline text-4xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.08] tracking-tight">
              Inteligencia satelital para regenerar la salud del suelo, <br className="hidden sm:inline" />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                cada campaña.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
              100+ indicadores agroclimáticos. Un plan diseñado para tu cuenca. Todo lo que necesitas para proteger tus cultivos frente a El Niño.
            </p>

            {/* Exact Superpower Button Styles: Solid White Pill + Translucent Dark Glass Pill */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a 
                href="./app.html" 
                className="px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-100 transition shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>🛰️ Explorar Visor Satelital</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a 
                href="#como-funciona" 
                className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md text-white border border-white/15 font-semibold text-sm transition text-center hover:scale-[1.01] active:scale-[0.99]"
              >
                Cómo funciona ↓
              </a>
            </div>

          </div>

        </div>

      </section>

      {/* ================= 3. SCIENTIFIC TRUST STRIP ================= */}
      <section className="py-12 bg-white">
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
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
              METODOLOGÍA TERRAQUIPU
            </span>
            <h2 className="hero-headline text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 tracking-tight leading-tight">
              La salud del suelo es el escudo más poderoso frente a El Niño.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto font-sans">
              Un sistema integral de cuatro fases que convierte mediciones espaciales en decisiones agrícolas que salvan cosechas.
            </p>
          </div>

          {/* Superpower 4-Card Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* ================= Card 1: Escaneo Orbital Continuo ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Image: NASA Space Orbit */}
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop"
                  alt="Escaneo Orbital y Satelital"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Gradient vignette for seamless telemetry contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

                {/* Top Number Badge (Superpower Style) */}
                <div className="relative z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  1
                </div>

                {/* Floating Frosted Glass Pill (Exact Match to Image 4) */}
                <div className="relative z-10 w-full rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-white/15 p-3.5 shadow-xl text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm shrink-0">
                        🛰️
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-white tracking-wide">
                          NASA SMAP Radar
                        </div>
                        <div className="text-[11px] font-mono text-zinc-300 flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Humedad: 18.4% VWC
                        </div>
                      </div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">
                      ✓
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card (Arial Font) */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  Escaneo Orbital Continuo
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Monitoreo de precipitación histórica (NASA POWER) y humedad del suelo (NASA SMAP) para detectar anomalías de sequía con meses de anticipación.
                </p>
              </div>
            </div>

            {/* ================= Card 2: Perfil Edáfico a 30m ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Image: Andean agricultural terraces */}
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop"
                  alt="Perfil Edáfico Andenes"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

                {/* Top Number Badge */}
                <div className="relative z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  2
                </div>

                {/* Floating White Pill (Exact Match to Image 4) */}
                <div className="relative z-10 w-full rounded-2xl bg-white/95 backdrop-blur-xl border border-zinc-200/90 p-3.5 shadow-xl text-zinc-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                      MUESTRA EDÁFICA
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full font-bold">
                      30m SRTM
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-zinc-100 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between items-center text-zinc-700">
                      <span className="text-zinc-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> pH Suelo
                      </span>
                      <span className="font-bold text-zinc-900">6.4 <span className="text-[10px] text-emerald-600 font-normal">(Óptimo)</span></span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-700">
                      <span className="text-zinc-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Materia Orgánica
                      </span>
                      <span className="font-bold text-zinc-900">3.8%</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-700">
                      <span className="text-zinc-500 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Pendiente Valle
                      </span>
                      <span className="font-bold text-zinc-900">18° Grados</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card (Arial Font) */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  Perfil Edáfico a 30m
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Corrección topográfica con elevaciones SRTM a 90m y SoilGrids para calcular pendiente, pH, materia orgánica y piso ecológico exacto.
                </p>
              </div>
            </div>

            {/* ================= Card 3: El Quipu de Rotación ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Image: Soil and seeds in farmer hands */}
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop"
                  alt="Quipu de Rotación Semillas"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

                {/* Top Number Badge */}
                <div className="relative z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  3
                </div>

                {/* Floating Frosted Glass Pill (Exact Match to Image 4) */}
                <div className="relative z-10 w-full rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-white/15 p-3.5 shadow-xl text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1">
                      <span>⚡</span> SECUENCIA QUIPU
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                      INIA 2026
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-white/15 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between items-center text-zinc-200">
                      <span className="text-zinc-300">1. Tarwi (Leguminosa)</span>
                      <span className="text-emerald-400 font-bold text-[10px]">+95 kg N/ha</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-200">
                      <span className="text-zinc-300">2. Quinua Real</span>
                      <span className="text-amber-300 font-bold text-[10px]">Corte ciclo</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-200">
                      <span className="text-zinc-300">3. Papa Nativa</span>
                      <span className="text-blue-300 font-bold text-[10px]">Alta resiliencia</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card (Arial Font) */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  El Quipu de Rotación
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Algoritmo determinista que diseña la secuencia multianual óptima: Leguminosa (Tarwi) → Grano resiliente (Quinua) → Papa Nativa.
                </p>
              </div>
            </div>

            {/* ================= Card 4: Regeneración y Cosecha ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Image: Golden Harvest Fields */}
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop"
                  alt="Cosecha y Regeneración de Suelo"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

                {/* Top Number Badge */}
                <div className="relative z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  4
                </div>

                {/* Floating Frosted Glass Pill (Exact Match to Image 4) */}
                <div className="relative z-10 w-full rounded-2xl bg-zinc-950/85 backdrop-blur-xl border border-white/15 p-3.5 shadow-xl text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-300 uppercase">
                      CAMPAÑA COSECHADA
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      ✓ Éxito
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-white/15 grid grid-cols-2 gap-2 text-center font-mono">
                    <div className="bg-white/5 rounded-xl p-1.5">
                      <div className="text-xl font-bold text-emerald-400 tracking-tight">+34%</div>
                      <div className="text-[9px] text-zinc-400 uppercase tracking-wider mt-0.5">Rendimiento</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-1.5">
                      <div className="text-xl font-bold text-amber-300 tracking-tight">-75%</div>
                      <div className="text-[9px] text-zinc-400 uppercase tracking-wider mt-0.5">Gorgojo Plaga</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card (Arial Font) */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  Regeneración y Cosecha
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Aporte biológico de +95 kg N/ha, reducción del 75% en la incidencia del gorgojo andino y suelo 100% fértil sin comprar fertilizantes químicos.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 5. LIFESTYLE TABLET SHOWCASE ("DIAGNÓSTICO INTEGRAL" - FULL SCREEN, BORDE A LA IMAGEN SIN LÍNEA) ================= */}
      <section id="diagnostico" className="relative w-full min-h-[720px] lg:min-h-[840px] bg-white overflow-hidden flex items-center">
        
        {/* Full Section Background Image with rounded corners on image only (sin línea de borde) */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <img 
            src={`${BASE_PATH}/images/agronomist_white_bg.jpg`} 
            alt="Diagnóstico en Parcela con Tablet" 
            className="h-[105%] lg:h-[114%] w-auto max-h-[880px] object-contain object-center transform -translate-x-8 sm:-translate-x-12 lg:-translate-x-20 xl:-translate-x-24 rounded-[32px] sm:rounded-[40px] lg:rounded-[48px] select-none"
          />
        </div>

        {/* Content Container (Floats directly over full-screen white canvas) */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">
            
            {/* Left Block: Heading, Subtitle & Floating Glass FAQs (Superpower Pattern) */}
            <div className="w-full lg:max-w-[360px] xl:max-w-[380px] space-y-7 shrink-0">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
                  DIAGNÓSTICO EN PARCELA
                </span>
                <h2 className="hero-headline text-3xl sm:text-4xl lg:text-[40px] font-bold text-zinc-950 leading-[1.12] tracking-tight transition-all duration-300">
                  {DIAGNOSTICO_TABS[activeDiagnosticoTab].title}
                </h2>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed transition-all duration-300 max-w-[340px]">
                  {DIAGNOSTICO_TABS[activeDiagnosticoTab].subtitle}
                </p>
              </div>

              {/* Floating Frosted Glass FAQ Accordions with Smooth Expand/Collapse Animation */}
              <div className="space-y-2.5 pt-2 w-full max-w-[360px]">
                {DIAGNOSTICO_FAQS.map((faq, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-2xl bg-zinc-900/95 hover:bg-zinc-900 backdrop-blur-xl border border-white/10 p-3.5 text-white transition-all duration-300 shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-3 text-xs font-medium cursor-pointer"
                    >
                      <span className="font-sans text-zinc-100">{faq.q}</span>
                      <span className={`w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs text-zinc-300 shrink-0 font-mono font-bold transition-transform duration-300 ease-in-out ${
                        expandedFaq === idx ? 'rotate-45 bg-amber-500/20 text-amber-300 border-amber-500/30' : 'rotate-0'
                      }`}>
                        +
                      </span>
                    </button>
                    
                    {/* Animated Expand / Collapse grid container */}
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        expandedFaq === idx 
                          ? 'grid-rows-[1fr] opacity-100 mt-2.5 pt-2.5 border-t border-white/10' 
                          : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spacer for Center Space (where the huge tablet in the background is displayed) */}
            <div className="hidden lg:block lg:flex-1 pointer-events-none" />

            {/* Right Block: Vertical Tab Navigation (Sitting in pure white corridor between iPad and person) */}
            <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-3 lg:gap-5 text-xs font-sans overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0 self-center z-20 mr-0 lg:mr-4 xl:mr-8 -translate-y-16 lg:-translate-y-28">
              {DIAGNOSTICO_TABS.map((tab, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveDiagnosticoTab(idx)}
                  className={`flex items-center justify-between gap-5 text-left transition-all py-1.5 cursor-pointer group ${
                    activeDiagnosticoTab === idx
                      ? "text-zinc-950 font-bold border-l-2 border-zinc-950 pl-3.5 -ml-[2px]"
                      : "text-zinc-600 hover:text-zinc-950 font-semibold pl-3.5 border-l-2 border-transparent"
                  }`}
                >
                  <span className="tracking-tight leading-snug whitespace-nowrap">{tab.label}</span>
                  <span className="font-mono text-[11px] text-zinc-500 group-hover:text-zinc-900 shrink-0 font-bold ml-4">
                    0{idx + 1}
                  </span>
                </button>
              ))}
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
      <section className="py-24 bg-white">
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
      <section id="unirse" className="py-24 bg-white">
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
      <footer className="bg-white py-16 text-xs text-zinc-500 font-sans">
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

        <div className="max-w-7xl mx-auto px-6 pt-10 mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>© 2026 Terraquipu Project. Diseñado con sabiduría ancestral y telemetría espacial.</div>
          <div>Cusco • Valle Sagrado • Perú</div>
        </div>
      </footer>

    </div>
  );
}
