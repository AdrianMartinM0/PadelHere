from database.db import partido_collection
from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime
from websockets.partido_ws import notify_new_participant
from utils.level_update import update_levels_and_history_for_4_players
from .chat_service import create_chat_for_partido, add_user_to_chat, remove_user_from_chat

# ----------- SERVICIO: Obtener partido por ID -----------
async def get_partido_by_id(partido_id):
    partido = partido_collection.find_one({"_id": ObjectId(partido_id)})
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")
    partido['_id'] = str(partido['_id'])
    if 'club_id' in partido and isinstance(partido['club_id'], ObjectId):
        partido['club_id'] = str(partido['club_id'])
    if 'created_by' in partido and isinstance(partido['created_by'], ObjectId):
        partido['created_by'] = str(partido['created_by'])
    if 'chat_id' in partido and isinstance(partido['chat_id'], ObjectId):
        partido['chat_id'] = str(partido['chat_id'])
    for slot in ["pareja1_jugador1", "pareja1_jugador2", "pareja2_jugador1", "pareja2_jugador2"]:
        if partido.get(slot) and isinstance(partido[slot], ObjectId):
            partido[slot] = str(partido[slot])
    # Limpiar ObjectId en resultado si existe
    if "resultado" in partido and isinstance(partido["resultado"], dict):
        for k, v in partido["resultado"].items():
            if isinstance(v, ObjectId):
                partido["resultado"][k] = str(v)
    return partido

# ----------- SERVICIO: Crear partido -----------
async def create_partido(partido_data: dict, user_id: str):
    partido_data["created_by"] = ObjectId(user_id)
    partido_data["pareja1_jugador1"] = str(user_id)
    for slot in ["pareja1_jugador2", "pareja2_jugador1", "pareja2_jugador2"]:
        partido_data[slot] = None
    partido_data["created_at"] = datetime.utcnow().isoformat() + "Z"
    partido_data["updated_at"] = partido_data["created_at"]

    result = partido_collection.insert_one(partido_data)
    partido = partido_collection.find_one({"_id": result.inserted_id})

    # Crear el chat y guardar el chat_id en el partido
    chat_id = await create_chat_for_partido(str(partido["_id"]), [user_id])
    partido_collection.update_one(
        {"_id": result.inserted_id},
        {"$set": {"chat_id": ObjectId(chat_id)}}
    )
    # Refrescar el partido con el chat_id actualizado
    partido = partido_collection.find_one({"_id": result.inserted_id})

    if partido and "_id" in partido and isinstance(partido["_id"], ObjectId):
        partido["_id"] = str(partido["_id"])
    if "created_by" in partido and isinstance(partido["created_by"], ObjectId):
        partido["created_by"] = str(partido["created_by"])
    if "chat_id" in partido and isinstance(partido["chat_id"], ObjectId):
        partido["chat_id"] = str(partido["chat_id"])
    for slot in ["pareja1_jugador1", "pareja1_jugador2", "pareja2_jugador1", "pareja2_jugador2"]:
        if partido.get(slot) and isinstance(partido[slot], ObjectId):
            partido[slot] = str(partido[slot])
    if "resultado" in partido and isinstance(partido["resultado"], dict):
        for k, v in partido["resultado"].items():
            if isinstance(v, ObjectId):
                partido["resultado"][k] = str(v)
    return partido

# ----------- SERVICIO: Listar partidos -----------
async def list_partidos(filtros: dict = None):
    q = filtros if filtros else {}
    partidos = list(partido_collection.find(q).sort([("date", 1), ("time", 1)]))
    for partido in partidos:
        partido['_id'] = str(partido['_id'])
        if 'club_id' in partido and isinstance(partido['club_id'], ObjectId):
            partido['club_id'] = str(partido['club_id'])
        if 'created_by' in partido and isinstance(partido['created_by'], ObjectId):
            partido['created_by'] = str(partido['created_by'])
        if 'chat_id' in partido and isinstance(partido['chat_id'], ObjectId):
            partido['chat_id'] = str(partido['chat_id'])
        for slot in ["pareja1_jugador1", "pareja1_jugador2", "pareja2_jugador1", "pareja2_jugador2"]:
            if partido.get(slot) and isinstance(partido[slot], ObjectId):
                partido[slot] = str(partido[slot])
        if "resultado" in partido and isinstance(partido["resultado"], dict):
            for k, v in partido["resultado"].items():
                if isinstance(v, ObjectId):
                    partido["resultado"][k] = str(v)
    return partidos

