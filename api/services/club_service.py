from ..database.db import club_collection, pista_collection, reserva_collection
from ..database.models.club import Club
from fastapi import HTTPException
from datetime import timedelta
from ..utils.token_utils import create_access_token
import random
from datetime import datetime
import base64
from bson import ObjectId
from ..websockets.reservas_ws import notify_new_reserva


async def create_club(data):
    data = data.dict()
    club = Club(**data)

    # Si tienes campos sensibles, encripta aquí
    club.hash_password()

    club = club.model_dump()
    result = club_collection.insert_one(club)
    created_club = club_collection.find_one({"_id": result.inserted_id})

    return created_club

async def get_one_club(email):
    clubs_collection = club_collection
    club = clubs_collection.find_one({"email": email})
    if club and "_id" in club:
        club["_id"] = str(club["_id"])
        club.pop("password")
    return club

async def get_one_club_by_tel(tel):
    clubs_collection = club_collection
    club = clubs_collection.find_one({"tel": tel})
    return club

async def login_club_service(email: str, password: str):
    # Buscar el club en la base de datos por email
    club_data = club_collection.find_one({"email": email})

    if not club_data:
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos.")

    # Convertir el documento de MongoDB en un objeto Club
    club = Club(**club_data)

    # Validar la contraseña usando el método verify_password del modelo Club
    if not club.verify_password(password):
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos.")

    # Crear un token de acceso JWT
    access_token = create_access_token(
        email=club.email, user_type="club"
    )

    return {"access_token": access_token, "token_type": "bearer"}

