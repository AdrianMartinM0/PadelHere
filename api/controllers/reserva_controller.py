from fastapi import HTTPException
from services.reserva_service import get_one_reserva, get_reservas_pendientes_by_club_id

async def get_one_reserva_controller(reserva_id: str):
    reserva = await get_one_reserva(reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva

async def get_reservas_pendientes_by_club_controller(club_id: str):
    reservas = get_reservas_pendientes_by_club_id(club_id)
    if reservas is None:
        raise HTTPException(status_code=404, detail="No se encontraron reservas para el club")
    return reservas