from ..database.db import club_collection
from ..database.models.club import Club  # Asegúrate de tener el modelo Club en models/club.py
from fastapi import HTTPException, status
from datetime import timedelta
from ..utils.token_utils import create_access_token
import random
from datetime import datetime
from jwt import InvalidTokenError
import jwt
from api.config import SECRET_KEY, ALGORITHM

# Asume que club_collection es tu colección de clubes
# y Club es tu modelo de datos para un club


async def create_club(data):
    data = data.dict()
    club = Club(**data)

    # Si tienes campos sensibles, encripta aquí
    club.hash_password()

    club = club.model_dump()
    result = club_collection.insert_one(club)
    created_club = club_collection.find_one({"_id": result.inserted_id})

    # Convertir ObjectId a string antes de retornarlo
    # if created_club:
    #     created_club["_id"] = str(created_club["_id"])
        
    #     # Generar token de acceso JWT
    #     access_token = create_access_token(
    #         data={"sub": created_club["email"]}, user_type="club"
    #     )
    #     return {
    #         "user": created_club,
    #         "access_token": access_token,
    #         "token_type": "bearer"
    #     }
    
    return created_club

async def get_one_club(email):
    clubs_collection = club_collection
    club = clubs_collection.find_one({"email": email})
    if club and "_id" in club:
        club.pop("_id")
        club.pop("password")  # Eliminar la contraseña del resultado
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