async def recover_pass_service(email: str):
    club = await get_one_club(email)
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado.")

    # Verificar si ya existe un recovery_code y si aún es válido
    expiration_time_str = club.get("recovery_expiration")
    if expiration_time_str:
        if isinstance(expiration_time_str, datetime):
            expiration_time = expiration_time_str
        else:
            expiration_time = datetime.strptime(expiration_time_str, "%Y-%m-%dT%H:%M:%S.%f%z")
        current_time = datetime.now(expiration_time.tzinfo)
        if current_time <= expiration_time:
            raise HTTPException(
                status_code=400,
                detail="Ya existe un código de recuperación válido."
            )
    else:
        # Si no hay un valor previo, asignar una zona horaria predeterminada (por ejemplo UTC)
        current_time = datetime.now()

    # Generar un nuevo código de recuperación
    num = random.randint(100000, 999999)  # Código de recuperación
    expiration_time = datetime.now(current_time.tzinfo) + timedelta(minutes=30)  # 30 minutos de validez

    name = club.get("name")
    result = club_collection.update_one(
        {"email": email},
        {
            "$set": {
                "recovery_code": str(num),
                "recovery_expiration": expiration_time
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Club no encontrado.")

    return {
        'passcode': num,
        'name': name
    }  # Devuelves el número para mandarlo al club por email

async def get_passcode_recover(email: str):
    club = await get_one_club(email)
    if not club:
        raise Exception("Club no encontrado.")
    passcode = club.get("recovery_code")
    timeout = club.get('recovery_expiration')
    if not timeout:
        raise Exception("No se encontró un tiempo de expiración.")

    # Convertir el timeout a un objeto datetime
    if isinstance(timeout, str):
        timeout_datetime = datetime.strptime(timeout, "%Y-%m-%dT%H:%M:%S.%f%z")
    elif isinstance(timeout, datetime):
        timeout_datetime = timeout
    else:
        raise ValueError("El formato de 'timeout' no es válido.")

    # Obtener el tiempo actual en UTC
    current_time = datetime.now(timeout_datetime.tzinfo)

    # Comprobar si la diferencia entre el tiempo actual y el timeout es mayor a 30 minutos
    if current_time > timeout_datetime:
        raise Exception("El código de recuperación ha expirado.")

    return {"passcode": passcode}

async def change_password_service(email: str, passcode: str, new_password: str):
    club = await get_one_club(email)
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado.")
    # Verificar el código de recuperación
    stored_passcode = club.get("recovery_code")
    if not stored_passcode or stored_passcode != passcode:
        raise HTTPException(status_code=400, detail="Código de recuperación inválido.")
    # Verificar si el código de recuperación ha expirado
    expiration_time_str = club.get("recovery_expiration")
    if not expiration_time_str:
        raise HTTPException(status_code=400, detail="El código de recuperación no tiene tiempo de expiración.")

    if isinstance(expiration_time_str, str):
        expiration_time = datetime.strptime(expiration_time_str, "%Y-%m-%dT%H:%M:%S.%f%z")
    elif isinstance(expiration_time_str, datetime):
        expiration_time = expiration_time_str
    else:
        raise ValueError("El formato de 'recovery_expiration' no es válido.")

    current_time = datetime.now(expiration_time.tzinfo)
    if current_time > expiration_time:
        raise HTTPException(status_code=400, detail="El código de recuperación ha expirado.")

    # Actualizar la contraseña
    hashed_password = Club.hash_password_static(new_password)  # Usar un método estático para encriptar
    result = club_collection.update_one(
        {"email": email},
        {
            "$set": {
                "password": hashed_password
            },
            "$unset": {
                "recovery_code": "",
                "recovery_expiration": ""
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=500, detail="Error al actualizar la contraseña.")

    return {"message": "Contraseña actualizada correctamente."}


async def update_desc_service(email: str, desc: str):
    club = await get_one_club(email)
    if not club:
        raise HTTPException(
            status_code=404, detail="Usuario no encontrado.")
    result = club_collection.update_one(
        {"email": email},
        {"$set": {"desc": desc}}
    )
    if result.matched_count == 0:
        raise HTTPException(
            status_code=500, detail="Error al actualizar la descripción.")
    return {"message": "Descripción actualizada correctamente."}


async def update_profile_picture_service(email: str, profile_picture_blob: bytes):
    club = await get_one_club(email)
    if not club:
        raise HTTPException(
            status_code=404, detail="Usuario no encontrado.")
    # Convertir el blob a base64 para almacenarlo como string en MongoDB
    profile_picture_base64 = base64.b64encode(
        profile_picture_blob).decode('utf-8')
    result = club_collection.update_one(
        {"email": email},
        {"$set": {"img_perfil": profile_picture_base64}}
    )
    if result.matched_count == 0:
        raise HTTPException(
            status_code=500, detail="Error al actualizar la foto de perfil.")
    return {"message": "Foto de perfil actualizada correctamente.", "profile_picture": profile_picture_base64}

async def get_club_config_by_id(club_id):
    """Obtener la configuración general del club."""
    try:
        club_oid = ObjectId(club_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de club no válido.")
    club = club_collection.find_one({"_id": club_oid})
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado.")
    config = club.get("config", {})
    return config

async def update_club_config_by_id(club_id, config_data: dict):
    """Actualizar la configuración general del club."""
    try:
        club_oid = ObjectId(club_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de club no válido.")
    result = club_collection.update_one(
        {"_id": club_oid},
        {"$set": {"config": config_data}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Club no encontrado o sin cambios.")
    
    await notify_new_reserva(club_id)
    return {"message": "Configuración actualizada correctamente."}

async def get_club_courts(club_id):
    """Listar todas las pistas de un club y popular reservas."""
    pistas = list(pista_collection.find({"club_id": club_id}))
    for pista in pistas:
        pista["id"] = str(pista["_id"])
        pista.pop("_id", None)  # Elimina _id para no duplicar

        # --- POPULAR reservas ---
        reservas_ids = pista.get("config", {}).get("reservas", [])
        # Solo si hay reservas
        if reservas_ids:
            # Asegurarse de extraer el id string si reservas_ids contiene dicts
            ids = [
                rid["_id"] if isinstance(rid, dict) and "_id" in rid else rid
                for rid in reservas_ids
            ]
            reservas_objs = list(reserva_collection.find({
                "_id": {"$in": [ObjectId(rid) for rid in ids]}
            }))
            # Convierte los ObjectId a string
            for reserva in reservas_objs:
                reserva["_id"] = str(reserva["_id"])
                if "pista_id" in reserva and isinstance(reserva["pista_id"], ObjectId):
                    reserva["pista_id"] = str(reserva["pista_id"])
                if "user_id" in reserva and isinstance(reserva["user_id"], ObjectId):
                    reserva["user_id"] = str(reserva["user_id"])
            pista["config"]["reservas"] = reservas_objs
        else:
            pista["config"]["reservas"] = []
    return {
        "courts": pistas
    }
async def add_court_to_club(club_id, court_data: dict):
    """Agregar una nueva pista al club (colección separada)."""
    try:
        club_oid = ObjectId(club_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de club no válido.")
    pista = court_data.copy()
    pista["club_id"] = str(club_oid)
    result = pista_collection.insert_one(pista)
    return {
        "message": "Pista añadida correctamente.",
        "pista_id": str(result.inserted_id)
    }

async def update_club_courts(club_id: str, data: dict):
    """
    Actualiza el array courts del club (si quieres mantenerlo en club, pero no configs).
    data = { courts: [...] }
    """
    result = club_collection.update_one(
        {"_id": ObjectId(club_id)},
        {"$set": {
            "courts": data.get("courts", [])
        }}
    )
    
    await notify_new_reserva(club_id)
    
    return result.modified_count > 0

async def get_overrides(club_id: str):
    club = club_collection.find_one({"_id": ObjectId(club_id)})
    return club.get("overrides", {}) if club else {}

async def set_override_for_date(club_id: str, date: str, override: dict):
    result = club_collection.update_one(
        {"_id": ObjectId(club_id)},
        {"$set": {f"overrides.{date}": override}}
    )
    
    await notify_new_reserva(club_id)
    return result.matched_count > 0

async def delete_override(club_id: str, date: str):
    result = club_collection.update_one(
        {"_id": ObjectId(club_id)},
        {"$unset": {f"overrides.{date}": ""}}
    )
    
    await notify_new_reserva(club_id)
    return result.matched_count > 0

async def get_all_clubs():
    clubs = list(club_collection.find())
    for club in clubs:
        club["_id"] = str(club["_id"])
        club.pop("password", None)  # Elimina la contraseña del resultado
    return clubs

async def get_one_club_by_id(club_id: str):
    try:
        club_oid = ObjectId(club_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de club no válido.")
    club = club_collection.find_one({"_id": club_oid})
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado.")
    club["_id"] = str(club["_id"])
    club.pop("password", None)
    return club