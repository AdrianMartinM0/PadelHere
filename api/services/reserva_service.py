from database.db import reserva_collection, pista_collection, club_collection
from fastapi import HTTPException
from bson import ObjectId
from datetime import date

async def get_one_reserva(reserva_id: str):
    try:
        reserva_oid = ObjectId(reserva_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de reserva no válido.")

    reserva = reserva_collection.find_one({"_id": reserva_oid})
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")

    # Pista
    pista_nombre = None
    club_info = None
    pista_id = reserva.get("pista_id")
    if pista_id:
        if isinstance(pista_id, ObjectId):
            pista_obj = pista_collection.find_one({"_id": pista_id})
        else:
            try:
                pista_obj = pista_collection.find_one({"_id": ObjectId(pista_id)})
            except Exception:
                pista_obj = None
        pista_nombre = pista_obj.get("name") if pista_obj else None

        # Club
        if pista_obj and "club_id" in pista_obj:
            club_id = pista_obj["club_id"]
            if isinstance(club_id, ObjectId):
                club_obj = club_collection.find_one({"_id": club_id})
            else:
                try:
                    club_obj = club_collection.find_one({"_id": ObjectId(club_id)})
                except Exception:
                    club_obj = None
            if club_obj:
                club_info = {
                    "name": club_obj.get("name"),
                    "direccion": club_obj.get("direccion"),
                    "tel": club_obj.get("tel"),
                }

    # Construir respuesta limpia
    data = {
        "_id": str(reserva["_id"]),
        "day": reserva.get("day"),
        "from": reserva.get("from"),
        "to": reserva.get("to"),
        "pista": pista_nombre,
        "club": club_info
    }
    return data

def get_reservas_pendientes_by_club_id(club_id: str):
    try:
        club_oid = ObjectId(club_id)
    except Exception:
        # Si club_id no es un ObjectId, intenta como string
        club_oid = None

    # Buscar todas las pistas del club
    pistas = list(pista_collection.find({
        "$or": [
            {"club_id": club_id},
            {"club_id": club_oid} if club_oid else {}
        ]
    }))

    pista_ids = [p["_id"] for p in pistas]
    if not pista_ids:
        return []

    # Buscar todas las reservas de esas pistas, solo futuras o de hoy (pendientes)
    hoy = date.today().isoformat()
    reservas = list(reserva_collection.find({
        "pista_id": {"$in": pista_ids},
        "day": {"$gte": hoy}
    }))

    # Limpieza de respuesta básica (puedes añadir más info si quieres)
    resp = []
    pista_map = {str(p["_id"]): p for p in pistas}
    for r in reservas:
        pista_obj = pista_map.get(str(r.get("pista_id"))) or pista_map.get(str(r.get("pista_id", {}).get("$oid")))
        pista_nombre = pista_obj.get("name") if pista_obj else None
        resp.append({
            "_id": str(r["_id"]),
            "day": r.get("day"),
            "from": r.get("from"),
            "to": r.get("to"),
            "name": r.get("name"),
            "phone": r.get("phone"),
            "pista": pista_nombre
        })
    return resp