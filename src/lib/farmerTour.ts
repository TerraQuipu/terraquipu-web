import { driver, DriveStep, Config } from 'driver.js';
import 'driver.js/dist/driver.css';

export type DecisionStepType = 'parcel' | 'satellite' | 'rotation' | 'assistant';

export interface FarmerTourOptions {
  onSetDecisionStep?: (step: DecisionStepType) => void;
  onComplete?: () => void;
}

export function createFarmerTour(options?: FarmerTourOptions) {
  const { onSetDecisionStep, onComplete } = options || {};

  const steps: DriveStep[] = [
    // 1. Bienvenida e Identidad del Visor
    {
      element: '#tour-brand',
      popover: {
        title: '🌾 Bienvenido al Visor Terraquipu',
        description:
          'Esta plataforma fue creada para que tú y tu comunidad tomen las mejores decisiones de siembra, protejan el agua de su suelo y prevengan pérdidas por heladas o sequías usando satélites de la NASA y sabiduría andina.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 2. Herramienta Trazar Parcela
    {
      element: '#tour-tool-draw-polygon',
      popover: {
        title: '✏️ Trazar Parcela (Límites de tu Chacra)',
        description:
          'Haz clic aquí para dibujar el contorno exacto de tu terreno haciendo toques sobre el mapa en cada esquina o lindero. El sistema calculará al instante los metros cuadrados y hectáreas reales.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 3. Herramienta Clic en Terreno
    {
      element: '#tour-tool-click-point',
      popover: {
        title: '🎯 Clic Rápido en Terreno',
        description:
          'Si no deseas marcar esquina por esquina, activa esta opción y haz un solo toque sobre cualquier ladera o andén del mapa. Terraquipu creará una parcela de referencia con la altura y pendiente de ese lugar.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 4. Presets Comunales
    {
      element: '#tour-presets',
      popover: {
        title: '🏔️ Sectores Comunales de Chinchero',
        description:
          'Accede rápidamente a andenerías y sectores de referencia conocidos (Yanacona, Taucca y Cuper Alto). Al tocarlos, el mapa vuela a esa zona y actualiza la información satelital en vivo.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 5. Sensor NASA SMAP
    {
      element: '#tour-sensor-smap',
      popover: {
        title: '💧 Sensor NASA SMAP (Agua en la Raíz)',
        description:
          'Mide con radar cuánta agua hay bajo la tierra en el estrato donde comen las raíces (0-100 cm). Te indica si el suelo tiene humedad óptima para sembrar o si sufre estrés por falta de lluvias.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 6. Sensor NDVI
    {
      element: '#tour-sensor-ndvi',
      popover: {
        title: '🌱 Sensor NDVI (Salud y Vigor del Cultivo)',
        description:
          'Observa mediante satélite qué tan verde, frondoso y vivo está el follaje de las plantas. Te ayuda a detectar a tiempo si una zona del cultivo se está amarilleando, secando o sufriendo plagas.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 7. Sensor SRTM
    {
      element: '#tour-sensor-srtm',
      popover: {
        title: '⛰️ Sensor SRTM (Pendiente y Altitud)',
        description:
          'Calcula qué tan empinada está la ladera y a cuántos metros sobre el nivel del mar se ubica tu chacra. Es fundamental para saber si necesitas andenes, terrazas o zanjas para evitar que la lluvia arrastre la tierra fértil.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 8. Ground-Truth Comunal
    {
      element: '#tour-sensor-groundtruth',
      popover: {
        title: '👥 Ground-Truth (Validación de la Comunidad)',
        description:
          'Muestra las parcelas donde campesinos y técnicos vecinos han verificado la salud del suelo y plagas directamente con sus manos. Une la tecnología del espacio con la voz real del campo.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 9. HUD Ficha Parcela Activa
    {
      element: '#tour-parcel-hud',
      popover: {
        title: '📋 Ficha Resumen de tu Parcela',
        description:
          'En este cuadro ves de un solo vistazo el tamaño de tu terreno (en hectáreas), el porcentaje de humedad radicular, el vigor vegetal y el botón para descargar el archivo geográfico para mapas (QGIS).',
        side: 'top',
        align: 'start',
      },
    },

    // 10. Selector de Capas Base
    {
      element: '#tour-map-layers',
      popover: {
        title: '🗺️ Tipo de Mapa (Satelital / Topográfico)',
        description:
          'Cambia entre el mapa de caminos (OpenStreetMap), las curvas de nivel (Topográfico) o la foto satelital real de alta resolución para ubicar tus linderos, árboles y senderos.',
        side: 'top',
        align: 'end',
      },
    },

    // 11. Stepper del Flujo de Decisión
    {
      element: '#tour-decision-stepper',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('parcel');
      },
      popover: {
        title: '🧭 Flujo de 4 Pasos del Planificador',
        description:
          'A tu derecha tienes la ruta guiada para planificar tu campaña: 1) Datos de Parcela, 2) Diagnóstico Satelital, 3) Plan Quipu de Rotación, y 4) Asistente frente a heladas.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 12. Paso 1: Calibración en Campo (Ground-Truth 5+1)
    {
      element: '#tour-groundtruth-card',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('parcel');
      },
      popover: {
        title: '✨ Calibración 5+1 (Kipu y Astro)',
        description:
          'Responde 5 preguntas sencillas guiadas por Kipu y Astro sobre cómo sientes tu tierra (textura del suelo, abonos usados, riego). Esto permite afinar los satélites a la realidad exacta de tu chacra.',
        side: 'left',
        align: 'center',
      },
    },

    // 13. Paso 2: Simulación Clima y El Niño
    {
      element: '#tour-climate-mode',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('satellite');
      },
      popover: {
        title: '☀️ Simular El Niño vs Año Normal',
        description:
          'Prueba este botón para ver qué pasaría si viene sequía por El Niño (-24% de lluvia). Terraquipu adaptará de inmediato los cultivos recomendados hacia semillas andinas rústicas que resisten la falta de agua.',
        side: 'left',
        align: 'center',
      },
    },

    // 14. Paso 3: Preguntas de Cultivo Anterior y Prioridad
    {
      element: '#tour-rotation-inputs',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('rotation');
      },
      popover: {
        title: '🥔 ¿Qué cosechaste y qué necesitas?',
        description:
          'Dinos qué sembraste en la última campaña (papa, quinua, haba o tarwi) y si tu meta este año es asegurar alimento para tu hogar, vender en la feria o curar el suelo cansado.',
        side: 'left',
        align: 'center',
      },
    },

    // 15. Paso 3: Recomendación Científica y Ahorro en Soles
    {
      element: '#tour-rotation-recommendation',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('rotation');
      },
      popover: {
        title: '🏆 Cultivo Recomendado y Ahorro de Abono',
        description:
          'El motor científico te indica la mejor semilla para rotar (por ejemplo, Tarwi tras Papa). Te muestra cuántos sacos de abono te ahorras en soles (S/.) gracias al nitrógeno natural y cómo cortar plagas como el gorgojo andino. ¡Incluso puedes escuchar la explicación en audio!',
        side: 'left',
        align: 'center',
      },
    },

    // 16. Paso 3: Guardar Plan en la Nube y Descargar Informe
    {
      element: '#tour-save-cloud',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('rotation');
      },
      popover: {
        title: '💾 Guardar Plan y Descargar Informe',
        description:
          'Guarda tu plan agrícola y genera un informe listo para imprimir o abrir en Word (.doc) para gestionar créditos en agencias agrarias o compartirlo con la asamblea comunal.',
        side: 'top',
        align: 'center',
      },
    },

    // 17. Botón de Paseo Guiado en Cabecera
    {
      element: '#tour-start-btn',
      popover: {
        title: '🌾 ¿Quieres repasar este paseo después?',
        description:
          '¡Listo! Cuando quieras volver a recordar qué hace cada herramienta o mostrárselo a otro comunero, presiona este botón "Paseo Guiado" en cualquier momento.',
        side: 'bottom',
        align: 'end',
      },
    },
  ];

  const config: Config = {
    steps,
    animate: true,
    showProgress: true,
    allowClose: true,
    stagePadding: 4,
    stageRadius: 8,
    progressText: 'Paso {{current}} de {{total}}',
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Entendido!',
    waitForElement: 1200,
    onDestroyed: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('terraquipu_farmer_tour_seen', 'true');
      }
      if (onComplete) onComplete();
    },
  };

  return driver(config);
}
