from fastapi import HTTPException, Request, APIRouter
from ..services.usuario_service import create_user, get_one_user, login_user_service
from ..database.models.usuario import User
import re
from pydantic import EmailStr

async def create_user_controller(usuario: User):
    # Verifica si el usuario ya existe
    existing_user = await get_one_user(usuario.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    # Verifica si el teléfono ya está registrado
    existing_user_by_phone = await get_one_user(usuario.tel)
    if existing_user_by_phone:
        raise HTTPException(status_code=400, detail="El número de teléfono ya está registrado")
    
    # Crea el usuario
    created_user = await create_user(usuario)
    return created_user

async def login_controller(login_request):
    user = await login_user_service(login_request.email, login_request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": f"Welcome {user.name}!"}