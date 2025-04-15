from fastapi import APIRouter
from ..controllers import usuario_controller
from ..database.models.usuario import User
from pydantic import EmailStr, BaseModel

usu_router = APIRouter()

# Esquema para datos de entrada
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@usu_router.post("/login")
async def login_user(login_request: LoginRequest):
    return await usuario_controller.login_controller(login_request)

@usu_router.post('/register')
async def create_user(user: User):
    return await usuario_controller.create_user_controller(user)