# ----------- SERVICIO: Unirse a slot de partido -----------
async def join_partido_slot(partido_id: str, slot_name: str, user_id: str, user_name: str = None):
    allowed_slots = ["pareja1_jugador1", "pareja1_jugador2", "pareja2_jugador1", "pareja2_jugador2"]
    if slot_name not in allowed_slots:
        raise HTTPException(status_code=400, detail="Slot no válido.")
    partido = partido_collection.find_one({"_id": ObjectId(partido_id)})
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")

    try:
        dt_partido = datetime.strptime(f"{partido['fecha']} {partido['hora']}", "%Y-%m-%d %H:%M")
        if datetime.utcnow() > dt_partido:
            raise HTTPException(status_code=410, detail="El partido ya ha pasado, no puedes inscribirte.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al comprobar fecha y hora del partido: {e}")

    slot_actual = partido.get(slot_name)
    if slot_actual and slot_actual != user_id:
        raise HTTPException(status_code=409, detail="Ese puesto ya está ocupado.")

    slot_antiguo = None
    for slot in allowed_slots:
        if partido.get(slot) == user_id and slot != slot_name:
            slot_antiguo = slot
            break

    updates = {
        slot_name: user_id,
        "updated_at": datetime.utcnow().isoformat() + "Z"
    }
    if slot_antiguo:
        updates[slot_antiguo] = None

    partido_collection.update_one(
        {"_id": ObjectId(partido_id)},
        {"$set": updates}
    )

    # <<<<<< AÑADIDO: añadir usuario al chat del partido >>>>>>
    try:
        await add_user_to_chat(partido_id, user_id)
    except Exception as e:
        print(f"[WARN] No se pudo añadir usuario al chat: {e}")

    await notify_new_participant(partido_id)
    return {"message": f"Te has unido al partido en {slot_name}."}

# ----------- SERVICIO: Actualizar resultado del partido (obsoleta, sustituir por nueva lógica doble validación) -----------
async def update_partido_resultado(partido_id: str, resultado: dict):
    partido = partido_collection.find_one({"_id": ObjectId(partido_id)})
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")
    partido_collection.update_one(
        {"_id": ObjectId(partido_id)},
        {"$set": {"resultado": resultado, "updated_at": datetime.utcnow().isoformat() + "Z"}}
    )
    return {"message": "Resultado actualizado correctamente."}

# ----------- SERVICIO: Proponer resultado partido -----------
async def proponer_resultado(partido_id: str, resultado: str, propuesto_por: str):
    partido = partido_collection.find_one({"_id": ObjectId(partido_id)})
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")
    # Solo puedes proponer si el partido está completo (todas las plazas ocupadas)
    slots = [partido.get(slot) for slot in ["pareja1_jugador1", "pareja1_jugador2", "pareja2_jugador1", "pareja2_jugador2"]]
    if not all(slots):
        raise HTTPException(status_code=400, detail="El partido aún no está completo.")
    # Guardar quién propone y el resultado propuesto, y dejarlo pendiente de confirmación
    resultado_obj = {
        "estado": "pendiente_confirmacion",
        "propuesto_por": propuesto_por,
        "resultado": resultado,
        "confirmado_por": None,
        "confirmado": False,
        "rechazado_por": None,
        "fecha_propuesta": datetime.utcnow().isoformat() + "Z"
    }
    partido_collection.update_one(
        {"_id": ObjectId(partido_id)},
        {"$set": {"resultado": resultado_obj, "updated_at": datetime.utcnow().isoformat() + "Z"}}
    )
    return {"message": "Resultado propuesto correctamente. Pendiente de confirmación."}

# ----------- SERVICIO: Confirmar resultado partido -----------
async def confirmar_resultado(partido_id: str, user_id: str):
    partido = partido_collection.find_one({"_id": ObjectId(partido_id)})
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")
    resultado = partido.get("resultado")
    if not resultado or resultado.get("estado") != "pendiente_confirmacion":
        raise HTTPException(status_code=400, detail="No hay resultado pendiente de confirmación.")
    # Solo puede confirmar un usuario de la pareja contraria al que propuso
    propuesto_por = resultado.get("propuesto_por")
    pareja1_jugador1 = partido.get("pareja1_jugador1")
    pareja1_jugador2 = partido.get("pareja1_jugador2")
    pareja2_jugador1 = partido.get("pareja2_jugador1")
    pareja2_jugador2 = partido.get("pareja2_jugador2")
    pareja1 = [pareja1_jugador1, pareja1_jugador2]
    pareja2 = [pareja2_jugador1, pareja2_jugador2]
    if propuesto_por in pareja1:
        pareja_contraria = pareja2
    else:
        pareja_contraria = pareja1
    if user_id not in pareja_contraria:
        raise HTTPException(status_code=403, detail="Solo un jugador de la pareja contraria puede confirmar el resultado.")
    # Confirmar el resultado
    resultado["estado"] = "confirmado"
    resultado["confirmado_por"] = user_id
    resultado["confirmado"] = True
    resultado["fecha_confirmacion"] = datetime.utcnow().isoformat() + "Z"
    partido_collection.update_one(
        {"_id": ObjectId(partido_id)},
        {"$set": {"resultado": resultado, "updated_at": datetime.utcnow().isoformat() + "Z"}}
    )
    
    # -------- ACTUALIZA NIVELES Y HISTÓRICO -----------
    resultado_str = resultado.get("resultado")  # Cambia a resultado.get("sets") si tu campo se llama así
    # TODO: Implementa la consulta real para partidos_ultimos_30d
    partidos_ultimos_30d = []  # De momento, vacío o implementa tu consulta aquí

    update_levels_and_history_for_4_players(
        pareja1_jugador1=pareja1_jugador1,
        pareja1_jugador2=pareja1_jugador2,
        pareja2_jugador1=pareja2_jugador1,
        pareja2_jugador2=pareja2_jugador2,
        resultado=resultado_str,
        partidos_ultimos_30d=partidos_ultimos_30d
    )
    return {"message": "Resultado confirmado correctamente y niveles actualizados."}

