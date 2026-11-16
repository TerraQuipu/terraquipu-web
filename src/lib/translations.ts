export type SupportedLanguage = 'en' | 'es' | 'qu';

export interface TranslationDictionary {
  meta: {
    name: string;
    code: SupportedLanguage;
    label: string;
  };
  nav: {
    brandSubtitle: string;
    visorLink: string;
    appLink: string;
    diagnosticLink: string;
    adminLink: string;
    startApp: string;
    openVisor: string;
    langToggle: string;
  };
  hero: {
    badge: string;
    titleMain: string;
    titleHighlight: string;
    subtitle: string;
    exploreVisor: string;
    openFarmerApp: string;
    inSituDiagnostic: string;
    nasaTelemetry: string;
    livePill: string;
  };
  pillars: {
    sectionTag: string;
    title: string;
    subtitle: string;
    p1Title: string;
    p1Desc: string;
    p2Title: string;
    p2Desc: string;
    p3Title: string;
    p3Desc: string;
    p4Title: string;
    p4Desc: string;
  };
  metrics: {
    savingsValue: string;
    savingsLabel: string;
    savingsSub: string;
    nitrogenValue: string;
    nitrogenLabel: string;
    nitrogenSub: string;
    resolutionValue: string;
    resolutionLabel: string;
    resolutionSub: string;
    offlineValue: string;
    offlineLabel: string;
    offlineSub: string;
  };
  tabsDiagnostico: {
    heading: string;
    subheading: string;
    tab1: string;
    tab1Title: string;
    tab1Sub: string;
    tab2: string;
    tab2Title: string;
    tab2Sub: string;
    tab3: string;
    tab3Title: string;
    tab3Sub: string;
    tab4: string;
    tab4Title: string;
    tab4Sub: string;
  };
  app: {
    dashboard: string;
    parcels: string;
    addParcel: string;
    rotation: string;
    copilot: string;
    settings: string;
    news: string;
    visorGis: string;
    greeting: string;
    kipuOnline: string;
    projectedSavings: string;
    soilMoisture: string;
    frostRisk: string;
    frostSafe: string;
    frostAlert: string;
    recommendedToday: string;
    viewFullPlan: string;
    quickDiagnostic: string;
    listenVoice: string;
    nitrogenBalance: string;
    cycleBreak: string;
    language: string;
    langEnglish: string;
    langSpanish: string;
    langQuechua: string;
    reconfigChacra: string;
    checkGps: string;
    disconnectChacra: string;
    copilotPlaceholder: string;
    soilHealth: string;
    myParcelsTitle: string;
    addChacraBtn: string;
  };
  visor: {
    title: string;
    subtitle: string;
    normalMode: string;
    ninoMode: string;
    guidedTour: string;
    activeParcelTitle: string;
    prevCrop: string;
    priorityTitle: string;
    priorityFood: string;
    priorityMarket: string;
    prioritySoil: string;
    optimalSuccession: string;
    estimatedSavings: string;
    rootMoisture: string;
    droughtRisk: string;
    exportQgis: string;
    exportWord: string;
    calibrateGroundTruth: string;
    assistantTitle: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    meta: {
      name: 'English',
      code: 'en',
      label: 'Technical English',
    },
    nav: {
      brandSubtitle: 'NASA Space Apps',
      visorLink: 'Satellite GIS Visor',
      appLink: 'Mobile Field App',
      diagnosticLink: 'In-Situ Diagnostic',
      adminLink: 'QGIS Admin',
      startApp: 'Launch App',
      openVisor: 'Open Visor',
      langToggle: 'Language',
    },
    hero: {
      badge: 'Synchronized with NASA SMAP Satellite & Andean Ecological Science',
      titleMain: 'Satellite Telemetry & Ancestral Wisdom',
      titleHighlight: 'for High-Andean Agronomy',
      subtitle:
        'TerraQuipu fuses NASA radar soil moisture telemetry, open agroclimatic models, and the millenary quipu to compute deterministic regenerative crop rotations against El Niño-driven droughts.',
      exploreVisor: 'Explore Territorial Visor',
      openFarmerApp: 'Launch Mobile App',
      inSituDiagnostic: 'Field Parcel Diagnostic',
      nasaTelemetry: 'Active Satellite Telemetry',
      livePill: 'Live • Cusco & Sacred Valley Watersheds',
    },
    pillars: {
      sectionTag: 'The 4 Pillars of TerraQuipu',
      title: 'Aerospace Remote Sensing & Millenary Agronomy',
      subtitle:
        'An integrated decision-support system empowering high-altitude communities to anticipate droughts, regenerate arable soil, and maximize net yield.',
      p1Title: 'NASA Satellite Telemetry',
      p1Desc:
        '30m root-zone soil moisture calibrated via NASA SMAP L4 radar and NASA DEM topographic models.',
      p2Title: 'Regenerative Quipu Succession',
      p2Desc:
        'Deterministic agroecological sequence interleaving legumes (Tarwi/Fava) for biological nitrogen fixation.',
      p3Title: 'El Niño Early Warning',
      p3Desc:
        'Predictive forecasting of drought stress and precipitation deficits 3 to 6 months in advance.',
      p4Title: 'Offline-First Field Architecture',
      p4Desc:
        '100% operational in remote Andean ravines and high plateaus without cellular connectivity.',
    },
    metrics: {
      savingsValue: '+420 S/',
      savingsLabel: 'Input Savings per Hectare',
      savingsSub: 'In synthetic nitrogen chemical fertilizers',
      nitrogenValue: '+95 kg',
      nitrogenLabel: 'Biological Nitrogen (N/ha)',
      nitrogenSub: 'Fixed per cycle via Tarwi/Legume rotation',
      resolutionValue: '30m',
      resolutionLabel: 'Satellite Resolution',
      resolutionSub: 'Field-level precision for smallholder parcels',
      offlineValue: '100%',
      offlineLabel: 'Offline Capability',
      offlineSub: 'Installable PWA with asynchronous synchronization',
    },
    tabsDiagnostico: {
      heading: 'Integrated Decision Architecture',
      subheading:
        'Four interconnected modules designed to maximize climatic resilience for every crop cycle.',
      tab1: 'In-Situ Diagnostic',
      tab1Title: 'Every parcel begins with 100+ agroclimatic indicators.',
      tab1Sub:
        '30-meter resolution edaphic diagnostic with real-time satellite telemetry to anticipate droughts, optimize nitrogen, and protect crops against El Niño.',
      tab2: 'Agroclimatic History',
      tab2Title: 'Two decades of satellite memory for your watershed.',
      tab2Sub:
        '20-year agroclimatic modeling with NASA POWER to anticipate rainfall anomalies and calculate evapotranspiration curves with scientific rigor.',
      tab3: 'Quipu Rotation',
      tab3Title: 'A regenerative multi-year plan for your soil.',
      tab3Sub:
        'Deterministic sequence audited by INIA: Tarwi for biological nitrogen fixation (+95 kg N/ha), resilient Quinoa, and tolerant Native Andean Potato.',
      tab4: 'El Niño Early Warning',
      tab4Title: 'Predictive alerts months before drought strikes.',
      tab4Sub:
        'NASA SMAP radar telemetry to calibrate root-zone soil moisture and trigger water contingency plans months before sowing.',
    },
    app: {
      dashboard: 'Dashboard',
      parcels: 'My Parcels',
      addParcel: 'New Parcel',
      rotation: 'Schedule & Savings',
      copilot: 'AI Copilot',
      settings: 'Settings',
      news: 'Bulletins',
      visorGis: 'GIS Visor',
      greeting: 'Welcome back, field agronomist',
      kipuOnline: 'Kipu Engine Online',
      projectedSavings: 'Projected Fertilizer Savings',
      soilMoisture: 'Soil Moisture (SMAP)',
      frostRisk: 'Frost Risk Index',
      frostSafe: 'No Frost Risk Detected',
      frostAlert: 'Frost Warning Alert',
      recommendedToday: 'Recommended Succession for Today',
      viewFullPlan: 'View Full Crop Plan',
      quickDiagnostic: 'Quick Soil Diagnostic',
      listenVoice: 'Play Voice Audio',
      nitrogenBalance: 'Nitrogen Balance (N/ha)',
      cycleBreak: 'Disrupts Pest Lifecycle',
      language: 'Interface Language',
      langEnglish: 'English (Technical)',
      langSpanish: 'Spanish (Castellano)',
      langQuechua: 'Quechua (Runasimi)',
      reconfigChacra: 'Recalibrate Parcel with Kipu',
      checkGps: 'Verify Satellite GPS Signal',
      disconnectChacra: 'Unlink Parcel from this Device',
      copilotPlaceholder: 'Ask Kipu about sowing dates, climate risks, or pests...',
      soilHealth: 'Soil Health & Resilience',
      myParcelsTitle: 'Registered Field Parcels',
      addChacraBtn: 'Register New Parcel',
    },
    visor: {
      title: 'Territorial Agroclimatic Visor',
      subtitle: 'Chinchero, Urubamba • 3,754 m a.s.l.',
      normalMode: 'Normal Season',
      ninoMode: 'El Niño Mode',
      guidedTour: 'Guided Tour',
      activeParcelTitle: 'Active Field Parcel',
      prevCrop: 'Previous Crop',
      priorityTitle: 'Agronomic Priority',
      priorityFood: 'Soil & Food Security',
      priorityMarket: 'Market & Yield',
      prioritySoil: 'Total Soil Regeneration',
      optimalSuccession: 'Optimal Botanical Succession',
      estimatedSavings: 'Estimated Urea Savings',
      rootMoisture: 'Root-Zone Moisture',
      droughtRisk: 'Drought Vulnerability',
      exportQgis: 'Export QGIS Layer (GeoJSON)',
      exportWord: 'Export Agronomic Report',
      calibrateGroundTruth: 'Calibrate Ground-Truth In Situ',
      assistantTitle: 'Kipu Assistant',
    },
  },
  es: {
    meta: {
      name: 'Español',
      code: 'es',
      label: 'Castellano',
    },
    nav: {
      brandSubtitle: 'NASA Space Apps',
      visorLink: 'Visor Satelital',
      appLink: 'App Móvil Campesina',
      diagnosticLink: 'Diagnóstico In Situ',
      adminLink: 'Admin QGIS',
      startApp: 'Iniciar App',
      openVisor: 'Abrir Visor',
      langToggle: 'Idioma',
    },
    hero: {
      badge: 'Sincronizado con Satélite NASA SMAP y Saberes Ancestrales',
      titleMain: 'Predicción Satelital y Saberes Ancestrales',
      titleHighlight: 'para el Agro Andino',
      subtitle:
        'TerraQuipu fusiona telemetría radar NASA de humedad del suelo, modelos agroclimáticos y el milenario quipu para calcular la rotación regenerativa perfecta frente a El Niño.',
      exploreVisor: 'Explorar Visor Territorial',
      openFarmerApp: 'Abrir App Campesina',
      inSituDiagnostic: 'Diagnóstico de Parcela',
      nasaTelemetry: 'Telemetría Satelital Activa',
      livePill: 'En Vivo • Cusco & Valle Sagrado',
    },
    pillars: {
      sectionTag: 'Los 4 Pilares de TerraQuipu',
      title: 'Tecnología Aeroespacial & Sabiduría Milenaria',
      subtitle:
        'Una solución integral creada para que las comunidades altoandinas resistan sequías, regeneren su tierra y multipliquen su rentabilidad.',
      p1Title: 'Telemetría Satelital NASA',
      p1Desc:
        'Humedad radicular a 30m vía NASA SMAP L4 y modelos de relieve NASA DEM.',
      p2Title: 'Quipu de Rotación Regenerativa',
      p2Desc:
        'Algoritmo determinista que intercala leguminosas (Tarwi/Haba) para fijar nitrógeno biológico.',
      p3Title: 'Alerta Temprana El Niño',
      p3Desc:
        'Anticipación de sequías y anomalías pluviométricas con 3 a 6 meses de ventaja.',
      p4Title: 'Tecnología Offline para el Campo',
      p4Desc:
        'Funciona al 100% en quebradas y punas sin cobertura celular ni conexión a internet.',
    },
    metrics: {
      savingsValue: '+420 S/',
      savingsLabel: 'Ahorro por Hectárea',
      savingsSub: 'En fertilizantes químicos nitrogenados',
      nitrogenValue: '+95 kg',
      nitrogenLabel: 'Nitrógeno Biológico',
      nitrogenSub: 'Fijado por ciclo con rotación de Tarwi',
      resolutionValue: '30m',
      resolutionLabel: 'Resolución Satelital',
      resolutionSub: 'Precisión a nivel de parcela familiar',
      offlineValue: '100%',
      offlineLabel: 'Funcionalidad Offline',
      offlineSub: 'PWA instalable y sincronización asíncrona',
    },
    tabsDiagnostico: {
      heading: 'Arquitectura del Asistente Integral',
      subheading:
        'Cuatro módulos interconectados para maximizar la resiliencia climática de cada cultivo.',
      tab1: 'Diagnóstico In Situ',
      tab1Title: 'Cada parcela inicia con más de 100 indicadores agroclimáticos.',
      tab1Sub:
        'Diagnóstico edáfico a 30 metros de resolución con telemetría satelital en tiempo real para anticipar sequías, optimizar nitrógeno y proteger los cultivos frente a El Niño.',
      tab2: 'Historia Agroclimática',
      tab2Title: 'Dos décadas de memoria satelital para tu microcuenca.',
      tab2Sub:
        'Modelado agroclimático de 20 años con NASA POWER para anticipar anomalías de precipitación y calcular curvas de evapotranspiración con rigor científico.',
      tab3: 'Rotación Quipu',
      tab3Title: 'Un plan multianual regenerativo para tu suelo.',
      tab3Sub:
        'Secuencia determinista auditada por INIA: Tarwi para fijación biológica de nitrógeno (+95 kg N/ha), Quinua resiliente y Papa Nativa tolerante.',
      tab4: 'Alerta Temprana El Niño',
      tab4Title: 'Alertas predictivas meses antes de que la sequía golpee.',
      tab4Sub:
        'Telemetría de radar NASA SMAP para calibrar la humedad del suelo en la zona radicular y activar planes de contingencia hídrica meses antes de la siembra.',
    },
    app: {
      dashboard: 'Inicio',
      parcels: 'Chacras',
      addParcel: 'Nueva Parcela',
      rotation: 'Rotación y Ahorro',
      copilot: 'Copiloto IA',
      settings: 'Ajustes',
      news: 'Noticias',
      visorGis: 'Visor GIS',
      greeting: 'Allillanchu masiy tarpukamayoc',
      kipuOnline: 'Kipu en Línea',
      projectedSavings: 'Ahorro proyectado de nitrógeno',
      soilMoisture: 'Humedad del suelo',
      frostRisk: 'Riesgo de helada',
      frostSafe: 'Sin riesgo de helada',
      frostAlert: 'Alerta preventiva de helada',
      recommendedToday: 'Rotación recomendada para hoy',
      viewFullPlan: 'Ver Plan Completo',
      quickDiagnostic: 'Diagnóstico Rápido de Suelo',
      listenVoice: 'Escuchar Consejo',
      nitrogenBalance: 'Balance de Nitrógeno',
      cycleBreak: 'Rompe ciclo de plagas',
      language: 'Idioma de la Chacra',
      langEnglish: 'Inglés Técnico (English)',
      langSpanish: 'Castellano (Español)',
      langQuechua: 'Runasimi (Quechua)',
      reconfigChacra: 'Reconfigurar Chacra con Kipu',
      checkGps: 'Comprobar Señal GPS Satelital',
      disconnectChacra: 'Desvincular Chacra de este Dispositivo',
      copilotPlaceholder: 'Pregúntale a Kipu sobre tu siembra, clima o plagas...',
      soilHealth: 'Salud del Suelo',
      myParcelsTitle: 'Mis Chacras Registradas',
      addChacraBtn: 'Registrar Nueva Chacra',
    },
    visor: {
      title: 'Visor Territorial Agrícola',
      subtitle: 'Chinchero, Urubamba • 3,754 m s. n. m.',
      normalMode: 'Modo Normal',
      ninoMode: 'Modo El Niño',
      guidedTour: 'Paseo Guiado',
      activeParcelTitle: 'Parcela Activa',
      prevCrop: 'Cultivo Previo',
      priorityTitle: 'Prioridad Agronómica',
      priorityFood: 'Suelo & Alimento',
      priorityMarket: 'Mercado & Renta',
      prioritySoil: 'Regeneración Total',
      optimalSuccession: 'Sucesión Botánica Óptima',
      estimatedSavings: 'Ahorro Estimado en Urea',
      rootMoisture: 'Humedad Radicular',
      droughtRisk: 'Vulnerabilidad Sequía',
      exportQgis: 'Exportar Plan QGIS',
      exportWord: 'Informe Word Agrónomo',
      calibrateGroundTruth: 'Calibrar Terreno In Situ',
      assistantTitle: 'Asistente Kipu',
    },
  },
  qu: {
    meta: {
      name: 'Runasimi',
      code: 'qu',
      label: 'Quechua',
    },
    nav: {
      brandSubtitle: 'NASA Space Apps',
      visorLink: 'Hanaq Pacha Qhawaq',
      appLink: 'Chajra App Yanapaq',
      diagnosticLink: 'Allpa Qhaway',
      adminLink: 'QGIS Kamachiq',
      startApp: 'App Qallariy',
      openVisor: 'Visor Kichay',
      langToggle: 'Simi',
    },
    hero: {
      badge: 'NASA SMAP Hanaq Pacha Qhawaqwan Ñawpa Yachaykunawan Tupanachisqa',
      titleMain: 'Hanaq Pacha Qhawaqwan Ñawpa Yachaykunawan',
      titleHighlight: 'Antikunapi Tarpuy Allinchay',
      subtitle:
        'TerraQuipuqa NASA SMAP allpa chiri-poqoy yupaykunata, pacha willakuykunata, ñawpa quiputawan huñun; chaynapi allpa samachiq muyuy tarpuyta hatun paraninpaq qispichin.',
      exploreVisor: 'Allpa Visor Qhaway',
      openFarmerApp: 'Chajra App Kichay',
      inSituDiagnostic: 'Chajra Allpa Qhaway',
      nasaTelemetry: 'NASA Tupuykuna Kawsachkan',
      livePill: 'Kawsachkan • Qosqo & Willka Qhichwa',
    },
    pillars: {
      sectionTag: 'TerraQuipupa Tawa Pirqankuna',
      title: 'Hanaq Pacha Yachay & Ñawpa Allpa Llamk\'ay',
      subtitle:
        'Kay yanapanakuyqa rurasqan kachkan hanan ayllukuna ch\'aki pachata atipanankupaq, allpanku kawsarichinankupaq, qolqenkuta yapakunankupaqpas.',
      p1Title: 'NASA Hanaq Pacha Tupuykuna',
      p1Desc:
        'NASA SMAP L4 nisqawan saphikama chiri-poqo yupay, NASA DEM nisqawan urqukuna qhaway.',
      p2Title: 'Muyuy Tarpuy Khipu',
      p2Desc:
        'Allin ñeqenchasqa tarpuy: tarwiwan hawaswan allpaman wanu churapunapaq.',
      p3Title: 'Hatun Para / Lloqlla Willaykuna',
      p3Desc:
        'Ch\'aki pachata, lloqlla parata kimsa otaq suqta killa ñawpaqmantapacha willay.',
      p4Title: 'Mana Internetniyoq Chajra Llamk\'ana',
      p4Desc:
        'Wayq\'okunapi, punakunapi mana llikayoq, mana internetniyoq llapan llamk\'an.',
    },
    metrics: {
      savingsValue: '+420 S/',
      savingsLabel: 'Hectáreapi Waqaychasqa',
      savingsSub: 'Química wanu rantinamanta waqaychasqa qolqe',
      nitrogenValue: '+95 kg',
      nitrogenLabel: 'Kawsachkan Wanu (N/ha)',
      nitrogenSub: 'Tarwi tarpusqawan allpaman kawsachisqa',
      resolutionValue: '30m',
      resolutionLabel: 'Hanaq Pacha Tupuy',
      resolutionSub: 'Ayllupa chajrallankama cheqap tupu',
      offlineValue: '100%',
      offlineLabel: 'Mana Internetwan Llamk\'aq',
      offlineSub: 'Celularpi takyasqa, kawsachkan',
    },
    tabsDiagnostico: {
      heading: 'Tukuy Kawsaypaq Yanapaq Pirqakuna',
      subheading:
        'Tawa huñusqa llamk\'anakuna sapa tarpuyta allinta amachanapaq.',
      tab1: 'Chajra Allpa Qhaway',
      tab1Title: 'Sapa chajramanta pachakmanta aswan tupuykuna rikhurin.',
      tab1Sub:
        'Allpapa kurpawasqa tupusqan 30 metrokama, chiri-poqoy yupaywan ch\'aki pachata ñawpaqchanapaq, wanuta allichanapaq, Hatun Paranpaq amachanapaqpas.',
      tab2: 'Ñawpa Pacha Willakuy',
      tab2Title: 'Iskay chunka wata hanaq pacha willakuy chajraykipaq.',
      tab2Sub:
        'NASA POWER nisqawan 20 wata para yupaykunata qhawarispa sapa killapi yaku chinkayta yachanchik yachay taripaq hina.',
      tab3: 'Khipu Muyuy Tarpuy',
      tab3Title: 'Watantin watantin allpa kawsarichiq tarpuykuna.',
      tab3Sub:
        'INIA kamachisqan tarpuy: Tarwi allpaman wanu kawsachiq (+95 kg N/ha), kallpasapa Kinwa, allin Papa Nativapas.',
      tab4: 'Hatun Para Sasachakuy',
      tab4Title: 'Ch\'aki pacha manaraq chayamuptin ñawpaq willakuy.',
      tab4Sub:
        'NASA SMAP radarwan saphikama allpapa yakunta tupuspa yaku waqaychayta qallarinchik manaraq tarpuchkaspa.',
    },
    app: {
      dashboard: 'Qallariy',
      parcels: 'Chajrakuna',
      addParcel: 'Chajra Yapay',
      rotation: 'Muyuy & Qolqe',
      copilot: 'Kipu Yanapaq',
      settings: 'Allichaykuna',
      news: 'Willakuykuna',
      visorGis: 'GIS Visor',
      greeting: 'Allillanchu masiy tarpukamayoc',
      kipuOnline: 'Kipu Llamk\'achkan',
      projectedSavings: 'Qolqe waqaychana wanu',
      soilMoisture: 'Allpapa chiri-poqon',
      frostRisk: 'Qasa sasachakuy',
      frostSafe: 'Manam kanchu qasa',
      frostAlert: 'Qasa chayamunqa willakuy',
      recommendedToday: 'Kunan p\'unchaw allin tarpuy',
      viewFullPlan: 'Llapantinta Qhaway',
      quickDiagnostic: 'Allpa Utqaylla Qhaway',
      listenVoice: 'Rimayta Uyariy',
      nitrogenBalance: 'Allpapi Wanu Tupuy',
      cycleBreak: 'Kuru kawsayta chinkachiq',
      language: 'Chajrapa Simin (Idioma)',
      langEnglish: 'English (Inlés)',
      langSpanish: 'Castellano (Español)',
      langQuechua: 'Runasimi (Quechua)',
      reconfigChacra: 'Chajrata Kaqmanta Allichay',
      checkGps: 'GPS Satélite Qhaway',
      disconnectChacra: 'Dispositivomanta Chajrata T\'aqay',
      copilotPlaceholder: 'Kiputa tapuy tarpusqaykimanta, pachamanta kurukunamantapas...',
      soilHealth: 'Allpapa Kawsaynin',
      myParcelsTitle: 'Chajraykuna Allichasqa',
      addChacraBtn: 'Mosoq Chajrata Yapay',
    },
    visor: {
      title: 'Allpa Suyukuna Visor',
      subtitle: 'Chinchero, Urubamba • 3,754 m s. n. m.',
      normalMode: 'Kawsay Pacha',
      ninoMode: 'Hatun Para Pacha',
      guidedTour: 'Paseo Yanapaq',
      activeParcelTitle: 'Llamk\'ana Chajra',
      prevCrop: 'Ñawpa Tarpusqa',
      priorityTitle: 'Tarpuy Paqtay',
      priorityFood: 'Allpawan Mikhuy',
      priorityMarket: 'Qhatuwan Qolqe',
      prioritySoil: 'Allpa Allinyachiy',
      optimalSuccession: 'Allin Muyuy Tarpuykuna',
      estimatedSavings: 'Wanu Rantinamanta Waqaychasqa',
      rootMoisture: 'Saphipi Yaku / Chiri-poqo',
      droughtRisk: 'Ch\'akipaq Sasachakuy',
      exportQgis: 'QGIS Plan Qispichiy',
      exportWord: 'Word Qillqa Qispichiy',
      calibrateGroundTruth: 'Chajra Allpa Allichay',
      assistantTitle: 'Kipu Yanapaq',
    },
  },
};

export function getTranslation(lang: SupportedLanguage): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en || TRANSLATIONS.es;
}
