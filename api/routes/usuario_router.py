from fastapi import APIRouter, Depends
from ..controllers import usuario_controller
from ..database.models.usuario import User
from pydantic import EmailStr
from fastapi.security import OAuth2AuthorizationCodeBearer
# from ..services.usuario_service import get_google_user

usu_router = APIRouter()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/auth",
    tokenUrl="https://oauth2.googleapis.com/token"
)

@usu_router.post("/login")
async def login_user(login_request: dict):
    return await usuario_controller.login_controller(login_request)

@usu_router.post('/register')
async def create_user(user: User):
    return await usuario_controller.create_user_controller(user)

@usu_router.get('/recover')
async def recover_pass(email: EmailStr):
    # return {'email': email}
    return await usuario_controller.recover_password_controller(email)

# # Router
# @usu_router.get("/auth/google")
# async def google_login(token: str = Depends(oauth2_scheme)):
#     return await usuario_controller.google_login_controller(token)

