from fastapi import HTTPException
from services.partido_service import get_partido_by_id, create_partido, list_partidos, join_partido_slot, update_partido_resultado, delete_partido_by_id, leave_partido_slot, list_partidos_usuario, proponer_resultado, confirmar_resultado, rechazar_resultado

# ----------- CONTROLLER: Obtener partido por ID -----------
async def get_partido_controller(partido_id: str):
    partido = await get_partido_by_id(partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    return partido

# ----------- CONTROLLER: Crear partido -----------
async def create_partido_controller(partido_data: dict, user_id: str):
    return await create_partido(partido_data, user_id)

# ----------- CONTROLLER: Listar partidos -----------
async def list_partidos_controller(filtros: dict = None):
    return await list_partidos(filtros)

# ----------- CONTROLLER: Unirse a slot de partido -----------
async def join_partido_slot_controller(partido_id: str, slot_name: str, user_id: str, user_name: str = None):
    return await join_partido_slot(partido_id, slot_name, user_id, user_name)

# ----------- CONTROLLER: Actualizar resultado (obsoleta, preferir proponer/confirmar/rechazar) -----------
async def update_partido_resultado_controller(partido_id: str, resultado: dict):
    return await update_partido_resultado(partido_id, resultado)

# ----------- CONTROLLER: Proponer resultado -----------
async def proponer_resultado_controller(partido_id: str, resultado: str, propuesto_por: str):
    return await proponer_resultado(partido_id, resultado, propuesto_por)

# ----------- CONTROLLER: Confirmar resultado -----------
async def confirmar_resultado_controller(partido_id: str, user_id: str):
    return await confirmar_resultado(partido_id, user_id)

# ----------- CONTROLLER: Rechazar resultado -----------
async def rechazar_resultado_controller(partido_id: str, user_id: str):
    return await rechazar_resultado(partido_id, user_id)

# ----------- CONTROLLER: Eliminar partido -----------
async def delete_partido_controller(partido_id: str):
    return await delete_partido_by_id(partido_id)

# ----------- CONTROLLER: Salirse de un slot de partido  -----------
async def leave_partido_controller(partido_id: str, slot_name: str, user_id: str):
    return await leave_partido_slot(partido_id, slot_name, user_id)

# ----------- CONTROLLER: Listar partidos de un usuario -----------
async def list_partidos_usuario_controller(user_id: str):
    return await list_partidos_usuario(user_id)