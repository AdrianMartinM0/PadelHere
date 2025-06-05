from fastapi import APIRouter
from ..controllers import reserva_controller

reserva_router = APIRouter()

@reserva_router.get("/{reserva_id}")
async def get_reserva(reserva_id: str):
    return await reserva_controller.get_one_reserva_controller(reserva_id)

@reserva_router.get("/pendientes/{club_id}")
async def get_reservas_pendientes(club_id: str):
    return await reserva_controller.get_reservas_pendientes_by_club_controller(club_id)