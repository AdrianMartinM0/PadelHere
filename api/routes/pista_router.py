from fastapi import APIRouter, Query, Body
from controllers import pista_controller

pista_router = APIRouter()

@pista_router.get("/{pista_id}")
async def get_pista(pista_id: str):
    return await pista_controller.get_pista_controller(pista_id)

@pista_router.put("/{pista_id}")
async def update_pista(pista_id: str, pista_data: dict = Body(...)):
    return await pista_controller.update_pista_controller(pista_id, pista_data)

@pista_router.delete("/{pista_id}")
async def delete_pista(pista_id: str):
    return await pista_controller.delete_pista_controller(pista_id)

@pista_router.get("/{pista_id}/config")
async def get_pista_config(pista_id: str):
    return await pista_controller.get_pista_config_controller(pista_id)

@pista_router.put("/{pista_id}/config")
async def update_pista_config(pista_id: str, config_data: dict = Body(...)):
    return await pista_controller.update_pista_config_controller(pista_id, config_data)

@pista_router.get("/{pista_id}/reservas")
async def get_reservas_by_pista(pista_id: str, tipo: str = Query(None), fecha: str = Query(None), usuario: str = Query(None)):
    filtro = {}
    if tipo:
        filtro["tipo"] = tipo
    if fecha:
        filtro["fecha"] = fecha
    if usuario:
        filtro["usuario"] = usuario
    return await pista_controller.get_reservas_by_pista_controller(pista_id, filtro if filtro else None)

@pista_router.post("/{pista_id}/reservas")
async def create_reserva_for_pista(pista_id: str, reserva_data: dict = Body(...)):
    return await pista_controller.create_reserva_for_pista_controller(pista_id, reserva_data)

@pista_router.get("/{pista_id}/reservas/{reserva_id}")
async def get_reserva_detail(pista_id: str, reserva_id: str):
    return await pista_controller.get_reserva_detail_controller(pista_id, reserva_id)

@pista_router.put("/{pista_id}/reservas/{reserva_id}")
async def update_reserva_by_id(pista_id: str, reserva_id: str, reserva_data: dict = Body(...)):
    return await pista_controller.update_reserva_by_id_controller(pista_id, reserva_id, reserva_data)

@pista_router.delete("/{pista_id}/reservas/{reserva_id}")
async def delete_reserva_by_id(pista_id: str, reserva_id: str):
    return await pista_controller.delete_reserva_by_id_controller(pista_id, reserva_id)

@pista_router.get("/{pista_id}/disponibilidad")
async def get_pista_disponibilidad(pista_id: str, fecha: str = Query(None)):
    return await pista_controller.get_pista_disponibilidad_controller(pista_id, fecha)