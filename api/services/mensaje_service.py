from api.database.db import mensaje_collection, user_collection
from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime
from api.websockets.chat_ws import notify_new_msg

# ----------- SERVICIO: Enviar mensaje a un chat -----------
async def enviar_mensaje(chat_id: str, autor_id: str, texto: str):
    mensaje = {
        "chat_id": ObjectId(chat_id),
        "autor": ObjectId(autor_id),
        "texto": texto,
        "fecha": datetime.utcnow()
    }
    result = mensaje_collection.insert_one(mensaje)
    mensaje["_id"] = str(result.inserted_id)
    mensaje["chat_id"] = str(mensaje["chat_id"])
    mensaje["autor"] = str(mensaje["autor"])
    mensaje["fecha"] = mensaje["fecha"].isoformat() + "Z"

    # --- Obtén los datos del usuario ---
    usuario = user_collection.find_one({"_id": ObjectId(autor_id)})
    nombre = usuario.get("name", "")
    img_perfil = usuario.get("img_perfil", None)  # base64 o dataurl

    # --- Monta el payload final para el websocket ---
    mensaje = {
        "_id": mensaje["_id"],
        "chat_id": mensaje["chat_id"],
        "texto": mensaje["texto"],
        "fecha": mensaje["fecha"],
        "autor": mensaje["autor"],
        "nombre": nombre,
        "img_perfil": img_perfil
    }
    await notify_new_msg(mensaje)  # Notifica a los websockets conectados
    return mensaje 

# ----------- SERVICIO: Listar mensajes de un chat (paginado) -----------
async def listar_mensajes(chat_id: str, limit: int = 50, skip: int = 0):
    mensajes = list(
        mensaje_collection
        .find({"chat_id": ObjectId(chat_id)})
        .sort("fecha", 1)
        .skip(skip)
        .limit(limit)
    )
    for m in mensajes:
        m["_id"] = str(m["_id"])
        m["chat_id"] = str(m["chat_id"])
        m["autor"] = str(m["autor"])
        if "fecha" in m and hasattr(m["fecha"], "isoformat"):
            m["fecha"] = m["fecha"].isoformat() + "Z"
    return mensajes

# ----------- SERVICIO: Eliminar mensaje por ID -----------
async def eliminar_mensaje(mensaje_id: str):
    result = mensaje_collection.delete_one({"_id": ObjectId(mensaje_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado.")
    return {"message": "Mensaje eliminado correctamente."}

# ----------- SERVICIO: Editar mensaje por ID -----------
async def editar_mensaje(mensaje_id: str, nuevo_texto: str):
    result = mensaje_collection.update_one(
        {"_id": ObjectId(mensaje_id)},
        {"$set": {"texto": nuevo_texto}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mensaje no encontrado.")
    return {"message": "Mensaje editado correctamente."}