from fastapi import HTTPException, Request, APIRouter, status
from ..services.usuario_service import create_user, get_one_user, login_user_service, recover_pass_service, get_passcode_recover, change_password_service
from ..database.models.usuario import User
import re
from pydantic import EmailStr

async def create_user_controller(usuario: User):
    # Verifica si el usuario ya existe
    existing_user = await get_one_user(usuario.email)
    if (existing_user):
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    
    # Verifica si el teléfono ya está registrado
    # existing_user_by_phone = await get_one_user(usuario.tel)
    # if (existing_user_by_phone):
    #     raise HTTPException(status_code=400, detail="El número de teléfono ya está registrado")
    
    # Crea el usuario
    created_user = await create_user(usuario)
    if not created_user:  # Verifica el resultado de create_user
        raise HTTPException(status_code=500, detail="Error: Usuario no creado")
    
    # Inicia sesión automáticamente después de crear el usuario
    login_request = {"email": usuario.email, "password": usuario.password}
    return await login_controller(login_request)

async def login_controller(login_request):
    user = await login_user_service(login_request["email"], login_request["password"])
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
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

# async def google_login_controller(token):
#     user_info = await get_google_user(token)
#     if not user_info:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid or expired Google token"
#         )
#     return {"message": "Google login successful", "user": user_info}