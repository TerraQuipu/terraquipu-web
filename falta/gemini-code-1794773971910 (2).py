def calcular_incertidumbre_recomendacion(
    parametros_cuestionario: dict, 
    discrepancias_esenciales: dict, 
    datos_visor: dict, 
    datos_api: dict, 
    alerta_macro: dict
) -> dict:
    """
    Calcula el porcentaje de incertidumbre de la recomendación (I_rec) para TerraQuipu.
    El agricultor tiene la razón absoluta. Las discrepancias penalizan la fiabilidad 
    de los cálculos satelitales (daño colateral).
    """
    i_total = 0
    desglose = {}

    # 1. Incertidumbre Climática Base (De la alerta oficial ENFEN/SENAMHI)
    prob_oficial = alerta_macro.get("probabilidad_porcentaje", 50) # 50% si es señal incierta
    i_clima = 100 - prob_oficial
    desglose["clima_base"] = i_clima
    i_total += i_clima

    # 2. Incertidumbre Espacial (Topografía / Tamaño del polígono del Visor)
    area_m2 = datos_visor.get("area_m2", 0)
    i_espacial = 0
    # Si es menor a 1,000m2 (sub-píxel) o mayor a 30,000m2 (mezcla pendientes)
    if area_m2 < 1000 or area_m2 > 30000:
        i_espacial = 15
    desglose["geometria_espacial"] = i_espacial
    i_total += i_espacial

    # 3. Incertidumbre Macro-Micro (Alerta vs API-METEO en tiempo real)
    i_macro_micro = 0
    escenario = alerta_macro.get("escenario_activo")
    precipitacion_api = datos_api.get("precipitation_mm", 0.0)
    
    # Si hay alerta de déficit, pero la API registra lluvias normales/fuertes en la chacra
    if escenario == "déficit_lluvias" and precipitacion_api > 5.0:
        i_macro_micro = 15
    # Si hay alerta de lluvias intensas, pero la API registra sequedad
    elif escenario == "lluvias_intensas" and precipitacion_api == 0.0:
        i_macro_micro = 15
        
    desglose["choque_macro_micro"] = i_macro_micro
    i_total += i_macro_micro

    # 4. Incertidumbre por Satélite "Ciego" (Cuestionario vs API-BIOCLIMA)
    i_satelite = 0
    # Si la función reconciliar_esenciales detectó que el agricultor contradice a la NASA
    if "cobertura" in discrepancias_esenciales or "agua" in discrepancias_esenciales:
        # El agricultor fijó la verdad, pero la IA ya no confía en el ET0 o VPD del satélite
        i_satelite = 20 
    desglose["satelite_ciego"] = i_satelite
    i_total += i_satelite

    # 5. Incertidumbre por Resolución Edáfica (API-SOIL vs Cuestionario)
    i_edafica = 0
    origen_textura = parametros_cuestionario["complementarias"]["textura"]["origen"]
    if origen_textura == "prueba_del_punado":
        i_edafica = 5  # Margen de error humano leve
    elif origen_textura == "desconocido":
        i_edafica = 10 # Dependencia total a ciegas del píxel de 250m de SoilGrids
    desglose["resolucion_edafica"] = i_edafica
    i_total += i_edafica

    # 6. Incertidumbre de Rotación / Nutrientes (Historial)
    i_historial = 0
    historial = parametros_cuestionario["complementarias"].get("historial", {})
    v_anterior = historial.get("vez_anterior")
    a_de_esa = historial.get("antes_de_esa")
    
    # Si sembró algo fuera de la matriz andina, el cálculo de nitrógeno pierde precisión
    if (v_anterior and v_anterior.get("cultivo") == "otro") or \
       (a_de_esa and a_de_esa.get("cultivo") == "otro"):
        i_historial = 5
    desglose["historial_desconocido"] = i_historial
    i_total += i_historial

    # --- Traducción de la Incertidumbre a UX (Semáforo de la App) ---
    if i_total <= 20:
        nivel_ux = "Alta (🟢)"
    elif i_total <= 45:
        nivel_ux = "Media (🟡)"
    else:
        nivel_ux = "Baja (🔴)"

    return {
        "incertidumbre_total_porcentaje": i_total,
        "desglose_penalizaciones": desglose,
        "nivel_confianza_ux": nivel_ux
    }

# ==========================================
# EJEMPLO DE USO (Simulación de un caso real)
# ==========================================
if __name__ == "__main__":
    
    # 1. Datos del Cuestionario procesados
    parametros_agric = {
        "complementarias": {
            "textura": {"clase": "franca", "origen": "prueba_del_punado"},
            "historial": {
                "vez_anterior": {"cultivo": "papa", "tipo": "tuberculo"},
                "antes_de_esa": {"cultivo": "quinua", "tipo": "cereal"}
            }
        }
    }
    
    # 2. Choque detectado previamente por tu función `reconciliar_esenciales`
    # (Ej: El agricultor marcó 'tierra desnuda', pero el NDVI de NASA marcaba vegetación)
    discrepancias = {
        "cobertura": {"agricultor": "suelo_desnudo", "externo": "vegetacion_alta"}
    }
    
    # 3. Datos espaciales del Visor TerraQuipu
    visor = {
        "area_m2": 15000, # 1.5 Hectáreas (Rango ideal)
        "pendiente_pct": 12
    }
    
    # 4. Datos frescos de las APIs en esa coordenada
    apis = {
        "precipitation_mm": 0.0,
        "ndvi_mean": 0.45
    }
    
    # 5. Pronóstico oficial
    alerta = {
        "escenario_activo": "déficit_lluvias",
        "probabilidad_porcentaje": 80 # El Niño Fuerte
    }
    
    # EJECUTAR CÁLCULO
    resultado = calcular_incertidumbre_recomendacion(
        parametros_agric, discrepancias, visor, apis, alerta
    )
    
    import json
    print(json.dumps(resultado, indent=2, ensure_ascii=False))