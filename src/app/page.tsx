"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Satellite, 
  Smartphone,
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
  ChevronDown,
  Globe,
} from "lucide-react";
import { getStoredLanguage, saveStoredLanguage } from "@/lib/deviceProfile";
import { getTranslation, SupportedLanguage } from "@/lib/translations";

// Royalty-free background video playlist (Optimized local MP4 with CDN fallback - Andes aerials & Andean agriculture)
const BASE_PATH = '';

const HERO_PLAYLIST = [
  {
    id: "andes",
    label: "Andes Mountain Range",
    url: `${BASE_PATH}/videos/andes.mp4`,
    fallback: "https://assets.mixkit.co/videos/4132/4132-720.mp4",
    poster: `${BASE_PATH}/videos/andes_poster.jpg`
  },
  {
    id: "cultivos",
    label: "Valleys & Cornfields",
    url: `${BASE_PATH}/videos/cultivos.mp4`,
    fallback: "https://assets.mixkit.co/videos/35854/35854-720.mp4",
    poster: `${BASE_PATH}/videos/cultivos_poster.jpg`
  },
  {
    id: "cosecha",
    label: "Harvest & Heritage Seeds",
    url: `${BASE_PATH}/videos/cosecha.mp4`,
    fallback: "https://assets.mixkit.co/videos/48769/48769-720.mp4",
    poster: `${BASE_PATH}/videos/cosecha_poster.jpg`
  }
];

const DIAGNOSTICO_TABS = [
  {
    label: "In-Situ Parcel Diagnostic",
    title: "Every parcel begins with 100+ agroclimatic indicators.",
    subtitle: "30-meter resolution edaphic diagnostic with real-time satellite telemetry to anticipate droughts, optimize nitrogen, and protect crops against El Nino."
  },
  {
    label: "Agroclimatic History",
    title: "Two decades of satellite memory for your watershed.",
    subtitle: "20-year agroclimatic modeling with NASA POWER to anticipate rainfall anomalies and calculate evapotranspiration curves with scientific rigor."
  },
  {
    label: "Quipu Rotation",
    title: "A regenerative multi-year plan for your soil.",
    subtitle: "Deterministic sequence audited by INIA: Tarwi for biological nitrogen fixation (+95 kg N/ha), resilient Quinoa, and tolerant Native Andean Potato."
  },
  {
    label: "El Nino Early Warning",
    title: "Predictive alerts months before drought strikes.",
    subtitle: "NASA SMAP radar telemetry to calibrate root-zone soil moisture and trigger water contingency plans months before sowing."
  }
];

const DIAGNOSTICO_TABS_QU = [
  {
    label: "Chajra Allpa Qhaway",
    title: "Sapa chajramanta pachakmanta aswan tupuykuna rikhurin.",
    subtitle: "Allpapa kurpawasqa tupusqan 30 metrokama, chiri-poqoy yupaywan ch'aki pachata ñawpaqchanapaq, wanuta allichanapaq, Hatun Paranpaq amachanapaqpas."
  },
  {
    label: "Ñawpa Pacha Willakuy",
    title: "Iskay chunka wata hanaq pacha willakuy chajraykipaq.",
    subtitle: "NASA POWER nisqawan 20 wata para yupaykunata qhawarispa sapa killapi yaku chinkayta yachanchik yachay taripaq hina."
  },
  {
    label: "Khipu Muyuy Tarpuy",
    title: "Watantin watantin allpa kawsarichiq tarpuykuna.",
    subtitle: "INIA kamachisqan tarpuy: Tarwi allpaman wanu kawsachiq (+95 kg N/ha), kallpasapa Kinwa, allin Papa Nativapas."
  },
  {
    label: "Hatun Para Sasachakuy",
    title: "Ch'aki pacha manaraq chayamuptin ñawpaq willakuy.",
    subtitle: "NASA SMAP radarwan saphikama allpapa yakunta tupuspa yaku waqaychayta qallarinchik manaraq tarpuchkaspa."
  }
];

const DIAGNOSTICO_FAQS = [
  {
    q: "How does Terraquipu measure moisture at 30m resolution?",
    a: "By combining NASA SMAP L-Band radar with SRTM 90m topographic downscaling and SoilGrids 30m edaphic models calibrated for Andean mountain slopes."
  },
  {
    q: "Which satellite and open science datasets are integrated?",
    a: "Open data from NASA POWER (agroclimatology & solar radiation), NASA SMAP (soil moisture), ISRIC SoilGrids v2 (soil profile), and SENAMHI meteorological records."
  },
  {
    q: "How is crop rotation validated against INIA standards?",
    a: "The algorithmic engine adheres to official INIA (National Institute of Agrarian Innovation) technical guidelines for biological nitrogen fixation (+95 kg N/ha) and Andean potato weevil (Premnotrypes spp.) lifecycle disruption."
  }
];

const DIAGNOSTICO_FAQS_QU = [
  {
    q: "Imaynatam Terraquipu 30m tupuypi allpapa yakunta yupan?",
    a: "NASA SMAP L-Band radar nisqata SRTM 90m urqukunap kayninwan, ISRIC SoilGrids 30m allpa yachaykunata kuskanchaspa."
  },
  {
    q: "Ima hanaq pacha willakuykunatan huñun?",
    a: "NASA POWER (inti kanchay, para), NASA SMAP (allpa chiri-poqo), ISRIC SoilGrids v2 (allpapa kawsaynin) SENAMHI kawsay willakuykunawan."
  },
  {
    q: "Imaynatam INIA kamachiykunawan tarpuy muyuyta qhawachikun?",
    a: "Algoritmo yachayqa Perú INIA kamachiykunatam qatin, Tarwi wanu huñuyninta (+95 kg N/ha) papa kuru (Premnotrypes spp.) kawsayninta chinkachinapaq."
  }
];

