from fastapi import HTTPException
from services.pista_services import get_pista_by_id, update_pista_by_id, delete_pista_by_id, get_pista_config_by_id, update_pista_config_by_id, get_reservas_by_pista, create_reserva_for_pista, get_reserva_detail, update_reserva_by_id, delete_reserva_by_id, get_pista_disponibilidad
from bson import ObjectId

async def get_pista_controller(pista_id: str):
    pista = await get_pista_by_id(pista_id)
    if not pista:
        raise HTTPException(status_code=404, detail="Pista no encontrada")
    return pista

async def update_pista_controller(pista_id: str, pista_data: dict):
    pista = await get_pista_by_id(pista_id)
    if not pista:
        raise HTTPException(status_code=404, detail="Pista no encontrada")
    return await update_pista_by_id(pista_id, pista_data)

async def delete_pista_controller(pista_id: str):
    pista = await get_pista_by_id(pista_id)
    if not pista:
        raise HTTPException(status_code=404, detail="Pista no encontrada")
    return await delete_pista_by_id(pista_id)

async def get_pista_config_controller(pista_id: str):
    config = await get_pista_config_by_id(pista_id)
    if config is None:
        raise HTTPException(status_code=404, detail="Pista no encontrada")
    return config

async def update_pista_config_controller(pista_id: str, config_data: dict):
    config = await get_pista_config_by_id(pista_id)
    if config is None:
        raise HTTPException(status_code=404, detail="Pista no encontrada")
    return await update_pista_config_by_id(pista_id, config_data)

async def get_reservas_by_pista_controller(pista_id: str, filtro: dict = None):
    reservas = await get_reservas_by_pista(pista_id, filtro)
    return reservas

async def create_reserva_for_pista_controller(pista_id: str, reserva_data: dict):
    return await create_reserva_for_pista(pista_id, reserva_data)

async def get_reserva_detail_controller(pista_id: str, reserva_id: str):
    reserva = await get_reserva_detail(pista_id, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return reserva

async def update_reserva_by_id_controller(pista_id: str, reserva_id: str, reserva_data: dict):
    reserva = await get_reserva_detail(pista_id, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return await update_reserva_by_id(pista_id, reserva_id, reserva_data)

async def delete_reserva_by_id_controller(pista_id: str, reserva_id: str):
    reserva = await get_reserva_detail(pista_id, reserva_id)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return await delete_reserva_by_id(pista_id, reserva_id)

async def get_pista_disponibilidad_controller(pista_id: str, fecha: str = None):
    return await get_pista_disponibilidad(pista_id, fecha)