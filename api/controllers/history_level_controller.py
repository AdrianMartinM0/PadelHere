from fastapi import HTTPException
from bson import ObjectId
from api.services.history_level_service import get_level_history, get_last_level

# ----------- Controller: Obtener historial de niveles de un usuario -----------
async def get_level_history_controller(user_id: str):
    niveles = get_level_history(user_id)
    # No error si no hay historial, solo se devuelve []
    return niveles

# ----------- Controller: Obtener último nivel de un usuario -----------
async def get_last_level_controller(user_id: str):
    nivel = get_last_level(user_id)
    # Puede devolver None si no hay historial aún
    return nivel