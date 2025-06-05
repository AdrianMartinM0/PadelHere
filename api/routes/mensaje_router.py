from fastapi import APIRouter, Query, Body
from ..controllers import mensaje_controller

mensaje_router = APIRouter()

@mensaje_router.post("/chat/{chat_id}/mensaje")
async def enviar_mensaje(chat_id: str, autor_id: str = Body(...), texto: str = Body(...)):
    return await mensaje_controller.enviar_mensaje_controller(chat_id, autor_id, texto)

@mensaje_router.get("/chat/{chat_id}/mensajes")
async def listar_mensajes(chat_id: str, limit: int = Query(50, ge=1), skip: int = Query(0, ge=0)):
    return await mensaje_controller.listar_mensajes_controller(chat_id, limit, skip)

@mensaje_router.delete("/mensaje/{mensaje_id}")
async def eliminar_mensaje(mensaje_id: str):
    return await mensaje_controller.eliminar_mensaje_controller(mensaje_id)

@mensaje_router.put("/mensaje/{mensaje_id}")
async def editar_mensaje(mensaje_id: str, nuevo_texto: str = Body(...)):
    return await mensaje_controller.editar_mensaje_controller(mensaje_id, nuevo_texto)