const ROTACION_TABS = [
  {
    label: "Multi-Year Quipu Sequence",
    title: "The agronomic Quipu that regenerates soil fertility.",
    subtitle: "Biological algorithms that alternate nitrogen-fixing legumes, Andean grains, and high-resilience tubers to secure harvests against El Nino."
  },
  {
    label: "Biological Nitrogen Fixation",
    title: "+95 kg of organic nitrogen per hectare without agrochemicals.",
    subtitle: "Inoculation and natural biomass contribution through Tarwi / Andean Lupin (Lupinus mutabilis), saving hundreds of dollars in synthetic fertilizers and rebuilding soil structure."
  },
  {
    label: "Pest Cycle Disruption",
    title: "-75% incidence of Andean potato weevil and nematodes.",
    subtitle: "Disruption of pest biological niches through strict botanical alternation (Legume -> Amaranthaceae -> Solanaceae) validated with INIA standards."
  },
  {
    label: "Satellite Chlorophyll Monitoring",
    title: "Multispectral tracking of vegetative biomass and vigor.",
    subtitle: "Sentinel-2 NDVI telemetry every 5 days to detect water or nutrient stress weeks before symptoms become visible on the canopy."
  }
];

const ROTACION_TABS_QU = [
  {
    label: "Khipu Watantin Muyuy",
    title: "Allpa kawsayta allichaq Khipu tarpuy.",
    subtitle: "Kawsay yachaywan Tarwi, Kinwa, Papa Nativata muyuchispa mikuyta Hatun Paranmanta amachanchik."
  },
  {
    label: "Allpapi Wanu Huñuy",
    title: "+95 kg kawsay wanu sapa hectáreapi mana qolqellapaq.",
    subtitle: "Tarwi kawsaywan allpa samasqata wanuwan hunt'achispa qolqeta waqaychanchik, allpata kawsarichinchik."
  },
  {
    label: "Kuru Chinkachiy",
    title: "-75% papa kuruwan nematodokunata chinkachispa.",
    subtitle: "Tarpuykunata sapa wata tikraspa (Tarwi -> Kinwa -> Papa) INIA kamachiywan kurukunata manañam kawsachinchu."
  },
  {
    label: "Hanaq Pacha Q'omer Qhaway",
    title: "Sentinel-2 satélite sapa 5 p'unchaw q'omerta tupun.",
    subtitle: "Chajrapa q'omerninta qhawaspa yakumanta icha unquymanta sasachakuyta ñawpaqmantapacha yachanchik."
  }
];

const ROTACION_FAQS = [
  {
    q: "How does Terraquipu calculate the optimal parcel rotation?",
    a: "By analyzing SRTM elevation, SoilGrids pH, and NASA POWER water deficits to engineer a 3-year alternation that maximizes nutrients without synthetic fertilizers."
  },
  {
    q: "How much does a farmer save by utilizing Tarwi fixation?",
    a: "Up to 95 kg N/ha is equivalent to 4 commercial urea sacks (approx. $450 USD per hectare), while improving soil moisture retention by 22%."
  },
  {
    q: "How can farmers access technical sheets without internet connectivity?",
    a: "Terraquipu generates downloadable community agronomic cards in PDF and features offline PWA caching for field consultation with zero cellular signal."
  }
];

const ROTACION_FAQS_QU = [
  {
    q: "Imaynatam Terraquipu sapa chajra tarpuy muyuyta yupan?",
    a: "SRTM alturata, SoilGrids pH nisqata, NASA POWER yaku chinkayta qhawaspa kimsantin wata tarpuyta allichan mana chimika wanullawan."
  },
  {
    q: "Hayk'atan tarpukamayoc waqaychan Tarwi wanunwan?",
    a: "95 kg N/ha nisqaqa tawa urea saqukunawan kuskam (yaqa $450 USD sapa hectáreapi), allpapa yakuntapas 22% aswanta waqaychan."
  },
  {
    q: "Imaynatam tarpukamayokkuna willakuyta qhawanku mana internet kachkaptin?",
    a: "Terraquipuqa PDF p'anqakunatam ruran offline PWA nisqawan mana señal kachkaptinpas llamk'anallapaq."
  }
];

export default function SuperpowerTerraquipuLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [activeDiagnosticoTab, setActiveDiagnosticoTab] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeRotacionTab, setActiveRotacionTab] = useState(0);
  const [expandedRotacionFaq, setExpandedRotacionFaq] = useState<number | null>(null);
  const [lang, setLang] = useState<SupportedLanguage>('en');

  useEffect(() => {
    setLang(getStoredLanguage() as SupportedLanguage);
    const handle = () => setLang(getStoredLanguage() as SupportedLanguage);
    window.addEventListener('languageChange', handle);
    return () => window.removeEventListener('languageChange', handle);
  }, []);

  const toggleLanguage = () => {
    const nextLang: SupportedLanguage =
      lang === 'en' ? 'es' : lang === 'es' ? 'qu' : 'en';
    saveStoredLanguage(nextLang);
    setLang(nextLang);
  };

  const t = getTranslation(lang);
  const diagnosticoTabs = lang === 'qu' ? DIAGNOSTICO_TABS_QU : DIAGNOSTICO_TABS;
  const diagnosticoFaqs = lang === 'qu' ? DIAGNOSTICO_FAQS_QU : DIAGNOSTICO_FAQS;
  const rotacionTabs = lang === 'qu' ? ROTACION_TABS_QU : ROTACION_TABS;
  const rotacionFaqs = lang === 'qu' ? ROTACION_FAQS_QU : ROTACION_FAQS;

  // Automatic seamless transition across videos every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIdx((prev) => (prev + 1) % HERO_PLAYLIST.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            <a href="#como-funciona" className="hover:text-white transition">
              {lang === 'qu' ? "Imaynatam Llamk'an" : lang === 'es' ? 'Cómo Funciona' : 'How It Works'}
            </a>
            <a href="#diagnostico" className="hover:text-white transition">
              {lang === 'qu' ? '30m Allpa Qhaway' : lang === 'es' ? 'Diagnóstico 30m' : '30m Diagnostic'}
            </a>
            <a href="#quipu" className="hover:text-white transition">
              {lang === 'qu' ? 'Khipu Tarpuy' : lang === 'es' ? 'Plan Quipu' : 'Quipu Plan'}
            </a>
            <a href="#comunidad" className="hover:text-white transition">
              {lang === 'qu' ? 'Ayllukuna' : lang === 'es' ? 'Comunidad' : 'Community'}
            </a>
          </nav>

          {/* Center Brand Name */}
          <a href="#" className="flex items-center gap-2 group mx-auto lg:mx-0">
            <span className="brand-logo text-xl sm:text-2xl font-extrabold tracking-tight text-white lowercase">
              terraquipu
            </span>
          </a>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              title={
                lang === 'en'
                  ? 'Switch to Spanish (Castellano)'
                  : lang === 'es'
                  ? 'Tikray Runasimi simiman (Quechua)'
                  : 'Switch to Technical English'
              }
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {lang === 'en'
                  ? 'English (EN)'
                  : lang === 'es'
                  ? 'Castellano (ES)'
                  : 'Runasimi (QU)'}
              </span>
            </button>

            <a 
              href="https://github.com/TerraQuipu" 
              target="_blank" 
              rel="noreferrer" 
              className="hidden sm:inline-block text-[13px] font-semibold text-white/90 hover:text-white px-2 py-1 transition"
            >
              GitHub
            </a>

            {/* Outline Button to /app (TerraQuipu Mobile PWA) */}
            <Link 
              href="/app" 
              className="px-3.5 sm:px-4 py-1.5 rounded-full border-2 border-emerald-500 bg-transparent text-emerald-400 hover:bg-emerald-900 hover:border-emerald-600 hover:text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 active:scale-95 cursor-pointer group"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors" />
              <span>{t.nav.appLink}</span>
            </Link>

            {/* White Pill Button to /visor */}
            <Link 
              href="/visor" 
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-100 transition-all shadow-sm flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Satellite className="w-3.5 h-3.5 text-zinc-900" />
              <span>{t.nav.visorLink}</span>
            </Link>

            {/* Circular 3x3 Grid Dots Icon Button */}
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Menu"
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
            {/* Language Switcher in Mobile Drawer */}
            <button
              type="button"
              onClick={() => {
                toggleLanguage();
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-4 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === 'en'
                  ? 'English (EN) → Castellano (ES)'
                  : lang === 'es'
                  ? 'Castellano (ES) → Runasimi (QU)'
                  : 'Runasimi (QU) → English (EN)'}
              </span>
            </button>
            <Link 
              href="/app" 
              onClick={() => setMobileMenuOpen(false)} 
              className="border-2 border-emerald-500 bg-transparent text-emerald-400 hover:bg-emerald-900 hover:border-emerald-600 hover:text-white font-bold text-center py-2.5 rounded-full shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
              <span>{t.nav.appLink}</span>
            </Link>
            <Link 
              href="/visor" 
              onClick={() => setMobileMenuOpen(false)} 
              className="bg-white text-black font-semibold text-center py-2.5 rounded-full shadow-sm hover:bg-zinc-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Satellite className="w-4 h-4" />
              <span>{t.nav.visorLink}</span>
            </Link>
            <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-white/10">
              {lang === 'qu' ? "Imaynatam Llamk'an" : lang === 'es' ? 'Cómo Funciona' : 'How It Works'}
            </a>
            <a href="#diagnostico" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-white/10">
              {lang === 'qu' ? '30m Allpa Qhaway' : lang === 'es' ? 'Diagnóstico 30m' : '30m Diagnostic'}
            </a>
            <a href="#quipu" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-white/10">
              {lang === 'qu' ? 'Khipu Tarpuy' : lang === 'es' ? 'Plan Quipu' : 'Quipu Plan'}
            </a>
            <a href="#comunidad" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1.5 border-b border-white/10">
              {lang === 'qu' ? 'Ayllukuna' : lang === 'es' ? 'Comunidad' : 'Community'}
            </a>
            <a href="https://github.com/TerraQuipu" target="_blank" rel="noreferrer" className="hover:text-amber-400 py-1.5 flex items-center justify-between">
              <span>GitHub Repository</span>
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
              <span>{t.hero.badge}</span>
            </div>

            <h1 className="hero-headline text-4xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.08] tracking-tight">
              {t.hero.titleMain}, <br className="hidden sm:inline" />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500">
                {t.hero.titleHighlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Superpower Button Styles: Outline Emerald App Pill + Solid White Visor Pill */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link 
                href="/app" 
                className="px-7 py-3.5 rounded-full border-2 border-emerald-500 bg-transparent text-emerald-300 hover:bg-emerald-900 hover:border-emerald-400 hover:text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99] cursor-pointer group"
              >
                <Smartphone className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
                <span>{t.hero.openFarmerApp}</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
              </Link>
              <Link 
                href="/visor" 
                className="px-7 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-100 transition shadow-[0_0_25px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Satellite className="w-4 h-4 text-zinc-900" />
                <span>{t.hero.exploreVisor}</span>
              </Link>
              <a 
                href="#como-funciona" 
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md text-white border border-white/15 font-semibold text-sm transition text-center hover:scale-[1.01] active:scale-[0.99]"
              >
                {lang === 'qu' ? "Imaynatam llamk'an ↓" : lang === 'es' ? 'Cómo Funciona ↓' : 'How It Works ↓'}
              </a>
            </div>

          </div>

        </div>

      </section>

      {/* ================= 3. SCIENTIFIC TRUST STRIP ================= */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 mb-6 font-semibold">
            DEVELOPED WITH OPEN PUBLIC SCIENCE PROTOCOLS AND DATA
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="font-mono text-xs font-bold text-zinc-800">✦ NASA POWER API</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ NASA SMAP RADAR</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ INIA PERU</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ SENAMHI CLIMATE</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ ISRIC SOILGRIDS</div>
            <div className="font-mono text-xs font-bold text-zinc-800">✦ OPEN-METEO DEM</div>
          </div>
        </div>
      </section>

      {/* ================= 4. FEATURE CAROUSEL CARDS ("HOW IT WORKS" - 4 CARDS) ================= */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
              {lang === 'qu' ? 'TERRAQUIPUPA TUPUYNINKUNA' : lang === 'es' ? 'METODOLOGÍA TERRAQUIPU' : 'TERRAQUIPU METHODOLOGY'}
            </span>
            <h2 className="hero-headline text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 tracking-tight leading-tight">
              {lang === 'qu' ? 'Allpapa kawsayninqa hatun amachaqmi Hatun Paranpaq.' : lang === 'es' ? 'La salud del suelo es el escudo más poderoso frente a El Niño.' : 'Soil health is the most powerful shield against El Niño.'}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl mx-auto font-sans">
              {lang === 'qu' ? 'Tawa taqapi churasqa llamkay, hanaq pacha yachaywan allpata kawsarichinapaq.' : lang === 'es' ? 'Un sistema integral de cuatro fases que transforma telemetría espacial en decisiones agrícolas que salvan cosechas.' : 'A four-phase operational workflow transforming satellite telemetry into ground-truth agricultural decisions that protect harvests.'}
            </p>
          </div>

          {/* 4-Card Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* ================= Card 1: Continuous Orbital Scanning ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Image: NASA Space Orbit */}
                <img
                  src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop"
                  alt="Continuous Orbital Scanning"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Gradient vignette for seamless telemetry contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Number Badge */}
                <div className="relative z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  1
                </div>

                {/* Floating Telemetry */}
                <div className="relative z-10 w-full text-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-200 uppercase">
                      NASA SMAP Radar
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">
                      18.4% VWC
                    </span>
                  </div>
                  <div className="pt-1.5 border-t border-white/20 flex justify-between items-baseline font-mono text-[11px] text-zinc-300">
                    <span>Root-Zone Moisture</span>
                    <span className="text-emerald-400 font-medium">Optimal</span>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  {t.pillars.p1Title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {t.pillars.p1Desc}
                </p>
              </div>
            </div>

            {/* ================= Card 2: 30m Edaphic Profile ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Image: Andean agricultural terraces */}
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop"
                  alt="30m Edaphic Profile Terraces"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Number Badge */}
                <div className="relative z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  2
                </div>

                {/* Floating Telemetry */}
                <div className="relative z-10 w-full text-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-200 uppercase">
                      EDAPHIC SAMPLE
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      30m SRTM
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-white/20 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Soil pH</span>
                      <span className="font-bold text-white">6.4 <span className="text-[10px] text-emerald-400 font-normal">(Optimal)</span></span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Organic Matter</span>
                      <span className="font-bold text-emerald-400">3.8%</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>Valley Slope</span>
                      <span className="font-bold text-white">18° Degrees</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  {lang === 'qu' ? '30m Allpa Tupuy' : lang === 'es' ? 'Perfil Edáfico 30m' : '30m Edaphic Profile'}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {lang === 'qu'
                    ? 'SoilGrids v2 nisqawan Copernicus DEM nisqawan allpa turpukunata, urqukunata qhawarispa allin chakichata allichanchik.'
                    : lang === 'es'
                    ? 'Modelado edáfico 30m con SoilGrids e inclinación topográfica para mapear retención hídrica en laderas andinas.'
                    : 'High-resolution 30m edaphic modeling integrating SoilGrids v2 and SRTM topography to map root water retention across Andean slopes.'}
                </p>
              </div>
            </div>

            {/* ================= Card 3: The Rotation Quipu ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Image: Soil and seeds in farmer hands */}
                <img
                  src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=800&auto=format&fit=crop"
                  alt="Rotation Quipu Seeds"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Number Badge */}
                <div className="relative z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  3
                </div>

                {/* Floating Telemetry */}
                <div className="relative z-10 w-full text-white space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase">
                      QUIPU SEQUENCE
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      INIA 2026
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-white/20 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>1. Tarwi (Legume)</span>
                      <span className="text-emerald-400 font-bold">+95 kg N/ha</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>2. Real Quinoa</span>
                      <span className="text-amber-300 font-bold">Cycle disruption</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>3. Native Potato</span>
                      <span className="text-blue-300 font-bold">High resilience</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  {t.pillars.p2Title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {t.pillars.p2Desc}
                </p>
              </div>
            </div>

            {/* ================= Card 4: Regeneration & Harvest ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Image: Golden Harvest Fields */}
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop"
                  alt="Harvest and Soil Regeneration"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Number Badge */}
                <div className="relative z-10 w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs font-bold font-mono shadow-sm">
                  4
                </div>

                {/* Floating Telemetry */}
                <div className="relative z-10 w-full text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-200 uppercase">
                      HARVESTED CAMPAIGN
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Success
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-white/20 grid grid-cols-2 gap-2 text-center font-mono">
                    <div>
                      <div className="text-2xl font-bold text-emerald-400 tracking-tight">+34%</div>
                      <div className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">{lang === 'qu' ? 'Aymoray' : lang === 'es' ? 'Rendimiento' : 'Yield Potential'}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-300 tracking-tight">-75%</div>
                      <div className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">{lang === 'qu' ? 'Kurukuna' : lang === 'es' ? 'Plaga Gorgojo' : 'Andean Weevil'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  {t.pillars.p3Title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {t.pillars.p3Desc}
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 5. LIFESTYLE TABLET SHOWCASE ("IN-SITU DIAGNOSTIC" - FULL SCREEN) ================= */}
      <section id="diagnostico" className="relative w-full min-h-[720px] lg:min-h-[840px] bg-white overflow-hidden flex items-center rounded-[48px] sm:rounded-[64px] lg:rounded-[80px]">
        
        {/* Full Section Background Image with rounded corners on image only */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[48px] sm:rounded-[64px] lg:rounded-[80px]">
          <img 
            src={`${BASE_PATH}/images/agronomist_white_bg.jpg`} 
            alt="In-Situ Field Diagnostic with Tablet" 
            className="w-full h-full object-cover object-[center_35%] lg:object-[center_40%] select-none rounded-[48px] sm:rounded-[64px] lg:rounded-[80px]"
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">
            
            {/* Left Block: Heading, Subtitle & Floating Glass FAQs */}
            <div className="w-full lg:max-w-[360px] xl:max-w-[380px] space-y-7 shrink-0">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
                  {lang === 'qu' ? 'CHAJRA ALLPA QHAWAY' : 'IN-SITU PARCEL DIAGNOSTIC'}
                </span>
                <h2 className="hero-headline text-3xl sm:text-4xl lg:text-[40px] font-bold text-zinc-950 leading-[1.12] tracking-tight transition-all duration-300">
                  {diagnosticoTabs[activeDiagnosticoTab].title}
                </h2>
                <p className="text-sm text-zinc-600 font-sans leading-relaxed transition-all duration-300 max-w-[340px]">
                  {diagnosticoTabs[activeDiagnosticoTab].subtitle}
                </p>
              </div>

              {/* Floating Frosted Glass FAQ Accordions */}
              <div className="space-y-2.5 pt-2 w-full max-w-[360px]">
                {diagnosticoFaqs.map((faq, idx) => (
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

            {/* Spacer for Center Space */}
            <div className="hidden lg:block lg:flex-1 pointer-events-none" />

            {/* Right Block: Vertical Tab Navigation */}
            <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-3 lg:gap-5 text-xs font-sans overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0 self-center z-20 mr-0 lg:mr-4 xl:mr-8 -translate-y-16 lg:-translate-y-28">
              {diagnosticoTabs.map((tab, idx) => (
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

      {/* ================= 6. COMMUNITY PLAN TRANSPARENT COMPARISON CARD ================= */}
      <section id="comunidad" className="py-24 bg-[#090A0D] text-white">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              {lang === 'qu' ? "LLAPAN AYLLUKUNAPAQ LLAMK'AY" : lang === 'es' ? 'ACCESO COMUNITARIO ABIERTO' : 'OPEN COMMUNITY ACCESS'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-light text-white">
              {lang === 'qu' ? "Terraquipu llamk'aypiqa tukuy imapunim kachkan." : lang === 'es' ? 'Todo incluido en el programa Terraquipu.' : 'Everything included in the Terraquipu program.'}
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto">
              {lang === 'qu' 
                ? 'Hanaq pacha yachay ayllukunapaq, chakra kamayoqkunapaq, mana qolqellapaq mana sasachakuspa.' 
                : lang === 'es'
                ? 'Tecnología espacial abierta para pequeños agricultores, agrónomos e investigadores sin costos de licencia ni barreras comerciales.'
                : 'Open space technology for smallholders, agronomists, and researchers with zero license fees or commercial barriers.'}
            </p>
          </div>

          {/* Community Membership Content */}
          <div className="space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-serif text-white">
                  {lang === 'qu' ? 'Ayllu Chajra Huñunakuy' : lang === 'es' ? 'Membresía Abierta de Microcuenca' : 'Open Micro-Watershed Membership'}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  {lang === 'qu' ? "Ayllukunapaq, yachaqkunapaq, llamk'aqkunapaqpas" : lang === 'es' ? 'Para comunidades agrícolas, investigadores y desarrolladores' : 'For farming communities, researchers, and developers'}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs sm:text-sm text-emerald-400 font-mono font-medium">
                  {lang === 'qu' ? '100% Llapa Runapaq (MIT Licencia)' : lang === 'es' ? '100% Código Abierto (Licencia MIT)' : '100% Open Source (MIT License)'}
                </span>
              </div>
            </div>

            {/* Features Checklist (8 items) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lang === 'qu' ? "Sapa p'unchaw satélite qhaway (NASA POWER & SMAP)" : lang === 'es' ? 'Monitoreo satelital continuo (NASA POWER & SMAP)' : 'Continuous satellite monitoring (NASA POWER & SMAP)'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lang === 'qu' ? 'Hatun Para sasachakuy ñawpaq willakuy' : lang === 'es' ? 'Alertas tempranas de estrés por anomalías de El Niño' : 'Early stress alerts for El Niño anomalies'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lang === 'qu' ? 'Kimsa wata kawsay muyuy tarpuy (Khipu)' : lang === 'es' ? 'Sucesión multianual de 3 campañas (Quipu)' : '3-campaign multi-year succession (Quipu)'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lang === 'qu' ? 'INIA Peru kamachiywan allichasqa' : lang === 'es' ? 'Justificación técnica citada del INIA Perú' : 'Technical justification cited from INIA Peru'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lang === 'qu' ? 'Llapa tarpuykunapa yachaynin (crop_matrix.json)' : lang === 'es' ? 'Matriz agronómica abierta de cultivos (crop_matrix.json)' : 'Open agronomic crop matrix (crop_matrix.json)'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lang === 'qu' ? 'Utqaylla REST API FastAPI nisqawan' : lang === 'es' ? 'API REST de alto rendimiento construida con FastAPI' : 'High-performance REST API built with FastAPI'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lang === 'qu' ? "Arduino chajra tupuchiq llamk'ana" : lang === 'es' ? 'Emulador de hardware de telemetría de campo Arduino' : 'Arduino field telemetry hardware emulator'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-300">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{lang === 'qu' ? 'Leaflet GIS visor qhawaq mana qolqellapaq' : lang === 'es' ? 'Visor GIS interactivo Leaflet con costo cero de servidor' : 'Interactive Leaflet GIS visor with zero server cost'}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-400 font-mono">
                {lang === 'qu' ? 'Qosqo, Valle Sagrado, hatun mayukunapaq 2026-2027.' : lang === 'es' ? 'Desplegado para Cusco, Valle Sagrado y cuencas en expansión 2026-2027.' : 'Deployed for Cusco, Sacred Valley, and expanding watersheds 2026-2027.'}
              </div>
              <a 
                href="#quipu" 
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-zinc-200 transition shadow-lg text-center"
              >
                {lang === 'qu' ? 'Khipu Tarpuyta Qhaway ↓' : lang === 'es' ? 'Explorar Plan de Rotación Quipu ↓' : 'Explore Quipu Rotation Plan ↓'}
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 7. QUIPU ROTATION & ACTION PLAN SHOWCASE (VIDEO LOOP) ================= */}
      <section id="quipu" className="relative w-full min-h-[720px] lg:min-h-[840px] bg-[#f8f7f4] overflow-hidden flex items-center rounded-[48px] sm:rounded-[64px] lg:rounded-[80px]">
        
        {/* Full Section Background Video Loop */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-[48px] sm:rounded-[64px] lg:rounded-[80px]">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={`${BASE_PATH}/videos/trigo_viento_poster.jpg`}
            className="w-full h-full object-cover object-center select-none rounded-[48px] sm:rounded-[64px] lg:rounded-[80px]"
          >
            <source src={`${BASE_PATH}/videos/trigo_viento.mp4`} type="video/mp4" />
            <source src="https://assets.mixkit.co/videos/8582/8582-720.mp4" type="video/mp4" />
          </video>
          
          {/* Editorial Scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent w-full lg:w-[58%] pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-full lg:w-[35%] bg-gradient-to-l from-white/70 via-white/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/30 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-12 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">
            
            {/* Left Block: Heading, Subtitle & Floating Glass FAQs */}
            <div className="w-full lg:max-w-[380px] xl:max-w-[400px] space-y-7 shrink-0">
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  {lang === 'qu' ? 'KHIPU TARPUY ALLICHAY' : lang === 'es' ? 'PLAN DE ACCIÓN AGROECOLÓGICO' : 'AGROECOLOGICAL ACTION PLAN'}
                </span>
                <h2 className="hero-headline text-3xl sm:text-4xl lg:text-[40px] font-bold text-zinc-950 leading-[1.12] tracking-tight transition-all duration-300">
                  {rotacionTabs[activeRotacionTab].title}
                </h2>
                <p className="text-sm text-zinc-700 font-sans leading-relaxed transition-all duration-300 max-w-[360px]">
                  {rotacionTabs[activeRotacionTab].subtitle}
                </p>
              </div>

              {/* Floating Frosted Glass FAQ Accordions */}
              <div className="space-y-2.5 pt-2 w-full max-w-[360px]">
                {rotacionFaqs.map((faq, idx) => (
                  <div 
                    key={idx} 
                    className="rounded-2xl bg-zinc-900/95 hover:bg-zinc-900 backdrop-blur-xl border border-white/10 p-3.5 text-white transition-all duration-300 shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedRotacionFaq(expandedRotacionFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-3 text-xs font-medium cursor-pointer"
                    >
                      <span className="font-sans text-zinc-100">{faq.q}</span>
                      <span className={`w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs text-zinc-300 shrink-0 font-mono font-bold transition-transform duration-300 ease-in-out ${
                        expandedRotacionFaq === idx ? 'rotate-45 bg-amber-500/20 text-amber-300 border-amber-500/30' : 'rotate-0'
                      }`}>
                        +
                      </span>
                    </button>
                    
                    {/* Animated Expand / Collapse grid container */}
                    <div 
                      className={`grid transition-all duration-300 ease-in-out ${
                        expandedRotacionFaq === idx 
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

            {/* Spacer for Center Space */}
            <div className="hidden lg:block lg:flex-1 pointer-events-none" />

            {/* Right Block: Vertical Tab Navigation */}
            <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-3 lg:gap-4 text-xs font-sans overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 shrink-0 self-center z-20 bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-black/5 shadow-md">
              {rotacionTabs.map((tab, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveRotacionTab(idx)}
                  className={`flex items-center justify-between gap-5 text-left transition-all py-1.5 cursor-pointer group ${
                    activeRotacionTab === idx
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

      {/* ================= 8. SCIENTIFIC ADVISORY & VALIDATION ================= */}
      <section id="respaldo" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-700 font-semibold">
              OFFICIAL SCIENTIFIC VALIDATION
            </span>
            <h2 className="hero-headline text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-950 tracking-tight leading-tight">
              Guided by agronomists and climate scientists.
            </h2>
            <p className="text-sm text-zinc-600 font-sans leading-relaxed max-w-xl mx-auto">
              We validate every agronomic parameter against official Peruvian technical literature and Earth observation telemetry models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            
            {/* ================= Card 1: INIA Peru ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Video */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={`${BASE_PATH}/videos/cultivos_poster.jpg`}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                >
                  <source src={`${BASE_PATH}/videos/cultivos.mp4`} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Institution Label */}
                <div className="relative z-10 pt-1 px-1">
                  <span className="hero-headline text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                    INIA Peru
                  </span>
                </div>

                {/* Floating Telemetry */}
                <div className="relative z-10 w-full text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-200 uppercase">
                      TECHNICAL MANUAL NO. 14
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                      Official INIA
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-white/20 grid grid-cols-2 gap-2 text-center font-mono">
                    <div>
                      <div className="text-2xl font-bold text-emerald-400 tracking-tight">+100 kg</div>
                      <div className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">N / ha fixed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-300 tracking-tight">Tarwi</div>
                      <div className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">Lupinus m.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  Technical Manual No. 14
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Official agronomic management of Tarwi (<em>Lupinus mutabilis</em>) and biological nitrogen fixation up to 100 kg N/ha in high Andean soils.
                </p>
              </div>
            </div>

            {/* ================= Card 2: SENAMHI ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Video */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={`${BASE_PATH}/videos/andes_poster.jpg`}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                >
                  <source src={`${BASE_PATH}/videos/andes.mp4`} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Institution Label */}
                <div className="relative z-10 pt-1 px-1">
                  <span className="hero-headline text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                    SENAMHI
                  </span>
                </div>

                {/* Floating Telemetry */}
                <div className="relative z-10 w-full text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-200 uppercase">
                      AGROCLIMATIC BULLETINS
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                      Validated SENAMHI
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-white/20 grid grid-cols-2 gap-2 text-center font-mono">
                    <div>
                      <div className="text-2xl font-bold text-cyan-400 tracking-tight">-4°C</div>
                      <div className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">Frost Threshold</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-400 tracking-tight">Southern Andes</div>
                      <div className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">Cusco & Puno</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  Agroclimatic Bulletins
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Thermal threshold calibration, agronomic frosts, and seasonal rainfall deficits across Southern Andean valleys and micro-watersheds.
                </p>
              </div>
            </div>

            {/* ================= Card 3: NASA Space Apps ================= */}
            <div className="flex flex-col group">
              {/* Visual Container */}
              <div className="relative rounded-[26px] overflow-hidden aspect-[4/5] bg-zinc-950 border border-zinc-200/80 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-3.5">
                {/* Background Video */}
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={`${BASE_PATH}/videos/nasa_orbit_poster.jpg`}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                >
                  <source src={`${BASE_PATH}/videos/nasa_orbit.mp4`} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />

                {/* Top Institution Label */}
                <div className="relative z-10 pt-1 px-1">
                  <span className="hero-headline text-lg sm:text-xl font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
                    NASA Space Apps
                  </span>
                </div>

                {/* Floating Telemetry */}
                <div className="relative z-10 w-full text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold tracking-wider text-zinc-200 uppercase">
                      GLOBAL CHALLENGE 2026
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                      NASA Award
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-white/20 grid grid-cols-2 gap-2 text-center font-mono">
                    <div>
                      <div className="text-2xl font-bold text-amber-400 tracking-tight">SMAP</div>
                      <div className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">Radar L-Band</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-400 tracking-tight">POWER</div>
                      <div className="text-[10px] text-zinc-300 uppercase tracking-wider mt-0.5">Solar & Rain</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Information Below Card */}
              <div className="pt-4 space-y-1.5 font-sans">
                <h3 className="hero-headline text-lg font-bold text-zinc-950 tracking-tight">
                  Global Challenge 2026
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Software solution engineered to democratize Earth observation intelligence and space telemetry for smallholder farming communities.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 9. BOTTOM GOLDEN HALO BANNER ================= */}
      <section className="relative bg-[#090A0D] text-white py-28 px-6 overflow-hidden text-center">
        
        {/* Massive Centered Golden Solar Halo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[750px] aspect-square pointer-events-none opacity-80">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 blur-[100px] opacity-45"></div>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-semibold">
            {lang === 'qu' ? 'TERRAQUIPU • ALLPAPA KAWSAYNIN' : lang === 'es' ? 'TERRAQUIPU • EL PODER DEL SUELO' : 'TERRAQUIPU • THE POWER OF SOIL'}
          </span>

          <h2 className="text-4xl sm:text-6xl font-serif font-light text-white leading-tight">
            {lang === 'qu' ? 'Allpan Andeskunapi aswan hatun kallpa.' : lang === 'es' ? 'El suelo es la mayor fuerza de los Andes.' : 'Soil is the greatest force in the Andes.'}
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 max-w-lg mx-auto font-normal">
            {lang === 'qu'
              ? 'Ayllu chajrakamayoc, yachaqkunawan huñunakuy allpa mikuyta amachanapaq.'
              : lang === 'es'
              ? 'Únete a la red global de agricultores, agrónomos e investigadores que protegen la soberanía alimentaria.'
              : 'Join the global network of smallholder farmers, agronomists, and developers protecting food sovereignty against climate change.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/app" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-emerald-500 bg-transparent text-emerald-300 hover:bg-emerald-900 hover:border-emerald-400 hover:text-white font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-2xl cursor-pointer group"
            >
              <Smartphone className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
              <span>{t.nav.appLink}</span>
            </Link>
            <Link 
              href="/visor" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-zinc-200 transition shadow-2xl flex items-center justify-center gap-2"
            >
              <Satellite className="w-4 h-4 text-zinc-900" />
              <span>{t.nav.visorLink}</span>
            </Link>
            <a 
              href="https://github.com/TerraQuipu" 
              target="_blank" 
              rel="noreferrer" 
              className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/20 bg-white/10 text-white font-medium text-xs uppercase tracking-wider hover:bg-white/20 transition"
            >
              GitHub Repository &rarr;
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
              {lang === 'qu'
                ? 'Allpa kawsay yachay Andeskunapi. NASA open datawan kallpachasqa NASA Space Apps Challenge 2026 nisqapaq.'
                : lang === 'es'
                ? 'Sistema de inteligencia territorial y regeneración edáfica en los Andes. Desarrollado con datos abiertos de la NASA para el NASA Space Apps Challenge 2026.'
                : 'Territorial intelligence and edaphic regeneration system in the Andes. Powered by NASA open data for the NASA Space Apps Challenge 2026.'}
            </p>
            <div className="text-[11px] font-mono text-zinc-400">
              MIT License • Open Source Community
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-zinc-900">
              {lang === 'qu' ? "Llamk'ana" : lang === 'es' ? 'Plataforma' : 'Platform'}
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/app" className="hover:text-emerald-950 transition font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.nav.appLink} (/app)</span>
                </Link>
              </li>
              <li>
                <Link href="/visor" className="hover:text-black transition flex items-center gap-1.5 text-zinc-600">
                  <Satellite className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{t.nav.visorLink} (/visor)</span>
                </Link>
              </li>
              <li><a href="#como-funciona" className="hover:text-black transition">{lang === 'qu' ? "Imaynatam Llamk'an" : lang === 'es' ? 'Cómo Funciona' : 'How It Works'}</a></li>
              <li><a href="#diagnostico" className="hover:text-black transition">{lang === 'qu' ? '30m Allpa Qhaway' : lang === 'es' ? 'Diagnóstico 30m' : '30m Diagnostic'}</a></li>
              <li><a href="#quipu" className="hover:text-black transition">{lang === 'qu' ? 'Khipu Tarpuy' : lang === 'es' ? 'Plan Quipu' : 'Quipu Rotation Plan'}</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-zinc-900">
              {lang === 'qu' ? 'Waqaychanakuna' : lang === 'es' ? 'Repositorios' : 'Repositories'}
            </div>
            <ul className="space-y-1.5 text-xs font-mono">
              <li><a href="https://github.com/TerraQuipu/terraquipu-web" target="_blank" className="hover:text-black transition">terraquipu-web</a></li>
              <li><a href="https://github.com/TerraQuipu/terraquipu-api" target="_blank" className="hover:text-black transition">terraquipu-api</a></li>
              <li><a href="https://github.com/TerraQuipu/terraquipu-data" target="_blank" className="hover:text-black transition">terraquipu-data</a></li>
              <li><a href="https://github.com/TerraQuipu/terraquipu-iot" target="_blank" className="hover:text-black transition">terraquipu-iot</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-wider font-bold text-zinc-900">
              {lang === 'qu' ? 'Llapa Runapa Yachaynin' : lang === 'es' ? 'Ciencia Abierta' : 'Open Science'}
            </div>
            <ul className="space-y-1.5 text-xs">
              <li><a href="https://power.larc.nasa.gov/" target="_blank" className="hover:text-black transition">NASA POWER</a></li>
              <li><a href="https://smap.jpl.nasa.gov/" target="_blank" className="hover:text-black transition">NASA SMAP</a></li>
              <li><a href="https://www.gob.pe/inia" target="_blank" className="hover:text-black transition">INIA Peru</a></li>
              <li><a href="https://www.senamhi.gob.pe/" target="_blank" className="hover:text-black transition">SENAMHI</a></li>
            </ul>
          </div>

        </div>

        {/* ================= GEOTEAM CREDITS STRIP ================= */}
        <div className="max-w-7xl mx-auto px-6 pt-10 mt-10 border-t border-zinc-200/80">
          <div className="rounded-2xl bg-zinc-50 border border-zinc-200/70 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-mono text-xs uppercase tracking-wider font-bold text-zinc-900">
                  GeoTeam • Development Team
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300/60">
                  NASA Space Apps Challenge 2026
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Technological innovation, satellite remote sensing, and edaphic regeneration for Andean farming communities.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                'Alina Fernanda Castañeda Ramos',
                'Rafael Alfonso Gil Velarde',
                'Luciana Isabel Carbajo Chipana',
                'Angel Lopez',
                'Reiser Soplin Ramos',
                'Hector Ramos Zurita',
              ].map((member) => (
                <span
                  key={member}
                  className="px-2.5 py-1 rounded-full bg-white border border-zinc-200/80 text-zinc-700 text-[11px] font-medium shadow-2xs hover:border-emerald-400 hover:text-emerald-950 transition cursor-default"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>© 2026 Terraquipu Project. Engineered with ancestral wisdom and satellite telemetry.</div>
          <div>Cusco • Sacred Valley • Peru</div>
        </div>
      </footer>

    </div>
  );
}
