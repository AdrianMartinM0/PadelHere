from fastapi import HTTPException, Request, APIRouter, status
from ..services.club_service import create_club, get_one_club, login_club_service, recover_pass_service, get_passcode_recover, change_password_service, get_one_club_by_tel
from ..database.models.club import Club
import re
from pydantic import EmailStr
from fastapi import Depends
from jwt import PyJWTError
import jwt
from ..utils.token_utils import SECRET_KEY, ALGORITHM

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
