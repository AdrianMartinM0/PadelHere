from datetime import datetime, timedelta
from typing import List, Dict
from bson import ObjectId

from ..services.history_level_service import get_last_level, add_level_to_history, init_level_history
from ..database.db import user_collection

def diferencia_sets(resultado: str, ha_ganado: bool) -> int:
    sets = resultado.strip().split()
    diferencia_total = 0
    for set_str in sets:
        try:
            juegos_p1, juegos_p2 = map(int, set_str.split('-'))
            if not ha_ganado:
                juegos_p1, juegos_p2 = juegos_p2, juegos_p1
            diferencia_total += juegos_p1 - juegos_p2
        except ValueError:
            continue
    return diferencia_total

def analizar_sets(resultado: str):
    sets = resultado.strip().split()
    sets_ganados_p1 = 0
    sets_ganados_p2 = 0
    for set_str in sets:
        try:
            juegos_p1, juegos_p2 = map(int, set_str.split('-'))
            if juegos_p1 > juegos_p2:
                sets_ganados_p1 += 1
            elif juegos_p2 > juegos_p1:
                sets_ganados_p2 += 1
        except Exception:
            continue
    return sets_ganados_p1, sets_ganados_p2

def calcular_nuevo_nivel(
    nivel_actual: int,
    resultado: str,
    ha_ganado: bool,
    media_partidos_30d: float,
    media_nivel_rivales: float,
    base_ajuste: int = 100,
    min_puntos: int = 200,
    max_puntos: int = 9800,
) -> int:
    factor_actividad = 1.0 if media_partidos_30d >= 4 else max(media_partidos_30d / 4.0, 0.4)
    diferencia = media_nivel_rivales - nivel_actual
    factor_nivel = 1.0
    if ha_ganado:
        if diferencia >= 1000:
            factor_nivel = 1.2
        elif diferencia >= 2500:
            factor_nivel = 1.4
        elif diferencia >= 5000:
            factor_nivel = 1.6
    elif not ha_ganado:
        if diferencia <= -1000:
            factor_nivel = 1.2
        elif diferencia <= -2500:
            factor_nivel = 1.4
        elif diferencia <= -5000:
            factor_nivel = 1.6
    diff_sets = diferencia_sets(resultado, ha_ganado)
    factor_sets = 1.0 + (abs(diff_sets) / 2) * 0.1
    factor_sets = min(factor_sets, 2.0)
    ajuste = (base_ajuste * factor_actividad + base_ajuste * factor_nivel + base_ajuste * factor_sets) / 3
    if not ha_ganado:
        ajuste = -ajuste
    nuevo_nivel = nivel_actual + ajuste
    nuevo_nivel = max(min_puntos, min(max_puntos, int(round(nuevo_nivel))))
    return nuevo_nivel

def calcular_media_partidos_30d(partidos: List[dict], user_id: str) -> float:
    ahora = datetime.utcnow()
    hace_30d = ahora - timedelta(days=30)
    jugados = [
        p for p in partidos
        if user_id in p["jugadores"] and datetime.fromisoformat(p["fecha"]) >= hace_30d
    ]
    return len(jugados) / 1.0

def calcular_media_nivel_rivales(jugadores: List[str], parejas: Dict[str, int], user_id: str, user_niveles: dict) -> float:
    mi_pareja = parejas[user_id]
    rivales = [j for j in jugadores if parejas[j] != mi_pareja]
    niveles = [user_niveles[r] for r in rivales if r in user_niveles]
    return sum(niveles) / len(niveles) if niveles else 0

def update_levels_and_history_for_4_players(
    pareja1_jugador1: str,
    pareja1_jugador2: str,
    pareja2_jugador1: str,
    pareja2_jugador2: str,
    resultado: str,
    partidos_ultimos_30d: List[dict]
):
    jugadores = [
        pareja1_jugador1,
        pareja1_jugador2,
        pareja2_jugador1,
        pareja2_jugador2
    ]
    parejas = {
        pareja1_jugador1: 1,
        pareja1_jugador2: 1,
        pareja2_jugador1: 2,
        pareja2_jugador2: 2
    }

    sets_ganados_p1, sets_ganados_p2 = analizar_sets(resultado)
    if sets_ganados_p1 > sets_ganados_p2:
        pareja_ganadora = 1
    elif sets_ganados_p2 > sets_ganados_p1:
        pareja_ganadora = 2
    else:
        pareja_ganadora = 0  # Empate
        
    guardado_historico = False

    # 1. Inicializa historial SOLO si está vacío, y usando el nivel actual del usuario.
    for user_id in jugadores:
        obj_id = ObjectId(user_id)
        user_doc = user_collection.find_one({"_id": obj_id})
        nivel_actual_usuario = user_doc.get("level", 0) if user_doc else 0

        nivel_historico = get_last_level(user_id)
        if nivel_historico is None:
            # Inicializa el historial solo con el nivel actual del usuario si no existe historial
            init_level_history(user_id, nivel_actual_usuario)
            guardado_historico = True

    # 2. Calcula y actualiza el nivel, y guarda el nivel anterior en el histórico justo antes de actualizar.
    for user_id in jugadores:
        user_id = str(user_id)
        obj_id = ObjectId(user_id)
        user_doc = user_collection.find_one({"_id": obj_id})
        nivel_previo = user_doc.get("level", 0) if user_doc else 0  # Nivel antes de actualizar

        ha_ganado = (parejas[user_id] == pareja_ganadora)
        media_partidos_30d = calcular_media_partidos_30d(partidos_ultimos_30d, user_id)

        # Para calcular la media de nivel de rivales, usamos los niveles actuales de los jugadores (antes de actualizar)
        user_niveles_actuales = {}
        for rival_id in jugadores:
            rival_doc = user_collection.find_one({"_id": ObjectId(rival_id)})
            user_niveles_actuales[str(rival_id)] = rival_doc.get("level", 0) if rival_doc else 0

        media_nivel_rivales = calcular_media_nivel_rivales(jugadores, parejas, user_id, user_niveles_actuales)

        nuevo_nivel = calcular_nuevo_nivel(
            nivel_actual=nivel_previo,
            resultado=resultado,
            ha_ganado=ha_ganado,
            media_partidos_30d=media_partidos_30d,
            media_nivel_rivales=media_nivel_rivales
        )

        if not guardado_historico:
            add_level_to_history(user_id, nivel_previo)

        # Ahora sí actualiza el nivel actual del usuario
        user_collection.update_one(
            {"_id": obj_id},
            {"$set": {"level": nuevo_nivel}}
        )