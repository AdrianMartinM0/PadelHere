from ..database.db import chat_collection, mensaje_collection
from fastapi import HTTPException
from bson import ObjectId
from datetime import datetime, timedelta
import calendar

def is_dst_europe_madrid(dt: datetime) -> bool:
    # Último domingo de marzo
    march_last_sunday = max(week[-1] for week in calendar.monthcalendar(dt.year, 3))
    dst_start = datetime(dt.year, 3, march_last_sunday, 2, 0)
    # Último domingo de octubre
    october_last_sunday = max(week[-1] for week in calendar.monthcalendar(dt.year, 10))
    dst_end = datetime(dt.year, 10, october_last_sunday, 3, 0)
    return dst_start <= dt < dst_end

def parse_fecha_hora_es_to_utc(fecha_str: str, hora_str: str) -> datetime:
    dt_local = datetime.strptime(f"{fecha_str} {hora_str}", "%Y-%m-%d %H:%M")
    if is_dst_europe_madrid(dt_local):
        utc_dt = dt_local - timedelta(hours=2)
    else:
        utc_dt = dt_local - timedelta(hours=1)
    return utc_dt

def es_partido_antiguo(fecha_str: str, hora_str: str) -> bool:
    partido_utc = parse_fecha_hora_es_to_utc(fecha_str, hora_str)
    ahora_utc = datetime.utcnow()
    return partido_utc < ahora_utc - timedelta(days=1)

# ----------- SERVICIO: Crear chat asociado a partido -----------
async def create_chat_for_partido(partido_id: str, user_ids: list):
    chat_data = {
        "partido_id": ObjectId(partido_id),
        "miembros": [ObjectId(u) for u in user_ids],
        "mensajes": []  # inicial, puedes ignorar esto de momento
    }
    result = chat_collection.insert_one(chat_data)
    return str(result.inserted_id)

# ----------- SERVICIO: Añadir usuario a chat del partido -----------
async def add_user_to_chat(partido_id: str, user_id: str):
    chat = chat_collection.find_one({"partido_id": ObjectId(partido_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat no encontrado para este partido.")
    chat_collection.update_one(
        {"_id": chat["_id"]},
        {"$addToSet": {"miembros": ObjectId(user_id)}}
    )

# ----------- SERVICIO: Quitar usuario del chat del partido -----------
async def remove_user_from_chat(partido_id: str, user_id: str):
    chat = chat_collection.find_one({"partido_id": ObjectId(partido_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat no encontrado para este partido.")
    chat_collection.update_one(
        {"_id": chat["_id"]},
        {"$pull": {"miembros": ObjectId(user_id)}}
    )

# ----------- SERVICIO: Eliminar chat al borrar partido -----------
async def delete_chat_for_partido(partido_id: str):
    chat_collection.delete_one({"partido_id": ObjectId(partido_id)})
    
# ----------- SERVICIO: Listar chats de un usuario -----------  
def fix_objectids(doc):
    if isinstance(doc, list):
        return [fix_objectids(d) for d in doc]
    if isinstance(doc, dict):
        # Detecta {"$oid": "..."} y lo convierte a string
        if set(doc.keys()) == {"$oid"} and isinstance(doc["$oid"], str):
            return doc["$oid"]
        return {k: fix_objectids(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc

async def list_chats_for_user(user_id: str):
    chats = list(chat_collection.find({"miembros": ObjectId(user_id)}))
    return fix_objectids(chats)

# ----------- SERVICIO: Setear el último mensaje leído por el usuario en el chat -----------
async def set_last_read_message(chat_id: str, user_id: str, last_message_id: str):
    chat = chat_collection.find_one({"_id": ObjectId(chat_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat no encontrado.")

    # Actualizar o insertar el registro en el array unreads
    unreads = chat.get("unreads", [])
    found = False
    for u in unreads:
        if str(u["user_id"]) == user_id:
            u["last_read_message_id"] = ObjectId(last_message_id)
            found = True
            break
    if not found:
        unreads.append({
            "user_id": ObjectId(user_id),
            "last_read_message_id": ObjectId(last_message_id)
        })

    chat_collection.update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": {"unreads": unreads}}
    )

    return {
        "ok": True,
        "chat_id": chat_id,
        "user_id": user_id,
        "last_read_message_id": last_message_id
    }

# ----------- SERVICIO: Obtener cantidad de mensajes sin leer en un chat (si partido no es antiguo) -----------
async def get_unread_count_if_partido_not_past(chat_id: str, user_id: str):
    # 1. Busca el chat
    chat = chat_collection.find_one({"_id": ObjectId(chat_id)})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat no encontrado.")

    # 2. Busca el last_read_message_id para el usuario
    last_read_message_id = None
    for u in chat.get("unreads", []):
        # Soporta user_id como string o dict {"$oid": ...}
        u_id = u.get("user_id")
        u_id = u_id.get("$oid") if isinstance(u_id, dict) and "$oid" in u_id else str(u_id)
        if u_id == str(user_id):
            lr = u.get("last_read_message_id")
            last_read_message_id = lr.get("$oid") if isinstance(lr, dict) and "$oid" in lr else str(lr) if lr else None
            break

    # 3. Cuenta los mensajes pendientes
    mensajes_filtro = {"chat_id": ObjectId(chat_id)}
    if last_read_message_id:
        mensajes_filtro["_id"] = {"$gt": ObjectId(last_read_message_id)}
    count = mensaje_collection.count_documents(mensajes_filtro)
    return count