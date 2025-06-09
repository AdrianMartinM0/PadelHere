from fastapi import APIRouter
from controllers import chat_controller

chat_router = APIRouter()

# Listar chats de un usuario
@chat_router.get("/user/{user_id}")
async def get_chats_for_user(user_id: str):
    return await chat_controller.list_chats_for_user_controller(user_id)

# Crear chat para partido (opcional: normalmente esto lo hace el backend al crear partido)
@chat_router.post("/partido/{partido_id}")
async def create_chat_for_partido(partido_id: str, user_ids: list):
    return await chat_controller.create_chat_for_partido_controller(partido_id, user_ids)

# Añadir usuario a chat de partido
@chat_router.post("/partido/{partido_id}/add_user/{user_id}")
async def add_user_to_chat(partido_id: str, user_id: str):
    return await chat_controller.add_user_to_chat_controller(partido_id, user_id)

# Quitar usuario de chat de partido
@chat_router.post("/partido/{partido_id}/remove_user/{user_id}")
async def remove_user_from_chat(partido_id: str, user_id: str):
    return await chat_controller.remove_user_from_chat_controller(partido_id, user_id)

# Eliminar chat de partido
@chat_router.delete("/partido/{partido_id}")
async def delete_chat_for_partido(partido_id: str):
    return await chat_controller.delete_chat_for_partido_controller(partido_id)

# Setear el último mensaje leído
@chat_router.post("/{chat_id}/last-read")
async def set_last_read_message(chat_id: str, user_id: str, last_message_id: str):
    return await chat_controller.set_last_read_message_controller(chat_id, user_id, last_message_id)

# Obtener cantidad de mensajes sin leer (si partido no es antiguo)
@chat_router.get("/{chat_id}/unread-count/{user_id}")
async def get_unread_count_if_partido_not_past(chat_id: str, user_id: str):
    return await chat_controller.get_unread_count_if_partido_not_past_controller(chat_id, user_id)