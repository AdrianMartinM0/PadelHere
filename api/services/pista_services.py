from ..database.db import pista_collection
from fastapi import HTTPException
from bson import ObjectId

# ----------- SERVICIOS PARA /pista/:pistaId -----------

async def get_pista_by_id(pista_id):
    """Obtener información de una pista por su _id."""
    pista = pista_collection.find_one({"_id": ObjectId(pista_id)})
    if not pista:
        raise HTTPException(status_code=404, detail="Pista no encontrada.")
    pista['_id'] = str(pista['_id'])
    if 'club_id' in pista and isinstance(pista['club_id'], ObjectId):
        pista['club_id'] = str(pista['club_id'])
    return pista

async def update_pista_by_id(pista_id, pista_data: dict):
    """Actualizar información general de la pista (nombre, descripción, etc)."""
    result = pista_collection.update_one(
        {"_id": ObjectId(pista_id)},
        {"$set": pista_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pista no encontrada o sin cambios.")
    return {"message": "Información de la pista actualizada correctamente."}

async def delete_pista_by_id(pista_id):
    """Eliminar una pista por su _id."""
    result = pista_collection.delete_one({"_id": ObjectId(pista_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pista no encontrada.")
    return {"message": "Pista eliminada correctamente."}

# ----------- SERVICIOS PARA /pista/:pistaId/config -----------

async def get_pista_config_by_id(pista_id):
    """Obtener la configuración específica de una pista."""
    pista = pista_collection.find_one({"_id": ObjectId(pista_id)})
    if not pista:
        raise HTTPException(status_code=404, detail="Pista no encontrada.")
    config = pista.get("config", {})
    return config

async def update_pista_config_by_id(pista_id, config_data: dict):
    """Actualizar la configuración específica de una pista."""
    result = pista_collection.update_one(
        {"_id": ObjectId(pista_id)},
        {"$set": {"config": config_data["config"]}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pista no encontrada o sin cambios.")
    return {"message": "Configuración de la pista actualizada correctamente."}

# ----------- SERVICIOS PARA /pista/:pistaId/reservas -----------

async def get_reservas_by_pista(pista_id, filtro: dict = None):
    """Listar reservas (y entrenamientos) de una pista. Puedes pasar un filtro adicional (por fecha, tipo, etc)."""
    query = {"pista_id": ObjectId(pista_id)}
    if filtro:
        query.update(filtro)
    from ..database.db import reserva_collection
    reservas = list(reserva_collection.find(query))
    # Convertir _id y pista_id a str para cada reserva
    for reserva in reservas:
        reserva['_id'] = str(reserva['_id'])
        if 'pista_id' in reserva and isinstance(reserva['pista_id'], ObjectId):
            reserva['pista_id'] = str(reserva['pista_id'])
    return reservas

async def create_reserva_for_pista(pista_id, reserva_data: dict):
    """Crear una nueva reserva (o entrenamiento) para una pista."""
    from ..database.db import reserva_collection
    reserva_data["pista_id"] = ObjectId(pista_id)
    result = reserva_collection.insert_one(reserva_data)
    created = reserva_collection.find_one({"_id": result.inserted_id})
    # Convertir _id y pista_id a str
    created['_id'] = str(created['_id'])
    if 'pista_id' in created and isinstance(created['pista_id'], ObjectId):
        created['pista_id'] = str(created['pista_id'])
    return created

async def get_reserva_detail(pista_id, reserva_id):
    """Obtener el detalle de una reserva/entrenamiento concreto de una pista."""
    from ..database.db import reserva_collection
    reserva = reserva_collection.find_one({
        "_id": ObjectId(reserva_id),
        "pista_id": ObjectId(pista_id)
    })
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")
    reserva['_id'] = str(reserva['_id'])
    if 'pista_id' in reserva and isinstance(reserva['pista_id'], ObjectId):
        reserva['pista_id'] = str(reserva['pista_id'])
    return reserva

async def update_reserva_by_id(pista_id, reserva_id, reserva_data: dict):
    """Actualizar una reserva/entrenamiento concreto."""
    from ..database.db import reserva_collection
    result = reserva_collection.update_one(
        {"_id": ObjectId(reserva_id), "pista_id": ObjectId(pista_id)},
        {"$set": reserva_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reserva no encontrada o sin cambios.")
    return {"message": "Reserva actualizada correctamente."}

async def delete_reserva_by_id(pista_id, reserva_id):
    """Eliminar una reserva/entrenamiento concreto."""
    from ..database.db import reserva_collection
    result = reserva_collection.delete_one(
        {"_id": ObjectId(reserva_id), "pista_id": ObjectId(pista_id)}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")
    return {"message": "Reserva eliminada correctamente."}

# ----------- SERVICIOS DISPONIBILIDAD (opcional) -----------

async def get_pista_disponibilidad(pista_id, fecha: str = None):
    """
    Consultar huecos libres de la pista para una fecha concreta (opcional).
    Implementa lógica de disponibilidad según tu modelo de reservas/configuración.
    """
    from ..database.db import reserva_collection
    query = {"pista_id": ObjectId(pista_id)}
    if fecha:
        query["fecha"] = fecha
    reservas = list(reserva_collection.find(query))
    # Convertir _id y pista_id a str para cada reserva
    for reserva in reservas:
        reserva['_id'] = str(reserva['_id'])
        if 'pista_id' in reserva and isinstance(reserva['pista_id'], ObjectId):
            reserva['pista_id'] = str(reserva['pista_id'])
    return reservas