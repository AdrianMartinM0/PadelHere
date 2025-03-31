from fastapi import APIRouter
from ..controllers import usuario_controller
from ..database.models.usuario import User

usu_router = APIRouter()

@usu_router.get("/")
async def get_usu():
    return { "mensaje": "esta es la ruta de los usuarios" }

@usu_router.post('/')
async def create_user(user: User):
    return await usuario_controller.create_user_controller(user)