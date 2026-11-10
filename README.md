# Terraquipu Web 🌾💻

> **Frontend GIS y Dashboard de Apoyo a la Toma de Decisiones en Rotación de Cultivos**  
> *Parte del ecosistema [Terraquipu](https://github.com/TerraQuipu)*

---

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
