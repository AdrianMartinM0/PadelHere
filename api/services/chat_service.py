from ..database.db import chat_collection, partido_collection
from fastapi import HTTPException
from bson import ObjectId

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
async def list_chats_for_user(user_id: str):
    chats = list(chat_collection.find({"miembros": ObjectId(user_id)}))
    # Limpia los ObjectId para el output
    for chat in chats:
        chat['_id'] = str(chat['_id'])
        if 'partido_id' in chat and isinstance(chat['partido_id'], ObjectId):
            chat['partido_id'] = str(chat['partido_id'])
        chat['miembros'] = [str(uid) for uid in chat.get('miembros', [])]
    return chats