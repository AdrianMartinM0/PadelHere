from fastapi import HTTPException
from ..services.chat_service import  list_chats_for_user, create_chat_for_partido, add_user_to_chat, remove_user_from_chat, delete_chat_for_partido

# ----------- Controller: Listar chats de un usuario -----------
async def list_chats_for_user_controller(user_id: str):
    chats = await list_chats_for_user(user_id)
    if chats is None:
        raise HTTPException(status_code=404, detail="No se encontraron chats para el usuario")
    return chats

# ----------- Controller: Crear chat para partido -----------
async def create_chat_for_partido_controller(partido_id: str, user_ids: list):
    chat_id = await create_chat_for_partido(partido_id, user_ids)
    if not chat_id:
        raise HTTPException(status_code=500, detail="No se pudo crear el chat")
    return {"chat_id": chat_id}

# ----------- Controller: Añadir usuario a chat -----------
async def add_user_to_chat_controller(partido_id: str, user_id: str):
    await add_user_to_chat(partido_id, user_id)
    return {"message": "Usuario añadido al chat correctamente."}

# ----------- Controller: Quitar usuario de chat -----------
async def remove_user_from_chat_controller(partido_id: str, user_id: str):
    await remove_user_from_chat(partido_id, user_id)
    return {"message": "Usuario eliminado del chat correctamente."}

# ----------- Controller: Eliminar chat de partido -----------
async def delete_chat_for_partido_controller(partido_id: str):
    await delete_chat_for_partido(partido_id)
    return {"message": "Chat eliminado correctamente."}