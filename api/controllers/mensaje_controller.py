from fastapi import HTTPException
from services.mensaje_service import  enviar_mensaje, listar_mensajes, eliminar_mensaje, editar_mensaje


# ----------- Controller: Enviar mensaje -----------
async def enviar_mensaje_controller(chat_id: str, autor_id: str, texto: str):
    if not texto or not texto.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío.")
    mensaje = await enviar_mensaje(chat_id, autor_id, texto)
    if not mensaje:
        raise HTTPException(status_code=500, detail="No se pudo enviar el mensaje.")
    return mensaje

# ----------- Controller: Listar mensajes de un chat -----------
async def listar_mensajes_controller(chat_id: str, limit: int = 50, skip: int = 0):
    mensajes = await listar_mensajes(chat_id, limit, skip)
    if mensajes is None:
        raise HTTPException(status_code=404, detail="No se encontraron mensajes para este chat.")
    return mensajes

# ----------- Controller: Eliminar mensaje -----------
async def eliminar_mensaje_controller(mensaje_id: str):
    return await eliminar_mensaje(mensaje_id)

# ----------- Controller: Editar mensaje -----------
async def editar_mensaje_controller(mensaje_id: str, nuevo_texto: str):
    if not nuevo_texto or not nuevo_texto.strip():
        raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío.")
    return await editar_mensaje(mensaje_id, nuevo_texto)