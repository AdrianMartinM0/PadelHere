from fastapi import APIRouter
from typing import List, Optional
from controllers import history_level_controller

history_level_router = APIRouter()

# Obtener el histórico completo de niveles de un usuario
@history_level_router.get("/user/{user_id}", response_model=List[int])
async def get_level_history(user_id: str):
    """
    Devuelve el histórico completo de niveles de un usuario.
    """
    return await history_level_controller.get_level_history_controller(user_id)

# Obtener el último nivel registrado de un usuario
@history_level_router.get("/user/{user_id}/last", response_model=Optional[int])
async def get_last_level(user_id: str):
    """
    Devuelve el último nivel registrado de un usuario.
    """
    return await history_level_controller.get_last_level_controller(user_id)