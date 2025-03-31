from fastapi import HTTPException, Request, APIRouter
from ..services.usuario_service import create_user, get_one_user
from ..database.models.usuario import User
import re

async def create_user_controller(usuario: User):
    required_fields = ["email", "name", "password"]
    
    if not all(getattr(usuario, field, None) for field in required_fields):
        raise HTTPException(status_code=400, detail="Todos los campos son obligatorios")
    
    patt = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    if len(usuario.password) < 8 or not re.match(patt, usuario.password):
        raise HTTPException(status_code=400, detail="La contraseña no cumple con los requisitos mínimos")
    existing_user = await get_one_user(usuario.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    created_user = await create_user(usuario)
    return created_user