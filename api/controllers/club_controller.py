from fastapi import HTTPException, Request, APIRouter, status
from api.services.club_service import create_club, get_one_club, login_club_service, recover_pass_service, get_passcode_recover, change_password_service, get_one_club_by_tel, update_desc_service, update_profile_picture_service, get_club_config_by_id, update_club_config_by_id, get_club_courts, add_court_to_club, update_club_courts, get_overrides, set_override_for_date, delete_override, get_all_clubs, get_one_club_by_id
from api.database.models.club import Club
import re
from pydantic import EmailStr
from fastapi import Depends
from jwt import PyJWTError
import jwt
from api.utils.token_utils import SECRET_KEY, ALGORITHM

async def create_club_controller(club: Club):
    # Verifica si el club ya existe
    existing_club = await get_one_club(club.email)
    if (existing_club):
        raise HTTPException(status_code=400, detail="El club ya existe")
    
    # Verifica si el teléfono ya está registrado
    existing_club_by_phone = await get_one_club_by_tel(club.tel)
    if (existing_club_by_phone):
        print('existing_club_by_phone')
        raise HTTPException(status_code=400, detail="El número de teléfono ya está registrado")
    
    # Crea el club
    created_club = await create_club(club)
    if not created_club:  # Verifica el resultado de create_club
        raise HTTPException(status_code=500, detail="Error: club no creado")
    
    # Inicia sesión automáticamente después de crear el club
    login_request = {"email": club.email, "password": club.password}
    return await login_controller(login_request)

async def get_one_club_controller(email: EmailStr):
    club = await get_one_club(email)
    if not club:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return club


async def login_controller(login_request):
    club = await login_club_service(login_request["email"], login_request["password"])
    if not club:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": club["access_token"]}

async def recover_password_controller(email):
    find_club = await get_one_club(email)
    if not find_club:
        raise HTTPException(status_code=400, detail="El club no existe")
    return await recover_pass_service(email)
    # return {'email': find_club['email']}

async def get_passcode_controller(email):
    find_club = await get_one_club(email)
    if not find_club:
        raise HTTPException(status_code=400, detail="El club no existe")
    return await get_passcode_recover(email)


async def change_password_controller(email: str, passcode: str, new_password: str):
    find_club = await get_one_club(email)
    if not find_club:
        raise HTTPException(status_code=400, detail="El club no existe")
    return await change_password_service(email, passcode, new_password)

async def update_desc_controller(email: str, desc: str):
    club = await get_one_club(email)
    if not club:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    return await update_desc_service(email, desc)

async def update_profile_picture_controller(email: str, profile_picture_blob: bytes):
    find_club = await get_one_club(email)
    if not find_club:
        raise HTTPException(status_code=400, detail="El usuario no existe")
    return await update_profile_picture_service(email, profile_picture_blob)

async def get_club_config_controller(club_id):
    config = await get_club_config_by_id(club_id)
    if config is None:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    return config

async def update_club_config_controller(club_id, config_data: dict):
    config = await get_club_config_by_id(club_id)
    if config is None:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    return await update_club_config_by_id(club_id, config_data)

async def get_club_courts_controller(club_id):
    pistas = await get_club_courts(club_id)
    if pistas is None:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    return pistas

async def add_court_to_club_controller(club_id, court_data: dict):
    return await add_court_to_club(club_id, court_data)

async def update_club_courts_controller(club_id: str, data: dict):
    result = await update_club_courts(club_id, data)
    if not result:
        raise HTTPException(status_code=404, detail="Club no encontrado o no actualizado")
    return {"ok": True, "message": "Pistas actualizadas correctamente"}

async def get_overrides_controller(club_id: str):
    overrides = await get_overrides(club_id)
    if overrides is None:
        raise HTTPException(404, "Club no encontrado")
    return overrides

async def set_override_for_date_controller(club_id: str, date: str, override: dict):
    ok = await set_override_for_date(club_id, date, override)
    if not ok:
        raise HTTPException(404, "Club no encontrado")
    return {"message": f"Override para {date} actualizado correctamente."}

async def delete_override_controller(club_id: str, date: str):
    ok = await delete_override(club_id, date)
    if not ok:
        raise HTTPException(404, "Club no encontrado")
    return {"message": f"Override para {date} eliminado correctamente."}

async def get_all_clubs_controller():
    clubs = await get_all_clubs()
    if not clubs:
        raise HTTPException(status_code=404, detail="No se encontraron clubes")
    return clubs

async def get_one_club_by_id_controller(club_id: str):
    club = await get_one_club_by_id(club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    return club