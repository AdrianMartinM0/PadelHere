from ..database.db import user_collection
from ..database.models.usuario import User
from pydantic import BaseModel
from fastapi import HTTPException 
from datetime import timedelta, timezone
from ..utils.token_utils import create_access_token
import random
from datetime import datetime
# from google.oauth2 import id_token
# from google.auth.transport import requests

class GoogleToken(BaseModel):
    token: str


async def create_user(data):
    users_collection = user_collection
    data = data.dict()
    user = User(**data)

    # Encriptar los datos sensibles antes de insertarlos en la base de datos
    user.hash_password()

    user = user.model_dump()
    
    result = users_collection.insert_one(user)
    created_user = users_collection.find_one({"_id": result.inserted_id})

    # Convertir ObjectId a string antes de retornarlo
    if created_user:
        created_user["_id"] = str(created_user["_id"])
    
    return created_user

async def get_one_user(email):
    users_collection = user_collection
    user = users_collection.find_one({"email": email})
    return user

async def login_user_service(email: str, password: str):
    # Buscar el usuario en la base de datos por email
    user_data = user_collection.find_one({"email": email})
    
    if not user_data:
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos.")

    # Convertir el documento de MongoDB en un objeto User
    user = User(
        id=str(user_data["_id"]),
        name=user_data["name"],
        email=user_data["email"],
        password=user_data["password"],
    )

    # Validar la contraseña usando el método verify_password del modelo User
    if not user.verify_password(password):
        raise HTTPException(status_code=400, detail="Email o contraseña incorrectos.")

    # Crear un token de acceso JWT
    access_token_expires = timedelta(hours=1)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


async def recover_pass_service(email: str):
    user = await get_one_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    
    # Verificar si ya existe un recovery_code y si aún es válido
    expiration_time_str = user.get("recovery_expiration")
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
    
    name = user.get("name")
    result = user_collection.update_one(
        {"email": email},
        {
            "$set": {
                "recovery_code": str(num),
                "recovery_expiration": expiration_time
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    
    return {
        'passcode': num,
        'name': name
    }  # Devuelves el número para mandarlo al usuario por email

async def get_passcode_recover(email: str):
    user = await get_one_user(email)
    if not user:
        raise Exception("Usuario no encontrado.")
    passcode = user.get("recovery_code")
    timeout = user.get('recovery_expiration')
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
    user = await get_one_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    # Verificar el código de recuperación
    stored_passcode = user.get("recovery_code")
    if not stored_passcode or stored_passcode != passcode:
        raise HTTPException(status_code=400, detail="Código de recuperación inválido.")
    # Verificar si el código de recuperación ha expirado
    expiration_time_str = user.get("recovery_expiration")
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
    hashed_password = User.hash_password_static(new_password)  # Usar un método estático para encriptar
    result = user_collection.update_one(
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

# async def get_google_user(token: str):
#     try:
#         # Verificar el token de Google
#         id_info = id_token.verify_oauth2_token(token, requests.Request(), audience=None)
        
#         # Extraer información del usuario
#         email = id_info.get("email")
#         name = id_info.get("name")
#         google_id = id_info.get("sub")

#         # Buscar el usuario en la base de datos
#         users_collection = user_collection
#         user_data = users_collection.find_one({"google_id": google_id})
        
#         if not user_data:
#             # Si el usuario no existe, crearlo
#             new_user = User(name=name, email=email, google_id=google_id)
#             users_collection.insert_one(new_user.model_dump())
#             return {"name": name, "email": email, "google_id": google_id}
        
#         # Convertir el documento de MongoDB en un objeto User
#         user = User(
#             id=str(user_data["_id"]),
#             name=user_data["name"],
#             email=user_data["email"],
#             google_id=user_data["google_id"],
#             password=user_data.get("password", None),
#         )
#         return user
#     except ValueError:
#         return None