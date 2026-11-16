# Terraquipu Web 🌾💻

> **Frontend GIS y Dashboard de Apoyo a la Toma de Decisiones en Rotación de Cultivos**  
> *Parte del ecosistema [Terraquipu](https://github.com/TerraQuipu)*

[![Live Demo](https://img.shields.io/badge/Demo%20en%20Vivo-GitHub%20Pages-22c55e?style=for-the-badge&logo=github)](https://terraquipu.github.io/terraquipu-web/)
[![Status](https://img.shields.io/badge/Producci%C3%B3n-Online%20(200%20OK)-0284c7?style=for-the-badge)](https://terraquipu.github.io/terraquipu-web/)

👉 **Acceso directo a producción:**
* **Landing Page de Captación:** [https://terraquipu.github.io/terraquipu-web/](https://terraquipu.github.io/terraquipu-web/)
* **Visor GIS Satelital en Vivo:** [https://terraquipu.github.io/terraquipu-web/visor/](https://terraquipu.github.io/terraquipu-web/visor/)

---

## 🛰️ Inventario Oficial de Datos NASA y Agencias Socias (100% Verificado)

Para garantizar la máxima trazabilidad técnica ante el jurado del **NASA Space Apps Challenge 2026**, a continuación se detalla la integración directa de los 13 recursos declarados:

### Misiones y Datasets de la NASA (6 Recursos)

| # | Recurso NASA Declarado | URL Oficial | Implementación en Código (`terraquipu-web`) | Rol en el Sistema |
|:---:|---|---|---|---|
| 1 | **NASA POWER Agroclimatology API** | [power.larc.nasa.gov](https://power.larc.nasa.gov/) | `src/lib/agrometeoClient.ts`<br/>`src/components/admin/PipelinesMonitor.tsx` | Series agroclimáticas diarias: temperatura máxima/mínima, radiación solar UV y evapotranspiración. |
| 2 | **NASA SMAP Soil Moisture Active Passive** | [smap.jpl.nasa.gov](https://smap.jpl.nasa.gov/) | `src/lib/geoUtils.ts`<br/>`src/components/viewer/DecisionPanel.tsx` | Humedad volumétrica superficial (Banda L radiométrica) asimilada para detectar estrés hídrico radicular. |
| 3 | **NASA FIRMS Fire Information for Resource Management** | [firms.modaps.eosdis.nasa.gov](https://firms.modaps.eosdis.nasa.gov/) | `tests/nasaDataLineage.test.ts`<br/>`INFORME_TECNICO_Y_DISENO_TERRAQUIPU.md` | Detección satelital de anomalías térmicas y activación de la regla crítica: **Prohibido quemar rastrojo**. |
| 4 | **NASA GPM Global Precipitation Measurement** | [gpm.nasa.gov](https://gpm.nasa.gov/) | `src/components/viewer/DecisionPanel.tsx`<br/>`src/components/WeatherForecastCard.tsx` | Telemetría radar de precipitación acumulada (IMERG) y cálculo de déficit frente al promedio histórico. |
| 5 | **NASA SRTM Shuttle Radar Topography Mission** | [earthdata.nasa.gov/learn/missions/srtm](https://www.earthdata.nasa.gov/learn/missions/srtm) | `src/lib/geoUtils.ts`<br/>`src/app/page.tsx` | Modelo Digital de Elevación (DEM 30m) para cálculo de pendientes con diferencias finitas 2D. |
| 6 | **NASA USGS Harmonized Landsat Sentinel-2 (HLS)** | [hls.gsfc.nasa.gov](https://hls.gsfc.nasa.gov/) | `src/components/viewer/MapViewer.tsx`<br/>`src/lib/planExport.ts` | Capa cartográfica de vigor vegetal (NDVI) y estrés foliar (NDWI) a 30 metros de resolución. |

### Agencias Socias y Recursos Externos (7 Recursos)

| # | Recurso Socio Declarado | URL Oficial | Implementación en Código (`terraquipu-web`) | Rol en el Sistema |
|:---:|---|---|---|---|
| 1 | **ESA Copernicus Sentinel-2 MultiSpectral** | [sentinels.copernicus.eu](https://sentinels.copernicus.eu/web/sentinel/missions/sentinel-2) | `src/components/viewer/MapViewer.tsx`<br/>`src/lib/geoUtils.ts` | Bandas ópticas multiespectrales para vigor vegetativo y modelo de elevación digital Copernicus 30m. |
| 2 | **SENAMHI Servicio Nacional de Meteorología e Hidrología** | [senamhi.gob.pe](https://www.senamhi.gob.pe/) | `src/components/viewer/DecisionPanel.tsx`<br/>`src/app/page.tsx` | Pronósticos estacionales de El Niño, avisos meteorológicos vigentes y umbrales de heladas para Cusco. |
| 3 | **INIA Instituto Nacional de Innovación Agraria** | [inia.gob.pe](https://www.inia.gob.pe/) | `src/components/viewer/DecisionPanel.tsx`<br/>`src/lib/planExport.ts` | Coeficientes de extracción de nutrientes de papa y fijación biológica de nitrógeno en Tarwi (+95 kg N/ha). |
| 4 | **MIDAGRI SISAP Precios de Fertilizantes** | [sisap.midagri.gob.pe](https://sisap.midagri.gob.pe/) | `tests/agronomicPricing.test.ts`<br/>`DOCUMENTACION_CALCULO_AHORRO.md` | Precio mayorista y de ferias locales del saco de urea de 50 kg en Cusco (S/ 88 - S/ 92) para el simulador. |
| 5 | **ENFEN Comisión Multisectorial de El Niño** | [dhn.mil.pe/enfen](https://www.dhn.mil.pe/enfen/) | `src/components/viewer/DecisionPanel.tsx`<br/>`src/components/admin/AdminCopilotModal.tsx` | Estado de alerta ENOS y anomalías de lluvia (-24% de precipitación y 42% de desecación de suelo). |
| 6 | **OpenStreetMap & Leaflet Framework** | [openstreetmap.org](https://www.openstreetmap.org/) | `package.json`<br/>`src/components/viewer/MapViewer.tsx` | Cartografía base abierta interactiva y motor de trazado de parcelas poligonales en WGS84. |
| 7 | **Supabase Open Source Spatial Database** | [supabase.com](https://supabase.com/) | `src/lib/supabaseClient.ts`<br/>`src/app/visor/page.tsx` | Almacén de base de datos relacional y geoespacial (PostGIS) para telemetría diaria y reportes campesinos. |

---

## 📌 Arquitectura del Frontend y Componentes

El frontend de `terraquipu-web` se compone de dos experiencias complementarias conectadas de forma bidireccional (desarrolladas en Next.js 14 App Router):

1. **Landing Page de Captación de Leads (`/`):**
   * Inspirada en la estética B2B/DevTech de **Antimetal** (fondo dark profundo `#050507`, bordes hairline translúcidos, resplandores radiales esmeralda/ámbar).
   * **Hero Visual Artifact:** Consola interactiva estilo macOS con simulación en tiempo real de telemetría de Chinchero y línea temporal del Quipu.
   * **Bento Grid:** Cuatro tarjetas con downscaling satelital, motor determinista INIA, resiliencia hídrica y código abierto.
   * **Calculadora Agroecológica Interactiva:** Slider dinámico para calcular ahorro en urea/dólares, nitrógeno biológico fijado y agua conservada.
   * **Formulario de Captura Multi-Perfil:** Segmentación inmediata para Comunidades Campesinas, Desarrolladores Open Source, Científicos de Datos y Donantes ESG.
2. **Visor GIS Satelital y Rotación Multianual (`/visor` o `/app`):**
   * Mapa interactivo fullscreen (Esri World Imagery + CartoDB Light) con polígonos de sectores andinos (Chinchero, Moray, Urubamba, Písac).
   * Sidebar modular con pestañas de *Diagnóstico*, *Quipu Rotación* y *Curvas de Fertilidad*.
   * Tarjeta flotante de Justificación Científica (INIA/SENAMHI) con locución por voz (Web Speech API).

## 📌 Propósito del Repositorio

`terraquipu-web` es la interfaz de usuario interactiva diseñada para técnicos agrícolas, comunidades campesinas andinas y jurados evaluadores. Su objetivo es convertir datos geoespaciales complejos y cálculos agronómicos en una experiencia visual intuitiva que permite planificar rotaciones de cultivos en menos de 3 clics.

---

## 👥 Equipo y Roles Asignados

| Integrante | Rol | Responsabilidad en el Sprint de 48h |
| :--- | :--- | :--- |
| **Sistemas 2** (`@alinafernanda77-ux`) | **Frontend GIS & UX Lead** | Diseño de interfaz en Figma/Next.js, integración de mapas 2D/3D (Mapbox/Leaflet), componentes de visualización de parcelas y visualizador de rotación multianual. |
| **Sistemas 3** | **Integración de RAG & Asistente UI** | Componente de chat/asistente que renderiza las citas técnicas del INIA/SENAMHI y comparador de escenarios climáticos ("Normal vs El Niño"). |

---

## 🛠️ Stack Tecnológico

* **Framework:** Next.js 14+ (App Router) o React 18+ (TypeScript).
* **Estilos:** Tailwind CSS + Radix UI / Shadcn UI para componentes accesibles.
* **Mapas & Geoespacial:** Mapbox GL JS / Leaflet / React-Leaflet con soporte para capas WMS y GeoJSON.
* **Gráficos & Métricas:** Recharts / Tremor para el balance hídrico, curvas de nitrógeno y salud del suelo.
* **Iconografía:** Lucide React.

---

## 🔌 Contratos JSON Consumidos

Este repositorio consume dos contratos principales expuestos por [`terraquipu-api`](https://github.com/TerraQuipu/terraquipu-api):

### 1. Diagnóstico Territorial (`GET /api/v1/diagnose?lat={lat}&lon={lon}`)
Devuelve la elevación, piso ecológico, anomalía histórica de lluvia (% El Niño) y perfil edáfico (pH, SOC, N).
```json
{
  "plot_id": "parcela-chinchero-sector-b",
  "location": { "latitude": -13.5321, "longitude": -71.9675, "district": "Chinchero", "elevation_masl": 3410 },
  "climate_context": { "rainfall_anomaly_percent": -29.2, "frost_risk_level": "medium" },
  "soil_health_profile": { "ph": 6.1, "soil_health_index_100": 62 }
}
```

### 2. Estrategias de Rotación (`POST /api/v1/recommend`)
Devuelve la secuencia óptima multianual de cultivos y la explicación fundamentada del modelo RAG.
```json
{
  "recommended_strategies": [
    {
      "rank": 1,
      "strategy_title": "Regeneración Rápida con Leguminosa Andina",
      "suitability_score_100": 91,
      "rotation_sequence": [
        { "campaign_index": 1, "crop_id": "tarwi", "projected_nitrogen_gain_kg_ha": 95 },
        { "campaign_index": 2, "crop_id": "quinua", "projected_nitrogen_gain_kg_ha": -25 },
        { "campaign_index": 3, "crop_id": "papa_nativa", "projected_nitrogen_gain_kg_ha": -70 }
      ],
      "rag_explanation": {
        "summary": "La rotación inmediata hacia Tarwi aprovecha su bajo consumo de agua...",
        "citations": [{ "institution": "INIA Perú", "document": "Manual Técnico N° 14" }]
      }
    }
  ]
}
```

---

## 🚀 Flujo de Usuario en el MVP (Demo de 3 Clics)

1. **Clic 1: Exploración Territorial:** El usuario localiza su parcela en el mapa (ej. Chinchero, Cusco) y visualiza la capa de anomalía de sequía El Niño (NASA POWER / GPM).
2. **Clic 2: Diagnóstico Edáfico:** Al presionar sobre la parcela, se despliega el resumen de salud del suelo calibrado con el sensor IoT local.
3. **Clic 3: Simulación de Rotación:** El usuario selecciona su último cultivo (ej. Papa nativa) y el sistema despliega la línea de tiempo multianual proyectando la recuperación de nitrógeno y el ahorro de agua.

---

## 💻 Puesta en Marcha Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/TerraQuipu/terraquipu-web.git
cd terraquipu-web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_MAPBOX_TOKEN=tu_mapbox_token_aqui

# 4. Iniciar servidor de desarrollo
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

