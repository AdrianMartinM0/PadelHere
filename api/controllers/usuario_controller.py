from fastapi import HTTPException, Request, APIRouter, status
from ..services.usuario_service import create_user, get_one_user, login_user_service, recover_pass_service, get_passcode_recover, change_password_service, verify_jwt_service, get_one_user_by_tel, update_profile_picture_service, update_desc_service, update_level_service, add_reserva_id_to_user, get_user_by_id, get_google_user, delete_user_service
from ..database.models.usuario import User
import re
from pydantic import EmailStr
from fastapi import Depends
from jwt import PyJWTError
import jwt
from ..utils.token_utils import SECRET_KEY, ALGORITHM


async def create_user_controller(usuario: User):
    # Verifica si el usuario ya existe
    existing_user = await get_one_user(usuario.email)
    if (existing_user):
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    # Verifica si el teléfono ya está registrado
    existing_user_by_phone = await get_one_user_by_tel(usuario.tel)
    if (existing_user_by_phone):
        raise HTTPException(
            status_code=400, detail="El número de teléfono ya está registrado")

    # Crea el usuario
    created_user = await create_user(usuario)
    if not created_user:  # Verifica el resultado de create_user
        raise HTTPException(status_code=500, detail="Error: Usuario no creado")

    # Inicia sesión automáticamente después de crear el usuario
    login_request = {"email": usuario.email, "password": usuario.password}
    return await login_controller(login_request)


async def get_one_user_controller(email: EmailStr):
    user = await get_one_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


async def login_controller(login_request):
    user = await login_user_service(login_request["email"], login_request["password"])
    if not user:
        raise HTTPException(
            status_code=401, detail="Invalid email or password")
    return {"token": user["access_token"]}


async def recover_password_controller(email):
    find_user = await get_one_user(email)
    if not find_user:
        raise HTTPException(status_code=400, detail="El usuario no existe")
    return await recover_pass_service(email)
    # return {'email': find_user['email']}


async def get_passcode_controller(email):
    find_user = await get_one_user(email)
    if not find_user:
        raise HTTPException(status_code=400, detail="El usuario no existe")
    return await get_passcode_recover(email)


async def change_password_controller(email: str, passcode: str, new_password: str):
    find_user = await get_one_user(email)
    if not find_user:
        raise HTTPException(status_code=400, detail="El usuario no existe")
    return await change_password_service(email, passcode, new_password)


async def verify_jwt_controller(token: str):
    return await verify_jwt_service(token)

async def update_desc_controller(email: str, desc: str):
    user = await get_one_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return await update_desc_service(email, desc)

async def update_profile_picture_controller(email: str, profile_picture_blob: bytes):
    find_user = await get_one_user(email)
    if not find_user:
        raise HTTPException(status_code=400, detail="El usuario no existe")
    return await update_profile_picture_service(email, profile_picture_blob)

async def update_level_controller(email: str, level: int):
    user = await get_one_user(email)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return await update_level_service(email, level)

async def add_reserva_to_user_controller(user_id: str, reserva_id: str):
    ok = await add_reserva_id_to_user(user_id, reserva_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Usuario no encontrado o reserva ya añadida")
    return {"ok": True, "user_id": user_id, "reserva_id": reserva_id}

async def get_user_by_id_controller(user_id: str):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user

async def google_login_controller(token):
    user_info = await get_google_user(token)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token"
        )
    return {"message": "Google login successful", "user": user_info}

async def delete_user_controller(user_id: str):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return await delete_user_service(user_id)