# ----------- SERVICIO: Rechazar resultado partido -----------
async def rechazar_resultado(partido_id: str, user_id: str):
    partido = partido_collection.find_one({"_id": ObjectId(partido_id)})
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")
    resultado = partido.get("resultado")
    if not resultado or resultado.get("estado") != "pendiente_confirmacion":
        raise HTTPException(status_code=400, detail="No hay resultado pendiente de confirmación.")
    # Solo puede rechazar un usuario de la pareja contraria al que propuso
    propuesto_por = resultado.get("propuesto_por")
    pareja1 = [partido.get("pareja1_jugador1"), partido.get("pareja1_jugador2")]
    pareja2 = [partido.get("pareja2_jugador1"), partido.get("pareja2_jugador2")]
    if propuesto_por in pareja1:
        pareja_contraria = pareja2
    else:
        pareja_contraria = pareja1
    if user_id not in pareja_contraria:
        raise HTTPException(status_code=403, detail="Solo un jugador de la pareja contraria puede rechazar el resultado.")
    # Rechazar el resultado, queda para volver a proponer
    resultado["estado"] = "rechazado"
    resultado["rechazado_por"] = user_id
    resultado["confirmado"] = False
    resultado["fecha_rechazo"] = datetime.utcnow().isoformat() + "Z"
    partido_collection.update_one(
        {"_id": ObjectId(partido_id)},
        {"$set": {"resultado": resultado, "updated_at": datetime.utcnow().isoformat() + "Z"}}
    )
    return {"message": "Resultado rechazado. Debes proponer un nuevo resultado."}

# ----------- SERVICIO: Eliminar partido -----------
async def delete_partido_by_id(partido_id: str):
    result = partido_collection.delete_one({"_id": ObjectId(partido_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")
    return {"message": "Partido eliminado correctamente."}

# ----------- SERVICIO: Salirse de un slot de partido -----------
async def leave_partido_slot(partido_id: str, slot_name: str, user_id: str):
    allowed_slots = ["pareja1_jugador1", "pareja1_jugador2", "pareja2_jugador1", "pareja2_jugador2"]
    if slot_name not in allowed_slots:
        raise HTTPException(status_code=400, detail="Slot no válido.")

    partido = partido_collection.find_one({"_id": ObjectId(partido_id)})
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")

    slot_actual = partido.get(slot_name)
    if slot_actual != user_id:
        raise HTTPException(status_code=403, detail="No puedes salir de un slot que no ocupas.")

    partido_collection.update_one(
        {"_id": ObjectId(partido_id)},
        {"$set": {
            slot_name: None,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }}
    )

    # <<<<<< AÑADIDO: quitar usuario del chat del partido >>>>>>
    try:
        await remove_user_from_chat(partido_id, user_id)
    except Exception as e:
        print(f"[WARN] No se pudo quitar usuario del chat: {e}")

    await notify_new_participant(partido_id)
    return {"message": f"Has salido del partido del slot {slot_name}."}

# ----------- SERVICIO: Listar partidos de un usuario -----------
async def list_partidos_usuario(user_id: str):
    query = {
        "$or": [
            {"pareja1_jugador1": user_id},
            {"pareja1_jugador2": user_id},
            {"pareja2_jugador1": user_id},
            {"pareja2_jugador2": user_id},
        ]
    }
    partidos = list(partido_collection.find(query).sort([("fecha", 1), ("hora", 1)]))
    for partido in partidos:
        partido['_id'] = str(partido['_id'])
        if 'club_id' in partido and isinstance(partido['club_id'], ObjectId):
            partido['club_id'] = str(partido['club_id'])
        if 'created_by' in partido and isinstance(partido['created_by'], ObjectId):
            partido['created_by'] = str(partido['created_by'])
        if 'chat_id' in partido and isinstance(partido['chat_id'], ObjectId):
            partido['chat_id'] = str(partido['chat_id'])
        for slot in ["pareja1_jugador1", "pareja1_jugador2", "pareja2_jugador1", "pareja2_jugador2"]:
            if partido.get(slot) and isinstance(partido[slot], ObjectId):
                partido[slot] = str(partido[slot])
        if "resultado" in partido and isinstance(partido["resultado"], dict):
            for k, v in partido["resultado"].items():
                if isinstance(v, ObjectId):
                    partido["resultado"][k] = str(v)
    return partidos