from fastapi import APIRouter, Query, Body, Request, HTTPException
from ..controllers import partido_controller

partido_router = APIRouter()


@partido_router.get("/{partido_id}")
async def get_partido(partido_id: str):
    return await partido_controller.get_partido_controller(partido_id)


@partido_router.post("/")
async def create_partido(partido_data: dict = Body(...), user_id: str = Query(...)):
    # user_id puede venir de un token o del frontend, aquí como ejemplo por query
    return await partido_controller.create_partido_controller(partido_data, user_id)


@partido_router.get("/")
async def list_partidos(fecha: str = Query(None), club_id: str = Query(None)):
    filtros = {}
    if fecha:
        filtros["date"] = fecha
    if club_id:
        filtros["club_id"] = club_id
    return await partido_controller.list_partidos_controller(filtros if filtros else None)


@partido_router.post("/{partido_id}/join/{slot_name}")
async def join_partido_slot(partido_id: str, slot_name: str, user_id: str = Query(...), user_name: str = Query(None)):
    return await partido_controller.join_partido_slot_controller(partido_id, slot_name, user_id, user_name)


@partido_router.put("/{partido_id}/resultado")
async def update_partido_resultado(partido_id: str, resultado: dict = Body(...)):
    return await partido_controller.update_partido_resultado_controller(partido_id, resultado)


@partido_router.delete("/{partido_id}")
async def delete_partido(partido_id: str):
    return await partido_controller.delete_partido_controller(partido_id)


@partido_router.post("/{partido_id}/leave/{slot_name}")
async def leave_slot_controller(request: Request, partido_id: str, slot_name: str):
    user_id = request.query_params.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id es requerido")
    return await partido_controller.leave_partido_slot(partido_id, slot_name, user_id)


@partido_router.get("/usuario/{user_id}/mis-partidos")
async def list_partidos_usuario(user_id: str):
    return await partido_controller.list_partidos_usuario_controller(user_id)


# ------------------- NUEVAS RUTAS PARA RESULTADO CON DOBLE VALIDACION -------------------

@partido_router.post("/{partido_id}/proponer-resultado")
async def proponer_resultado(partido_id: str, resultado: str = Body(...), propuesto_por: str = Query(...)):
    """
    Proponer un resultado para el partido. Debe ser llamado cuando el partido está completo.
    """
    return await partido_controller.proponer_resultado_controller(partido_id, resultado, propuesto_por)


@partido_router.post("/{partido_id}/confirmar-resultado")
async def confirmar_resultado(partido_id: str, user_id: str = Query(...)):
    """
    Confirmar el resultado propuesto. Solo puede hacerlo un usuario de la pareja contraria.
    """
    return await partido_controller.confirmar_resultado_controller(partido_id, user_id)


@partido_router.post("/{partido_id}/rechazar-resultado")
async def rechazar_resultado(partido_id: str, user_id: str = Query(...)):
    """
    Rechazar el resultado propuesto. Solo puede hacerlo un usuario de la pareja contraria.
    """
    return await partido_controller.rechazar_resultado_controller(partido_id, user_id)