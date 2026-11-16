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
    // 1. Welcome & Visor Identity
    {
      element: '#tour-brand',
      popover: {
        title: 'Welcome to the TerraQuipu GIS Suite',
        description:
          'This geospatial platform enables you and your community to make rigorous agronomic planting decisions, safeguard root-zone soil moisture, and mitigate frost or drought losses using NASA Earth Observation telemetry and Andean agroecology.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 2. Delineate Parcel Tool
    {
      element: '#tour-tool-draw-polygon',
      popover: {
        title: 'Delineate Parcel (Field Boundaries)',
        description:
          'Click here to trace the exact polygonal boundary of your parcel by clicking vertices along edges and corners. The system computes surface area in hectares and square meters instantly.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 3. Quick Point Click Tool
    {
      element: '#tour-tool-click-point',
      popover: {
        title: 'Quick Point Click on Terrain',
        description:
          'If you prefer not to trace corner by corner, toggle this tool and tap once on any terrace or hillside. TerraQuipu generates a calibrated reference parcel with local SRTM slope and elevation metrics.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 4. Communal Reference Sectors
    {
      element: '#tour-presets',
      popover: {
        title: 'Communal Terracing Sectors',
        description:
          'Quickly fly to known communal terracing sectors (Yanacona, Taucca, and Cuper Alto). Clicking flies the camera directly and pulls real-time satellite telemetry.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 5. NASA SMAP Radar
    {
      element: '#tour-sensor-smap',
      popover: {
        title: 'NASA SMAP Radar (Root-Zone Moisture)',
        description:
          'Measures topsoil volumetric water content (0-5 cm microwave radiometry / root-zone assimilation). Identifies whether soil moisture is optimal for sowing or facing hydrological drought deficit.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 6. Sentinel-2 NDVI
    {
      element: '#tour-sensor-ndvi',
      popover: {
        title: 'Sentinel-2 NDVI (Vegetation Vigor & Chlorophyll)',
        description:
          'Monitors photosynthetic activity and green canopy density via Sentinel-2 optical bands. Enables early detection of crop stress, senescence, or pest infestation.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 7. NASA SRTM
    {
      element: '#tour-sensor-srtm',
      popover: {
        title: 'NASA SRTM (Elevation & Slope Gradient)',
        description:
          'Computes hillside slope gradient (%) and meters above sea level (m a.s.l.). Essential for evaluating erosion risk, contour furrow requirements, and terrace maintenance.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 8. Communal Ground-Truth
    {
      element: '#tour-sensor-groundtruth',
      popover: {
        title: 'Communal Ground-Truth Telemetry',
        description:
          'Displays validation points where agricultural technicians and local farmers have verified soil health and pests in-situ, bridging spaceborne remote sensing with field reality.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 9. Active Parcel Telemetry HUD
    {
      element: '#tour-parcel-hud',
      popover: {
        title: 'Active Parcel Telemetry HUD',
        description:
          'Summarizes parcel surface area (ha), root-zone moisture percentage, vegetative vigor, and exports GeoJSON/Shapefile boundary layers for GIS platforms.',
        side: 'top',
        align: 'start',
      },
    },

    // 10. Basemap Layer Toggle
    {
      element: '#tour-map-layers',
      popover: {
        title: 'Basemap Layer Toggle',
        description:
          'Switch between OpenStreetMap road network, topographic contour lines, or high-resolution Esri World Imagery satellite basemaps to identify field landmarks.',
        side: 'top',
        align: 'end',
      },
    },

    // 11. 4-Step Decision Stepper
    {
      element: '#tour-decision-stepper',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('parcel');
      },
      popover: {
        title: '4-Step Decision Planning Flow',
        description:
          'Guided decision pathway on your right: 1) Parcel Geometry, 2) Satellite & Climate Diagnostics, 3) Quipu Rotational Plan, and 4) Preventative Agroclimatic Assistant.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 12. Step 1: In-Situ Ground-Truth Calibration
    {
      element: '#tour-groundtruth-card',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('parcel');
      },
      popover: {
        title: '5-Step In-Situ Ground-Truth Calibration',
        description:
          'Answer 5 structured agronomic questions regarding soil texture, amendments, and water access to ground-truth calibrate NASA radar signals to your parcel.',
        side: 'left',
        align: 'center',
      },
    },

    // 13. Step 2: ENSO Drought Simulation
    {
      element: '#tour-climate-mode',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('satellite');
      },
      popover: {
        title: 'ENSO Drought vs. Baseline Climate Simulation',
        description:
          'Simulate the impact of an ENSO drought anomaly (-24% seasonal precipitation). The system automatically pivots crop recommendations toward resilient rustic Andean cultivars.',
        side: 'left',
        align: 'center',
      },
    },

    // 14. Step 3: Rotational Predecessor & Management Goal
    {
      element: '#tour-rotation-inputs',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('rotation');
      },
      popover: {
        title: 'Rotational Predecessor & Management Goal',
        description:
          'Specify the predecessor crop cultivated during the prior campaign and designate your primary management priority (food security, commercial fair, or soil fertility restoration).',
        side: 'left',
        align: 'center',
      },
    },

    // 15. Step 3: Scientific Succession Recommendation
    {
      element: '#tour-rotation-recommendation',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('rotation');
      },
      popover: {
        title: 'Scientific Succession Recommendation & Savings',
        description:
          'The agroecological engine recommends optimal crop succession (e.g., Tarwi following Native Potato). Calculates synthetic fertilizer savings (PEN) from biological nitrogen fixation.',
        side: 'left',
        align: 'center',
      },
    },

    // 16. Step 3: Save Plan & Export Dossier
    {
      element: '#tour-save-cloud',
      onHighlightStarted: () => {
        if (onSetDecisionStep) onSetDecisionStep('rotation');
      },
      popover: {
        title: 'Save Plan & Export Agronomic Dossier',
        description:
          'Persist your campaign plan to cloud storage and download an executive agronomic report (.doc) for agricultural credit applications or communal assembly review.',
        side: 'top',
        align: 'center',
      },
    },

    // 17. Guided Tour Replay
    {
      element: '#tour-start-btn',
      popover: {
        title: 'Revisit Guided Tour Anytime',
        description:
          'Click "Guided Tour" in the top header at any point to replay this walkthrough or demonstrate geospatial tools to communal colleagues.',
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
    progressText: 'Step {{current}} of {{total}}',
    nextBtnText: 'Next ->',
    prevBtnText: '<- Previous',
    doneBtnText: 'Finish Tour',
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
